import { prisma } from '../config/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { HTTP_STATUS } from '@peerlume/shared';
import type {
  StudyRoomDto,
  StudyRoomParticipantDto,
  CreateStudyRoomInput,
  UpdateStudyRoomInput,
  AddStudyRoomParticipantInput,
  StudyRoomRole,
  WhiteboardDocumentDto,
} from '@peerlume/shared';
import { checkBlockBetween } from './chat.service.js';
import { whiteboardSyncService } from './whiteboardSync.service.js';

export function formatStudyRoomParticipantDto(p: any): StudyRoomParticipantDto {
  return {
    id: p.id,
    roomId: p.roomId,
    userId: p.userId,
    role: p.role as StudyRoomRole,
    joinedAt: (p.joinedAt ? new Date(p.joinedAt) : new Date()).toISOString(),
    leftAt: p.leftAt ? new Date(p.leftAt).toISOString() : null,
    user: p.user
      ? {
          id: p.user.id,
          fullName: p.user.fullName,
          email: p.user.email,
          avatarUrl: p.user.avatarUrl || null,
        }
      : undefined,
  };
}

export function formatWhiteboardDocumentDto(b: any): WhiteboardDocumentDto {
  return {
    id: b.id,
    roomId: b.roomId,
    title: b.title || 'Main Board',
    elements: (Array.isArray(b.elements) ? b.elements : []) as any,
    version: b.version || 1,
    createdAt: (b.createdAt ? new Date(b.createdAt) : new Date()).toISOString(),
    updatedAt: (b.updatedAt ? new Date(b.updatedAt) : new Date()).toISOString(),
  };
}

export function formatStudyRoomDto(room: any, currentUserId?: string): StudyRoomDto {
  const currentParticipant = currentUserId
    ? room.participants?.find((p: any) => p.userId === currentUserId && !p.leftAt)
    : undefined;

  return {
    id: room.id,
    title: room.title,
    topic: room.topic,
    description: room.description || null,
    sessionId: room.sessionId || null,
    creatorId: room.creatorId,
    isActive: room.isActive,
    endedAt: room.endedAt ? new Date(room.endedAt).toISOString() : null,
    createdAt: (room.createdAt ? new Date(room.createdAt) : new Date()).toISOString(),
    updatedAt: (room.updatedAt ? new Date(room.updatedAt) : new Date()).toISOString(),
    creator: room.creator
      ? {
          id: room.creator.id,
          fullName: room.creator.fullName,
          email: room.creator.email,
          avatarUrl: room.creator.avatarUrl || null,
        }
      : undefined,
    session: room.session
      ? {
          id: room.session.id,
          title: room.session.title,
          topic: room.session.topic,
          startTime: new Date(room.session.startTime).toISOString(),
          endTime: new Date(room.session.endTime).toISOString(),
        }
      : null,
    participants: room.participants?.map(formatStudyRoomParticipantDto),
    whiteboards: room.whiteboards?.map(formatWhiteboardDocumentDto),
  };
}

