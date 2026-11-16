import { afterAll, beforeAll, describe, expect, it } from 'vitest' // Imports test-runner helpers for defining and checking this behavior.
import request from 'supertest' // Imports an HTTP test client so API routes can be exercised without a browser.
import { PrismaClient, Role } from '@prisma/client' // Uses Prisma's generated types and client to work safely with database records.
import { createApp } from '../src/app.js' // Imports { createApp } from '../src/app.js' so this module can reuse that functionality.
import { createAccessToken } from '../src/utils/jwt.js' // Uses JWT helpers to create or verify signed authentication tokens.

const enabled = (process.env.DATABASE_URL ?? '').includes(':55432/') // Stores this intermediate `enabled` value so later lines can use it.
const describeIntegration = describe.skipIf(!enabled) // Stores this intermediate `describe integration` value so later lines can use it.
const prisma = new PrismaClient() // Stores this intermediate `prisma` value so later lines can use it.
const app = createApp() // Stores this intermediate `app` value so later lines can use it.
const marker = `inventory-${Date.now()}` // Stores this intermediate `marker` value so later lines can use it.
let adminId: number // Stores this intermediate `number` value so later lines can use it.
let pmId: number // Stores this intermediate `number` value so later lines can use it.
let otherPmId: number // Stores this intermediate `number` value so later lines can use it.
let landId: number // Stores this intermediate `number` value so later lines can use it.
let projectId: number // Stores this intermediate `number` value so later lines can use it.
let otherProjectId: number // Stores this intermediate `number` value so later lines can use it.
let materialId: number // Stores this intermediate `number` value so later lines can use it.
let adminToken: string // Stores this intermediate `string` value so later lines can use it.
let pmToken: string // Stores this intermediate `string` value so later lines can use it.
let otherPmToken: string // Stores this intermediate `string` value so later lines can use it.

const auth = (token: string) => ({ Authorization: `Bearer ${token}` }) // Stores this intermediate `auth` value so later lines can use it.

