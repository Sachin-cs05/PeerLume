import { Router } from 'express';
import { healthRoutes } from './health.routes.js';
import { authRoutes } from './auth.routes.js';
import { profileRoutes } from './profile.routes.js';
import { connectionRoutes } from './connection.routes.js';
import { blockRoutes } from './block.routes.js';
import { savedPartnerRoutes } from './savedPartner.routes.js';
import { discoveryRoutes } from './discovery.routes.js';
import { studentRoutes } from './student.routes.js';
import { conversationRoutes } from './conversation.routes.js';
import { callRoutes } from './call.routes.js';
import { notificationRoutes } from './notification.routes.js';
import { sessionRoutes } from './session.routes.js';
import { resourceRoutes } from './resource.routes.js';
import { dashboardRoutes } from './dashboard.routes.js';
import { codeWorkspaceRouter } from './codeWorkspace.routes.js';
import { studyRoomRoutes } from './studyRoom.routes.js';
import { searchRoutes } from './search.routes.js';
import { preferenceRoutes } from './preference.routes.js';

const router = Router();

// Mount feature routes
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/connections', connectionRoutes);
router.use('/blocks', blockRoutes);
router.use('/saved-partners', savedPartnerRoutes);
router.use('/discovery', discoveryRoutes);
router.use('/students', studentRoutes);
router.use('/conversations', conversationRoutes);
router.use('/calls', callRoutes);
router.use('/notifications', notificationRoutes);
router.use('/sessions', sessionRoutes);
router.use('/resources', resourceRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/code-workspaces', codeWorkspaceRouter);
router.use('/study-rooms', studyRoomRoutes);
router.use('/search', searchRoutes);
router.use('/preferences', preferenceRoutes);

export const apiRoutes = router;


