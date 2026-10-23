import { prisma } from '../config/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { HTTP_STATUS, SOCKET_EVENTS } from '@peerlume/shared';
import type {
  ConversationDto,
  MessageDto,
  SendMessageInput,
  MessageMetadata,
  MessageType,
} from '@peerlume/shared';
import { getCanonicalPair } from './connection.service.js';
import { createNotification } from './notification.service.js';
import { getSocketIO, sendToUser, isUserOnline } from '../socket/index.js';

export function formatMessageDto(message: any): MessageDto {
  return {
    id: message.id,
    conversationId: message.conversationId,
    senderId: message.senderId,
    senderName: message.sender?.fullName || 'Student',
    senderAvatar: message.sender?.avatarUrl || null,
    type: message.type as MessageType,
    content: message.content,
    metadata: (message.metadata as MessageMetadata) || null,
    isRead: message.isRead,
    readAt: message.readAt ? message.readAt.toISOString() : null,
    clientTempId: message.clientTempId || null,
    createdAt: message.createdAt.toISOString(),
  };
}

export async function checkBlockBetween(userA: string, userB: string): Promise<boolean> {
  const block = await prisma.userBlock.findFirst({
    where: {
      OR: [
        { blockerId: userA, blockedId: userB },
        { blockerId: userB, blockedId: userA },
      ],
    },
  });
  return Boolean(block);
}

export async function getOrCreateDirectConversation(
  userId: string,
  targetUserId: string
): Promise<ConversationDto> {
  if (userId === targetUserId) {
    throw new AppError('Cannot start a conversation with yourself', HTTP_STATUS.BAD_REQUEST);
  }

  // Ensure target user exists
  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    include: {
      profile: {
        select: { college: true },
      },
    },
  });

  if (!targetUser) {
    throw new AppError('Student not found', HTTP_STATUS.NOT_FOUND);
  }

  // Check blocking
  const isBlocked = await checkBlockBetween(userId, targetUserId);
  if (isBlocked) {
    throw new AppError('Unable to message this student due to privacy settings', HTTP_STATUS.FORBIDDEN);
  }

  const [user1Id, user2Id] = getCanonicalPair(userId, targetUserId);

  let conversation = await prisma.conversation.findUnique({
    where: {
      user1Id_user2Id: { user1Id, user2Id },
    },
    include: {
      user1: {
        select: {
          id: true,
          fullName: true,
          avatarUrl: true,
          profile: { select: { college: true } },
        },
      },
      user2: {
        select: {
          id: true,
          fullName: true,
          avatarUrl: true,
          profile: { select: { college: true } },
        },
      },
      messages: {
        take: 1,
        orderBy: { createdAt: 'desc' },
        include: {
          sender: { select: { id: true, fullName: true, avatarUrl: true } },
        },
      },
    },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        user1Id,
        user2Id,
      },
      include: {
        user1: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            profile: { select: { college: true } },
          },
        },
        user2: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            profile: { select: { college: true } },
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: {
            sender: { select: { id: true, fullName: true, avatarUrl: true } },
          },
        },
      },
    });
  }

  const otherUser = conversation.user1Id === userId ? conversation.user2 : conversation.user1;
  const lastMsg = conversation.messages[0] ? formatMessageDto(conversation.messages[0]) : null;

  const unreadCount = await prisma.message.count({
    where: {
      conversationId: conversation.id,
      senderId: { not: userId },
      isRead: false,
    },
  });

  return {
    id: conversation.id,
    participant: {
      id: otherUser.id,
      fullName: otherUser.fullName,
      avatarUrl: otherUser.avatarUrl,
      college: otherUser.profile?.college || undefined,
      isOnline: isUserOnline(otherUser.id),
    },
    lastMessage: lastMsg,
    unreadCount,
    createdAt: conversation.createdAt.toISOString(),
    updatedAt: conversation.updatedAt.toISOString(),
  };
}

