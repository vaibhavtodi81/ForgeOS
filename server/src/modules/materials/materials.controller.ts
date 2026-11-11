import type { RequestHandler } from 'express'
import { sendSuccess } from '../../utils/api-response.js'
import * as service from './materials.service.js'

export const list: RequestHandler = async (req, res) => sendSuccess(
  res, 200, await service.listMaterials(req.query as never), 'Materials fetched successfully',
)
export const detail: RequestHandler = async (req, res) => sendSuccess(
  res, 200, await service.getMaterial(Number(req.params.id)), 'Material fetched successfully',
)
export const create: RequestHandler = async (req, res) => sendSuccess(
  res, 201, await service.createMaterial(req.body), 'Material created successfully',
)
export const update: RequestHandler = async (req, res) => sendSuccess(
  res, 200, await service.updateMaterial(Number(req.params.id), req.body), 'Material updated successfully',
)
