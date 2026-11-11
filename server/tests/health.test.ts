import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../src/utils/prisma.js', () => ({
  prisma: {
    $queryRaw: vi.fn(),
  },
}))

import request from 'supertest'
import { createApp } from '../src/app.js'
import { prisma } from '../src/utils/prisma.js'

describe('GET /api/v1/health', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Daily log authentication boundary', () => {
    it('rejects daily log requests until shared authentication provides a user', async () => {
      const response = await request(createApp())
        .get('/api/v1/projects/1/daily-logs')

      expect(response.status).toBe(401)
      expect(response.body).toMatchObject({
        success: false,
        message: 'Authentication is required.',
        data: null,
        error: { code: 'UNAUTHENTICATED' },
      })
    })
  })

  it('reports the API and database as healthy when Prisma can query', async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValue([{ '?column?': 1 }])

    const response = await request(createApp()).get('/api/v1/health')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
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
    vi.mocked(prisma.$queryRaw).mockRejectedValue(new Error('database unavailable'))

    const response = await request(createApp()).get('/api/v1/health')

    expect(response.status).toBe(503)
    expect(response.body.data.database).toBe('disconnected')
    expect(response.body.success).toBe(false)
  })
})
