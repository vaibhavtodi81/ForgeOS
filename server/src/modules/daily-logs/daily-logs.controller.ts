import type { RequestHandler } from 'express' // Imports Express types or tools used to build the HTTP API.
import { sendSuccess } from '../../utils/api-response.js' // Imports { sendSuccess } from '../../utils/api-response.js' so this module can reuse that functionality.
import { // Imports { from  so this module can reuse that functionality.
  createDailyLog, // Separates this argument or property from the next item in the surrounding call or object.
  deleteDailyLog, // Separates this argument or property from the next item in the surrounding call or object.
  getDailyLog, // Separates this argument or property from the next item in the surrounding call or object.
  listDailyLogs, // Separates this argument or property from the next item in the surrounding call or object.
  updateDailyLog, // Separates this argument or property from the next item in the surrounding call or object.
} from './daily-logs.service.js' // Provides `} from './daily-logs.service.js'` as part of this server module.
import type { DailyLogListQuery } from './daily-logs.validator.js' // Imports type { DailyLogListQuery } from './daily-logs.validator.js' so this module can reuse that functionality.

function user(req: Parameters<RequestHandler>[0]) { // Defines `user` to user, keeping this behavior reusable.
  if (!req.user) throw new Error('Authenticated user missing after auth middleware') // Checks whether the value is missing; the block handles that case before continuing.
  return req.user // Returns `req.user` to the caller so the next layer can use the result.
} // Closes the current block and marks where its grouped work ends.

export const list: RequestHandler = async (req, res) => { // Opens the function, callback, or control-flow block that groups the related statements.
  const result = await listDailyLogs(user(req), Number(req.params.projectId), req.query as unknown as DailyLogListQuery) // Stores this intermediate `result` value so later lines can use it.
  sendSuccess(res, 200, result.logs, 'Daily logs fetched successfully', result.meta) // Provides `sendSuccess(res, 200, result.logs, 'Daily logs fetched successfully', result.meta)` as part of user.
} // Closes the current block and marks where its grouped work ends.

export const create: RequestHandler = async (req, res) => { // Opens the function, callback, or control-flow block that groups the related statements.
  const log = await createDailyLog(user(req), Number(req.params.projectId), req.body) // Stores this intermediate `log` value so later lines can use it.
  sendSuccess(res, 201, log, 'Daily log created successfully') // Provides `sendSuccess(res, 201, log, 'Daily log created successfully')` as part of user.
} // Closes the current block and marks where its grouped work ends.

export const detail: RequestHandler = async (req, res) => { // Opens the function, callback, or control-flow block that groups the related statements.
  const log = await getDailyLog(user(req), Number(req.params.id)) // Stores this intermediate `log` value so later lines can use it.
  sendSuccess(res, 200, log, 'Daily log fetched successfully') // Provides `sendSuccess(res, 200, log, 'Daily log fetched successfully')` as part of user.
} // Closes the current block and marks where its grouped work ends.

export const update: RequestHandler = async (req, res) => { // Opens the function, callback, or control-flow block that groups the related statements.
  const log = await updateDailyLog(user(req), Number(req.params.id), req.body) // Stores this intermediate `log` value so later lines can use it.
  sendSuccess(res, 200, log, 'Daily log updated successfully') // Provides `sendSuccess(res, 200, log, 'Daily log updated successfully')` as part of user.
} // Closes the current block and marks where its grouped work ends.

export const remove: RequestHandler = async (req, res) => { // Opens the function, callback, or control-flow block that groups the related statements.
  await deleteDailyLog(user(req), Number(req.params.id)) // Waits for this asynchronous operation to finish before using its result.
  sendSuccess(res, 200, null, 'Daily log deleted successfully') // Provides `sendSuccess(res, 200, null, 'Daily log deleted successfully')` as part of user.
} // Closes the current block and marks where its grouped work ends.
// File purpose: Translates daily logs HTTP requests into service calls and API responses.
