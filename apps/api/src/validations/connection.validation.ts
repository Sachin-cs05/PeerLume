import { z } from 'zod';

export const sendRequestSchema = z
  .object({
    receiverId: z.string().min(1, 'Student ID is required').optional(),
    recipientId: z.string().min(1, 'Student ID is required').optional(),
    message: z.string().trim().max(300, 'Message cannot exceed 300 characters').optional(),
  })
  .refine((data) => Boolean(data.receiverId || data.recipientId), {
    message: 'receiverId or recipientId is required',
    path: ['receiverId'],
  });

export const blockStudentSchema = z.object({
  reason: z.string().trim().max(200, 'Reason cannot exceed 200 characters').optional(),
});

export const savePartnerSchema = z.object({
  notes: z.string().trim().max(300, 'Notes cannot exceed 300 characters').optional(),
});

export const searchStudentsQuerySchema = z.object({
  q: z.string().trim().optional(),
  college: z.string().trim().optional(),
  branch: z.string().trim().optional(),
  semester: z.string().trim().optional(),
  teachingSkill: z.string().trim().optional(),
  learningGoal: z.string().trim().optional(),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Math.max(1, parseInt(val, 10) || 1) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Math.min(50, Math.max(1, parseInt(val, 10) || 12)) : 12)),
});

export const discoveryFilterQuerySchema = z.object({
  q: z.string().trim().optional(),
  skill: z.string().trim().optional(),
  college: z.string().trim().optional(),
  branch: z.string().trim().optional(),
  semester: z.string().trim().optional(),
  language: z.string().trim().optional(),
  preferredMode: z.enum(['ONLINE', 'IN_PERSON', 'HYBRID']).optional(),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Math.max(1, parseInt(val, 10) || 1) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Math.min(50, Math.max(1, parseInt(val, 10) || 12)) : 12)),
});
