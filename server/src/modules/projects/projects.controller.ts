import type { RequestHandler } from 'express' // Imports Express types or tools used to build the HTTP API.
import { sendSuccess } from '../../utils/api-response.js' // Imports { sendSuccess } from '../../utils/api-response.js' so this module can reuse that functionality.
import * as service from './projects.service.js' // Imports * as service from './projects.service.js' so this module can reuse that functionality.
import type { // Imports type { from  so this module can reuse that functionality.
  ProjectActivityQuery, // Separates this argument or property from the next item in the surrounding call or object.
  ProjectDateRangeQuery, // Separates this argument or property from the next item in the surrounding call or object.
  ProjectProgressHistoryQuery, // Separates this argument or property from the next item in the surrounding call or object.
} from './projects.validator.js' // Provides `} from './projects.validator.js'` as part of this server module.

function actor(req: Parameters<RequestHandler>[0]) { // Defines `actor` to actor, keeping this behavior reusable.
  if (!req.user) throw new Error('Authenticated user missing after auth middleware') // Checks whether the value is missing; the block handles that case before continuing.
  return req.user // Returns `req.user` to the caller so the next layer can use the result.
} // Closes the current block and marks where its grouped work ends.
export const list: RequestHandler = async (req, res) => { // Opens the function, callback, or control-flow block that groups the related statements.
  const result = await service.listProjects(actor(req), req.query.page as unknown as number, req.query.pageSize as unknown as number, req.query.status as string | undefined, req.query.search as string | undefined) // Stores this intermediate `result` value so later lines can use it.
  sendSuccess(res, 200, result.projects, 'Projects fetched successfully', result.meta) // Provides `sendSuccess(res, 200, result.projects, 'Projects fetched successfully', result.meta)` as part of actor.
} // Closes the current block and marks where its grouped work ends.
export const detail: RequestHandler = async (req, res) => sendSuccess(res, 200, await service.getProject(actor(req), Number(req.params.id)), 'Project fetched successfully') // Provides `export const detail: RequestHandler = async (req, res) => sendSuccess(res, 200, await service.getProject(actor(req), Number(req.params.id)), 'Project fetched successfully')` as part of actor.
export const progressHistory: RequestHandler = async (req, res) => sendSuccess( // Provides `export const progressHistory: RequestHandler = async (req, res) => sendSuccess(` as part of actor.
  res, // Separates this argument or property from the next item in the surrounding call or object.
  200, // Separates this argument or property from the next item in the surrounding call or object.
  await service.getProjectProgressHistory(actor(req), Number(req.params.projectId), req.query as unknown as ProjectProgressHistoryQuery), // Separates this argument or property from the next item in the surrounding call or object.
  'Project progress history fetched successfully', // Separates this argument or property from the next item in the surrounding call or object.
) // Closes the current call, object, or collection so the surrounding expression can continue.
export const summary: RequestHandler = async (req, res) => sendSuccess( // Provides `export const summary: RequestHandler = async (req, res) => sendSuccess(` as part of actor.
  res, // Separates this argument or property from the next item in the surrounding call or object.
  200, // Separates this argument or property from the next item in the surrounding call or object.
  await service.getProjectSummary(actor(req), Number(req.params.projectId)), // Separates this argument or property from the next item in the surrounding call or object.
  'Project summary fetched successfully', // Separates this argument or property from the next item in the surrounding call or object.
) // Closes the current call, object, or collection so the surrounding expression can continue.
export const activity: RequestHandler = async (req, res) => { // Opens the function, callback, or control-flow block that groups the related statements.
  const result = await service.getProjectActivity( // Stores this intermediate `result` value so later lines can use it.
    actor(req), // Separates this argument or property from the next item in the surrounding call or object.
    Number(req.params.projectId), // Separates this argument or property from the next item in the surrounding call or object.
    req.query as unknown as ProjectActivityQuery, // Separates this argument or property from the next item in the surrounding call or object.
  ) // Closes the current call, object, or collection so the surrounding expression can continue.
  sendSuccess(res, 200, result.activities, 'Project activity fetched successfully', result.meta) // Provides `sendSuccess(res, 200, result.activities, 'Project activity fetched successfully', result.meta)` as part of actor.
} // Closes the current block and marks where its grouped work ends.
export const labourSummary: RequestHandler = async (req, res) => sendSuccess( // Provides `export const labourSummary: RequestHandler = async (req, res) => sendSuccess(` as part of actor.
  res, // Separates this argument or property from the next item in the surrounding call or object.
  200, // Separates this argument or property from the next item in the surrounding call or object.
  await service.getLabourSummary(actor(req), Number(req.params.projectId), req.query as unknown as ProjectDateRangeQuery), // Separates this argument or property from the next item in the surrounding call or object.
  'Labour summary fetched successfully', // Separates this argument or property from the next item in the surrounding call or object.
) // Closes the current call, object, or collection so the surrounding expression can continue.
export const machinerySummary: RequestHandler = async (req, res) => sendSuccess( // Provides `export const machinerySummary: RequestHandler = async (req, res) => sendSuccess(` as part of actor.
  res, // Separates this argument or property from the next item in the surrounding call or object.
  200, // Separates this argument or property from the next item in the surrounding call or object.
  await service.getMachinerySummary(actor(req), Number(req.params.projectId), req.query as unknown as ProjectDateRangeQuery), // Separates this argument or property from the next item in the surrounding call or object.
  'Machinery summary fetched successfully', // Separates this argument or property from the next item in the surrounding call or object.
) // Closes the current call, object, or collection so the surrounding expression can continue.
export const workerCountHistory: RequestHandler = async (req, res) => sendSuccess( // Provides `export const workerCountHistory: RequestHandler = async (req, res) => sendSuccess(` as part of actor.
  res, // Separates this argument or property from the next item in the surrounding call or object.
  200, // Separates this argument or property from the next item in the surrounding call or object.
  await service.getWorkerCountHistory(actor(req), Number(req.params.projectId), req.query as unknown as ProjectDateRangeQuery), // Separates this argument or property from the next item in the surrounding call or object.
  'Worker count history fetched successfully', // Separates this argument or property from the next item in the surrounding call or object.
) // Closes the current call, object, or collection so the surrounding expression can continue.
export const machineryUsageHistory: RequestHandler = async (req, res) => sendSuccess( // Provides `export const machineryUsageHistory: RequestHandler = async (req, res) => sendSuccess(` as part of actor.
  res, // Separates this argument or property from the next item in the surrounding call or object.
  200, // Separates this argument or property from the next item in the surrounding call or object.
  await service.getMachineryUsageHistory(actor(req), Number(req.params.projectId), req.query as unknown as ProjectDateRangeQuery), // Separates this argument or property from the next item in the surrounding call or object.
  'Machinery usage history fetched successfully', // Separates this argument or property from the next item in the surrounding call or object.
) // Closes the current call, object, or collection so the surrounding expression can continue.
export const create: RequestHandler = async (req, res) => sendSuccess(res, 201, await service.createProject(actor(req), req.body), 'Project created successfully') // Provides `export const create: RequestHandler = async (req, res) => sendSuccess(res, 201, await service.createProject(actor(req), req.body), 'Project created successfully')` as part of actor.
export const update: RequestHandler = async (req, res) => sendSuccess(res, 200, await service.updateProject(actor(req), Number(req.params.id), req.body), 'Project updated successfully') // Provides `export const update: RequestHandler = async (req, res) => sendSuccess(res, 200, await service.updateProject(actor(req), Number(req.params.id), req.body), 'Project updated successfully')` as part of actor.
export const remove: RequestHandler = async (req, res) => { // Opens the function, callback, or control-flow block that groups the related statements.
  await service.getProject(actor(req), Number(req.params.id)) // Waits for this asynchronous operation to finish before using its result.
  await service.deleteProject(Number(req.params.id)) // Waits for this asynchronous operation to finish before using its result.
  sendSuccess(res, 200, null, 'Project deleted successfully') // Provides `sendSuccess(res, 200, null, 'Project deleted successfully')` as part of actor.
} // Closes the current block and marks where its grouped work ends.
// File purpose: Translates projects HTTP requests into service calls and API responses.
