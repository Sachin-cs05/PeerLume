import { prisma } from '../config/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { HTTP_STATUS } from '@peerlume/shared';
import type {
  CreateSessionInput,
  ProposeRescheduleInput,
  LearningSessionDto,
  SessionParticipantDto,
  RescheduleProposalDto,
  AvailabilityConflict,
  SessionStatus,
} from '@peerlume/shared';
import { checkBlockBetween } from './chat.service.js';
import { createNotification } from './notification.service.js';

export function formatSessionParticipantDto(p: any): SessionParticipantDto {
  return {
    id: p.id,
    userId: p.userId,
    fullName: p.user?.fullName || 'Student',
    avatarUrl: p.user?.avatarUrl || null,
    college: p.user?.profile?.college || null,
    role: p.role,
    status: p.status,
    declinedReason: p.declinedReason || null,
  };
}

export function formatRescheduleProposalDto(r: any): RescheduleProposalDto {
  return {
    id: r.id,
    sessionId: r.sessionId,
    proposerId: r.proposerId,
    proposerName: r.proposer?.fullName || 'Student',
    proposedStartTime: r.proposedStartTime.toISOString(),
    proposedEndTime: r.proposedEndTime.toISOString(),
    proposedTimeZone: r.proposedTimeZone,
    reason: r.reason || null,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
  };
}

export function formatLearningSessionDto(s: any): LearningSessionDto {
  return {
    id: s.id,
    organizerId: s.organizerId,
    organizerName: s.organizer?.fullName || 'Student Organizer',
    organizerAvatar: s.organizer?.avatarUrl || null,
    title: s.title,
    topic: s.topic,
    description: s.description || null,
    objectives: s.objectives || null,
    startTime: s.startTime.toISOString(),
    endTime: s.endTime.toISOString(),
    timeZone: s.timeZone || 'UTC',
    mode: s.mode,
    location: s.location || null,
    meetingUrl: s.meetingUrl || null,
    status: s.status as SessionStatus,
    cancelReason: s.cancelReason || null,
    notes: s.notes || null,
    participants: (s.participants || []).map(formatSessionParticipantDto),
    rescheduleProposals: (s.rescheduleProposals || []).map(formatRescheduleProposalDto),
    resourcesCount: s._count?.resources || s.resources?.length || 0,
    createdAt: (s.createdAt ? new Date(s.createdAt) : new Date()).toISOString(),
    updatedAt: (s.updatedAt ? new Date(s.updatedAt) : new Date()).toISOString(),
  };
}


export async function checkAvailability(
  userId: string,
  startTime: Date,
  endTime: Date,
  excludeSessionId?: string
): Promise<AvailabilityConflict> {
  const overlappingSessions = await prisma.learningSession.findMany({
    where: {
      id: excludeSessionId ? { not: excludeSessionId } : undefined,
      status: { in: ['ACCEPTED', 'PENDING'] },
      OR: [
        { organizerId: userId },
        {
          participants: {
            some: {
              userId,
              status: { in: ['ACCEPTED', 'PENDING'] },
            },
          },
        },
      ],
      AND: [
        { startTime: { lt: endTime } },
        { endTime: { gt: startTime } },
      ],
    },
    select: {
      id: true,
      title: true,
      startTime: true,
      endTime: true,
    },
  });

  return {
    hasConflict: overlappingSessions.length > 0,
    conflictingSessions: overlappingSessions.map((s) => ({
      id: s.id,
      title: s.title,
      startTime: s.startTime.toISOString(),
      endTime: s.endTime.toISOString(),
    })),
  };
}

