import { beforeEach, describe, expect, it, vi } from 'vitest' // Imports test-runner helpers for defining and checking this behavior.

const mocks = vi.hoisted(() => ({ // Stores this intermediate `mocks` value so later lines can use it.
  userFindUnique: vi.fn(), // Separates this argument or property from the next item in the surrounding call or object.
  userUpdate: vi.fn(), // Separates this argument or property from the next item in the surrounding call or object.
  userFindMany: vi.fn(), // Separates this argument or property from the next item in the surrounding call or object.
  userCount: vi.fn(), // Separates this argument or property from the next item in the surrounding call or object.
  userCreate: vi.fn(), // Separates this argument or property from the next item in the surrounding call or object.
  transaction: vi.fn(), // Separates this argument or property from the next item in the surrounding call or object.
})) // Provides `}))` as part of this server module.

vi.mock('../src/utils/prisma.js', () => ({ // Configures the test double or mock so this test can control the external behavior it depends on.
  prisma: { // Sets `prisma` to the prisma value.
    user: { // Sets `user` to the user value.
      findUnique: mocks.userFindUnique, // Separates this argument or property from the next item in the surrounding call or object.
      update: mocks.userUpdate, // Separates this argument or property from the next item in the surrounding call or object.
      findMany: mocks.userFindMany, // Separates this argument or property from the next item in the surrounding call or object.
      count: mocks.userCount, // Separates this argument or property from the next item in the surrounding call or object.
      create: mocks.userCreate, // Separates this argument or property from the next item in the surrounding call or object.
    }, // Closes the current call, object, or collection so the surrounding expression can continue.
    $queryRaw: vi.fn(), // Separates this argument or property from the next item in the surrounding call or object.
    $transaction: mocks.transaction, // Separates this argument or property from the next item in the surrounding call or object.
  }, // Closes the current call, object, or collection so the surrounding expression can continue.
})) // Provides `}))` as part of this server module.

import request from 'supertest' // Imports an HTTP test client so API routes can be exercised without a browser.
import { Prisma } from '@prisma/client' // Uses Prisma's generated types and client to work safely with database records.
import { createApp } from '../src/app.js' // Imports { createApp } from '../src/app.js' so this module can reuse that functionality.
import { createAccessToken } from '../src/utils/jwt.js' // Uses JWT helpers to create or verify signed authentication tokens.
import { hashPassword } from '../src/utils/password.js' // Imports { hashPassword } from '../src/utils/password.js' so this module can reuse that functionality.

const admin = { // Stores this intermediate `admin` value so later lines can use it.
  id: 1, // Separates this argument or property from the next item in the surrounding call or object.
  name: 'Admin', // Separates this argument or property from the next item in the surrounding call or object.
  email: 'admin@example.com', // Separates this argument or property from the next item in the surrounding call or object.
  passwordHash: hashPassword('correct-password'), // Separates this argument or property from the next item in the surrounding call or object.
  role: 'ADMIN' as const, // Separates this argument or property from the next item in the surrounding call or object.
  phone: null, // Separates this argument or property from the next item in the surrounding call or object.
  isActive: true, // Separates this argument or property from the next item in the surrounding call or object.
  createdAt: new Date(), // Separates this argument or property from the next item in the surrounding call or object.
  updatedAt: new Date(), // Separates this argument or property from the next item in the surrounding call or object.
} // Closes the current block and marks where its grouped work ends.

const pm = { ...admin, id: 2, name: 'PM', email: 'pm@example.com', role: 'PM' as const } // Stores this intermediate `pm` value so later lines can use it.

