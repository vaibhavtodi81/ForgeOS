import type { RequestHandler } from 'express'
import { getHealthStatus } from '../services/health-service.js'

export const getHealth: RequestHandler = async (_req, res) => {
  const status = await getHealthStatus()
  const healthy = status.database === 'connected'

  res.status(healthy ? 200 : 503).json({
    success: healthy,
    data: {
      status: healthy ? 'ok' : 'degraded',
      ...status,
    },
  })
}
