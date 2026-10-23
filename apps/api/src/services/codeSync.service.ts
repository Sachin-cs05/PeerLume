import * as Y from 'yjs';
import { prisma } from '../config/prisma.js';
import { logger } from '../utils/logger.js';
import { AppError } from '../middleware/errorHandler.js';
import { HTTP_STATUS } from '@peerlume/shared';
import type { WorkspaceRole } from '@peerlume/shared';

interface ActiveDocEntry {
  doc: Y.Doc;
  workspaceId: string;
  documentId: string;
  dirty: boolean;
  lastActivity: number;
  saveTimer?: NodeJS.Timeout;
}

class CodeSyncService {
  private activeDocs = new Map<string, ActiveDocEntry>();
  private readonly AUTOSAVE_DEBOUNCE_MS = 3000;

  /**
   * Retrieves or initializes an active in-memory Y.Doc for a document.
   */
  async getOrCreateDoc(workspaceId: string, documentId: string): Promise<Y.Doc> {
    const existing = this.activeDocs.get(documentId);
    if (existing) {
      existing.lastActivity = Date.now();
      return existing.doc;
    }

    const docRecord = await prisma.codeDocument.findFirst({
      where: { id: documentId, workspaceId },
    });

    if (!docRecord) {
      throw new AppError('Document not found', HTTP_STATUS.NOT_FOUND);
    }

    const doc = new Y.Doc();

    // If we have saved binary Yjs state, apply it
    if (docRecord.yjsState && docRecord.yjsState.length > 0) {
      try {
        Y.applyUpdate(doc, new Uint8Array(docRecord.yjsState));
      } catch (err) {
        logger.error(`Failed to apply stored Yjs state for document ${documentId}:`, err);
        // Fallback to text content
        const yText = doc.getText('monaco');
        yText.delete(0, yText.length);
        yText.insert(0, docRecord.content || '');
      }
    } else {
      // Initialize with plain text content
      const yText = doc.getText('monaco');
      yText.insert(0, docRecord.content || '');
    }

    const entry: ActiveDocEntry = {
      doc,
      workspaceId,
      documentId,
      dirty: false,
      lastActivity: Date.now(),
    };

    this.activeDocs.set(documentId, entry);
    return doc;
  }

  /**
   * Applies an incremental Yjs update received from a connected client.
   * Enforces role checks: VIEWERS cannot edit!
   */
  async applyUpdate(
    userId: string,
    workspaceId: string,
    documentId: string,
    update: Uint8Array,
    userRole: WorkspaceRole
  ): Promise<Uint8Array> {
    if (userRole === 'VIEWER') {
      throw new AppError('Unauthorized: Viewers cannot make edits to the code', HTTP_STATUS.FORBIDDEN);
    }

    const doc = await this.getOrCreateDoc(workspaceId, documentId);
    Y.applyUpdate(doc, update);

    const entry = this.activeDocs.get(documentId);
    if (entry) {
      entry.dirty = true;
      entry.lastActivity = Date.now();
      this.scheduleAutosave(entry, userId);
    }

    return update;
  }

  /**
   * Schedules a debounced save of the document state to PostgreSQL.
   */
  private scheduleAutosave(entry: ActiveDocEntry, userId?: string): void {
    if (entry.saveTimer) {
      clearTimeout(entry.saveTimer);
    }

    entry.saveTimer = setTimeout(async () => {
      try {
        await this.flushDocToDb(entry, userId);
      } catch (err) {
        logger.error(`Error during autosave for document ${entry.documentId}:`, err);
      }
    }, this.AUTOSAVE_DEBOUNCE_MS);
  }

  /**
   * Immediately persists current document text and Yjs binary state to DB.
   */
  async flushDocToDb(entry: ActiveDocEntry, authorId?: string, description?: string): Promise<void> {
    if (!entry.dirty && !description) return;

    const yText = entry.doc.getText('monaco');
    const content = yText.toString();
    const yjsState = Y.encodeStateAsUpdate(entry.doc);

    try {
      await prisma.codeDocument.update({
        where: { id: entry.documentId },
        data: {
          content,
          yjsState: Buffer.from(yjsState),
          version: { increment: 1 },
        },
      });

      // If explicit description or major save, record revision snapshot
      if (description && authorId) {
        const docRecord = await prisma.codeDocument.findUnique({
          where: { id: entry.documentId },
          select: { language: true },
        });

        await prisma.documentRevision.create({
          data: {
            workspaceId: entry.workspaceId,
            documentId: entry.documentId,
            content,
            language: docRecord?.language || 'typescript',
            description,
            createdById: authorId,
          },
        });
      }

      entry.dirty = false;
      logger.info(`Persisted document ${entry.documentId} to PostgreSQL (size: ${content.length} chars)`);
    } catch (err) {
      logger.error(`Failed to flush document ${entry.documentId} to database:`, err);
      throw err;
    }
  }

  /**
   * Explicit save triggered by student ("Save Code" button).
   */
  async saveDocumentNow(
    userId: string,
    workspaceId: string,
    documentId: string,
    description?: string
  ): Promise<{ version: number; savedAt: string }> {
    const entry = this.activeDocs.get(documentId);
    if (entry) {
      await this.flushDocToDb(entry, userId, description || 'Manual save checkpoint');
      const updated = await prisma.codeDocument.findUnique({
        where: { id: documentId },
        select: { version: true, updatedAt: true },
      });
      return {
        version: updated?.version || 1,
        savedAt: (updated?.updatedAt || new Date()).toISOString(),
      };
    }

    // If not in memory, ensure DB record exists
    const docRecord = await prisma.codeDocument.findFirst({
      where: { id: documentId, workspaceId },
    });

    if (!docRecord) {
      throw new AppError('Document not found', HTTP_STATUS.NOT_FOUND);
    }

    const updated = await prisma.codeDocument.update({
      where: { id: documentId },
      data: {
        version: { increment: 1 },
      },
    });

    if (description) {
      await prisma.documentRevision.create({
        data: {
          workspaceId,
          documentId,
          content: docRecord.content,
          language: docRecord.language,
          description,
          createdById: userId,
        },
      });
    }

    return {
      version: updated.version,
      savedAt: updated.updatedAt.toISOString(),
    };
  }

  /**
   * Sets text directly (used when restoring a revision).
   */
  setDocumentText(documentId: string, newText: string): void {
    const entry = this.activeDocs.get(documentId);
    if (entry) {
      const yText = entry.doc.getText('monaco');
      entry.doc.transact(() => {
        yText.delete(0, yText.length);
        yText.insert(0, newText);
      });
      entry.dirty = true;
    }
  }

  /**
   * Flushes all dirty documents before shutdown.
   */
  async flushAll(): Promise<void> {
    logger.info(`Flushing ${this.activeDocs.size} active collaborative documents to database...`);
    const promises = Array.from(this.activeDocs.values()).map((entry) => {
      if (entry.saveTimer) clearTimeout(entry.saveTimer);
      return this.flushDocToDb(entry);
    });
    await Promise.allSettled(promises);
    logger.info('All collaborative documents flushed.');
  }
}

export const codeSyncService = new CodeSyncService();
