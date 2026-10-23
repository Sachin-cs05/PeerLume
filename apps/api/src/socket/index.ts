import { Server as HttpServer } from 'node:http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { verifyAccessToken } from '../utils/jwt.js';
import { COOKIE_ACCESS_NAME } from '../utils/cookies.js';
import { SOCKET_EVENTS } from '@peerlume/shared';
import type { WebRtcSignalPayload, SendMessageInput } from '@peerlume/shared';
import { prisma } from '../config/prisma.js';

let io: SocketIOServer | null = null;

// Multi-device / multi-tab socket tracking: Map<userId, Set<socketId>>
const userSockets = new Map<string, Set<string>>();

export interface AuthenticatedSocketData {
  userId: string;
  email: string;
}

export function isUserOnline(userId: string): boolean {
  const sockets = userSockets.get(userId);
  return Boolean(sockets && sockets.size > 0);
}

export function getSocketIO(): SocketIOServer | null {
  return io;
}

export function sendToUser(userId: string, event: string, data: any): void {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
}

function parseCookie(cookieString: string | undefined): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieString) return cookies;

  for (const pair of cookieString.split(';')) {
    const [key, value] = pair.trim().split('=');
    if (key && value) {
      cookies[key] = decodeURIComponent(value);
    }
  }
  return cookies;
}

