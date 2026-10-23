import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/config/prisma.js';
import { generateAccessToken } from '../src/utils/jwt.js';
import { whiteboardSyncService } from '../src/services/whiteboardSync.service.js';

describe('Phase 7: Interactive Study Room, Whiteboard & Advanced UX Tests', () => {
  const alice = {
    id: 'user-alice-p7',
    email: 'alice.p7@example.com',
    fullName: 'Alice Walker',
    createdAt: new Date(),
    updatedAt: new Date(),
    passwordHash: 'hashed',
    isEmailVerified: true,
    avatarUrl: null,
  };

  const bob = {
    id: 'user-bob-p7',
    email: 'bob.p7@example.com',
    fullName: 'Bob Smith',
    createdAt: new Date(),
    updatedAt: new Date(),
    passwordHash: 'hashed',
    isEmailVerified: true,
    avatarUrl: null,
  };

  const charlie = {
    id: 'user-charlie-p7',
    email: 'charlie.p7@example.com',
    fullName: 'Charlie Green',
    createdAt: new Date(),
    updatedAt: new Date(),
    passwordHash: 'hashed',
    isEmailVerified: true,
    avatarUrl: null,
  };

  const aliceToken = generateAccessToken({ userId: alice.id, email: alice.email });
  const bobToken = generateAccessToken({ userId: bob.id, email: bob.email });
  const charlieToken = generateAccessToken({ userId: charlie.id, email: charlie.email });

  const mockRoom = {
    id: 'room-101',
    title: 'Calculus & Linear Algebra Group',
    topic: 'Eigenvalues & Multi-variable Calculus',
    description: 'Collaborative problem solving session',
    sessionId: null,
    creatorId: alice.id,
    isActive: true,
    endedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    creator: alice,
    participants: [
      {
        id: 'part-owner',
        roomId: 'room-101',
        userId: alice.id,
        role: 'OWNER',
        joinedAt: new Date(),
        leftAt: null,
        user: alice,
      },
      {
        id: 'part-editor',
        roomId: 'room-101',
        userId: bob.id,
        role: 'EDITOR',
        joinedAt: new Date(),
        leftAt: null,
        user: bob,
      },
    ],
    whiteboards: [
      {
        id: 'board-main',
        roomId: 'room-101',
        title: 'Main Board',
        elements: [],
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    whiteboardSyncService.clearCache();

    // Default mock user resolver
    (vi.spyOn(prisma.user, 'findUnique') as any).mockImplementation(async ({ where }: any) => {
      if (where.id === alice.id) return alice as any;
      if (where.id === bob.id) return bob as any;
      if (where.id === charlie.id) return charlie as any;
      return null;
    });

    // Default block resolver (no blocks)
    vi.spyOn(prisma.userBlock, 'findFirst').mockResolvedValue(null);
    vi.spyOn(prisma.userBlock, 'findMany').mockResolvedValue([]);
  });

  describe('Study Rooms API', () => {
    it('POST /api/study-rooms creates room, sets creator as OWNER, and initializes whiteboard', async () => {
      vi.spyOn(prisma.studyRoom, 'create').mockResolvedValue(mockRoom as any);

      const res = await request(app)
        .post('/api/study-rooms')
        .set('Authorization', `Bearer ${aliceToken}`)
        .send({
          title: 'Calculus & Linear Algebra Group',
          topic: 'Eigenvalues & Multi-variable Calculus',
          description: 'Collaborative problem solving session',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('room-101');
      expect(res.body.data.creatorId).toBe(alice.id);
      expect(res.body.data.whiteboards).toHaveLength(1);
    });

    it('POST /api/study-rooms rejects missing title or topic with 400', async () => {
      const res = await request(app)
        .post('/api/study-rooms')
        .set('Authorization', `Bearer ${aliceToken}`)
        .send({
          title: '',
          topic: '',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/study-rooms returns user accessible rooms', async () => {
      vi.spyOn(prisma.studyRoom, 'count').mockResolvedValue(1);
      vi.spyOn(prisma.studyRoom, 'findMany').mockResolvedValue([mockRoom] as any);

      const res = await request(app)
        .get('/api/study-rooms')
        .set('Authorization', `Bearer ${aliceToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.rooms).toHaveLength(1);
      expect(res.body.data.total).toBe(1);
    });

    it('GET /api/study-rooms/:roomId returns room details for participant', async () => {
      vi.spyOn(prisma.studyRoom, 'findUnique').mockResolvedValue(mockRoom as any);

      const res = await request(app)
        .get(`/api/study-rooms/${mockRoom.id}`)
        .set('Authorization', `Bearer ${bobToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe(mockRoom.title);
    });

    it('GET /api/study-rooms/:roomId rejects unauthorized non-participant', async () => {
      vi.spyOn(prisma.studyRoom, 'findUnique').mockResolvedValue(mockRoom as any);

      const res = await request(app)
        .get(`/api/study-rooms/${mockRoom.id}`)
        .set('Authorization', `Bearer ${charlieToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/study-rooms/:roomId/join joins connected user', async () => {
      (vi.spyOn(prisma.studyRoom, 'findUnique') as any).mockImplementation(async () => {
        return {
          ...mockRoom,
          participants: [
            mockRoom.participants[0],
            {
              id: 'part-charlie',
              roomId: mockRoom.id,
              userId: charlie.id,
              role: 'EDITOR',
              joinedAt: new Date(),
              leftAt: null,
              user: charlie,
            },
          ],
        } as any;
      });

      vi.spyOn(prisma.friendship, 'findFirst').mockResolvedValue({
        id: 'friendship-1',
        user1Id: alice.id,
        user2Id: charlie.id,
      } as any);

      vi.spyOn(prisma.studyRoomParticipant, 'update').mockResolvedValue({
        id: 'part-charlie',
        roomId: mockRoom.id,
        userId: charlie.id,
        role: 'EDITOR',
        joinedAt: new Date(),
        leftAt: null,
      } as any);

      vi.spyOn(prisma.studyRoomParticipant, 'create').mockResolvedValue({
        id: 'part-charlie',
        roomId: mockRoom.id,
        userId: charlie.id,
        role: 'EDITOR',
        joinedAt: new Date(),
        leftAt: null,
      } as any);

      const res = await request(app)
        .post(`/api/study-rooms/${mockRoom.id}/join`)
        .set('Authorization', `Bearer ${charlieToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('POST /api/study-rooms/:roomId/leave updates leftAt timestamp', async () => {
      vi.spyOn(prisma.studyRoomParticipant, 'findUnique').mockResolvedValue({
        id: 'part-editor',
        roomId: mockRoom.id,
        userId: bob.id,
      } as any);

      vi.spyOn(prisma.studyRoomParticipant, 'update').mockResolvedValue({
        id: 'part-editor',
        leftAt: new Date(),
      } as any);

      const res = await request(app)
        .post(`/api/study-rooms/${mockRoom.id}/leave`)
        .set('Authorization', `Bearer ${bobToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('POST /api/study-rooms/:roomId/end terminates room for owner and rejects non-owner', async () => {
      vi.spyOn(prisma.studyRoom, 'findUnique').mockResolvedValue(mockRoom as any);
      vi.spyOn(prisma.whiteboardDocument, 'findFirst').mockResolvedValue(mockRoom.whiteboards[0] as any);
      vi.spyOn(prisma.whiteboardDocument, 'update').mockResolvedValue({
        ...mockRoom.whiteboards[0],
        updatedAt: new Date(),
      } as any);
      vi.spyOn(prisma.whiteboardRevision, 'create').mockResolvedValue({} as any);
      vi.spyOn(prisma.studyRoom, 'update').mockResolvedValue({
        ...mockRoom,
        isActive: false,
        endedAt: new Date(),
      } as any);

      // Non-owner bob tries to end room -> rejected
      const failRes = await request(app)
        .post(`/api/study-rooms/${mockRoom.id}/end`)
        .set('Authorization', `Bearer ${bobToken}`);
      expect(failRes.status).toBe(403);

      // Owner alice ends room -> success
      const successRes = await request(app)
        .post(`/api/study-rooms/${mockRoom.id}/end`)
        .set('Authorization', `Bearer ${aliceToken}`);
      expect(successRes.status).toBe(200);
      expect(successRes.body.success).toBe(true);
    });
  });

  describe('Whiteboard Sync & Persistence', () => {
    it('applies draw steps incrementally and enforces viewer role rejection', async () => {
      vi.spyOn(prisma.whiteboardDocument, 'findFirst').mockResolvedValue(mockRoom.whiteboards[0] as any);

      // 1. Editor adds rectangle element
      const rectElement = {
        id: 'elem-rect-1',
        type: 'rectangle' as const,
        x: 50,
        y: 60,
        width: 120,
        height: 80,
        color: '#6366f1',
        strokeWidth: 2,
      };

      const stepResult = await whiteboardSyncService.applyDrawStep(
        bob.id,
        mockRoom.id,
        'board-main',
        { type: 'element:add', element: rectElement },
        'EDITOR'
      );

      expect(stepResult.elements).toHaveLength(1);
      expect(stepResult.elements[0].id).toBe('elem-rect-1');
      expect(stepResult.version).toBe(2);

      // 2. Viewer attempts to modify board -> rejected with AppError
      await expect(
        whiteboardSyncService.applyDrawStep(
          charlie.id,
          mockRoom.id,
          'board-main',
          { type: 'clear' },
          'VIEWER'
        )
      ).rejects.toThrow('Viewers cannot modify the whiteboard');
    });

    it('persists manual snapshots and restores past revisions', async () => {
      vi.spyOn(prisma.whiteboardDocument, 'findFirst').mockResolvedValue({
        ...mockRoom.whiteboards[0],
        elements: [
          {
            id: 'elem-text-1',
            type: 'text',
            text: 'E = mc^2',
            x: 100,
            y: 100,
            color: '#10b981',
            strokeWidth: 2,
          },
        ],
      } as any);

      vi.spyOn(prisma.whiteboardDocument, 'update').mockResolvedValue({
        id: 'board-main',
        version: 3,
        updatedAt: new Date(),
      } as any);

      vi.spyOn(prisma.whiteboardRevision, 'create').mockResolvedValue({
        id: 'rev-1',
        boardId: 'board-main',
        elements: [],
        createdById: alice.id,
        createdAt: new Date(),
      } as any);

      // Save manual checkpoint
      const saveRes = await whiteboardSyncService.saveBoardNow(
        alice.id,
        mockRoom.id,
        'board-main',
        'Initial physics formulas'
      );
      expect(saveRes.version).toBeDefined();

      // Mock revision restore
      vi.spyOn(prisma.whiteboardRevision, 'findUnique').mockResolvedValue({
        id: 'rev-old',
        boardId: 'board-main',
        elements: [
          {
            id: 'elem-line-1',
            type: 'line',
            x: 10,
            y: 10,
            width: 200,
            height: 200,
            color: '#f43f5e',
            strokeWidth: 3,
          },
        ],
        createdAt: new Date(),
      } as any);

      const restoreResult = await whiteboardSyncService.restoreRevision(
        alice.id,
        mockRoom.id,
        'board-main',
        'rev-old',
        'OWNER'
      );

      expect(restoreResult.elements).toHaveLength(1);
      expect(restoreResult.elements[0].id).toBe('elem-line-1');
    });

    it('survives simulated server restart by reloading state from database', async () => {
      const dbElements = [
        {
          id: 'restored-circle-1',
          type: 'circle',
          x: 200,
          y: 200,
          width: 50,
          height: 50,
          color: '#3b82f6',
          strokeWidth: 2,
        },
      ];

      vi.spyOn(prisma.whiteboardDocument, 'findFirst').mockResolvedValue({
        id: 'board-persisted',
        roomId: mockRoom.id,
        title: 'Main Board',
        elements: dbElements,
        version: 7,
        updatedAt: new Date(),
      } as any);

      // Clear in-memory active cache to simulate restart
      whiteboardSyncService.clearCache();

      const boardState = await whiteboardSyncService.getOrCreateBoard(mockRoom.id);
      expect(boardState.elements).toHaveLength(1);
      expect(boardState.elements[0].id).toBe('restored-circle-1');
      expect(boardState.version).toBe(7);
    });
  });

  describe('User Preferences & Theme API', () => {
    it('GET /api/preferences returns user preference defaulting to system', async () => {
      vi.spyOn(prisma.userPreference, 'findUnique').mockResolvedValue(null);
      vi.spyOn(prisma.userPreference, 'create').mockResolvedValue({
        id: 'pref-1',
        userId: alice.id,
        theme: 'system',
        emailNotifications: true,
        soundEnabled: true,
        reducedMotion: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const res = await request(app)
        .get('/api/preferences')
        .set('Authorization', `Bearer ${aliceToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.theme).toBe('system');
    });

    it('PATCH /api/preferences updates theme and accessibility preferences', async () => {
      vi.spyOn(prisma.userPreference, 'upsert').mockResolvedValue({
        id: 'pref-1',
        userId: alice.id,
        theme: 'dark',
        emailNotifications: false,
        soundEnabled: true,
        reducedMotion: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const res = await request(app)
        .patch('/api/preferences')
        .set('Authorization', `Bearer ${aliceToken}`)
        .send({
          theme: 'dark',
          reducedMotion: true,
          emailNotifications: false,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.theme).toBe('dark');
      expect(res.body.data.reducedMotion).toBe(true);
    });

    it('PATCH /api/preferences rejects invalid theme', async () => {
      const res = await request(app)
        .patch('/api/preferences')
        .set('Authorization', `Bearer ${aliceToken}`)
        .send({
          theme: 'neon-purple',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Global Search API', () => {
    it('GET /api/search returns categorized matching entities', async () => {
      // Mock friendship
      vi.spyOn(prisma.friendship, 'findMany').mockResolvedValue([
        {
          id: 'friend-1',
          user1Id: alice.id,
          user2Id: bob.id,
          user1: alice,
          user2: bob,
        },
      ] as any);

      // Mock student profile
      vi.spyOn(prisma.studentProfile, 'findMany').mockResolvedValue([
        {
          id: 'sp-1',
          userId: charlie.id,
          college: 'MIT',
          branch: 'Computer Science',
          user: charlie,
          teachingSkills: [{ skill: { name: 'Calculus' } }],
        },
      ] as any);

      // Mock sessions
      vi.spyOn(prisma.learningSession, 'findMany').mockResolvedValue([
        {
          id: 'session-calc',
          title: 'Advanced Calculus Workshop',
          topic: 'Calculus',
          status: 'ACCEPTED',
          startTime: new Date(),
          endTime: new Date(Date.now() + 3600000),
        },
      ] as any);

      // Mock resources, workspaces, and study rooms
      vi.spyOn(prisma.learningResource, 'findMany').mockResolvedValue([
        {
          id: 'res-1',
          title: 'Calculus Cheat Sheet',
          type: 'NOTE',
          mimeType: null,
          fileName: null,
        },
      ] as any);

      vi.spyOn(prisma.codeWorkspace, 'findMany').mockResolvedValue([]);
      vi.spyOn(prisma.studyRoom, 'findMany').mockResolvedValue([
        {
          id: 'room-calc',
          title: 'Calculus Study Room',
          topic: 'Calculus',
          isActive: true,
        },
      ] as any);

      const res = await request(app)
        .get('/api/search?q=Calculus')
        .set('Authorization', `Bearer ${aliceToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.total).toBeGreaterThan(0);
      expect(res.body.data.categories.sessions).toHaveLength(1);
      expect(res.body.data.categories.study_rooms).toHaveLength(1);
      expect(res.body.data.categories.resources).toHaveLength(1);
    });

    it('GET /api/search with empty query returns empty results without error', async () => {
      const res = await request(app)
        .get('/api/search?q=')
        .set('Authorization', `Bearer ${aliceToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.total).toBe(0);
      expect(res.body.data.results).toHaveLength(0);
    });
  });

  describe('Calendar Export API', () => {
    it('GET /api/sessions/:sessionId/export.ics exports RFC 5545 iCalendar file for authorized participant', async () => {
      vi.spyOn(prisma.learningSession, 'findUnique').mockResolvedValue({
        id: 'session-math-1',
        organizerId: alice.id,
        title: 'Multivariable Calculus Problem Set',
        topic: 'Mathematics',
        description: 'Reviewing gradient and curl exercises',
        startTime: new Date('2026-11-01T14:00:00Z'),
        endTime: new Date('2026-11-01T15:30:00Z'),
        status: 'ACCEPTED',
        location: null,
        meetingUrl: null,
        organizer: alice,
        participants: [{ userId: bob.id, status: 'ACCEPTED', user: bob }],
      } as any);

      const res = await request(app)
        .get('/api/sessions/session-math-1/export.ics')
        .set('Authorization', `Bearer ${bobToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/calendar');
      expect(res.headers['content-disposition']).toContain('.ics');
      expect(res.text).toContain('BEGIN:VCALENDAR');
      expect(res.text).toContain('BEGIN:VEVENT');
      expect(res.text).toContain('Multivariable Calculus Problem Set');
      expect(res.text).toContain('END:VCALENDAR');
    });

    it('GET /api/sessions/:sessionId/export.ics rejects unauthorized users', async () => {
      vi.spyOn(prisma.learningSession, 'findUnique').mockResolvedValue({
        id: 'session-math-1',
        organizerId: alice.id,
        title: 'Multivariable Calculus Problem Set',
        participants: [{ userId: bob.id, status: 'ACCEPTED', user: bob }],
      } as any);

      const res = await request(app)
        .get('/api/sessions/session-math-1/export.ics')
        .set('Authorization', `Bearer ${charlieToken}`);

      expect(res.status).toBe(403);
    });

    it('GET /api/sessions/calendar/export.ics exports all sessions for user', async () => {
      vi.spyOn(prisma.learningSession, 'findMany').mockResolvedValue([
        {
          id: 'session-1',
          title: 'Algorithms Review',
          topic: 'Graphs',
          description: 'Dijkstra and BFS',
          startTime: new Date('2026-11-02T10:00:00Z'),
          endTime: new Date('2026-11-02T11:00:00Z'),
          organizer: alice,
          location: null,
        },
      ] as any);

      const res = await request(app)
        .get('/api/sessions/calendar/export.ics')
        .set('Authorization', `Bearer ${aliceToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/calendar');
      expect(res.text).toContain('BEGIN:VCALENDAR');
      expect(res.text).toContain('Algorithms Review');
    });
  });
});
