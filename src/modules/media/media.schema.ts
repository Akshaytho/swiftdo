import { z } from 'zod';

export const uploadMediaSchema = z.object({
  mediaType: z.enum(['BEFORE_PHOTO', 'AFTER_PHOTO', 'PROOF_PHOTO', 'REFERENCE_IMAGE']),
  capturedAt: z.coerce.date().optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
});

export const mediaTaskIdParam = z.object({
  taskId: z.string().uuid('Invalid task ID'),
});

export type UploadMediaDto = z.infer<typeof uploadMediaSchema>;