export async function createStudyRoom(userId: string, input: CreateStudyRoomInput): Promise<StudyRoomDto> {
  const title = input.title?.trim();
  const topic = input.topic?.trim();
  if (!title) {
    throw new AppError('Room title is required', HTTP_STATUS.BAD_REQUEST);
  }
  if (!topic) {
    throw new AppError('Room topic is required', HTTP_STATUS.BAD_REQUEST);
  }

  // If tied to a session, ensure user is a participant or organizer of the session
  if (input.sessionId) {
    const session = await prisma.learningSession.findUnique({
      where: { id: input.sessionId },
      include: { participants: true },
    });

    if (!session) {
      throw new AppError('Referenced learning session not found', HTTP_STATUS.NOT_FOUND);
    }

    const isMember =
      session.organizerId === userId ||
      session.participants.some((p) => p.userId === userId && p.status === 'ACCEPTED');

    if (!isMember) {
      throw new AppError(
        'Unauthorized: You must be a confirmed participant of the learning session to create a room for it',
        HTTP_STATUS.FORBIDDEN
      );
    }
  }

  // Filter invitee list against blocklist
  const validInvitees: string[] = [];
  if (input.inviteeIds && input.inviteeIds.length > 0) {
    for (const inviteeId of input.inviteeIds) {
      if (inviteeId === userId) continue;
      const isBlocked = await checkBlockBetween(userId, inviteeId);
      if (!isBlocked) {
        validInvitees.push(inviteeId);
      }
    }
  }

  // Create room, creator as OWNER, add invitees as EDITORS, and create default WhiteboardDocument
  const room = await prisma.studyRoom.create({
    data: {
      title,
      topic,
      description: input.description?.trim() || null,
      sessionId: input.sessionId || null,
      creatorId: userId,
      participants: {
        create: [
          {
            userId,
            role: 'OWNER',
          },
          ...validInvitees.map((inviteeId) => ({
            userId: inviteeId,
            role: 'EDITOR' as const,
          })),
        ],
      },
      whiteboards: {
        create: {
          title: 'Main Board',
          elements: [],
          version: 1,
        },
      },
    },
    include: {
      creator: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
      session: { select: { id: true, title: true, topic: true, startTime: true, endTime: true } },
      participants: {
        include: {
          user: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
        },
      },
      whiteboards: true,
    },
  });

  return formatStudyRoomDto(room, userId);
}

export async function getStudyRooms(
  userId: string,
  options?: { sessionId?: string; activeOnly?: boolean; page?: number; limit?: number }
): Promise<{ rooms: StudyRoomDto[]; total: number; page: number; limit: number }> {
  const page = Math.max(1, options?.page || 1);
  const limit = Math.min(50, Math.max(1, options?.limit || 20));
  const skip = (page - 1) * limit;

  // Rooms where user is creator OR user is a participant
  const where: any = {
    OR: [
      { creatorId: userId },
      { participants: { some: { userId } } },
    ],
  };

  if (options?.sessionId) {
    where.sessionId = options.sessionId;
  }

  if (options?.activeOnly !== false) {
    where.isActive = true;
  }

  const [total, rooms] = await Promise.all([
    prisma.studyRoom.count({ where }),
    prisma.studyRoom.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updatedAt: 'desc' },
      include: {
        creator: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
        session: { select: { id: true, title: true, topic: true, startTime: true, endTime: true } },
        participants: {
          include: {
            user: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
          },
        },
        whiteboards: true,
      },
    }),
  ]);

  return {
    rooms: rooms.map((r) => formatStudyRoomDto(r, userId)),
    total,
    page,
    limit,
  };
}

export async function getStudyRoomById(userId: string, roomId: string): Promise<StudyRoomDto> {
  const room = await prisma.studyRoom.findUnique({
    where: { id: roomId },
    include: {
      creator: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
      session: { select: { id: true, title: true, topic: true, startTime: true, endTime: true } },
      participants: {
        include: {
          user: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
        },
      },
      whiteboards: true,
    },
  });

  if (!room) {
    throw new AppError('Study room not found', HTTP_STATUS.NOT_FOUND);
  }

  // Check if blocked by creator
  const isBlocked = await checkBlockBetween(userId, room.creatorId);
  if (isBlocked) {
    throw new AppError('Access to this study room is blocked', HTTP_STATUS.FORBIDDEN);
  }

  const isParticipant =
    room.creatorId === userId ||
    room.participants.some((p) => p.userId === userId && !p.leftAt);

  if (!isParticipant) {
    // If room is attached to session, check session membership
    let canAccessViaSession = false;
    if (room.sessionId) {
      const sessionPart = await prisma.sessionParticipant.findFirst({
        where: { sessionId: room.sessionId, userId, status: 'ACCEPTED' },
      });
      canAccessViaSession = Boolean(sessionPart);
    }

    if (!canAccessViaSession) {
      throw new AppError('Unauthorized: You are not a participant in this study room', HTTP_STATUS.FORBIDDEN);
    }
  }

  // Also sync live elements from whiteboardSyncService if available
  const defaultBoard = room.whiteboards?.[0];
  if (defaultBoard) {
    const liveBoard = whiteboardSyncService.getActiveBoard(roomId);
    if (liveBoard) {
      defaultBoard.elements = liveBoard.elements as any;
      defaultBoard.version = liveBoard.version;
    }
  }

  return formatStudyRoomDto(room, userId);
}

