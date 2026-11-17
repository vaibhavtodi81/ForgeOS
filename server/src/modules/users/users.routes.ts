import { Router } from 'express'
import { requireAuth, requireRole } from '../../middleware/auth.middleware.js'
import { validateRequest } from '../../middleware/validate.middleware.js'
import * as controller from './users.controller.js'
import { createUserSchema, updateUserSchema, userIdParamsSchema, userListQuerySchema, userStatusSchema } from './users.validator.js'

export const usersRoutes = Router()
usersRoutes.use('/users', requireAuth, requireRole('ADMIN'))
usersRoutes.get('/users', validateRequest('query', userListQuerySchema), controller.list)
usersRoutes.get('/users/:id', validateRequest('params', userIdParamsSchema), controller.detail)
usersRoutes.post('/users', validateRequest('body', createUserSchema), controller.create)
usersRoutes.patch('/users/:id', validateRequest('params', userIdParamsSchema), validateRequest('body', updateUserSchema), controller.update)
usersRoutes.patch('/users/:id/status', validateRequest('params', userIdParamsSchema), validateRequest('body', userStatusSchema), controller.status)
