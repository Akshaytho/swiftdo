import { Router } from 'express';
import { payoutsController } from './payouts.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

const router = Router();

// GET /api/v1/worker/payouts
router.get(
  '/',
  authenticate,
  authorize('WORKER'),
  (req, res, next) => payoutsController.listWorkerPayouts(req, res, next)
);

export { router as payoutRoutes };
