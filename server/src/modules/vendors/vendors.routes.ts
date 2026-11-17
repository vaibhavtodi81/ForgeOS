import { Router } from 'express'
import { requireAuth, requireRole } from '../../middleware/auth.middleware.js'
import { validateRequest } from '../../middleware/validate.middleware.js'
import * as controller from './vendors.controller.js'
import { createVendorSchema, projectVendorParamsSchema, updateVendorSchema, vendorIdParamsSchema, vendorListQuerySchema } from './vendors.validator.js'
import { projectScopedIdParamsSchema } from '../projects/projects.validator.js'

export const vendorsRoutes = Router()
vendorsRoutes.use(requireAuth)
vendorsRoutes.get('/vendors', validateRequest('query', vendorListQuerySchema), controller.list)
vendorsRoutes.post('/vendors', validateRequest('body', createVendorSchema), controller.create)
vendorsRoutes.get('/vendors/:id', validateRequest('params', vendorIdParamsSchema), controller.detail)
vendorsRoutes.patch('/vendors/:id', requireRole('ADMIN'), validateRequest('params', vendorIdParamsSchema), validateRequest('body', updateVendorSchema), controller.update)
vendorsRoutes.delete('/vendors/:id', requireRole('ADMIN'), validateRequest('params', vendorIdParamsSchema), controller.deactivate)
vendorsRoutes.get('/projects/:projectId/vendors', validateRequest('params', projectScopedIdParamsSchema), controller.projectList)
vendorsRoutes.post('/projects/:projectId/vendors/:vendorId', validateRequest('params', projectVendorParamsSchema), controller.assign)
vendorsRoutes.delete('/projects/:projectId/vendors/:vendorId', validateRequest('params', projectVendorParamsSchema), controller.unassign)
