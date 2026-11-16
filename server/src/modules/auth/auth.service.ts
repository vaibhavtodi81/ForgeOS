import { prisma } from '../../utils/prisma.js' // Uses the shared Prisma client to run queries through the server's database connection.
import { AppError } from '../../utils/errors.js' // Uses the shared API error type so failures have a consistent message and HTTP status.
import { verifyPassword } from '../../utils/password.js' // Imports { verifyPassword } from '../../utils/password.js' so this module can reuse that functionality.
import { createAccessToken } from '../../utils/jwt.js' // Uses JWT helpers to create or verify signed authentication tokens.

export function safeUser(user: { id: number; name: string; email: string; role: 'ADMIN' | 'PM'; phone: string | null; isActive: boolean; createdAt: Date; updatedAt: Date }) { // Defines `safeUser` to safe user, keeping this behavior reusable.
  return { // Returns the assembled result object so the caller receives the fields it needs.
    id: user.id, // Separates this argument or property from the next item in the surrounding call or object.
    name: user.name, // Separates this argument or property from the next item in the surrounding call or object.
    email: user.email, // Separates this argument or property from the next item in the surrounding call or object.
    role: user.role, // Separates this argument or property from the next item in the surrounding call or object.
    phone: user.phone, // Separates this argument or property from the next item in the surrounding call or object.
    isActive: user.isActive, // Separates this argument or property from the next item in the surrounding call or object.
    createdAt: user.createdAt, // Separates this argument or property from the next item in the surrounding call or object.
    updatedAt: user.updatedAt, // Separates this argument or property from the next item in the surrounding call or object.
  } // Closes the current block and marks where its grouped work ends.
} // Closes the current block and marks where its grouped work ends.

export async function login(email: string, password: string) { // Defines `login` to login, keeping this behavior reusable.
  const user = await prisma.user.findUnique({ where: { email } }) // Looks up one matching database record and stores it in `user` so its existence or values can be checked.
  if (!user || !user.isActive || !verifyPassword(password, user.passwordHash)) { // Rejects an inactive account so deactivated users cannot continue using the API.
    throw new AppError('INVALID_CREDENTIALS', 'Invalid email or password.', 401) // Stops this request with `INVALID_CREDENTIALS` and HTTP 401 so the client receives a clear failure.
  } // Closes the current block and marks where its grouped work ends.
  const updated = await prisma.user.update({ // Stores the result of updates a record in the user table in `updated` for the next steps.
    where: { id: user.id }, // Separates this argument or property from the next item in the surrounding call or object.
    data: { lastLoginAt: new Date() }, // Separates this argument or property from the next item in the surrounding call or object.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
  return { token: createAccessToken(user), user: safeUser(updated) } // Returns the assembled result object so the caller receives the fields it needs.
} // Closes the current block and marks where its grouped work ends.

export async function getCurrentUser(id: number) { // Defines `getCurrentUser` to retrieve current user, keeping this behavior reusable.
  const user = await prisma.user.findUnique({ where: { id } }) // Looks up one matching database record and stores it in `user` so its existence or values can be checked.
  if (!user || !user.isActive) throw new AppError('UNAUTHENTICATED', 'Authentication is required.', 401) // Rejects an inactive account so deactivated users cannot continue using the API.
  return safeUser(user) // Returns `safeUser(user)` to the caller so the next layer can use the result.
} // Closes the current block and marks where its grouped work ends.
// File purpose: Implements auth business rules and database operations.
