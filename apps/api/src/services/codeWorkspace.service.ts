import { prisma } from '../config/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { HTTP_STATUS, STARTER_TEMPLATES, SUPPORTED_LANGUAGES } from '@peerlume/shared';
import type {
  CodeWorkspaceDto,
  CodeWorkspaceParticipantDto,
  CodeDocumentDto,
  DocumentRevisionDto,
  CreateCodeWorkspaceInput,
  UpdateCodeWorkspaceInput,
  AddWorkspaceParticipantInput,
  CreateCodeDocumentInput,
  UpdateCodeDocumentInput,
  WorkspaceRole,
} from '@peerlume/shared';
import { checkBlockBetween } from './chat.service.js';
import { codeSyncService } from './codeSync.service.js';

export function formatParticipantDto(p: any): CodeWorkspaceParticipantDto {
  return {
    id: p.id,
    userId: p.userId,
    fullName: p.user?.fullName || 'Student',
    avatarUrl: p.user?.avatarUrl || null,
    role: p.role as WorkspaceRole,
    joinedAt: (p.joinedAt ? new Date(p.joinedAt) : new Date()).toISOString(),
  };
}

export function formatDocumentDto(d: any): CodeDocumentDto {
  return {
    id: d.id,
    workspaceId: d.workspaceId,
    title: d.title,
    language: d.language,
    content: d.content || '',
    version: d.version || 1,
    createdAt: (d.createdAt ? new Date(d.createdAt) : new Date()).toISOString(),
    updatedAt: (d.updatedAt ? new Date(d.updatedAt) : new Date()).toISOString(),
  };
}

export function formatRevisionDto(r: any): DocumentRevisionDto {
  return {
    id: r.id,
    workspaceId: r.workspaceId,
    documentId: r.documentId,
    content: r.content,
    language: r.language,
    description: r.description || null,
    createdById: r.createdById,
    creatorName: r.createdBy?.fullName || 'Student',
    createdAt: (r.createdAt ? new Date(r.createdAt) : new Date()).toISOString(),
  };
}

export function formatCodeWorkspaceDto(w: any, currentUserId?: string): CodeWorkspaceDto {
  const currentParticipant = currentUserId
    ? w.participants?.find((p: any) => p.userId === currentUserId)
    : undefined;

  return {
    id: w.id,
    title: w.title,
    description: w.description || null,
    sessionId: w.sessionId || null,
    sessionTitle: w.session?.title || null,
    creatorId: w.creatorId,
    creatorName: w.creator?.fullName || 'Student',
    participants: (w.participants || []).map(formatParticipantDto),
    documents: (w.documents || []).map(formatDocumentDto),
    currentRole: currentParticipant ? (currentParticipant.role as WorkspaceRole) : undefined,
    createdAt: (w.createdAt ? new Date(w.createdAt) : new Date()).toISOString(),
    updatedAt: (w.updatedAt ? new Date(w.updatedAt) : new Date()).toISOString(),
  };
}

function getLanguageExtension(languageId: string): string {
  const found = SUPPORTED_LANGUAGES.find((lang) => lang.id === languageId);
  return found ? found.extension : 'txt';
}

