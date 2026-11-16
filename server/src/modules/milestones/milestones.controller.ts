import type { RequestHandler } from 'express' // Imports Express types or tools used to build the HTTP API.
import { sendSuccess } from '../../utils/api-response.js' // Imports { sendSuccess } from '../../utils/api-response.js' so this module can reuse that functionality.
import * as service from './milestones.service.js' // Imports * as service from './milestones.service.js' so this module can reuse that functionality.
import type { CreateMilestoneInput, UpdateMilestoneInput } from './milestones.validator.js' // Imports type { CreateMilestoneInput, UpdateMilestoneInput } from './milestones.validator.js' so this module can reuse that functionality.

function actor(req: Parameters<RequestHandler>[0]) { // Defines `actor` to actor, keeping this behavior reusable.
  if (!req.user) throw new Error('Authenticated user missing after auth middleware') // Checks whether the value is missing; the block handles that case before continuing.
  return req.user // Returns `req.user` to the caller so the next layer can use the result.
} // Closes the current block and marks where its grouped work ends.

export const create: RequestHandler = async (req, res) => sendSuccess( // Provides `export const create: RequestHandler = async (req, res) => sendSuccess(` as part of actor.
  res, // Separates this argument or property from the next item in the surrounding call or object.
  201, // Separates this argument or property from the next item in the surrounding call or object.
  await service.createMilestone(actor(req), Number(req.params.projectId), req.body as CreateMilestoneInput), // Separates this argument or property from the next item in the surrounding call or object.
  'Milestone created successfully', // Separates this argument or property from the next item in the surrounding call or object.
) // Closes the current call, object, or collection so the surrounding expression can continue.

export const list: RequestHandler = async (req, res) => sendSuccess( // Provides `export const list: RequestHandler = async (req, res) => sendSuccess(` as part of actor.
  res, // Separates this argument or property from the next item in the surrounding call or object.
  200, // Separates this argument or property from the next item in the surrounding call or object.
  await service.listMilestones(actor(req), Number(req.params.projectId)), // Separates this argument or property from the next item in the surrounding call or object.
  'Milestones fetched successfully', // Separates this argument or property from the next item in the surrounding call or object.
) // Closes the current call, object, or collection so the surrounding expression can continue.

export const detail: RequestHandler = async (req, res) => sendSuccess( // Provides `export const detail: RequestHandler = async (req, res) => sendSuccess(` as part of actor.
  res, // Separates this argument or property from the next item in the surrounding call or object.
  200, // Separates this argument or property from the next item in the surrounding call or object.
  await service.getMilestone(actor(req), Number(req.params.id)), // Separates this argument or property from the next item in the surrounding call or object.
  'Milestone fetched successfully', // Separates this argument or property from the next item in the surrounding call or object.
) // Closes the current call, object, or collection so the surrounding expression can continue.

export const update: RequestHandler = async (req, res) => sendSuccess( // Provides `export const update: RequestHandler = async (req, res) => sendSuccess(` as part of actor.
  res, // Separates this argument or property from the next item in the surrounding call or object.
  200, // Separates this argument or property from the next item in the surrounding call or object.
  await service.updateMilestone(actor(req), Number(req.params.id), req.body as UpdateMilestoneInput), // Separates this argument or property from the next item in the surrounding call or object.
  'Milestone updated successfully', // Separates this argument or property from the next item in the surrounding call or object.
) // Closes the current call, object, or collection so the surrounding expression can continue.

export const remove: RequestHandler = async (req, res) => { // Opens the function, callback, or control-flow block that groups the related statements.
  await service.deleteMilestone(actor(req), Number(req.params.id)) // Waits for this asynchronous operation to finish before using its result.
  sendSuccess(res, 200, null, 'Milestone deleted successfully') // Provides `sendSuccess(res, 200, null, 'Milestone deleted successfully')` as part of actor.
} // Closes the current block and marks where its grouped work ends.
// File purpose: Translates milestones HTTP requests into service calls and API responses.
