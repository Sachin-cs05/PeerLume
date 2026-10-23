import type { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '@peerlume/shared';
import { sendSuccess } from '../utils/apiResponse.js';
import {
  initiateCall,
  updateCallStatus,
  getCallSession,
  getIceServers,
} from '../services/call.service.js';

export async function handleInitiateCall(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const callerId = req.user!.id;
    const { receiverId, type } = req.body;

    const session = await initiateCall(callerId, receiverId, type || 'VIDEO');
    sendSuccess(res, session, HTTP_STATUS.CREATED, 'Call initiated');
  } catch (error) {
    next(error);
  }
}

export async function handleGetCallSession(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { callId } = req.params;

    const session = await getCallSession(userId, callId as string);
    sendSuccess(res, session, HTTP_STATUS.OK);
  } catch (error) {
    next(error);
  }
}

export async function handleEndCall(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { callId } = req.params;

    const session = await updateCallStatus(userId, callId as string, 'ENDED');
    sendSuccess(res, session, HTTP_STATUS.OK, 'Call ended');
  } catch (error) {
    next(error);
  }
}

export async function handleUpdateCallStatus(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { callId } = req.params;
    const { status } = req.body;

    const session = await updateCallStatus(userId, callId as string, status);
    sendSuccess(res, session, HTTP_STATUS.OK, 'Call status updated');
  } catch (error) {
    next(error);
  }
}

export async function handleGetIceConfig(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const iceServers = getIceServers();
    sendSuccess(res, { iceServers }, HTTP_STATUS.OK);
  } catch (error) {
    next(error);
  }
}
