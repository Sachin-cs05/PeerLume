import { prisma } from '../config/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { HTTP_STATUS } from '@peerlume/shared';
import type {
  PartnerRecommendation,
  MatchExplanation,
  PaginatedResult,
  StudentSearchItem,
} from '@peerlume/shared';
import {
  getConnectionStatusBetween,
  formatStudentSearchItem,
} from './connection.service.js';

export interface MatchingWeights {
  teachToLearn: number; // 0.50
  reciprocal: number;   // 0.25
  sharedGoals: number;  // 0.15
  language: number;     // 0.10
}

export const DEFAULT_MATCHING_WEIGHTS: MatchingWeights = {
  teachToLearn: 50,
  reciprocal: 25,
  sharedGoals: 15,
  language: 10,
};

export interface DiscoveryFilters {
  q?: string;
  skill?: string;
  college?: string;
  branch?: string;
  semester?: string;
  language?: string;
  preferredMode?: 'ONLINE' | 'IN_PERSON' | 'HYBRID';
  page: number;
  limit: number;
}

export async function getRecommendedPartners(
  currentUserId: string,
  filters: DiscoveryFilters,
  weights: MatchingWeights = DEFAULT_MATCHING_WEIGHTS
): Promise<PaginatedResult<PartnerRecommendation>> {
  // 1. Fetch current user's profile with teaching skills and learning goals
  const currentUser = await prisma.user.findUnique({
    where: { id: currentUserId },
    include: {
      profile: {
        include: {
          teachingSkills: { include: { skill: true } },
          learningGoals: { include: { skill: true } },
        },
      },
    },
  });

  if (!currentUser || !currentUser.profile) {
    throw new AppError('Current student profile not found. Please complete profile setup.', HTTP_STATUS.BAD_REQUEST);
  }

  const myTeachingSkillNames = new Set(
    currentUser.profile.teachingSkills.map((ts) => ts.skill.name.toLowerCase().trim())
  );
  const myLearningGoalNames = new Set(
    currentUser.profile.learningGoals.map((lg) => lg.skill.name.toLowerCase().trim())
  );
  const myLanguages = new Set(
    currentUser.profile.languages.map((l) => l.toLowerCase().trim())
  );
  const myCollege = currentUser.profile.college.toLowerCase().trim();

  // 2. Fetch list of excluded user IDs (self, blocked users, users who blocked me, existing friends)
  const blocks = await prisma.userBlock.findMany({
    where: {
      OR: [{ blockerId: currentUserId }, { blockedId: currentUserId }],
    },
    select: { blockerId: true, blockedId: true },
  });
  const blockedIds = new Set<string>();
  for (const b of blocks) {
    blockedIds.add(b.blockerId === currentUserId ? b.blockedId : b.blockerId);
  }

  const existingFriendships = await prisma.friendship.findMany({
    where: {
      OR: [{ user1Id: currentUserId }, { user2Id: currentUserId }],
    },
    select: { user1Id: true, user2Id: true },
  });
  const friendIds = new Set<string>();
  for (const f of existingFriendships) {
    friendIds.add(f.user1Id === currentUserId ? f.user2Id : f.user1Id);
  }

  // Fetch saved partners by current user
  const savedRecords = await prisma.savedPartner.findMany({
    where: { userId: currentUserId },
    select: { savedStudentId: true },
  });
  const savedIds = new Set(savedRecords.map((s) => s.savedStudentId));

  const excludedIds = Array.from(
    new Set([currentUserId, ...Array.from(blockedIds), ...Array.from(friendIds)])
  );

  // 3. Query candidate students with filter criteria
  const candidates = await prisma.user.findMany({
    where: {
      id: { notIn: excludedIds },
      profile: {
        is: {
          visibility: { not: 'CONNECTIONS_ONLY' },
          ...(filters.college
            ? { college: { contains: filters.college, mode: 'insensitive' } }
            : {}),
          ...(filters.branch
            ? { branch: { contains: filters.branch, mode: 'insensitive' } }
            : {}),
          ...(filters.semester
            ? { semester: { contains: filters.semester, mode: 'insensitive' } }
            : {}),
          ...(filters.preferredMode
            ? { preferredLearningMode: filters.preferredMode }
            : {}),
          ...(filters.q
            ? {
                OR: [
                  { user: { fullName: { contains: filters.q, mode: 'insensitive' } } },
                  { college: { contains: filters.q, mode: 'insensitive' } },
                  { branch: { contains: filters.q, mode: 'insensitive' } },
                  { bio: { contains: filters.q, mode: 'insensitive' } },
                ],
              }
            : {}),
        },
      },
    },
    include: {
      profile: {
        include: {
          teachingSkills: { include: { skill: true } },
          learningGoals: { include: { skill: true } },
        },
      },
    },
  });

  // 4. Calculate Match Scores & Explanations
  const scoredRecommendations: PartnerRecommendation[] = [];

  for (const candidate of candidates) {
    if (!candidate.profile) continue;

    // Optional campus-only visibility check
    if (
      candidate.profile.visibility === 'CAMPUS_ONLY' &&
      candidate.profile.college.toLowerCase().trim() !== myCollege
    ) {
      continue;
    }

    const candidateTeaches = candidate.profile.teachingSkills.map((ts: any) =>
      ts.skill.name.toLowerCase().trim()
    );
    const candidateWants = candidate.profile.learningGoals.map((lg: any) =>
      lg.skill.name.toLowerCase().trim()
    );
    const candidateLanguages = candidate.profile.languages.map((l: string) =>
      l.toLowerCase().trim()
    );

    // Filter by skill if requested
    if (filters.skill) {
      const qSkill = filters.skill.toLowerCase().trim();
      const hasSkill =
        candidateTeaches.some((s: string) => s.includes(qSkill)) ||
        candidateWants.some((s: string) => s.includes(qSkill));
      if (!hasSkill) continue;
    }

    // Filter by language if requested
    if (filters.language) {
      const qLang = filters.language.toLowerCase().trim();
      const hasLang = candidateLanguages.some((l: string) => l.includes(qLang));
      if (!hasLang) continue;
    }

    // A. Teach to Learn: Candidate teaches what I want to learn
    const matchedTeachSkills: string[] = [];
    for (const ts of candidate.profile.teachingSkills as any[]) {
      if (myLearningGoalNames.has(ts.skill.name.toLowerCase().trim())) {
        matchedTeachSkills.push(ts.skill.name);
      }
    }
    const teachToLearnRatio =
      myLearningGoalNames.size > 0
        ? Math.min(1, matchedTeachSkills.length / Math.max(1, myLearningGoalNames.size))
        : 0;
    const teachToLearnScore = Math.round(teachToLearnRatio * weights.teachToLearn);

    // B. Reciprocal: Candidate wants to learn what I teach
    const matchedReciprocalSkills: string[] = [];
    for (const lg of candidate.profile.learningGoals as any[]) {
      if (myTeachingSkillNames.has(lg.skill.name.toLowerCase().trim())) {
        matchedReciprocalSkills.push(lg.skill.name);
      }
    }
    const reciprocalRatio =
      myTeachingSkillNames.size > 0
        ? Math.min(1, matchedReciprocalSkills.length / Math.max(1, myTeachingSkillNames.size))
        : 0;
    const reciprocalScore = Math.round(reciprocalRatio * weights.reciprocal);

    // C. Shared Goals: Candidate and I share common learning goals
    const sharedGoals: string[] = [];
    for (const lg of candidate.profile.learningGoals as any[]) {
      const gName = lg.skill.name.toLowerCase().trim();
      if (myLearningGoalNames.has(gName) && !matchedTeachSkills.includes(lg.skill.name)) {
        sharedGoals.push(lg.skill.name);
      }
    }
    const sharedGoalsRatio =
      myLearningGoalNames.size > 0
        ? Math.min(1, sharedGoals.length / Math.max(1, myLearningGoalNames.size))
        : 0;
    const sharedGoalsScore = Math.round(sharedGoalsRatio * weights.sharedGoals);

    // D. Language Compatibility
    const sharedLanguages: string[] = [];
    for (const l of candidate.profile.languages as string[]) {
      if (myLanguages.has(l.toLowerCase().trim())) {
        sharedLanguages.push(l);
      }
    }
    const languageScore = sharedLanguages.length > 0 ? weights.language : 0;

    // Academic Context bonus (+5 points if same college and same branch)
    let academicBonus = 0;
    const sameCollege = candidate.profile.college.toLowerCase().trim() === myCollege;
    if (sameCollege) academicBonus += 3;
    const myBranch = (currentUser?.profile?.branch || '').toLowerCase().trim();
    if (myBranch && candidate.profile.branch.toLowerCase().trim() === myBranch) {
      academicBonus += 2;
    }

    const totalScore = Math.min(
      100,
      teachToLearnScore + reciprocalScore + sharedGoalsScore + languageScore + academicBonus
    );

    // Generate Truthful Explanations
    const explanations: MatchExplanation[] = [];
    if (matchedTeachSkills.length > 0) {
      explanations.push({
        type: 'TEACH_TO_LEARN',
        text: `Can mentor you in: ${matchedTeachSkills.join(', ')}`,
        skills: matchedTeachSkills,
      });
    }
    if (matchedReciprocalSkills.length > 0) {
      explanations.push({
        type: 'RECIPROCAL',
        text: `Interested in learning ${matchedReciprocalSkills.join(', ')} from you`,
        skills: matchedReciprocalSkills,
      });
    }
    if (sharedGoals.length > 0) {
      explanations.push({
        type: 'SHARED_GOAL',
        text: `Shares ${sharedGoals.length} common learning goal${sharedGoals.length > 1 ? 's' : ''} (${sharedGoals.join(', ')})`,
        skills: sharedGoals,
      });
    }
    if (sharedLanguages.length > 0) {
      explanations.push({
        type: 'LANGUAGE',
        text: `Speaks ${sharedLanguages.join(', ')}`,
      });
    }
    if (sameCollege) {
      explanations.push({
        type: 'ACADEMIC',
        text: `Attends ${candidate.profile.college}`,
      });
    }

    // Connection status check (sent request / received request / none)
    const status = await getConnectionStatusBetween(currentUserId, candidate.id);

    const studentItem = formatStudentSearchItem(
      candidate as any,
      status.status,
      status.connectionRequestId,
      status.connectionId
    );

    scoredRecommendations.push({
      student: studentItem,
      matchScore: totalScore,
      scoreBreakdown: {
        teachToLearn: teachToLearnScore,
        reciprocal: reciprocalScore,
        sharedGoals: sharedGoalsScore,
        language: languageScore,
      },
      explanations,
      isSaved: savedIds.has(candidate.id),
    });
  }

  // 5. Sort by relevance (matchScore descending)
  scoredRecommendations.sort((a, b) => b.matchScore - a.matchScore);

  // 6. Paginate
  const total = scoredRecommendations.length;
  const startIndex = (filters.page - 1) * filters.limit;
  const paginatedItems = scoredRecommendations.slice(startIndex, startIndex + filters.limit);
  const totalPages = Math.ceil(total / filters.limit) || 1;

  return {
    items: paginatedItems,
    total,
    page: filters.page,
    pageSize: filters.limit,
    totalPages,
  };
}

