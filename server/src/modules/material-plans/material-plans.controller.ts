import type { RequestHandler } from 'express'
import { sendSuccess } from '../../utils/api-response.js'
import * as service from './material-plans.service.js'

export const listPlans: RequestHandler = async (req, res) => {
  if (!req.user) throw new Error('Authenticated user missing after auth middleware')
  const plans = await service.listPlans(req.user, Number(req.params.projectId))
  sendSuccess(res, 200, plans, 'Material plans fetched successfully')
}

export const createPlan: RequestHandler = async (req, res) => {
  if (!req.user) throw new Error('Authenticated user missing after auth middleware')
  const plan = await service.createPlan(req.user, Number(req.params.projectId), req.body)
  sendSuccess(res, 201, plan, 'Material plan created successfully')
}

export const updatePlan: RequestHandler = async (req, res) => {
  if (!req.user) throw new Error('Authenticated user missing after auth middleware')
  const plan = await service.updatePlan(req.user, Number(req.params.id), req.body)
  sendSuccess(res, 200, plan, 'Material plan updated successfully')
}

export const deletePlan: RequestHandler = async (req, res) => {
  if (!req.user) throw new Error('Authenticated user missing after auth middleware')
  await service.deletePlan(req.user, Number(req.params.id))
  sendSuccess(res, 200, null, 'Material plan deleted successfully')
}
