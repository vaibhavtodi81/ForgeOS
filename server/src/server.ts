import { createApp } from './app.js'
import { env } from './config/env.js'
import { logger } from './config/logger.js'
import { prisma } from './utils/prisma.js'

const app = createApp()
const server = app.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, 'ForgeOS API listening')
})

async function shutdown(signal: string) {
  logger.info({ signal }, 'Shutting down ForgeOS API')
  server.close(async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
}

process.once('SIGINT', () => void shutdown('SIGINT'))
process.once('SIGTERM', () => void shutdown('SIGTERM'))
