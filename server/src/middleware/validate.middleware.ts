import type { RequestHandler } from 'express' // Imports Express types or tools used to build the HTTP API.
import type { ZodType } from 'zod' // Imports type { ZodType } from 'zod' so this module can reuse that functionality.
import { AppError } from '../utils/errors.js' // Uses the shared API error type so failures have a consistent message and HTTP status.

export function validateRequest( // Defines `validateRequest` to check request, keeping this behavior reusable.
  target: 'body' | 'params' | 'query', // Separates this argument or property from the next item in the surrounding call or object.
  schema: ZodType, // Separates this argument or property from the next item in the surrounding call or object.
): RequestHandler { // Opens the object or callback body that groups the settings for this operation.
  return (req, _res, next) => { // Opens the function, callback, or control-flow block that groups the related statements.
    const result = schema.safeParse(req[target]) // Stores this intermediate `result` value so later lines can use it.
    if (!result.success) { // Checks whether the value is missing; the block handles that case before continuing.
      next(new AppError( // Passes control to the next Express middleware, or forwards the supplied error to the error handler.
        'VALIDATION_ERROR', // Separates this argument or property from the next item in the surrounding call or object.
        'Validation failed.', // Separates this argument or property from the next item in the surrounding call or object.
        400, // Separates this argument or property from the next item in the surrounding call or object.
        result.error.issues.map((issue) => ({ // Opens the object or callback body that groups the settings for this operation.
          path: issue.path.join('.'), // Separates this argument or property from the next item in the surrounding call or object.
          message: issue.message, // Separates this argument or property from the next item in the surrounding call or object.
        })), // Separates this argument or property from the next item in the surrounding call or object.
      )) // Provides `))` as part of validate request.
      return // Returns `` to the caller so the next layer can use the result.
    } // Closes the current block and marks where its grouped work ends.
    Object.defineProperty(req, target, { // Opens the object or callback body that groups the settings for this operation.
      value: result.data, // Separates this argument or property from the next item in the surrounding call or object.
      configurable: true, // Separates this argument or property from the next item in the surrounding call or object.
      enumerable: true, // Separates this argument or property from the next item in the surrounding call or object.
      writable: true, // Separates this argument or property from the next item in the surrounding call or object.
    }) // Closes the current call, object, or collection so the surrounding expression can continue.
    next() // Passes control to the next Express middleware, or forwards the supplied error to the error handler.
  } // Closes the current block and marks where its grouped work ends.
} // Closes the current block and marks where its grouped work ends.
// File purpose: Validates request bodies, query strings, and parameters before controllers run.
