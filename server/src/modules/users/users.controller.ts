import type { RequestHandler } from 'express'
import { sendSuccess } from '../../utils/api-response.js'
import * as service from './users.service.js'

export const list: RequestHandler = async (req, res) => {
  const result = await service.listUsers(req.query.page as unknown as number, req.query.pageSize as unknown as number, req.query.search as string | undefined)
  sendSuccess(res, 200, result.users, 'Users fetched successfully', result.meta)
}
export const detail: RequestHandler = async (req, res) => sendSuccess(res, 200, await service.getUser(Number(req.params.id)), 'User fetched successfully')
export const create: RequestHandler = async (req, res) => sendSuccess(res, 201, await service.createUser(req.body), 'User created successfully')
export const update: RequestHandler = async (req, res) => {
  if (!req.user) throw new Error('Authenticated user missing after auth middleware')
  sendSuccess(res, 200, await service.updateUser(req.user, Number(req.params.id), req.body), 'User updated successfully')
}
export const status: RequestHandler = async (req, res) => {
  if (!req.user) throw new Error('Authenticated user missing after auth middleware')
  sendSuccess(res, 200, await service.updateUserStatus(req.user, Number(req.params.id), req.body.isActive), 'User status updated successfully')
}