export function initSocketIO(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (
          !origin ||
          origin === env.WEB_ORIGIN ||
          (env.NODE_ENV === 'development' && /^http:\/\/localhost:(5173|5174|5175)$/.test(origin))
        ) {
          callback(null, true);
        } else {
          callback(new Error(`Origin ${origin} not allowed by CORS`));
        }
      },
      credentials: true,
      methods: ['GET', 'POST'],
    },
    pingTimeout: 20000,
    pingInterval: 25000,
  });

  // Authentication Middleware for Socket.IO
  io.use(async (socket: Socket, next) => {
    try {
      let token = socket.handshake.auth?.token;

      // Fallback to cookie
      if (!token && socket.handshake.headers.cookie) {
        const cookies = parseCookie(socket.handshake.headers.cookie);
        token = cookies[COOKIE_ACCESS_NAME];
      }

      if (!token) {
        return next(new Error('Authentication error: Token missing'));
      }

      const payload = verifyAccessToken(token);
      if (!payload) {
        return next(new Error('Authentication error: Token invalid or expired'));
      }

      socket.data = {
        userId: payload.userId,
        email: payload.email,
      } as AuthenticatedSocketData;

      next();
    } catch (err) {
      logger.error('Socket authentication error:', err);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const { userId } = socket.data as AuthenticatedSocketData;
    logger.info(`Socket connected: ${socket.id} (user: ${userId})`);

    // 1. Join dedicated user room for targeted notifications & signals
    socket.join(`user:${userId}`);

    // 2. Track user sockets for presence
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
      // Broadcast online status since this is their first connection
      socket.broadcast.emit(SOCKET_EVENTS.PRESENCE_UPDATE, {
        userId,
        isOnline: true,
      });
    }
    userSockets.get(userId)!.add(socket.id);

    // Send immediate acknowledgment of presence
    socket.emit(SOCKET_EVENTS.PRESENCE_UPDATE, {
      userId,
      isOnline: true,
    });

    // -------------------------------------------------------------------------
    // Room Joining & Authorization
    // -------------------------------------------------------------------------
    socket.on(SOCKET_EVENTS.ROOM_JOIN, async (conversationId: string, ack?: (res: any) => void) => {
      try {
        if (!conversationId) {
          ack?.({ success: false, error: 'Conversation ID required' });
          return;
        }

        // Verify that the user is a participant in this conversation
        const conversation = await prisma.conversation.findUnique({
          where: { id: conversationId },
        });

        if (!conversation || (conversation.user1Id !== userId && conversation.user2Id !== userId)) {
          ack?.({ success: false, error: 'Unauthorized to join conversation room' });
          return;
        }

        const otherUserId = conversation.user1Id === userId ? conversation.user2Id : conversation.user1Id;
        const block = await prisma.userBlock.findFirst({
          where: {
            OR: [
              { blockerId: userId, blockedId: otherUserId },
              { blockerId: otherUserId, blockedId: userId },
            ],
          },
        });

        if (block) {
          ack?.({ success: false, error: 'Cannot join room due to privacy restrictions' });
          return;
        }

        socket.join(`conversation:${conversationId}`);
        ack?.({ success: true });
      } catch (err) {
        logger.error(`Error joining room: ${conversationId}`, err);
        ack?.({ success: false, error: 'Internal server error joining room' });
      }
    });

    socket.on(SOCKET_EVENTS.ROOM_LEAVE, (conversationId: string, ack?: (res: any) => void) => {
      socket.leave(`conversation:${conversationId}`);
      ack?.({ success: true });
    });

    // -------------------------------------------------------------------------
    // Real-Time Chat Events
    // -------------------------------------------------------------------------
    socket.on(
      SOCKET_EVENTS.MESSAGE_SEND,
      async (
        payload: { conversationId: string; content: string; type?: any; metadata?: any; clientTempId?: string },
        ack?: (res: any) => void
      ) => {
        try {
          const { sendMessage } = await import('../services/chat.service.js');
          const message = await sendMessage(userId, payload.conversationId, {
            content: payload.content,
            type: payload.type,
            metadata: payload.metadata,
            clientTempId: payload.clientTempId,
          } as SendMessageInput);

          ack?.({ success: true, message });
        } catch (err: any) {
          logger.error('Error sending message via socket:', err?.message);
          ack?.({ success: false, error: err?.message || 'Failed to send message' });
        }
      }
    );

    socket.on(SOCKET_EVENTS.TYPING_START, async (conversationId: string) => {
      try {
        if (!conversationId) return;
        socket.to(`conversation:${conversationId}`).emit(SOCKET_EVENTS.TYPING_START, {
          conversationId,
          userId,
        });
      } catch (err) {
        logger.error('Error in typing:start:', err);
      }
    });

    socket.on(SOCKET_EVENTS.TYPING_STOP, async (conversationId: string) => {
      try {
        if (!conversationId) return;
        socket.to(`conversation:${conversationId}`).emit(SOCKET_EVENTS.TYPING_STOP, {
          conversationId,
          userId,
        });
      } catch (err) {
        logger.error('Error in typing:stop:', err);
      }
    });

    // -------------------------------------------------------------------------
    // WebRTC Signaling Events
    // -------------------------------------------------------------------------
    socket.on(
      SOCKET_EVENTS.CALL_INVITE,
      async (payload: { receiverId: string; type?: 'AUDIO' | 'VIDEO' }, ack?: (res: any) => void) => {
        try {
          const { initiateCall } = await import('../services/call.service.js');
          const session = await initiateCall(userId, payload.receiverId, payload.type || 'VIDEO');
          ack?.({ success: true, session });
        } catch (err: any) {
          logger.error('Error initiating call:', err?.message);
          ack?.({ success: false, error: err?.message || 'Failed to initiate call' });
        }
      }
    );

    socket.on(
      SOCKET_EVENTS.CALL_ACCEPT,
      async (payload: { callId: string }, ack?: (res: any) => void) => {
        try {
          const { updateCallStatus } = await import('../services/call.service.js');
          const session = await updateCallStatus(userId, payload.callId, 'ACCEPTED');
          ack?.({ success: true, session });
        } catch (err: any) {
          logger.error('Error accepting call:', err?.message);
          ack?.({ success: false, error: err?.message || 'Failed to accept call' });
        }
      }
    );

    socket.on(
      SOCKET_EVENTS.CALL_REJECT,
      async (payload: { callId: string }, ack?: (res: any) => void) => {
        try {
          const { updateCallStatus } = await import('../services/call.service.js');
          const session = await updateCallStatus(userId, payload.callId, 'REJECTED');
          ack?.({ success: true, session });
        } catch (err: any) {
          logger.error('Error rejecting call:', err?.message);
          ack?.({ success: false, error: err?.message || 'Failed to reject call' });
        }
      }
    );

    socket.on(
      SOCKET_EVENTS.CALL_END,
      async (payload: { callId: string; reason?: string }, ack?: (res: any) => void) => {
        try {
          const { updateCallStatus } = await import('../services/call.service.js');
          const session = await updateCallStatus(userId, payload.callId, 'ENDED');
          ack?.({ success: true, session });
        } catch (err: any) {
          logger.error('Error ending call:', err?.message);
          ack?.({ success: false, error: err?.message || 'Failed to end call' });
        }
      }
    );

    // Direct WebRTC SDP Offer forwarding
    socket.on(SOCKET_EVENTS.CALL_OFFER, async (payload: WebRtcSignalPayload) => {
      try {
        if (!payload.callId || !payload.receiverId || !payload.sdp) return;

        // Authorize: check session
        const session = await prisma.callSession.findUnique({
          where: { id: payload.callId },
        });

        if (!session || session.callerId !== userId && session.receiverId !== userId) {
          return;
        }

        sendToUser(payload.receiverId, SOCKET_EVENTS.CALL_OFFER, {
          callId: payload.callId,
          senderId: userId,
          receiverId: payload.receiverId,
          sdp: payload.sdp,
        });
      } catch (err) {
        logger.error('Error forwarding SDP offer:', err);
      }
    });

    // Direct WebRTC SDP Answer forwarding
    socket.on(SOCKET_EVENTS.CALL_ANSWER, async (payload: WebRtcSignalPayload) => {
      try {
        if (!payload.callId || !payload.receiverId || !payload.sdp) return;

        const session = await prisma.callSession.findUnique({
          where: { id: payload.callId },
        });

        if (!session || session.callerId !== userId && session.receiverId !== userId) {
          return;
        }

        sendToUser(payload.receiverId, SOCKET_EVENTS.CALL_ANSWER, {
          callId: payload.callId,
          senderId: userId,
          receiverId: payload.receiverId,
          sdp: payload.sdp,
        });
      } catch (err) {
        logger.error('Error forwarding SDP answer:', err);
      }
    });

    // Direct WebRTC ICE Candidate forwarding
    socket.on(SOCKET_EVENTS.CALL_ICE_CANDIDATE, async (payload: WebRtcSignalPayload) => {
      try {
        if (!payload.callId || !payload.receiverId || !payload.candidate) return;

        const session = await prisma.callSession.findUnique({
          where: { id: payload.callId },
        });

        if (!session || session.callerId !== userId && session.receiverId !== userId) {
          return;
        }

        sendToUser(payload.receiverId, SOCKET_EVENTS.CALL_ICE_CANDIDATE, {
          callId: payload.callId,
          senderId: userId,
          receiverId: payload.receiverId,
          candidate: payload.candidate,
        });
      } catch (err) {
        logger.error('Error forwarding ICE candidate:', err);
      }
    });

    // -------------------------------------------------------------------------
    // Phase 6: Collaborative Code Editor Real-Time Synchronization
    // -------------------------------------------------------------------------
    socket.on(SOCKET_EVENTS.CODE_JOIN, async (data: { workspaceId: string; documentId: string }, ack?: (res: any) => void) => {
      try {
        const { workspaceId, documentId } = data || {};
        if (!workspaceId || !documentId) {
          ack?.({ success: false, error: 'Workspace ID and Document ID required' });
          return;
        }

        // Verify user is an authorized participant
        const participant = await prisma.codeWorkspaceParticipant.findUnique({
          where: {
            workspaceId_userId: { workspaceId, userId },
          },
          include: {
            workspace: { select: { creatorId: true } },
          },
        });

        if (!participant) {
          ack?.({ success: false, error: 'Unauthorized: You are not a collaborator in this workspace' });
          return;
        }

        // Verify mutual block policy with workspace creator
        if (participant.workspace.creatorId !== userId) {
          const isBlocked = await prisma.userBlock.findFirst({
            where: {
              OR: [
                { blockerId: userId, blockedId: participant.workspace.creatorId },
                { blockerId: participant.workspace.creatorId, blockedId: userId },
              ],
            },
          });
          if (isBlocked) {
            ack?.({ success: false, error: 'Access denied: Block policy violation' });
            return;
          }
        }

        const room = `code:${workspaceId}:${documentId}`;
        socket.join(room);

        // Fetch or initialize Y.Doc from memory/DB
        const { codeSyncService } = await import('../services/codeSync.service.js');
        const Y = await import('yjs');
        const doc = await codeSyncService.getOrCreateDoc(workspaceId, documentId);

        const docRecord = await prisma.codeDocument.findUnique({
          where: { id: documentId },
        });

        const yText = doc.getText('monaco');
        const stateUpdate = Y.encodeStateAsUpdate(doc);

        socket.emit(SOCKET_EVENTS.CODE_SYNC_INIT, {
          workspaceId,
          documentId,
          state: Array.from(stateUpdate),
          content: yText.toString(),
          language: docRecord?.language || 'typescript',
          version: docRecord?.version || 1,
          role: participant.role,
        });

        ack?.({ success: true, role: participant.role });
        logger.info(`User ${userId} joined code room ${room} with role ${participant.role}`);
      } catch (err: any) {
        logger.error('Error handling code:workspace-join:', err);
        ack?.({ success: false, error: err?.message || 'Failed to join workspace' });
      }
    });

    socket.on(SOCKET_EVENTS.CODE_DOC_UPDATE, async (payload: { workspaceId: string; documentId: string; update: number[] }) => {
      try {
        if (!payload?.workspaceId || !payload?.documentId || !payload?.update) return;

        // Check participant role
        const participant = await prisma.codeWorkspaceParticipant.findUnique({
          where: {
            workspaceId_userId: { workspaceId: payload.workspaceId, userId },
          },
        });

        if (!participant || participant.role === 'VIEWER') {
          socket.emit(SOCKET_EVENTS.CODE_ERROR, {
            documentId: payload.documentId,
            message: 'Unauthorized: Viewers cannot make edits to code',
          });
          return;
        }

        const { codeSyncService } = await import('../services/codeSync.service.js');
        const updateBytes = new Uint8Array(payload.update);
        await codeSyncService.applyUpdate(
          userId,
          payload.workspaceId,
          payload.documentId,
          updateBytes,
          participant.role
        );

        // Broadcast incremental CRDT update to other participants in this document room
        const room = `code:${payload.workspaceId}:${payload.documentId}`;
        socket.to(room).emit(SOCKET_EVENTS.CODE_DOC_UPDATE, payload);
      } catch (err) {
        logger.error('Error handling code:doc-update:', err);
      }
    });

    socket.on(SOCKET_EVENTS.CODE_AWARENESS_UPDATE, (payload: { workspaceId: string; documentId: string; update: number[] }) => {
      if (!payload?.workspaceId || !payload?.documentId || !payload?.update) return;
      const room = `code:${payload.workspaceId}:${payload.documentId}`;
      socket.to(room).emit(SOCKET_EVENTS.CODE_AWARENESS_UPDATE, payload);
    });

    socket.on(SOCKET_EVENTS.CODE_SAVE, async (payload: { workspaceId: string; documentId: string; description?: string }, ack?: (res: any) => void) => {
      try {
        if (!payload?.workspaceId || !payload?.documentId) {
          ack?.({ success: false, error: 'Workspace ID and Document ID required' });
          return;
        }

        const participant = await prisma.codeWorkspaceParticipant.findUnique({
          where: {
            workspaceId_userId: { workspaceId: payload.workspaceId, userId },
          },
        });

        if (!participant || participant.role === 'VIEWER') {
          ack?.({ success: false, error: 'Unauthorized: Viewers cannot save code' });
          return;
        }

        const { codeSyncService } = await import('../services/codeSync.service.js');
        const result = await codeSyncService.saveDocumentNow(
          userId,
          payload.workspaceId,
          payload.documentId,
          payload.description
        );

        const room = `code:${payload.workspaceId}:${payload.documentId}`;
        io?.to(room).emit(SOCKET_EVENTS.CODE_SAVED, {
          documentId: payload.documentId,
          version: result.version,
          savedAt: result.savedAt,
        });

        ack?.({ success: true, version: result.version, savedAt: result.savedAt });
      } catch (err: any) {
        logger.error('Error handling code:save:', err);
        ack?.({ success: false, error: err?.message || 'Failed to save code' });
      }
    });

    socket.on(SOCKET_EVENTS.CODE_LEAVE, (data: { workspaceId: string; documentId: string }) => {
      if (data?.workspaceId && data?.documentId) {
        const room = `code:${data.workspaceId}:${data.documentId}`;
        socket.leave(room);
        logger.info(`User ${userId} left code room ${room}`);
      }
    });

    // -------------------------------------------------------------------------
    // Phase 7: Interactive Study Room & Whiteboard Real-Time Events
    // -------------------------------------------------------------------------
    socket.on(
      SOCKET_EVENTS.STUDY_ROOM_JOIN,
      async (payload: { roomId: string }, ack?: (res: any) => void) => {
        try {
          if (!payload?.roomId) {
            ack?.({ success: false, error: 'Room ID required' });
            return;
          }

          const room = await prisma.studyRoom.findUnique({
            where: { id: payload.roomId },
            include: {
              participants: true,
              creator: { select: { id: true, fullName: true } },
            },
          });

          if (!room || !room.isActive) {
            ack?.({ success: false, error: 'Study room not found or inactive' });
            return;
          }

          // Check block between user and room creator
          const isBlocked = await prisma.userBlock.findFirst({
            where: {
              OR: [
                { blockerId: userId, blockedId: room.creatorId },
                { blockerId: room.creatorId, blockedId: userId },
              ],
            },
          });

          if (isBlocked) {
            ack?.({ success: false, error: 'Access blocked' });
            return;
          }

          const participant = room.participants.find((p) => p.userId === userId && !p.leftAt);
          const isOwner = room.creatorId === userId;

          if (!participant && !isOwner) {
            // Check session membership if tied to a session
            let eligible = false;
            if (room.sessionId) {
              const sp = await prisma.sessionParticipant.findFirst({
                where: { sessionId: room.sessionId, userId, status: 'ACCEPTED' },
              });
              eligible = Boolean(sp);
            }
            if (!eligible) {
              ack?.({ success: false, error: 'Unauthorized: Not a room participant' });
              return;
            }
          }

          const roomChannel = `study_room:${payload.roomId}`;
          socket.join(roomChannel);

          const currentUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, fullName: true, avatarUrl: true },
          });

          // Broadcast user joined to other members in the study room
          socket.to(roomChannel).emit(SOCKET_EVENTS.STUDY_ROOM_USER_JOINED, {
            roomId: payload.roomId,
            user: currentUser,
            role: participant?.role || (isOwner ? 'OWNER' : 'EDITOR'),
          });

          logger.info(`User ${userId} joined study room ${roomChannel}`);
          ack?.({
            success: true,
            roomId: payload.roomId,
            role: participant?.role || (isOwner ? 'OWNER' : 'EDITOR'),
          });
        } catch (err: any) {
          logger.error('Error handling study-room:join:', err);
          ack?.({ success: false, error: err?.message || 'Join failed' });
        }
      }
    );

    socket.on(SOCKET_EVENTS.STUDY_ROOM_LEAVE, (payload: { roomId: string }) => {
      if (payload?.roomId) {
        const roomChannel = `study_room:${payload.roomId}`;
        socket.leave(roomChannel);
        socket.to(roomChannel).emit(SOCKET_EVENTS.STUDY_ROOM_USER_LEFT, {
          roomId: payload.roomId,
          userId,
        });
        logger.info(`User ${userId} left study room ${roomChannel}`);
      }
    });

    socket.on(
      SOCKET_EVENTS.STUDY_ROOM_SIGNAL,
      (payload: { roomId: string; targetUserId: string; signal: any }) => {
        if (!payload?.roomId || !payload?.targetUserId || !payload?.signal) return;
        // Forward WebRTC signal to target user within the study room
        io?.to(`user:${payload.targetUserId}`).emit(SOCKET_EVENTS.STUDY_ROOM_SIGNAL, {
          roomId: payload.roomId,
          senderId: userId,
          signal: payload.signal,
        });
      }
    );

    socket.on(
      SOCKET_EVENTS.WHITEBOARD_INIT,
      async (payload: { roomId: string; boardId?: string }, ack?: (res: any) => void) => {
        try {
          if (!payload?.roomId) {
            ack?.({ success: false, error: 'Room ID required' });
            return;
          }

          const participant = await prisma.studyRoomParticipant.findFirst({
            where: { roomId: payload.roomId, userId },
          });

          const isOwner = await prisma.studyRoom.count({
            where: { id: payload.roomId, creatorId: userId },
          });

          const role = isOwner ? 'OWNER' : participant?.role || 'EDITOR';

          const { whiteboardSyncService } = await import('../services/whiteboardSync.service.js');
          const board = await whiteboardSyncService.getOrCreateBoard(payload.roomId, payload.boardId);

          ack?.({
            success: true,
            roomId: payload.roomId,
            boardId: board.boardId,
            elements: board.elements,
            version: board.version,
            role,
          });
        } catch (err: any) {
          logger.error('Error handling whiteboard:init:', err);
          ack?.({ success: false, error: err?.message || 'Whiteboard init failed' });
        }
      }
    );

    socket.on(
      SOCKET_EVENTS.WHITEBOARD_DRAW_STEP,
      async (payload: { roomId: string; boardId: string; step: any }, ack?: (res: any) => void) => {
        try {
          if (!payload?.roomId || !payload?.boardId || !payload?.step) return;

          const participant = await prisma.studyRoomParticipant.findFirst({
            where: { roomId: payload.roomId, userId },
          });

          const isOwner = await prisma.studyRoom.count({
            where: { id: payload.roomId, creatorId: userId },
          });

          const role = isOwner ? 'OWNER' : participant?.role || 'EDITOR';
          if (role === 'VIEWER') {
            ack?.({ success: false, error: 'Unauthorized: Viewers cannot modify whiteboard' });
            return;
          }

          const { whiteboardSyncService } = await import('../services/whiteboardSync.service.js');
          const result = await whiteboardSyncService.applyDrawStep(
            userId,
            payload.roomId,
            payload.boardId,
            payload.step,
            role
          );

          // Broadcast draw step to other room members
          const roomChannel = `study_room:${payload.roomId}`;
          socket.to(roomChannel).emit(SOCKET_EVENTS.WHITEBOARD_DRAW_STEP, {
            roomId: payload.roomId,
            boardId: payload.boardId,
            step: payload.step,
            version: result.version,
          });

          ack?.({ success: true, version: result.version });
        } catch (err: any) {
          logger.error('Error handling whiteboard:draw-step:', err);
          ack?.({ success: false, error: err?.message || 'Draw step failed' });
        }
      }
    );

    socket.on(
      SOCKET_EVENTS.WHITEBOARD_CURSOR,
      async (payload: { roomId: string; x: number; y: number }) => {
        if (!payload?.roomId) return;
        const roomChannel = `study_room:${payload.roomId}`;
        socket.to(roomChannel).emit(SOCKET_EVENTS.WHITEBOARD_CURSOR, {
          roomId: payload.roomId,
          userId,
          x: payload.x,
          y: payload.y,
        });
      }
    );

    socket.on(
      SOCKET_EVENTS.WHITEBOARD_CLEAR,
      async (payload: { roomId: string; boardId: string }, ack?: (res: any) => void) => {
        try {
          if (!payload?.roomId || !payload?.boardId) return;

          const participant = await prisma.studyRoomParticipant.findFirst({
            where: { roomId: payload.roomId, userId },
          });
          const isOwner = await prisma.studyRoom.count({
            where: { id: payload.roomId, creatorId: userId },
          });
          const role = isOwner ? 'OWNER' : participant?.role || 'EDITOR';

          if (role === 'VIEWER') {
            ack?.({ success: false, error: 'Viewers cannot clear whiteboard' });
            return;
          }

          const { whiteboardSyncService } = await import('../services/whiteboardSync.service.js');
          const result = await whiteboardSyncService.applyDrawStep(
            userId,
            payload.roomId,
            payload.boardId,
            { type: 'clear' },
            role
          );

          const roomChannel = `study_room:${payload.roomId}`;
          socket.to(roomChannel).emit(SOCKET_EVENTS.WHITEBOARD_CLEAR, {
            roomId: payload.roomId,
            boardId: payload.boardId,
            version: result.version,
          });

          ack?.({ success: true, version: result.version });
        } catch (err: any) {
          logger.error('Error handling whiteboard:clear:', err);
          ack?.({ success: false, error: err?.message });
        }
      }
    );

    socket.on(
      SOCKET_EVENTS.WHITEBOARD_SAVE,
      async (payload: { roomId: string; boardId: string; description?: string }, ack?: (res: any) => void) => {
        try {
          if (!payload?.roomId) return;

          const { whiteboardSyncService } = await import('../services/whiteboardSync.service.js');
          const result = await whiteboardSyncService.saveBoardNow(
            userId,
            payload.roomId,
            payload.boardId,
            payload.description
          );

          const roomChannel = `study_room:${payload.roomId}`;
          io?.to(roomChannel).emit(SOCKET_EVENTS.WHITEBOARD_SAVED, {
            roomId: payload.roomId,
            boardId: payload.boardId,
            version: result.version,
            savedAt: result.savedAt,
          });

          ack?.({ success: true, version: result.version, savedAt: result.savedAt });
        } catch (err: any) {
          logger.error('Error handling whiteboard:save:', err);
          ack?.({ success: false, error: err?.message || 'Save failed' });
        }
      }
    );

    // -------------------------------------------------------------------------
    // Disconnection Handling
    // -------------------------------------------------------------------------
    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id} (user: ${userId})`);

      const sockets = userSockets.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          userSockets.delete(userId);
          // Broadcast offline status only when the last socket disconnected
          socket.broadcast.emit(SOCKET_EVENTS.PRESENCE_UPDATE, {
            userId,
            isOnline: false,
            lastSeen: new Date().toISOString(),
          });
        }
      }
    });
  });

  return io;
}
