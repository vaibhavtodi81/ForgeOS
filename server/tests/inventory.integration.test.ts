import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'
import { PrismaClient, Role } from '@prisma/client'
import { createApp } from '../src/app.js'
import { createAccessToken } from '../src/utils/jwt.js'

const enabled = (process.env.DATABASE_URL ?? '').includes(':55432/')
const describeIntegration = describe.skipIf(!enabled)
const prisma = new PrismaClient()
const app = createApp()
const marker = `inventory-${Date.now()}`
let adminId: number
let pmId: number
let otherPmId: number
let landId: number
let projectId: number
let otherProjectId: number
let materialId: number
let adminToken: string
let pmToken: string
let otherPmToken: string

const auth = (token: string) => ({ Authorization: `Bearer ${token}` })

describeIntegration('Material inventory PostgreSQL integration', () => {
  beforeAll(async () => {
    const [admin, pm, otherPm] = await Promise.all([
      prisma.user.create({ data: { name: `${marker} Admin`, email: `admin@${marker}.test`, passwordHash: 'test', role: Role.ADMIN } }),
      prisma.user.create({ data: { name: `${marker} PM`, email: `pm@${marker}.test`, passwordHash: 'test', role: Role.PM } }),
      prisma.user.create({ data: { name: `${marker} Other`, email: `other@${marker}.test`, passwordHash: 'test', role: Role.PM } }),
    ])
    adminId = admin.id; pmId = pm.id; otherPmId = otherPm.id
    adminToken = createAccessToken(admin); pmToken = createAccessToken(pm); otherPmToken = createAccessToken(otherPm)
    const land = await prisma.land.create({ data: { name: `${marker} Land`, city: 'Test City', state: 'Test State', areaValue: 1, areaUnit: 'ACRE', createdById: adminId } })
    landId = land.id
    const project = await prisma.project.create({ data: { landId, code: `${marker}-A`, name: `${marker} Project`, status: 'ACTIVE', assignedPmId: pmId, createdById: adminId } })
    const otherProject = await prisma.project.create({ data: { landId, code: `${marker}-B`, name: `${marker} Other Project`, status: 'ACTIVE', assignedPmId: otherPmId, createdById: adminId } })
    projectId = project.id; otherProjectId = otherProject.id
    const material = await prisma.material.create({ data: { name: `${marker} Cement`, category: 'CEMENT', unit: 'BAG', description: 'Integration material' } })
    materialId = material.id
    await prisma.projectMaterialPlan.create({ data: { projectId, materialId, plannedQuantity: 100, openingQuantity: 10, lowStockThreshold: 5, plannedUnitRate: 20 } })
  })

  afterAll(async () => {
    await prisma.auditLog.deleteMany({ where: { userId: { in: [adminId, pmId, otherPmId] } } })
    await prisma.stockTransaction.deleteMany({ where: { projectId: { in: [projectId, otherProjectId] } } })
    await prisma.projectMaterialPlan.deleteMany({ where: { projectId: { in: [projectId, otherProjectId] } } })
    await prisma.material.delete({ where: { id: materialId } })
    await prisma.project.deleteMany({ where: { id: { in: [projectId, otherProjectId] } } })
    await prisma.land.delete({ where: { id: landId } })
    await prisma.user.deleteMany({ where: { id: { in: [adminId, pmId, otherPmId] } } })
    await prisma.$disconnect()
  })

  it('supports material CRUD and project-scoped authorization', async () => {
    const created = await request(app).post('/api/v1/materials').set(auth(adminToken)).send({ name: `${marker} Steel`, category: 'STEEL', unit: 'KG' })
    expect(created.status).toBe(201)
    expect((await request(app).get('/api/v1/materials').set(auth(pmToken))).status).toBe(200)
    expect((await request(app).patch(`/api/v1/materials/${created.body.data.id}`).set(auth(otherPmToken)).send({ description: 'no' })).status).toBe(403)
    await prisma.material.delete({ where: { id: created.body.data.id } })
  })

  it('records stock, calculates balances and wastage, and audits the write', async () => {
    const input = { materialId, txnType: 'IN', quantity: 20, txnDate: '2026-11-10', unitRate: 20 }
    expect((await request(app).post(`/api/v1/projects/${projectId}/inventory/transactions`).set(auth(pmToken)).send(input)).status).toBe(201)
    expect((await request(app).post(`/api/v1/projects/${projectId}/inventory/transactions`).set(auth(pmToken)).send({
      materialId, txnType: 'OUT', quantity: 5, txnDate: '2026-11-10', outReason: 'DAMAGED',
    })).status).toBe(201)
    const inventory = await request(app).get(`/api/v1/projects/${projectId}/inventory`).set(auth(pmToken))
    expect(inventory.body.data[0].availableStock).toBe(25)
    const wastage = await request(app).get(`/api/v1/projects/${projectId}/inventory/wastage`).set(auth(pmToken))
    expect(wastage.body.data.items[0].recordedWastageQuantity).toBe(5)
    const audit = await prisma.auditLog.findFirst({ where: { entityType: 'StockTransaction', userId: pmId }, orderBy: { id: 'desc' } })
    expect(audit?.action).toBe('CREATE')
  })

  it('rejects insufficient stock, invalid ranges, and unassigned access', async () => {
    const denied = await request(app).get(`/api/v1/projects/${projectId}/inventory`).set(auth(otherPmToken))
    expect(denied.status).toBe(404)
    const inverted = await request(app).get(`/api/v1/projects/${projectId}/inventory/transactions?from=2026-11-10&to=2026-11-01`).set(auth(pmToken))
    expect(inverted.status).toBe(400)
    const insufficient = await request(app).post(`/api/v1/projects/${projectId}/inventory/transactions`).set(auth(pmToken)).send({
      materialId, txnType: 'OUT', quantity: 1000, txnDate: '2026-11-10', outReason: 'USED',
    })
    expect(insufficient.status).toBe(422)
    expect(insufficient.body.error.code).toBe('INSUFFICIENT_STOCK')
  })

  it('serializes concurrent stock-out attempts under the advisory lock', async () => {
    const results = await Promise.all([1, 2].map(() => request(app).post(`/api/v1/projects/${projectId}/inventory/transactions`).set(auth(adminToken)).send({
      materialId, txnType: 'OUT', quantity: 20, txnDate: '2026-11-10', outReason: 'USED',
    })))
    expect(results.filter((result) => result.status === 201)).toHaveLength(1)
    expect(results.filter((result) => result.status === 422)).toHaveLength(1)
  })
})
