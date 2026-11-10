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
      error: { code: error.code, message: error.message, details: error.details },
    })
    return
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'A database error occurred.' },
    })
    logger.error({ err: error, method: req.method, path: req.originalUrl }, 'Database request failed')
    return
  }

  logger.error({ err: error, method: req.method, path: req.originalUrl }, 'Unhandled request error')
  res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' },
  })
}
