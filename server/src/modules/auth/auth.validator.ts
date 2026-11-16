import { z } from 'zod' // Imports { z } from 'zod' so this module can reuse that functionality.

export const loginSchema = z.object({ // Opens the object or callback body that groups the settings for this operation.
  email: z.string().email().transform((value) => value.toLowerCase()), // Separates this argument or property from the next item in the surrounding call or object.
  password: z.string().min(1), // Separates this argument or property from the next item in the surrounding call or object.
}) // Closes the current call, object, or collection so the surrounding expression can continue.
// File purpose: Defines runtime request validation schemas for the auth API.
