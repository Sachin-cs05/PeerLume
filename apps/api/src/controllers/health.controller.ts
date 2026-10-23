import type { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '@peerlume/shared';
import { getSystemHealth } from '../services/health.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export async function getHealth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const health = await getSystemHealth();
    sendSuccess(res, health, HTTP_STATUS.OK, 'System health retrieved successfully');
  } catch (error) {
    next(error);
  }
}
