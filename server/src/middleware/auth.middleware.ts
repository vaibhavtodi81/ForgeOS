import type { RequestHandler } from 'express' // Imports Express types or tools used to build the HTTP API.
import { AppError } from '../utils/errors.js' // Uses the shared API error type so failures have a consistent message and HTTP status.
import { prisma } from '../utils/prisma.js' // Uses the shared Prisma client to run queries through the server's database connection.
import { verifyAccessToken } from '../utils/jwt.js' // Uses JWT helpers to create or verify signed authentication tokens.

/**
 * Authentication is owned by the identity module. This contract lets feature
 * routes consume its verified request user without implementing JWT logic here.
 */
export const requireAuth: RequestHandler = (req, _res, next) => { // Opens the function, callback, or control-flow block that groups the related statements.
  const header = req.header('authorization') // Stores this intermediate `header` value so later lines can use it.
  if (!header?.startsWith('Bearer ')) { // Checks that the request has the authentication information required to continue.
    next(new AppError('UNAUTHENTICATED', 'Authentication is required.', 401)) // Passes control to the next Express middleware, or forwards the supplied error to the error handler.
    return // Returns `` to the caller so the next layer can use the result.
  } // Closes the current block and marks where its grouped work ends.

  try { // Starts a protected block so errors from the following operation can be handled.
    const payload = verifyAccessToken(header.slice(7)) // Stores this intermediate `payload` value so later lines can use it.
    // Recheck the account on each request so deactivation takes effect before the token expires.
    void prisma.user.findUnique({ // Opens the object or callback body that groups the settings for this operation.
      where: { id: Number(payload.sub) }, // Separates this argument or property from the next item in the surrounding call or object.
      select: { id: true, role: true, email: true, name: true, isActive: true }, // Separates this argument or property from the next item in the surrounding call or object.
    }).then((user) => { // Opens the function, callback, or control-flow block that groups the related statements.
      if (!user || !user.isActive) { // Rejects an inactive account so deactivated users cannot continue using the API.
        next(new AppError('UNAUTHENTICATED', 'Authentication is required.', 401)) // Passes control to the next Express middleware, or forwards the supplied error to the error handler.
        return // Returns `` to the caller so the next layer can use the result.
      } // Closes the current block and marks where its grouped work ends.
      req.user = { id: user.id, role: user.role, email: user.email, name: user.name } // Provides `req.user = { id: user.id, role: user.role, email: user.email, name: user.name }` as part of this server module.
      next() // Passes control to the next Express middleware, or forwards the supplied error to the error handler.
    }).catch(next) // Provides `}).catch(next)` as part of this server module.
  } catch { // Opens the object or callback body that groups the settings for this operation.
    next(new AppError('UNAUTHENTICATED', 'Invalid or expired authentication token.', 401)) // Passes control to the next Express middleware, or forwards the supplied error to the error handler.
  } // Closes the current block and marks where its grouped work ends.
} // Closes the current block and marks where its grouped work ends.

export function requireRole(...roles: Array<'ADMIN' | 'PM'>): RequestHandler { // Defines `requireRole` to enforce role, keeping this behavior reusable.
  return (req, _res, next) => { // Opens the function, callback, or control-flow block that groups the related statements.
    if (!req.user) { // Checks whether the value is missing; the block handles that case before continuing.
      next(new AppError('UNAUTHENTICATED', 'Authentication is required.', 401)) // Passes control to the next Express middleware, or forwards the supplied error to the error handler.
    } else if (!roles.includes(req.user.role)) { // Checks whether the caller's role determines which operation is allowed; the block handles that case before continuing.
      next(new AppError('FORBIDDEN', 'You do not have permission to perform this action.', 403)) // Passes control to the next Express middleware, or forwards the supplied error to the error handler.
    } else { // Opens the object or callback body that groups the settings for this operation.
      next() // Passes control to the next Express middleware, or forwards the supplied error to the error handler.
    } // Closes the current block and marks where its grouped work ends.
  } // Closes the current block and marks where its grouped work ends.
} // Closes the current block and marks where its grouped work ends.
// File purpose: Authenticates requests and enforces role requirements for protected API routes.
