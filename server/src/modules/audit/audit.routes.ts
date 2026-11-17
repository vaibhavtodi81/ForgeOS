import { Router } from 'express'
import { requireAuth, requireRole } from '../../middleware/auth.middleware.js'
import { validateRequest } from '../../middleware/validate.middleware.js'
import * as controller from './audit.controller.js'
import { auditLogQuerySchema } from './audit.validator.js'

export const auditRoutes = Router()

auditRoutes.use(requireAuth, requireRole('ADMIN'))

auditRoutes.get('/audit-logs', validateRequest('query', auditLogQuerySchema), controller.listLogs)
auditRoutes.get('/audit-logs/stats', controller.stats)
