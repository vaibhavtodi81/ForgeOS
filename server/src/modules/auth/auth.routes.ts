import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { requireAuth } from '../../middleware/auth.middleware.js'
import { validateRequest } from '../../middleware/validate.middleware.js'
import * as controller from './auth.controller.js'
import { loginSchema, changePasswordSchema } from './auth.validator.js'
import { env } from '../../config/env.js'

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: env.LOGIN_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many login attempts. Please try again in a minute.',
    },
  },
})

export const authRoutes = Router()

authRoutes.post('/auth/login', loginLimiter, validateRequest('body', loginSchema), controller.signIn)
authRoutes.get('/auth/me', requireAuth, controller.me)
authRoutes.post('/auth/change-password', requireAuth, validateRequest('body', changePasswordSchema), controller.changePassword)