export async function updateStudyRoom(
  userId: string,
  roomId: string,
  input: UpdateStudyRoomInput
): Promise<StudyRoomDto> {
  const room = await prisma.studyRoom.findUnique({
    where: { id: roomId },
    include: { participants: true },
  });

  if (!room) {
    throw new AppError('Study room not found', HTTP_STATUS.NOT_FOUND);
  }

  const participant = room.participants.find((p) => p.userId === userId);
  const isOwner = room.creatorId === userId || participant?.role === 'OWNER';
  if (!isOwner) {
    throw new AppError('Unauthorized: Only room owners can update room settings', HTTP_STATUS.FORBIDDEN);
  }

  const updated = await prisma.studyRoom.update({
    where: { id: roomId },
    data: {
      title: input.title?.trim() || undefined,
      topic: input.topic?.trim() || undefined,
      description: input.description !== undefined ? input.description.trim() || null : undefined,
    },
    include: {
      creator: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
      session: { select: { id: true, title: true, topic: true, startTime: true, endTime: true } },
      participants: {
        include: {
          user: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
        },
      },
      whiteboards: true,
    },
  });

  return formatStudyRoomDto(updated, userId);
}

export async function joinStudyRoom(userId: string, roomId: string): Promise<StudyRoomDto> {
  const room = await prisma.studyRoom.findUnique({
    where: { id: roomId },
    include: {
      creator: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
      participants: true,
    },
  });

  if (!room) {
    throw new AppError('Study room not found', HTTP_STATUS.NOT_FOUND);
  }

  if (!room.isActive) {
    throw new AppError('This study room has ended', HTTP_STATUS.BAD_REQUEST);
  }

  const isBlocked = await checkBlockBetween(userId, room.creatorId);
  if (isBlocked) {
    throw new AppError('Cannot join room: Access is blocked', HTTP_STATUS.FORBIDDEN);
  }

  const existing = room.participants.find((p) => p.userId === userId);

  if (existing) {
    // Rejoin: clear leftAt
    await prisma.studyRoomParticipant.update({
      where: { id: existing.id },
      data: { leftAt: null },
    });
  } else {
    // Check eligibility: session participant or friend of creator
    let eligible = room.creatorId === userId;

    if (!eligible && room.sessionId) {
      const sp = await prisma.sessionParticipant.findFirst({
        where: { sessionId: room.sessionId, userId, status: 'ACCEPTED' },
      });
      eligible = Boolean(sp);
    }

    if (!eligible) {
      const friendship = await prisma.friendship.findFirst({
        where: {
          OR: [
            { user1Id: userId, user2Id: room.creatorId },
            { user1Id: room.creatorId, user2Id: userId },
          ],
        },
      });
      eligible = Boolean(friendship);
    }

    if (!eligible) {
      throw new AppError('Unauthorized: You must be invited or connected with the host to join', HTTP_STATUS.FORBIDDEN);
    }

    await prisma.studyRoomParticipant.create({
      data: {
        roomId,
        userId,
        role: 'EDITOR',
      },
    });
  }

  return getStudyRoomById(userId, roomId);
}

export async function leaveStudyRoom(userId: string, roomId: string): Promise<{ success: boolean; message: string }> {
  const participant = await prisma.studyRoomParticipant.findUnique({
    where: { roomId_userId: { roomId, userId } },
  });

  if (!participant) {
    throw new AppError('You are not a participant in this study room', HTTP_STATUS.NOT_FOUND);
  }

  await prisma.studyRoomParticipant.update({
    where: { id: participant.id },
    data: { leftAt: new Date() },
  });

  return { success: true, message: 'Successfully left the study room' };
}