export async function createSession(
  organizerId: string,
  input: CreateSessionInput
): Promise<LearningSessionDto> {
  const {
    title,
    topic,
    description,
    objectives,
    startTime: startStr,
    endTime: endStr,
    timeZone = 'UTC',
    mode = 'ONLINE',
    location,
    inviteeIds,
    notes,
  } = input;

  if (!title?.trim()) {
    throw new AppError('Session title is required', HTTP_STATUS.BAD_REQUEST);
  }
  if (!topic?.trim()) {
    throw new AppError('Learning topic or subject is required', HTTP_STATUS.BAD_REQUEST);
  }

  const startTime = new Date(startStr);
  const endTime = new Date(endStr);

  if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
    throw new AppError('Invalid session dates provided', HTTP_STATUS.BAD_REQUEST);
  }

  if (startTime >= endTime) {
    throw new AppError('Session end time must be strictly after start time', HTTP_STATUS.BAD_REQUEST);
  }

  if (startTime.getTime() < Date.now() - 5 * 60 * 1000) {
    throw new AppError('Cannot schedule a session in the past', HTTP_STATUS.BAD_REQUEST);
  }

  // Duration checks: minimum 15 mins, maximum 8 hours
  const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
  if (durationMinutes < 15) {
    throw new AppError('Session duration must be at least 15 minutes', HTTP_STATUS.BAD_REQUEST);
  }
  if (durationMinutes > 480) {
    throw new AppError('Session duration cannot exceed 8 hours', HTTP_STATUS.BAD_REQUEST);
  }

  const rawInvitees: string[] = inviteeIds || (input as any).participantIds || [];
  if (rawInvitees.length === 1 && rawInvitees[0] === organizerId) {
    throw new AppError('You cannot invite yourself to a peer learning session', HTTP_STATUS.BAD_REQUEST);
  }

  // Filter out duplicate or self-invitee IDs
  const uniqueInvitees = Array.from(new Set(rawInvitees.filter((id) => id !== organizerId)));
  if (uniqueInvitees.length === 0) {
    throw new AppError('Please select at least one learning partner to invite', HTTP_STATUS.BAD_REQUEST);
  }

  const rawObjectives = objectives || (input as any).learningObjectives;
  const normalizedObjectives = Array.isArray(rawObjectives)
    ? rawObjectives.join(', ')
    : typeof rawObjectives === 'string'
    ? rawObjectives.trim()
    : null;

  // Validate invitees exist and are not blocked
  for (const inviteeId of uniqueInvitees) {
    const isBlocked = await checkBlockBetween(organizerId, inviteeId);
    if (isBlocked) {
      throw new AppError(
        'Cannot invite a student due to privacy settings or active blocks',
        HTTP_STATUS.FORBIDDEN
      );
    }
  }

  const meetingUrl = mode === 'ONLINE' ? `/chat?sessionTopic=${encodeURIComponent(topic)}` : null;

  // Create session and participants in transaction
  const session = await prisma.$transaction(async (tx) => {
    const createdSession = await tx.learningSession.create({
      data: {
        organizerId,
        title: title.trim(),
        topic: topic.trim(),
        description: description?.trim() || null,
        objectives: normalizedObjectives,
        startTime,
        endTime,
        timeZone,
        mode,
        location: mode === 'IN_PERSON' ? location?.trim() || null : null,
        meetingUrl,
        status: 'PENDING',
        notes: notes?.trim() || null,
        participants: {
          create: [
            // Organizer is automatically accepted participant
            {
              userId: organizerId,
              role: 'ORGANIZER',
              status: 'ACCEPTED',
            },
            // Invitees start in PENDING status
            ...uniqueInvitees.map((inviteeId) => ({
              userId: inviteeId,
              role: 'INVITEE' as const,
              status: 'PENDING' as const,
            })),
          ],
        },
      },
      include: {
        organizer: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
                profile: { select: { college: true } },
              },
            },
          },
        },
      },
    });

    return createdSession;
  });

  const dto = formatLearningSessionDto(session);

  // Send persistent notification to each invitee
  for (const inviteeId of uniqueInvitees) {
    try {
      await createNotification({
        userId: inviteeId,
        actorId: organizerId,
        type: 'SESSION_INVITATION_RECEIVED',
        title: 'New Study Session Invitation',
        body: `${dto.organizerName} invited you to study "${dto.title}" (${dto.topic})`,
        data: {
          sessionId: dto.id,
          startTime: dto.startTime,
          topic: dto.topic,
        },
      });
    } catch {
      // Best effort notification
    }
  }

  return dto;
}

export async function getSessionById(userId: string, sessionId: string): Promise<LearningSessionDto> {
  const session = await prisma.learningSession.findUnique({
    where: { id: sessionId },
    include: {
      organizer: {
        select: { id: true, fullName: true, avatarUrl: true },
      },
      participants: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
              profile: { select: { college: true } },
            },
          },
        },
      },
      rescheduleProposals: {
        include: {
          proposer: { select: { id: true, fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
      _count: {
        select: { resources: true },
      },
    },
  });

  if (!session) {
    throw new AppError('Learning session not found', HTTP_STATUS.NOT_FOUND);
  }

  // Authorization: user must be organizer or participant
  const isParticipant =
    session.organizerId === userId || session.participants.some((p) => p.userId === userId);

  if (!isParticipant) {
    throw new AppError('Unauthorized access to this session', HTTP_STATUS.FORBIDDEN);
  }

  return formatLearningSessionDto(session);
}

