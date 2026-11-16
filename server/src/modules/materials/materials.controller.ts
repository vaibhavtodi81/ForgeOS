import type { RequestHandler } from 'express' // Imports Express types or tools used to build the HTTP API.
import { sendSuccess } from '../../utils/api-response.js' // Imports { sendSuccess } from '../../utils/api-response.js' so this module can reuse that functionality.
import * as service from './materials.service.js' // Imports * as service from './materials.service.js' so this module can reuse that functionality.

export const list: RequestHandler = async (req, res) => sendSuccess( // Provides `export const list: RequestHandler = async (req, res) => sendSuccess(` as part of this server module.
  res, 200, await service.listMaterials(req.query as never), 'Materials fetched successfully', // Separates this argument or property from the next item in the surrounding call or object.
) // Closes the current call, object, or collection so the surrounding expression can continue.
export const detail: RequestHandler = async (req, res) => sendSuccess( // Provides `export const detail: RequestHandler = async (req, res) => sendSuccess(` as part of this server module.
  res, 200, await service.getMaterial(Number(req.params.id)), 'Material fetched successfully', // Separates this argument or property from the next item in the surrounding call or object.
) // Closes the current call, object, or collection so the surrounding expression can continue.
export const create: RequestHandler = async (req, res) => sendSuccess( // Provides `export const create: RequestHandler = async (req, res) => sendSuccess(` as part of this server module.
  res, 201, await service.createMaterial(req.body), 'Material created successfully', // Separates this argument or property from the next item in the surrounding call or object.
) // Closes the current call, object, or collection so the surrounding expression can continue.
export const update: RequestHandler = async (req, res) => sendSuccess( // Provides `export const update: RequestHandler = async (req, res) => sendSuccess(` as part of this server module.
  res, 200, await service.updateMaterial(Number(req.params.id), req.body), 'Material updated successfully', // Separates this argument or property from the next item in the surrounding call or object.
) // Closes the current call, object, or collection so the surrounding expression can continue.
// File purpose: Translates materials HTTP requests into service calls and API responses.
