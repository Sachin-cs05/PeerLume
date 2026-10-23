import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validateQuery } from '../middleware/validate.js';
import { searchStudentsQuerySchema } from '../validations/connection.validation.js';
import {
  handleSearchStudents,
  handleGetStudentDetails,
} from '../controllers/discovery.controller.js';

const router = Router();

router.get('/', requireAuth, validateQuery(searchStudentsQuerySchema), handleSearchStudents);
router.get('/:studentId', requireAuth, handleGetStudentDetails);

export const studentRoutes = router;
