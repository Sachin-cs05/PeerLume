import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as controller from '../controllers/preference.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/', controller.handleGetUserPreferences);
router.patch('/', controller.handleUpdateUserPreferences);

export const preferenceRoutes = router;
