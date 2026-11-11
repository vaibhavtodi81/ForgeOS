import { Router } from 'express'
import { requireAuth, requireRole } from '../../middleware/auth.middleware.js'
import { validateRequest } from '../../middleware/validate.middleware.js'
import * as controller from './materials.controller.js'
import {
  createMaterialSchema,
  materialIdParamsSchema,
  materialListQuerySchema,
  updateMaterialSchema,
} from './materials.validator.js'

export const materialsRoutes = Router()
materialsRoutes.use(requireAuth)
materialsRoutes.get('/materials', validateRequest('query', materialListQuerySchema), controller.list)
materialsRoutes.get('/materials/:id', validateRequest('params', materialIdParamsSchema), controller.detail)
materialsRoutes.post('/materials', requireRole('ADMIN'), validateRequest('body', createMaterialSchema), controller.create)
materialsRoutes.patch('/materials/:id', requireRole('ADMIN'), validateRequest('params', materialIdParamsSchema), validateRequest('body', updateMaterialSchema), controller.update)
