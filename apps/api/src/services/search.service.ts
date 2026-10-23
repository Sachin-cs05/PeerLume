import { prisma } from '../config/prisma.js';
import type {
  GlobalSearchResponse,
  SearchResultItem,
  SearchEntityType,
} from '@peerlume/shared';

export async function performGlobalSearch(
  userId: string,
  rawQuery: string,
  type: SearchEntityType = 'all',
  limit: number = 20
): Promise<GlobalSearchResponse> {
  const query = rawQuery ? rawQuery.trim() : '';
  const emptyResponse: GlobalSearchResponse = {
    query,
    total: 0,
    results: [],
    categories: {
      students: [],
      friends: [],
      sessions: [],
      resources: [],
      workspaces: [],
      study_rooms: [],
    },
  };

  if (!query || query.length < 1) {
    return emptyResponse;
  }

  const safeLimit = Math.min(50, Math.max(1, limit));

  // Find all users blocked by or who blocked the current user
  const blocks = await prisma.userBlock.findMany({
    where: {
      OR: [{ blockerId: userId }, { blockedId: userId }],
    },
    select: { blockerId: true, blockedId: true },
  });

  const blockedUserIds = new Set<string>();
  for (const b of blocks) {
    if (b.blockerId === userId) blockedUserIds.add(b.blockedId);
    if (b.blockedId === userId) blockedUserIds.add(b.blockerId);
  }

  // 1. Friends (Accepted connections)
  const shouldSearchFriends = type === 'all' || type === 'friends';
  let friendResults: SearchResultItem[] = [];
  if (shouldSearchFriends) {
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      include: {
        user1: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
        user2: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
      },
    });

    const matchedFriends = friendships
      .map((f) => (f.user1Id === userId ? f.user2 : f.user1))
      .filter(
        (f) =>
          !blockedUserIds.has(f.id) &&
          (f.fullName.toLowerCase().includes(query.toLowerCase()) ||
            f.email.toLowerCase().includes(query.toLowerCase()))
      )
      .slice(0, safeLimit);

    friendResults = matchedFriends.map((f) => ({
      id: f.id,
      type: 'friend',
      title: f.fullName,
      subtitle: f.email,
      metadata: { avatarUrl: f.avatarUrl },
      url: `/profile/${f.id}`,
    }));
  }

  // 2. Discoverable Students (Public profile or campus match, excluding blocked & self)
  const shouldSearchStudents = type === 'all' || type === 'students';
  let studentResults: SearchResultItem[] = [];
  if (shouldSearchStudents) {
    const students = await prisma.studentProfile.findMany({
      where: {
        userId: { notIn: [userId, ...Array.from(blockedUserIds)] },
        visibility: { not: 'CONNECTIONS_ONLY' },
        OR: [
          { user: { fullName: { contains: query, mode: 'insensitive' } } },
          { college: { contains: query, mode: 'insensitive' } },
          { branch: { contains: query, mode: 'insensitive' } },
          {
            teachingSkills: {
              some: {
                skill: { name: { contains: query, mode: 'insensitive' } },
              },
            },
          },
        ],
      },
      take: safeLimit,
      include: {
        user: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
        teachingSkills: { include: { skill: true } },
      },
    });

    studentResults = students.map((s) => ({
      id: s.userId,
      type: 'student',
      title: s.user.fullName,
      subtitle: `${s.branch} · ${s.college}`,
      metadata: {
        avatarUrl: s.user.avatarUrl,
        skills: s.teachingSkills.map((ts) => ts.skill.name),
      },
      url: `/profile/${s.userId}`,
    }));
  }

  // 3. Learning Sessions (Where user is organizer or participant)
  const shouldSearchSessions = type === 'all' || type === 'sessions';
  let sessionResults: SearchResultItem[] = [];
  if (shouldSearchSessions) {
    const sessions = await prisma.learningSession.findMany({
      where: {
        OR: [{ organizerId: userId }, { participants: { some: { userId } } }],
        AND: [
          {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { topic: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
            ],
          },
        ],
      },
      take: safeLimit,
      orderBy: { startTime: 'desc' },
      select: {
        id: true,
        title: true,
        topic: true,
        status: true,
        startTime: true,
        endTime: true,
      },
    });

    sessionResults = sessions.map((s) => ({
      id: s.id,
      type: 'session',
      title: s.title,
      subtitle: `${s.topic} · ${s.status}`,
      metadata: {
        startTime: s.startTime.toISOString(),
        endTime: s.endTime.toISOString(),
      },
      url: `/sessions/${s.id}`,
    }));
  }

  // 4. Learning Resources (Created by user, shared directly, or in sessions the user attends)
  const shouldSearchResources = type === 'all' || type === 'resources';
  let resourceResults: SearchResultItem[] = [];
  if (shouldSearchResources) {
    const resources = await prisma.learningResource.findMany({
      where: {
        OR: [
          { creatorId: userId },
          { targetUserId: userId },
          {
            session: {
              OR: [{ organizerId: userId }, { participants: { some: { userId } } }],
            },
          },
        ],
        AND: [
          {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
            ],
          },
        ],
      },
      take: safeLimit,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        type: true,
        mimeType: true,
        fileName: true,
      },
    });

    resourceResults = resources.map((r) => ({
      id: r.id,
      type: 'resource',
      title: r.title,
      subtitle: `${r.type}${r.fileName ? ` (${r.fileName})` : ''}`,
      metadata: { type: r.type, mimeType: r.mimeType },
      url: `/resources/${r.id}`,
    }));
  }

  // 5. Code Workspaces (Created by user or where participant)
  const shouldSearchWorkspaces = type === 'all' || type === 'workspaces';
  let workspaceResults: SearchResultItem[] = [];
  if (shouldSearchWorkspaces) {
    const workspaces = await prisma.codeWorkspace.findMany({
      where: {
        OR: [{ creatorId: userId }, { participants: { some: { userId } } }],
        AND: [
          {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
            ],
          },
        ],
      },
      take: safeLimit,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
      },
    });

    workspaceResults = workspaces.map((w) => ({
      id: w.id,
      type: 'workspace',
      title: w.title,
      subtitle: w.description || 'Collaborative Code Workspace',
      metadata: {},
      url: `/code/${w.id}`,
    }));
  }

  // 6. Study Rooms (Created by user or where participant)
  const shouldSearchStudyRooms = type === 'all' || type === 'study_rooms';
  let studyRoomResults: SearchResultItem[] = [];
  if (shouldSearchStudyRooms) {
    const studyRooms = await prisma.studyRoom.findMany({
      where: {
        OR: [{ creatorId: userId }, { participants: { some: { userId } } }],
        AND: [
          {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { topic: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
            ],
          },
        ],
      },
      take: safeLimit,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        topic: true,
        isActive: true,
      },
    });

    studyRoomResults = studyRooms.map((sr) => ({
      id: sr.id,
      type: 'study_room',
      title: sr.title,
      subtitle: `${sr.topic} · ${sr.isActive ? 'Active Room' : 'Ended'}`,
      metadata: { isActive: sr.isActive },
      url: `/study-rooms/${sr.id}`,
    }));
  }

  const allResults = [
    ...friendResults,
    ...studentResults,
    ...sessionResults,
    ...resourceResults,
    ...workspaceResults,
    ...studyRoomResults,
  ];

  return {
    query,
    total: allResults.length,
    results: allResults,
    categories: {
      friends: friendResults,
      students: studentResults,
      sessions: sessionResults,
      resources: resourceResults,
      workspaces: workspaceResults,
      study_rooms: studyRoomResults,
    },
  };
}
