import type { Response } from 'express'

export function sendSuccess<T>(
  response: Response,
  status: number,
  data: T,
  message: string,
  meta: unknown = null,
) {
  return response.status(status).json({
    success: true,
    message,
    data,
    meta,
  })
}
