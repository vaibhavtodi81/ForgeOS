import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import pinoHttp from 'pino-http'
import { env } from './config/env.js'
import { logger } from './config/logger.js'
import { healthRoutes } from './routes/health-routes.js'
import { errorHandler, notFoundHandler } from './middleware/error-handler.js'

export function createApp() {
  const app = express()

  app.use(helmet())
  app.use(cors({ origin: env.CORS_ORIGIN }))
  app.use(express.json())
  app.use(pinoHttp({ logger }))

  app.use('/api/v1', healthRoutes)
  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
