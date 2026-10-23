import { z } from 'zod';

const passwordValidation = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(100, 'Password cannot exceed 100 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Full name cannot exceed 100 characters'),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email('Invalid email address')
      .max(255, 'Email cannot exceed 255 characters'),
    password: passwordValidation,
    confirmPassword: z.string().optional(),
    college: z
      .string()
      .trim()
      .min(2, 'College name must be at least 2 characters')
      .max(150, 'College name cannot exceed 150 characters'),
    degree: z
      .string()
      .trim()
      .min(2, 'Degree/Course must be at least 2 characters')
      .max(100, 'Degree cannot exceed 100 characters'),
    branch: z
      .string()
      .trim()
      .min(2, 'Branch/Department must be at least 2 characters')
      .max(100, 'Branch cannot exceed 100 characters'),
    semester: z
      .string()
      .trim()
      .min(1, 'Current semester or year is required')
      .max(20, 'Semester cannot exceed 20 characters'),
    acceptedTerms: z.literal(true, {
      errorMap: () => ({ message: 'You must accept the terms and privacy policy to register' }),
    }),
  })
  .refine(
    (data) => !data.confirmPassword || data.password === data.confirmPassword,
    {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }
  );

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address'),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(10, 'Reset token is invalid or missing'),
    password: passwordValidation,
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => !data.confirmPassword || data.password === data.confirmPassword,
    {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }
  );

export const verifyEmailSchema = z.object({
  token: z.string().min(10, 'Verification token is invalid or missing'),
});

export const resendVerificationSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address'),
});
