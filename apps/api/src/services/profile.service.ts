import type {
  StudentProfileDto,
  UpdateProfileInput,
  UpdateTeachingSkillsInput,
  UpdateLearningGoalsInput,
  SkillDto,
  SkillProficiency,
  GoalPriority,
  PreferredLearningMode,
  ProfileVisibility,
} from '@peerlume/shared';
import { HTTP_STATUS } from '@peerlume/shared';
import { prisma } from '../config/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

interface RawProfileWithRelations {
  id: string;
  userId: string;
  college: string;
  degree: string;
  branch: string;
  semester: string;
  bio: string | null;
  languages: string[];
  preferredLearningMode: string;
  visibility: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    fullName: string;
    email: string;
    avatarUrl: string | null;
  };
  teachingSkills: {
    id: string;
    skillId: string;
    proficiency: string;
    skill: {
      id: string;
      name: string;
      category: string | null;
    };
  }[];
  learningGoals: {
    id: string;
    skillId: string;
    targetDescription: string | null;
    priority: string;
    skill: {
      id: string;
      name: string;
      category: string | null;
    };
  }[];
}

export function formatStudentProfile(profile: RawProfileWithRelations): StudentProfileDto {
  return {
    id: profile.id,
    userId: profile.userId,
    fullName: profile.user.fullName,
    email: profile.user.email,
    avatarUrl: profile.user.avatarUrl,
    college: profile.college,
    degree: profile.degree,
    branch: profile.branch,
    semester: profile.semester,
    bio: profile.bio,
    languages: profile.languages,
    preferredLearningMode: profile.preferredLearningMode as PreferredLearningMode,
    visibility: profile.visibility as ProfileVisibility,
    teachingSkills: profile.teachingSkills.map((ts) => ({
      id: ts.id,
      skillId: ts.skillId,
      name: ts.skill.name,
      category: ts.skill.category,
      proficiency: ts.proficiency as SkillProficiency,
    })),
    learningGoals: profile.learningGoals.map((lg) => ({
      id: lg.id,
      skillId: lg.skillId,
      name: lg.skill.name,
      category: lg.skill.category,
      targetDescription: lg.targetDescription,
      priority: lg.priority as GoalPriority,
    })),
    createdAt: profile.createdAt.toISOString(),
    updatedAt: profile.updatedAt.toISOString(),
  };
}

export async function getOwnProfile(userId: string): Promise<StudentProfileDto> {
  const profile = await prisma.studentProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          fullName: true,
          email: true,
          avatarUrl: true,
        },
      },
      teachingSkills: {
        include: { skill: true },
        orderBy: { createdAt: 'asc' },
      },
      learningGoals: {
        include: { skill: true },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!profile) {
    throw new AppError('Student profile not found', HTTP_STATUS.NOT_FOUND, 'PROFILE_NOT_FOUND');
  }

  return formatStudentProfile(profile as unknown as RawProfileWithRelations);
}

export async function updateOwnProfile(
  userId: string,
  input: UpdateProfileInput
): Promise<StudentProfileDto> {
  const profile = await prisma.studentProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw new AppError('Student profile not found', HTTP_STATUS.NOT_FOUND, 'PROFILE_NOT_FOUND');
  }

  await prisma.$transaction(async (tx) => {
    // If fullName or avatarUrl changed, update User record
    if (input.fullName !== undefined || input.avatarUrl !== undefined) {
      await tx.user.update({
        where: { id: userId },
        data: {
          ...(input.fullName ? { fullName: input.fullName.trim() } : {}),
          ...(input.avatarUrl !== undefined ? { avatarUrl: input.avatarUrl || null } : {}),
        },
      });
    }

    // Update StudentProfile record
    await tx.studentProfile.update({
      where: { userId },
      data: {
        ...(input.college ? { college: input.college.trim() } : {}),
        ...(input.degree ? { degree: input.degree.trim() } : {}),
        ...(input.branch ? { branch: input.branch.trim() } : {}),
        ...(input.semester ? { semester: input.semester.trim() } : {}),
        ...(input.bio !== undefined ? { bio: input.bio?.trim() || null } : {}),
        ...(input.languages ? { languages: input.languages } : {}),
        ...(input.preferredLearningMode ? { preferredLearningMode: input.preferredLearningMode } : {}),
        ...(input.visibility ? { visibility: input.visibility } : {}),
      },
    });
  });

  return getOwnProfile(userId);
}

export async function listSkills(query?: string): Promise<SkillDto[]> {
  const skills = await prisma.skill.findMany({
    where: query
      ? {
          name: {
            contains: query.trim(),
            mode: 'insensitive',
          },
        }
      : undefined,
    take: 30,
    orderBy: { name: 'asc' },
  });

  return skills.map((s) => ({
    id: s.id,
    name: s.name,
    category: s.category,
  }));
}

export async function updateTeachingSkills(
  userId: string,
  skillsInput: UpdateTeachingSkillsInput['skills']
): Promise<StudentProfileDto> {
  const profile = await prisma.studentProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw new AppError('Student profile not found', HTTP_STATUS.NOT_FOUND, 'PROFILE_NOT_FOUND');
  }

  await prisma.$transaction(async (tx) => {
    // 1. Delete existing teaching skills for this profile
    await tx.userTeachingSkill.deleteMany({
      where: { profileId: profile.id },
    });

    // 2. Find or create skills and connect
    for (const item of skillsInput) {
      const cleanName = item.name.trim();
      if (!cleanName) continue;

      let skill = await tx.skill.findUnique({
        where: { name: cleanName },
      });

      if (!skill) {
        skill = await tx.skill.create({
          data: {
            name: cleanName,
            category: item.category?.trim() || 'General',
          },
        });
      }

      await tx.userTeachingSkill.create({
        data: {
          profileId: profile.id,
          skillId: skill.id,
          proficiency: item.proficiency,
        },
      });
    }
  });

  return getOwnProfile(userId);
}

export async function updateLearningGoals(
  userId: string,
  goalsInput: UpdateLearningGoalsInput['goals']
): Promise<StudentProfileDto> {
  const profile = await prisma.studentProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw new AppError('Student profile not found', HTTP_STATUS.NOT_FOUND, 'PROFILE_NOT_FOUND');
  }

  await prisma.$transaction(async (tx) => {
    // 1. Delete existing learning goals for this profile
    await tx.userLearningGoal.deleteMany({
      where: { profileId: profile.id },
    });

    // 2. Find or create skills and connect
    for (const item of goalsInput) {
      const cleanName = item.name.trim();
      if (!cleanName) continue;

      let skill = await tx.skill.findUnique({
        where: { name: cleanName },
      });

      if (!skill) {
        skill = await tx.skill.create({
          data: {
            name: cleanName,
            category: item.category?.trim() || 'General',
          },
        });
      }

      await tx.userLearningGoal.create({
        data: {
          profileId: profile.id,
          skillId: skill.id,
          targetDescription: item.targetDescription?.trim() || null,
          priority: item.priority,
        },
      });
    }
  });

  return getOwnProfile(userId);
}
