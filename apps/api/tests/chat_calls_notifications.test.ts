import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/config/prisma.js';
import { generateAccessToken } from '../src/utils/jwt.js';

describe('Phase 4: Real-Time Chat, Calls & Notifications Tests', () => {
  const alice = {
    id: 'user-alice-1111',
    email: 'alice@college.edu',
    fullName: 'Alice Walker',
    createdAt: new Date(),
    updatedAt: new Date(),
    passwordHash: 'hashed',
    isEmailVerified: true,
    avatarUrl: null,
    profile: { college: 'Engineering Institute' },
  };

  const bob = {
    id: 'user-bob-2222',
    email: 'bob@college.edu',
    fullName: 'Bob Smith',
    createdAt: new Date(),
    updatedAt: new Date(),
    passwordHash: 'hashed',
    isEmailVerified: true,
    avatarUrl: null,
    profile: { college: 'Technology Institute' },
  };

  const charlie = {
    id: 'user-charlie-3333',
    email: 'charlie@college.edu',
    fullName: 'Charlie Davis',
    createdAt: new Date(),
    updatedAt: new Date(),
    passwordHash: 'hashed',
    isEmailVerified: true,
    avatarUrl: null,
    profile: { college: 'Arts College' },
  };

  const tokenAlice = generateAccessToken({ userId: alice.id, email: alice.email });
  const tokenBob = generateAccessToken({ userId: bob.id, email: bob.email });
  const tokenCharlie = generateAccessToken({ userId: charlie.id, email: charlie.email });

  const mockConversation = {
    id: 'conv-alice-bob-9999',
    user1Id: alice.id < bob.id ? alice.id : bob.id,
    user2Id: alice.id < bob.id ? bob.id : alice.id,
    lastMessageAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    user1: alice,
    user2: bob,
    messages: [],
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // ---------------------------------------------------------------------------
  // 1. Private Chat & Messaging Tests
  // ---------------------------------------------------------------------------
  describe('Messaging API', () => {
    it('POST /api/conversations/direct should create or return direct conversation', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(bob as any);
      vi.spyOn(prisma.userBlock, 'findFirst').mockResolvedValue(null);
      vi.spyOn(prisma.conversation, 'findUnique').mockResolvedValue(mockConversation as any);
      vi.spyOn(prisma.message, 'count').mockResolvedValue(0);

      const res = await request(app)
        .post('/api/conversations/direct')
        .set('Authorization', `Bearer ${tokenAlice}`)
        .send({ targetUserId: bob.id });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(mockConversation.id);
      expect(res.body.data.participant.id).toBe(bob.id);
    });

    it('POST /api/conversations/direct should reject self-conversation', async () => {
      const res = await request(app)
        .post('/api/conversations/direct')
        .set('Authorization', `Bearer ${tokenAlice}`)
        .send({ targetUserId: alice.id });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toMatch(/cannot start a conversation with yourself/i);
    });

    it('POST /api/conversations/direct should block messaging if users blocked each other', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(bob as any);
      vi.spyOn(prisma.userBlock, 'findFirst').mockResolvedValue({ id: 'block-1' } as any);

      const res = await request(app)
        .post('/api/conversations/direct')
        .set('Authorization', `Bearer ${tokenAlice}`)
        .send({ targetUserId: bob.id });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toMatch(/privacy settings/i);
    });

    it('POST /api/conversations/:id/messages should persist valid text and code messages', async () => {
      vi.spyOn(prisma.conversation, 'findUnique').mockResolvedValue(mockConversation as any);
      vi.spyOn(prisma.userBlock, 'findFirst').mockResolvedValue(null);
      vi.spyOn(prisma.message, 'findFirst').mockResolvedValue(null); // No duplicate

      const mockCreatedMessage = {
        id: 'msg-1',
        conversationId: mockConversation.id,
        senderId: alice.id,
        type: 'CODE',
        content: 'const greet = () => console.log("Hello PeerLume!");',
        metadata: { language: 'typescript' },
        isRead: false,
        readAt: null,
        clientTempId: 'client-temp-123',
        createdAt: new Date(),
        sender: alice,
      };

      vi.spyOn(prisma, '$transaction').mockResolvedValue([mockCreatedMessage, mockConversation] as any);
      vi.spyOn(prisma.notification, 'create').mockResolvedValue({} as any);

      const res = await request(app)
        .post(`/api/conversations/${mockConversation.id}/messages`)
        .set('Authorization', `Bearer ${tokenAlice}`)
        .send({
          content: 'const greet = () => console.log("Hello PeerLume!");',
          type: 'CODE',
          metadata: { language: 'typescript' },
          clientTempId: 'client-temp-123',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.content).toBe(mockCreatedMessage.content);
      expect(res.body.data.type).toBe('CODE');
    });

    it('POST /api/conversations/:id/messages should prevent unauthorized third-party senders', async () => {
      vi.spyOn(prisma.conversation, 'findUnique').mockResolvedValue(mockConversation as any);

      // Charlie attempts to send a message to Alice and Bob's private conversation
      const res = await request(app)
        .post(`/api/conversations/${mockConversation.id}/messages`)
        .set('Authorization', `Bearer ${tokenCharlie}`)
        .send({ content: 'I am invading your private chat!' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toMatch(/not a participant/i);
    });

    it('POST /api/conversations/:id/messages should reject empty messages', async () => {
      const res = await request(app)
        .post(`/api/conversations/${mockConversation.id}/messages`)
        .set('Authorization', `Bearer ${tokenAlice}`)
        .send({ content: '   ' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toMatch(/content cannot be empty/i);
    });

    it('GET /api/conversations/:id/messages should forbid unauthorized access', async () => {
      vi.spyOn(prisma.conversation, 'findUnique').mockResolvedValue(mockConversation as any);

      const res = await request(app)
        .get(`/api/conversations/${mockConversation.id}/messages`)
        .set('Authorization', `Bearer ${tokenCharlie}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/conversations/:id/read should mark unread messages as read', async () => {
      vi.spyOn(prisma.conversation, 'findUnique').mockResolvedValue(mockConversation as any);
      vi.spyOn(prisma.message, 'updateMany').mockResolvedValue({ count: 3 });

      const res = await request(app)
        .post(`/api/conversations/${mockConversation.id}/read`)
        .set('Authorization', `Bearer ${tokenBob}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.markedCount).toBe(3);
    });
  });

  // ---------------------------------------------------------------------------
  // 2. Audio & Video Calling Tests
  // ---------------------------------------------------------------------------
  describe('Calling API', () => {
    const mockCall = {
      id: 'call-101',
      callerId: alice.id,
      receiverId: bob.id,
      type: 'VIDEO',
      status: 'INITIATED',
      startedAt: null,
      endedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      caller: alice,
      receiver: bob,
    };

    it('GET /api/calls/config should return ICE server configuration safely without leaking credentials', async () => {
      const res = await request(app)
        .get('/api/calls/config')
        .set('Authorization', `Bearer ${tokenAlice}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.iceServers)).toBe(true);
      expect(res.body.data.iceServers.length).toBeGreaterThan(0);
      expect(res.body.data.iceServers[0].urls).toBeDefined();
    });

    it('POST /api/calls should initiate genuine call session between connected students', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(bob as any);
      vi.spyOn(prisma.userBlock, 'findFirst').mockResolvedValue(null);
      vi.spyOn(prisma.callSession, 'updateMany').mockResolvedValue({ count: 0 });
      vi.spyOn(prisma.callSession, 'create').mockResolvedValue(mockCall as any);

      const res = await request(app)
        .post('/api/calls')
        .set('Authorization', `Bearer ${tokenAlice}`)
        .send({ receiverId: bob.id, type: 'VIDEO' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(mockCall.id);
      expect(res.body.data.callerId).toBe(alice.id);
      expect(res.body.data.status).toBe('INITIATED');
    });

    it('POST /api/calls should reject calls to self', async () => {
      const res = await request(app)
        .post('/api/calls')
        .set('Authorization', `Bearer ${tokenAlice}`)
        .send({ receiverId: alice.id, type: 'AUDIO' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toMatch(/cannot call yourself/i);
    });

    it('POST /api/calls/:callId/end should cleanly terminate call session', async () => {
      vi.spyOn(prisma.callSession, 'findUnique').mockResolvedValue(mockCall as any);
      vi.spyOn(prisma.callSession, 'update').mockResolvedValue({
        ...mockCall,
        status: 'ENDED',
        endedAt: new Date(),
      } as any);

      const res = await request(app)
        .post(`/api/calls/${mockCall.id}/end`)
        .set('Authorization', `Bearer ${tokenAlice}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('ENDED');
      expect(res.body.data.endedAt).not.toBeNull();
    });

    it('GET /api/calls/:callId should forbid unauthorized observers', async () => {
      vi.spyOn(prisma.callSession, 'findUnique').mockResolvedValue(mockCall as any);

      const res = await request(app)
        .get(`/api/calls/${mockCall.id}`)
        .set('Authorization', `Bearer ${tokenCharlie}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // 3. Persistent Notifications Tests
  // ---------------------------------------------------------------------------
  describe('Notifications API', () => {
    const mockNotification = {
      id: 'notif-1',
      userId: alice.id,
      actorId: bob.id,
      type: 'NEW_MESSAGE',
      title: 'New message from Bob Smith',
      body: 'Hey Alice, are you ready for study session?',
      data: { conversationId: mockConversation.id },
      isRead: false,
      readAt: null,
      createdAt: new Date(),
      actor: bob,
    };

    it('GET /api/notifications should return paginated notifications for current user', async () => {
      vi.spyOn(prisma.notification, 'count').mockResolvedValue(1);
      vi.spyOn(prisma.notification, 'findMany').mockResolvedValue([mockNotification] as any);

      const res = await request(app)
        .get('/api/notifications?page=1&pageSize=10')
        .set('Authorization', `Bearer ${tokenAlice}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items.length).toBe(1);
      expect(res.body.data.items[0].id).toBe(mockNotification.id);
      expect(res.body.data.items[0].type).toBe('NEW_MESSAGE');
    });

    it('GET /api/notifications/unread-count should return accurate unread badge count', async () => {
      vi.spyOn(prisma.notification, 'count').mockResolvedValue(4);

      const res = await request(app)
        .get('/api/notifications/unread-count')
        .set('Authorization', `Bearer ${tokenAlice}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.unreadCount).toBe(4);
    });

    it('PATCH /api/notifications/:id/read should mark notification read', async () => {
      vi.spyOn(prisma.notification, 'findUnique').mockResolvedValue(mockNotification as any);
      vi.spyOn(prisma.notification, 'update').mockResolvedValue({
        ...mockNotification,
        isRead: true,
        readAt: new Date(),
      } as any);

      const res = await request(app)
        .patch(`/api/notifications/${mockNotification.id}/read`)
        .set('Authorization', `Bearer ${tokenAlice}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isRead).toBe(true);
      expect(res.body.data.readAt).not.toBeNull();
    });

    it('PATCH /api/notifications/:id/read should prevent other users from modifying', async () => {
      vi.spyOn(prisma.notification, 'findUnique').mockResolvedValue(mockNotification as any);

      const res = await request(app)
        .patch(`/api/notifications/${mockNotification.id}/read`)
        .set('Authorization', `Bearer ${tokenCharlie}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/notifications/read-all should mark all notifications read for the user', async () => {
      vi.spyOn(prisma.notification, 'updateMany').mockResolvedValue({ count: 5 });

      const res = await request(app)
        .post('/api/notifications/read-all')
        .set('Authorization', `Bearer ${tokenAlice}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.count).toBe(5);
    });
  });
});
