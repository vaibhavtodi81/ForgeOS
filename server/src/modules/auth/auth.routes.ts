import { Router } from 'express' // Imports Express types or tools used to build the HTTP API.
import { requireAuth } from '../../middleware/auth.middleware.js' // Imports { requireAuth } from '../../middleware/auth.middleware.js' so this module can reuse that functionality.
import { validateRequest } from '../../middleware/validate.middleware.js' // Imports { validateRequest } from '../../middleware/validate.middleware.js' so this module can reuse that functionality.
import * as controller from './auth.controller.js' // Imports * as controller from './auth.controller.js' so this module can reuse that functionality.
import { loginSchema } from './auth.validator.js' // Imports { loginSchema } from './auth.validator.js' so this module can reuse that functionality.

export const authRoutes = Router() // Provides `export const authRoutes = Router()` as part of this server module.
authRoutes.post('/auth/login', validateRequest('body', loginSchema), controller.signIn) // Provides `authRoutes.post('/auth/login', validateRequest('body', loginSchema), controller.signIn)` as part of this server module.
authRoutes.get('/auth/me', requireAuth, controller.me) // Provides `authRoutes.get('/auth/me', requireAuth, controller.me)` as part of this server module.
// File purpose: Defines the HTTP endpoints and middleware chain for the auth API.
