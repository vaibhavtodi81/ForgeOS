import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  userFindUnique: vi.fn(),
  userUpdate: vi.fn(),
  userFindMany: vi.fn(),
  userCount: vi.fn(),
  userCreate: vi.fn(),
  transaction: vi.fn(),
}))

vi.mock('../src/utils/prisma.js', () => ({
  prisma: {
    user: {
      findUnique: mocks.userFindUnique,
      update: mocks.userUpdate,
      findMany: mocks.userFindMany,
      count: mocks.userCount,
      create: mocks.userCreate,
    },
    $queryRaw: vi.fn(),
    $transaction: mocks.transaction,
  },
}))

import request from 'supertest'
import { Prisma } from '@prisma/client'
import { createApp } from '../src/app.js'
import { createAccessToken } from '../src/utils/jwt.js'
import { hashPassword } from '../src/utils/password.js'

const admin = {
  id: 1,
  name: 'Admin',
  email: 'admin@example.com',
  passwordHash: hashPassword('correct-password'),
  role: 'ADMIN' as const,
  phone: null,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
}

const pm = { ...admin, id: 2, name: 'PM', email: 'pm@example.com', role: 'PM' as const }

describe('authentication and shared authorization', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.userFindUnique.mockResolvedValue(admin)
    mocks.userUpdate.mockResolvedValue(admin)
    mocks.userFindMany.mockResolvedValue([admin])
    mocks.userCount.mockResolvedValue(1)
    mocks.userCreate.mockResolvedValue(admin)
    mocks.transaction.mockImplementation(async (operations: Array<Promise<unknown>>) => Promise.all(operations))
  })

  it('logs in and returns a JWT without a password hash', async () => {
    const response = await request(createApp())
      .post('/api/v1/auth/login')
      .send({ email: admin.email, password: 'correct-password' })

    expect(response.status).toBe(200)
    expect(response.body.data.token).toEqual(expect.any(String))
    expect(response.body.data.user).not.toHaveProperty('passwordHash')
  })

  it('allows PM login and rejects inactive users', async () => {
    mocks.userFindUnique.mockResolvedValueOnce(pm)
    mocks.userUpdate.mockResolvedValueOnce(pm)
    const response = await request(createApp())
      .post('/api/v1/auth/login')
      .send({ email: pm.email, password: 'correct-password' })
    expect(response.status).toBe(200)
    expect(response.body.data.user.role).toBe('PM')

    mocks.userFindUnique.mockResolvedValueOnce({ ...pm, isActive: false })
    const inactive = await request(createApp())
      .post('/api/v1/auth/login')
      .send({ email: pm.email, password: 'correct-password' })
    expect(inactive.status).toBe(401)
  })

  it('rejects unknown users and invalid passwords', async () => {
    mocks.userFindUnique.mockResolvedValueOnce(null)
    const unknown = await request(createApp()).post('/api/v1/auth/login').send({ email: 'missing@example.com', password: 'bad-password' })
    expect(unknown.status).toBe(401)

    mocks.userFindUnique.mockResolvedValueOnce(admin)
    const invalid = await request(createApp()).post('/api/v1/auth/login').send({ email: admin.email, password: 'bad-password' })
    expect(invalid.status).toBe(401)
  })

  it('hashes a new user password without passing plaintext to Prisma', async () => {
    const response = await request(createApp())
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${createAccessToken(admin)}`)
      .send({ name: 'New PM', email: 'newpm@example.com', password: 'secure-password', role: 'PM' })

    expect(response.status).toBe(201)
    expect(mocks.userCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: 'New PM',
        email: 'newpm@example.com',
        passwordHash: expect.any(String),
      }),
    })
    expect(mocks.userCreate.mock.calls[0]?.[0]).not.toHaveProperty('data.password')
  })

  it('rejects missing, invalid, and expired JWTs', async () => {
    expect((await request(createApp()).get('/api/v1/auth/me')).status).toBe(401)
    expect((await request(createApp()).get('/api/v1/auth/me').set('Authorization', 'Bearer invalid')).status).toBe(401)

    vi.useFakeTimers()
    vi.setSystemTime(Date.now() - 60 * 60 * 1000)
    const expiredToken = createAccessToken(admin)
    vi.useRealTimers()
    expect((await request(createApp()).get('/api/v1/auth/me').set('Authorization', `Bearer ${expiredToken}`)).status).toBe(401)
  })

  it('allows ADMIN user management and denies PM user management', async () => {
    const adminToken = createAccessToken(admin)
    expect((await request(createApp()).get('/api/v1/users').set('Authorization', `Bearer ${adminToken}`)).status).toBe(200)
    expect((await request(createApp()).post('/api/v1/users').set('Authorization', `Bearer ${adminToken}`).send({
      name: 'New PM',
      email: 'newpm@example.com',
      password: 'secure-password',
      role: 'PM',
    })).status).toBe(201)
    expect((await request(createApp()).patch('/api/v1/users/2').set('Authorization', `Bearer ${adminToken}`).send({
      name: 'Updated PM',
    })).status).toBe(200)

    mocks.userFindUnique.mockResolvedValue(pm)
    const pmToken = createAccessToken(pm)
    expect((await request(createApp()).get('/api/v1/users').set('Authorization', `Bearer ${pmToken}`)).status).toBe(403)
    expect((await request(createApp()).post('/api/v1/users').set('Authorization', `Bearer ${pmToken}`).send({
      name: 'Blocked',
      email: 'blocked@example.com',
      password: 'secure-password',
      role: 'PM',
    })).status).toBe(403)
    expect((await request(createApp()).patch('/api/v1/users/2').set('Authorization', `Bearer ${pmToken}`).send({ name: 'Blocked' })).status).toBe(403)
    expect((await request(createApp()).patch('/api/v1/users/2/status').set('Authorization', `Bearer ${pmToken}`).send({ isActive: false })).status).toBe(403)
  })

  it('maps duplicate user emails to a conflict without exposing hashes', async () => {
    mocks.userCreate.mockRejectedValueOnce(new Prisma.PrismaClientKnownRequestError('duplicate', {
      code: 'P2002',
      clientVersion: '5.22.0',
    }))
    const response = await request(createApp())
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${createAccessToken(admin)}`)
      .send({ name: 'Duplicate', email: 'admin@example.com', password: 'secure-password', role: 'PM' })
    expect(response.status).toBe(409)
    expect(response.body).not.toHaveProperty('data.passwordHash')
  })
})
