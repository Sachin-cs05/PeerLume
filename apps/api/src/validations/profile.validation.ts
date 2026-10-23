import { z } from 'zod';

export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(100).optional(),
  avatarUrl: z.string().trim().url().or(z.literal('')).optional().nullable(),
  college: z.string().trim().min(2).max(150).optional(),
  degree: z.string().trim().min(2).max(100).optional(),
  branch: z.string().trim().min(2).max(100).optional(),
  semester: z.string().trim().min(1).max(20).optional(),
  bio: z.string().trim().max(500, 'Bio cannot exceed 500 characters').optional().nullable(),
  languages: z.array(z.string().trim().min(1).max(50)).max(10).optional(),
  preferredLearningMode: z.enum(['ONLINE', 'IN_PERSON', 'HYBRID']).optional(),
  visibility: z.enum(['PUBLIC', 'CAMPUS_ONLY', 'CONNECTIONS_ONLY']).optional(),
});

export const updateTeachingSkillsSchema = z.object({
  skills: z
    .array(
      z.object({
        name: z.string().trim().min(1, 'Skill name is required').max(80),
        category: z.string().trim().max(50).optional(),
        proficiency: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).default('INTERMEDIATE'),
      })
    )
    .max(20, 'You can add up to 20 teaching skills'),
});

export const updateLearningGoalsSchema = z.object({
  goals: z
    .array(
      z.object({
        name: z.string().trim().min(1, 'Goal/Skill name is required').max(80),
        category: z.string().trim().max(50).optional(),
        targetDescription: z.string().trim().max(300).optional(),
        priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
      })
    )
    .max(20, 'You can add up to 20 learning goals'),
});
