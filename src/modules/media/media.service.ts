import { prisma } from '../../lib/prisma';
import {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
  ConflictError,
} from '../../lib/errors';
import { createModuleLogger } from '../../lib/logger';
import { storage } from './storage';
import { FILE_UPLOAD } from '../../config/constants';
import type { UploadMediaDto } from './media.schema';

const log = createModuleLogger('media.service');

export class MediaService {
  async uploadTaskMedia(
    taskId: string,
    userId: string,
    userRole: string,
    file: Express.Multer.File,
    dto: UploadMediaDto
  ) {
    // Validate file
    if (!file) {
      throw new BadRequestError('No file provided');
    }

    if (!FILE_UPLOAD.ALLOWED_MIME_TYPES.includes(file.mimetype as any)) {
      throw new BadRequestError(
        `Invalid file type '${file.mimetype}'. Allowed: ${FILE_UPLOAD.ALLOWED_MIME_TYPES.join(', ')}`
      );
    }

    if (file.size > FILE_UPLOAD.MAX_SIZE_BYTES) {
      throw new BadRequestError(
        `File too large. Maximum size: ${FILE_UPLOAD.MAX_SIZE_BYTES / (1024 * 1024)}MB`
      );
    }

    // Validate task exists and user has access
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundError('Task', taskId);

    // Reference images can be uploaded by the buyer
    if (dto.mediaType === 'REFERENCE_IMAGE') {
      if (task.buyerId !== userId) {
        throw new ForbiddenError('Only the task buyer can upload reference images');
      }
    } else {
      // Before/after/proof photos must be from the assigned worker
      if (task.workerId !== userId) {
        throw new ForbiddenError('Only the assigned worker can upload evidence photos');
      }

      // Evidence photos only during in_progress state
      if (task.status !== 'IN_PROGRESS') {
        throw new ConflictError(
          'Evidence photos can only be uploaded while task is in progress',
          'INVALID_TASK_STATE'
        );
      }
    }

    // Save file to storage
    const result = await storage.save(file, `tasks/${taskId}`);

    // Create DB record
    const media = await prisma.taskMedia.create({
      data: {
        taskId,
        type: dto.mediaType,
        url: result.url,
        fileName: result.fileName,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        uploadedBy: userId,
      },
    });

    log.info(
      { mediaId: media.id, taskId, type: dto.mediaType, userId },
      'Media uploaded'
    );

    return media;
  }

  async getTaskMedia(taskId: string, userId: string, userRole: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { buyerId: true, workerId: true },
    });
    if (!task) throw new NotFoundError('Task', taskId);

    // Only the buyer who owns the task or the assigned worker can view media
    const isOwner = task.buyerId === userId;
    const isAssigned = task.workerId === userId;
    const isAdmin = userRole === 'ADMIN';

    if (!isOwner && !isAssigned && !isAdmin) {
      throw new ForbiddenError('You do not have access to this task\'s media');
    }

    return prisma.taskMedia.findMany({
      where: { taskId },
      orderBy: { uploadedAt: 'asc' },
    });
  }
}

export const mediaService = new MediaService();
