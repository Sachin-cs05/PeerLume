import type { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '@peerlume/shared';
import { sendSuccess } from '../utils/apiResponse.js';
import {
  getUserNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../services/notification.service.js';

export async function handleGetNotifications(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const page = req.query.page ? Number.parseInt(req.query.page as string, 10) : 1;
    const pageSize = req.query.pageSize ? Number.parseInt(req.query.pageSize as string, 10) : 20;
    const unreadOnly = req.query.unreadOnly === 'true';

    const result = await getUserNotifications(userId, page, pageSize, unreadOnly);
    sendSuccess(res, result, HTTP_STATUS.OK);
  } catch (error) {
    next(error);
  }
}

export async function handleGetUnreadCount(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const unreadCount = await getUnreadNotificationCount(userId);
    sendSuccess(res, { unreadCount }, HTTP_STATUS.OK);
  } catch (error) {
    next(error);
  }
}

export async function handleMarkNotificationAsRead(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { notificationId } = req.params;

    const updated = await markNotificationAsRead(userId, notificationId as string);
    sendSuccess(res, updated, HTTP_STATUS.OK, 'Notification marked as read');
  } catch (error) {
    next(error);
  }
}

export async function handleMarkAllNotificationsAsRead(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const result = await markAllNotificationsAsRead(userId);
    sendSuccess(res, result, HTTP_STATUS.OK, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
}
