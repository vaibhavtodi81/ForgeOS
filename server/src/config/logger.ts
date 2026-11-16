import pino from 'pino' // Imports pino from 'pino' so this module can reuse that functionality.
import { env } from './env.js' // Imports { env } from './env.js' so this module can reuse that functionality.

export const logger = pino({ // Opens the object or callback body that groups the settings for this operation.
  level: env.LOG_LEVEL, // Separates this argument or property from the next item in the surrounding call or object.
  redact: ['req.headers.authorization', 'password', 'passwordHash'], // Separates this argument or property from the next item in the surrounding call or object.
}) // Closes the current call, object, or collection so the surrounding expression can continue.
// File purpose: Creates the structured logger used by API code and request logging.
