import { Router } from 'express' // Imports Express types or tools used to build the HTTP API.
import { requireAuth } from '../../middleware/auth.middleware.js' // Imports { requireAuth } from '../../middleware/auth.middleware.js' so this module can reuse that functionality.
import { validateRequest } from '../../middleware/validate.middleware.js' // Imports { validateRequest } from '../../middleware/validate.middleware.js' so this module can reuse that functionality.
import * as controller from './daily-logs.controller.js' // Imports * as controller from './daily-logs.controller.js' so this module can reuse that functionality.
import { // Imports { from  so this module can reuse that functionality.
  dailyLogBodySchema, // Separates this argument or property from the next item in the surrounding call or object.
  dailyLogIdParamsSchema, // Separates this argument or property from the next item in the surrounding call or object.
  dailyLogListQuerySchema, // Separates this argument or property from the next item in the surrounding call or object.
  dailyLogPatchSchema, // Separates this argument or property from the next item in the surrounding call or object.
  projectIdParamsSchema, // Separates this argument or property from the next item in the surrounding call or object.
} from './daily-logs.validator.js' // Provides `} from './daily-logs.validator.js'` as part of this server module.

export const dailyLogsRoutes = Router() // Provides `export const dailyLogsRoutes = Router()` as part of this server module.
dailyLogsRoutes.use(requireAuth) // Provides `dailyLogsRoutes.use(requireAuth)` as part of this server module.
dailyLogsRoutes.get( // Provides `dailyLogsRoutes.get(` as part of this server module.
  '/projects/:projectId/daily-logs', // Separates this argument or property from the next item in the surrounding call or object.
  validateRequest('params', projectIdParamsSchema), // Separates this argument or property from the next item in the surrounding call or object.
  validateRequest('query', dailyLogListQuerySchema), // Separates this argument or property from the next item in the surrounding call or object.
  controller.list, // Separates this argument or property from the next item in the surrounding call or object.
) // Closes the current call, object, or collection so the surrounding expression can continue.
dailyLogsRoutes.post( // Provides `dailyLogsRoutes.post(` as part of this server module.
  '/projects/:projectId/daily-logs', // Separates this argument or property from the next item in the surrounding call or object.
  validateRequest('params', projectIdParamsSchema), // Separates this argument or property from the next item in the surrounding call or object.
  validateRequest('body', dailyLogBodySchema), // Separates this argument or property from the next item in the surrounding call or object.
  controller.create, // Separates this argument or property from the next item in the surrounding call or object.
) // Closes the current call, object, or collection so the surrounding expression can continue.
dailyLogsRoutes.get( // Provides `dailyLogsRoutes.get(` as part of this server module.
  '/daily-logs/:id', // Separates this argument or property from the next item in the surrounding call or object.
  validateRequest('params', dailyLogIdParamsSchema), // Separates this argument or property from the next item in the surrounding call or object.
  controller.detail, // Separates this argument or property from the next item in the surrounding call or object.
) // Closes the current call, object, or collection so the surrounding expression can continue.
dailyLogsRoutes.patch( // Provides `dailyLogsRoutes.patch(` as part of this server module.
  '/daily-logs/:id', // Separates this argument or property from the next item in the surrounding call or object.
  validateRequest('params', dailyLogIdParamsSchema), // Separates this argument or property from the next item in the surrounding call or object.
  validateRequest('body', dailyLogPatchSchema), // Separates this argument or property from the next item in the surrounding call or object.
  controller.update, // Separates this argument or property from the next item in the surrounding call or object.
) // Closes the current call, object, or collection so the surrounding expression can continue.
dailyLogsRoutes.delete( // Provides `dailyLogsRoutes.delete(` as part of this server module.
  '/daily-logs/:id', // Separates this argument or property from the next item in the surrounding call or object.
  validateRequest('params', dailyLogIdParamsSchema), // Separates this argument or property from the next item in the surrounding call or object.
  controller.remove, // Separates this argument or property from the next item in the surrounding call or object.
) // Closes the current call, object, or collection so the surrounding expression can continue.
// File purpose: Defines the HTTP endpoints and middleware chain for the daily logs API.
