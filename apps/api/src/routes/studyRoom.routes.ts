import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as controller from '../controllers/studyRoom.controller.js';

const router = Router();

// All study room endpoints require authentication
router.use(requireAuth);

// Study Rooms CRUD & Lifecycle
router.post('/', controller.handleCreateStudyRoom);
router.get('/', controller.handleGetStudyRooms);
router.get('/:roomId', controller.handleGetStudyRoomById);
router.patch('/:roomId', controller.handleUpdateStudyRoom);
router.post('/:roomId/join', controller.handleJoinStudyRoom);
router.post('/:roomId/leave', controller.handleLeaveStudyRoom);
router.post('/:roomId/end', controller.handleEndStudyRoom);

// Participants
router.post('/:roomId/participants', controller.handleAddParticipant);
router.patch('/:roomId/participants/:participantId', controller.handleUpdateParticipantRole);
router.delete('/:roomId/participants/:participantId', controller.handleRemoveParticipant);

// Whiteboard
router.get('/:roomId/board', controller.handleGetWhiteboard);
router.post('/:roomId/board/save', controller.handleSaveWhiteboard);
router.get('/:roomId/board/revisions', controller.handleGetWhiteboardRevisions);
router.post('/:roomId/board/revisions/:revisionId/restore', controller.handleRestoreWhiteboardRevision);

export const studyRoomRoutes = router;
