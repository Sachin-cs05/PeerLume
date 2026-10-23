import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { handleGetDashboardSummary } from '../controllers/dashboard.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/summary', handleGetDashboardSummary);

export const dashboardRoutes = router;
