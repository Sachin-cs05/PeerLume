import { prisma } from '../config/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { HTTP_STATUS } from '@peerlume/shared';
import type { NotificationDto, NotificationType, PaginatedResult } from '@peerlume/shared';
import { getSocketIO, sendToUser } from '../socket/index.js';
import { SOCKET_EVENTS } from '@peerlume/shared';

export interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  actorId?: string | null;
  data?: Record<string, unknown> | null;
}

export function formatNotificationDto(notification: any): NotificationDto {
  return {
    id: notification.id,
    userId: notification.userId,
    actorId: notification.actorId,
    actorName: notification.actor?.fullName || null,
    actorAvatar: notification.actor?.avatarUrl || null,
    type: notification.type,
    title: notification.title,
    body: notification.body,
    data: (notification.data as Record<string, unknown>) || null,
    isRead: notification.isRead,
    readAt: notification.readAt ? notification.readAt.toISOString() : null,
    createdAt: notification.createdAt.toISOString(),
  };
}

export async function createNotification(
  params: CreateNotificationParams
): Promise<NotificationDto | null> {
  const { userId, type, title, body, actorId, data } = params;

  // If there's an actor, check if either user has blocked the other
  if (actorId && actorId !== userId) {
    const isBlocked = await prisma.userBlock.findFirst({
      where: {
        OR: [
          { blockerId: actorId, blockedId: userId },
          { blockerId: userId, blockedId: actorId },
        ],
      },
    });

    if (isBlocked) {
      // Silently drop notification if blocked
      return null;
    }
  }

  // Prevent duplicate unread notifications of the same type from the same actor in a short window
  if (actorId) {
    const existingRecent = await prisma.notification.findFirst({
      where: {
        userId,
        actorId,
        type,
        isRead: false,
        createdAt: {
          gte: new Date(Date.now() - 30 * 1000), // 30 seconds window
        },
      },
    });

    if (existingRecent) {
      return formatNotificationDto(existingRecent);
    }
  }

  const notification = await prisma.notification.create({
    data: {
      userId,
      actorId: actorId || null,
      type,
      title,
      body,
      data: (data as any) || undefined,
    },
    include: {
      actor: {
        select: {
          id: true,
          fullName: true,
          avatarUrl: true,
        },
      },
    },
  });

  const dto = formatNotificationDto(notification);

  // Emit real-time notification to user's active sockets if Socket.IO is initialized
  try {
    const io = getSocketIO();
    if (io) {
      sendToUser(userId, SOCKET_EVENTS.NOTIFICATION_NEW, dto);
    }
  } catch {
    // Socket emit failure should not prevent persistent notification creation
  }

  return dto;
}

export async function getUserNotifications(
  userId: string,
  page = 1,
  pageSize = 20,
  unreadOnly = false
): Promise<PaginatedResult<NotificationDto>> {
  const where: any = { userId };
  if (unreadOnly) {
    where.isRead = false;
  }

  const [total, items] = await Promise.all([
    prisma.notification.count({ where }),
    prisma.notification.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        actor: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    }),
  ]);

  return {
    items: items.map(formatNotificationDto),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize) || 1,
  };
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });
}

export async function markNotificationAsRead(
  userId: string,
  notificationId: string
): Promise<NotificationDto> {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
    include: {
      actor: {
        select: {
          id: true,
          fullName: true,
          avatarUrl: true,
        },
      },
    },
  });

  if (!notification) {
    throw new AppError('Notification not found', HTTP_STATUS.NOT_FOUND);
  }

  if (notification.userId !== userId) {
    throw new AppError('Unauthorized access to notification', HTTP_STATUS.FORBIDDEN);
  }

  if (notification.isRead) {
    return formatNotificationDto(notification);
  }

  const updated = await prisma.notification.update({
    where: { id: notificationId },
    data: {
      isRead: true,
      readAt: new Date(),
    },
    include: {
      actor: {
        select: {
          id: true,
          fullName: true,
          avatarUrl: true,
        },
      },
    },
  });

  return formatNotificationDto(updated);
}

export async function markAllNotificationsAsRead(userId: string): Promise<{ count: number }> {
  const result = await prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  return { count: result.count };
}
