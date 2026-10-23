import { prisma } from '../config/prisma.js';
import { logger } from '../utils/logger.js';
import { AppError } from '../middleware/errorHandler.js';
import { HTTP_STATUS } from '@peerlume/shared';
import type {
  WhiteboardElement,
  WhiteboardRevisionDto,
  StudyRoomRole,
} from '@peerlume/shared';

interface ActiveBoardState {
  roomId: string;
  boardId: string;
  elements: WhiteboardElement[];
  version: number;
  lastSavedAt: Date;
  dirty: boolean;
  saveTimer?: NodeJS.Timeout;
}

export class WhiteboardSyncService {
  private activeBoards = new Map<string, ActiveBoardState>(); // key: roomId:boardId or roomId

  public getActiveBoard(roomId: string, boardId?: string): ActiveBoardState | undefined {
    const key = boardId ? `${roomId}:${boardId}` : roomId;
    return this.activeBoards.get(key);
  }

  public async getOrCreateBoard(roomId: string, boardId?: string): Promise<ActiveBoardState> {
    const key = boardId ? `${roomId}:${boardId}` : roomId;
    const existing = this.activeBoards.get(key);
    if (existing) {
      return existing;
    }

    // Load from database
    const where: any = { roomId };
    if (boardId) {
      where.id = boardId;
    }

    let boardDoc = await prisma.whiteboardDocument.findFirst({
      where,
      orderBy: { createdAt: 'asc' },
    });

    if (!boardDoc) {
      // Create default whiteboard document if none exists
      boardDoc = await prisma.whiteboardDocument.create({
        data: {
          roomId,
          title: 'Main Board',
          elements: [],
          version: 1,
        },
      });
    }

    const state: ActiveBoardState = {
      roomId,
      boardId: boardDoc.id,
      elements: (Array.isArray(boardDoc.elements) ? boardDoc.elements : []) as unknown as WhiteboardElement[],
      version: boardDoc.version || 1,
      lastSavedAt: boardDoc.updatedAt || new Date(),
      dirty: false,
    };

    this.activeBoards.set(key, state);
    if (!boardId) {
      this.activeBoards.set(`${roomId}:${boardDoc.id}`, state);
    }

    return state;
  }

  public async applyDrawStep(
    userId: string,
    roomId: string,
    boardId: string,
    step: {
      type: 'element:add' | 'element:update' | 'element:delete' | 'clear';
      element?: WhiteboardElement;
      elementId?: string;
    },
    role: StudyRoomRole
  ): Promise<{ elements: WhiteboardElement[]; version: number }> {
    if (role === 'VIEWER') {
      throw new AppError('Unauthorized: Viewers cannot modify the whiteboard', HTTP_STATUS.FORBIDDEN);
    }

    const board = await this.getOrCreateBoard(roomId, boardId);

    switch (step.type) {
      case 'element:add': {
        if (step.element) {
          // Check if element already exists to avoid duplication
          const idx = board.elements.findIndex((e) => e.id === step.element!.id);
          if (idx >= 0) {
            board.elements[idx] = step.element;
          } else {
            board.elements.push(step.element);
          }
        }
        break;
      }
      case 'element:update': {
        if (step.element) {
          const idx = board.elements.findIndex((e) => e.id === step.element!.id);
          if (idx >= 0) {
            board.elements[idx] = step.element;
          } else {
            board.elements.push(step.element);
          }
        }
        break;
      }
      case 'element:delete': {
        const idToDelete = step.elementId || step.element?.id;
        if (idToDelete) {
          board.elements = board.elements.filter((e) => e.id !== idToDelete);
        }
        break;
      }
      case 'clear': {
        board.elements = [];
        break;
      }
    }

    board.version += 1;
    board.dirty = true;

    // Debounce save to database (2.5 seconds)
    if (board.saveTimer) {
      clearTimeout(board.saveTimer);
    }
    board.saveTimer = setTimeout(() => {
      this.persistBoard(board).catch((err) => {
        logger.error(`Error auto-saving whiteboard for room ${roomId}:`, err);
      });
    }, 2500);

    return { elements: board.elements, version: board.version };
  }

