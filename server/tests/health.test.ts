import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../src/utils/prisma.js', () => ({ // Configures the test double or mock so this test can control the external behavior it depends on.
  prisma: {
    $queryRaw: vi.fn(),
  },
}))

import request from 'supertest'
import { createApp } from '../src/app.js'
import { prisma } from '../src/utils/prisma.js'

describe('GET /api/v1/health', () => {
  beforeEach(() => {
    vi.clearAllMocks() // Configures the test double or mock so this test can control the external behavior it depends on.
  })

  describe('Daily log authentication boundary', () => {
    it('rejects daily log requests until shared authentication provides a user', async () => {
      const response = await request(createApp())
        .get('/api/v1/projects/1/daily-logs')

      expect(response.status).toBe(401) // Asserts that the observed result matches the behavior this test is meant to guarantee.
      expect(response.body).toMatchObject({ // Asserts that the observed result matches the behavior this test is meant to guarantee.
        success: false,
        message: 'Authentication is required.',
        data: null,
        error: { code: 'UNAUTHENTICATED' },
      })
    })
  })

  it('reports the API and database as healthy when Prisma can query', async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValue([{ '?column?': 1 }]) // Configures the test double or mock so this test can control the external behavior it depends on.

    const response = await request(createApp()).get('/api/v1/health')

    expect(response.status).toBe(200) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(response.body).toEqual({ // Asserts that the observed result matches the behavior this test is meant to guarantee.
      success: true,
      data: {
        status: 'ok',
        api: 'ok',
        server: 'ok',
        database: 'connected',
      },
    })
  })

  it('reports a degraded API when Prisma cannot connect', async () => {
    vi.mocked(prisma.$queryRaw).mockRejectedValue(new Error('database unavailable')) // Configures the test double or mock so this test can control the external behavior it depends on.

    const response = await request(createApp()).get('/api/v1/health')

    expect(response.status).toBe(503) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(response.body.data.database).toBe('disconnected') // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(response.body.success).toBe(false) // Asserts that the observed result matches the behavior this test is meant to guarantee.
  })
})
