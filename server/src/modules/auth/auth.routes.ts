import { Router } from 'express'
import { requireAuth } from '../../middleware/auth.middleware.js'
import { validateRequest } from '../../middleware/validate.middleware.js'
import * as controller from './auth.controller.js'
import { loginSchema } from './auth.validator.js'

export const authRoutes = Router()
authRoutes.post('/auth/login', validateRequest('body', loginSchema), controller.signIn)
authRoutes.get('/auth/me', requireAuth, controller.me)
