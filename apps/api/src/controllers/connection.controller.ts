import type { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '@peerlume/shared';
import { sendSuccess } from '../utils/apiResponse.js';
import {
  sendFriendRequest,
  getIncomingRequests,
  getOutgoingRequests,
  acceptFriendRequest,
  declineFriendRequest,
  cancelFriendRequest,
  getFriends,
  removeFriend,
  blockStudent,
  unblockStudent,
  getBlockedStudents,
  savePartner,
  removeSavedPartner,
  getSavedPartners,
} from '../services/connection.service.js';

export async function handleSendRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const senderId = req.user!.id;
    const receiverId = req.body.receiverId || req.body.recipientId;
    const message = req.body.message;
    const result = await sendFriendRequest(senderId, receiverId, message);
    sendSuccess(res, result, HTTP_STATUS.CREATED, result.message);
  } catch (error) {
    next(error);
  }
}

export async function handleGetIncomingRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const requests = await getIncomingRequests(userId);
    sendSuccess(res, requests, HTTP_STATUS.OK);
  } catch (error) {
    next(error);
  }
}

export async function handleGetOutgoingRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const requests = await getOutgoingRequests(userId);
    sendSuccess(res, requests, HTTP_STATUS.OK);
  } catch (error) {
    next(error);
  }
}

export async function handleAcceptRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const requestId = req.params.requestId as string;
    await acceptFriendRequest(requestId, userId);
    sendSuccess(res, null, HTTP_STATUS.OK, 'Connection request accepted');
  } catch (error) {
    next(error);
  }
}

export async function handleDeclineRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const requestId = req.params.requestId as string;
    await declineFriendRequest(requestId, userId);
    sendSuccess(res, null, HTTP_STATUS.OK, 'Connection request declined');
  } catch (error) {
    next(error);
  }
}

export async function handleCancelRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const requestId = req.params.requestId as string;
    await cancelFriendRequest(requestId, userId);
    sendSuccess(res, null, HTTP_STATUS.OK, 'Connection request cancelled');
  } catch (error) {
    next(error);
  }
}

export async function handleGetConnections(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const friends = await getFriends(userId, search);
    sendSuccess(res, friends, HTTP_STATUS.OK);
  } catch (error) {
    next(error);
  }
}

export async function handleRemoveConnection(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const connectionId = req.params.connectionId as string;
    await removeFriend(connectionId, userId);
    sendSuccess(res, null, HTTP_STATUS.OK, 'Connection removed');
  } catch (error) {
    next(error);
  }
}

export async function handleBlockStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const blockerId = req.user!.id;
    const studentId = req.params.studentId as string;
    const reason = req.body?.reason;
    await blockStudent(blockerId, studentId, reason);
    sendSuccess(res, null, HTTP_STATUS.OK, 'Student blocked successfully');
  } catch (error) {
    next(error);
  }
}

export async function handleUnblockStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const blockerId = req.user!.id;
    const studentId = req.params.studentId as string;
    await unblockStudent(blockerId, studentId);
    sendSuccess(res, null, HTTP_STATUS.OK, 'Student unblocked successfully');
  } catch (error) {
    next(error);
  }
}

export async function handleGetBlockedStudents(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const blocks = await getBlockedStudents(userId);
    sendSuccess(res, blocks, HTTP_STATUS.OK);
  } catch (error) {
    next(error);
  }
}

export async function handleSavePartner(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const studentId = req.params.studentId as string;
    const notes = req.body?.notes;
    await savePartner(userId, studentId, notes);
    sendSuccess(res, null, HTTP_STATUS.OK, 'Learning partner saved');
  } catch (error) {
    next(error);
  }
}

export async function handleRemoveSavedPartner(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const studentId = req.params.studentId as string;
    await removeSavedPartner(userId, studentId);
    sendSuccess(res, null, HTTP_STATUS.OK, 'Saved partner removed');
  } catch (error) {
    next(error);
  }
}

export async function handleGetSavedPartners(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const saved = await getSavedPartners(userId);
    sendSuccess(res, saved, HTTP_STATUS.OK);
  } catch (error) {
    next(error);
  }
}
