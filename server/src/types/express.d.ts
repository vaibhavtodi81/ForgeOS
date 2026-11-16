import type { Role } from '@prisma/client' // Uses Prisma's generated types and client to work safely with database records.

declare global { // Opens the object or callback body that groups the settings for this operation.
  namespace Express { // Opens the object or callback body that groups the settings for this operation.
    interface Request { // Defines the `Request` interface so TypeScript can describe the data or behavior used here.
      user?: { // Opens the object or callback body that groups the settings for this operation.
        id: number // Sets `id` to the unique database identifier.
        role: Role // Sets `role` to the account's permission level.
        email: string // Sets `email` to the contact or sign-in email address.
        name: string // Sets `name` to the human-readable name.
      } // Closes the current block and marks where its grouped work ends.
    } // Closes the current block and marks where its grouped work ends.
  } // Closes the current block and marks where its grouped work ends.
} // Closes the current block and marks where its grouped work ends.

export {} // Exports {} so other server modules can use it.` as part of this server module.
// File purpose: Extends Express request types with the authenticated user shape.
