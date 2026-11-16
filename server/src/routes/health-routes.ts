import { Router } from 'express' // Imports Express types or tools used to build the HTTP API.
import { getHealth } from '../controllers/health-controller.js' // Imports { getHealth } from '../controllers/health-controller.js' so this module can reuse that functionality.

export const healthRoutes = Router() // Provides `export const healthRoutes = Router()` as part of this server module.
healthRoutes.get('/health', getHealth) // Provides `healthRoutes.get('/health', getHealth)` as part of this server module.
// File purpose: Registers the API health endpoint and its request handler.