export async function createCodeWorkspace(
  creatorId: string,
  input: CreateCodeWorkspaceInput
): Promise<CodeWorkspaceDto> {
  const title = input.title?.trim();
  if (!title) {
    throw new AppError('Workspace title is required', HTTP_STATUS.BAD_REQUEST);
  }

  // If associated with a learning session, verify session exists and user is participant
  if (input.sessionId) {
    const session = await prisma.learningSession.findUnique({
      where: { id: input.sessionId },
      include: { participants: true },
    });
    if (!session) {
      throw new AppError('Associated learning session not found', HTTP_STATUS.NOT_FOUND);
    }
    const isParticipant =
      session.organizerId === creatorId ||
      session.participants.some((p) => p.userId === creatorId && p.status === 'ACCEPTED');
    if (!isParticipant) {
      throw new AppError(
        'You must be a confirmed participant of the session to create a linked workspace',
        HTTP_STATUS.FORBIDDEN
      );
    }
  }

  // Validate language
  const language = (input.initialLanguage || 'typescript').toLowerCase();
  const isValidLang = SUPPORTED_LANGUAGES.some((l) => l.id === language);
  const selectedLang = isValidLang ? language : 'typescript';
  const extension = getLanguageExtension(selectedLang);

  const initialDocTitle = input.initialDocumentTitle?.trim() || `main.${extension}`;
  const initialDocContent =
    input.initialContent !== undefined ? input.initialContent : (STARTER_TEMPLATES[selectedLang] || '');

  // Filter valid collaborators (no blocks, not self)
  const validCollaboratorIds: string[] = [];
  if (input.collaboratorIds && input.collaboratorIds.length > 0) {
    for (const collabId of input.collaboratorIds) {
      if (collabId === creatorId) continue;
      const isBlocked = await checkBlockBetween(creatorId, collabId);
      if (!isBlocked) {
        validCollaboratorIds.push(collabId);
      }
    }
  }

  const workspace = await prisma.codeWorkspace.create({
    data: {
      title,
      description: input.description?.trim() || null,
      sessionId: input.sessionId || null,
      creatorId,
      participants: {
        create: [
          { userId: creatorId, role: 'OWNER' },
          ...validCollaboratorIds.map((collabId) => ({
            userId: collabId,
            role: 'EDITOR' as WorkspaceRole,
          })),
        ],
      },
      documents: {
        create: {
          title: initialDocTitle,
          language: selectedLang,
          content: initialDocContent,
          version: 1,
        },
      },
    },
    include: {
      creator: { select: { id: true, fullName: true, avatarUrl: true } },
      session: { select: { id: true, title: true } },
      participants: {
        include: {
          user: { select: { id: true, fullName: true, avatarUrl: true } },
        },
      },
      documents: true,
    },
  });

  // Create initial revision snapshot for the starter document
  if (workspace.documents.length > 0) {
    const firstDoc = workspace.documents[0];
    await prisma.documentRevision.create({
      data: {
        workspaceId: workspace.id,
        documentId: firstDoc.id,
        content: firstDoc.content,
        language: firstDoc.language,
        description: 'Initial workspace template',
        createdById: creatorId,
      },
    });
  }

  return formatCodeWorkspaceDto(workspace, creatorId);
}

export async function listUserWorkspaces(userId: string): Promise<CodeWorkspaceDto[]> {
  const workspaces = await prisma.codeWorkspace.findMany({
    where: {
      participants: {
        some: { userId },
      },
    },
    include: {
      creator: { select: { id: true, fullName: true, avatarUrl: true } },
      session: { select: { id: true, title: true } },
      participants: {
        include: {
          user: { select: { id: true, fullName: true, avatarUrl: true } },
        },
      },
      documents: true,
    },
    orderBy: { updatedAt: 'desc' },
  });

  return workspaces.map((w) => formatCodeWorkspaceDto(w, userId));
}