export async function listSessions(
  userId: string,
  filters: {
    status?: SessionStatus;
    period?: 'upcoming' | 'past';
  } = {}
): Promise<LearningSessionDto[]> {
  const now = new Date();
  const where: any = {
    OR: [
      { organizerId: userId },
      { participants: { some: { userId } } },
    ],
  };

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.period === 'upcoming') {
    where.endTime = { gte: now };
    // Declined or Cancelled sessions should not clutter upcoming active view
    if (!filters.status) {
      where.status = { notIn: ['CANCELLED', 'DECLINED'] };
    }
  } else if (filters.period === 'past') {
    where.endTime = { lt: now };
  }

  const sessions = await prisma.learningSession.findMany({
    where,
    orderBy: {
      startTime: filters.period === 'past' ? 'desc' : 'asc',
    },
    include: {
      organizer: {
        select: { id: true, fullName: true, avatarUrl: true },
      },
      participants: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
              profile: { select: { college: true } },
            },
          },
        },
      },
      rescheduleProposals: {
        include: {
          proposer: { select: { id: true, fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
      _count: {
        select: { resources: true },
      },
    },
  });

  return sessions.map(formatLearningSessionDto);
}

export async function acceptInvitation(userId: string, sessionId: string): Promise<LearningSessionDto> {
  const session = await prisma.learningSession.findUnique({
    where: { id: sessionId },
    include: { participants: true },
  });

  if (!session) {
    throw new AppError('Learning session not found', HTTP_STATUS.NOT_FOUND);
  }

  const participant = session.participants.find((p) => p.userId === userId);
  if (!participant || participant.role === 'ORGANIZER') {
    throw new AppError('You do not have a pending invitation to accept', HTTP_STATUS.FORBIDDEN);
  }

  if (session.status === 'CANCELLED') {
    throw new AppError('Cannot accept a cancelled session', HTTP_STATUS.BAD_REQUEST);
  }

  // Update participant status
  await prisma.sessionParticipant.update({
    where: { id: participant.id },
    data: { status: 'ACCEPTED' },
  });

  // If session was PENDING, promote session status to ACCEPTED
  if (session.status === 'PENDING') {
    await prisma.learningSession.update({
      where: { id: sessionId },
      data: { status: 'ACCEPTED' },
    });
  }

  // Notify organizer
  try {
    const acceptingUser = await prisma.user.findUnique({ where: { id: userId }, select: { fullName: true } });
    await createNotification({
      userId: session.organizerId,
      actorId: userId,
      type: 'SESSION_INVITATION_ACCEPTED',
      title: 'Session Invitation Accepted',
      body: `${acceptingUser?.fullName || 'A student'} accepted your session "${session.title}"`,
      data: { sessionId },
    });
  } catch {
    // Non-blocking
  }

  return getSessionById(userId, sessionId);
}

export async function declineInvitation(
  userId: string,
  sessionId: string,
  reason?: string
): Promise<LearningSessionDto> {
  const session = await prisma.learningSession.findUnique({
    where: { id: sessionId },
    include: { participants: true },
  });

  if (!session) {
    throw new AppError('Learning session not found', HTTP_STATUS.NOT_FOUND);
  }

  const participant = session.participants.find((p) => p.userId === userId);
  if (!participant || participant.role === 'ORGANIZER') {
    throw new AppError('You do not have an invitation to decline', HTTP_STATUS.FORBIDDEN);
  }

  await prisma.sessionParticipant.update({
    where: { id: participant.id },
    data: {
      status: 'DECLINED',
      declinedReason: reason?.trim() || null,
    },
  });

  // Check if all invitees have now declined
  const allInvitees = session.participants.filter((p) => p.role === 'INVITEE');
  const allDeclined = allInvitees.every((p) => p.userId === userId || p.status === 'DECLINED');

  if (allDeclined) {
    await prisma.learningSession.update({
      where: { id: sessionId },
      data: { status: 'DECLINED' },
    });
  }

  // Notify organizer
  try {
    const decliningUser = await prisma.user.findUnique({ where: { id: userId }, select: { fullName: true } });
    await createNotification({
      userId: session.organizerId,
      actorId: userId,
      type: 'SESSION_INVITATION_DECLINED',
      title: 'Session Invitation Declined',
      body: `${decliningUser?.fullName || 'A student'} declined your invitation for "${session.title}"`,
      data: { sessionId },
    });
  } catch {
    // Non-blocking
  }

  return getSessionById(userId, sessionId);
}

