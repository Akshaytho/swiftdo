import { z } from 'zod';

export const createReportSchema = z.object({
  issueType: z.string().min(1, 'Issue type is required').max(50),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  locationText: z.string().min(1).max(300).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  photoUrl: z.string().url().optional(),
});

export type CreateReportDto = z.infer<typeof createReportSchema>;