describeIntegration('Material inventory PostgreSQL integration', () => { // Opens the function, callback, or control-flow block that groups the related statements.
  beforeAll(async () => { // Opens the function, callback, or control-flow block that groups the related statements.
    const [admin, pm, otherPm] = await Promise.all([ // Stores this intermediate `other pm` value so later lines can use it.
      prisma.user.create({ data: { name: `${marker} Admin`, email: `admin@${marker}.test`, passwordHash: 'test', role: Role.ADMIN } }), // Separates this argument or property from the next item in the surrounding call or object.
      prisma.user.create({ data: { name: `${marker} PM`, email: `pm@${marker}.test`, passwordHash: 'test', role: Role.PM } }), // Separates this argument or property from the next item in the surrounding call or object.
      prisma.user.create({ data: { name: `${marker} Other`, email: `other@${marker}.test`, passwordHash: 'test', role: Role.PM } }), // Separates this argument or property from the next item in the surrounding call or object.
    ]) // Closes the current call, object, or collection so the surrounding expression can continue.
    adminId = admin.id; pmId = pm.id; otherPmId = otherPm.id // Provides `adminId = admin.id; pmId = pm.id; otherPmId = otherPm.id` as part of this server module.
    adminToken = createAccessToken(admin); pmToken = createAccessToken(pm); otherPmToken = createAccessToken(otherPm) // Provides `adminToken = createAccessToken(admin); pmToken = createAccessToken(pm); otherPmToken = createAccessToken(otherPm)` as part of this server module.
    const land = await prisma.land.create({ data: { name: `${marker} Land`, city: 'Test City', state: 'Test State', areaValue: 1, areaUnit: 'ACRE', createdById: adminId } }) // Stores the result of creates a record in the land table in `land` for the next steps.
    landId = land.id // Provides `landId = land.id` as part of this server module.
    const project = await prisma.project.create({ data: { landId, code: `${marker}-A`, name: `${marker} Project`, status: 'ACTIVE', assignedPmId: pmId, createdById: adminId } }) // Stores the result of creates a record in the project table in `project` for the next steps.
    const otherProject = await prisma.project.create({ data: { landId, code: `${marker}-B`, name: `${marker} Other Project`, status: 'ACTIVE', assignedPmId: otherPmId, createdById: adminId } }) // Stores the result of creates a record in the project table in `otherProject` for the next steps.
    projectId = project.id; otherProjectId = otherProject.id // Provides `projectId = project.id; otherProjectId = otherProject.id` as part of this server module.
    const material = await prisma.material.create({ data: { name: `${marker} Cement`, category: 'CEMENT', unit: 'BAG', description: 'Integration material' } }) // Stores the result of creates a record in the material table in `material` for the next steps.
    materialId = material.id // Provides `materialId = material.id` as part of this server module.
    await prisma.projectMaterialPlan.create({ data: { projectId, materialId, plannedQuantity: 100, openingQuantity: 10, lowStockThreshold: 5, plannedUnitRate: 20 } }) // Waits for the database to creates a record in the project material plan table before dependent work continues.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.

  afterAll(async () => { // Opens the function, callback, or control-flow block that groups the related statements.
    await prisma.auditLog.deleteMany({ where: { userId: { in: [adminId, pmId, otherPmId] } } }) // Waits for the database to deletes matching records in the audit log table before dependent work continues.
    await prisma.stockTransaction.deleteMany({ where: { projectId: { in: [projectId, otherProjectId] } } }) // Waits for the database to deletes matching records in the stock transaction table before dependent work continues.
    await prisma.projectMaterialPlan.deleteMany({ where: { projectId: { in: [projectId, otherProjectId] } } }) // Waits for the database to deletes matching records in the project material plan table before dependent work continues.
    await prisma.material.delete({ where: { id: materialId } }) // Waits for the database to deletes a record in the material table before dependent work continues.
    await prisma.project.deleteMany({ where: { id: { in: [projectId, otherProjectId] } } }) // Waits for the database to deletes matching records in the project table before dependent work continues.
    await prisma.land.delete({ where: { id: landId } }) // Waits for the database to deletes a record in the land table before dependent work continues.
    await prisma.user.deleteMany({ where: { id: { in: [adminId, pmId, otherPmId] } } }) // Waits for the database to deletes matching records in the user table before dependent work continues.
    await prisma.$disconnect() // Waits for this asynchronous operation to finish before using its result.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.

  it('supports material CRUD and project-scoped authorization', async () => { // Opens the function, callback, or control-flow block that groups the related statements.
    const created = await request(app).post('/api/v1/materials').set(auth(adminToken)).send({ name: `${marker} Steel`, category: 'STEEL', unit: 'KG' }) // Stores this intermediate `created` value so later lines can use it.
    expect(created.status).toBe(201) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect((await request(app).get('/api/v1/materials').set(auth(pmToken))).status).toBe(200) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect((await request(app).patch(`/api/v1/materials/${created.body.data.id}`).set(auth(otherPmToken)).send({ description: 'no' })).status).toBe(403) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    await prisma.material.delete({ where: { id: created.body.data.id } }) // Waits for the database to deletes a record in the material table before dependent work continues.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.

  it('records stock, calculates balances and wastage, and audits the write', async () => { // Opens the function, callback, or control-flow block that groups the related statements.
    const input = { materialId, txnType: 'IN', quantity: 20, txnDate: '2026-11-10', unitRate: 20 } // Stores this intermediate `input` value so later lines can use it.
    expect((await request(app).post(`/api/v1/projects/${projectId}/inventory/transactions`).set(auth(pmToken)).send(input)).status).toBe(201) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect((await request(app).post(`/api/v1/projects/${projectId}/inventory/transactions`).set(auth(pmToken)).send({ // Asserts that the observed result matches the behavior this test is meant to guarantee.
      materialId, txnType: 'OUT', quantity: 5, txnDate: '2026-11-10', outReason: 'DAMAGED', // Separates this argument or property from the next item in the surrounding call or object.
    })).status).toBe(201) // Provides `})).status).toBe(201)` as part of this server module.
    const inventory = await request(app).get(`/api/v1/projects/${projectId}/inventory`).set(auth(pmToken)) // Stores this intermediate `inventory` value so later lines can use it.
    expect(inventory.body.data[0].availableStock).toBe(25) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    const wastage = await request(app).get(`/api/v1/projects/${projectId}/inventory/wastage`).set(auth(pmToken)) // Stores this intermediate `wastage` value so later lines can use it.
    expect(wastage.body.data.items[0].recordedWastageQuantity).toBe(5) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    const audit = await prisma.auditLog.findFirst({ where: { entityType: 'StockTransaction', userId: pmId }, orderBy: { id: 'desc' } }) // Looks up one matching database record and stores it in `audit` so its existence or values can be checked.
    expect(audit?.action).toBe('CREATE') // Asserts that the observed result matches the behavior this test is meant to guarantee.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.

  it('rejects insufficient stock, invalid ranges, and unassigned access', async () => { // Opens the function, callback, or control-flow block that groups the related statements.
    const denied = await request(app).get(`/api/v1/projects/${projectId}/inventory`).set(auth(otherPmToken)) // Stores this intermediate `denied` value so later lines can use it.
    expect(denied.status).toBe(404) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    const inverted = await request(app).get(`/api/v1/projects/${projectId}/inventory/transactions?from=2026-11-10&to=2026-11-01`).set(auth(pmToken)) // Stores this intermediate `inverted` value so later lines can use it.
    expect(inverted.status).toBe(400) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    const insufficient = await request(app).post(`/api/v1/projects/${projectId}/inventory/transactions`).set(auth(pmToken)).send({ // Stores this intermediate `insufficient` value so later lines can use it.
      materialId, txnType: 'OUT', quantity: 1000, txnDate: '2026-11-10', outReason: 'USED', // Separates this argument or property from the next item in the surrounding call or object.
    }) // Closes the current call, object, or collection so the surrounding expression can continue.
    expect(insufficient.status).toBe(422) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(insufficient.body.error.code).toBe('INSUFFICIENT_STOCK') // Asserts that the observed result matches the behavior this test is meant to guarantee.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.

  it('serializes concurrent stock-out attempts under the advisory lock', async () => { // Opens the function, callback, or control-flow block that groups the related statements.
    const results = await Promise.all([1, 2].map(() => request(app).post(`/api/v1/projects/${projectId}/inventory/transactions`).set(auth(adminToken)).send({ // Transforms the matching items into `results`, the shape needed by the caller.
      materialId, txnType: 'OUT', quantity: 20, txnDate: '2026-11-10', outReason: 'USED', // Separates this argument or property from the next item in the surrounding call or object.
    }))) // Provides `})))` as part of this server module.
    expect(results.filter((result) => result.status === 201)).toHaveLength(1) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(results.filter((result) => result.status === 422)).toHaveLength(1) // Asserts that the observed result matches the behavior this test is meant to guarantee.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
}) // Closes the current call, object, or collection so the surrounding expression can continue.
// File purpose: Checks expected behavior for inventory.integration.test using the project test runner.
