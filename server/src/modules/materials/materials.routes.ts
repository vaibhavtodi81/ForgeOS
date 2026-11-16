import { Router } from 'express' // Imports Express types or tools used to build the HTTP API.
import { requireAuth, requireRole } from '../../middleware/auth.middleware.js' // Imports { requireAuth, requireRole } from '../../middleware/auth.middleware.js' so this module can reuse that functionality.
import { validateRequest } from '../../middleware/validate.middleware.js' // Imports { validateRequest } from '../../middleware/validate.middleware.js' so this module can reuse that functionality.
import * as controller from './materials.controller.js' // Imports * as controller from './materials.controller.js' so this module can reuse that functionality.
import { // Imports { from  so this module can reuse that functionality.
  createMaterialSchema, // Separates this argument or property from the next item in the surrounding call or object.
  materialIdParamsSchema, // Separates this argument or property from the next item in the surrounding call or object.
  materialListQuerySchema, // Separates this argument or property from the next item in the surrounding call or object.
  updateMaterialSchema, // Separates this argument or property from the next item in the surrounding call or object.
} from './materials.validator.js' // Provides `} from './materials.validator.js'` as part of this server module.

export const materialsRoutes = Router() // Provides `export const materialsRoutes = Router()` as part of this server module.
materialsRoutes.use(requireAuth) // Provides `materialsRoutes.use(requireAuth)` as part of this server module.
materialsRoutes.get('/materials', validateRequest('query', materialListQuerySchema), controller.list) // Provides `materialsRoutes.get('/materials', validateRequest('query', materialListQuerySchema), controller.list)` as part of this server module.
materialsRoutes.get('/materials/:id', validateRequest('params', materialIdParamsSchema), controller.detail) // Provides `materialsRoutes.get('/materials/:id', validateRequest('params', materialIdParamsSchema), controller.detail)` as part of this server module.
materialsRoutes.post('/materials', requireRole('ADMIN'), validateRequest('body', createMaterialSchema), controller.create) // Provides `materialsRoutes.post('/materials', requireRole('ADMIN'), validateRequest('body', createMaterialSchema), controller.create)` as part of this server module.
materialsRoutes.patch('/materials/:id', requireRole('ADMIN'), validateRequest('params', materialIdParamsSchema), validateRequest('body', updateMaterialSchema), controller.update) // Provides `materialsRoutes.patch('/materials/:id', requireRole('ADMIN'), validateRequest('params', materialIdParamsSchema), validateRequest('body', updateMaterialSchema), controller.update)` as part of this server module.
// File purpose: Defines the HTTP endpoints and middleware chain for the materials API.
