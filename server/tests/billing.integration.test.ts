import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'
import { PrismaClient, Role } from '@prisma/client'
import { createApp } from '../src/app.js'
import { createAccessToken } from '../src/utils/jwt.js'

const enabled = (process.env.DATABASE_URL ?? '').includes(':55432/')
const describeIntegration = describe.skipIf(!enabled)
const prisma = new PrismaClient()
const app = createApp()
const marker = `billing-${Date.now()}`
let adminId: number
let pmId: number
let otherPmId: number
let landId: number
let projectId: number
let otherProjectId: number
let vendorId: number
let billId: number
let adminToken: string
let pmToken: string
let otherPmToken: string

const auth = (token: string) => ({ Authorization: `Bearer ${token}` })

describeIntegration('Vendors, billing and payments PostgreSQL integration', () => {
  beforeAll(async () => {
    const [admin, pm, otherPm] = await Promise.all([
      prisma.user.create({ data: { name: `${marker} Admin`, email: `admin@${marker}.test`, passwordHash: 'test', role: Role.ADMIN } }),
      prisma.user.create({ data: { name: `${marker} PM`, email: `pm@${marker}.test`, passwordHash: 'test', role: Role.PM } }),
      prisma.user.create({ data: { name: `${marker} Other`, email: `other@${marker}.test`, passwordHash: 'test', role: Role.PM } }),
    ])
    adminId = admin.id; pmId = pm.id; otherPmId = otherPm.id
    adminToken = createAccessToken(admin); pmToken = createAccessToken(pm); otherPmToken = createAccessToken(otherPm)
    const land = await prisma.land.create({ data: { name: `${marker} Land`, city: 'Billing City', state: 'Billing State', areaValue: 1, areaUnit: 'ACRE', createdById: adminId } })
    landId = land.id
    const project = await prisma.project.create({ data: { landId, code: `${marker}-A`, name: `${marker} Project`, status: 'ACTIVE', assignedPmId: pmId, createdById: adminId } })
    const otherProject = await prisma.project.create({ data: { landId, code: `${marker}-B`, name: `${marker} Other`, status: 'ACTIVE', assignedPmId: otherPmId, createdById: adminId } })
    projectId = project.id; otherProjectId = otherProject.id
    const vendor = await prisma.vendor.create({ data: { name: `${marker} Vendor`, vendorType: 'MATERIAL_SUPPLIER', gstin: '06ABCDE1234F1Z5', contactPerson: 'Test Contact' } })
    vendorId = vendor.id
  })

  afterAll(async () => {
    await prisma.$executeRawUnsafe('DROP TRIGGER IF EXISTS test_bill_audit_failure ON audit_logs')
    await prisma.$executeRawUnsafe('DROP FUNCTION IF EXISTS test_fail_bill_audit()')
    if (billId) await prisma.payment.deleteMany({ where: { billId } })
    await prisma.payment.deleteMany({ where: { bill: { projectId: { in: [projectId, otherProjectId] } } } })
    await prisma.auditLog.deleteMany({ where: { userId: { in: [adminId, pmId, otherPmId] } } })
    await prisma.bill.deleteMany({ where: { projectId: { in: [projectId, otherProjectId] } } })
    await prisma.projectVendorAssignment.deleteMany({ where: { projectId: { in: [projectId, otherProjectId] } } })
    await prisma.vendor.delete({ where: { id: vendorId } })
    await prisma.project.deleteMany({ where: { id: { in: [projectId, otherProjectId] } } })
    await prisma.land.delete({ where: { id: landId } })
    await prisma.user.deleteMany({ where: { id: { in: [adminId, pmId, otherPmId] } } })
    await prisma.$disconnect()
  })

  it('manages vendors and historical project assignments', async () => {
    const created = await request(app).post('/api/v1/vendors').set(auth(adminToken)).send({
      name: `${marker} Service Vendor`, vendorType: 'SERVICE_PROVIDER',
    })
    expect(created.status).toBe(201)
    const createdId = created.body.data.id
    expect((await request(app).patch(`/api/v1/vendors/${createdId}`).set(auth(adminToken)).send({ phone: '123' })).status).toBe(200)
    expect((await request(app).get(`/api/v1/vendors/${createdId}`).set(auth(adminToken))).status).toBe(200)
    expect((await request(app).delete(`/api/v1/vendors/${createdId}`).set(auth(adminToken))).status).toBe(200)
    expect((await request(app).post(`/api/v1/projects/${projectId}/vendors/${vendorId}`).set(auth(pmToken))).status).toBe(201)
    expect((await request(app).post(`/api/v1/projects/${projectId}/vendors/${vendorId}`).set(auth(pmToken))).status).toBe(409)
    expect((await request(app).get(`/api/v1/projects/${projectId}/vendors`).set(auth(pmToken))).body.data).toHaveLength(1)
    expect((await request(app).delete(`/api/v1/projects/${projectId}/vendors/${vendorId}`).set(auth(pmToken))).status).toBe(200)
    const vendorAudit = await prisma.auditLog.findFirst({ where: { entityType: 'Vendor', entityId: createdId, userId: adminId, action: 'CREATE' } })
    expect(vendorAudit?.action).toBe('CREATE')
    await prisma.vendor.delete({ where: { id: createdId } })
  })

  it('creates bills, rejects duplicate invoices, and enforces project access', async () => {
    const payload = {
      projectId, vendorId, billNumber: `${marker}-INV-1`, billDate: '2026-11-01',
      dueDate: '2026-11-30', category: 'MATERIAL', description: 'Cement', baseAmount: 100, gstPercent: 18,
    }
    const created = await request(app).post('/api/v1/bills').set(auth(pmToken)).send(payload)
    expect(created.status).toBe(201)
    billId = created.body.data.id
    expect(created.body.data.totalAmount).toBe('118')
    const dateBill = await request(app).post('/api/v1/bills').set(auth(pmToken)).send({
      ...payload,
      billNumber: `${marker}-INV-DATE`,
      billDate: '2026-11-05',
    })
    expect(dateBill.status).toBe(201)
    expect((await request(app).patch(`/api/v1/bills/${dateBill.body.data.id}`).set(auth(pmToken)).send({
      dueDate: '2026-11-04',
    })).status).toBe(400)
    expect((await request(app).post('/api/v1/bills').set(auth(pmToken)).send(payload)).status).toBe(409)
    expect((await request(app).get(`/api/v1/bills/${billId}`).set(auth(otherPmToken))).status).toBe(404)
    expect((await request(app).get('/api/v1/bills').set(auth(pmToken))).body.data[0].paidAmount).toBe(0)
  })

  it('approves bills, records partial and final payments, and prevents overpayment', async () => {
    expect((await request(app).post(`/api/v1/bills/${billId}/approve`).set(auth(adminToken))).status).toBe(200)
    const partial = await request(app).post(`/api/v1/bills/${billId}/payments`).set(auth(adminToken)).send({
      amount: 50, paymentDate: '2026-11-02', mode: 'BANK_TRANSFER', referenceNumber: 'UTR-1',
    })
    expect(partial.status).toBe(201)
    expect(partial.body.data.bill.status).toBe('PARTIALLY_PAID')
    expect(partial.body.data.bill.outstandingAmount).toBe(68)
    expect((await request(app).post(`/api/v1/bills/${billId}/payments`).set(auth(adminToken)).send({
      amount: 69, paymentDate: '2026-11-02', mode: 'BANK_TRANSFER',
    })).status).toBe(422)
    const final = await request(app).post(`/api/v1/bills/${billId}/payments`).set(auth(adminToken)).send({
      amount: 68, paymentDate: '2026-11-03', mode: 'BANK_TRANSFER',
    })
    expect(final.status).toBe(201)
    expect(final.body.data.bill.status).toBe('PAID')
    expect(final.body.data.bill.outstandingAmount).toBe(0)
    expect((await request(app).get(`/api/v1/bills/${billId}/payments?from=2026-11-02&to=2026-11-02`).set(auth(pmToken))).body.data).toHaveLength(1)
  })

  it('serializes concurrent payments against the same outstanding balance', async () => {
    const created = await request(app).post('/api/v1/bills').set(auth(pmToken)).send({
      projectId, vendorId, billNumber: `${marker}-INV-RACE`, billDate: '2026-11-01',
      category: 'SERVICES', baseAmount: 100, gstPercent: 0,
    })
    expect(created.status).toBe(201)
    const raceId = created.body.data.id
    expect((await request(app).post(`/api/v1/bills/${raceId}/approve`).set(auth(adminToken))).status).toBe(200)
    const results = await Promise.all([1, 2].map(() => request(app).post(`/api/v1/bills/${raceId}/payments`).set(auth(adminToken)).send({
      amount: 70, paymentDate: '2026-11-04', mode: 'BANK_TRANSFER',
    })))
    expect(results.filter((result) => result.status === 201)).toHaveLength(1)
    expect(results.filter((result) => result.status === 422)).toHaveLength(1)
  })

  it('returns expense and outstanding reports scoped to the PM project', async () => {
    const expenses = await request(app).get(`/api/v1/projects/${projectId}/expenses?from=2026-11-01&to=2026-11-30`).set(auth(pmToken))
    expect(expenses.status).toBe(200)
    expect(expenses.body.data).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: billId }),
    ]))
    const outstanding = await request(app).get('/api/v1/reports/vendor-outstanding').set(auth(pmToken))
    expect(outstanding.status).toBe(200)
    expect(outstanding.body.data).toEqual(expect.arrayContaining([expect.objectContaining({ vendorId })]))
    expect((await request(app).get(`/api/v1/projects/${otherProjectId}/expenses`).set(auth(pmToken))).status).toBe(404)
  })

  it('rolls back bill creation when the audit write fails', async () => {
    await prisma.$executeRawUnsafe(`
      CREATE OR REPLACE FUNCTION test_fail_bill_audit() RETURNS trigger AS $$
      BEGIN
        IF NEW.entity_type = 'Bill' THEN RAISE EXCEPTION 'forced bill audit failure'; END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `)
    await prisma.$executeRawUnsafe('CREATE TRIGGER test_bill_audit_failure BEFORE INSERT ON audit_logs FOR EACH ROW EXECUTE FUNCTION test_fail_bill_audit()')
    const number = `${marker}-ROLLBACK`
    const result = await request(app).post('/api/v1/bills').set(auth(pmToken)).send({
      projectId, vendorId, billNumber: number, billDate: '2026-11-04', category: 'SERVICES', baseAmount: 10, gstPercent: 0,
    })
    expect(result.status).toBe(500)
    expect(await prisma.bill.findUnique({ where: { vendorId_billNumber: { vendorId, billNumber: number } } })).toBeNull()
  })
})
