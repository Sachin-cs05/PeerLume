import type { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '@peerlume/shared';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { setAuthCookies, clearAuthCookies, COOKIE_REFRESH_NAME } from '../utils/cookies.js';
import {
  registerStudent,
  loginStudent,
  logoutStudent,
  getCurrentUser,
  refreshAuthSession,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
} from '../services/auth.service.js';

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const meta = {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    };
    const { user, accessToken, refreshToken } = await registerStudent(req.body, meta);
    setAuthCookies(res, accessToken, refreshToken);
    sendSuccess(res, { user }, HTTP_STATUS.CREATED, 'Registration successful');
  } catch (error) {
    next(error);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const meta = {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    };
    const { user, accessToken, refreshToken } = await loginStudent(req.body, meta);
    setAuthCookies(res, accessToken, refreshToken);
    sendSuccess(res, { user }, HTTP_STATUS.OK, 'Login successful');
  } catch (error) {
    next(error);
  }
}

export async function logout(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const refreshToken = req.cookies?.[COOKIE_REFRESH_NAME];
    await logoutStudent(refreshToken);
    clearAuthCookies(res);
    sendSuccess(res, null, HTTP_STATUS.OK, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
}

export async function getMe(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      sendError(res, HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED', 'Not authenticated');
      return;
    }
    const user = await getCurrentUser(req.user.id);
    sendSuccess(res, { user }, HTTP_STATUS.OK);
  } catch (error) {
    next(error);
  }
}

export async function refresh(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const refreshToken = req.cookies?.[COOKIE_REFRESH_NAME] || req.body?.refreshToken;
    if (!refreshToken) {
      sendError(res, HTTP_STATUS.UNAUTHORIZED, 'MISSING_REFRESH_TOKEN', 'No refresh token provided');
      return;
    }
    const meta = {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    };
    const { user, accessToken, refreshToken: newRefreshToken } = await refreshAuthSession(
      refreshToken,
      meta
    );
    setAuthCookies(res, accessToken, newRefreshToken);
    sendSuccess(res, { user }, HTTP_STATUS.OK, 'Session refreshed');
  } catch (error) {
    next(error);
  }
}

export async function handleForgotPassword(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await forgotPassword(req.body.email);
    sendSuccess(
      res,
      null,
      HTTP_STATUS.OK,
      'If an account exists with that email, a password reset link has been dispatched.'
    );
  } catch (error) {
    next(error);
  }
}

export async function handleResetPassword(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await resetPassword(req.body.token, req.body.password);
    sendSuccess(
      res,
      null,
      HTTP_STATUS.OK,
      'Password has been successfully reset. Please log in with your new password.'
    );
  } catch (error) {
    next(error);
  }
}

export async function handleVerifyEmail(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await verifyEmail(req.body.token);
    sendSuccess(res, null, HTTP_STATUS.OK, 'Email has been successfully verified.');
  } catch (error) {
    next(error);
  }
}

export async function handleResendVerification(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await resendVerificationEmail(req.body.email);
    sendSuccess(
      res,
      null,
      HTTP_STATUS.OK,
      'If an unverified account exists with that email, a new verification link has been dispatched.'
    );
  } catch (error) {
    next(error);
  }
}
