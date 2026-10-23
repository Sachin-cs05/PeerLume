import { Router } from 'express';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import {
  updateProfileSchema,
  updateTeachingSkillsSchema,
  updateLearningGoalsSchema,
} from '../validations/profile.validation.js';
import {
  getMyProfile,
  updateMyProfile,
  getSkills,
  setTeachingSkills,
  setLearningGoals,
} from '../controllers/profile.controller.js';

const router = Router();

router.get('/me', requireAuth, getMyProfile);
router.patch('/me', requireAuth, validateBody(updateProfileSchema), updateMyProfile);
router.get('/skills', optionalAuth, getSkills);
router.put('/teaching-skills', requireAuth, validateBody(updateTeachingSkillsSchema), setTeachingSkills);
router.put('/learning-goals', requireAuth, validateBody(updateLearningGoalsSchema), setLearningGoals);

export const profileRoutes = router;
