import type { RequestHandler } from 'express' // Imports Express types or tools used to build the HTTP API.
import { sendSuccess } from '../../utils/api-response.js' // Imports { sendSuccess } from '../../utils/api-response.js' so this module can reuse that functionality.
import * as service from './users.service.js' // Imports * as service from './users.service.js' so this module can reuse that functionality.

export const list: RequestHandler = async (req, res) => { // Opens the function, callback, or control-flow block that groups the related statements.
  const result = await service.listUsers(req.query.page as unknown as number, req.query.pageSize as unknown as number, req.query.search as string | undefined) // Stores this intermediate `result` value so later lines can use it.
  sendSuccess(res, 200, result.users, 'Users fetched successfully', result.meta) // Provides `sendSuccess(res, 200, result.users, 'Users fetched successfully', result.meta)` as part of this server module.
} // Closes the current block and marks where its grouped work ends.
export const detail: RequestHandler = async (req, res) => sendSuccess(res, 200, await service.getUser(Number(req.params.id)), 'User fetched successfully') // Provides `export const detail: RequestHandler = async (req, res) => sendSuccess(res, 200, await service.getUser(Number(req.params.id)), 'User fetched successfully')` as part of this server module.
export const create: RequestHandler = async (req, res) => sendSuccess(res, 201, await service.createUser(req.body), 'User created successfully') // Provides `export const create: RequestHandler = async (req, res) => sendSuccess(res, 201, await service.createUser(req.body), 'User created successfully')` as part of this server module.
export const update: RequestHandler = async (req, res) => { // Opens the function, callback, or control-flow block that groups the related statements.
  if (!req.user) throw new Error('Authenticated user missing after auth middleware') // Checks whether the value is missing; the block handles that case before continuing.
  sendSuccess(res, 200, await service.updateUser(req.user, Number(req.params.id), req.body), 'User updated successfully') // Provides `sendSuccess(res, 200, await service.updateUser(req.user, Number(req.params.id), req.body), 'User updated successfully')` as part of this server module.
} // Closes the current block and marks where its grouped work ends.
export const status: RequestHandler = async (req, res) => { // Opens the function, callback, or control-flow block that groups the related statements.
  if (!req.user) throw new Error('Authenticated user missing after auth middleware') // Checks whether the value is missing; the block handles that case before continuing.
  sendSuccess(res, 200, await service.updateUserStatus(req.user, Number(req.params.id), req.body.isActive), 'User status updated successfully') // Provides `sendSuccess(res, 200, await service.updateUserStatus(req.user, Number(req.params.id), req.body.isActive), 'User status updated successfully')` as part of this server module.
} // Closes the current block and marks where its grouped work ends.
// File purpose: Translates users HTTP requests into service calls and API responses.
