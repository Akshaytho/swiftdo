import { Request, Response, NextFunction } from 'express';
import { mediaService } from './media.service';
import { successResponse } from '../../lib/utils';
import { BadRequestError, ValidationError } from '../../lib/errors';
import { uploadMediaSchema } from './media.schema';

export class MediaController {
  async upload(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new BadRequestError('No file uploaded. Use field name "file".');
      }

      // Validate body AFTER multer has parsed the multipart form data.
      // Cannot use the validate middleware here because it runs before multer.
      const bodyResult = uploadMediaSchema.safeParse(req.body);
      if (!bodyResult.success) {
        const fieldErrors: Record<string, string[]> = {};
        for (const issue of bodyResult.error.issues) {
          const path = issue.path.join('.') || '_root';
          if (!fieldErrors[path]) fieldErrors[path] = [];
          fieldErrors[path].push(issue.message);
        }
        throw new ValidationError('Validation failed', { body: fieldErrors });
      }

      const media = await mediaService.uploadTaskMedia(
        req.params.taskId as string,
        req.user!.id,
        req.user!.role,
        req.file,
        bodyResult.data
      );

      res.status(201).json(successResponse(media));
    } catch (err) {
      next(err);
    }
  }

  async listMedia(req: Request, res: Response, next: NextFunction) {
    try {
      const media = await mediaService.getTaskMedia(
        req.params.taskId as string,
        req.user!.id,
        req.user!.role
      );
      res.status(200).json(successResponse(media));
    } catch (err) {
      next(err);
    }
  }
}

export const mediaController = new MediaController();
