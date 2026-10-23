import { Router } from 'express';
import { healthRoutes } from './health.routes.js';
import { authRoutes } from './auth.routes.js';
import { profileRoutes } from './profile.routes.js';

const router = Router();

// Mount feature routes
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);

export const apiRoutes = router;
