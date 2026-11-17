import { Router } from 'express'
import { requireAuth, requireRole } from '../../middleware/auth.middleware.js'
import { validateRequest } from '../../middleware/validate.middleware.js'
import * as controller from './billing.controller.js'
import {
  billIdParamsSchema, billListQuerySchema, createBillSchema, paymentListQuerySchema,
  paymentSchema, rejectBillSchema, reportDateQuerySchema, updateBillSchema,
} from './billing.validator.js'
import { projectScopedIdParamsSchema } from '../projects/projects.validator.js'

export const billingRoutes = Router()
billingRoutes.use(requireAuth)
billingRoutes.get('/bills', validateRequest('query', billListQuerySchema), controller.list)
billingRoutes.post('/bills', validateRequest('body', createBillSchema), controller.create)
billingRoutes.get('/bills/:id', validateRequest('params', billIdParamsSchema), controller.detail)
billingRoutes.patch('/bills/:id', validateRequest('params', billIdParamsSchema), validateRequest('body', updateBillSchema), controller.update)
billingRoutes.delete('/bills/:id', validateRequest('params', billIdParamsSchema), controller.remove)
billingRoutes.post('/bills/:id/approve', requireRole('ADMIN'), validateRequest('params', billIdParamsSchema), controller.approve)
billingRoutes.post('/bills/:id/reject', requireRole('ADMIN'), validateRequest('params', billIdParamsSchema), validateRequest('body', rejectBillSchema), controller.reject)
billingRoutes.get('/bills/:id/payments', validateRequest('params', billIdParamsSchema), validateRequest('query', paymentListQuerySchema), controller.payments)
billingRoutes.post('/bills/:id/payments', requireRole('ADMIN'), validateRequest('params', billIdParamsSchema), validateRequest('body', paymentSchema), controller.createPayment)
billingRoutes.get('/projects/:projectId/expenses', validateRequest('params', projectScopedIdParamsSchema), validateRequest('query', reportDateQuerySchema), controller.projectExpenses)
billingRoutes.get('/reports/vendor-outstanding', validateRequest('query', reportDateQuerySchema), controller.vendorOutstanding)
billingRoutes.get('/reports/payment-history', validateRequest('query', reportDateQuerySchema), controller.paymentHistory)
