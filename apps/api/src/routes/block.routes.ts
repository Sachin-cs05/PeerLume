import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { blockStudentSchema } from '../validations/connection.validation.js';
import {
  handleBlockStudent,
  handleUnblockStudent,
  handleGetBlockedStudents,
} from '../controllers/connection.controller.js';

const router = Router();

router.post('/:studentId', requireAuth, validateBody(blockStudentSchema), handleBlockStudent);
router.delete('/:studentId', requireAuth, handleUnblockStudent);
router.get('/', requireAuth, handleGetBlockedStudents);

export const blockRoutes = router;
