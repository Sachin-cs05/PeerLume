import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { handleGlobalSearch } from '../controllers/search.controller.js';

const router = Router();

// Search requires authentication to enforce privacy and permissions
router.use(requireAuth);

router.get('/', handleGlobalSearch);

export const searchRoutes = router;
