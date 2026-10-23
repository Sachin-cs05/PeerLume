import type {
  RegisterInput,
  LoginInput,
  AuthUser,
} from '@peerlume/shared';
import { HTTP_STATUS } from '@peerlume/shared';
import { prisma } from '../config/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import {
  hashPassword,
  verifyPassword,
  generateRandomToken,
  hashToken,
} from '../utils/security.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt.js';
import { emailService } from './email.service.js';

export function formatAuthUser(user: {
  id: string;
  email: string;
  fullName: string;
  isEmailVerified: boolean;
  avatarUrl?: string | null;
  createdAt: Date;
  profile?: unknown;
}): AuthUser {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    isEmailVerified: user.isEmailVerified,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt.toISOString(),
    hasProfile: Boolean(user.profile),
  };
}

export async function registerStudent(
  input: RegisterInput,
  meta?: { userAgent?: string; ipAddress?: string }
): Promise<{ user: AuthUser; accessToken: string; refreshToken: string }> {
  const normalizedEmail = input.email.trim().toLowerCase();

  // 1. Check if email is already taken
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    throw new AppError(
      'An account with this email address already exists',
      HTTP_STATUS.BAD_REQUEST,
      'EMAIL_ALREADY_EXISTS'
    );
  }

  // 2. Hash password with Argon2id
  const passwordHash = await hashPassword(input.password);

  // 3. Create User and initial StudentProfile in a transaction
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        fullName: input.fullName.trim(),
        profile: {
          create: {
            college: input.college.trim(),
            degree: input.degree.trim(),
            branch: input.branch.trim(),
            semester: input.semester.trim(),
          },
        },
      },
      include: {
        profile: true,
      },
    });

    // 4. Create verification token (valid for 24 hours)
    const rawVerifyToken = generateRandomToken();
    const tokenHash = hashToken(rawVerifyToken);
    const verifyExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await tx.emailVerificationToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: verifyExpiresAt,
      },
    });

    // 5. Create Refresh Session (valid for 7 days)
    const rawRefreshToken = generateRandomToken();
    const sessionHashedToken = hashToken(rawRefreshToken);
    const sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const session = await tx.refreshSession.create({
      data: {
        userId: user.id,
        hashedToken: sessionHashedToken,
        userAgent: meta?.userAgent,
        ipAddress: meta?.ipAddress,
        expiresAt: sessionExpiresAt,
      },
    });

    return { user, rawVerifyToken, rawRefreshToken, sessionId: session.id };
  });

  // 6. Send verification email
  await emailService.sendVerificationEmail(
    result.user.email,
    result.rawVerifyToken,
    result.user.fullName
  );

  // 7. Generate JWT access and refresh tokens
  const accessToken = generateAccessToken({
    userId: result.user.id,
    email: result.user.email,
  });

  const refreshToken = generateRefreshToken({
    userId: result.user.id,
    sessionId: result.sessionId,
  });

  return {
    user: formatAuthUser(result.user),
    accessToken,
    refreshToken,
  };
}

export async function loginStudent(
  input: LoginInput,
  meta?: { userAgent?: string; ipAddress?: string }
): Promise<{ user: AuthUser; accessToken: string; refreshToken: string }> {
  const normalizedEmail = input.email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: { profile: true },
  });

  // Generic error to prevent account enumeration
  if (!user) {
    throw new AppError(
      'Invalid email or password',
      HTTP_STATUS.UNAUTHORIZED,
      'INVALID_CREDENTIALS'
    );
  }

  const isPasswordValid = await verifyPassword(user.passwordHash, input.password);
  if (!isPasswordValid) {
    throw new AppError(
      'Invalid email or password',
      HTTP_STATUS.UNAUTHORIZED,
      'INVALID_CREDENTIALS'
    );
  }

  // Create Refresh Session
  const rawRefreshToken = generateRandomToken();
  const sessionHashedToken = hashToken(rawRefreshToken);
  const sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const session = await prisma.refreshSession.create({
    data: {
      userId: user.id,
      hashedToken: sessionHashedToken,
      userAgent: meta?.userAgent,
      ipAddress: meta?.ipAddress,
      expiresAt: sessionExpiresAt,
    },
  });

  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
    sessionId: session.id,
  });

  return {
    user: formatAuthUser(user),
    accessToken,
    refreshToken,
  };
}

export async function logoutStudent(refreshToken?: string): Promise<void> {
  if (!refreshToken) return;

  try {
    const payload = verifyRefreshToken(refreshToken);
    if (payload?.sessionId) {
      await prisma.refreshSession.update({
        where: { id: payload.sessionId },
        data: { isRevoked: true },
      });
    }
  } catch {
    // Silently proceed on invalid token
  }
}

