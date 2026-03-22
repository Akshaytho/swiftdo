import { Request, Response, NextFunction } from 'express';
import { citizenReportsService } from './citizen-reports.service';
import { successResponse } from '../../lib/utils';

export class CitizenReportsController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await citizenReportsService.createReport(req.user!.id, req.body);
      res.status(201).json(successResponse(report));
    } catch (err) {
      next(err);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await citizenReportsService.listUserReports(req.user!.id, req.query as any);
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }
}

export const citizenReportsController = new CitizenReportsController();