  public async saveBoardNow(
    userId: string,
    roomId: string,
    boardId?: string,
    description?: string
  ): Promise<{ version: number; savedAt: string }> {
    const board = await this.getOrCreateBoard(roomId, boardId);
    if (board.saveTimer) {
      clearTimeout(board.saveTimer);
      board.saveTimer = undefined;
    }

    const updated = await this.persistBoard(board);

    // Also record a WhiteboardRevision snapshot
    await prisma.whiteboardRevision.create({
      data: {
        boardId: board.boardId,
        elements: board.elements as any,
        description: description?.trim() || `Manual checkpoint version ${board.version}`,
        createdById: userId,
      },
    });

    return {
      version: updated.version,
      savedAt: updated.updatedAt.toISOString(),
    };
  }

  public async getBoardRevisions(
    userId: string,
    roomId: string,
    boardId?: string
  ): Promise<WhiteboardRevisionDto[]> {
    const board = await this.getOrCreateBoard(roomId, boardId);

    const revisions = await prisma.whiteboardRevision.findMany({
      where: { boardId: board.boardId },
      orderBy: { createdAt: 'desc' },
      take: 30,
      include: {
        createdBy: { select: { id: true, fullName: true, avatarUrl: true } },
      },
    });

    return revisions.map((r) => ({
      id: r.id,
      boardId: r.boardId,
      elements: (Array.isArray(r.elements) ? r.elements : []) as unknown as WhiteboardElement[],
      description: r.description,
      createdById: r.createdById,
      createdAt: r.createdAt.toISOString(),
      createdBy: r.createdBy
        ? {
            id: r.createdBy.id,
            fullName: r.createdBy.fullName,
            avatarUrl: r.createdBy.avatarUrl || null,
          }
        : undefined,
    }));
  }

  public async restoreRevision(
    userId: string,
    roomId: string,
    boardId: string,
    revisionId: string,
    role: StudyRoomRole
  ): Promise<{ elements: WhiteboardElement[]; version: number }> {
    if (role === 'VIEWER') {
      throw new AppError('Unauthorized: Viewers cannot restore revisions', HTTP_STATUS.FORBIDDEN);
    }

    const revision = await prisma.whiteboardRevision.findUnique({
      where: { id: revisionId },
    });

    if (!revision || revision.boardId !== boardId) {
      throw new AppError('Revision not found', HTTP_STATUS.NOT_FOUND);
    }

    const board = await this.getOrCreateBoard(roomId, boardId);
    board.elements = (Array.isArray(revision.elements) ? revision.elements : []) as unknown as WhiteboardElement[];
    board.version += 1;
    board.dirty = true;

    // Immediately persist and record new revision for the restore
    await this.persistBoard(board);

    await prisma.whiteboardRevision.create({
      data: {
        boardId: board.boardId,
        elements: board.elements as any,
        description: `Restored to revision from ${revision.createdAt.toLocaleTimeString()}`,
        createdById: userId,
      },
    });

    return { elements: board.elements, version: board.version };
  }

  private async persistBoard(board: ActiveBoardState) {
    board.dirty = false;
    const updated = await prisma.whiteboardDocument.update({
      where: { id: board.boardId },
      data: {
        elements: board.elements as any,
        version: board.version,
      },
    });
    board.lastSavedAt = updated.updatedAt;
    return updated;
  }

  public async flushAll(): Promise<void> {
    logger.info('Flushing all active whiteboard documents to PostgreSQL...');
    for (const board of this.activeBoards.values()) {
      if (board.dirty) {
        if (board.saveTimer) {
          clearTimeout(board.saveTimer);
          board.saveTimer = undefined;
        }
        try {
          await this.persistBoard(board);
        } catch (err) {
          logger.error(`Failed to flush whiteboard ${board.boardId}:`, err);
        }
      }
    }
  }

  public clearCache(): void {
    for (const board of this.activeBoards.values()) {
      if (board.saveTimer) {
        clearTimeout(board.saveTimer);
      }
    }
    this.activeBoards.clear();
  }
}

export const whiteboardSyncService = new WhiteboardSyncService();
