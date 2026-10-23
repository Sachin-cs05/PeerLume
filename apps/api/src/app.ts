import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { requestLogger } from './middleware/requestLogger.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiRoutes } from './routes/index.js';

export function createApp(): Express {
  const app = express();

  // Trust proxy for rate-limiting and secure cookies behind local/cloud proxies
  app.set('trust proxy', 1);

  // Security HTTP Headers
  app.use(helmet());

  // CORS Configuration
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile, curl) or matching configured/dev origins
        if (
          !origin ||
          origin === env.WEB_ORIGIN ||
          (env.NODE_ENV === 'development' && /^http:\/\/localhost:(5173|5174|5175)$/.test(origin))
        ) {
          callback(null, true);
        } else {
          callback(new Error(`Origin ${origin} not allowed by CORS`));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Body and Cookie Parsing
  app.use(cookieParser(env.COOKIE_SECRET));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Request Logging
  app.use(requestLogger);

  // Base API routes
  app.use('/api', apiRoutes);

  // Catch 404s for undefined endpoints
  app.use(notFoundHandler);

  // Centralized Error Handling
  app.use(errorHandler);

  return app;
}

export const app = createApp();
