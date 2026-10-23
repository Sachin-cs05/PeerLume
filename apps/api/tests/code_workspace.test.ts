import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import * as Y from 'yjs';
import { app } from '../src/app.js';
import { prisma } from '../src/config/prisma.js';
import { generateAccessToken } from '../src/utils/jwt.js';
import { codeSyncService } from '../src/services/codeSync.service.js';

describe('Phase 6: Real-Time Collaborative Code Editor Tests', () => {
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

  const mockWorkspace = {
    id: 'workspace-123',
    title: 'Algorithms & Data Structures',
    description: 'Practicing graph traversal',
    sessionId: null,
    creatorId: alice.id,
    createdAt: new Date(),
    updatedAt: new Date(),
    creator: alice,
    participants: [
      {
        id: 'part-1',
        workspaceId: 'workspace-123',
        userId: alice.id,
        role: 'OWNER',
        joinedAt: new Date(),
        user: alice,
      },
      {
        id: 'part-2',
        workspaceId: 'workspace-123',
        userId: bob.id,
        role: 'EDITOR',
        joinedAt: new Date(),
        user: bob,
      },
    ],
    documents: [
      {
        id: 'doc-1',
        workspaceId: 'workspace-123',
        title: 'main.ts',
        language: 'typescript',
        content: 'console.log("Hello, PeerLume!");',
        version: 1,
        yjsState: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(prisma, '$transaction').mockImplementation(async (arg: any) => {
      if (typeof arg === 'function') {
        return arg(prisma);
      }
      return Promise.all(arg);
    });
  });

  describe('Workspace Lifecycle & Permissions API', () => {
    it('POST /api/code-workspaces creates workspace with initial document and owner role', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(alice as any);
      vi.spyOn(prisma.userBlock, 'findFirst').mockResolvedValue(null);
      vi.spyOn(prisma.codeWorkspace, 'create').mockResolvedValue(mockWorkspace as any);
      vi.spyOn(prisma.documentRevision, 'create').mockResolvedValue({} as any);

      const res = await request(app)
        .post('/api/code-workspaces')
        .set('Cookie', [`peerlume_access_token=${aliceToken}`])
        .send({
          title: 'Algorithms & Data Structures',
          description: 'Practicing graph traversal',
          initialLanguage: 'typescript',
          collaboratorIds: [bob.id],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Algorithms & Data Structures');
      expect(res.body.data.creatorId).toBe(alice.id);
      expect(res.body.data.documents.length).toBe(1);
    });

    it('POST /api/code-workspaces rejects unauthenticated requests', async () => {
      const res = await request(app).post('/api/code-workspaces').send({
        title: 'Unauthorized Workspace',
      });

      expect(res.status).toBe(401);
    });

    it('POST /api/code-workspaces rejects missing workspace title', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(alice as any);

      const res = await request(app)
        .post('/api/code-workspaces')
        .set('Cookie', [`peerlume_access_token=${aliceToken}`])
        .send({
          title: '   ',
        });

      expect(res.status).toBe(400);
      const errMsg = res.body.error?.message || res.body.error;
      expect(errMsg).toContain('Workspace title is required');
    });

    it('GET /api/code-workspaces/:workspaceId returns workspace to collaborators', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(bob as any);
      vi.spyOn(prisma.codeWorkspace, 'findUnique').mockResolvedValue(mockWorkspace as any);
      vi.spyOn(prisma.userBlock, 'findFirst').mockResolvedValue(null);

      const res = await request(app)
        .get('/api/code-workspaces/workspace-123')
        .set('Cookie', [`peerlume_access_token=${bobToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.currentRole).toBe('EDITOR');
    });

    it('GET /api/code-workspaces/:workspaceId forbids non-collaborators', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(charlie as any);
      vi.spyOn(prisma.codeWorkspace, 'findUnique').mockResolvedValue(mockWorkspace as any);

      const res = await request(app)
        .get('/api/code-workspaces/workspace-123')
        .set('Cookie', [`peerlume_access_token=${charlieToken}`]);

      expect(res.status).toBe(403);
      const errMsg = res.body.error?.message || res.body.error;
      expect(errMsg).toContain('Access denied');
    });

    it('PATCH /api/code-workspaces/:workspaceId allows owner to rename workspace', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(alice as any);
      vi.spyOn(prisma.codeWorkspace, 'findUnique').mockResolvedValue(mockWorkspace as any);
      vi.spyOn(prisma.codeWorkspace, 'update').mockResolvedValue({
        ...mockWorkspace,
        title: 'Advanced Graph Algorithms',
      } as any);

      const res = await request(app)
        .patch('/api/code-workspaces/workspace-123')
        .set('Cookie', [`peerlume_access_token=${aliceToken}`])
        .send({ title: 'Advanced Graph Algorithms' });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Advanced Graph Algorithms');
    });

    it('PATCH /api/code-workspaces/:workspaceId forbids non-owner from renaming', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(bob as any);
      vi.spyOn(prisma.codeWorkspace, 'findUnique').mockResolvedValue(mockWorkspace as any);

      const res = await request(app)
        .patch('/api/code-workspaces/workspace-123')
        .set('Cookie', [`peerlume_access_token=${bobToken}`])
        .send({ title: 'Hacked Title' });

      expect(res.status).toBe(403);
      const errMsg = res.body.error?.message || res.body.error;
      expect(errMsg).toContain('Only the workspace owner can update');
    });

    it('DELETE /api/code-workspaces/:workspaceId forbids non-owner from deleting', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(bob as any);
      vi.spyOn(prisma.codeWorkspace, 'findUnique').mockResolvedValue(mockWorkspace as any);

      const res = await request(app)
        .delete('/api/code-workspaces/workspace-123')
        .set('Cookie', [`peerlume_access_token=${bobToken}`]);

      expect(res.status).toBe(403);
      const errMsg = res.body.error?.message || res.body.error;
      expect(errMsg).toContain('Only the workspace owner can delete');
    });
  });

  describe('Collaborator & Role Management API', () => {
    it('POST /api/code-workspaces/:workspaceId/participants allows owner to invite peer', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(alice as any);
      vi.spyOn(prisma.codeWorkspace, 'findUnique').mockResolvedValue(mockWorkspace as any);
      vi.spyOn(prisma.userBlock, 'findFirst').mockResolvedValue(null);
      vi.spyOn(prisma.codeWorkspaceParticipant, 'create').mockResolvedValue({
        id: 'part-3',
        workspaceId: 'workspace-123',
        userId: charlie.id,
        role: 'EDITOR',
        joinedAt: new Date(),
        user: charlie,
      } as any);

      const res = await request(app)
        .post('/api/code-workspaces/workspace-123/participants')
        .set('Cookie', [`peerlume_access_token=${aliceToken}`])
        .send({ userId: charlie.id, role: 'EDITOR' });

      expect(res.status).toBe(201);
      expect(res.body.data.userId).toBe(charlie.id);
      expect(res.body.data.role).toBe('EDITOR');
    });

    it('POST /api/code-workspaces/:workspaceId/participants rejects blocked user', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(alice as any);
      vi.spyOn(prisma.codeWorkspace, 'findUnique').mockResolvedValue(mockWorkspace as any);
      // Simulate block exists
      vi.spyOn(prisma.userBlock, 'findFirst').mockResolvedValue({
        id: 'block-1',
        blockerId: charlie.id,
        blockedId: alice.id,
        createdAt: new Date(),
      } as any);

      const res = await request(app)
        .post('/api/code-workspaces/workspace-123/participants')
        .set('Cookie', [`peerlume_access_token=${aliceToken}`])
        .send({ userId: charlie.id });

      expect(res.status).toBe(403);
      const errMsg = res.body.error?.message || res.body.error;
      expect(errMsg).toContain('block restriction');
    });

    it('PATCH /api/code-workspaces/:workspaceId/participants/:participantId updates role to VIEWER', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(alice as any);
      vi.spyOn(prisma.codeWorkspace, 'findUnique').mockResolvedValue(mockWorkspace as any);
      vi.spyOn(prisma.codeWorkspaceParticipant, 'update').mockResolvedValue({
        id: 'part-2',
        workspaceId: 'workspace-123',
        userId: bob.id,
        role: 'VIEWER',
        joinedAt: new Date(),
        user: bob,
      } as any);

      const res = await request(app)
        .patch('/api/code-workspaces/workspace-123/participants/user-bob-uuid')
        .set('Cookie', [`peerlume_access_token=${aliceToken}`])
        .send({ role: 'VIEWER' });

      expect(res.status).toBe(200);
      expect(res.body.data.role).toBe('VIEWER');
    });
  });

  describe('Document & Revision Management API', () => {
    it('POST /api/code-workspaces/:workspaceId/documents creates new file tab', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(alice as any);
      vi.spyOn(prisma.codeWorkspace, 'findUnique').mockResolvedValue(mockWorkspace as any);
      vi.spyOn(prisma.codeDocument, 'create').mockResolvedValue({
        id: 'doc-2',
        workspaceId: 'workspace-123',
        title: 'helper.ts',
        language: 'typescript',
        content: 'export const add = (a: number, b: number) => a + b;',
        version: 1,
        yjsState: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);
      vi.spyOn(prisma.documentRevision, 'create').mockResolvedValue({} as any);

      const res = await request(app)
        .post('/api/code-workspaces/workspace-123/documents')
        .set('Cookie', [`peerlume_access_token=${aliceToken}`])
        .send({ title: 'helper.ts', language: 'typescript' });

      expect(res.status).toBe(201);
      expect(res.body.data.title).toBe('helper.ts');
    });

    it('POST /api/code-workspaces/:workspaceId/documents forbids VIEWER role from creating files', async () => {
      const viewerWorkspace = {
        ...mockWorkspace,
        participants: [
          { ...mockWorkspace.participants[0] },
          { ...mockWorkspace.participants[1], role: 'VIEWER' },
        ],
      };
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(bob as any);
      vi.spyOn(prisma.codeWorkspace, 'findUnique').mockResolvedValue(viewerWorkspace as any);

      const res = await request(app)
        .post('/api/code-workspaces/workspace-123/documents')
        .set('Cookie', [`peerlume_access_token=${bobToken}`])
        .send({ title: 'unauthorized.ts', language: 'typescript' });

      expect(res.status).toBe(403);
      const errMsg = res.body.error?.message || res.body.error;
      expect(errMsg).toContain('Viewers cannot create new documents');
    });

    it('DELETE /api/code-workspaces/:workspaceId/documents/:documentId prevents deleting the only file', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(alice as any);
      vi.spyOn(prisma.codeWorkspace, 'findUnique').mockResolvedValue(mockWorkspace as any);

      const res = await request(app)
        .delete('/api/code-workspaces/workspace-123/documents/doc-1')
        .set('Cookie', [`peerlume_access_token=${aliceToken}`]);

      expect(res.status).toBe(400);
      const errMsg = res.body.error?.message || res.body.error;
      expect(errMsg).toContain('only remaining document');
    });

    it('POST /api/code-workspaces/:workspaceId/documents/:documentId/save records versioned snapshot', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(alice as any);
      vi.spyOn(prisma.codeDocument, 'findFirst').mockResolvedValue(mockWorkspace.documents[0] as any);
      vi.spyOn(prisma.codeDocument, 'update').mockResolvedValue({
        ...mockWorkspace.documents[0],
        version: 2,
        updatedAt: new Date(),
      } as any);
      vi.spyOn(prisma.documentRevision, 'create').mockResolvedValue({} as any);

      const res = await request(app)
        .post('/api/code-workspaces/workspace-123/documents/doc-1/save')
        .set('Cookie', [`peerlume_access_token=${aliceToken}`])
        .send({ description: 'Solved BFS algorithm' });

      expect(res.status).toBe(200);
      expect(res.body.data.version).toBe(2);
    });
  });

  describe('Yjs CRDT Document Synchronization & Persistence Service', () => {
    it('initializes in-memory Y.Doc and converges concurrent edits from peers', async () => {
      vi.spyOn(prisma.codeDocument, 'findFirst').mockResolvedValue({
        id: 'doc-sync-test',
        workspaceId: 'workspace-123',
        title: 'main.ts',
        language: 'typescript',
        content: 'const x = 1;',
        yjsState: null,
      } as any);

      const serverDoc = await codeSyncService.getOrCreateDoc('workspace-123', 'doc-sync-test');
      expect(serverDoc.getText('monaco').toString()).toBe('const x = 1;');

      // Encode initial state from serverDoc
      const initialSync = Y.encodeStateAsUpdate(serverDoc);

      // Peer 1 connects and syncs
      const clientDoc1 = new Y.Doc();
      Y.applyUpdate(clientDoc1, initialSync);
      const yText1 = clientDoc1.getText('monaco');

      // Peer 2 connects and syncs
      const clientDoc2 = new Y.Doc();
      Y.applyUpdate(clientDoc2, initialSync);
      const yText2 = clientDoc2.getText('monaco');

      // Peer 1 appends "\nconsole.log('Alice edit');"
      let updateFromPeer1: Uint8Array | null = null;
      clientDoc1.on('update', (u) => {
        updateFromPeer1 = u;
      });
      yText1.insert(yText1.length, "\nconsole.log('Alice edit');");

      // Peer 2 appends "\nconsole.log('Bob edit');"
      let updateFromPeer2: Uint8Array | null = null;
      clientDoc2.on('update', (u) => {
        updateFromPeer2 = u;
      });
      yText2.insert(yText2.length, "\nconsole.log('Bob edit');");

      // Apply updates to serverDoc via codeSyncService
      vi.spyOn(prisma.codeDocument, 'update').mockResolvedValue({} as any);

      if (updateFromPeer1) {
        await codeSyncService.applyUpdate('user-alice-uuid', 'workspace-123', 'doc-sync-test', updateFromPeer1, 'EDITOR');
      }
      if (updateFromPeer2) {
        await codeSyncService.applyUpdate('user-bob-uuid', 'workspace-123', 'doc-sync-test', updateFromPeer2, 'EDITOR');
      }

      // Server doc should contain edits from both peers
      const serverResult = serverDoc.getText('monaco').toString();
      expect(serverResult).toContain('Alice edit');
      expect(serverResult).toContain('Bob edit');
    });

    it('rejects code edits from users with VIEWER role', async () => {
      const dummyUpdate = new Uint8Array([0, 0]);
      await expect(
        codeSyncService.applyUpdate('user-bob-uuid', 'workspace-123', 'doc-sync-test', dummyUpdate, 'VIEWER')
      ).rejects.toThrow('Viewers cannot make edits to the code');
    });
  });
});
