import { beforeEach, describe, expect, it, vi } from 'vitest' // Imports test-runner helpers for defining and checking this behavior.

vi.mock('../src/utils/prisma.js', () => ({ // Configures the test double or mock so this test can control the external behavior it depends on.
  prisma: { // Sets `prisma` to the prisma value.
    $queryRaw: vi.fn(), // Separates this argument or property from the next item in the surrounding call or object.
  }, // Closes the current call, object, or collection so the surrounding expression can continue.
})) // Provides `}))` as part of this server module.

import request from 'supertest' // Imports an HTTP test client so API routes can be exercised without a browser.
import { createApp } from '../src/app.js' // Imports { createApp } from '../src/app.js' so this module can reuse that functionality.
import { prisma } from '../src/utils/prisma.js' // Uses the shared Prisma client to run queries through the server's database connection.

describe('GET /api/v1/health', () => { // Opens the function, callback, or control-flow block that groups the related statements.
  beforeEach(() => { // Opens the function, callback, or control-flow block that groups the related statements.
    vi.clearAllMocks() // Configures the test double or mock so this test can control the external behavior it depends on.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.

  describe('Daily log authentication boundary', () => { // Opens the function, callback, or control-flow block that groups the related statements.
    it('rejects daily log requests until shared authentication provides a user', async () => { // Opens the function, callback, or control-flow block that groups the related statements.
      const response = await request(createApp()) // Stores this intermediate `response` value so later lines can use it.
        .get('/api/v1/projects/1/daily-logs') // Provides `.get('/api/v1/projects/1/daily-logs')` as part of this server module.

      expect(response.status).toBe(401) // Asserts that the observed result matches the behavior this test is meant to guarantee.
      expect(response.body).toMatchObject({ // Asserts that the observed result matches the behavior this test is meant to guarantee.
        success: false, // Separates this argument or property from the next item in the surrounding call or object.
        message: 'Authentication is required.', // Separates this argument or property from the next item in the surrounding call or object.
        data: null, // Separates this argument or property from the next item in the surrounding call or object.
        error: { code: 'UNAUTHENTICATED' }, // Separates this argument or property from the next item in the surrounding call or object.
      }) // Closes the current call, object, or collection so the surrounding expression can continue.
    }) // Closes the current call, object, or collection so the surrounding expression can continue.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.

  it('reports the API and database as healthy when Prisma can query', async () => { // Opens the function, callback, or control-flow block that groups the related statements.
    vi.mocked(prisma.$queryRaw).mockResolvedValue([{ '?column?': 1 }]) // Configures the test double or mock so this test can control the external behavior it depends on.

    const response = await request(createApp()).get('/api/v1/health') // Stores this intermediate `response` value so later lines can use it.

    expect(response.status).toBe(200) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(response.body).toEqual({ // Asserts that the observed result matches the behavior this test is meant to guarantee.
      success: true, // Separates this argument or property from the next item in the surrounding call or object.
      data: { // Sets `data` to the values to write to the database.
        status: 'ok', // Separates this argument or property from the next item in the surrounding call or object.
        api: 'ok', // Separates this argument or property from the next item in the surrounding call or object.
        server: 'ok', // Separates this argument or property from the next item in the surrounding call or object.
        database: 'connected', // Separates this argument or property from the next item in the surrounding call or object.
      }, // Closes the current call, object, or collection so the surrounding expression can continue.
    }) // Closes the current call, object, or collection so the surrounding expression can continue.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.

  it('reports a degraded API when Prisma cannot connect', async () => { // Opens the function, callback, or control-flow block that groups the related statements.
    vi.mocked(prisma.$queryRaw).mockRejectedValue(new Error('database unavailable')) // Configures the test double or mock so this test can control the external behavior it depends on.

    const response = await request(createApp()).get('/api/v1/health') // Stores this intermediate `response` value so later lines can use it.

    expect(response.status).toBe(503) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(response.body.data.database).toBe('disconnected') // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(response.body.success).toBe(false) // Asserts that the observed result matches the behavior this test is meant to guarantee.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
}) // Closes the current call, object, or collection so the surrounding expression can continue.
// File purpose: Checks expected behavior for health.test using the project test runner.
