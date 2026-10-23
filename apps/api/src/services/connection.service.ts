import { prisma } from '../config/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { HTTP_STATUS } from '@peerlume/shared';
import { createNotification } from './notification.service.js';

import type {
  ConnectionStatus,
  FriendRequestDto,
  FriendConnectionDto,
  UserBlockDto,
  SavedPartnerDto,
  StudentSearchItem,
  PreferredLearningMode,
  ProfileVisibility,
  SkillProficiency,
  GoalPriority,
} from '@peerlume/shared';

export function getCanonicalPair(idA: string, idB: string): [string, string] {
  return idA < idB ? [idA, idB] : [idB, idA];
}

interface RawStudentWithProfile {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  profile: {
    college: string;
    degree: string;
    branch: string;
    semester: string;
    bio: string | null;
    languages: string[];
    preferredLearningMode: string;
    visibility: string;
    teachingSkills: {
      proficiency: string;
      skill: { name: string };
    }[];
    learningGoals: {
      priority: string;
      skill: { name: string };
    }[];
  } | null;
}

export function formatStudentSearchItem(
  user: RawStudentWithProfile,
  status: ConnectionStatus = 'NONE',
  connectionRequestId?: string,
  connectionId?: string
): StudentSearchItem {
  return {
    id: user.id,
    fullName: user.fullName,
    avatarUrl: user.avatarUrl,
    college: user.profile?.college || 'Unknown College',
    degree: user.profile?.degree || 'Unknown Degree',
    branch: user.profile?.branch || 'Unknown Branch',
    semester: user.profile?.semester || '1st Sem',
    bio: user.profile?.bio,
    languages: user.profile?.languages || ['English'],
    preferredLearningMode: (user.profile?.preferredLearningMode as PreferredLearningMode) || 'HYBRID',
    visibility: (user.profile?.visibility as ProfileVisibility) || 'PUBLIC',
    teachingSkills: (user.profile?.teachingSkills || []).map((ts) => ({
      name: ts.skill.name,
      proficiency: ts.proficiency as SkillProficiency,
    })),
    learningGoals: (user.profile?.learningGoals || []).map((lg) => ({
      name: lg.skill.name,
      priority: lg.priority as GoalPriority,
    })),
    connectionStatus: status,
    connectionRequestId,
    connectionId,
  };
}

export async function getConnectionStatusBetween(
  currentUserId: string,
  targetUserId: string
): Promise<{ status: ConnectionStatus; connectionRequestId?: string; connectionId?: string }> {
  if (currentUserId === targetUserId) {
    return { status: 'NONE' };
  }

  // Check blocks in either direction
  const block = await prisma.userBlock.findFirst({
    where: {
      OR: [
        { blockerId: currentUserId, blockedId: targetUserId },
        { blockerId: targetUserId, blockedId: currentUserId },
      ],
    },
  });
  if (block) {
    return { status: 'BLOCKED' };
  }

  // Check friendship (canonical pair)
  const [u1, u2] = getCanonicalPair(currentUserId, targetUserId);
  const friendship = await prisma.friendship.findUnique({
    where: { user1Id_user2Id: { user1Id: u1, user2Id: u2 } },
  });
  if (friendship) {
    return { status: 'FRIENDS', connectionId: friendship.id };
  }

  // Check requests
  const outgoing = await prisma.friendRequest.findUnique({
    where: { senderId_receiverId: { senderId: currentUserId, receiverId: targetUserId } },
  });
  if (outgoing && outgoing.status === 'PENDING') {
    return { status: 'REQUEST_SENT', connectionRequestId: outgoing.id };
  }

  const incoming = await prisma.friendRequest.findUnique({
    where: { senderId_receiverId: { senderId: targetUserId, receiverId: currentUserId } },
  });
  if (incoming && incoming.status === 'PENDING') {
    return { status: 'REQUEST_RECEIVED', connectionRequestId: incoming.id };
  }

  return { status: 'NONE' };
}

