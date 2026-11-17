import { Router } from 'express'
import { requireAuth } from '../../middleware/auth.middleware.js'
import { validateRequest } from '../../middleware/validate.middleware.js'
import * as controller from './daily-logs.controller.js'
import {
  dailyLogBodySchema,
  dailyLogIdParamsSchema,
  dailyLogListQuerySchema,
  dailyLogPatchSchema,
  projectIdParamsSchema,
} from './daily-logs.validator.js'

export const dailyLogsRoutes = Router()
dailyLogsRoutes.use(requireAuth)
dailyLogsRoutes.get(
  '/projects/:projectId/daily-logs',
  validateRequest('params', projectIdParamsSchema),
  validateRequest('query', dailyLogListQuerySchema),
  controller.list,
)
dailyLogsRoutes.post(
  '/projects/:projectId/daily-logs',
  validateRequest('params', projectIdParamsSchema),
  validateRequest('body', dailyLogBodySchema),
  controller.create,
)
dailyLogsRoutes.get(
  '/daily-logs/:id',
  validateRequest('params', dailyLogIdParamsSchema),
  controller.detail,
)
dailyLogsRoutes.patch(
  '/daily-logs/:id',
  validateRequest('params', dailyLogIdParamsSchema),
  validateRequest('body', dailyLogPatchSchema),
  controller.update,
)
dailyLogsRoutes.delete(
  '/daily-logs/:id',
  validateRequest('params', dailyLogIdParamsSchema),
  controller.remove,
)
