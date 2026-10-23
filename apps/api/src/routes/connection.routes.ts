import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { sendRequestSchema } from '../validations/connection.validation.js';
import {
  handleSendRequest,
  handleGetIncomingRequests,
  handleGetOutgoingRequests,
  handleAcceptRequest,
  handleDeclineRequest,
  handleCancelRequest,
  handleGetConnections,
  handleRemoveConnection,
} from '../controllers/connection.controller.js';

const router = Router();

router.post('/requests', requireAuth, validateBody(sendRequestSchema), handleSendRequest);
router.get('/requests/incoming', requireAuth, handleGetIncomingRequests);
router.get('/requests/outgoing', requireAuth, handleGetOutgoingRequests);
router.post('/requests/:requestId/accept', requireAuth, handleAcceptRequest);
router.post('/requests/:requestId/decline', requireAuth, handleDeclineRequest);
router.delete('/requests/:requestId', requireAuth, handleCancelRequest);

router.get('/', requireAuth, handleGetConnections);
router.delete('/:connectionId', requireAuth, handleRemoveConnection);

export const connectionRoutes = router;
