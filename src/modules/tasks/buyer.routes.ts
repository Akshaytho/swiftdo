import { Router } from 'express';
import { tasksController } from './tasks.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import {
  createTaskSchema,
  taskIdParam,
  cancelTaskByBuyerSchema,
  approveTaskSchema,
  rejectTaskSchema,
  listBuyerTasksQuery,
} from './tasks.schema';

const router = Router();

// All buyer routes require auth + BUYER role
router.use(authenticate, authorize('BUYER'));

// POST /api/v1/buyer/tasks — Create a new task
router.post(
  '/tasks',
  validate({ body: createTaskSchema }),
  (req, res, next) => tasksController.createTask(req, res, next)
);

// GET /api/v1/buyer/tasks — List buyer's own tasks
router.get(
  '/tasks',
  validate({ query: listBuyerTasksQuery }),
  (req, res, next) => tasksController.listBuyerTasks(req, res, next)
);

// GET /api/v1/buyer/tasks/:taskId — Task detail with evidence
router.get(
  '/tasks/:taskId',
  validate({ params: taskIdParam }),
  (req, res, next) => tasksController.getBuyerTaskDetail(req, res, next)
);

// POST /api/v1/buyer/tasks/:taskId/cancel
router.post(
  '/tasks/:taskId/cancel',
  validate({ params: taskIdParam, body: cancelTaskByBuyerSchema }),
  (req, res, next) => tasksController.cancelTaskByBuyer(req, res, next)
);

// POST /api/v1/buyer/tasks/:taskId/approve
router.post(
  '/tasks/:taskId/approve',
  validate({ params: taskIdParam, body: approveTaskSchema }),
  (req, res, next) => tasksController.approveTask(req, res, next)
);

// POST /api/v1/buyer/tasks/:taskId/reject
router.post(
  '/tasks/:taskId/reject',
  validate({ params: taskIdParam, body: rejectTaskSchema }),
  (req, res, next) => tasksController.rejectTask(req, res, next)
);

export { router as buyerRoutes };
