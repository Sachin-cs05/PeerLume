import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  handleInitiateCall,
  handleGetCallSession,
  handleEndCall,
  handleUpdateCallStatus,
  handleGetIceConfig,
} from '../controllers/call.controller.js';

const router = Router();

// All call routes require authentication
router.use(requireAuth);

router.get('/config', handleGetIceConfig);
router.post('/', handleInitiateCall);
router.get('/:callId', handleGetCallSession);
router.post('/:callId/end', handleEndCall);
router.patch('/:callId/status', handleUpdateCallStatus);

export const callRoutes = router;
