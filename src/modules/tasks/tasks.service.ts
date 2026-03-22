import { TaskStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import {
  NotFoundError,
  ConflictError,
  ForbiddenError,
  BadRequestError,
} from '../../lib/errors';
import { createModuleLogger } from '../../lib/logger';
import { assertTransition, getTimestampUpdates } from './tasks.state-machine';
import { distanceKm, parsePagination, paginatedResponse } from '../../lib/utils';
import type {
  CreateTaskDto,
  RejectTaskDto,
  ApproveTaskDto,
} from './tasks.schema';

const log = createModuleLogger('tasks.service');

export class TasksService {
  // ── Buyer: Create Task ───────────────────────────────

  async createTask(buyerId: string, dto: CreateTaskDto) {
    const task = await prisma.$transaction(async (tx) => {
      const newTask = await tx.task.create({
        data: {
          title: dto.title,
          description: dto.taskNotes,
          category: dto.category,
          urgency: dto.urgency,
          rateCents: Math.round(dto.offeredRate * 100),
          locationLat: dto.lat,
          locationLng: dto.lng,
          locationAddress: dto.locationText,
          extraNote: dto.extraNote ?? null,
          expectedCompletionBy: dto.expectedCompletionBy ?? null,
          buyerId,
          status: 'OPEN',
        },
      });

      await tx.taskEvent.create({
        data: {
          taskId: newTask.id,
          action: 'created',
          actorId: buyerId,
          metadata: { title: newTask.title, rateCents: newTask.rateCents },
        },
      });

      await tx.buyerProfile.update({
        where: { userId: buyerId },
        data: { totalPosted: { increment: 1 } },
      });

      return newTask;
    });

    log.info({ taskId: task.id, buyerId }, 'Task created');
    return task;
  }

  // ── Buyer: List Own Tasks ────────────────────────────

  async listBuyerTasks(
    buyerId: string,
    query: { page?: string; limit?: string; status?: TaskStatus }
  ) {
    const pagination = parsePagination(query);
    const where: any = { buyerId };
    if (query.status) where.status = query.status;

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.limit,
        include: {
          worker: { select: { id: true, name: true } },
          _count: { select: { media: true, locationLogs: true } },
        },
      }),
      prisma.task.count({ where }),
    ]);

    return paginatedResponse(tasks, total, pagination);
  }

  // ── Buyer: Get Task Detail ───────────────────────────

  async getBuyerTaskDetail(taskId: string, buyerId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        worker: { select: { id: true, name: true } },
        media: true,
        locationLogs: { orderBy: { timestamp: 'asc' } },
        events: { orderBy: { createdAt: 'asc' } },
        payout: true,
      },
    });

    if (!task) throw new NotFoundError('Task', taskId);
    if (task.buyerId !== buyerId) throw new ForbiddenError('You do not own this task');

    return task;
  }

  // ── Buyer: Cancel Task ───────────────────────────────

  async cancelTaskByBuyer(taskId: string, buyerId: string, reason?: string) {
    const timestamps = getTimestampUpdates('CANCELLED');

    const updated = await prisma.$transaction(async (tx) => {
      // Re-read inside transaction to prevent race conditions
      const task = await tx.task.findUnique({ where: { id: taskId } });
      if (!task) throw new NotFoundError('Task', taskId);
      if (task.buyerId !== buyerId) throw new ForbiddenError('You do not own this task');
      assertTransition(task.status, 'CANCELLED', 'BUYER');

      const t = await tx.task.update({
        where: { id: taskId },
        data: {
          status: 'CANCELLED',
          cancellationReason: reason ?? 'Cancelled by buyer',
          ...timestamps,
        },
      });

      await tx.taskEvent.create({
        data: {
          taskId,
          action: 'cancelled',
          actorId: buyerId,
          metadata: { reason: reason ?? 'Cancelled by buyer', cancelledBy: 'buyer' },
        },
      });

      // If a worker was assigned, free them
      if (task.workerId) {
        await tx.workerProfile.update({
          where: { userId: task.workerId },
          data: { activeTaskId: null },
        });

        await tx.notification.create({
          data: {
            userId: task.workerId,
            type: 'TASK_CANCELLED',
            title: 'Task cancelled',
            body: `The buyer cancelled task "${task.title}"`,
            relatedId: taskId,
          },
        });
      }

      return t;
    });

    log.info({ taskId, buyerId }, 'Task cancelled by buyer');
    return updated;
  }

  // ── Worker: List Open Tasks ──────────────────────────

  async listOpenTasks(query: {
    page?: string;
    limit?: string;
    category?: string;
    urgency?: string;
    lat?: number;
    lng?: number;
    radiusKm?: number;
  }) {
    const pagination = parsePagination(query);
    const where: any = { status: 'OPEN' };

    if (query.category) where.category = query.category;
    if (query.urgency) where.urgency = query.urgency;

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.limit,
        select: {
          id: true,
          title: true,
          category: true,
          urgency: true,
          rateCents: true,
          currency: true,
          locationAddress: true,
          locationLat: true,
          locationLng: true,
          extraNote: true,
          expectedCompletionBy: true,
          createdAt: true,
          buyer: { select: { id: true, name: true } },
        },
      }),
      prisma.task.count({ where }),
    ]);

    // Client-side distance filtering if lat/lng/radius provided
    // Note: when distance filtering is active, total reflects the filtered count,
    // not the DB count — pagination becomes approximate. Acceptable for Sprint 1 MVP.
    // Sprint 2: move to PostGIS for proper geo queries.
    if (query.lat != null && query.lng != null && query.radiusKm) {
      const filtered = tasks.filter((t) => {
        if (t.locationLat == null || t.locationLng == null) return false;
        return distanceKm(query.lat!, query.lng!, t.locationLat, t.locationLng) <= query.radiusKm!;
      });
      return paginatedResponse(filtered, filtered.length, pagination);
    }

    return paginatedResponse(tasks, total, pagination);
  }

  // ── Worker: Get Task Detail ──────────────────────────

  async getWorkerTaskDetail(taskId: string, workerId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        buyer: { select: { id: true, name: true } },
        media: { where: { type: 'REFERENCE_IMAGE' } },
      },
    });

    if (!task) throw new NotFoundError('Task', taskId);

    // Open tasks can be viewed by any worker (browsing).
    // Assigned tasks can only be viewed by the assigned worker.
    if (task.status !== 'OPEN' && task.workerId !== workerId) {
      throw new ForbiddenError('You are not assigned to this task');
    }

    return task;
  }

  // ── Worker: My Tasks ─────────────────────────────────

  async listWorkerTasks(
    workerId: string,
    query: { page?: string; limit?: string; status?: string }
  ) {
    const pagination = parsePagination(query);
    const where: any = { workerId };
    if (query.status) where.status = query.status as TaskStatus;

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: pagination.skip,
        take: pagination.limit,
        include: {
          buyer: { select: { id: true, name: true } },
          _count: { select: { media: true } },
        },
      }),
      prisma.task.count({ where }),
    ]);

    return paginatedResponse(tasks, total, pagination);
  }

  // ── Worker: Accept Task ──────────────────────────────

  async acceptTask(taskId: string, workerId: string) {
    // Entire check-and-assign happens inside transaction to prevent race conditions.
    // Two workers accepting simultaneously: the unique constraint on activeTaskId
    // plus serializable isolation guarantees only one succeeds.
    const updated = await prisma.$transaction(async (tx) => {
      // Re-read task inside transaction for consistency
      const task = await tx.task.findUnique({ where: { id: taskId } });
      if (!task) throw new NotFoundError('Task', taskId);

      assertTransition(task.status, 'ACCEPTED', 'WORKER');

      // Check one-active-task rule inside transaction
      const workerProfile = await tx.workerProfile.findUnique({
        where: { userId: workerId },
      });
      if (!workerProfile) throw new NotFoundError('Worker profile');

      if (workerProfile.activeTaskId) {
        throw new ConflictError(
          'You already have an active task. Complete or cancel it first.',
          'WORKER_HAS_ACTIVE_TASK'
        );
      }

      const t = await tx.task.update({
        where: { id: taskId },
        data: { status: 'ACCEPTED', workerId },
      });

      await tx.workerProfile.update({
        where: { userId: workerId },
        data: { activeTaskId: taskId },
      });

      await tx.taskEvent.create({
        data: {
          taskId,
          action: 'accepted',
          actorId: workerId,
        },
      });

      await tx.notification.create({
        data: {
          userId: task.buyerId,
          type: 'TASK_ACCEPTED',
          title: 'Task accepted',
          body: `A worker has accepted your task "${task.title}"`,
          relatedId: taskId,
        },
      });

      return t;
    }, {
      isolationLevel: 'Serializable',
    });

    log.info({ taskId, workerId }, 'Task accepted by worker');
    return updated;
  }

  // ── Worker: Start Task ───────────────────────────────

  async startTask(taskId: string, workerId: string) {
    const timestamps = getTimestampUpdates('IN_PROGRESS');

    const updated = await prisma.$transaction(async (tx) => {
      const task = await tx.task.findUnique({ where: { id: taskId } });
      if (!task) throw new NotFoundError('Task', taskId);
      this.assertWorkerOwns(task, workerId);
      assertTransition(task.status, 'IN_PROGRESS', 'WORKER');

      const t = await tx.task.update({
        where: { id: taskId },
        data: { status: 'IN_PROGRESS', ...timestamps },
      });

      await tx.taskEvent.create({
        data: {
          taskId,
          action: 'started',
          actorId: workerId,
        },
      });

      await tx.notification.create({
        data: {
          userId: task.buyerId,
          type: 'TASK_STARTED',
          title: 'Work started',
          body: `Worker has started working on "${task.title}"`,
          relatedId: taskId,
        },
      });

      return t;
    });

    log.info({ taskId, workerId }, 'Task started');
    return updated;
  }

  // ── Worker: Cancel Task ──────────────────────────────

  async cancelTaskByWorker(taskId: string, workerId: string, reason: string) {
    const timestamps = getTimestampUpdates('CANCELLED');

    const updated = await prisma.$transaction(async (tx) => {
      const task = await tx.task.findUnique({ where: { id: taskId } });
      if (!task) throw new NotFoundError('Task', taskId);
      this.assertWorkerOwns(task, workerId);
      assertTransition(task.status, 'CANCELLED', 'WORKER');

      const t = await tx.task.update({
        where: { id: taskId },
        data: {
          status: 'CANCELLED',
          cancellationReason: reason,
          ...timestamps,
        },
      });

      // Free the worker
      await tx.workerProfile.update({
        where: { userId: workerId },
        data: { activeTaskId: null },
      });

      await tx.taskEvent.create({
        data: {
          taskId,
          action: 'cancelled',
          actorId: workerId,
          metadata: { reason, cancelledBy: 'worker' },
        },
      });

      await tx.notification.create({
        data: {
          userId: task.buyerId,
          type: 'TASK_CANCELLED',
          title: 'Task cancelled by worker',
          body: `Worker cancelled task "${task.title}". Reason: ${reason}`,
          relatedId: taskId,
        },
      });

      return t;
    });

    log.info({ taskId, workerId, reason }, 'Task cancelled by worker');
    return updated;
  }

  // ── Worker: Submit Task ──────────────────────────────

  async submitTask(taskId: string, workerId: string) {
    // PLACEHOLDER: AI verification score. Returns random 0.70-1.00.
    // Sprint 2: replace with actual AI service call to evaluate photo evidence.
    // This value is stored but MUST NOT be used for automated approval decisions.
    const aiScore = parseFloat((0.7 + Math.random() * 0.3).toFixed(2));

    const timestamps = getTimestampUpdates('SUBMITTED');

    const updated = await prisma.$transaction(async (tx) => {
      const task = await tx.task.findUnique({ where: { id: taskId } });
      if (!task) throw new NotFoundError('Task', taskId);
      this.assertWorkerOwns(task, workerId);
      assertTransition(task.status, 'SUBMITTED', 'WORKER');

      // Validate startedAt exists
      if (!task.startedAt) {
        throw new ConflictError('Task must be started before submitting', 'TASK_NOT_STARTED');
      }

      // Validate required evidence exists
      const mediaRecords = await tx.taskMedia.findMany({
        where: { taskId },
        select: { type: true },
      });

      const mediaTypes = new Set(mediaRecords.map((m) => m.type));
      const required = ['BEFORE_PHOTO', 'AFTER_PHOTO', 'PROOF_PHOTO'] as const;
      const missing = required.filter((t) => !mediaTypes.has(t));

      if (missing.length > 0) {
        throw new BadRequestError(
          `Missing required evidence: ${missing.join(', ')}. Upload all required photos before submitting.`
        );
      }

      // Calculate time worked
      const now = new Date();
      const timeSpentSecs = Math.floor((now.getTime() - task.startedAt.getTime()) / 1000);

      const t = await tx.task.update({
        where: { id: taskId },
        data: {
          status: 'SUBMITTED',
          timeSpentSecs,
          aiScore,
          ...timestamps,
        },
      });

      await tx.taskEvent.create({
        data: {
          taskId,
          action: 'submitted',
          actorId: workerId,
          metadata: { timeSpentSecs, aiScore, mediaCount: mediaRecords.length },
        },
      });

      await tx.notification.create({
        data: {
          userId: task.buyerId,
          type: 'TASK_SUBMITTED',
          title: 'Task submitted for review',
          body: `Worker has submitted proof for "${task.title}". Please review.`,
          relatedId: taskId,
        },
      });

      return t;
    });

    log.info({ taskId, workerId, aiScore }, 'Task submitted');
    return updated;
  }

  // ── Buyer: Approve Task ──────────────────────────────

  async approveTask(taskId: string, buyerId: string, dto: ApproveTaskDto) {
    const timestamps = getTimestampUpdates('APPROVED');

    const updated = await prisma.$transaction(async (tx) => {
      // Re-read inside transaction to prevent race conditions
      const task = await tx.task.findUnique({ where: { id: taskId } });
      if (!task) throw new NotFoundError('Task', taskId);
      if (task.buyerId !== buyerId) throw new ForbiddenError('You do not own this task');
      assertTransition(task.status, 'APPROVED', 'BUYER');

      if (!task.workerId) {
        throw new ConflictError('Task has no assigned worker', 'NO_WORKER_ASSIGNED');
      }
      const taskWorkerId = task.workerId;

      const t = await tx.task.update({
        where: { id: taskId },
        data: {
          status: 'APPROVED',
          buyerNotes: dto.buyerNotes ?? null,
          ...timestamps,
        },
      });

      // Create payout record
      await tx.payout.create({
        data: {
          taskId,
          workerId: taskWorkerId,
          buyerId,
          amountCents: task.rateCents,
          currency: task.currency,
          status: 'PENDING',
        },
      });

      // Update worker stats
      await tx.workerProfile.update({
        where: { userId: taskWorkerId },
        data: {
          activeTaskId: null,
          completedTasks: { increment: 1 },
        },
      });

      // Update buyer spend
      await tx.buyerProfile.update({
        where: { userId: buyerId },
        data: { totalSpentCents: { increment: task.rateCents } },
      });

      await tx.taskEvent.create({
        data: {
          taskId,
          action: 'approved',
          actorId: buyerId,
          metadata: { buyerNotes: dto.buyerNotes, payoutAmountCents: task.rateCents },
        },
      });

      await tx.notification.create({
        data: {
          userId: taskWorkerId,
          type: 'TASK_APPROVED',
          title: 'Task approved!',
          body: `Your work on "${task.title}" has been approved. Payout is pending.`,
          relatedId: taskId,
        },
      });

      return t;
    });

    log.info({ taskId, buyerId }, 'Task approved, payout created');
    return updated;
  }

  // ── Buyer: Reject Task ───────────────────────────────

  async rejectTask(taskId: string, buyerId: string, dto: RejectTaskDto) {
    const updated = await prisma.$transaction(async (tx) => {
      // Re-read inside transaction to prevent race conditions
      const task = await tx.task.findUnique({ where: { id: taskId } });
      if (!task) throw new NotFoundError('Task', taskId);
      if (task.buyerId !== buyerId) throw new ForbiddenError('You do not own this task');
      assertTransition(task.status, 'REJECTED', 'BUYER');

      if (!task.workerId) {
        throw new ConflictError('Task has no assigned worker', 'NO_WORKER_ASSIGNED');
      }
      const taskWorkerId = task.workerId;

      const t = await tx.task.update({
        where: { id: taskId },
        data: {
          status: 'REJECTED',
          rejectionReason: dto.reason,
        },
      });

      // Free the worker so they can retry or accept new tasks
      await tx.workerProfile.update({
        where: { userId: taskWorkerId },
        data: { activeTaskId: null },
      });

      await tx.taskEvent.create({
        data: {
          taskId,
          action: 'rejected',
          actorId: buyerId,
          metadata: { reason: dto.reason },
        },
      });

      await tx.notification.create({
        data: {
          userId: taskWorkerId,
          type: 'TASK_REJECTED',
          title: 'Task rejected',
          body: `Your submission for "${task.title}" was rejected. Reason: ${dto.reason}`,
          relatedId: taskId,
        },
      });

      return t;
    });

    log.info({ taskId, buyerId, reason: dto.reason }, 'Task rejected');
    return updated;
  }

  // ── Worker: Retry After Rejection ────────────────────

  async retryTask(taskId: string, workerId: string) {
    const timestamps = getTimestampUpdates('IN_PROGRESS');

    const updated = await prisma.$transaction(async (tx) => {
      // Re-read inside transaction to prevent race conditions
      const task = await tx.task.findUnique({ where: { id: taskId } });
      if (!task) throw new NotFoundError('Task', taskId);
      this.assertWorkerOwns(task, workerId);
      assertTransition(task.status, 'IN_PROGRESS', 'WORKER');

      // Worker must not have another active task (they were freed on rejection)
      const workerProfile = await tx.workerProfile.findUnique({
        where: { userId: workerId },
      });
      if (!workerProfile) throw new NotFoundError('Worker profile');

      if (workerProfile.activeTaskId && workerProfile.activeTaskId !== taskId) {
        throw new ConflictError(
          'You already have another active task.',
          'WORKER_HAS_ACTIVE_TASK'
        );
      }

      const t = await tx.task.update({
        where: { id: taskId },
        data: {
          status: 'IN_PROGRESS',
          rejectionReason: null,
          ...timestamps,
        },
      });

      // Re-claim activeTaskId
      await tx.workerProfile.update({
        where: { userId: workerId },
        data: { activeTaskId: taskId },
      });

      await tx.taskEvent.create({
        data: {
          taskId,
          action: 'retried',
          actorId: workerId,
        },
      });

      await tx.notification.create({
        data: {
          userId: task.buyerId,
          type: 'TASK_STARTED',
          title: 'Worker retrying task',
          body: `Worker is retrying task "${task.title}" after rejection.`,
          relatedId: taskId,
        },
      });

      return t;
    });

    log.info({ taskId, workerId }, 'Task retried after rejection');
    return updated;
  }

  // ── Worker: Log Location ─────────────────────────────

  async logLocation(taskId: string, workerId: string, lat: number, lng: number, accuracy?: number) {
    const task = await this.getTaskOrThrow(taskId);
    this.assertWorkerOwns(task, workerId);

    if (task.status !== 'IN_PROGRESS') {
      throw new ConflictError('Location can only be logged while task is in progress', 'INVALID_TASK_STATE');
    }

    // Basic anti-abuse: check for unreasonable coordinate jumps
    const lastLog = await prisma.taskLocationLog.findFirst({
      where: { taskId },
      orderBy: { timestamp: 'desc' },
    });

    if (lastLog) {
      const dist = distanceKm(lastLog.lat, lastLog.lng, lat, lng);
      const timeDiffSecs = (Date.now() - lastLog.timestamp.getTime()) / 1000;
      // If moved more than 10km in less than 30 seconds, suspicious
      if (dist > 10 && timeDiffSecs < 30) {
        log.warn({ taskId, workerId, dist, timeDiffSecs }, 'Suspicious location jump');
      }
    }

    const logEntry = await prisma.taskLocationLog.create({
      data: { taskId, lat, lng, accuracy },
    });

    return logEntry;
  }

  // ── Helpers ──────────────────────────────────────────

  private async getTaskOrThrow(taskId: string) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundError('Task', taskId);
    return task;
  }

  private assertWorkerOwns(task: { workerId: string | null }, workerId: string) {
    if (task.workerId !== workerId) {
      throw new ForbiddenError('You are not assigned to this task');
    }
  }
}

export const tasksService = new TasksService();
