import type { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '@peerlume/shared';
import { sendSuccess } from '../utils/apiResponse.js';
import { getDashboardSummary } from '../services/dashboard.service.js';

export async function handleGetDashboardSummary(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const summary = await getDashboardSummary(userId);
    sendSuccess(res, summary, HTTP_STATUS.OK);
  } catch (error) {
    next(error);
  }
}
