import { prisma } from '../config/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { HTTP_STATUS } from '@peerlume/shared';
import type {
  UserPreferencesDto,
  UpdateUserPreferencesInput,
  AppTheme,
} from '@peerlume/shared';

export function formatPreferencesDto(p: any): UserPreferencesDto {
  return {
    id: p.id,
    userId: p.userId,
    theme: (p.theme as AppTheme) || 'system',
    emailNotifications: p.emailNotifications ?? true,
    soundEnabled: p.soundEnabled ?? true,
    reducedMotion: p.reducedMotion ?? false,
    createdAt: (p.createdAt ? new Date(p.createdAt) : new Date()).toISOString(),
    updatedAt: (p.updatedAt ? new Date(p.updatedAt) : new Date()).toISOString(),
  };
}

export async function getUserPreferences(userId: string): Promise<UserPreferencesDto> {
  let pref = await prisma.userPreference.findUnique({
    where: { userId },
  });

  if (!pref) {
    pref = await prisma.userPreference.create({
      data: {
        userId,
        theme: 'system',
        emailNotifications: true,
        soundEnabled: true,
        reducedMotion: false,
      },
    });
  }

  return formatPreferencesDto(pref);
}

export async function updateUserPreferences(
  userId: string,
  input: UpdateUserPreferencesInput
): Promise<UserPreferencesDto> {
  if (input.theme && !['light', 'dark', 'system'].includes(input.theme)) {
    throw new AppError('Invalid theme. Allowed values: light, dark, system', HTTP_STATUS.BAD_REQUEST);
  }

  const pref = await prisma.userPreference.upsert({
    where: { userId },
    create: {
      userId,
      theme: input.theme || 'system',
      emailNotifications: input.emailNotifications ?? true,
      soundEnabled: input.soundEnabled ?? true,
      reducedMotion: input.reducedMotion ?? false,
    },
    update: {
      theme: input.theme !== undefined ? input.theme : undefined,
      emailNotifications: input.emailNotifications !== undefined ? input.emailNotifications : undefined,
      soundEnabled: input.soundEnabled !== undefined ? input.soundEnabled : undefined,
      reducedMotion: input.reducedMotion !== undefined ? input.reducedMotion : undefined,
    },
  });

  return formatPreferencesDto(pref);
}
