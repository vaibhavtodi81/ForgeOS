import type { RequestHandler } from 'express'
import type { ZodType } from 'zod'
import { AppError } from '../utils/errors.js'

export function validateRequest(
  target: 'body' | 'params' | 'query',
  schema: ZodType,
): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req[target])
    if (!result.success) {
      next(new AppError(
        'VALIDATION_ERROR',
        'Validation failed.',
        400,
        result.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      ))
      return
    }
    Object.defineProperty(req, target, {
      value: result.data,
      configurable: true,
      enumerable: true,
      writable: true,
    })
    next()
  }
}
