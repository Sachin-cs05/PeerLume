import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { savePartnerSchema } from '../validations/connection.validation.js';
import {
  handleSavePartner,
  handleRemoveSavedPartner,
  handleGetSavedPartners,
} from '../controllers/connection.controller.js';

const router = Router();

router.post('/:studentId', requireAuth, validateBody(savePartnerSchema), handleSavePartner);
router.delete('/:studentId', requireAuth, handleRemoveSavedPartner);
router.get('/', requireAuth, handleGetSavedPartners);

export const savedPartnerRoutes = router;
