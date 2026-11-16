import { Router } from 'express' // Imports Express types or tools used to build the HTTP API.
import { requireAuth, requireRole } from '../../middleware/auth.middleware.js' // Imports { requireAuth, requireRole } from '../../middleware/auth.middleware.js' so this module can reuse that functionality.
import { validateRequest } from '../../middleware/validate.middleware.js' // Imports { validateRequest } from '../../middleware/validate.middleware.js' so this module can reuse that functionality.
import * as controller from './projects.controller.js' // Imports * as controller from './projects.controller.js' so this module can reuse that functionality.
import { // Imports { from  so this module can reuse that functionality.
  createProjectSchema, // Separates this argument or property from the next item in the surrounding call or object.
  projectIdParamsSchema, // Separates this argument or property from the next item in the surrounding call or object.
  projectActivityQuerySchema, // Separates this argument or property from the next item in the surrounding call or object.
  projectListQuerySchema, // Separates this argument or property from the next item in the surrounding call or object.
  projectProgressHistoryQuerySchema, // Separates this argument or property from the next item in the surrounding call or object.
  projectDateRangeQuerySchema, // Separates this argument or property from the next item in the surrounding call or object.
  projectScopedIdParamsSchema, // Separates this argument or property from the next item in the surrounding call or object.
  updateProjectSchema, // Separates this argument or property from the next item in the surrounding call or object.
} from './projects.validator.js' // Provides `} from './projects.validator.js'` as part of this server module.

export const projectsRoutes = Router() // Provides `export const projectsRoutes = Router()` as part of this server module.
projectsRoutes.use(requireAuth) // Provides `projectsRoutes.use(requireAuth)` as part of this server module.
projectsRoutes.get('/projects', validateRequest('query', projectListQuerySchema), controller.list) // Provides `projectsRoutes.get('/projects', validateRequest('query', projectListQuerySchema), controller.list)` as part of this server module.
projectsRoutes.get( // Provides `projectsRoutes.get(` as part of this server module.
  '/projects/:projectId/progress-history', // Separates this argument or property from the next item in the surrounding call or object.
  validateRequest('params', projectScopedIdParamsSchema), // Separates this argument or property from the next item in the surrounding call or object.
  validateRequest('query', projectProgressHistoryQuerySchema), // Separates this argument or property from the next item in the surrounding call or object.
  controller.progressHistory, // Separates this argument or property from the next item in the surrounding call or object.
) // Closes the current call, object, or collection so the surrounding expression can continue.
projectsRoutes.get( // Provides `projectsRoutes.get(` as part of this server module.
  '/projects/:projectId/summary', // Separates this argument or property from the next item in the surrounding call or object.
  validateRequest('params', projectScopedIdParamsSchema), // Separates this argument or property from the next item in the surrounding call or object.
  controller.summary, // Separates this argument or property from the next item in the surrounding call or object.
) // Closes the current call, object, or collection so the surrounding expression can continue.
projectsRoutes.get( // Provides `projectsRoutes.get(` as part of this server module.
  '/projects/:projectId/activity', // Separates this argument or property from the next item in the surrounding call or object.
  validateRequest('params', projectScopedIdParamsSchema), // Separates this argument or property from the next item in the surrounding call or object.
  validateRequest('query', projectActivityQuerySchema), // Separates this argument or property from the next item in the surrounding call or object.
  controller.activity, // Separates this argument or property from the next item in the surrounding call or object.
) // Closes the current call, object, or collection so the surrounding expression can continue.
projectsRoutes.get( // Provides `projectsRoutes.get(` as part of this server module.
  '/projects/:projectId/labour-summary', // Separates this argument or property from the next item in the surrounding call or object.
  validateRequest('params', projectScopedIdParamsSchema), // Separates this argument or property from the next item in the surrounding call or object.
  validateRequest('query', projectDateRangeQuerySchema), // Separates this argument or property from the next item in the surrounding call or object.
  controller.labourSummary, // Separates this argument or property from the next item in the surrounding call or object.
) // Closes the current call, object, or collection so the surrounding expression can continue.
projectsRoutes.get( // Provides `projectsRoutes.get(` as part of this server module.
  '/projects/:projectId/machinery-summary', // Separates this argument or property from the next item in the surrounding call or object.
  validateRequest('params', projectScopedIdParamsSchema), // Separates this argument or property from the next item in the surrounding call or object.
  validateRequest('query', projectDateRangeQuerySchema), // Separates this argument or property from the next item in the surrounding call or object.
  controller.machinerySummary, // Separates this argument or property from the next item in the surrounding call or object.
) // Closes the current call, object, or collection so the surrounding expression can continue.
projectsRoutes.get( // Provides `projectsRoutes.get(` as part of this server module.
  '/projects/:projectId/worker-count-history', // Separates this argument or property from the next item in the surrounding call or object.
  validateRequest('params', projectScopedIdParamsSchema), // Separates this argument or property from the next item in the surrounding call or object.
  validateRequest('query', projectDateRangeQuerySchema), // Separates this argument or property from the next item in the surrounding call or object.
  controller.workerCountHistory, // Separates this argument or property from the next item in the surrounding call or object.
) // Closes the current call, object, or collection so the surrounding expression can continue.
projectsRoutes.get( // Provides `projectsRoutes.get(` as part of this server module.
  '/projects/:projectId/machinery-usage-history', // Separates this argument or property from the next item in the surrounding call or object.
  validateRequest('params', projectScopedIdParamsSchema), // Separates this argument or property from the next item in the surrounding call or object.
  validateRequest('query', projectDateRangeQuerySchema), // Separates this argument or property from the next item in the surrounding call or object.
  controller.machineryUsageHistory, // Separates this argument or property from the next item in the surrounding call or object.
) // Closes the current call, object, or collection so the surrounding expression can continue.
projectsRoutes.get('/projects/:id', validateRequest('params', projectIdParamsSchema), controller.detail) // Provides `projectsRoutes.get('/projects/:id', validateRequest('params', projectIdParamsSchema), controller.detail)` as part of this server module.
projectsRoutes.post('/projects', requireRole('ADMIN'), validateRequest('body', createProjectSchema), controller.create) // Provides `projectsRoutes.post('/projects', requireRole('ADMIN'), validateRequest('body', createProjectSchema), controller.create)` as part of this server module.
projectsRoutes.patch('/projects/:id', validateRequest('params', projectIdParamsSchema), validateRequest('body', updateProjectSchema), controller.update) // Provides `projectsRoutes.patch('/projects/:id', validateRequest('params', projectIdParamsSchema), validateRequest('body', updateProjectSchema), controller.update)` as part of this server module.
projectsRoutes.delete('/projects/:id', requireRole('ADMIN'), validateRequest('params', projectIdParamsSchema), controller.remove) // Provides `projectsRoutes.delete('/projects/:id', requireRole('ADMIN'), validateRequest('params', projectIdParamsSchema), controller.remove)` as part of this server module.
// File purpose: Defines the HTTP endpoints and middleware chain for the projects API.
