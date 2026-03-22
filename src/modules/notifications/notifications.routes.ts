import { Router } from 'express';
import { notificationsController } from './notifications.controller';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import { z } from 'zod';

const router = Router();

router.use(authenticate);

const listNotificationsQuery = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
});

// GET /api/v1/notifications
router.get(
  '/',
  validate({ query: listNotificationsQuery }),
  (req, res, next) => notificationsController.list(req, res, next)
);

// POST /api/v1/notifications/read-all — MUST come before /:id/read
router.post(
  '/read-all',
  (req, res, next) => notificationsController.markAllAsRead(req, res, next)
);

// POST /api/v1/notifications/:id/read
router.post(
  '/:id/read',
  validate({ params: z.object({ id: z.string().uuid() }) }),
  (req, res, next) => notificationsController.markAsRead(req, res, next)
);

export { router as notificationRoutes };
