import type { RequestHandler } from 'express' // Imports Express types or tools used to build the HTTP API.
import { sendSuccess } from '../../utils/api-response.js' // Imports { sendSuccess } from '../../utils/api-response.js' so this module can reuse that functionality.
import { getCurrentUser, login } from './auth.service.js' // Imports { getCurrentUser, login } from './auth.service.js' so this module can reuse that functionality.

export const signIn: RequestHandler = async (req, res) => { // Opens the function, callback, or control-flow block that groups the related statements.
  const result = await login(req.body.email, req.body.password) // Stores this intermediate `result` value so later lines can use it.
  sendSuccess(res, 200, result, 'Login successful') // Provides `sendSuccess(res, 200, result, 'Login successful')` as part of this server module.
} // Closes the current block and marks where its grouped work ends.

export const me: RequestHandler = async (req, res) => { // Opens the function, callback, or control-flow block that groups the related statements.
  if (!req.user) throw new Error('Authenticated user missing after auth middleware') // Checks whether the value is missing; the block handles that case before continuing.
  const user = await getCurrentUser(req.user.id) // Stores this intermediate `user` value so later lines can use it.
  sendSuccess(res, 200, user, 'Profile fetched successfully') // Provides `sendSuccess(res, 200, user, 'Profile fetched successfully')` as part of this server module.
} // Closes the current block and marks where its grouped work ends.
// File purpose: Translates auth HTTP requests into service calls and API responses.
