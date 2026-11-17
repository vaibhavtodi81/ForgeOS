import { Router } from 'express'
import { requireAuth, requireRole } from '../../middleware/auth.middleware.js'
import * as controller from './dashboard.controller.js'

export const dashboardRoutes = Router()

dashboardRoutes.use(requireAuth)

dashboardRoutes.get('/dashboard/admin', requireRole('ADMIN'), controller.adminDashboard)
dashboardRoutes.get('/dashboard/pm', controller.pmDashboard)
dashboardRoutes.get('/wastage/overview', controller.portfolioWastage)
