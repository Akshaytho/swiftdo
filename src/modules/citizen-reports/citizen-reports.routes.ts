import { Router } from 'express';
import { citizenReportsController } from './citizen-reports.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { createReportSchema } from './citizen-reports.schema';

const router = Router();

router.use(authenticate, authorize('CITIZEN'));

// POST /api/v1/citizen/reports
router.post(
  '/',
  validate({ body: createReportSchema }),
  (req, res, next) => citizenReportsController.create(req, res, next)
);

// GET /api/v1/citizen/reports
router.get(
  '/',
  (req, res, next) => citizenReportsController.list(req, res, next)
);

export { router as citizenReportRoutes };