export async function getCodeWorkspaceById(
  userId: string,
  workspaceId: string
): Promise<CodeWorkspaceDto> {
  const workspace = await prisma.codeWorkspace.findUnique({
    where: { id: workspaceId },
    include: {
      creator: { select: { id: true, fullName: true, avatarUrl: true } },
      session: { select: { id: true, title: true } },
      participants: {
        include: {
          user: { select: { id: true, fullName: true, avatarUrl: true } },
        },
      },
      documents: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!workspace) {
    throw new AppError('Code workspace not found', HTTP_STATUS.NOT_FOUND);
  }

  const isMember = workspace.participants.some((p) => p.userId === userId);
  if (!isMember) {
    throw new AppError('Access denied: You are not a collaborator in this workspace', HTTP_STATUS.FORBIDDEN);
  }

  // Block check with creator
  if (workspace.creatorId !== userId) {
    const isBlocked = await checkBlockBetween(userId, workspace.creatorId);
    if (isBlocked) {
      throw new AppError('Access denied: Block policy violation', HTTP_STATUS.FORBIDDEN);
    }
  }

  return formatCodeWorkspaceDto(workspace, userId);
}

export async function updateCodeWorkspace(
  userId: string,
  workspaceId: string,
  input: UpdateCodeWorkspaceInput
): Promise<CodeWorkspaceDto> {
  const workspace = await prisma.codeWorkspace.findUnique({
    where: { id: workspaceId },
    include: { participants: true },
  });

  if (!workspace) {
    throw new AppError('Code workspace not found', HTTP_STATUS.NOT_FOUND);
  }

  const userParticipant = workspace.participants.find((p) => p.userId === userId);
  if (!userParticipant || userParticipant.role !== 'OWNER') {
    throw new AppError('Unauthorized: Only the workspace owner can update settings', HTTP_STATUS.FORBIDDEN);
  }

  const updated = await prisma.codeWorkspace.update({
    where: { id: workspaceId },
    data: {
      title: input.title !== undefined ? input.title.trim() : undefined,
      description: input.description !== undefined ? input.description.trim() : undefined,
    },
    include: {
      creator: { select: { id: true, fullName: true, avatarUrl: true } },
      session: { select: { id: true, title: true } },
      participants: {
        include: {
          user: { select: { id: true, fullName: true, avatarUrl: true } },
        },
      },
      documents: true,
    },
  });

  return formatCodeWorkspaceDto(updated, userId);
}

export async function deleteCodeWorkspace(userId: string, workspaceId: string): Promise<void> {
  const workspace = await prisma.codeWorkspace.findUnique({
    where: { id: workspaceId },
    include: { participants: true },
  });

  if (!workspace) {
    throw new AppError('Code workspace not found', HTTP_STATUS.NOT_FOUND);
  }

  const userParticipant = workspace.participants.find((p) => p.userId === userId);
  if (!userParticipant || userParticipant.role !== 'OWNER') {
    throw new AppError('Unauthorized: Only the workspace owner can delete this workspace', HTTP_STATUS.FORBIDDEN);
  }

  await prisma.codeWorkspace.delete({
    where: { id: workspaceId },
  });
}

export async function addWorkspaceParticipant(
  userId: string,
  workspaceId: string,
  input: AddWorkspaceParticipantInput
): Promise<CodeWorkspaceParticipantDto> {
  const workspace = await prisma.codeWorkspace.findUnique({
    where: { id: workspaceId },
    include: { participants: true },
  });

  if (!workspace) {
    throw new AppError('Code workspace not found', HTTP_STATUS.NOT_FOUND);
  }

  const userParticipant = workspace.participants.find((p) => p.userId === userId);
  if (!userParticipant || userParticipant.role !== 'OWNER') {
    throw new AppError('Unauthorized: Only workspace owners can invite collaborators', HTTP_STATUS.FORBIDDEN);
  }

  const targetUserId = input.userId;
  if (!targetUserId) {
    throw new AppError('User ID is required', HTTP_STATUS.BAD_REQUEST);
  }

  const isBlocked = await checkBlockBetween(userId, targetUserId);
  if (isBlocked) {
    throw new AppError('Cannot add collaborator due to block restriction', HTTP_STATUS.FORBIDDEN);
  }

  const existing = workspace.participants.find((p) => p.userId === targetUserId);
  if (existing) {
    throw new AppError('User is already a participant in this workspace', HTTP_STATUS.BAD_REQUEST);
  }

  const role: WorkspaceRole = input.role === 'VIEWER' ? 'VIEWER' : 'EDITOR';

  const participant = await prisma.codeWorkspaceParticipant.create({
    data: {
      workspaceId,
      userId: targetUserId,
      role,
    },
    include: {
      user: { select: { id: true, fullName: true, avatarUrl: true } },
    },
  });

  return formatParticipantDto(participant);
}

export async function updateParticipantRole(
  userId: string,
  workspaceId: string,
  targetUserId: string,
  role: WorkspaceRole
): Promise<CodeWorkspaceParticipantDto> {
  const workspace = await prisma.codeWorkspace.findUnique({
    where: { id: workspaceId },
    include: { participants: true },
  });

  if (!workspace) {
    throw new AppError('Code workspace not found', HTTP_STATUS.NOT_FOUND);
  }

  const requester = workspace.participants.find((p) => p.userId === userId);
  if (!requester || requester.role !== 'OWNER') {
    throw new AppError('Unauthorized: Only workspace owners can change participant roles', HTTP_STATUS.FORBIDDEN);
  }

  if (targetUserId === workspace.creatorId && role !== 'OWNER') {
    throw new AppError('The workspace owner role cannot be downgraded', HTTP_STATUS.BAD_REQUEST);
  }

  const updated = await prisma.codeWorkspaceParticipant.update({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId: targetUserId,
      },
    },
    data: { role },
    include: {
      user: { select: { id: true, fullName: true, avatarUrl: true } },
    },
  });

  return formatParticipantDto(updated);
}

