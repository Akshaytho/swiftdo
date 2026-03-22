import { Request, Response, NextFunction } from 'express';
import { payoutsService } from './payouts.service';

export class PayoutsController {
  async listWorkerPayouts(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await payoutsService.listWorkerPayouts(req.user!.id, req.query as any);
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }
}

export const payoutsController = new PayoutsController();
