import type { ErrorRequestHandler, RequestHandler } from 'express'
import { Prisma } from '@prisma/client'
import { logger } from '../config/logger.js'
import { AppError } from '../utils/errors.js'

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new AppError('NOT_FOUND', `Route not found: ${req.method} ${req.originalUrl}`, 404))
}

export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  if (error instanceof AppError) {
    res.status(error.status).json({
      success: false,
      message: error.message,
      errors: error.details ?? [],
      data: null,
      error: { code: error.code, message: error.message, details: error.details },
    })
    return
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const mapped = error.code === 'P2002'
      ? { code: 'CONFLICT' as const, status: 409, message: 'A record with the same unique value already exists.' }
      : error.code === 'P2025'
        ? { code: 'NOT_FOUND' as const, status: 404, message: 'The requested record was not found.' }
        : { code: 'INTERNAL_ERROR' as const, status: 500, message: 'A database error occurred.' }

    res.status(mapped.status).json({
      success: false,
      message: mapped.message,
      errors: [],
      data: null,
      error: { code: mapped.code, message: mapped.message },
    })
    logger.error({ err: error, method: req.method, path: req.originalUrl }, 'Database request failed')
    return
  }

  logger.error({ err: error, method: req.method, path: req.originalUrl }, 'Unhandled request error')
  res.status(500).json({
    success: false,
    message: 'An unexpected error occurred.',
    errors: [],
    data: null,
    error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' },
  })
}
