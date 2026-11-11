import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import pinoHttp from 'pino-http'
import { env } from './config/env.js'
import { logger } from './config/logger.js'
import { healthRoutes } from './routes/health-routes.js'
import { errorHandler, notFoundHandler } from './middleware/error-handler.js'
import { dailyLogsRoutes } from './modules/daily-logs/daily-logs.routes.js'
import { authRoutes } from './modules/auth/auth.routes.js'
import { usersRoutes } from './modules/users/users.routes.js'
import { landsRoutes } from './modules/lands/lands.routes.js'
import { projectsRoutes } from './modules/projects/projects.routes.js'
import { milestonesRoutes } from './modules/milestones/milestones.routes.js'
import { materialsRoutes } from './modules/materials/materials.routes.js'
import { inventoryRoutes } from './modules/inventory/inventory.routes.js'
import { vendorsRoutes } from './modules/vendors/vendors.routes.js'
import { billingRoutes } from './modules/billing/billing.routes.js'

export function createApp() {
  const app = express()

  app.use(helmet())
  app.use(cors({ origin: env.CORS_ORIGIN }))
  app.use(express.json())
  app.use(pinoHttp({ logger }))

  app.use('/api/v1', healthRoutes)
  app.use('/api/v1', authRoutes)
  app.use('/api/v1', usersRoutes)
  app.use('/api/v1', landsRoutes)
  app.use('/api/v1', projectsRoutes)
  app.use('/api/v1', milestonesRoutes)
  app.use('/api/v1', materialsRoutes)
  app.use('/api/v1', inventoryRoutes)
  app.use('/api/v1', vendorsRoutes)
  app.use('/api/v1', billingRoutes)
  app.use('/api/v1', dailyLogsRoutes)
  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
