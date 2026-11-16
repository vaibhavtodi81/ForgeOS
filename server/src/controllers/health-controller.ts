import type { RequestHandler } from 'express' // Imports Express types or tools used to build the HTTP API.
import { getHealthStatus } from '../services/health-service.js' // Imports { getHealthStatus } from '../services/health-service.js' so this module can reuse that functionality.

export const getHealth: RequestHandler = async (_req, res) => { // Opens the function, callback, or control-flow block that groups the related statements.
  const status = await getHealthStatus() // Stores this intermediate `status` value so later lines can use it.
  const healthy = status.database === 'connected' // Stores this intermediate `healthy` value so later lines can use it.

  res.status(healthy ? 200 : 503).json({ // Opens the object or callback body that groups the settings for this operation.
    success: healthy, // Separates this argument or property from the next item in the surrounding call or object.
    data: { // Sets `data` to the values to write to the database.
      status: healthy ? 'ok' : 'degraded', // Separates this argument or property from the next item in the surrounding call or object.
      ...status, // Separates this argument or property from the next item in the surrounding call or object.
    }, // Closes the current call, object, or collection so the surrounding expression can continue.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
} // Closes the current block and marks where its grouped work ends.
// File purpose: Converts the health-check result into the API's HTTP response.
