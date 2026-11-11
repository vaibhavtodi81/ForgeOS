import type { RequestHandler } from 'express'
import { sendSuccess } from '../../utils/api-response.js'
import * as service from './milestones.service.js'
import type { CreateMilestoneInput, UpdateMilestoneInput } from './milestones.validator.js'

function actor(req: Parameters<RequestHandler>[0]) {
  if (!req.user) throw new Error('Authenticated user missing after auth middleware')
  return req.user
}

export const create: RequestHandler = async (req, res) => sendSuccess(
  res,
  201,
  await service.createMilestone(actor(req), Number(req.params.projectId), req.body as CreateMilestoneInput),
  'Milestone created successfully',
)

export const list: RequestHandler = async (req, res) => sendSuccess(
  res,
  200,
  await service.listMilestones(actor(req), Number(req.params.projectId)),
  'Milestones fetched successfully',
)

export const detail: RequestHandler = async (req, res) => sendSuccess(
  res,
  200,
  await service.getMilestone(actor(req), Number(req.params.id)),
  'Milestone fetched successfully',
)

export const update: RequestHandler = async (req, res) => sendSuccess(
  res,
  200,
  await service.updateMilestone(actor(req), Number(req.params.id), req.body as UpdateMilestoneInput),
  'Milestone updated successfully',
)

export const remove: RequestHandler = async (req, res) => {
  await service.deleteMilestone(actor(req), Number(req.params.id))
  sendSuccess(res, 200, null, 'Milestone deleted successfully')
}
