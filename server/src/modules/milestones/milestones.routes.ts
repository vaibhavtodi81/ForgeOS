import { Router } from 'express'
import { requireAuth } from '../../middleware/auth.middleware.js'
import { validateRequest } from '../../middleware/validate.middleware.js'
import * as controller from './milestones.controller.js'
import {
  createMilestoneSchema,
  milestoneIdParamsSchema,
  updateMilestoneSchema,
} from './milestones.validator.js'
import { projectScopedIdParamsSchema } from '../projects/projects.validator.js'

export const milestonesRoutes = Router()
milestonesRoutes.use(requireAuth)
milestonesRoutes.post(
  '/projects/:projectId/milestones',
  validateRequest('params', projectScopedIdParamsSchema),
  validateRequest('body', createMilestoneSchema),
  controller.create,
)
milestonesRoutes.get(
  '/projects/:projectId/milestones',
  validateRequest('params', projectScopedIdParamsSchema),
  controller.list,
)
milestonesRoutes.get(
  '/milestones/:id',
  validateRequest('params', milestoneIdParamsSchema),
  controller.detail,
)
milestonesRoutes.patch(
  '/milestones/:id',
  validateRequest('params', milestoneIdParamsSchema),
  validateRequest('body', updateMilestoneSchema),
  controller.update,
)
milestonesRoutes.delete(
  '/milestones/:id',
  validateRequest('params', milestoneIdParamsSchema),
  controller.remove,
)