export async function getUserConversations(userId: string): Promise<ConversationDto[]> {
  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ user1Id: userId }, { user2Id: userId }],
    },
    orderBy: [
      { lastMessageAt: 'desc' },
      { updatedAt: 'desc' },
    ],
    include: {
      user1: {
        select: {
          id: true,
          fullName: true,
          avatarUrl: true,
          profile: { select: { college: true } },
        },
      },
      user2: {
        select: {
          id: true,
          fullName: true,
          avatarUrl: true,
          profile: { select: { college: true } },
        },
      },
      messages: {
        take: 1,
        orderBy: { createdAt: 'desc' },
        include: {
          sender: { select: { id: true, fullName: true, avatarUrl: true } },
        },
      },
    },
  });

  // Filter out any conversations where either user has blocked the other
  const blocks = await prisma.userBlock.findMany({
    where: {
      OR: [{ blockerId: userId }, { blockedId: userId }],
    },
  });

  const blockedUserIds = new Set(
    blocks.map((b) => (b.blockerId === userId ? b.blockedId : b.blockerId))
  );

  const results: ConversationDto[] = [];

  for (const conv of conversations) {
    const otherUser = conv.user1Id === userId ? conv.user2 : conv.user1;
    if (blockedUserIds.has(otherUser.id)) {
      continue;
    }

    const unreadCount = await prisma.message.count({
      where: {
        conversationId: conv.id,
        senderId: { not: userId },
        isRead: false,
      },
    });

    results.push({
      id: conv.id,
      participant: {
        id: otherUser.id,
        fullName: otherUser.fullName,
        avatarUrl: otherUser.avatarUrl,
        college: otherUser.profile?.college || undefined,
        isOnline: isUserOnline(otherUser.id),
      },
      lastMessage: conv.messages[0] ? formatMessageDto(conv.messages[0]) : null,
      unreadCount,
      createdAt: conv.createdAt.toISOString(),
      updatedAt: conv.updatedAt.toISOString(),
    });
  }

  return results;
}

export async function getConversationMessages(
  userId: string,
  conversationId: string,
  limit = 40,
  beforeMessageId?: string
): Promise<MessageDto[]> {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    throw new AppError('Conversation not found', HTTP_STATUS.NOT_FOUND);
  }

  if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
    throw new AppError('Unauthorized access to conversation', HTTP_STATUS.FORBIDDEN);
  }

  const otherUserId = conversation.user1Id === userId ? conversation.user2Id : conversation.user1Id;
  const isBlocked = await checkBlockBetween(userId, otherUserId);
  if (isBlocked) {
    throw new AppError('Access to this conversation is restricted', HTTP_STATUS.FORBIDDEN);
  }

  let cursorFilter = {};
  if (beforeMessageId) {
    const refMsg = await prisma.message.findUnique({
      where: { id: beforeMessageId },
      select: { createdAt: true },
    });
    if (refMsg) {
      cursorFilter = {
        createdAt: { lt: refMsg.createdAt },
      };
    }
  }

  const messages = await prisma.message.findMany({
    where: {
      conversationId,
      ...cursorFilter,
    },
    take: Math.min(limit, 100),
    orderBy: { createdAt: 'desc' },
    include: {
      sender: {
        select: {
          id: true,
          fullName: true,
          avatarUrl: true,
        },
      },
    },
  });

  // Return in chronological ascending order
  return messages.reverse().map(formatMessageDto);
}

