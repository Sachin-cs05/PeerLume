import type { Request, Response } from 'express';
import { HTTP_STATUS } from '@peerlume/shared';
import { sendError } from '../utils/apiResponse.js';

export function notFoundHandler(req: Request, res: Response): void {
  sendError(
    res,
    HTTP_STATUS.NOT_FOUND,
    'RESOURCE_NOT_FOUND',
    `Cannot ${req.method} ${req.originalUrl} - Endpoint not found`
  );
}
