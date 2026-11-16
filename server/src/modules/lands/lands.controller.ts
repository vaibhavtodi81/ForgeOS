import type { RequestHandler } from 'express' // Imports Express types or tools used to build the HTTP API.
import { sendSuccess } from '../../utils/api-response.js' // Imports { sendSuccess } from '../../utils/api-response.js' so this module can reuse that functionality.
import * as service from './lands.service.js' // Imports * as service from './lands.service.js' so this module can reuse that functionality.

function actor(req: Parameters<RequestHandler>[0]) { // Defines `actor` to actor, keeping this behavior reusable.
  if (!req.user) throw new Error('Authenticated user missing after auth middleware') // Checks whether the value is missing; the block handles that case before continuing.
  return req.user // Returns `req.user` to the caller so the next layer can use the result.
} // Closes the current block and marks where its grouped work ends.
export const list: RequestHandler = async (req, res) => { // Opens the function, callback, or control-flow block that groups the related statements.
  const result = await service.listLands(actor(req), req.query.page as unknown as number, req.query.pageSize as unknown as number, req.query.search as string | undefined) // Stores this intermediate `result` value so later lines can use it.
  sendSuccess(res, 200, result.lands, 'Lands fetched successfully', result.meta) // Provides `sendSuccess(res, 200, result.lands, 'Lands fetched successfully', result.meta)` as part of actor.
} // Closes the current block and marks where its grouped work ends.
export const detail: RequestHandler = async (req, res) => sendSuccess(res, 200, await service.getLand(actor(req), Number(req.params.id)), 'Land fetched successfully') // Provides `export const detail: RequestHandler = async (req, res) => sendSuccess(res, 200, await service.getLand(actor(req), Number(req.params.id)), 'Land fetched successfully')` as part of actor.
export const create: RequestHandler = async (req, res) => sendSuccess(res, 201, await service.createLand(actor(req), req.body), 'Land created successfully') // Provides `export const create: RequestHandler = async (req, res) => sendSuccess(res, 201, await service.createLand(actor(req), req.body), 'Land created successfully')` as part of actor.
export const update: RequestHandler = async (req, res) => { // Opens the function, callback, or control-flow block that groups the related statements.
  await service.getLand(actor(req), Number(req.params.id)) // Waits for this asynchronous operation to finish before using its result.
  sendSuccess(res, 200, await service.updateLand(Number(req.params.id), req.body), 'Land updated successfully') // Provides `sendSuccess(res, 200, await service.updateLand(Number(req.params.id), req.body), 'Land updated successfully')` as part of actor.
} // Closes the current block and marks where its grouped work ends.
export const remove: RequestHandler = async (req, res) => { // Opens the function, callback, or control-flow block that groups the related statements.
  await service.getLand(actor(req), Number(req.params.id)) // Waits for this asynchronous operation to finish before using its result.
  await service.deleteLand(Number(req.params.id)) // Waits for this asynchronous operation to finish before using its result.
  sendSuccess(res, 200, null, 'Land deleted successfully') // Provides `sendSuccess(res, 200, null, 'Land deleted successfully')` as part of actor.
} // Closes the current block and marks where its grouped work ends.
// File purpose: Translates lands HTTP requests into service calls and API responses.