export async function removeWorkspaceParticipant(
  userId: string,
  workspaceId: string,
  targetUserId: string
): Promise<void> {
  const workspace = await prisma.codeWorkspace.findUnique({
    where: { id: workspaceId },
    include: { participants: true },
  });

  if (!workspace) {
    throw new AppError('Code workspace not found', HTTP_STATUS.NOT_FOUND);
  }

  const requester = workspace.participants.find((p) => p.userId === userId);
  if (!requester) {
    throw new AppError('Access denied: You are not a participant', HTTP_STATUS.FORBIDDEN);
  }

  // Can remove if requester is OWNER, or if user is removing themselves
  const isSelf = userId === targetUserId;
  const isOwner = requester.role === 'OWNER';

  if (!isSelf && !isOwner) {
    throw new AppError('Unauthorized: Only owners can remove other collaborators', HTTP_STATUS.FORBIDDEN);
  }

  if (targetUserId === workspace.creatorId) {
    throw new AppError('The workspace creator cannot be removed', HTTP_STATUS.BAD_REQUEST);
  }

  await prisma.codeWorkspaceParticipant.delete({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId: targetUserId,
      },
    },
  });
}

export async function createCodeDocument(
  userId: string,
  workspaceId: string,
  input: CreateCodeDocumentInput
): Promise<CodeDocumentDto> {
  const workspace = await prisma.codeWorkspace.findUnique({
    where: { id: workspaceId },
    include: { participants: true },
  });

  if (!workspace) {
    throw new AppError('Code workspace not found', HTTP_STATUS.NOT_FOUND);
  }

  const participant = workspace.participants.find((p) => p.userId === userId);
  if (!participant || participant.role === 'VIEWER') {
    throw new AppError('Unauthorized: Viewers cannot create new documents', HTTP_STATUS.FORBIDDEN);
  }

  const title = input.title?.trim();
  if (!title) {
    throw new AppError('Document title is required', HTTP_STATUS.BAD_REQUEST);
  }

  const language = (input.language || 'typescript').toLowerCase();
  const selectedLang = SUPPORTED_LANGUAGES.some((l) => l.id === language) ? language : 'typescript';
  const content = input.content !== undefined ? input.content : (STARTER_TEMPLATES[selectedLang] || '');

  const document = await prisma.codeDocument.create({
    data: {
      workspaceId,
      title,
      language: selectedLang,
      content,
      version: 1,
    },
  });

  // Create initial revision
  await prisma.documentRevision.create({
    data: {
      workspaceId,
      documentId: document.id,
      content: document.content,
      language: document.language,
      description: `Created document ${document.title}`,
      createdById: userId,
    },
  });

  return formatDocumentDto(document);
}

