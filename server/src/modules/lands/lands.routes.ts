import { Router } from 'express'
import { requireAuth, requireRole } from '../../middleware/auth.middleware.js'
import { validateRequest } from '../../middleware/validate.middleware.js'
import * as controller from './lands.controller.js'
import { createLandSchema, landIdParamsSchema, landListQuerySchema, updateLandSchema } from './lands.validator.js'

export const landsRoutes = Router()
landsRoutes.use(requireAuth)
landsRoutes.get('/lands', validateRequest('query', landListQuerySchema), controller.list)
landsRoutes.get('/lands/:id', validateRequest('params', landIdParamsSchema), controller.detail)
landsRoutes.post('/lands', requireRole('ADMIN'), validateRequest('body', createLandSchema), controller.create)
landsRoutes.patch('/lands/:id', requireRole('ADMIN'), validateRequest('params', landIdParamsSchema), validateRequest('body', updateLandSchema), controller.update)
landsRoutes.delete('/lands/:id', requireRole('ADMIN'), validateRequest('params', landIdParamsSchema), controller.remove)
