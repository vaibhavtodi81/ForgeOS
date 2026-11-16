import express from 'express' // Imports Express types or tools used to build the HTTP API.
import cors from 'cors' // Imports cors from 'cors' so this module can reuse that functionality.
import helmet from 'helmet' // Imports helmet from 'helmet' so this module can reuse that functionality.
import pinoHttp from 'pino-http' // Imports pinoHttp from 'pino-http' so this module can reuse that functionality.
import { env } from './config/env.js' // Uses validated environment settings so invalid configuration is caught at startup.
import { logger } from './config/logger.js' // Uses the shared structured logger so server events have a consistent format.
import { healthRoutes } from './routes/health-routes.js' // Imports { healthRoutes } from './routes/health-routes.js' so this module can reuse that functionality.
import { errorHandler, notFoundHandler } from './middleware/error-handler.js' // Imports { errorHandler, notFoundHandler } from './middleware/error-handler.js' so this module can reuse that functionality.
import { dailyLogsRoutes } from './modules/daily-logs/daily-logs.routes.js' // Imports { dailyLogsRoutes } from './modules/daily-logs/daily-logs.routes.js' so this module can reuse that functionality.
import { authRoutes } from './modules/auth/auth.routes.js' // Imports { authRoutes } from './modules/auth/auth.routes.js' so this module can reuse that functionality.
import { usersRoutes } from './modules/users/users.routes.js' // Imports { usersRoutes } from './modules/users/users.routes.js' so this module can reuse that functionality.
import { landsRoutes } from './modules/lands/lands.routes.js' // Imports { landsRoutes } from './modules/lands/lands.routes.js' so this module can reuse that functionality.
import { projectsRoutes } from './modules/projects/projects.routes.js' // Imports { projectsRoutes } from './modules/projects/projects.routes.js' so this module can reuse that functionality.
import { milestonesRoutes } from './modules/milestones/milestones.routes.js' // Imports { milestonesRoutes } from './modules/milestones/milestones.routes.js' so this module can reuse that functionality.
import { materialsRoutes } from './modules/materials/materials.routes.js' // Imports { materialsRoutes } from './modules/materials/materials.routes.js' so this module can reuse that functionality.
import { inventoryRoutes } from './modules/inventory/inventory.routes.js' // Imports { inventoryRoutes } from './modules/inventory/inventory.routes.js' so this module can reuse that functionality.
import { vendorsRoutes } from './modules/vendors/vendors.routes.js' // Imports { vendorsRoutes } from './modules/vendors/vendors.routes.js' so this module can reuse that functionality.
import { billingRoutes } from './modules/billing/billing.routes.js' // Imports { billingRoutes } from './modules/billing/billing.routes.js' so this module can reuse that functionality.

export function createApp() { // Defines the Express application factory so tests and the server can share the same configured app.
  const app = express() // Stores this intermediate `app` value so later lines can use it.

  app.use(helmet()) // Adds middleware to the Express app so every matching request receives this shared behavior.
  app.use(cors({ origin: env.CORS_ORIGIN })) // Adds middleware to the Express app so every matching request receives this shared behavior.
  app.use(express.json()) // Adds middleware to the Express app so every matching request receives this shared behavior.
  app.use(pinoHttp({ logger })) // Adds middleware to the Express app so every matching request receives this shared behavior.

  app.use('/api/v1', healthRoutes) // Adds middleware to the Express app so every matching request receives this shared behavior.
  app.use('/api/v1', authRoutes) // Adds middleware to the Express app so every matching request receives this shared behavior.
  app.use('/api/v1', usersRoutes) // Adds middleware to the Express app so every matching request receives this shared behavior.
  app.use('/api/v1', landsRoutes) // Adds middleware to the Express app so every matching request receives this shared behavior.
  app.use('/api/v1', projectsRoutes) // Adds middleware to the Express app so every matching request receives this shared behavior.
  app.use('/api/v1', milestonesRoutes) // Adds middleware to the Express app so every matching request receives this shared behavior.
  app.use('/api/v1', materialsRoutes) // Adds middleware to the Express app so every matching request receives this shared behavior.
  app.use('/api/v1', inventoryRoutes) // Adds middleware to the Express app so every matching request receives this shared behavior.
  app.use('/api/v1', vendorsRoutes) // Adds middleware to the Express app so every matching request receives this shared behavior.
  app.use('/api/v1', billingRoutes) // Adds middleware to the Express app so every matching request receives this shared behavior.
  app.use('/api/v1', dailyLogsRoutes) // Adds middleware to the Express app so every matching request receives this shared behavior.
  app.use(notFoundHandler) // Adds middleware to the Express app so every matching request receives this shared behavior.
  app.use(errorHandler) // Adds middleware to the Express app so every matching request receives this shared behavior.

  return app // Returns `app` to the caller so the next layer can use the result.
} // Closes the current block and marks where its grouped work ends.
// File purpose: Builds the Express middleware and route pipeline without opening a network listener.
