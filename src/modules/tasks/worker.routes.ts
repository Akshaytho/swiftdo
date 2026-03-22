import { Router } from 'express';
import { tasksController } from './tasks.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import {
  taskIdParam,
  listOpenTasksQuery,
  listWorkerTasksQuery,
  cancelTaskByWorkerSchema,
} from './tasks.schema';
import { z } from 'zod';

const router = Router();

// All worker routes require auth + WORKER role
router.use(authenticate, authorize('WORKER'));

// GET /api/v1/worker/tasks/open — Browse available tasks
router.get(
  '/tasks/open',
  validate({ query: listOpenTasksQuery }),
  (req, res, next) => tasksController.listOpenTasks(req, res, next)
);

// GET /api/v1/worker/my-tasks — Worker's own assigned tasks
router.get(
  '/my-tasks',
  validate({ query: listWorkerTasksQuery }),
  (req, res, next) => tasksController.listWorkerTasks(req, res, next)
);

// GET /api/v1/worker/tasks/:taskId — Task detail
router.get(
  '/tasks/:taskId',
  validate({ params: taskIdParam }),
  (req, res, next) => tasksController.getWorkerTaskDetail(req, res, next)
);

// POST /api/v1/worker/tasks/:taskId/accept
router.post(
  '/tasks/:taskId/accept',
  validate({ params: taskIdParam }),
  (req, res, next) => tasksController.acceptTask(req, res, next)
);

// POST /api/v1/worker/tasks/:taskId/start
router.post(
  '/tasks/:taskId/start',
  validate({ params: taskIdParam }),
  (req, res, next) => tasksController.startTask(req, res, next)
);

// POST /api/v1/worker/tasks/:taskId/cancel
router.post(
  '/tasks/:taskId/cancel',
  validate({ params: taskIdParam, body: cancelTaskByWorkerSchema }),
  (req, res, next) => tasksController.cancelTaskByWorker(req, res, next)
);

// POST /api/v1/worker/tasks/:taskId/submit
router.post(
  '/tasks/:taskId/submit',
  validate({ params: taskIdParam }),
  (req, res, next) => tasksController.submitTask(req, res, next)
);

// POST /api/v1/worker/tasks/:taskId/retry — Retry after rejection
router.post(
  '/tasks/:taskId/retry',
  validate({ params: taskIdParam }),
  (req, res, next) => tasksController.retryTask(req, res, next)
);

// POST /api/v1/worker/tasks/:taskId/location — GPS log
const locationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  accuracy: z.number().positive().optional(),
});

router.post(
  '/tasks/:taskId/location',
  validate({ params: taskIdParam, body: locationSchema }),
  (req, res, next) => tasksController.logLocation(req, res, next)
);

export { router as workerRoutes };