export async function getCurrentUser(userId: string): Promise<AuthUser> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });

  if (!user) {
    throw new AppError(
      'User not found',
      HTTP_STATUS.NOT_FOUND,
      'USER_NOT_FOUND'
    );
  }

  return formatAuthUser(user);
}

export async function refreshAuthSession(
  refreshTokenString: string,
  meta?: { userAgent?: string; ipAddress?: string }
): Promise<{ user: AuthUser; accessToken: string; refreshToken: string }> {
  const payload = verifyRefreshToken(refreshTokenString);
  if (!payload) {
    throw new AppError(
      'Session expired or invalid. Please log in again.',
      HTTP_STATUS.UNAUTHORIZED,
      'INVALID_SESSION'
    );
  }

  const session = await prisma.refreshSession.findUnique({
    where: { id: payload.sessionId },
    include: {
      user: {
        include: { profile: true },
      },
    },
  });

  if (!session || session.isRevoked || session.expiresAt < new Date()) {
    throw new AppError(
      'Session expired or revoked. Please log in again.',
      HTTP_STATUS.UNAUTHORIZED,
      'INVALID_SESSION'
    );
  }

  // Session rotation: Revoke old session and issue new one
  const rawRefreshToken = generateRandomToken();
  const sessionHashedToken = hashToken(rawRefreshToken);
  const sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const [newSession] = await prisma.$transaction([
    prisma.refreshSession.create({
      data: {
        userId: session.user.id,
        hashedToken: sessionHashedToken,
        userAgent: meta?.userAgent || session.userAgent,
        ipAddress: meta?.ipAddress || session.ipAddress,
        expiresAt: sessionExpiresAt,
      },
    }),
    prisma.refreshSession.update({
      where: { id: session.id },
      data: { isRevoked: true },
    }),
  ]);

  const accessToken = generateAccessToken({
    userId: session.user.id,
    email: session.user.email,
  });

  const newRefreshToken = generateRefreshToken({
    userId: session.user.id,
    sessionId: newSession.id,
  });

  return {
    user: formatAuthUser(session.user),
    accessToken,
    refreshToken: newRefreshToken,
  };
}

export async function forgotPassword(email: string): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  // Always return success to prevent account enumeration
  if (!user) return;

  // Invalidate any previous unused reset tokens for this user
  await prisma.passwordResetToken.updateMany({
    where: { userId: user.id, usedAt: null },
    data: { usedAt: new Date() },
  });

  // Generate new token (valid for 15 minutes)
  const rawToken = generateRandomToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  await emailService.sendPasswordResetEmail(user.email, rawToken, user.fullName);
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const tokenHash = hashToken(token);

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!resetToken || resetToken.usedAt !== null || resetToken.expiresAt < new Date()) {
    throw new AppError(
      'Password reset link is invalid or has expired',
      HTTP_STATUS.BAD_REQUEST,
      'INVALID_RESET_TOKEN'
    );
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.$transaction([
    // Update password
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    }),
    // Mark token as used
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
    // Invalidate all existing sessions for this user for security
    prisma.refreshSession.updateMany({
      where: { userId: resetToken.userId, isRevoked: false },
      data: { isRevoked: true },
    }),
  ]);
}

export async function verifyEmail(token: string): Promise<void> {
  const tokenHash = hashToken(token);

  const verificationRecord = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash },
  });

  if (
    !verificationRecord ||
    verificationRecord.usedAt !== null ||
    verificationRecord.expiresAt < new Date()
  ) {
    throw new AppError(
      'Email verification link is invalid or has expired',
      HTTP_STATUS.BAD_REQUEST,
      'INVALID_VERIFICATION_TOKEN'
    );
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: verificationRecord.userId },
      data: { isEmailVerified: true },
    }),
    prisma.emailVerificationToken.update({
      where: { id: verificationRecord.id },
      data: { usedAt: new Date() },
    }),
  ]);
}

export async function resendVerificationEmail(email: string): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  // Always return success to prevent enumeration
  if (!user || user.isEmailVerified) return;

  // Invalidate previous tokens
  await prisma.emailVerificationToken.updateMany({
    where: { userId: user.id, usedAt: null },
    data: { usedAt: new Date() },
  });

  const rawToken = generateRandomToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.emailVerificationToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  await emailService.sendVerificationEmail(user.email, rawToken, user.fullName);
}