export async function searchStudents(
  currentUserId: string,
  filters: {
    q?: string;
    college?: string;
    branch?: string;
    semester?: string;
    teachingSkill?: string;
    learningGoal?: string;
    page: number;
    limit: number;
  }
): Promise<PaginatedResult<StudentSearchItem>> {
  // Exclude blocked users and self
  const blocks = await prisma.userBlock.findMany({
    where: {
      OR: [{ blockerId: currentUserId }, { blockedId: currentUserId }],
    },
    select: { blockerId: true, blockedId: true },
  });
  const blockedIds = new Set<string>();
  for (const b of blocks) {
    blockedIds.add(b.blockerId === currentUserId ? b.blockedId : b.blockerId);
  }

  const excludedIds = [currentUserId, ...Array.from(blockedIds)];

  const whereClause: any = {
    id: { notIn: excludedIds },
    profile: {
      is: {
        visibility: { not: 'CONNECTIONS_ONLY' },
        ...(filters.college
        ? { college: { contains: filters.college, mode: 'insensitive' } }
        : {}),
      ...(filters.branch
        ? { branch: { contains: filters.branch, mode: 'insensitive' } }
        : {}),
      ...(filters.semester
        ? { semester: { contains: filters.semester, mode: 'insensitive' } }
        : {}),
      ...(filters.teachingSkill
        ? {
            teachingSkills: {
              some: {
                skill: {
                  name: { contains: filters.teachingSkill, mode: 'insensitive' },
                },
              },
            },
          }
        : {}),
      ...(filters.learningGoal
        ? {
            learningGoals: {
              some: {
                skill: {
                  name: { contains: filters.learningGoal, mode: 'insensitive' },
                },
              },
            },
          }
        : {}),
      ...(filters.q
        ? {
            OR: [
              { user: { fullName: { contains: filters.q, mode: 'insensitive' } } },
              { college: { contains: filters.q, mode: 'insensitive' } },
              { branch: { contains: filters.q, mode: 'insensitive' } },
              { bio: { contains: filters.q, mode: 'insensitive' } },
            ],
          }
        : {}),
      },
    },
  };

  const total = await prisma.user.count({ where: whereClause });

  const users = await prisma.user.findMany({
    where: whereClause,
    include: {
      profile: {
        include: {
          teachingSkills: { include: { skill: true } },
          learningGoals: { include: { skill: true } },
        },
      },
    },
    skip: (filters.page - 1) * filters.limit,
    take: filters.limit,
    orderBy: { createdAt: 'desc' },
  });

  const items: StudentSearchItem[] = [];
  for (const u of users) {
    const status = await getConnectionStatusBetween(currentUserId, u.id);
    items.push(
      formatStudentSearchItem(u as any, status.status, status.connectionRequestId, status.connectionId)
    );
  }

  return {
    items,
    total,
    page: filters.page,
    pageSize: filters.limit,
    totalPages: Math.ceil(total / filters.limit) || 1,
  };
}

