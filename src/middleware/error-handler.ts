import { Request, Response, NextFunction } from 'express';
import { AppError } from '../lib/errors';
import { createModuleLogger } from '../lib/logger';
import { Prisma } from '@prisma/client';

const log = createModuleLogger('error-handler');

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  // Known operational error
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      log.error({ err, reqId: req.headers['x-request-id'] }, err.message);
    } else {
      log.warn({ code: err.code, path: req.path, method: req.method }, err.message);
    }

    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
    });
    return;
  }

  // Prisma known errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[])?.join(', ') ?? 'field';
      res.status(409).json({
        success: false,
        error: {
          code: 'UNIQUE_CONSTRAINT_VIOLATION',
          message: `A record with this ${target} already exists`,
        },
      });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: {
          code: 'RECORD_NOT_FOUND',
          message: 'The requested record was not found',
        },
      });
      return;
    }
  }

  // Unknown/unexpected error — never leak internals
  log.error({ err, path: req.path, method: req.method }, 'Unhandled error');

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message:
        process.env.NODE_ENV === 'development'
          ? err.message
          : 'An unexpected error occurred',
    },
  });
}
