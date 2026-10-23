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
