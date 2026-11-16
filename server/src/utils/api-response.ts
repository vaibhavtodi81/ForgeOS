import type { Response } from 'express' // Imports Express types or tools used to build the HTTP API.

export function sendSuccess<T>( // Defines `sendSuccess` to send success, keeping this behavior reusable.
  response: Response, // Separates this argument or property from the next item in the surrounding call or object.
  status: number, // Separates this argument or property from the next item in the surrounding call or object.
  data: T, // Separates this argument or property from the next item in the surrounding call or object.
  message: string, // Separates this argument or property from the next item in the surrounding call or object.
  meta: unknown = null, // Separates this argument or property from the next item in the surrounding call or object.
) { // Opens the object or callback body that groups the settings for this operation.
  return response.status(status).json({ // Returns `response.status(status).json({` to the caller so the next layer can use the result.
    success: true, // Separates this argument or property from the next item in the surrounding call or object.
    message, // Separates this argument or property from the next item in the surrounding call or object.
    data, // Separates this argument or property from the next item in the surrounding call or object.
    meta, // Separates this argument or property from the next item in the surrounding call or object.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
} // Closes the current block and marks where its grouped work ends.
// File purpose: Builds consistent success response envelopes for API handlers.
