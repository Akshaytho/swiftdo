import express from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { logger } from './lib/logger';
import { errorHandler } from './middleware/error-handler';

// Route imports
import { authRoutes } from './modules/auth/auth.routes';
import { buyerRoutes } from './modules/tasks/buyer.routes';
import { workerRoutes } from './modules/tasks/worker.routes';
import { mediaRoutes } from './modules/media/media.routes';
import { notificationRoutes } from './modules/notifications/notifications.routes';
import { payoutRoutes } from './modules/payouts/payouts.routes';
import { citizenReportRoutes } from './modules/citizen-reports/citizen-reports.routes';

export function createApp() {
  const app = express();

  // ── Core Middleware ──────────────────────────────────

  // Request logging
  app.use(pinoHttp({ logger, autoLogging: { ignore: (req) => req.url === '/health' } }));

  // CORS
  app.use(
    cors({
      origin: config.CORS_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean),
      credentials: true,
    })
  );

  // Body parsing
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Static file serving for uploads (dev only)
  if (config.STORAGE_BACKEND === 'local') {
    app.use('/uploads', express.static(config.STORAGE_LOCAL_PATH));
  }

  // Rate limiting
  app.use(
    rateLimit({
      windowMs: config.RATE_LIMIT_WINDOW_MS,
      max: config.RATE_LIMIT_MAX,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        error: { code: 'RATE_LIMITED', message: 'Too many requests, try again later' },
      },
    })
  );

  // Stricter rate limit on auth routes
  const authLimiter = rateLimit({
    windowMs: 60000,
    max: 10,
    message: {
      success: false,
      error: { code: 'RATE_LIMITED', message: 'Too many auth attempts, try again later' },
    },
  });

  // ── Health Check ─────────────────────────────────────

  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '0.1.0',
    });
  });

  // ── API Routes ───────────────────────────────────────

  const api = '/api/v1';

  app.use(`${api}/auth`, authLimiter, authRoutes);
  app.use(`${api}/buyer`, buyerRoutes);
  app.use(`${api}/worker`, workerRoutes);
  app.use(`${api}/worker/payouts`, payoutRoutes);
  app.use(`${api}/tasks`, mediaRoutes);
  app.use(`${api}/notifications`, notificationRoutes);
  app.use(`${api}/citizen/reports`, citizenReportRoutes);

  // ── 404 Handler ──────────────────────────────────────

  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Route not found' },
    });
  });

  // ── Global Error Handler (must be last) ──────────────

  app.use(errorHandler);

  return app;
}
