import type { RequestHandler } from 'express'
import { sendSuccess } from '../../utils/api-response.js'
import * as service from './dashboard.service.js'

export const adminDashboard: RequestHandler = async (req, res) => {
  if (!req.user) throw new Error('Authenticated user missing after auth middleware')
  const result = await service.getAdminDashboard(req.user)
  sendSuccess(res, 200, result, 'Admin dashboard fetched successfully')
}

export const pmDashboard: RequestHandler = async (req, res) => {
  if (!req.user) throw new Error('Authenticated user missing after auth middleware')
  const result = await service.getPmDashboard(req.user)
  sendSuccess(res, 200, result, 'PM dashboard fetched successfully')
}

export const portfolioWastage: RequestHandler = async (req, res) => {
  if (!req.user) throw new Error('Authenticated user missing after auth middleware')
  const result = await service.getPortfolioWastage(req.user)
  sendSuccess(res, 200, result, 'Portfolio wastage overview fetched successfully')
}
