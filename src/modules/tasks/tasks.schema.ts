import { z } from 'zod';

// ── Shared ───────────────────────────────────────────────

export const taskIdParam = z.object({
  taskId: z.string().uuid('Invalid task ID'),
});

// ── Buyer: Create Task ───────────────────────────────────

export const createTaskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  category: z.string().min(1, 'Category is required').max(50),
  taskNotes: z.string().min(10, 'Task notes must be at least 10 characters').max(2000),
  locationText: z.string().min(1, 'Location text is required').max(300),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  offeredRate: z
    .number()
    .positive('Offered rate must be positive')
    .max(1000000, 'Rate too high'),
  extraNote: z.string().max(500).optional(),
  expectedCompletionBy: z.coerce.date().optional(),
});

// ── Buyer: Cancel Task ───────────────────────────────────

export const cancelTaskByBuyerSchema = z.object({
  reason: z.string().min(1, 'Cancellation reason is required').max(500).optional(),
});

// ── Worker: List Open Tasks ──────────────────────────────

export const listOpenTasksQuery = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  category: z.string().optional(),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radiusKm: z.coerce.number().positive().max(100).optional(),
});

// ── Worker: Cancel (requires reason) ─────────────────────

export const cancelTaskByWorkerSchema = z.object({
  reason: z.string().min(5, 'Cancellation reason must be at least 5 characters').max(500),
});

// ── Buyer: Reject ────────────────────────────────────────

export const rejectTaskSchema = z.object({
  reason: z.string().min(5, 'Rejection reason must be at least 5 characters').max(1000),
});

// ── Buyer: Approve ───────────────────────────────────────

export const approveTaskSchema = z.object({
  buyerNotes: z.string().max(500).optional(),
});

// ── Buyer: List own tasks ────────────────────────────────

export const listBuyerTasksQuery = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z
    .enum(['OPEN', 'ACCEPTED', 'IN_PROGRESS', 'SUBMITTED', 'APPROVED', 'REJECTED', 'CANCELLED', 'DISPUTED'])
    .optional(),
});

// ── Worker: List own tasks ───────────────────────────────

export const listWorkerTasksQuery = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z
    .enum(['OPEN', 'ACCEPTED', 'IN_PROGRESS', 'SUBMITTED', 'APPROVED', 'REJECTED', 'CANCELLED', 'DISPUTED'])
    .optional(),
});

export type CreateTaskDto = z.infer<typeof createTaskSchema>;
export type CancelTaskByBuyerDto = z.infer<typeof cancelTaskByBuyerSchema>;
export type CancelTaskByWorkerDto = z.infer<typeof cancelTaskByWorkerSchema>;
export type RejectTaskDto = z.infer<typeof rejectTaskSchema>;
export type ApproveTaskDto = z.infer<typeof approveTaskSchema>;