export async function sendFriendRequest(
  senderId: string,
  receiverId: string,
  _message?: string
): Promise<{ status: ConnectionStatus; message: string; connectionRequestId?: string }> {
  if (senderId === receiverId) {
    throw new AppError('You cannot send a connection request to yourself', HTTP_STATUS.BAD_REQUEST);
  }

  // Check target user exists
  const receiver = await prisma.user.findUnique({
    where: { id: receiverId },
  });
  if (!receiver) {
    throw new AppError('Target student not found', HTTP_STATUS.NOT_FOUND);
  }

  // Check block
  const isBlocked = await prisma.userBlock.findFirst({
    where: {
      OR: [
        { blockerId: senderId, blockedId: receiverId },
        { blockerId: receiverId, blockedId: senderId },
      ],
    },
  });
  if (isBlocked) {
    throw new AppError('Cannot send request to this student', HTTP_STATUS.FORBIDDEN, 'USER_BLOCKED');
  }

  // Check already friends
  const [u1, u2] = getCanonicalPair(senderId, receiverId);
  const existingFriendship = await prisma.friendship.findUnique({
    where: { user1Id_user2Id: { user1Id: u1, user2Id: u2 } },
  });
  if (existingFriendship) {
    throw new AppError('You are already connected with this student', HTTP_STATUS.BAD_REQUEST);
  }

  // Check opposite-direction request: If B already sent request to A, treat A's request as ACCEPTING it!
  const reverseRequest = await prisma.friendRequest.findUnique({
    where: { senderId_receiverId: { senderId: receiverId, receiverId: senderId } },
  });

  if (reverseRequest && reverseRequest.status === 'PENDING') {
    await prisma.$transaction([
      prisma.friendRequest.update({
        where: { id: reverseRequest.id },
        data: { status: 'ACCEPTED' },
      }),
      prisma.friendship.create({
        data: { user1Id: u1, user2Id: u2 },
      }),
    ]);
    return {
      status: 'FRIENDS',
      message: 'Mutual connection request detected. You are now learning partners!',
    };
  }

  // Check existing direct request
  const directRequest = await prisma.friendRequest.findUnique({
    where: { senderId_receiverId: { senderId, receiverId } },
  });

  if (directRequest) {
    if (directRequest.status === 'PENDING') {
      throw new AppError('A connection request is already pending with this student', HTTP_STATUS.BAD_REQUEST);
    }
    // Re-open declined request
    const updated = await prisma.friendRequest.update({
      where: { id: directRequest.id },
      data: { status: 'PENDING' },
    });
    return {
      status: 'REQUEST_SENT',
      connectionRequestId: updated.id,
      message: 'Connection request sent successfully',
    };
  }

  // Create new request
  const newRequest = await prisma.friendRequest.create({
    data: {
      senderId,
      receiverId,
      status: 'PENDING',
    },
  });

  try {
    const sender = await prisma.user.findUnique({ where: { id: senderId }, select: { fullName: true } });
    await createNotification({
      userId: receiverId,
      actorId: senderId,
      type: 'FRIEND_REQUEST_RECEIVED',
      title: 'New Connection Request',
      body: `${sender?.fullName || 'A student'} sent you a connection request`,
      data: { requestId: newRequest.id },
    });
  } catch {
    // Non-blocking notification
  }

  return {
    status: 'REQUEST_SENT',
    connectionRequestId: newRequest.id,
    message: 'Connection request sent successfully',
  };
}