export async function getStudentPublicDetails(
  currentUserId: string,
  targetStudentId: string
): Promise<StudentSearchItem> {
  const isBlocked = await prisma.userBlock.findFirst({
    where: {
      OR: [
        { blockerId: currentUserId, blockedId: targetStudentId },
        { blockerId: targetStudentId, blockedId: currentUserId },
      ],
    },
  });

  if (isBlocked) {
    throw new AppError('Unable to view profile', HTTP_STATUS.FORBIDDEN);
  }

  const user = await prisma.user.findUnique({
    where: { id: targetStudentId },
    include: {
      profile: {
        include: {
          teachingSkills: { include: { skill: true } },
          learningGoals: { include: { skill: true } },
        },
      },
    },
  });

  if (!user || !user.profile) {
    throw new AppError('Student profile not found', HTTP_STATUS.NOT_FOUND);
  }

  const status = await getConnectionStatusBetween(currentUserId, targetStudentId);

  // If visibility is CONNECTIONS_ONLY, verify friendship
  if (user.profile.visibility === 'CONNECTIONS_ONLY' && status.status !== 'FRIENDS') {
    throw new AppError('This student profile is visible only to mutual connections', HTTP_STATUS.FORBIDDEN);
  }

  return formatStudentSearchItem(
    user as any,
    status.status,
    status.connectionRequestId,
    status.connectionId
  );
}