export async function sendMessage(
  senderId: string,
  conversationId: string,
  input: SendMessageInput
): Promise<MessageDto> {
  const { content, type = 'TEXT', metadata, clientTempId } = input;

  if (!content || !content.trim()) {
    throw new AppError('Message content cannot be empty', HTTP_STATUS.BAD_REQUEST);
  }

  if (content.length > 5000) {
    throw new AppError('Message exceeds maximum length of 5000 characters', HTTP_STATUS.BAD_REQUEST);
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      user1: { select: { id: true, fullName: true } },
      user2: { select: { id: true, fullName: true } },
    },
  });

  if (!conversation) {
    throw new AppError('Conversation not found', HTTP_STATUS.NOT_FOUND);
  }

  if (conversation.user1Id !== senderId && conversation.user2Id !== senderId) {
    throw new AppError('Unauthorized: You are not a participant in this conversation', HTTP_STATUS.FORBIDDEN);
  }

  const recipientId = conversation.user1Id === senderId ? conversation.user2Id : conversation.user1Id;

  // Enforce blocking rule
  const isBlocked = await checkBlockBetween(senderId, recipientId);
  if (isBlocked) {
    throw new AppError('Cannot send message due to privacy restrictions', HTTP_STATUS.FORBIDDEN);
  }

  // Idempotency: Prevent duplicate message if client retry with same clientTempId within 60s
  if (clientTempId) {
    const recentDuplicate = await prisma.message.findFirst({
      where: {
        conversationId,
        senderId,
        clientTempId,
        createdAt: { gte: new Date(Date.now() - 60 * 1000) },
      },
      include: {
        sender: { select: { id: true, fullName: true, avatarUrl: true } },
      },
    });

    if (recentDuplicate) {
      return formatMessageDto(recentDuplicate);
    }
  }

  const now = new Date();

  // Create message and update conversation in transaction
  const [createdMessage] = await prisma.$transaction([
    prisma.message.create({
      data: {
        conversationId,
        senderId,
        type,
        content: content.trim(),
        metadata: (metadata as any) || undefined,
        clientTempId: clientTempId || null,
        createdAt: now,
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    }),
    prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageAt: now,
      },
    }),
  ]);

  const dto = formatMessageDto(createdMessage);

  // Emit real-time events via Socket.IO
  try {
    const io = getSocketIO();
    if (io) {
      // Emit to conversation room (for clients currently on the chat view)
      io.to(`conversation:${conversationId}`).emit(SOCKET_EVENTS.MESSAGE_NEW, dto);

      // Also deliver directly to both participants' user rooms (for conversation list badge updates)
      sendToUser(recipientId, SOCKET_EVENTS.MESSAGE_NEW, dto);
      sendToUser(senderId, SOCKET_EVENTS.MESSAGE_NEW, dto);
    }
  } catch {
    // Sockets failure should not break HTTP response
  }

  // Send persistent notification to recipient
  try {
    const sender = conversation.user1Id === senderId ? conversation.user1 : conversation.user2;
    await createNotification({
      userId: recipientId,
      actorId: senderId,
      type: 'NEW_MESSAGE',
      title: `New message from ${sender.fullName}`,
      body: type === 'CODE' ? `Shared a code snippet: ${content.slice(0, 60)}...` : content.slice(0, 100),
      data: {
        conversationId,
        messageId: dto.id,
      },
    });
  } catch {
    // Non-blocking notification
  }

  return dto;
}

export async function markConversationAsRead(
  userId: string,
  conversationId: string
): Promise<{ markedCount: number; readAt: string }> {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    throw new AppError('Conversation not found', HTTP_STATUS.NOT_FOUND);
  }

  if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
    throw new AppError('Unauthorized access to conversation', HTTP_STATUS.FORBIDDEN);
  }

  const now = new Date();
  const updateResult = await prisma.message.updateMany({
    where: {
      conversationId,
      senderId: { not: userId },
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: now,
    },
  });

  const otherUserId = conversation.user1Id === userId ? conversation.user2Id : conversation.user1Id;
  const readPayload = {
    conversationId,
    readerId: userId,
    readAt: now.toISOString(),
  };

  try {
    const io = getSocketIO();
    if (io) {
      io.to(`conversation:${conversationId}`).emit(SOCKET_EVENTS.MESSAGE_READ, readPayload);
      sendToUser(otherUserId, SOCKET_EVENTS.MESSAGE_READ, readPayload);
    }
  } catch {
    // Sockets failure should not break response
  }

  return {
    markedCount: updateResult.count,
    readAt: now.toISOString(),
  };
}