export async function updateCodeDocument(
  userId: string,
  workspaceId: string,
  documentId: string,
  input: UpdateCodeDocumentInput
): Promise<CodeDocumentDto> {
  const workspace = await prisma.codeWorkspace.findUnique({
    where: { id: workspaceId },
    include: { participants: true },
  });

  if (!workspace) {
    throw new AppError('Code workspace not found', HTTP_STATUS.NOT_FOUND);
  }

  const participant = workspace.participants.find((p) => p.userId === userId);
  if (!participant || participant.role === 'VIEWER') {
    throw new AppError('Unauthorized: Viewers cannot edit document properties', HTTP_STATUS.FORBIDDEN);
  }

  const document = await prisma.codeDocument.findFirst({
    where: { id: documentId, workspaceId },
  });

  if (!document) {
    throw new AppError('Code document not found in this workspace', HTTP_STATUS.NOT_FOUND);
  }

  const updated = await prisma.codeDocument.update({
    where: { id: documentId },
    data: {
      title: input.title !== undefined ? input.title.trim() : undefined,
      language: input.language !== undefined ? input.language.toLowerCase() : undefined,
    },
  });

  return formatDocumentDto(updated);
}

export async function deleteCodeDocument(
  userId: string,
  workspaceId: string,
  documentId: string
): Promise<void> {
  const workspace = await prisma.codeWorkspace.findUnique({
    where: { id: workspaceId },
    include: {
      participants: true,
      documents: true,
    },
  });

  if (!workspace) {
    throw new AppError('Code workspace not found', HTTP_STATUS.NOT_FOUND);
  }

  const participant = workspace.participants.find((p) => p.userId === userId);
  if (!participant || participant.role === 'VIEWER') {
    throw new AppError('Unauthorized: Viewers cannot delete documents', HTTP_STATUS.FORBIDDEN);
  }

  if (workspace.documents.length <= 1) {
    throw new AppError('Cannot delete the only remaining document in the workspace', HTTP_STATUS.BAD_REQUEST);
  }

  await prisma.codeDocument.delete({
    where: { id: documentId },
  });
}

export async function listDocumentRevisions(
  userId: string,
  workspaceId: string,
  documentId: string
): Promise<DocumentRevisionDto[]> {
  const workspace = await prisma.codeWorkspace.findUnique({
    where: { id: workspaceId },
    include: { participants: true },
  });

  if (!workspace) {
    throw new AppError('Code workspace not found', HTTP_STATUS.NOT_FOUND);
  }

  const isMember = workspace.participants.some((p) => p.userId === userId);
  if (!isMember) {
    throw new AppError('Access denied: You are not a collaborator', HTTP_STATUS.FORBIDDEN);
  }

  const revisions = await prisma.documentRevision.findMany({
    where: { workspaceId, documentId },
    include: {
      createdBy: { select: { id: true, fullName: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return revisions.map(formatRevisionDto);
}

export async function restoreDocumentRevision(
  userId: string,
  workspaceId: string,
  documentId: string,
  revisionId: string
): Promise<CodeDocumentDto> {
  const workspace = await prisma.codeWorkspace.findUnique({
    where: { id: workspaceId },
    include: { participants: true },
  });

  if (!workspace) {
    throw new AppError('Code workspace not found', HTTP_STATUS.NOT_FOUND);
  }

  const participant = workspace.participants.find((p) => p.userId === userId);
  if (!participant || participant.role === 'VIEWER') {
    throw new AppError('Unauthorized: Viewers cannot restore revisions', HTTP_STATUS.FORBIDDEN);
  }

  const revision = await prisma.documentRevision.findFirst({
    where: { id: revisionId, workspaceId, documentId },
  });

  if (!revision) {
    throw new AppError('Revision checkpoint not found', HTTP_STATUS.NOT_FOUND);
  }

  // Update Yjs in-memory document if active
  codeSyncService.setDocumentText(documentId, revision.content);

  // Update CodeDocument in DB and record new revision
  const updatedDoc = await prisma.codeDocument.update({
    where: { id: documentId },
    data: {
      content: revision.content,
      language: revision.language,
      version: { increment: 1 },
    },
  });

  await prisma.documentRevision.create({
    data: {
      workspaceId,
      documentId,
      content: revision.content,
      language: revision.language,
      description: `Restored from revision created at ${new Date(revision.createdAt).toLocaleString()}`,
      createdById: userId,
    },
  });

  return formatDocumentDto(updatedDoc);
}
