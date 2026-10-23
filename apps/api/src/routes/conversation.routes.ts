import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  handleGetUserConversations,
  handleGetOrCreateDirectConversation,
  handleGetConversationMessages,
  handleSendMessage,
  handleMarkConversationAsRead,
} from '../controllers/conversation.controller.js';

const router = Router();

// All conversation routes require authentication
router.use(requireAuth);

router.get('/', handleGetUserConversations);
router.post('/direct', handleGetOrCreateDirectConversation);
router.get('/:conversationId/messages', handleGetConversationMessages);
router.post('/:conversationId/messages', handleSendMessage);
router.post('/:conversationId/read', handleMarkConversationAsRead);

export const conversationRoutes = router;
