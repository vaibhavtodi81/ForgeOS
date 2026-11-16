import { createApp } from './app.js' // Imports { createApp } from './app.js' so this module can reuse that functionality.
import { env } from './config/env.js' // Uses validated environment settings so invalid configuration is caught at startup.
import { logger } from './config/logger.js' // Uses the shared structured logger so server events have a consistent format.
import { prisma } from './utils/prisma.js' // Uses the shared Prisma client to run queries through the server's database connection.

const app = createApp() // Stores this intermediate `app` value so later lines can use it.
const server = app.listen(env.PORT, () => { // Opens the function, callback, or control-flow block that groups the related statements.
  logger.info({ port: env.PORT }, 'ForgeOS API listening') // Writes an operational log entry so server activity can be monitored.
}) // Closes the current call, object, or collection so the surrounding expression can continue.

async function shutdown(signal: string) { // Defines `shutdown` to gracefully stop, keeping this behavior reusable.
  logger.info({ signal }, 'Shutting down ForgeOS API') // Writes an operational log entry so server activity can be monitored.
  server.close(async () => { // Opens the function, callback, or control-flow block that groups the related statements.
    await prisma.$disconnect() // Waits for this asynchronous operation to finish before using its result.
    process.exit(0) // Provides `process.exit(0)` as part of shutdown.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
} // Closes the current block and marks where its grouped work ends.

process.once('SIGINT', () => void shutdown('SIGINT')) // Registers a one-time operating-system signal handler so shutdown cleanup runs when the process is stopped.
process.once('SIGTERM', () => void shutdown('SIGTERM')) // Registers a one-time operating-system signal handler so shutdown cleanup runs when the process is stopped.
// File purpose: Starts the HTTP API and closes server/database resources during shutdown.
