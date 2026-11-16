import { Router } from 'express' // Imports Express types or tools used to build the HTTP API.
import { requireAuth, requireRole } from '../../middleware/auth.middleware.js' // Imports { requireAuth, requireRole } from '../../middleware/auth.middleware.js' so this module can reuse that functionality.
import { validateRequest } from '../../middleware/validate.middleware.js' // Imports { validateRequest } from '../../middleware/validate.middleware.js' so this module can reuse that functionality.
import * as controller from './lands.controller.js' // Imports * as controller from './lands.controller.js' so this module can reuse that functionality.
import { createLandSchema, landIdParamsSchema, landListQuerySchema, updateLandSchema } from './lands.validator.js' // Imports { createLandSchema, landIdParamsSchema, landListQuerySchema, updateLandSchema } from './lands.validator.js' so this module can reuse that functionality.

export const landsRoutes = Router() // Provides `export const landsRoutes = Router()` as part of this server module.
landsRoutes.use(requireAuth) // Provides `landsRoutes.use(requireAuth)` as part of this server module.
landsRoutes.get('/lands', validateRequest('query', landListQuerySchema), controller.list) // Provides `landsRoutes.get('/lands', validateRequest('query', landListQuerySchema), controller.list)` as part of this server module.
landsRoutes.get('/lands/:id', validateRequest('params', landIdParamsSchema), controller.detail) // Provides `landsRoutes.get('/lands/:id', validateRequest('params', landIdParamsSchema), controller.detail)` as part of this server module.
landsRoutes.post('/lands', requireRole('ADMIN'), validateRequest('body', createLandSchema), controller.create) // Provides `landsRoutes.post('/lands', requireRole('ADMIN'), validateRequest('body', createLandSchema), controller.create)` as part of this server module.
landsRoutes.patch('/lands/:id', requireRole('ADMIN'), validateRequest('params', landIdParamsSchema), validateRequest('body', updateLandSchema), controller.update) // Provides `landsRoutes.patch('/lands/:id', requireRole('ADMIN'), validateRequest('params', landIdParamsSchema), validateRequest('body', updateLandSchema), controller.update)` as part of this server module.
landsRoutes.delete('/lands/:id', requireRole('ADMIN'), validateRequest('params', landIdParamsSchema), controller.remove) // Provides `landsRoutes.delete('/lands/:id', requireRole('ADMIN'), validateRequest('params', landIdParamsSchema), controller.remove)` as part of this server module.
// File purpose: Defines the HTTP endpoints and middleware chain for the lands API.
