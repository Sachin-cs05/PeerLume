import type { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/apiResponse.js';
import { HTTP_STATUS } from '@peerlume/shared';
import * as studyRoomService from '../services/studyRoom.service.js';
import { whiteboardSyncService } from '../services/whiteboardSync.service.js';

export async function handleCreateStudyRoom(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const result = await studyRoomService.createStudyRoom(userId, req.body);
    sendSuccess(res, result, HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
}

export async function handleGetStudyRooms(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const { sessionId, activeOnly, page, limit } = req.query;

    const result = await studyRoomService.getStudyRooms(userId, {
      sessionId: sessionId as string | undefined,
      activeOnly: activeOnly !== undefined ? activeOnly === 'true' : undefined,
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
    });

    sendSuccess(res, result, HTTP_STATUS.OK);
  } catch (error) {
    next(error);
  }
}

export async function handleGetStudyRoomById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const roomId = req.params.roomId as string;
    const result = await studyRoomService.getStudyRoomById(userId, roomId);
    sendSuccess(res, result, HTTP_STATUS.OK);
  } catch (error) {
    next(error);
  }
}

export async function handleUpdateStudyRoom(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const roomId = req.params.roomId as string;
    const result = await studyRoomService.updateStudyRoom(userId, roomId, req.body);
    sendSuccess(res, result, HTTP_STATUS.OK);
  } catch (error) {
    next(error);
  }
}

export async function handleJoinStudyRoom(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const roomId = req.params.roomId as string;
    const result = await studyRoomService.joinStudyRoom(userId, roomId);
    sendSuccess(res, result, HTTP_STATUS.OK);
  } catch (error) {
    next(error);
  }
}

export async function handleLeaveStudyRoom(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const roomId = req.params.roomId as string;
    const result = await studyRoomService.leaveStudyRoom(userId, roomId);
    sendSuccess(res, result, HTTP_STATUS.OK);
  } catch (error) {
    next(error);
  }
}

export async function handleEndStudyRoom(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const roomId = req.params.roomId as string;
    const result = await studyRoomService.endStudyRoom(userId, roomId);
    sendSuccess(res, result, HTTP_STATUS.OK);
  } catch (error) {
    next(error);
  }
}

export async function handleAddParticipant(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const roomId = req.params.roomId as string;
    const result = await studyRoomService.addParticipant(userId, roomId, req.body);
    sendSuccess(res, result, HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
}

export async function handleUpdateParticipantRole(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const roomId = req.params.roomId as string;
    const participantId = req.params.participantId as string;
    const { role } = req.body;
    const result = await studyRoomService.updateParticipantRole(userId, roomId, participantId, role);
    sendSuccess(res, result, HTTP_STATUS.OK);
  } catch (error) {
    next(error);
  }
}

export async function handleRemoveParticipant(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const roomId = req.params.roomId as string;
    const participantId = req.params.participantId as string;
    const result = await studyRoomService.removeParticipant(userId, roomId, participantId);
    sendSuccess(res, result, HTTP_STATUS.OK);
  } catch (error) {
    next(error);
  }
}

// Whiteboard endpoints
export async function handleGetWhiteboard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const roomId = req.params.roomId as string;
    await studyRoomService.getStudyRoomById(userId, roomId);

    const board = await whiteboardSyncService.getOrCreateBoard(roomId);
    sendSuccess(
      res,
      {
        boardId: board.boardId,
        roomId: board.roomId,
        elements: board.elements,
        version: board.version,
        lastSavedAt: board.lastSavedAt,
      },
      HTTP_STATUS.OK
    );
  } catch (error) {
    next(error);
  }
}

export async function handleSaveWhiteboard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const roomId = req.params.roomId as string;
    const room = await studyRoomService.getStudyRoomById(userId, roomId);

    const participant = room.participants?.find((p) => p.userId === userId);
    if (participant?.role === 'VIEWER') {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Unauthorized: Viewers cannot save whiteboard' },
      });
      return;
    }

    const { description } = req.body;
    const result = await whiteboardSyncService.saveBoardNow(userId, roomId, undefined, description);
    sendSuccess(res, result, HTTP_STATUS.OK);
  } catch (error) {
    next(error);
  }
}

export async function handleGetWhiteboardRevisions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const roomId = req.params.roomId as string;
    await studyRoomService.getStudyRoomById(userId, roomId);

    const revisions = await whiteboardSyncService.getBoardRevisions(userId, roomId);
    sendSuccess(res, revisions, HTTP_STATUS.OK);
  } catch (error) {
    next(error);
  }
}

export async function handleRestoreWhiteboardRevision(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const roomId = req.params.roomId as string;
    const revisionId = req.params.revisionId as string;
    const room = await studyRoomService.getStudyRoomById(userId, roomId);

    const participant = room.participants?.find((p) => p.userId === userId);
    const role = (participant?.role || 'EDITOR') as any;

    const board = await whiteboardSyncService.getOrCreateBoard(roomId);
    const result = await whiteboardSyncService.restoreRevision(userId, roomId, board.boardId, revisionId, role);
    sendSuccess(res, result, HTTP_STATUS.OK);
  } catch (error) {
    next(error);
  }
}
