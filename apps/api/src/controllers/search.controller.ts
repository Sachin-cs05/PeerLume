import type { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/apiResponse.js';
import { HTTP_STATUS } from '@peerlume/shared';
import type { SearchEntityType } from '@peerlume/shared';
import * as searchService from '../services/search.service.js';

export async function handleGlobalSearch(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const { q, type, limit } = req.query;

    const result = await searchService.performGlobalSearch(
      userId,
      (q as string) || '',
      (type as SearchEntityType) || 'all',
      limit ? parseInt(limit as string, 10) : 20
    );

    sendSuccess(res, result, HTTP_STATUS.OK);
  } catch (error) {
    next(error);
  }
}
