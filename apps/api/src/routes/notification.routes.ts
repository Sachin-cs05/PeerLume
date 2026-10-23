import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  handleGetNotifications,
  handleGetUnreadCount,
  handleMarkNotificationAsRead,
  handleMarkAllNotificationsAsRead,
} from '../controllers/notification.controller.js';

const router = Router();

// All notification routes require authentication
router.use(requireAuth);

router.get('/', handleGetNotifications);
router.get('/unread-count', handleGetUnreadCount);
router.patch('/:notificationId/read', handleMarkNotificationAsRead);
router.post('/read-all', handleMarkAllNotificationsAsRead);

export const notificationRoutes = router;
