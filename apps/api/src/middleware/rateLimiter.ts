import rateLimit from 'express-rate-limit';
import { HTTP_STATUS } from '@peerlume/shared';

// Strict rate limit for login attempts (5 requests per 15 mins)
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many login attempts. Please wait 15 minutes before trying again.',
    },
    timestamp: new Date().toISOString(),
  },
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS || 429,
  skipSuccessfulRequests: true,
});

// General rate limiter for sensitive auth actions (registration, password reset, email resend)
export const authActionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests. Please try again after 15 minutes.',
    },
    timestamp: new Date().toISOString(),
  },
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS || 429,
});

// General API rate limiter for DoS / brute force protection (300 requests per 15 mins per IP)
export const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'test' ? 10000 : 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests from this IP. Please slow down.',
    },
    timestamp: new Date().toISOString(),
  },
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS || 429,
});
