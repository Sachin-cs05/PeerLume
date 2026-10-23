import { prisma } from '../config/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { HTTP_STATUS, SOCKET_EVENTS } from '@peerlume/shared';
import type {
  CallSessionDto,
  CallType,
  CallStatus,
  IceServerConfig,
} from '@peerlume/shared';
import { checkBlockBetween } from './chat.service.js';
import { createNotification } from './notification.service.js';
import { getSocketIO, sendToUser } from '../socket/index.js';
import { env } from '../config/env.js';

export function formatCallSessionDto(session: any): CallSessionDto {
  return {
    id: session.id,
    callerId: session.callerId,
    callerName: session.caller?.fullName || 'Student',
    callerAvatar: session.caller?.avatarUrl || null,
    receiverId: session.receiverId,
    receiverName: session.receiver?.fullName || 'Student',
    receiverAvatar: session.receiver?.avatarUrl || null,
    type: session.type as CallType,
    status: session.status as CallStatus,
    startedAt: session.startedAt ? session.startedAt.toISOString() : null,
    endedAt: session.endedAt ? session.endedAt.toISOString() : null,
    createdAt: session.createdAt.toISOString(),
    updatedAt: session.updatedAt.toISOString(),
  };
}

export async function initiateCall(
  callerId: string,
  receiverId: string,
  type: CallType = 'VIDEO'
): Promise<CallSessionDto> {
  if (callerId === receiverId) {
    throw new AppError('Cannot call yourself', HTTP_STATUS.BAD_REQUEST);
  }

  const receiver = await prisma.user.findUnique({
    where: { id: receiverId },
  });

  if (!receiver) {
    throw new AppError('Target student not found', HTTP_STATUS.NOT_FOUND);
  }

  const isBlocked = await checkBlockBetween(callerId, receiverId);
  if (isBlocked) {
    throw new AppError('Cannot initiate call due to privacy settings', HTTP_STATUS.FORBIDDEN);
  }

  // End any ongoing active calls for this caller/receiver pair
  await prisma.callSession.updateMany({
    where: {
      callerId,
      receiverId,
      status: { in: ['INITIATED', 'RINGING'] },
    },
    data: {
      status: 'ENDED',
      endedAt: new Date(),
    },
  });

  const session = await prisma.callSession.create({
    data: {
      callerId,
      receiverId,
      type,
      status: 'INITIATED',
    },
    include: {
      caller: {
        select: {
          id: true,
          fullName: true,
          avatarUrl: true,
        },
      },
      receiver: {
        select: {
          id: true,
          fullName: true,
          avatarUrl: true,
        },
      },
    },
  });

  const dto = formatCallSessionDto(session);

  // Send real-time call invitation to receiver's active sockets
  try {
    const io = getSocketIO();
    if (io) {
      sendToUser(receiverId, SOCKET_EVENTS.CALL_INVITE, dto);
    }
  } catch {
    // Sockets failure handled gracefully
  }

  return dto;
}

export async function updateCallStatus(
  userId: string,
  callId: string,
  status: CallStatus
): Promise<CallSessionDto> {
  const session = await prisma.callSession.findUnique({
    where: { id: callId },
    include: {
      caller: { select: { id: true, fullName: true, avatarUrl: true } },
      receiver: { select: { id: true, fullName: true, avatarUrl: true } },
    },
  });

  if (!session) {
    throw new AppError('Call session not found', HTTP_STATUS.NOT_FOUND);
  }

  if (session.callerId !== userId && session.receiverId !== userId) {
    throw new AppError('Unauthorized access to call session', HTTP_STATUS.FORBIDDEN);
  }

  const now = new Date();
  const updateData: any = { status };

  if (status === 'ACCEPTED' && !session.startedAt) {
    updateData.startedAt = now;
  }

  if (['ENDED', 'REJECTED', 'MISSED', 'FAILED'].includes(status) && !session.endedAt) {
    updateData.endedAt = now;
  }

  const updatedSession = await prisma.callSession.update({
    where: { id: callId },
    data: updateData,
    include: {
      caller: { select: { id: true, fullName: true, avatarUrl: true } },
      receiver: { select: { id: true, fullName: true, avatarUrl: true } },
    },
  });

  const dto = formatCallSessionDto(updatedSession);
  const otherUserId = session.callerId === userId ? session.receiverId : session.callerId;

  // Emit status change event to the other participant
  try {
    const io = getSocketIO();
    if (io) {
      if (status === 'RINGING') {
        sendToUser(session.callerId, SOCKET_EVENTS.CALL_RINGING, dto);
      } else if (status === 'ACCEPTED') {
        sendToUser(session.callerId, SOCKET_EVENTS.CALL_ACCEPT, dto);
      } else if (status === 'REJECTED') {
        sendToUser(session.callerId, SOCKET_EVENTS.CALL_REJECT, dto);
      } else if (['ENDED', 'MISSED', 'FAILED'].includes(status)) {
        sendToUser(otherUserId, SOCKET_EVENTS.CALL_END, dto);
        sendToUser(userId, SOCKET_EVENTS.CALL_END, dto);
      }
    }
  } catch {
    // Graceful fallback
  }

  // If call was missed, create persistent notification for the receiver
  if (status === 'MISSED' && session.receiverId) {
    try {
      await createNotification({
        userId: session.receiverId,
        actorId: session.callerId,
        type: 'CALL_MISSED',
        title: `Missed ${session.type.toLowerCase()} call`,
        body: `${session.caller.fullName} tried to call you`,
        data: {
          callId: session.id,
          callType: session.type,
        },
      });
    } catch {
      // Non-blocking
    }
  }

  return dto;
}

export async function getCallSession(userId: string, callId: string): Promise<CallSessionDto> {
  const session = await prisma.callSession.findUnique({
    where: { id: callId },
    include: {
      caller: { select: { id: true, fullName: true, avatarUrl: true } },
      receiver: { select: { id: true, fullName: true, avatarUrl: true } },
    },
  });

  if (!session) {
    throw new AppError('Call session not found', HTTP_STATUS.NOT_FOUND);
  }

  if (session.callerId !== userId && session.receiverId !== userId) {
    throw new AppError('Unauthorized access to call session', HTTP_STATUS.FORBIDDEN);
  }

  return formatCallSessionDto(session);
}

export function getIceServers(): IceServerConfig[] {
  const servers: IceServerConfig[] = [];

  // STUN servers
  const stunUrls = env.STUN_SERVERS.split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (stunUrls.length > 0) {
    servers.push({
      urls: stunUrls,
    });
  }

  // Optional TURN server
  if (env.TURN_SERVER) {
    servers.push({
      urls: env.TURN_SERVER,
      username: env.TURN_USERNAME,
      credential: env.TURN_CREDENTIAL,
    });
  }

  return servers;
}
