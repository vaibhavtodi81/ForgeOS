import type { ErrorRequestHandler, RequestHandler } from 'express' // Imports Express types or tools used to build the HTTP API.
import { Prisma } from '@prisma/client' // Uses Prisma's generated types and client to work safely with database records.
import { logger } from '../config/logger.js' // Uses the shared structured logger so server events have a consistent format.
import { AppError } from '../utils/errors.js' // Uses the shared API error type so failures have a consistent message and HTTP status.

export const notFoundHandler: RequestHandler = (req, _res, next) => { // Opens the function, callback, or control-flow block that groups the related statements.
  next(new AppError('NOT_FOUND', `Route not found: ${req.method} ${req.originalUrl}`, 404)) // Passes control to the next Express middleware, or forwards the supplied error to the error handler.
} // Closes the current block and marks where its grouped work ends.

export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => { // Opens the function, callback, or control-flow block that groups the related statements.
  if (error instanceof AppError) { // Checks whether the supplied values meet this condition; the block handles that case before continuing.
    res.status(error.status).json({ // Opens the object or callback body that groups the settings for this operation.
      success: false, // Separates this argument or property from the next item in the surrounding call or object.
      message: error.message, // Separates this argument or property from the next item in the surrounding call or object.
      errors: error.details ?? [], // Separates this argument or property from the next item in the surrounding call or object.
      data: null, // Separates this argument or property from the next item in the surrounding call or object.
      error: { code: error.code, message: error.message, details: error.details }, // Separates this argument or property from the next item in the surrounding call or object.
    }) // Closes the current call, object, or collection so the surrounding expression can continue.
    return // Returns `` to the caller so the next layer can use the result.
  } // Closes the current block and marks where its grouped work ends.

  if (error instanceof Prisma.PrismaClientKnownRequestError) { // Checks whether the supplied values meet this condition; the block handles that case before continuing.
    const mapped = error.code === 'P2002' // Stores this intermediate `mapped` value so later lines can use it.
      ? { code: 'CONFLICT' as const, status: 409, message: 'A record with the same unique value already exists.' } // Provides `? { code: 'CONFLICT' as const, status: 409, message: 'A record with the same unique value already exists.' }` as part of this server module.
      : error.code === 'P2025' // Provides `: error.code === 'P2025'` as part of this server module.
        ? { code: 'NOT_FOUND' as const, status: 404, message: 'The requested record was not found.' } // Provides `? { code: 'NOT_FOUND' as const, status: 404, message: 'The requested record was not found.' }` as part of this server module.
        : { code: 'INTERNAL_ERROR' as const, status: 500, message: 'A database error occurred.' } // Provides `: { code: 'INTERNAL_ERROR' as const, status: 500, message: 'A database error occurred.' }` as part of this server module.

    res.status(mapped.status).json({ // Opens the object or callback body that groups the settings for this operation.
      success: false, // Separates this argument or property from the next item in the surrounding call or object.
      message: mapped.message, // Separates this argument or property from the next item in the surrounding call or object.
      errors: [], // Separates this argument or property from the next item in the surrounding call or object.
      data: null, // Separates this argument or property from the next item in the surrounding call or object.
      error: { code: mapped.code, message: mapped.message }, // Separates this argument or property from the next item in the surrounding call or object.
    }) // Closes the current call, object, or collection so the surrounding expression can continue.
    logger.error({ err: error, method: req.method, path: req.originalUrl }, 'Database request failed') // Writes an operational log entry so server activity can be monitored.
    return // Returns `` to the caller so the next layer can use the result.
  } // Closes the current block and marks where its grouped work ends.

  logger.error({ err: error, method: req.method, path: req.originalUrl }, 'Unhandled request error') // Writes an operational log entry so server activity can be monitored.
  res.status(500).json({ // Opens the object or callback body that groups the settings for this operation.
    success: false, // Separates this argument or property from the next item in the surrounding call or object.
    message: 'An unexpected error occurred.', // Separates this argument or property from the next item in the surrounding call or object.
    errors: [], // Separates this argument or property from the next item in the surrounding call or object.
    data: null, // Separates this argument or property from the next item in the surrounding call or object.
    error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' }, // Separates this argument or property from the next item in the surrounding call or object.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
} // Closes the current block and marks where its grouped work ends.
// File purpose: Converts application and unexpected errors into consistent HTTP responses.
