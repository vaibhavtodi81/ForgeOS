import { PrismaClient } from '@prisma/client' // Uses Prisma's generated types and client to work safely with database records.
import { env } from '../config/env.js' // Uses validated environment settings so invalid configuration is caught at startup.

export const prisma = new PrismaClient({ // Opens the object or callback body that groups the settings for this operation.
  log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'], // Separates this argument or property from the next item in the surrounding call or object.
}) // Closes the current call, object, or collection so the surrounding expression can continue.
// File purpose: Creates the shared Prisma client used to access PostgreSQL.
