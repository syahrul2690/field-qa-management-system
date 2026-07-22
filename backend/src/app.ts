import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { config } from './config';
import { errorHandler } from './middlewares/errorHandler';
import { activityLogMiddleware } from './middlewares/activityLogMiddleware';
import { apiRateLimiter, authRateLimiter } from './middlewares/rateLimiter';
import { router } from './routes';

export function createApp(): express.Application {
  const app = express();

  // Trust the reverse proxy chain (host nginx -> frontend container nginx) so
  // express-rate-limit reads the real client IP from X-Forwarded-For instead of rejecting it.
  app.set('trust proxy', 2);

  // Security headers
  app.use(helmet());

  // CORS
  app.use(
    cors({
      origin: config.cors.frontendUrl,
      credentials: true,
    })
  );

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Static files for uploads
  app.use('/uploads', express.static(path.join(process.cwd(), config.upload.dir)));

  // Global rate limiter
  app.use('/api', apiRateLimiter);

  // Auth-specific rate limiter
  app.use('/api/auth/login', authRateLimiter);
  app.use('/api/auth/register', authRateLimiter);

  // Activity logging middleware (audit trail)
  app.use('/api', activityLogMiddleware);

  // API Routes
  app.use('/api', router);

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
  });

  // Global error handler
  app.use(errorHandler);

  return app;
}
