import { Router } from 'express' // Imports Express types or tools used to build the HTTP API.
import { requireAuth, requireRole } from '../../middleware/auth.middleware.js' // Imports { requireAuth, requireRole } from '../../middleware/auth.middleware.js' so this module can reuse that functionality.
import { validateRequest } from '../../middleware/validate.middleware.js' // Imports { validateRequest } from '../../middleware/validate.middleware.js' so this module can reuse that functionality.
import * as controller from './users.controller.js' // Imports * as controller from './users.controller.js' so this module can reuse that functionality.
import { createUserSchema, updateUserSchema, userIdParamsSchema, userListQuerySchema, userStatusSchema } from './users.validator.js' // Imports { createUserSchema, updateUserSchema, userIdParamsSchema, userListQuerySchema, userStatusSchema } from './users.validator.js' so this module can reuse that functionality.

export const usersRoutes = Router() // Provides `export const usersRoutes = Router()` as part of this server module.
usersRoutes.use('/users', requireAuth, requireRole('ADMIN')) // Provides `usersRoutes.use('/users', requireAuth, requireRole('ADMIN'))` as part of this server module.
usersRoutes.get('/users', validateRequest('query', userListQuerySchema), controller.list) // Provides `usersRoutes.get('/users', validateRequest('query', userListQuerySchema), controller.list)` as part of this server module.
usersRoutes.get('/users/:id', validateRequest('params', userIdParamsSchema), controller.detail) // Provides `usersRoutes.get('/users/:id', validateRequest('params', userIdParamsSchema), controller.detail)` as part of this server module.
usersRoutes.post('/users', validateRequest('body', createUserSchema), controller.create) // Provides `usersRoutes.post('/users', validateRequest('body', createUserSchema), controller.create)` as part of this server module.
usersRoutes.patch('/users/:id', validateRequest('params', userIdParamsSchema), validateRequest('body', updateUserSchema), controller.update) // Provides `usersRoutes.patch('/users/:id', validateRequest('params', userIdParamsSchema), validateRequest('body', updateUserSchema), controller.update)` as part of this server module.
usersRoutes.patch('/users/:id/status', validateRequest('params', userIdParamsSchema), validateRequest('body', userStatusSchema), controller.status) // Provides `usersRoutes.patch('/users/:id/status', validateRequest('params', userIdParamsSchema), validateRequest('body', userStatusSchema), controller.status)` as part of this server module.
// File purpose: Defines the HTTP endpoints and middleware chain for the users API.
