import type { RequestHandler } from 'express'
import { sendSuccess } from '../../utils/api-response.js'
import * as service from './materials.service.js'

function actor(req: Parameters<RequestHandler>[0]) {
  if (!req.user) throw new Error('Authenticated user missing after auth middleware')
  return req.user
}

export const list: RequestHandler = async (req, res) => sendSuccess(
  res, 200, await service.listMaterials(req.query as never), 'Materials fetched successfully',
)
export const detail: RequestHandler = async (req, res) => sendSuccess(
  res, 200, await service.getMaterial(Number(req.params.id)), 'Material fetched successfully',
)
export const create: RequestHandler = async (req, res) => sendSuccess(
  res, 201, await service.createMaterial(actor(req), req.body), 'Material created successfully',
)
export const update: RequestHandler = async (req, res) => sendSuccess(
  res, 200, await service.updateMaterial(actor(req), Number(req.params.id), req.body), 'Material updated successfully',
)
export const updateStatus: RequestHandler = async (req, res) => sendSuccess(
  res, 200, await service.updateMaterialStatus(actor(req), Number(req.params.id), req.body.isActive), 'Material status updated successfully',
)
