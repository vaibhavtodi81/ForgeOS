import { prisma } from '../utils/prisma.js' // Uses the shared Prisma client to run queries through the server's database connection.
import { logger } from '../config/logger.js' // Uses the shared structured logger so server events have a consistent format.

export async function getHealthStatus() { // Defines `getHealthStatus` to retrieve health status, keeping this behavior reusable.
  try { // Starts a protected block so errors from the following operation can be handled.
    await prisma.$queryRaw`SELECT 1` // Waits for this asynchronous operation to finish before using its result.
    return { // Returns the assembled result object so the caller receives the fields it needs.
      api: 'ok' as const, // Separates this argument or property from the next item in the surrounding call or object.
      server: 'ok' as const, // Separates this argument or property from the next item in the surrounding call or object.
      database: 'connected' as const, // Separates this argument or property from the next item in the surrounding call or object.
    } // Closes the current block and marks where its grouped work ends.
  } catch (error) { // Opens the object or callback body that groups the settings for this operation.
    logger.warn({ err: error }, 'Database health check failed') // Writes an operational log entry so server activity can be monitored.
    return { // Returns the assembled result object so the caller receives the fields it needs.
      api: 'ok' as const, // Separates this argument or property from the next item in the surrounding call or object.
      server: 'ok' as const, // Separates this argument or property from the next item in the surrounding call or object.
      database: 'disconnected' as const, // Separates this argument or property from the next item in the surrounding call or object.
    } // Closes the current block and marks where its grouped work ends.
  } // Closes the current block and marks where its grouped work ends.
} // Closes the current block and marks where its grouped work ends.
// File purpose: Checks database connectivity for the API health endpoint.
