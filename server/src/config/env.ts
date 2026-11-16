import 'dotenv/config' // Imports 'dotenv/config' from  so this module can reuse that functionality.
import { z } from 'zod' // Imports { z } from 'zod' so this module can reuse that functionality.

const envSchema = z.object({ // Stores this intermediate `env schema` value so later lines can use it.
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'), // Separates this argument or property from the next item in the surrounding call or object.
  PORT: z.coerce.number().int().min(1).max(65535).default(4000), // Separates this argument or property from the next item in the surrounding call or object.
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'), // Separates this argument or property from the next item in the surrounding call or object.
  CORS_ORIGIN: z.string().url().default('http://localhost:5173'), // Separates this argument or property from the next item in the surrounding call or object.
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'), // Separates this argument or property from the next item in the surrounding call or object.
  JWT_SECRET: z.string().min(32).default('development-only-forgeos-jwt-secret-change-me'), // Separates this argument or property from the next item in the surrounding call or object.
  JWT_EXPIRES_IN: z.string().default('15m'), // Separates this argument or property from the next item in the surrounding call or object.
}) // Closes the current call, object, or collection so the surrounding expression can continue.

// Validate once at startup so missing or malformed settings fail before serving requests.
export const env = envSchema.parse(process.env) // Provides `export const env = envSchema.parse(process.env)` as part of this server module.
// File purpose: Loads, validates, and exports server environment configuration.
