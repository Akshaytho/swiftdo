import { Request, Response, NextFunction } from 'express';
import { notificationsService } from './notifications.service';
import { successResponse } from '../../lib/utils';

export class NotificationsController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await notificationsService.listForUser(req.user!.id, req.query as any);
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const notification = await notificationsService.markAsRead(req.params.id as string, req.user!.id);
      res.status(200).json(successResponse(notification));
    } catch (err) {
      next(err);
    }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await notificationsService.markAllAsRead(req.user!.id);
      res.status(200).json(successResponse(result));
    } catch (err) {
      next(err);
    }
  }
}

export const notificationsController = new NotificationsController();
