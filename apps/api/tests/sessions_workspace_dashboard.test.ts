import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/config/prisma.js';
import { generateAccessToken } from '../src/utils/jwt.js';
import { checkAndDispatchReminders } from '../src/services/reminder.service.js';

describe('Phase 5: Session Scheduling, Workspace & Dashboard Tests', () => {
  const alice = {
    id: 'user-alice-uuid',
    email: 'alice@example.com',
    fullName: 'Alice Walker',
    createdAt: new Date(),
    updatedAt: new Date(),
    passwordHash: 'hashed',
    isEmailVerified: true,
    avatarUrl: null,
  };

  const bob = {
    id: 'user-bob-uuid',
    email: 'bob@example.com',
    fullName: 'Bob Smith',
    createdAt: new Date(),
    updatedAt: new Date(),
    passwordHash: 'hashed',
    isEmailVerified: true,
    avatarUrl: null,
  };

  const charlie = {
    id: 'user-charlie-uuid',
    email: 'charlie@example.com',
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

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(prisma, '$transaction').mockImplementation(async (arg: any) => {
      if (typeof arg === 'function') {
        return arg(prisma);
      }
      return Promise.all(arg);
    });
  });

  describe('Session Scheduling API', () => {
    it('POST /api/sessions should reject sessions scheduled in the past', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(alice as any);

      const pastStart = new Date(Date.now() - 3600 * 1000).toISOString();
      const pastEnd = new Date(Date.now() - 1800 * 1000).toISOString();

      const res = await request(app)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${aliceToken}`)
        .send({
          title: 'Past Algorithms Study',
          topic: 'Data Structures',
          startTime: pastStart,
          endTime: pastEnd,
          inviteeIds: [bob.id],
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toMatch(/cannot schedule a session in the past/i);
    });

    it('POST /api/sessions should reject endTime before or equal to startTime', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(alice as any);

      const futureStart = new Date(Date.now() + 3600 * 1000).toISOString();
      const earlierEnd = new Date(Date.now() + 1800 * 1000).toISOString();

      const res = await request(app)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${aliceToken}`)
        .send({
          title: 'Algorithms Study',
          topic: 'Data Structures',
          startTime: futureStart,
          endTime: earlierEnd,
          inviteeIds: [bob.id],
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toMatch(/Session end time must be strictly after start time/i);
    });

    it('POST /api/sessions should reject creating session with oneself only', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(alice as any);

      const futureStart = new Date(Date.now() + 3600 * 1000).toISOString();
      const futureEnd = new Date(Date.now() + 7200 * 1000).toISOString();

      const res = await request(app)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${aliceToken}`)
        .send({
          title: 'Solo Study',
          topic: 'Data Structures',
          startTime: futureStart,
          endTime: futureEnd,
          inviteeIds: [alice.id],
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toMatch(/You cannot invite yourself/i);
    });

    it('POST /api/sessions should reject if invitee has blocked organizer or is blocked', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(alice as any);
      vi.spyOn(prisma.userBlock, 'findFirst').mockResolvedValue({
        id: 'block-1',
        blockerId: bob.id,
        blockedId: alice.id,
        createdAt: new Date(),
      } as any);

      const futureStart = new Date(Date.now() + 3600 * 1000).toISOString();
      const futureEnd = new Date(Date.now() + 7200 * 1000).toISOString();

      const res = await request(app)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${aliceToken}`)
        .send({
          title: 'Algorithms with Bob',
          topic: 'Data Structures',
          startTime: futureStart,
          endTime: futureEnd,
          inviteeIds: [bob.id],
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toMatch(/active blocks/i);
    });

    it('POST /api/sessions creates valid session and notifies invitees', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(alice as any);
      vi.spyOn(prisma.userBlock, 'findFirst').mockResolvedValue(null);
      vi.spyOn(prisma.learningSession, 'findMany').mockResolvedValue([]); // No conflicts

      const futureStart = new Date(Date.now() + 86400 * 1000);
      const futureEnd = new Date(Date.now() + 90000 * 1000);

      const mockSession = {
        id: 'session-123',
        organizerId: alice.id,
        title: 'System Design Patterns',
        topic: 'Software Architecture',
        description: 'Review microservices and monoliths',
        objectives: 'Understand CAP theorem',
        startTime: futureStart,
        endTime: futureEnd,
        timeZone: 'UTC',
        mode: 'ONLINE',
        meetingUrl: null,
        location: null,
        notes: 'Bring whiteboard markers',
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
        organizer: alice,
        participants: [
          {
            id: 'part-1',
            sessionId: 'session-123',
            userId: alice.id,
            role: 'ORGANIZER',
            status: 'ACCEPTED',
            respondedAt: new Date(),
            user: alice,
          },
          {
            id: 'part-2',
            sessionId: 'session-123',
            userId: bob.id,
            role: 'INVITEE',
            status: 'PENDING',
            respondedAt: null,
            user: bob,
          },
        ],
        rescheduleProposals: [],
      };

      vi.spyOn(prisma.learningSession, 'create').mockResolvedValue(mockSession as any);
      vi.spyOn(prisma.notification, 'create').mockResolvedValue({} as any);

      const res = await request(app)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${aliceToken}`)
        .send({
          title: 'System Design Patterns',
          topic: 'Software Architecture',
          description: 'Review microservices and monoliths',
          objectives: 'Understand CAP theorem',
          startTime: futureStart.toISOString(),
          endTime: futureEnd.toISOString(),
          timeZone: 'UTC',
          mode: 'ONLINE',
          inviteeIds: [bob.id],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('session-123');
      expect(res.body.data.status).toBe('PENDING');
      expect(res.body.data.participants).toHaveLength(2);
    });

    it('GET /api/sessions/availability detects overlapping sessions', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(alice as any);

      const start = new Date(Date.now() + 3600 * 1000);
      const end = new Date(Date.now() + 7200 * 1000);

      vi.spyOn(prisma.learningSession, 'findMany').mockResolvedValue([
        {
          id: 'existing-session',
          title: 'Existing Conflict',
          startTime: start,
          endTime: end,
          organizerId: alice.id,
          participants: [{ userId: alice.id }],
        } as any,
      ]);

      const res = await request(app)
        .get('/api/sessions/availability')
        .set('Authorization', `Bearer ${aliceToken}`)
        .query({
          startTime: start.toISOString(),
          endTime: end.toISOString(),
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.hasConflict).toBe(true);
      expect(res.body.data.conflictingSessions).toHaveLength(1);
    });

    it('POST /api/sessions/:sessionId/accept accepts invitation if user is invitee', async () => {
      (vi.spyOn(prisma.user, 'findUnique') as any).mockResolvedValue(bob as any);

      const session = {
        id: 'session-123',
        status: 'PENDING',
        organizerId: alice.id,
        startTime: new Date(Date.now() + 3600 * 1000),
        endTime: new Date(Date.now() + 7200 * 1000),
        timeZone: 'UTC',
        mode: 'ONLINE',
        meetingUrl: null,
        participants: [
          { id: 'part-1', userId: alice.id, role: 'ORGANIZER', status: 'ACCEPTED', user: alice },
          { id: 'part-2', userId: bob.id, role: 'INVITEE', status: 'PENDING', user: bob },
        ],
        rescheduleProposals: [],
        organizer: alice,
      };

      (vi.spyOn(prisma.learningSession, 'findUnique') as any).mockResolvedValue({
        ...session,
        status: 'ACCEPTED',
      });
      vi.spyOn(prisma.sessionParticipant, 'update').mockResolvedValue({} as any);
      vi.spyOn(prisma.learningSession, 'update').mockResolvedValue({
        ...session,
        status: 'ACCEPTED',
      } as any);
      vi.spyOn(prisma.notification, 'create').mockResolvedValue({} as any);

      const res = await request(app)
        .post('/api/sessions/session-123/accept')
        .set('Authorization', `Bearer ${bobToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('ACCEPTED');
    });

    it('POST /api/sessions/:sessionId/accept rejects unauthorized user', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(charlie as any);

      const session = {
        id: 'session-123',
        status: 'PENDING',
        organizerId: alice.id,
        participants: [
          { id: 'part-1', userId: alice.id, role: 'ORGANIZER', status: 'ACCEPTED', user: alice },
          { id: 'part-2', userId: bob.id, role: 'INVITEE', status: 'PENDING', user: bob },
        ],
        rescheduleProposals: [],
        organizer: alice,
      };

      vi.spyOn(prisma.learningSession, 'findUnique').mockResolvedValue(session as any);

      const res = await request(app)
        .post('/api/sessions/session-123/accept')
        .set('Authorization', `Bearer ${charlieToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toMatch(/You do not have a pending invitation/i);
    });

    it('POST /api/sessions/:sessionId/reschedule proposes new date and notifies participants', async () => {
      (vi.spyOn(prisma.user, 'findUnique') as any).mockResolvedValue(bob as any);

      const newStart = new Date(Date.now() + 86400 * 1000);
      const newEnd = new Date(Date.now() + 90000 * 1000);

      const session = {
        id: 'session-123',
        status: 'ACCEPTED',
        organizerId: alice.id,
        startTime: new Date(Date.now() + 3600 * 1000),
        endTime: new Date(Date.now() + 7200 * 1000),
        timeZone: 'UTC',
        mode: 'ONLINE',
        meetingUrl: null,
        participants: [
          { id: 'part-1', userId: alice.id, role: 'ORGANIZER', status: 'ACCEPTED', user: alice },
          { id: 'part-2', userId: bob.id, role: 'INVITEE', status: 'ACCEPTED', user: bob },
        ],
        rescheduleProposals: [],
        organizer: alice,
      };

      (vi.spyOn(prisma.learningSession, 'findUnique') as any).mockResolvedValue({
        ...session,
        status: 'RESCHEDULE_REQUESTED',
        rescheduleProposals: [
          {
            id: 'prop-1',
            proposerId: bob.id,
            proposedStartTime: newStart,
            proposedEndTime: newEnd,
            proposedTimeZone: 'UTC',
            reason: 'Dentist appointment',
            status: 'PENDING',
            proposer: bob,
          },
        ],
      });
      vi.spyOn(prisma.learningSession, 'findMany').mockResolvedValue([]); // No conflicts
      vi.spyOn(prisma.rescheduleProposal, 'updateMany').mockResolvedValue({ count: 0 } as any);
      vi.spyOn(prisma.rescheduleProposal, 'create').mockResolvedValue({
        id: 'prop-1',
        sessionId: 'session-123',
        proposerId: bob.id,
        proposedStartTime: newStart,
        proposedEndTime: newEnd,
        proposedTimeZone: 'UTC',
        reason: 'Dentist appointment',
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
        proposer: bob,
      } as any);
      vi.spyOn(prisma.learningSession, 'update').mockResolvedValue({
        ...session,
        status: 'RESCHEDULE_REQUESTED',
      } as any);
      vi.spyOn(prisma.notification, 'create').mockResolvedValue({} as any);

      const res = await request(app)
        .post('/api/sessions/session-123/reschedule')
        .set('Authorization', `Bearer ${bobToken}`)
        .send({
          proposedStartTime: newStart.toISOString(),
          proposedEndTime: newEnd.toISOString(),
          reason: 'Dentist appointment',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('PENDING');
      expect(res.body.data.sessionId).toBe('session-123');
    });

    it('POST /api/sessions/:sessionId/cancel rejects unauthorized user', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(charlie as any);

      const session = {
        id: 'session-123',
        status: 'ACCEPTED',
        organizerId: alice.id,
        participants: [
          { id: 'part-1', userId: alice.id, role: 'ORGANIZER', status: 'ACCEPTED' },
          { id: 'part-2', userId: bob.id, role: 'INVITEE', status: 'ACCEPTED' },
        ],
      };

      vi.spyOn(prisma.learningSession, 'findUnique').mockResolvedValue(session as any);

      const res = await request(app)
        .post('/api/sessions/session-123/cancel')
        .set('Authorization', `Bearer ${charlieToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toMatch(/cannot cancel this session/i);
    });
  });

  describe('Session Reminders & Idempotency', () => {
    it('checkAndDispatchReminders dispatches notifications once and avoids duplicates', async () => {
      const now = new Date();
      const sessionStart = new Date(now.getTime() + 59 * 60 * 1000); // 59 minutes away
      const sessionEnd = new Date(sessionStart.getTime() + 60 * 60 * 1000);

      const mockSession = {
        id: 'session-remind-1',
        title: 'Algorithms 101',
        topic: 'Graph Theory',
        mode: 'ONLINE',
        organizerId: alice.id,
        startTime: sessionStart,
        endTime: sessionEnd,
        participants: [
          {
            userId: bob.id,
            status: 'ACCEPTED',
            user: bob,
          },
        ],
      };

      (vi.spyOn(prisma.learningSession, 'findMany') as any).mockResolvedValue([mockSession]);
      vi.spyOn(prisma.userBlock, 'findFirst').mockResolvedValue(null);
      vi.spyOn(prisma.notification, 'findFirst').mockResolvedValue(null);

      // First run: findUnique returns null (reminder not yet created)
      (vi.spyOn(prisma.sessionReminder, 'findUnique') as any).mockResolvedValue(null);
      vi.spyOn(prisma.sessionReminder, 'create').mockResolvedValue({} as any);
      const notifSpy = vi.spyOn(prisma.notification, 'create').mockResolvedValue({
        id: 'notif-1',
        userId: bob.id,
        actorId: alice.id,
        type: 'SESSION_REMINDER',
        title: 'Study Session in 60 minutes',
        body: 'Starting soon',
        isRead: false,
        data: null,
        createdAt: new Date(),
      } as any);

      const firstRun = await checkAndDispatchReminders();
      expect(firstRun.dispatchedCount).toBeGreaterThan(0);
      expect(notifSpy).toHaveBeenCalled();

      // Second run: findUnique returns existing reminder record -> skipped
      (vi.spyOn(prisma.sessionReminder, 'findUnique') as any).mockResolvedValue({
        id: 'rem-1',
        sessionId: 'session-remind-1',
        userId: bob.id,
        minutesBefore: 60,
        sentAt: new Date(),
      });

      const secondRun = await checkAndDispatchReminders();
      expect(secondRun.dispatchedCount).toBe(0);
    });
  });

  describe('Knowledge-Sharing Workspace API', () => {
    it('POST /api/resources creates private note', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(alice as any);

      const mockResource = {
        id: 'res-note-1',
        type: 'NOTE',
        title: 'Binary Search Notes',
        description: 'Key edge cases for off-by-one errors',
        content: '# Binary Search\nMid calculation: low + (high - low) / 2',
        url: null,
        language: null,
        fileKey: null,
        fileName: null,
        fileSize: null,
        mimeType: null,
        creatorId: alice.id,
        targetUserId: null,
        sessionId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        creator: alice,
        session: null,
      };

      vi.spyOn(prisma.learningResource, 'create').mockResolvedValue(mockResource as any);

      const res = await request(app)
        .post('/api/resources')
        .set('Authorization', `Bearer ${aliceToken}`)
        .send({
          type: 'NOTE',
          title: 'Binary Search Notes',
          description: 'Key edge cases for off-by-one errors',
          content: '# Binary Search\nMid calculation: low + (high - low) / 2',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.type).toBe('NOTE');
      expect(res.body.data.content).toContain('Binary Search');
    });

    it('POST /api/resources rejects dangerous javascript: URLs for links', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(alice as any);

      const res = await request(app)
        .post('/api/resources')
        .set('Authorization', `Bearer ${aliceToken}`)
        .send({
          type: 'LINK',
          title: 'Malicious Link',
          url: 'javascript:alert(1)',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toMatch(/Invalid URL/i);
    });

    it('POST /api/resources creates CODE_SNIPPET with preserved whitespace', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(alice as any);

      const snippet = 'def binary_search(arr, target):\n    low, high = 0, len(arr) - 1';

      const mockResource = {
        id: 'res-code-1',
        type: 'CODE',
        title: 'Binary Search in Python',
        content: snippet,
        url: null,
        language: 'python',
        fileKey: null,
        creatorId: alice.id,
        targetUserId: null,
        sessionId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        creator: alice,
        session: null,
      };

      vi.spyOn(prisma.learningResource, 'create').mockResolvedValue(mockResource as any);

      const res = await request(app)
        .post('/api/resources')
        .set('Authorization', `Bearer ${aliceToken}`)
        .send({
          type: 'CODE',
          title: 'Binary Search in Python',
          content: snippet,
          language: 'python',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.language).toBe('python');
      expect(res.body.data.content).toBe(snippet);
    });

    it('PATCH /api/resources/:resourceId rejects unauthorized edit', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(bob as any);

      const mockResource = {
        id: 'res-note-1',
        type: 'NOTE',
        title: 'Alice Notes',
        creatorId: alice.id,
        targetUserId: null,
        sessionId: null,
      };

      vi.spyOn(prisma.learningResource, 'findUnique').mockResolvedValue(mockResource as any);

      const res = await request(app)
        .patch('/api/resources/res-note-1')
        .set('Authorization', `Bearer ${bobToken}`)
        .send({ title: 'Hacked Notes' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toMatch(/Only the creator can edit this resource/i);
    });
  });

  describe('Learning Dashboard API', () => {
    it('GET /api/dashboard/summary aggregates real records accurately', async () => {
      (vi.spyOn(prisma.user, 'findUnique') as any).mockResolvedValue({
        ...alice,
        profile: {
          _count: {
            teachingSkills: 4,
            learningGoals: 3,
          },
        },
      });

      const s1Start = new Date('2026-10-01T10:00:00Z');
      const s1End = new Date('2026-10-01T11:30:00Z'); // 1.5 hours (90 minutes)

      (vi.spyOn(prisma.learningSession, 'findMany') as any).mockImplementation(async (args: any) => {
        if (args.where?.status?.in) {
          // upcoming sessions
          return [
            {
              id: 'sess-up-1',
              title: 'Upcoming Algo',
              topic: 'Graphs',
              startTime: new Date(Date.now() + 100000),
              endTime: new Date(Date.now() + 200000),
              timeZone: 'UTC',
              mode: 'ONLINE',
              status: 'ACCEPTED',
              organizer: alice,
              participants: [{ userId: alice.id, role: 'ORGANIZER', status: 'ACCEPTED', user: alice }],
              rescheduleProposals: [],
            },
          ];
        }
        if (args.where?.status === 'PENDING') {
          // pending invitations
          return [];
        }
        if (args.where?.status === 'COMPLETED') {
          // completed sessions
          return [
            {
              id: 'sess-done-1',
              title: 'Completed Graph Theory',
              startTime: s1Start,
              endTime: s1End,
              updatedAt: s1End,
            },
          ];
        }
        return [];
      });

      vi.spyOn(prisma.learningResource, 'findMany').mockResolvedValue([]);
      vi.spyOn(prisma.learningResource, 'count').mockResolvedValue(5);

      const res = await request(app)
        .get('/api/dashboard/summary')
        .set('Authorization', `Bearer ${aliceToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.upcomingSessionsCount).toBe(1);
      expect(res.body.data.pendingInvitationsCount).toBe(0);
      expect(res.body.data.completedSessionsCount).toBe(1);
      expect(res.body.data.totalStudyHours).toBe(1.5);
      expect(res.body.data.learningGoalsCount).toBe(3);
      expect(res.body.data.teachingSkillsCount).toBe(4);
      expect(res.body.data.sharedResourcesCount).toBe(5);
      expect(res.body.data.recentActivity).toHaveLength(1);
      expect(res.body.data.recentActivity[0].title).toContain('Completed study session');
    });
  });
});
