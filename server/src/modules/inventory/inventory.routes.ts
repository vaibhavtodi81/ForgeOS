import { Router } from 'express'
import { requireAuth } from '../../middleware/auth.middleware.js'
import { validateRequest } from '../../middleware/validate.middleware.js'
import * as controller from './inventory.controller.js'
import { createTransactionSchema, projectInventoryParamsSchema, transactionListQuerySchema, wastageQuerySchema } from './inventory.validator.js'

export const inventoryRoutes = Router()
inventoryRoutes.use(requireAuth)
inventoryRoutes.get('/projects/:projectId/inventory', validateRequest('params', projectInventoryParamsSchema), controller.inventory)
inventoryRoutes.post('/projects/:projectId/inventory/transactions', validateRequest('params', projectInventoryParamsSchema), validateRequest('body', createTransactionSchema), controller.createTransaction)
inventoryRoutes.get('/projects/:projectId/inventory/transactions', validateRequest('params', projectInventoryParamsSchema), validateRequest('query', transactionListQuerySchema), controller.transactions)
inventoryRoutes.get('/projects/:projectId/inventory/summary', validateRequest('params', projectInventoryParamsSchema), controller.summary)
inventoryRoutes.get('/projects/:projectId/inventory/wastage', validateRequest('params', projectInventoryParamsSchema), validateRequest('query', wastageQuerySchema), controller.wastage)
