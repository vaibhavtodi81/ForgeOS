import type { RequestHandler } from 'express'
import { sendSuccess } from '../../utils/api-response.js'
import { getCurrentUser, login } from './auth.service.js'

export const signIn: RequestHandler = async (req, res) => {
  const result = await login(req.body.email, req.body.password)
  sendSuccess(res, 200, result, 'Login successful')
}

export const me: RequestHandler = async (req, res) => {
  if (!req.user) throw new Error('Authenticated user missing after auth middleware')
  const user = await getCurrentUser(req.user.id)
  sendSuccess(res, 200, user, 'Profile fetched successfully')
}
