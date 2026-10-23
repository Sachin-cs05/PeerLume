import { prisma } from '../config/prisma.js';
import type { DashboardSummaryDto, ActivityItemDto } from '@peerlume/shared';
import { formatLearningSessionDto } from './session.service.js';
import { formatLearningResourceDto } from './resource.service.js';

export async function getDashboardSummary(userId: string): Promise<DashboardSummaryDto> {
  const now = new Date();

  const [
    userWithCounts,
    upcomingSessionsRaw,
    pendingInvitationsRaw,
    completedSessionsRaw,
    recentResourcesRaw,
    sharedResourcesCount,
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          include: {
            _count: {
              select: {
                teachingSkills: true,
                learningGoals: true,
              },
            },
          },
        },
      },
    }),

    // Upcoming sessions (ACCEPTED or PENDING organized by user)
    prisma.learningSession.findMany({
      where: {
        endTime: { gte: now },
        status: { in: ['ACCEPTED', 'PENDING'] },
        OR: [
          { organizerId: userId },
          {
            participants: {
              some: {
                userId,
                status: 'ACCEPTED',
              },
            },
          },
        ],
      },
      take: 5,
      orderBy: { startTime: 'asc' },
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
    }),

    // Pending session invitations where user is an invitee
    prisma.learningSession.findMany({
      where: {
        endTime: { gte: now },
        status: 'PENDING',
        participants: {
          some: {
            userId,
            role: 'INVITEE',
            status: 'PENDING',
          },
        },
      },
      take: 5,
      orderBy: { startTime: 'asc' },
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
    }),

    // Completed sessions for calculating study hours
    prisma.learningSession.findMany({
      where: {
        status: 'COMPLETED',
        OR: [
          { organizerId: userId },
          { participants: { some: { userId, status: 'ACCEPTED' } } },
        ],
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        title: true,
        updatedAt: true,
      },
    }),

    // Recent resources shared with or created by user
    prisma.learningResource.findMany({
      where: {
        OR: [
          { creatorId: userId },
          { targetUserId: userId },
          {
            session: {
              OR: [
                { organizerId: userId },
                { participants: { some: { userId } } },
              ],
            },
          },
        ],
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        creator: { select: { id: true, fullName: true, avatarUrl: true } },
        session: { select: { id: true, title: true } },
      },
    }),

    // Total resources count
    prisma.learningResource.count({
      where: {
        OR: [{ creatorId: userId }, { targetUserId: userId }],
      },
    }),
  ]);

  // Calculate actual total study hours from completed sessions
  let totalStudyMinutes = 0;
  for (const session of completedSessionsRaw) {
    const duration = (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60);
    if (duration > 0) {
      totalStudyMinutes += duration;
    }
  }
  const totalStudyHours = Math.round((totalStudyMinutes / 60) * 10) / 10;

  // Build real recent activity list
  const recentActivity: ActivityItemDto[] = [];

  // Completed sessions activity
  for (const s of completedSessionsRaw.slice(0, 3)) {
    recentActivity.push({
      id: `act-sess-${s.id}`,
      type: 'SESSION',
      title: `Completed study session "${s.title}"`,
      description: 'Peer learning session completed successfully.',
      timestamp: s.updatedAt.toISOString(),
    });
  }

  // Resources activity
  for (const r of recentResourcesRaw.slice(0, 3)) {
    recentActivity.push({
      id: `act-res-${r.id}`,
      type: 'RESOURCE',
      title: `Added ${r.type.toLowerCase()}: "${r.title}"`,
      description: r.session ? `Shared in session "${r.session.title}"` : 'Personal study workspace item',
      timestamp: r.createdAt.toISOString(),
    });
  }

  // Sort activity by timestamp desc
  recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return {
    upcomingSessionsCount: upcomingSessionsRaw.length,
    pendingInvitationsCount: pendingInvitationsRaw.length,
    completedSessionsCount: completedSessionsRaw.length,
    totalStudyHours,
    learningGoalsCount: userWithCounts?.profile?._count.learningGoals || 0,
    teachingSkillsCount: userWithCounts?.profile?._count.teachingSkills || 0,
    sharedResourcesCount,
    recentActivity,
    upcomingSessions: upcomingSessionsRaw.map(formatLearningSessionDto),
    pendingInvitations: pendingInvitationsRaw.map(formatLearningSessionDto),
    recentResources: recentResourcesRaw.map(formatLearningResourceDto),
  };
}