export async function getIncomingRequests(userId: string): Promise<FriendRequestDto[]> {
  const requests = await prisma.friendRequest.findMany({
    where: { receiverId: userId, status: 'PENDING' },
    include: {
      sender: {
        include: {
          profile: {
            include: {
              teachingSkills: { include: { skill: true } },
              learningGoals: { include: { skill: true } },
            },
          },
        },
      },
      receiver: {
        include: {
          profile: {
            include: {
              teachingSkills: { include: { skill: true } },
              learningGoals: { include: { skill: true } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return requests.map((req) => ({
    id: req.id,
    senderId: req.senderId,
    receiverId: req.receiverId,
    status: req.status,
    sender: formatStudentSearchItem(req.sender as unknown as RawStudentWithProfile, 'REQUEST_RECEIVED', req.id),
    receiver: formatStudentSearchItem(req.receiver as unknown as RawStudentWithProfile),
    createdAt: req.createdAt.toISOString(),
  }));
}

export async function getOutgoingRequests(userId: string): Promise<FriendRequestDto[]> {
  const requests = await prisma.friendRequest.findMany({
    where: { senderId: userId, status: 'PENDING' },
    include: {
      sender: {
        include: {
          profile: {
            include: {
              teachingSkills: { include: { skill: true } },
              learningGoals: { include: { skill: true } },
            },
          },
        },
      },
      receiver: {
        include: {
          profile: {
            include: {
              teachingSkills: { include: { skill: true } },
              learningGoals: { include: { skill: true } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return requests.map((req) => ({
    id: req.id,
    senderId: req.senderId,
    receiverId: req.receiverId,
    status: req.status,
    sender: formatStudentSearchItem(req.sender as unknown as RawStudentWithProfile),
    receiver: formatStudentSearchItem(req.receiver as unknown as RawStudentWithProfile, 'REQUEST_SENT', req.id),
    createdAt: req.createdAt.toISOString(),
  }));
}

export async function acceptFriendRequest(requestId: string, userId: string): Promise<void> {
  const request = await prisma.friendRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    throw new AppError('Connection request not found', HTTP_STATUS.NOT_FOUND);
  }

  if (request.receiverId !== userId) {
    throw new AppError('You are not authorized to accept this request', HTTP_STATUS.FORBIDDEN);
  }

  if (request.status !== 'PENDING') {
    throw new AppError('This request has already been resolved', HTTP_STATUS.BAD_REQUEST);
  }

  const [u1, u2] = getCanonicalPair(request.senderId, request.receiverId);

  await prisma.$transaction([
    prisma.friendRequest.update({
      where: { id: requestId },
      data: { status: 'ACCEPTED' },
    }),
    prisma.friendship.upsert({
      where: { user1Id_user2Id: { user1Id: u1, user2Id: u2 } },
      create: { user1Id: u1, user2Id: u2 },
      update: {},
    }),
  ]);

  try {
    const accepter = await prisma.user.findUnique({ where: { id: userId }, select: { fullName: true } });
    await createNotification({
      userId: request.senderId,
      actorId: userId,
      type: 'FRIEND_REQUEST_ACCEPTED',
      title: 'Connection Request Accepted',
      body: `${accepter?.fullName || 'A student'} accepted your connection request`,
      data: { friendId: userId },
    });
  } catch {
    // Non-blocking notification
  }
}


export async function declineFriendRequest(requestId: string, userId: string): Promise<void> {
  const request = await prisma.friendRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    throw new AppError('Connection request not found', HTTP_STATUS.NOT_FOUND);
  }

  if (request.receiverId !== userId) {
    throw new AppError('You are not authorized to decline this request', HTTP_STATUS.FORBIDDEN);
  }

  if (request.status !== 'PENDING') {
    throw new AppError('This request has already been resolved', HTTP_STATUS.BAD_REQUEST);
  }

  await prisma.friendRequest.update({
    where: { id: requestId },
    data: { status: 'DECLINED' },
  });
}

export async function cancelFriendRequest(requestId: string, userId: string): Promise<void> {
  const request = await prisma.friendRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    throw new AppError('Connection request not found', HTTP_STATUS.NOT_FOUND);
  }

  if (request.senderId !== userId) {
    throw new AppError('You can only cancel requests you originated', HTTP_STATUS.FORBIDDEN);
  }

  await prisma.friendRequest.delete({
    where: { id: requestId },
  });
}

export async function getFriends(userId: string, search?: string): Promise<FriendConnectionDto[]> {
  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [{ user1Id: userId }, { user2Id: userId }],
    },
    include: {
      user1: {
        include: {
          profile: {
            include: {
              teachingSkills: { include: { skill: true } },
              learningGoals: { include: { skill: true } },
            },
          },
        },
      },
      user2: {
        include: {
          profile: {
            include: {
              teachingSkills: { include: { skill: true } },
              learningGoals: { include: { skill: true } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Map to the other user
  const results: FriendConnectionDto[] = [];
  for (const f of friendships) {
    const otherUser = f.user1Id === userId ? f.user2 : f.user1;
    // Search query filter
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      const matchName = otherUser.fullName.toLowerCase().includes(q);
      const matchCollege = otherUser.profile?.college.toLowerCase().includes(q);
      const matchBranch = otherUser.profile?.branch.toLowerCase().includes(q);
      if (!matchName && !matchCollege && !matchBranch) {
        continue;
      }
    }

    results.push({
      id: f.id,
      friendId: otherUser.id,
      student: formatStudentSearchItem(otherUser as unknown as RawStudentWithProfile, 'FRIENDS', undefined, f.id),
      connectedAt: f.createdAt.toISOString(),
    });
  }

  return results;
}

export async function removeFriend(connectionId: string, userId: string): Promise<void> {
  const friendship = await prisma.friendship.findUnique({
    where: { id: connectionId },
  });

  if (!friendship) {
    throw new AppError('Connection not found', HTTP_STATUS.NOT_FOUND);
  }

  if (friendship.user1Id !== userId && friendship.user2Id !== userId) {
    throw new AppError('You are not authorized to remove this connection', HTTP_STATUS.FORBIDDEN);
  }

  const otherId = friendship.user1Id === userId ? friendship.user2Id : friendship.user1Id;

  await prisma.$transaction([
    prisma.friendship.delete({
      where: { id: connectionId },
    }),
    // Clean up past friend requests so they can re-request cleanly
    prisma.friendRequest.deleteMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherId },
          { senderId: otherId, receiverId: userId },
        ],
      },
    }),
  ]);
}

export async function blockStudent(
  blockerId: string,
  blockedId: string,
  _reason?: string
): Promise<void> {
  if (blockerId === blockedId) {
    throw new AppError('You cannot block yourself', HTTP_STATUS.BAD_REQUEST);
  }

  const [u1, u2] = getCanonicalPair(blockerId, blockedId);

  await prisma.$transaction([
    prisma.userBlock.upsert({
      where: { blockerId_blockedId: { blockerId, blockedId } },
      create: { blockerId, blockedId },
      update: {},
    }),
    // Invalidate friendship
    prisma.friendship.deleteMany({
      where: { user1Id: u1, user2Id: u2 },
    }),
    // Invalidate any pending or existing friend requests
    prisma.friendRequest.deleteMany({
      where: {
        OR: [
          { senderId: blockerId, receiverId: blockedId },
          { senderId: blockedId, receiverId: blockerId },
        ],
      },
    }),
    // Remove saved partner records
    prisma.savedPartner.deleteMany({
      where: {
        OR: [
          { userId: blockerId, savedStudentId: blockedId },
          { userId: blockedId, savedStudentId: blockerId },
        ],
      },
    }),
  ]);
}

export async function unblockStudent(blockerId: string, blockedId: string): Promise<void> {
  const block = await prisma.userBlock.findUnique({
    where: { blockerId_blockedId: { blockerId, blockedId } },
  });

  if (!block) {
    throw new AppError('Block record not found', HTTP_STATUS.NOT_FOUND);
  }

  await prisma.userBlock.delete({
    where: { blockerId_blockedId: { blockerId, blockedId } },
  });
}

export async function getBlockedStudents(userId: string): Promise<UserBlockDto[]> {
  const blocks = await prisma.userBlock.findMany({
    where: { blockerId: userId },
    include: {
      blocked: {
        include: { profile: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return blocks.map((b) => ({
    id: b.id,
    blockedId: b.blockedId,
    blockedStudent: {
      id: b.blocked.id,
      fullName: b.blocked.fullName,
      avatarUrl: b.blocked.avatarUrl,
      college: b.blocked.profile?.college,
    },
    createdAt: b.createdAt.toISOString(),
  }));
}

export async function savePartner(
  userId: string,
  savedStudentId: string,
  notes?: string
): Promise<void> {
  if (userId === savedStudentId) {
    throw new AppError('You cannot save yourself as a learning partner', HTTP_STATUS.BAD_REQUEST);
  }

  // Ensure target exists
  const target = await prisma.user.findUnique({ where: { id: savedStudentId } });
  if (!target) {
    throw new AppError('Student not found', HTTP_STATUS.NOT_FOUND);
  }

  // Check block
  const isBlocked = await prisma.userBlock.findFirst({
    where: {
      OR: [
        { blockerId: userId, blockedId: savedStudentId },
        { blockerId: savedStudentId, blockedId: userId },
      ],
    },
  });
  if (isBlocked) {
    throw new AppError('Cannot save this student', HTTP_STATUS.FORBIDDEN, 'USER_BLOCKED');
  }

  await prisma.savedPartner.upsert({
    where: { userId_savedStudentId: { userId, savedStudentId } },
    create: { userId, savedStudentId, notes },
    update: { notes },
  });
}

export async function removeSavedPartner(userId: string, savedStudentId: string): Promise<void> {
  await prisma.savedPartner.deleteMany({
    where: { userId, savedStudentId },
  });
}

export async function getSavedPartners(userId: string): Promise<SavedPartnerDto[]> {
  const saved = await prisma.savedPartner.findMany({
    where: { userId },
    include: {
      savedStudent: {
        include: {
          profile: {
            include: {
              teachingSkills: { include: { skill: true } },
              learningGoals: { include: { skill: true } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const results: SavedPartnerDto[] = [];
  for (const s of saved) {
    const status = await getConnectionStatusBetween(userId, s.savedStudent.id);
    results.push({
      id: s.id,
      savedStudentId: s.savedStudent.id,
      student: formatStudentSearchItem(
        s.savedStudent as unknown as RawStudentWithProfile,
        status.status,
        status.connectionRequestId,
        status.connectionId
      ),
      notes: s.notes,
      createdAt: s.createdAt.toISOString(),
    });
  }

  return results;
}
