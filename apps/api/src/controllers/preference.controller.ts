import type { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/apiResponse.js';
import { HTTP_STATUS } from '@peerlume/shared';
import * as preferenceService from '../services/preference.service.js';

export async function handleGetUserPreferences(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const result = await preferenceService.getUserPreferences(userId);
    sendSuccess(res, result, HTTP_STATUS.OK);
  } catch (error) {
    next(error);
  }
}

export async function handleUpdateUserPreferences(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const result = await preferenceService.updateUserPreferences(userId, req.body);
    sendSuccess(res, result, HTTP_STATUS.OK);
  } catch (error) {
    next(error);
  }
}
