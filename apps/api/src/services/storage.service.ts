import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { AppError } from '../middleware/errorHandler.js';
import { HTTP_STATUS } from '@peerlume/shared';

// Safe upload directory configuration
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

// Ensure uploads directory exists on startup
if (!fs.existsSync(UPLOADS_DIR)) {
  try {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  } catch {
    // Handled during write if read-only
  }
}

// Permitted MIME types and file extensions for student learning documents
const PERMITTED_MIME_TYPES: Record<string, string> = {
  'application/pdf': '.pdf',
  'text/plain': '.txt',
  'text/markdown': '.md',
  'application/json': '.json',
  'text/csv': '.csv',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15 Megabytes

export interface UploadedFileMetadata {
  fileKey: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
}

export const storageService = {
  /**
   * Validates and saves an uploaded buffer securely using random cryptographic keys
   */
  async saveFile(
    buffer: Buffer,
    originalName: string,
    mimeType: string
  ): Promise<UploadedFileMetadata> {
    if (buffer.length > MAX_FILE_SIZE_BYTES) {
      throw new AppError(
        `File exceeds maximum permitted size of ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB`,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const normalizedMime = mimeType.toLowerCase();
    const expectedExtension = PERMITTED_MIME_TYPES[normalizedMime];

    if (!expectedExtension) {
      throw new AppError(
        'Unsupported file format. Permitted document formats: PDF, Text, Markdown, CSV, JSON, PNG, JPEG.',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Sanitize display name (strip path navigation chars)
    const sanitizedOriginalName = path.basename(originalName).replace(/[^a-zA-Z0-9._-]/g, '_');

    // Generate random, non-guessable storage key preventing directory traversal
    const randomKey = `${crypto.randomUUID()}${expectedExtension}`;
    const destinationPath = path.join(UPLOADS_DIR, randomKey);

    try {
      await fs.promises.writeFile(destinationPath, buffer);
    } catch (err: any) {
      throw new AppError(`Storage error: Failed to save file (${err.message})`, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    return {
      fileKey: randomKey,
      originalName: sanitizedOriginalName,
      mimeType: normalizedMime,
      sizeBytes: buffer.length,
    };
  },

  /**
   * Retrieves a file stream or buffer securely after access authorization
   */
  async getFileStream(fileKey: string): Promise<{ stream: fs.ReadStream; size: number }> {
    // Defend against path traversal: fileKey must strictly match a UUID with safe extension
    const isSafeKey = /^[0-9a-fA-F-]{36}\.[a-zA-Z0-9]+$/.test(fileKey);
    if (!isSafeKey) {
      throw new AppError('Invalid storage key', HTTP_STATUS.BAD_REQUEST);
    }

    const filePath = path.join(UPLOADS_DIR, fileKey);

    if (!fs.existsSync(filePath)) {
      throw new AppError('Requested file not found in storage', HTTP_STATUS.NOT_FOUND);
    }

    const stat = await fs.promises.stat(filePath);
    const stream = fs.createReadStream(filePath);

    return { stream, size: stat.size };
  },

  /**
   * Deletes a file from storage
   */
  async deleteFile(fileKey: string): Promise<void> {
    const isSafeKey = /^[0-9a-fA-F-]{36}\.[a-zA-Z0-9]+$/.test(fileKey);
    if (!isSafeKey) return;

    const filePath = path.join(UPLOADS_DIR, fileKey);
    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    } catch {
      // Best-effort cleanup
    }
  },
};
