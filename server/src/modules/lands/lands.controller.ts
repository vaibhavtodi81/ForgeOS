import type { RequestHandler } from 'express'
import { sendSuccess } from '../../utils/api-response.js'
import * as service from './lands.service.js'

function actor(req: Parameters<RequestHandler>[0]) {
  if (!req.user) throw new Error('Authenticated user missing after auth middleware')
  return req.user
}
export const list: RequestHandler = async (req, res) => {
  const result = await service.listLands(actor(req), req.query.page as unknown as number, req.query.pageSize as unknown as number, req.query.search as string | undefined)
  sendSuccess(res, 200, result.lands, 'Lands fetched successfully', result.meta)
}
export const detail: RequestHandler = async (req, res) => sendSuccess(res, 200, await service.getLand(actor(req), Number(req.params.id)), 'Land fetched successfully')
export const create: RequestHandler = async (req, res) => sendSuccess(res, 201, await service.createLand(actor(req), req.body), 'Land created successfully')
export const update: RequestHandler = async (req, res) => {
  await service.getLand(actor(req), Number(req.params.id))
  sendSuccess(res, 200, await service.updateLand(Number(req.params.id), req.body), 'Land updated successfully')
}
export const remove: RequestHandler = async (req, res) => {
  await service.getLand(actor(req), Number(req.params.id))
  await service.deleteLand(Number(req.params.id))
  sendSuccess(res, 200, null, 'Land deleted successfully')
}
