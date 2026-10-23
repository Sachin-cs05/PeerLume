import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  handleCreateSession,
  handleListSessions,
  handleGetSessionById,
  handleAcceptInvitation,
  handleDeclineInvitation,
  handleProposeReschedule,
  handleRespondReschedule,
  handleCancelSession,
  handleCompleteSession,
  handleCheckAvailability,
  handleGetCalendar,
} from '../controllers/session.controller.js';
import { handleGetSessionResources } from '../controllers/resource.controller.js';

const router = Router();

router.use(requireAuth);

router.post('/', handleCreateSession);
router.get('/', handleListSessions);
router.get('/availability', handleCheckAvailability);
router.get('/calendar', handleGetCalendar);
router.get('/:sessionId', handleGetSessionById);
router.post('/:sessionId/accept', handleAcceptInvitation);
router.post('/:sessionId/decline', handleDeclineInvitation);
router.post('/:sessionId/reschedule', handleProposeReschedule);
router.post('/:sessionId/reschedule/:proposalId', handleRespondReschedule);
router.post('/:sessionId/cancel', handleCancelSession);
router.post('/:sessionId/complete', handleCompleteSession);
router.get('/:sessionId/resources', handleGetSessionResources);

export const sessionRoutes = router;
