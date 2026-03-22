import { Router } from 'express';
import multer from 'multer';
import { mediaController } from './media.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { mediaTaskIdParam } from './media.schema';
import { FILE_UPLOAD } from '../../config/constants';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: FILE_UPLOAD.MAX_SIZE_BYTES },
});

const router = Router();

// POST /api/v1/tasks/:taskId/media — Upload media (worker or buyer for reference)
router.post(
  '/:taskId/media',
  authenticate,
  authorize('WORKER', 'BUYER'),
  validate({ params: mediaTaskIdParam }),
  upload.single('file'),
  (req, res, next) => mediaController.upload(req, res, next)
);

// GET /api/v1/tasks/:taskId/media — List media for a task
router.get(
  '/:taskId/media',
  authenticate,
  authorize('WORKER', 'BUYER', 'ADMIN'),
  validate({ params: mediaTaskIdParam }),
  (req, res, next) => mediaController.listMedia(req, res, next)
);

export { router as mediaRoutes };
