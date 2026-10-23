import type { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '@peerlume/shared';
import { sendSuccess } from '../utils/apiResponse.js';
import {
  getUserConversations,
  getOrCreateDirectConversation,
  getConversationMessages,
  sendMessage,
  markConversationAsRead,
} from '../services/chat.service.js';

export async function handleGetUserConversations(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const conversations = await getUserConversations(userId);
    sendSuccess(res, conversations, HTTP_STATUS.OK);
  } catch (error) {
    next(error);
  }
}

export async function handleGetOrCreateDirectConversation(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { targetUserId } = req.body;
    const conversation = await getOrCreateDirectConversation(userId, targetUserId);
    sendSuccess(res, conversation, HTTP_STATUS.OK);
  } catch (error) {
    next(error);
  }
}

export async function handleGetConversationMessages(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { conversationId } = req.params;
    const limit = req.query.limit ? Number.parseInt(req.query.limit as string, 10) : 40;
    const before = req.query.before as string | undefined;

    const messages = await getConversationMessages(userId, conversationId as string, limit, before);
    sendSuccess(res, messages, HTTP_STATUS.OK);
  } catch (error) {
    next(error);
  }
}

export async function handleSendMessage(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { conversationId } = req.params;
    const { content, type, metadata, clientTempId } = req.body;

    const message = await sendMessage(userId, conversationId as string, {
      content,
      type,
      metadata,
      clientTempId,
    });
    sendSuccess(res, message, HTTP_STATUS.CREATED, 'Message sent');
  } catch (error) {
    next(error);
  }
}

export async function handleMarkConversationAsRead(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { conversationId } = req.params;

    const result = await markConversationAsRead(userId, conversationId as string);
    sendSuccess(res, result, HTTP_STATUS.OK, 'Conversation marked as read');
  } catch (error) {
    next(error);
  }
}
