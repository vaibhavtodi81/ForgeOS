export type ErrorCode = // Defines the `ErrorCode` type so TypeScript can describe the data or behavior used here.
  | 'VALIDATION_ERROR' // Provides `| 'VALIDATION_ERROR'` as part of this server module.
  | 'UNAUTHENTICATED' // Provides `| 'UNAUTHENTICATED'` as part of this server module.
  | 'FORBIDDEN' // Provides `| 'FORBIDDEN'` as part of this server module.
  | 'NOT_FOUND' // Provides `| 'NOT_FOUND'` as part of this server module.
  | 'CONFLICT' // Provides `| 'CONFLICT'` as part of this server module.
  | 'INSUFFICIENT_STOCK' // Provides `| 'INSUFFICIENT_STOCK'` as part of this server module.
  | 'BUSINESS_RULE_VIOLATION' // Provides `| 'BUSINESS_RULE_VIOLATION'` as part of this server module.
  | 'INTERNAL_ERROR' // Provides `| 'INTERNAL_ERROR'` as part of this server module.
  | 'INVALID_CREDENTIALS' // Provides `| 'INVALID_CREDENTIALS'` as part of this server module.

export class AppError extends Error { // Defines the `AppError` class so TypeScript can describe the data or behavior used here.
  constructor( // Provides `constructor(` as part of this server module.
    public readonly code: ErrorCode, // Separates this argument or property from the next item in the surrounding call or object.
    message: string, // Separates this argument or property from the next item in the surrounding call or object.
    public readonly status = 400, // Separates this argument or property from the next item in the surrounding call or object.
    public readonly details?: unknown, // Separates this argument or property from the next item in the surrounding call or object.
  ) { // Opens the object or callback body that groups the settings for this operation.
    super(message) // Provides `super(message)` as part of this server module.
    this.name = 'AppError' // Provides `this.name = 'AppError'` as part of this server module.
  } // Closes the current block and marks where its grouped work ends.
} // Closes the current block and marks where its grouped work ends.
// File purpose: Defines typed application errors and their API error codes.
