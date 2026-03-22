import { Request, Response, NextFunction } from 'express';
import { tasksService } from './tasks.service';
import { successResponse } from '../../lib/utils';

// Helper to safely extract validated taskId from params
function taskId(req: Request): string {
  return req.params.taskId as string;
}

export class TasksController {
  // ── Buyer Endpoints ────────────────────────────────

  async createTask(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await tasksService.createTask(req.user!.id, req.body);
      res.status(201).json(successResponse(task));
    } catch (err) {
      next(err);
    }
  }

  async listBuyerTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await tasksService.listBuyerTasks(req.user!.id, req.query as any);
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  async getBuyerTaskDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await tasksService.getBuyerTaskDetail(taskId(req), req.user!.id);
      res.status(200).json(successResponse(task));
    } catch (err) {
      next(err);
    }
  }

  async cancelTaskByBuyer(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await tasksService.cancelTaskByBuyer(
        taskId(req),
        req.user!.id,
        req.body.reason
      );
      res.status(200).json(successResponse(task));
    } catch (err) {
      next(err);
    }
  }

  async approveTask(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await tasksService.approveTask(taskId(req), req.user!.id, req.body);
      res.status(200).json(successResponse(task));
    } catch (err) {
      next(err);
    }
  }

  async rejectTask(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await tasksService.rejectTask(taskId(req), req.user!.id, req.body);
      res.status(200).json(successResponse(task));
    } catch (err) {
      next(err);
    }
  }

  // ── Worker Endpoints ───────────────────────────────

  async listOpenTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await tasksService.listOpenTasks(req.query as any);
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  async getWorkerTaskDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await tasksService.getWorkerTaskDetail(taskId(req), req.user!.id);
      res.status(200).json(successResponse(task));
    } catch (err) {
      next(err);
    }
  }

  async listWorkerTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await tasksService.listWorkerTasks(req.user!.id, req.query as any);
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  async acceptTask(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await tasksService.acceptTask(taskId(req), req.user!.id);
      res.status(200).json(successResponse(task));
    } catch (err) {
      next(err);
    }
  }

  async startTask(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await tasksService.startTask(taskId(req), req.user!.id);
      res.status(200).json(successResponse(task));
    } catch (err) {
      next(err);
    }
  }

  async cancelTaskByWorker(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await tasksService.cancelTaskByWorker(
        taskId(req),
        req.user!.id,
        req.body.reason
      );
      res.status(200).json(successResponse(task));
    } catch (err) {
      next(err);
    }
  }

  async submitTask(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await tasksService.submitTask(taskId(req), req.user!.id);
      res.status(200).json(successResponse(task));
    } catch (err) {
      next(err);
    }
  }

  async retryTask(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await tasksService.retryTask(taskId(req), req.user!.id);
      res.status(200).json(successResponse(task));
    } catch (err) {
      next(err);
    }
  }

  async logLocation(req: Request, res: Response, next: NextFunction) {
    try {
      const { lat, lng, accuracy } = req.body;
      const entry = await tasksService.logLocation(taskId(req), req.user!.id, lat, lng, accuracy);
      res.status(201).json(successResponse(entry));
    } catch (err) {
      next(err);
    }
  }
}

export const tasksController = new TasksController();
