import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  handleCreateWorkspace,
  handleListWorkspaces,
  handleGetWorkspace,
  handleUpdateWorkspace,
  handleDeleteWorkspace,
  handleAddParticipant,
  handleUpdateParticipantRole,
  handleRemoveParticipant,
  handleCreateDocument,
  handleUpdateDocument,
  handleDeleteDocument,
  handleSaveDocument,
  handleListRevisions,
  handleRestoreRevision,
} from '../controllers/codeWorkspace.controller.js';

const router = Router();

// All code workspace routes require authenticated session
router.use(requireAuth);

// Workspace lifecycle
router.post('/', handleCreateWorkspace);
router.get('/', handleListWorkspaces);
router.get('/:workspaceId', handleGetWorkspace);
router.patch('/:workspaceId', handleUpdateWorkspace);
router.delete('/:workspaceId', handleDeleteWorkspace);

// Collaborators and roles
router.post('/:workspaceId/participants', handleAddParticipant);
router.patch('/:workspaceId/participants/:participantId', handleUpdateParticipantRole);
router.delete('/:workspaceId/participants/:participantId', handleRemoveParticipant);

// Documents & tabs
router.post('/:workspaceId/documents', handleCreateDocument);
router.patch('/:workspaceId/documents/:documentId', handleUpdateDocument);
router.delete('/:workspaceId/documents/:documentId', handleDeleteDocument);
router.post('/:workspaceId/documents/:documentId/save', handleSaveDocument);

// Revision history
router.get('/:workspaceId/documents/:documentId/revisions', handleListRevisions);
router.post('/:workspaceId/documents/:documentId/revisions/:revisionId/restore', handleRestoreRevision);

export const codeWorkspaceRouter = router;