describe('authentication and shared authorization', () => { // Opens the function, callback, or control-flow block that groups the related statements.
  beforeEach(() => { // Opens the function, callback, or control-flow block that groups the related statements.
    vi.clearAllMocks() // Configures the test double or mock so this test can control the external behavior it depends on.
    mocks.userFindUnique.mockResolvedValue(admin) // Provides `mocks.userFindUnique.mockResolvedValue(admin)` as part of this server module.
    mocks.userUpdate.mockResolvedValue(admin) // Provides `mocks.userUpdate.mockResolvedValue(admin)` as part of this server module.
    mocks.userFindMany.mockResolvedValue([admin]) // Provides `mocks.userFindMany.mockResolvedValue([admin])` as part of this server module.
    mocks.userCount.mockResolvedValue(1) // Provides `mocks.userCount.mockResolvedValue(1)` as part of this server module.
    mocks.userCreate.mockResolvedValue(admin) // Provides `mocks.userCreate.mockResolvedValue(admin)` as part of this server module.
    mocks.transaction.mockImplementation(async (operations: Array<Promise<unknown>>) => Promise.all(operations)) // Provides `mocks.transaction.mockImplementation(async (operations: Array<Promise<unknown>>) => Promise.all(operations))` as part of this server module.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.

  it('logs in and returns a JWT without a password hash', async () => { // Opens the function, callback, or control-flow block that groups the related statements.
    const response = await request(createApp()) // Stores this intermediate `response` value so later lines can use it.
      .post('/api/v1/auth/login') // Provides `.post('/api/v1/auth/login')` as part of this server module.
      .send({ email: admin.email, password: 'correct-password' }) // Provides `.send({ email: admin.email, password: 'correct-password' })` as part of this server module.

    expect(response.status).toBe(200) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(response.body.data.token).toEqual(expect.any(String)) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(response.body.data.user).not.toHaveProperty('passwordHash') // Asserts that the observed result matches the behavior this test is meant to guarantee.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.

  it('allows PM login and rejects inactive users', async () => { // Opens the function, callback, or control-flow block that groups the related statements.
    mocks.userFindUnique.mockResolvedValueOnce(pm) // Provides `mocks.userFindUnique.mockResolvedValueOnce(pm)` as part of this server module.
    mocks.userUpdate.mockResolvedValueOnce(pm) // Provides `mocks.userUpdate.mockResolvedValueOnce(pm)` as part of this server module.
    const response = await request(createApp()) // Stores this intermediate `response` value so later lines can use it.
      .post('/api/v1/auth/login') // Provides `.post('/api/v1/auth/login')` as part of this server module.
      .send({ email: pm.email, password: 'correct-password' }) // Provides `.send({ email: pm.email, password: 'correct-password' })` as part of this server module.
    expect(response.status).toBe(200) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(response.body.data.user.role).toBe('PM') // Asserts that the observed result matches the behavior this test is meant to guarantee.

    mocks.userFindUnique.mockResolvedValueOnce({ ...pm, isActive: false }) // Provides `mocks.userFindUnique.mockResolvedValueOnce({ ...pm, isActive: false })` as part of this server module.
    const inactive = await request(createApp()) // Stores this intermediate `inactive` value so later lines can use it.
      .post('/api/v1/auth/login') // Provides `.post('/api/v1/auth/login')` as part of this server module.
      .send({ email: pm.email, password: 'correct-password' }) // Provides `.send({ email: pm.email, password: 'correct-password' })` as part of this server module.
    expect(inactive.status).toBe(401) // Asserts that the observed result matches the behavior this test is meant to guarantee.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.

  it('rejects unknown users and invalid passwords', async () => { // Opens the function, callback, or control-flow block that groups the related statements.
    mocks.userFindUnique.mockResolvedValueOnce(null) // Provides `mocks.userFindUnique.mockResolvedValueOnce(null)` as part of this server module.
    const unknown = await request(createApp()).post('/api/v1/auth/login').send({ email: 'missing@example.com', password: 'bad-password' }) // Stores this intermediate `unknown` value so later lines can use it.
    expect(unknown.status).toBe(401) // Asserts that the observed result matches the behavior this test is meant to guarantee.

    mocks.userFindUnique.mockResolvedValueOnce(admin) // Provides `mocks.userFindUnique.mockResolvedValueOnce(admin)` as part of this server module.
    const invalid = await request(createApp()).post('/api/v1/auth/login').send({ email: admin.email, password: 'bad-password' }) // Stores this intermediate `invalid` value so later lines can use it.
    expect(invalid.status).toBe(401) // Asserts that the observed result matches the behavior this test is meant to guarantee.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.

  it('hashes a new user password without passing plaintext to Prisma', async () => { // Opens the function, callback, or control-flow block that groups the related statements.
    const response = await request(createApp()) // Stores this intermediate `response` value so later lines can use it.
      .post('/api/v1/users') // Provides `.post('/api/v1/users')` as part of this server module.
      .set('Authorization', `Bearer ${createAccessToken(admin)}`) // Provides `.set('Authorization', `Bearer ${createAccessToken(admin)}`)` as part of this server module.
      .send({ name: 'New PM', email: 'newpm@example.com', password: 'secure-password', role: 'PM' }) // Provides `.send({ name: 'New PM', email: 'newpm@example.com', password: 'secure-password', role: 'PM' })` as part of this server module.

    expect(response.status).toBe(201) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(mocks.userCreate).toHaveBeenCalledWith({ // Asserts that the observed result matches the behavior this test is meant to guarantee.
      data: expect.objectContaining({ // Sets `data` to the values to write to the database.
        name: 'New PM', // Separates this argument or property from the next item in the surrounding call or object.
        email: 'newpm@example.com', // Separates this argument or property from the next item in the surrounding call or object.
        passwordHash: expect.any(String), // Separates this argument or property from the next item in the surrounding call or object.
      }), // Separates this argument or property from the next item in the surrounding call or object.
    }) // Closes the current call, object, or collection so the surrounding expression can continue.
    expect(mocks.userCreate.mock.calls[0]?.[0]).not.toHaveProperty('data.password') // Asserts that the observed result matches the behavior this test is meant to guarantee.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.

  it('rejects missing, invalid, and expired JWTs', async () => { // Opens the function, callback, or control-flow block that groups the related statements.
    expect((await request(createApp()).get('/api/v1/auth/me')).status).toBe(401) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect((await request(createApp()).get('/api/v1/auth/me').set('Authorization', 'Bearer invalid')).status).toBe(401) // Asserts that the observed result matches the behavior this test is meant to guarantee.

    vi.useFakeTimers() // Configures the test double or mock so this test can control the external behavior it depends on.
    vi.setSystemTime(Date.now() - 60 * 60 * 1000) // Configures the test double or mock so this test can control the external behavior it depends on.
    const expiredToken = createAccessToken(admin) // Stores this intermediate `expired token` value so later lines can use it.
    vi.useRealTimers() // Configures the test double or mock so this test can control the external behavior it depends on.
    expect((await request(createApp()).get('/api/v1/auth/me').set('Authorization', `Bearer ${expiredToken}`)).status).toBe(401) // Asserts that the observed result matches the behavior this test is meant to guarantee.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.

  it('allows ADMIN user management and denies PM user management', async () => { // Opens the function, callback, or control-flow block that groups the related statements.
    const adminToken = createAccessToken(admin) // Stores this intermediate `admin token` value so later lines can use it.
    expect((await request(createApp()).get('/api/v1/users').set('Authorization', `Bearer ${adminToken}`)).status).toBe(200) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect((await request(createApp()).post('/api/v1/users').set('Authorization', `Bearer ${adminToken}`).send({ // Asserts that the observed result matches the behavior this test is meant to guarantee.
      name: 'New PM', // Separates this argument or property from the next item in the surrounding call or object.
      email: 'newpm@example.com', // Separates this argument or property from the next item in the surrounding call or object.
      password: 'secure-password', // Separates this argument or property from the next item in the surrounding call or object.
      role: 'PM', // Separates this argument or property from the next item in the surrounding call or object.
    })).status).toBe(201) // Provides `})).status).toBe(201)` as part of this server module.
    expect((await request(createApp()).patch('/api/v1/users/2').set('Authorization', `Bearer ${adminToken}`).send({ // Asserts that the observed result matches the behavior this test is meant to guarantee.
      name: 'Updated PM', // Separates this argument or property from the next item in the surrounding call or object.
    })).status).toBe(200) // Provides `})).status).toBe(200)` as part of this server module.

    mocks.userFindUnique.mockResolvedValue(pm) // Provides `mocks.userFindUnique.mockResolvedValue(pm)` as part of this server module.
    const pmToken = createAccessToken(pm) // Stores this intermediate `pm token` value so later lines can use it.
    expect((await request(createApp()).get('/api/v1/users').set('Authorization', `Bearer ${pmToken}`)).status).toBe(403) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect((await request(createApp()).post('/api/v1/users').set('Authorization', `Bearer ${pmToken}`).send({ // Asserts that the observed result matches the behavior this test is meant to guarantee.
      name: 'Blocked', // Separates this argument or property from the next item in the surrounding call or object.
      email: 'blocked@example.com', // Separates this argument or property from the next item in the surrounding call or object.
      password: 'secure-password', // Separates this argument or property from the next item in the surrounding call or object.
      role: 'PM', // Separates this argument or property from the next item in the surrounding call or object.
    })).status).toBe(403) // Provides `})).status).toBe(403)` as part of this server module.
    expect((await request(createApp()).patch('/api/v1/users/2').set('Authorization', `Bearer ${pmToken}`).send({ name: 'Blocked' })).status).toBe(403) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect((await request(createApp()).patch('/api/v1/users/2/status').set('Authorization', `Bearer ${pmToken}`).send({ isActive: false })).status).toBe(403) // Asserts that the observed result matches the behavior this test is meant to guarantee.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.

  it('maps duplicate user emails to a conflict without exposing hashes', async () => { // Opens the function, callback, or control-flow block that groups the related statements.
    mocks.userCreate.mockRejectedValueOnce(new Prisma.PrismaClientKnownRequestError('duplicate', { // Opens the object or callback body that groups the settings for this operation.
      code: 'P2002', // Separates this argument or property from the next item in the surrounding call or object.
      clientVersion: '5.22.0', // Separates this argument or property from the next item in the surrounding call or object.
    })) // Provides `}))` as part of this server module.
    const response = await request(createApp()) // Stores this intermediate `response` value so later lines can use it.
      .post('/api/v1/users') // Provides `.post('/api/v1/users')` as part of this server module.
      .set('Authorization', `Bearer ${createAccessToken(admin)}`) // Provides `.set('Authorization', `Bearer ${createAccessToken(admin)}`)` as part of this server module.
      .send({ name: 'Duplicate', email: 'admin@example.com', password: 'secure-password', role: 'PM' }) // Provides `.send({ name: 'Duplicate', email: 'admin@example.com', password: 'secure-password', role: 'PM' })` as part of this server module.
    expect(response.status).toBe(409) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(response.body).not.toHaveProperty('data.passwordHash') // Asserts that the observed result matches the behavior this test is meant to guarantee.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
}) // Closes the current call, object, or collection so the surrounding expression can continue.
// File purpose: Checks expected behavior for auth and access.test using the project test runner.