export async function proposeReschedule(
  userId: string,
  sessionId: string,
  input: ProposeRescheduleInput
): Promise<RescheduleProposalDto> {
  const session = await prisma.learningSession.findUnique({
    where: { id: sessionId },
    include: { participants: true },
  });

  if (!session) {
    throw new AppError('Learning session not found', HTTP_STATUS.NOT_FOUND);
  }

  const isParticipant =
    session.organizerId === userId || session.participants.some((p) => p.userId === userId);

  if (!isParticipant) {
    throw new AppError('Unauthorized: You are not part of this session', HTTP_STATUS.FORBIDDEN);
  }

  const proposedStart = new Date(input.proposedStartTime);
  const proposedEnd = new Date(input.proposedEndTime);

  if (proposedStart >= proposedEnd) {
    throw new AppError('Proposed start time must be before end time', HTTP_STATUS.BAD_REQUEST);
  }

  if (proposedStart.getTime() < Date.now()) {
    throw new AppError('Proposed reschedule time must be in the future', HTTP_STATUS.BAD_REQUEST);
  }

  const proposal = await prisma.$transaction(async (tx) => {
    // Invalidate any older pending proposals for this session
    await tx.rescheduleProposal.updateMany({
      where: { sessionId, status: 'PENDING' },
      data: { status: 'REJECTED' },
    });

    const newProposal = await tx.rescheduleProposal.create({
      data: {
        sessionId,
        proposerId: userId,
        proposedStartTime: proposedStart,
        proposedEndTime: proposedEnd,
        proposedTimeZone: input.proposedTimeZone || session.timeZone,
        reason: input.reason?.trim() || null,
        status: 'PENDING',
      },
      include: {
        proposer: { select: { id: true, fullName: true } },
      },
    });

    // Mark session status as RESCHEDULE_REQUESTED
    await tx.learningSession.update({
      where: { id: sessionId },
      data: { status: 'RESCHEDULE_REQUESTED' },
    });

    return newProposal;
  });

  // Notify other participants
  const recipients = [
    session.organizerId,
    ...session.participants.map((p) => p.userId),
  ].filter((id) => id !== userId);

  for (const recipientId of recipients) {
    try {
      await createNotification({
        userId: recipientId,
        actorId: userId,
        type: 'SESSION_RESCHEDULE_PROPOSED',
        title: 'Session Reschedule Proposed',
        body: `A new time was proposed for "${session.title}"`,
        data: {
          sessionId,
          proposalId: proposal.id,
        },
      });
    } catch {
      // Non-blocking
    }
  }

  return formatRescheduleProposalDto(proposal);
}

