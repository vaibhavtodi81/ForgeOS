import { prisma } from '../utils/prisma.js'
import { logger } from '../config/logger.js'

export async function getHealthStatus() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return {
      api: 'ok' as const,
      server: 'ok' as const,
      database: 'connected' as const,
    }
  } catch (error) {
    logger.warn({ err: error }, 'Database health check failed')
    return {
      api: 'ok' as const,
      server: 'ok' as const,
      database: 'disconnected' as const,
    }
  }
}
