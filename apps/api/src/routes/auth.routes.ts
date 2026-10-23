import { Router } from 'express';
import { validateBody } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { loginRateLimiter, authActionLimiter } from '../middleware/rateLimiter.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  resendVerificationSchema,
} from '../validations/auth.validation.js';
import {
  register,
  login,
  logout,
  getMe,
  refresh,
  handleForgotPassword,
  handleResetPassword,
  handleVerifyEmail,
  handleResendVerification,
} from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', authActionLimiter, validateBody(registerSchema), register);
router.post('/login', loginRateLimiter, validateBody(loginSchema), login);
router.post('/logout', logout);
router.get('/me', requireAuth, getMe);
router.post('/refresh', refresh);
router.post('/forgot-password', authActionLimiter, validateBody(forgotPasswordSchema), handleForgotPassword);
router.post('/reset-password', authActionLimiter, validateBody(resetPasswordSchema), handleResetPassword);
router.post('/verify-email', authActionLimiter, validateBody(verifyEmailSchema), handleVerifyEmail);
router.post('/resend-verification', authActionLimiter, validateBody(resendVerificationSchema), handleResendVerification);

export const authRoutes = router;