export async function respondToReschedule(
  userId: string,
  sessionId: string,
  proposalId: string,
  accept: boolean
): Promise<LearningSessionDto> {
  const proposal = await prisma.rescheduleProposal.findUnique({
    where: { id: proposalId },
    include: {
      session: {
        include: { participants: true },
      },
    },
  });

  if (!proposal || proposal.sessionId !== sessionId) {
    throw new AppError('Reschedule proposal not found', HTTP_STATUS.NOT_FOUND);
  }

  if (proposal.status !== 'PENDING') {
    throw new AppError('This proposal has already been resolved', HTTP_STATUS.BAD_REQUEST);
  }

  if (proposal.proposerId === userId) {
    throw new AppError('You cannot vote on your own reschedule proposal', HTTP_STATUS.BAD_REQUEST);
  }

  const isAuthorized =
    proposal.session.organizerId === userId ||
    proposal.session.participants.some((p) => p.userId === userId);

  if (!isAuthorized) {
    throw new AppError('Unauthorized to resolve this proposal', HTTP_STATUS.FORBIDDEN);
  }

  await prisma.$transaction(async (tx) => {
    if (accept) {
      // Apply new schedule to session
      await tx.rescheduleProposal.update({
        where: { id: proposalId },
        data: { status: 'ACCEPTED' },
      });

      await tx.learningSession.update({
        where: { id: sessionId },
        data: {
          startTime: proposal.proposedStartTime,
          endTime: proposal.proposedEndTime,
          timeZone: proposal.proposedTimeZone,
          status: 'ACCEPTED',
        },
      });
    } else {
      await tx.rescheduleProposal.update({
        where: { id: proposalId },
        data: { status: 'REJECTED' },
      });

      await tx.learningSession.update({
        where: { id: sessionId },
        data: { status: 'ACCEPTED' },
      });
    }
  });

  // Notify participants of decision
  const participants = [
    proposal.session.organizerId,
    ...proposal.session.participants.map((p) => p.userId),
  ].filter((id) => id !== userId);

  for (const pId of participants) {
    try {
      await createNotification({
        userId: pId,
        actorId: userId,
        type: 'SESSION_RESCHEDULE_RESOLVED',
        title: accept ? 'Reschedule Accepted' : 'Reschedule Declined',
        body: `The proposed reschedule for "${proposal.session.title}" was ${accept ? 'accepted' : 'declined'}`,
        data: { sessionId },
      });
    } catch {
      // Non-blocking
    }
  }

  return getSessionById(userId, sessionId);
}

export async function cancelSession(
  userId: string,
  sessionId: string,
  reason?: string
): Promise<LearningSessionDto> {
  const session = await prisma.learningSession.findUnique({
    where: { id: sessionId },
    include: { participants: true },
  });

  if (!session) {
    throw new AppError('Learning session not found', HTTP_STATUS.NOT_FOUND);
  }

  const isOrganizer = session.organizerId === userId;
  const isParticipant = session.participants.some((p) => p.userId === userId);

  if (!isOrganizer && !isParticipant) {
    throw new AppError('Unauthorized: You cannot cancel this session', HTTP_STATUS.FORBIDDEN);
  }

  await prisma.learningSession.update({
    where: { id: sessionId },
    data: {
      status: 'CANCELLED',
      cancelReason: reason?.trim() || 'Cancelled by participant',
    },
  });

  // Notify other members
  const others = [
    session.organizerId,
    ...session.participants.map((p) => p.userId),
  ].filter((id) => id !== userId);

  for (const otherId of others) {
    try {
      await createNotification({
        userId: otherId,
        actorId: userId,
        type: 'SESSION_CANCELLED',
        title: 'Study Session Cancelled',
        body: `"${session.title}" was cancelled: ${reason || 'No reason provided'}`,
        data: { sessionId },
      });
    } catch {
      // Non-blocking
    }
  }

  return getSessionById(userId, sessionId);
}

export async function completeSession(
  userId: string,
  sessionId: string
): Promise<LearningSessionDto> {
  const session = await prisma.learningSession.findUnique({
    where: { id: sessionId },
    include: { participants: true },
  });

  if (!session) {
    throw new AppError('Learning session not found', HTTP_STATUS.NOT_FOUND);
  }

  const isMember =
    session.organizerId === userId || session.participants.some((p) => p.userId === userId);

  if (!isMember) {
    throw new AppError('Unauthorized: You cannot complete this session', HTTP_STATUS.FORBIDDEN);
  }

  await prisma.learningSession.update({
    where: { id: sessionId },
    data: { status: 'COMPLETED' },
  });

  return getSessionById(userId, sessionId);
}

export async function getCalendarSessions(
  userId: string,
  month: number,
  year: number
): Promise<LearningSessionDto[]> {
  // Calendar month boundary in UTC
  const startOfMonth = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
  const endOfMonth = new Date(Date.UTC(year, month, 1, 0, 0, 0));

  const sessions = await prisma.learningSession.findMany({
    where: {
      status: { not: 'CANCELLED' },
      OR: [
        { organizerId: userId },
        { participants: { some: { userId } } },
      ],
      startTime: { gte: startOfMonth, lt: endOfMonth },
    },
    include: {
      organizer: { select: { id: true, fullName: true, avatarUrl: true } },
      participants: {
        include: {
          user: {
            select: { id: true, fullName: true, avatarUrl: true, profile: { select: { college: true } } },
          },
        },
      },
    },
    orderBy: { startTime: 'asc' },
  });

  return sessions.map(formatLearningSessionDto);
}
