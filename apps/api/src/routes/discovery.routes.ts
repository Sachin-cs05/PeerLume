import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validateQuery } from '../middleware/validate.js';
import { discoveryFilterQuerySchema } from '../validations/connection.validation.js';
import { handleGetRecommendedPartners } from '../controllers/discovery.controller.js';

const router = Router();

router.get(
  '/partners',
  requireAuth,
  validateQuery(discoveryFilterQuerySchema),
  handleGetRecommendedPartners
);

export const discoveryRoutes = router;
