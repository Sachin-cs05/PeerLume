import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/config/prisma.js';
import { generateAccessToken } from '../src/utils/jwt.js';

describe('Phase 3: Connections, Requests & Matching Tests', () => {
  const user1 = {
    id: 'user-1-uuid',
    email: 'alice@example.com',
    fullName: 'Alice Walker',
    createdAt: new Date(),
    updatedAt: new Date(),
    passwordHash: 'hashed',
    isEmailVerified: true,
    avatarUrl: null,
  };

  const user2 = {
    id: 'user-2-uuid',
    email: 'bob@example.com',
    fullName: 'Bob Smith',
    createdAt: new Date(),
    updatedAt: new Date(),
    passwordHash: 'hashed',
    isEmailVerified: true,
    avatarUrl: null,
  };

  const token1 = generateAccessToken({ userId: user1.id, email: user1.email });

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Connection Requests API', () => {
    it('POST /api/connections/requests should reject self-requests', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(user1 as any);

      const res = await request(app)
        .post('/api/connections/requests')
        .set('Authorization', `Bearer ${token1}`)
        .send({ receiverId: user1.id, message: 'Hello me' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toMatch(/cannot send a connection request to yourself/i);
    });

    it('POST /api/connections/requests should reject non-existent recipient', async () => {
      (vi.spyOn(prisma.user, 'findUnique') as any).mockImplementation(async (args: any) => {
        if (args.where.id === user1.id) return user1 as any;
        return null;
      });

      const res = await request(app)
        .post('/api/connections/requests')
        .set('Authorization', `Bearer ${token1}`)
        .send({ receiverId: 'non-existent-user', message: 'Hello' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/connections/requests should reject if blocked', async () => {
      (vi.spyOn(prisma.user, 'findUnique') as any).mockImplementation(async (args: any) => {
        if (args.where.id === user1.id) return user1 as any;
        if (args.where.id === user2.id) return user2 as any;
        return null;
      });

      vi.spyOn(prisma.userBlock, 'findFirst').mockResolvedValue({
        id: 'block-1',
        blockerId: user2.id,
        blockedId: user1.id,
        reason: null,
        createdAt: new Date(),
      } as any);

      const res = await request(app)
        .post('/api/connections/requests')
        .set('Authorization', `Bearer ${token1}`)
        .send({ receiverId: user2.id });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('USER_BLOCKED');
    });

    it('POST /api/connections/requests should reject if already friends', async () => {
      (vi.spyOn(prisma.user, 'findUnique') as any).mockImplementation(async (args: any) => {
        if (args.where.id === user1.id) return user1 as any;
        if (args.where.id === user2.id) return user2 as any;
        return null;
      });

      vi.spyOn(prisma.userBlock, 'findFirst').mockResolvedValue(null);
      vi.spyOn(prisma.friendship, 'findUnique').mockResolvedValue({
        id: 'friendship-1',
        user1Id: user1.id,
        user2Id: user2.id,
        createdAt: new Date(),
      } as any);

      const res = await request(app)
        .post('/api/connections/requests')
        .set('Authorization', `Bearer ${token1}`)
        .send({ receiverId: user2.id });

      expect(res.status).toBe(400);
      expect(res.body.error.message).toMatch(/already connected/i);
    });

    it('POST /api/connections/requests should reject duplicate pending request', async () => {
      (vi.spyOn(prisma.user, 'findUnique') as any).mockImplementation(async (args: any) => {
        if (args.where.id === user1.id) return user1 as any;
        if (args.where.id === user2.id) return user2 as any;
        return null;
      });

      vi.spyOn(prisma.userBlock, 'findFirst').mockResolvedValue(null);
      vi.spyOn(prisma.friendship, 'findUnique').mockResolvedValue(null);
      (vi.spyOn(prisma.friendRequest, 'findUnique') as any).mockImplementation(async (args: any) => {
        if (args.where.senderId_receiverId?.senderId === user1.id) {
          return {
            id: 'req-1',
            senderId: user1.id,
            receiverId: user2.id,
            status: 'PENDING',
            message: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          } as any;
        }
        return null;
      });

      const res = await request(app)
        .post('/api/connections/requests')
        .set('Authorization', `Bearer ${token1}`)
        .send({ receiverId: user2.id });

      expect(res.status).toBe(400);
      expect(res.body.error.message).toMatch(/already pending/i);
    });

    it('POST /api/connections/requests/:requestId/accept should prevent unauthorized mutation', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(user1 as any);

      vi.spyOn(prisma.friendRequest, 'findUnique').mockResolvedValue({
        id: 'req-99',
        senderId: 'other-user',
        receiverId: 'someone-else',
        status: 'PENDING',
        message: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const res = await request(app)
        .post('/api/connections/requests/req-99/accept')
        .set('Authorization', `Bearer ${token1}`);

      expect(res.status).toBe(403);
      expect(res.body.error.message).toMatch(/not authorized to accept this request/i);
    });

    it('DELETE /api/connections/requests/:requestId should allow sender to cancel pending request', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(user1 as any);

      vi.spyOn(prisma.friendRequest, 'findUnique').mockResolvedValue({
        id: 'req-10',
        senderId: user1.id,
        receiverId: user2.id,
        status: 'PENDING',
        message: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      vi.spyOn(prisma.friendRequest, 'delete').mockResolvedValue({} as any);

      const res = await request(app)
        .delete('/api/connections/requests/req-10')
        .set('Authorization', `Bearer ${token1}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Blocking & Privacy API', () => {
    it('POST /api/blocks/:studentId should reject self-blocking', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(user1 as any);

      const res = await request(app)
        .post(`/api/blocks/${user1.id}`)
        .set('Authorization', `Bearer ${token1}`)
        .send({ reason: 'Myself' });

      expect(res.status).toBe(400);
      expect(res.body.error.message).toMatch(/cannot block yourself/i);
    });

    it('POST /api/blocks/:studentId should block target student and cascade invalidate connections', async () => {
      (vi.spyOn(prisma.user, 'findUnique') as any).mockImplementation(async (args: any) => {
        if (args.where.id === user1.id) return user1 as any;
        if (args.where.id === user2.id) return user2 as any;
        return null;
      });

      vi.spyOn(prisma, '$transaction').mockImplementation(async (arg: any) => {
        if (Array.isArray(arg)) return Promise.all(arg);
        return arg(prisma);
      });
      vi.spyOn(prisma.userBlock, 'upsert').mockResolvedValue({ id: 'block-id' } as any);
      vi.spyOn(prisma.friendship, 'deleteMany').mockResolvedValue({ count: 1 });
      vi.spyOn(prisma.friendRequest, 'deleteMany').mockResolvedValue({ count: 1 });
      vi.spyOn(prisma.savedPartner, 'deleteMany').mockResolvedValue({ count: 1 });

      const res = await request(app)
        .post(`/api/blocks/${user2.id}`)
        .set('Authorization', `Bearer ${token1}`)
        .send({ reason: 'Inappropriate conduct' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('DELETE /api/blocks/:studentId should unblock student', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(user1 as any);

      vi.spyOn(prisma.userBlock, 'findUnique').mockResolvedValue({
        id: 'block-1',
        blockerId: user1.id,
        blockedId: user2.id,
      } as any);
      vi.spyOn(prisma.userBlock, 'delete').mockResolvedValue({} as any);

      const res = await request(app)
        .delete(`/api/blocks/${user2.id}`)
        .set('Authorization', `Bearer ${token1}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Saved Learning Partners API', () => {
    it('POST /api/saved-partners/:studentId should reject saving oneself', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(user1 as any);

      const res = await request(app)
        .post(`/api/saved-partners/${user1.id}`)
        .set('Authorization', `Bearer ${token1}`);

      expect(res.status).toBe(400);
      expect(res.body.error.message).toMatch(/cannot save yourself/i);
    });

    it('POST /api/saved-partners/:studentId should reject saving blocked student', async () => {
      (vi.spyOn(prisma.user, 'findUnique') as any).mockImplementation(async (args: any) => {
        if (args.where.id === user1.id) return user1 as any;
        if (args.where.id === user2.id) return user2 as any;
        return null;
      });

      vi.spyOn(prisma.userBlock, 'findFirst').mockResolvedValue({
        id: 'block-1',
        blockerId: user1.id,
        blockedId: user2.id,
      } as any);

      const res = await request(app)
        .post(`/api/saved-partners/${user2.id}`)
        .set('Authorization', `Bearer ${token1}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('USER_BLOCKED');
    });

    it('DELETE /api/saved-partners/:studentId should remove saved partner', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(user1 as any);

      vi.spyOn(prisma.savedPartner, 'deleteMany').mockResolvedValue({ count: 1 });

      const res = await request(app)
        .delete(`/api/saved-partners/${user2.id}`)
        .set('Authorization', `Bearer ${token1}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Discovery & Learning Partner Recommendations API', () => {
    it('GET /api/discovery/partners should exclude current user and blocked users', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue({
        ...user1,
        profile: {
          id: 'prof-1',
          college: 'Stanford University',
          branch: 'Computer Science',
          teachingSkills: [{ skill: { name: 'Python' } }],
          learningGoals: [{ skill: { name: 'React' } }],
          languages: ['English'],
        },
      } as any);

      vi.spyOn(prisma.userBlock, 'findMany').mockResolvedValue([
        { blockerId: user1.id, blockedId: 'blocked-student-id' } as any,
      ]);

      vi.spyOn(prisma.friendship, 'findMany').mockResolvedValue([]);
      vi.spyOn(prisma.savedPartner, 'findMany').mockResolvedValue([]);

      vi.spyOn(prisma.user, 'findMany').mockResolvedValue([
        {
          id: user2.id,
          fullName: user2.fullName,
          avatarUrl: null,
          profile: {
            id: 'prof-2',
            college: 'Stanford University',
            degree: 'B.S.',
            branch: 'Computer Science',
            semester: '6th',
            bio: 'Loves frontend',
            preferredLearningMode: 'HYBRID',
            visibility: 'PUBLIC',
            languages: ['English'],
            teachingSkills: [{ skill: { name: 'React' } }],
            learningGoals: [{ skill: { name: 'Python' } }],
          },
        } as any,
      ]);

      vi.spyOn(prisma.userBlock, 'findFirst').mockResolvedValue(null);
      vi.spyOn(prisma.friendship, 'findUnique').mockResolvedValue(null);
      vi.spyOn(prisma.friendRequest, 'findUnique').mockResolvedValue(null);

      const res = await request(app)
        .get('/api/discovery/partners')
        .set('Authorization', `Bearer ${token1}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items.length).toBe(1);

      const recommendation = res.body.data.items[0];
      expect(recommendation.student.id).toBe(user2.id);
      expect(recommendation.matchScore).toBeGreaterThanOrEqual(80); // High score for mutual skills + languages + college
      expect(recommendation.explanations.length).toBeGreaterThan(0);

      // Verify truthful explanations
      const teachExplanation = recommendation.explanations.find(
        (e: any) => e.type === 'TEACH_TO_LEARN'
      );
      expect(teachExplanation).toBeDefined();
      expect(teachExplanation.skills).toContain('React');
    });

    it('GET /api/students should perform paginated search without leaking private data', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(user1 as any);
      vi.spyOn(prisma.userBlock, 'findMany').mockResolvedValue([]);
      vi.spyOn(prisma.user, 'count').mockResolvedValue(1);
      vi.spyOn(prisma.user, 'findMany').mockResolvedValue([
        {
          id: user2.id,
          fullName: user2.fullName,
          avatarUrl: null,
          profile: {
            id: 'prof-2',
            college: 'MIT',
            degree: 'B.Tech',
            branch: 'Electrical Engineering',
            semester: '4th',
            bio: 'Circuit lover',
            preferredLearningMode: 'ONLINE',
            visibility: 'PUBLIC',
            languages: ['English', 'Spanish'],
            teachingSkills: [{ skill: { name: 'Circuits' } }],
            learningGoals: [{ skill: { name: 'C++' } }],
          },
        } as any,
      ]);
      vi.spyOn(prisma.userBlock, 'findFirst').mockResolvedValue(null);
      vi.spyOn(prisma.friendship, 'findUnique').mockResolvedValue(null);
      vi.spyOn(prisma.friendRequest, 'findUnique').mockResolvedValue(null);

      const res = await request(app)
        .get('/api/students?page=1&limit=10')
        .set('Authorization', `Bearer ${token1}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items.length).toBe(1);
      expect(res.body.data.total).toBe(1);

      const student = res.body.data.items[0];
      // Verify no sensitive fields returned
      expect(student).not.toHaveProperty('passwordHash');
      expect(student).not.toHaveProperty('email');
      expect(student.fullName).toBe('Bob Smith');
      expect(student.college).toBe('MIT');
    });
  });
});
