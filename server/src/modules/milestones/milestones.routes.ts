import { Router } from 'express' // Imports Express types or tools used to build the HTTP API.
import { requireAuth } from '../../middleware/auth.middleware.js' // Imports { requireAuth } from '../../middleware/auth.middleware.js' so this module can reuse that functionality.
import { validateRequest } from '../../middleware/validate.middleware.js' // Imports { validateRequest } from '../../middleware/validate.middleware.js' so this module can reuse that functionality.
import * as controller from './milestones.controller.js' // Imports * as controller from './milestones.controller.js' so this module can reuse that functionality.
import { // Imports { from  so this module can reuse that functionality.
  createMilestoneSchema, // Separates this argument or property from the next item in the surrounding call or object.
  milestoneIdParamsSchema, // Separates this argument or property from the next item in the surrounding call or object.
  updateMilestoneSchema, // Separates this argument or property from the next item in the surrounding call or object.
} from './milestones.validator.js' // Provides `} from './milestones.validator.js'` as part of this server module.
import { projectScopedIdParamsSchema } from '../projects/projects.validator.js' // Imports { projectScopedIdParamsSchema } from '../projects/projects.validator.js' so this module can reuse that functionality.

export const milestonesRoutes = Router() // Provides `export const milestonesRoutes = Router()` as part of this server module.
milestonesRoutes.use(requireAuth) // Provides `milestonesRoutes.use(requireAuth)` as part of this server module.
milestonesRoutes.post( // Provides `milestonesRoutes.post(` as part of this server module.
  '/projects/:projectId/milestones', // Separates this argument or property from the next item in the surrounding call or object.
  validateRequest('params', projectScopedIdParamsSchema), // Separates this argument or property from the next item in the surrounding call or object.
  validateRequest('body', createMilestoneSchema), // Separates this argument or property from the next item in the surrounding call or object.
  controller.create, // Separates this argument or property from the next item in the surrounding call or object.
) // Closes the current call, object, or collection so the surrounding expression can continue.
milestonesRoutes.get( // Provides `milestonesRoutes.get(` as part of this server module.
  '/projects/:projectId/milestones', // Separates this argument or property from the next item in the surrounding call or object.
  validateRequest('params', projectScopedIdParamsSchema), // Separates this argument or property from the next item in the surrounding call or object.
  controller.list, // Separates this argument or property from the next item in the surrounding call or object.
) // Closes the current call, object, or collection so the surrounding expression can continue.
milestonesRoutes.get( // Provides `milestonesRoutes.get(` as part of this server module.
  '/milestones/:id', // Separates this argument or property from the next item in the surrounding call or object.
  validateRequest('params', milestoneIdParamsSchema), // Separates this argument or property from the next item in the surrounding call or object.
  controller.detail, // Separates this argument or property from the next item in the surrounding call or object.
) // Closes the current call, object, or collection so the surrounding expression can continue.
milestonesRoutes.patch( // Provides `milestonesRoutes.patch(` as part of this server module.
  '/milestones/:id', // Separates this argument or property from the next item in the surrounding call or object.
  validateRequest('params', milestoneIdParamsSchema), // Separates this argument or property from the next item in the surrounding call or object.
  validateRequest('body', updateMilestoneSchema), // Separates this argument or property from the next item in the surrounding call or object.
  controller.update, // Separates this argument or property from the next item in the surrounding call or object.
) // Closes the current call, object, or collection so the surrounding expression can continue.
milestonesRoutes.delete( // Provides `milestonesRoutes.delete(` as part of this server module.
  '/milestones/:id', // Separates this argument or property from the next item in the surrounding call or object.
  validateRequest('params', milestoneIdParamsSchema), // Separates this argument or property from the next item in the surrounding call or object.
  controller.remove, // Separates this argument or property from the next item in the surrounding call or object.
) // Closes the current call, object, or collection so the surrounding expression can continue.
// File purpose: Defines the HTTP endpoints and middleware chain for the milestones API.
