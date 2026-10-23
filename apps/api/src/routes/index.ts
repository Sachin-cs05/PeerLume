import { Router } from 'express';
import { healthRoutes } from './health.routes.js';
import { authRoutes } from './auth.routes.js';
import { profileRoutes } from './profile.routes.js';
import { connectionRoutes } from './connection.routes.js';
import { blockRoutes } from './block.routes.js';
import { savedPartnerRoutes } from './savedPartner.routes.js';
import { discoveryRoutes } from './discovery.routes.js';
import { studentRoutes } from './student.routes.js';

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

export const apiRoutes = router;

