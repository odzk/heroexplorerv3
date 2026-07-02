import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { isProd } from '../config/env';

// ============================================================================
// Centralized error handling.
// Replaces the legacy `cb(null, err)` anti-pattern (errors returned as 200
// success bodies) with real HTTP status codes and a consistent error shape.
// ============================================================================

/** Throwable HTTP error with a status code + optional details. */
export class HttpError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.details = details;
  }
}

/** Wrap an async handler so thrown/rejected errors reach the error middleware. */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

/** Normalize an upstream (Viator/axios) failure into an HttpError. */
export function upstreamError(error: unknown, label: string): HttpError {
  const anyErr = error as { response?: { status?: number; data?: unknown }; message?: string };
  const status = anyErr?.response?.status ?? 502;
  return new HttpError(
    status >= 400 && status < 600 ? status : 502,
    `${label} failed`,
    anyErr?.response?.data ?? anyErr?.message,
  );
}

/** 404 handler for unmatched routes. */
export const notFound = (_req: Request, res: Response): void => {
  res.status(404).json({ message: 'Not found' });
};

/** Final error-handling middleware. */
export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void => {
  // Zod validation errors
  if (err instanceof ZodError) {
    res.status(422).json({ message: 'Validation failed', details: err.flatten() });
    return;
  }

  // Prisma known request errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2025') {
      res.status(404).json({ message: 'Record not found' });
      return;
    }
    if (err.code === 'P2002') {
      res.status(409).json({ message: 'Unique constraint violation', details: err.meta });
      return;
    }
    res.status(400).json({ message: 'Database request error', details: isProd ? undefined : err.meta });
    return;
  }

  // Explicit HttpError
  if (err instanceof HttpError) {
    res.status(err.status).json({ message: err.message, details: isProd ? undefined : err.details });
    return;
  }

  // Fallback
  const message = err instanceof Error ? err.message : 'Internal server error';
  // eslint-disable-next-line no-console
  console.error('[Error]', message);
  res.status(500).json({ message: isProd ? 'Internal server error' : message });
};
