import { Router } from 'express'
import { requireAuth } from '../../middleware/auth.middleware.js'
import { validateRequest } from '../../middleware/validate.middleware.js'
import * as controller from './material-plans.controller.js'
import {
  createPlanSchema,
  updatePlanSchema,
  projectPlanParamsSchema,
  planIdParamsSchema,
} from './material-plans.validator.js'

export const materialPlansRoutes = Router()

materialPlansRoutes.use(requireAuth)

materialPlansRoutes.get(
  '/projects/:projectId/material-plans',
  validateRequest('params', projectPlanParamsSchema),
  controller.listPlans,
)

materialPlansRoutes.post(
  '/projects/:projectId/material-plans',
  validateRequest('params', projectPlanParamsSchema),
  validateRequest('body', createPlanSchema),
  controller.createPlan,
)

materialPlansRoutes.patch(
  '/material-plans/:id',
  validateRequest('params', planIdParamsSchema),
  validateRequest('body', updatePlanSchema),
  controller.updatePlan,
)

materialPlansRoutes.delete(
  '/material-plans/:id',
  validateRequest('params', planIdParamsSchema),
  controller.deletePlan,
)
