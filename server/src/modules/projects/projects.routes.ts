import { Router } from 'express'
import { requireAuth, requireRole } from '../../middleware/auth.middleware.js'
import { validateRequest } from '../../middleware/validate.middleware.js'
import * as controller from './projects.controller.js'
import {
  createProjectSchema,
  projectIdParamsSchema,
  projectActivityQuerySchema,
  projectListQuerySchema,
  projectProgressHistoryQuerySchema,
  projectDateRangeQuerySchema,
  projectScopedIdParamsSchema,
  updateProjectSchema,
} from './projects.validator.js'

export const projectsRoutes = Router()
projectsRoutes.use(requireAuth)
projectsRoutes.get('/projects', validateRequest('query', projectListQuerySchema), controller.list)
projectsRoutes.get(
  '/projects/:projectId/progress-history',
  validateRequest('params', projectScopedIdParamsSchema),
  validateRequest('query', projectProgressHistoryQuerySchema),
  controller.progressHistory,
)
projectsRoutes.get(
  '/projects/:projectId/summary',
  validateRequest('params', projectScopedIdParamsSchema),
  controller.summary,
)
projectsRoutes.get(
  '/projects/:projectId/activity',
  validateRequest('params', projectScopedIdParamsSchema),
  validateRequest('query', projectActivityQuerySchema),
  controller.activity,
)
projectsRoutes.get(
  '/projects/:projectId/labour-summary',
  validateRequest('params', projectScopedIdParamsSchema),
  validateRequest('query', projectDateRangeQuerySchema),
  controller.labourSummary,
)
projectsRoutes.get(
  '/projects/:projectId/machinery-summary',
  validateRequest('params', projectScopedIdParamsSchema),
  validateRequest('query', projectDateRangeQuerySchema),
  controller.machinerySummary,
)
projectsRoutes.get(
  '/projects/:projectId/worker-count-history',
  validateRequest('params', projectScopedIdParamsSchema),
  validateRequest('query', projectDateRangeQuerySchema),
  controller.workerCountHistory,
)
projectsRoutes.get(
  '/projects/:projectId/machinery-usage-history',
  validateRequest('params', projectScopedIdParamsSchema),
  validateRequest('query', projectDateRangeQuerySchema),
  controller.machineryUsageHistory,
)
projectsRoutes.get('/projects/:id', validateRequest('params', projectIdParamsSchema), controller.detail)
projectsRoutes.post('/projects', requireRole('ADMIN'), validateRequest('body', createProjectSchema), controller.create)
projectsRoutes.patch('/projects/:id', validateRequest('params', projectIdParamsSchema), validateRequest('body', updateProjectSchema), controller.update)
projectsRoutes.delete('/projects/:id', requireRole('ADMIN'), validateRequest('params', projectIdParamsSchema), controller.remove)
