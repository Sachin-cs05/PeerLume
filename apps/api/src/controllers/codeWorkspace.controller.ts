import type { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '@peerlume/shared';
import { sendSuccess } from '../utils/apiResponse.js';
import * as codeWorkspaceService from '../services/codeWorkspace.service.js';
import { codeSyncService } from '../services/codeSync.service.js';

export async function handleCreateWorkspace(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const workspace = await codeWorkspaceService.createCodeWorkspace(userId, req.body);
    sendSuccess(res, workspace, HTTP_STATUS.CREATED, 'Code workspace created successfully');
  } catch (error) {
    next(error);
  }
}

export async function handleListWorkspaces(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const workspaces = await codeWorkspaceService.listUserWorkspaces(userId);
    sendSuccess(res, workspaces, HTTP_STATUS.OK);
  } catch (error) {
    next(error);
  }
}

export async function handleGetWorkspace(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const workspaceId = req.params.workspaceId as string;
    const workspace = await codeWorkspaceService.getCodeWorkspaceById(userId, workspaceId);
    sendSuccess(res, workspace, HTTP_STATUS.OK);
  } catch (error) {
    next(error);
  }
}

export async function handleUpdateWorkspace(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const workspaceId = req.params.workspaceId as string;
    const updated = await codeWorkspaceService.updateCodeWorkspace(userId, workspaceId, req.body);
    sendSuccess(res, updated, HTTP_STATUS.OK, 'Workspace updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function handleDeleteWorkspace(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const workspaceId = req.params.workspaceId as string;
    await codeWorkspaceService.deleteCodeWorkspace(userId, workspaceId);
    sendSuccess(res, null, HTTP_STATUS.OK, 'Workspace deleted successfully');
  } catch (error) {
    next(error);
  }
}

export async function handleAddParticipant(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const workspaceId = req.params.workspaceId as string;
    const participant = await codeWorkspaceService.addWorkspaceParticipant(userId, workspaceId, req.body);
    sendSuccess(res, participant, HTTP_STATUS.CREATED, 'Collaborator added successfully');
  } catch (error) {
    next(error);
  }
}

export async function handleUpdateParticipantRole(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const workspaceId = req.params.workspaceId as string;
    const participantId = req.params.participantId as string;
    const { role } = req.body;
    const updated = await codeWorkspaceService.updateParticipantRole(userId, workspaceId, participantId, role);
    sendSuccess(res, updated, HTTP_STATUS.OK, 'Participant role updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function handleRemoveParticipant(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const workspaceId = req.params.workspaceId as string;
    const participantId = req.params.participantId as string;
    await codeWorkspaceService.removeWorkspaceParticipant(userId, workspaceId, participantId);
    sendSuccess(res, null, HTTP_STATUS.OK, 'Participant removed successfully');
  } catch (error) {
    next(error);
  }
}

export async function handleCreateDocument(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const workspaceId = req.params.workspaceId as string;
    const doc = await codeWorkspaceService.createCodeDocument(userId, workspaceId, req.body);
    sendSuccess(res, doc, HTTP_STATUS.CREATED, 'Document created successfully');
  } catch (error) {
    next(error);
  }
}

export async function handleUpdateDocument(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const workspaceId = req.params.workspaceId as string;
    const documentId = req.params.documentId as string;
    const updated = await codeWorkspaceService.updateCodeDocument(userId, workspaceId, documentId, req.body);
    sendSuccess(res, updated, HTTP_STATUS.OK, 'Document updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function handleDeleteDocument(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const workspaceId = req.params.workspaceId as string;
    const documentId = req.params.documentId as string;
    await codeWorkspaceService.deleteCodeDocument(userId, workspaceId, documentId);
    sendSuccess(res, null, HTTP_STATUS.OK, 'Document deleted successfully');
  } catch (error) {
    next(error);
  }
}

export async function handleSaveDocument(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const workspaceId = req.params.workspaceId as string;
    const documentId = req.params.documentId as string;
    const { description } = req.body;
    const result = await codeSyncService.saveDocumentNow(userId, workspaceId, documentId, description);
    sendSuccess(res, result, HTTP_STATUS.OK, 'Document saved successfully');
  } catch (error) {
    next(error);
  }
}

export async function handleListRevisions(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const workspaceId = req.params.workspaceId as string;
    const documentId = req.params.documentId as string;
    const revisions = await codeWorkspaceService.listDocumentRevisions(userId, workspaceId, documentId);
    sendSuccess(res, revisions, HTTP_STATUS.OK);
  } catch (error) {
    next(error);
  }
}

export async function handleRestoreRevision(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const workspaceId = req.params.workspaceId as string;
    const documentId = req.params.documentId as string;
    const revisionId = req.params.revisionId as string;
    const restored = await codeWorkspaceService.restoreDocumentRevision(
      userId,
      workspaceId,
      documentId,
      revisionId
    );
    sendSuccess(res, restored, HTTP_STATUS.OK, 'Revision restored successfully');
  } catch (error) {
    next(error);
  }
}