export async function endStudyRoom(userId: string, roomId: string): Promise<{ success: boolean; message: string }> {
  const room = await prisma.studyRoom.findUnique({
    where: { id: roomId },
    include: { participants: true },
  });

  if (!room) {
    throw new AppError('Study room not found', HTTP_STATUS.NOT_FOUND);
  }

  const participant = room.participants.find((p) => p.userId === userId);
  const isOwner = room.creatorId === userId || participant?.role === 'OWNER';

  if (!isOwner) {
    throw new AppError('Unauthorized: Only room owners can end the study room', HTTP_STATUS.FORBIDDEN);
  }

  // Flush any dirty whiteboard state
  await whiteboardSyncService.saveBoardNow(userId, roomId, room.id, 'Room ended auto-save');

  await prisma.studyRoom.update({
    where: { id: roomId },
    data: {
      isActive: false,
      endedAt: new Date(),
    },
  });

  return { success: true, message: 'Study room has ended' };
}

export async function addParticipant(
  userId: string,
  roomId: string,
  input: AddStudyRoomParticipantInput
): Promise<StudyRoomParticipantDto> {
  const room = await prisma.studyRoom.findUnique({
    where: { id: roomId },
    include: { participants: true },
  });

  if (!room) {
    throw new AppError('Study room not found', HTTP_STATUS.NOT_FOUND);
  }

  const requestingPart = room.participants.find((p) => p.userId === userId);
  const isOwner = room.creatorId === userId || requestingPart?.role === 'OWNER';

  if (!isOwner) {
    throw new AppError('Unauthorized: Only room owners can add collaborators', HTTP_STATUS.FORBIDDEN);
  }

  const isBlocked = await checkBlockBetween(userId, input.userId);
  if (isBlocked) {
    throw new AppError('Cannot add user: Block is in effect', HTTP_STATUS.FORBIDDEN);
  }

  const existing = room.participants.find((p) => p.userId === input.userId);
  if (existing) {
    const updated = await prisma.studyRoomParticipant.update({
      where: { id: existing.id },
      data: {
        role: input.role || existing.role,
        leftAt: null,
      },
      include: {
        user: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
      },
    });
    return formatStudyRoomParticipantDto(updated);
  }

  const created = await prisma.studyRoomParticipant.create({
    data: {
      roomId,
      userId: input.userId,
      role: input.role || 'EDITOR',
    },
    include: {
      user: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
    },
  });

  return formatStudyRoomParticipantDto(created);
}

export async function updateParticipantRole(
  userId: string,
  roomId: string,
  targetUserId: string,
  role: StudyRoomRole
): Promise<StudyRoomParticipantDto> {
  const room = await prisma.studyRoom.findUnique({
    where: { id: roomId },
    include: { participants: true },
  });

  if (!room) {
    throw new AppError('Study room not found', HTTP_STATUS.NOT_FOUND);
  }

  const requestingPart = room.participants.find((p) => p.userId === userId);
  const isOwner = room.creatorId === userId || requestingPart?.role === 'OWNER';

  if (!isOwner) {
    throw new AppError('Unauthorized: Only room owners can change roles', HTTP_STATUS.FORBIDDEN);
  }

  const targetPart = room.participants.find((p) => p.userId === targetUserId);
  if (!targetPart) {
    throw new AppError('Target participant not found in this room', HTTP_STATUS.NOT_FOUND);
  }

  const updated = await prisma.studyRoomParticipant.update({
    where: { id: targetPart.id },
    data: { role },
    include: {
      user: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
    },
  });

  return formatStudyRoomParticipantDto(updated);
}

export async function removeParticipant(
  userId: string,
  roomId: string,
  targetUserId: string
): Promise<{ success: boolean; message: string }> {
  const room = await prisma.studyRoom.findUnique({
    where: { id: roomId },
    include: { participants: true },
  });

  if (!room) {
    throw new AppError('Study room not found', HTTP_STATUS.NOT_FOUND);
  }

  const requestingPart = room.participants.find((p) => p.userId === userId);
  const isOwner = room.creatorId === userId || requestingPart?.role === 'OWNER';

  if (!isOwner && userId !== targetUserId) {
    throw new AppError('Unauthorized: Only room owners can remove other participants', HTTP_STATUS.FORBIDDEN);
  }

  await prisma.studyRoomParticipant.delete({
    where: { roomId_userId: { roomId, userId: targetUserId } },
  });

  return { success: true, message: 'Participant removed successfully' };
}
