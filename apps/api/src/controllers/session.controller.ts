import type { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '@peerlume/shared';
import { sendSuccess } from '../utils/apiResponse.js';
import {
  createSession,
  getSessionById,
  listSessions,
  acceptInvitation,
  declineInvitation,
  proposeReschedule,
  respondToReschedule,
  cancelSession,
  completeSession,
  checkAvailability,
  getCalendarSessions,
} from '../services/session.service.js';

export async function handleCreateSession(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const organizerId = req.user!.id;
    const session = await createSession(organizerId, req.body);
    sendSuccess(res, session, HTTP_STATUS.CREATED, 'Learning session created successfully');
  } catch (error) {
    next(error);
  }
}

export async function handleListSessions(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const status = req.query.status as any;
    const period = req.query.period as 'upcoming' | 'past' | undefined;

    const sessions = await listSessions(userId, { status, period });
    sendSuccess(res, sessions, HTTP_STATUS.OK);
  } catch (error) {
    next(error);
  }
}

export async function handleGetSessionById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { sessionId } = req.params;

    const session = await getSessionById(userId, sessionId as string);
    sendSuccess(res, session, HTTP_STATUS.OK);
  } catch (error) {
    next(error);
  }
}

export async function handleAcceptInvitation(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { sessionId } = req.params;

    const session = await acceptInvitation(userId, sessionId as string);
    sendSuccess(res, session, HTTP_STATUS.OK, 'Session invitation accepted');
  } catch (error) {
    next(error);
  }
}

export async function handleDeclineInvitation(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { sessionId } = req.params;
    const { reason } = req.body;

    const session = await declineInvitation(userId, sessionId as string, reason);
    sendSuccess(res, session, HTTP_STATUS.OK, 'Session invitation declined');
  } catch (error) {
    next(error);
  }
}

export async function handleProposeReschedule(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { sessionId } = req.params;

    const proposal = await proposeReschedule(userId, sessionId as string, req.body);
    sendSuccess(res, proposal, HTTP_STATUS.CREATED, 'Reschedule proposal submitted');
  } catch (error) {
    next(error);
  }
}

export async function handleRespondReschedule(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { sessionId, proposalId } = req.params;
    const { accept } = req.body;

    const session = await respondToReschedule(userId, sessionId as string, proposalId as string, Boolean(accept));
    sendSuccess(res, session, HTTP_STATUS.OK, accept ? 'Reschedule accepted' : 'Reschedule rejected');
  } catch (error) {
    next(error);
  }
}

export async function handleCancelSession(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { sessionId } = req.params;
    const { reason } = req.body;

    const session = await cancelSession(userId, sessionId as string, reason);
    sendSuccess(res, session, HTTP_STATUS.OK, 'Session cancelled');
  } catch (error) {
    next(error);
  }
}

export async function handleCompleteSession(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { sessionId } = req.params;

    const session = await completeSession(userId, sessionId as string);
    sendSuccess(res, session, HTTP_STATUS.OK, 'Session marked as completed');
  } catch (error) {
    next(error);
  }
}

export async function handleCheckAvailability(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const startStr = req.query.startTime as string;
    const endStr = req.query.endTime as string;
    const excludeSessionId = req.query.excludeSessionId as string | undefined;

    const conflict = await checkAvailability(userId, new Date(startStr), new Date(endStr), excludeSessionId);
    sendSuccess(res, conflict, HTTP_STATUS.OK);
  } catch (error) {
    next(error);
  }
}

export async function handleGetCalendar(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const now = new Date();
    const month = req.query.month ? Number.parseInt(req.query.month as string, 10) : now.getUTCMonth() + 1;
    const year = req.query.year ? Number.parseInt(req.query.year as string, 10) : now.getUTCFullYear();

    const sessions = await getCalendarSessions(userId, month, year);
    sendSuccess(res, sessions, HTTP_STATUS.OK);
  } catch (error) {
    next(error);
  }
}
