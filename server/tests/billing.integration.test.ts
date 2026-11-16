import { afterAll, beforeAll, describe, expect, it } from 'vitest' // Imports test-runner helpers for defining and checking this behavior.
import request from 'supertest' // Imports an HTTP test client so API routes can be exercised without a browser.
import { PrismaClient, Role } from '@prisma/client' // Uses Prisma's generated types and client to work safely with database records.
import { createApp } from '../src/app.js' // Imports { createApp } from '../src/app.js' so this module can reuse that functionality.
import { createAccessToken } from '../src/utils/jwt.js' // Uses JWT helpers to create or verify signed authentication tokens.

const enabled = (process.env.DATABASE_URL ?? '').includes(':55432/') // Stores this intermediate `enabled` value so later lines can use it.
const describeIntegration = describe.skipIf(!enabled) // Stores this intermediate `describe integration` value so later lines can use it.
const prisma = new PrismaClient() // Stores this intermediate `prisma` value so later lines can use it.
const app = createApp() // Stores this intermediate `app` value so later lines can use it.
const marker = `billing-${Date.now()}` // Stores this intermediate `marker` value so later lines can use it.
let adminId: number // Stores this intermediate `number` value so later lines can use it.
let pmId: number // Stores this intermediate `number` value so later lines can use it.
let otherPmId: number // Stores this intermediate `number` value so later lines can use it.
let landId: number // Stores this intermediate `number` value so later lines can use it.
let projectId: number // Stores this intermediate `number` value so later lines can use it.
let otherProjectId: number // Stores this intermediate `number` value so later lines can use it.
let vendorId: number // Stores this intermediate `number` value so later lines can use it.
let billId: number // Stores this intermediate `number` value so later lines can use it.
let adminToken: string // Stores this intermediate `string` value so later lines can use it.
let pmToken: string // Stores this intermediate `string` value so later lines can use it.
let otherPmToken: string // Stores this intermediate `string` value so later lines can use it.

const auth = (token: string) => ({ Authorization: `Bearer ${token}` }) // Stores this intermediate `auth` value so later lines can use it.

describeIntegration('Vendors, billing and payments PostgreSQL integration', () => { // Opens the function, callback, or control-flow block that groups the related statements.
  beforeAll(async () => { // Opens the function, callback, or control-flow block that groups the related statements.
    const [admin, pm, otherPm] = await Promise.all([ // Stores this intermediate `other pm` value so later lines can use it.
      prisma.user.create({ data: { name: `${marker} Admin`, email: `admin@${marker}.test`, passwordHash: 'test', role: Role.ADMIN } }), // Separates this argument or property from the next item in the surrounding call or object.
      prisma.user.create({ data: { name: `${marker} PM`, email: `pm@${marker}.test`, passwordHash: 'test', role: Role.PM } }), // Separates this argument or property from the next item in the surrounding call or object.
      prisma.user.create({ data: { name: `${marker} Other`, email: `other@${marker}.test`, passwordHash: 'test', role: Role.PM } }), // Separates this argument or property from the next item in the surrounding call or object.
    ]) // Closes the current call, object, or collection so the surrounding expression can continue.
    adminId = admin.id; pmId = pm.id; otherPmId = otherPm.id // Provides `adminId = admin.id; pmId = pm.id; otherPmId = otherPm.id` as part of this server module.
    adminToken = createAccessToken(admin); pmToken = createAccessToken(pm); otherPmToken = createAccessToken(otherPm) // Provides `adminToken = createAccessToken(admin); pmToken = createAccessToken(pm); otherPmToken = createAccessToken(otherPm)` as part of this server module.
    const land = await prisma.land.create({ data: { name: `${marker} Land`, city: 'Billing City', state: 'Billing State', areaValue: 1, areaUnit: 'ACRE', createdById: adminId } }) // Stores the result of creates a record in the land table in `land` for the next steps.
    landId = land.id // Provides `landId = land.id` as part of this server module.
    const project = await prisma.project.create({ data: { landId, code: `${marker}-A`, name: `${marker} Project`, status: 'ACTIVE', assignedPmId: pmId, createdById: adminId } }) // Stores the result of creates a record in the project table in `project` for the next steps.
    const otherProject = await prisma.project.create({ data: { landId, code: `${marker}-B`, name: `${marker} Other`, status: 'ACTIVE', assignedPmId: otherPmId, createdById: adminId } }) // Stores the result of creates a record in the project table in `otherProject` for the next steps.
    projectId = project.id; otherProjectId = otherProject.id // Provides `projectId = project.id; otherProjectId = otherProject.id` as part of this server module.
    const vendor = await prisma.vendor.create({ data: { name: `${marker} Vendor`, vendorType: 'MATERIAL_SUPPLIER', gstin: '06ABCDE1234F1Z5', contactPerson: 'Test Contact' } }) // Stores the result of creates a record in the vendor table in `vendor` for the next steps.
    vendorId = vendor.id // Provides `vendorId = vendor.id` as part of this server module.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.

  afterAll(async () => { // Opens the function, callback, or control-flow block that groups the related statements.
    await prisma.$executeRawUnsafe('DROP TRIGGER IF EXISTS test_bill_audit_failure ON audit_logs') // Waits for this asynchronous operation to finish before using its result.
    await prisma.$executeRawUnsafe('DROP FUNCTION IF EXISTS test_fail_bill_audit()') // Waits for this asynchronous operation to finish before using its result.
    if (billId) await prisma.payment.deleteMany({ where: { billId } }) // Checks whether the supplied values meet this condition; the block handles that case before continuing.
    await prisma.payment.deleteMany({ where: { bill: { projectId: { in: [projectId, otherProjectId] } } } }) // Waits for the database to deletes matching records in the payment table before dependent work continues.
    await prisma.auditLog.deleteMany({ where: { userId: { in: [adminId, pmId, otherPmId] } } }) // Waits for the database to deletes matching records in the audit log table before dependent work continues.
    await prisma.bill.deleteMany({ where: { projectId: { in: [projectId, otherProjectId] } } }) // Waits for the database to deletes matching records in the bill table before dependent work continues.
    await prisma.projectVendorAssignment.deleteMany({ where: { projectId: { in: [projectId, otherProjectId] } } }) // Waits for the database to deletes matching records in the project vendor assignment table before dependent work continues.
    await prisma.vendor.delete({ where: { id: vendorId } }) // Waits for the database to deletes a record in the vendor table before dependent work continues.
    await prisma.project.deleteMany({ where: { id: { in: [projectId, otherProjectId] } } }) // Waits for the database to deletes matching records in the project table before dependent work continues.
    await prisma.land.delete({ where: { id: landId } }) // Waits for the database to deletes a record in the land table before dependent work continues.
    await prisma.user.deleteMany({ where: { id: { in: [adminId, pmId, otherPmId] } } }) // Waits for the database to deletes matching records in the user table before dependent work continues.
    await prisma.$disconnect() // Waits for this asynchronous operation to finish before using its result.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.

  it('manages vendors and historical project assignments', async () => { // Opens the function, callback, or control-flow block that groups the related statements.
    const created = await request(app).post('/api/v1/vendors').set(auth(adminToken)).send({ // Stores this intermediate `created` value so later lines can use it.
      name: `${marker} Service Vendor`, vendorType: 'SERVICE_PROVIDER', // Separates this argument or property from the next item in the surrounding call or object.
    }) // Closes the current call, object, or collection so the surrounding expression can continue.
    expect(created.status).toBe(201) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    const createdId = created.body.data.id // Stores this intermediate `created id` value so later lines can use it.
    expect((await request(app).patch(`/api/v1/vendors/${createdId}`).set(auth(adminToken)).send({ phone: '123' })).status).toBe(200) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect((await request(app).get(`/api/v1/vendors/${createdId}`).set(auth(adminToken))).status).toBe(200) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect((await request(app).delete(`/api/v1/vendors/${createdId}`).set(auth(adminToken))).status).toBe(200) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect((await request(app).post(`/api/v1/projects/${projectId}/vendors/${vendorId}`).set(auth(pmToken))).status).toBe(201) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect((await request(app).post(`/api/v1/projects/${projectId}/vendors/${vendorId}`).set(auth(pmToken))).status).toBe(409) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect((await request(app).get(`/api/v1/projects/${projectId}/vendors`).set(auth(pmToken))).body.data).toHaveLength(1) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect((await request(app).delete(`/api/v1/projects/${projectId}/vendors/${vendorId}`).set(auth(pmToken))).status).toBe(200) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    const vendorAudit = await prisma.auditLog.findFirst({ where: { entityType: 'Vendor', entityId: createdId, userId: adminId, action: 'CREATE' } }) // Looks up one matching database record and stores it in `vendorAudit` so its existence or values can be checked.
    expect(vendorAudit?.action).toBe('CREATE') // Asserts that the observed result matches the behavior this test is meant to guarantee.
    await prisma.vendor.delete({ where: { id: createdId } }) // Waits for the database to deletes a record in the vendor table before dependent work continues.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.

  it('creates bills, rejects duplicate invoices, and enforces project access', async () => { // Opens the function, callback, or control-flow block that groups the related statements.
    const payload = { // Stores this intermediate `payload` value so later lines can use it.
      projectId, vendorId, billNumber: `${marker}-INV-1`, billDate: '2026-11-01', // Separates this argument or property from the next item in the surrounding call or object.
      dueDate: '2026-11-30', category: 'MATERIAL', description: 'Cement', baseAmount: 100, gstPercent: 18, // Separates this argument or property from the next item in the surrounding call or object.
    } // Closes the current block and marks where its grouped work ends.
    const created = await request(app).post('/api/v1/bills').set(auth(pmToken)).send(payload) // Stores this intermediate `created` value so later lines can use it.
    expect(created.status).toBe(201) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    billId = created.body.data.id // Provides `billId = created.body.data.id` as part of this server module.
    expect(created.body.data.totalAmount).toBe('118') // Asserts that the observed result matches the behavior this test is meant to guarantee.
    const dateBill = await request(app).post('/api/v1/bills').set(auth(pmToken)).send({ // Stores this intermediate `date bill` value so later lines can use it.
      ...payload, // Separates this argument or property from the next item in the surrounding call or object.
      billNumber: `${marker}-INV-DATE`, // Separates this argument or property from the next item in the surrounding call or object.
      billDate: '2026-11-05', // Separates this argument or property from the next item in the surrounding call or object.
    }) // Closes the current call, object, or collection so the surrounding expression can continue.
    expect(dateBill.status).toBe(201) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect((await request(app).patch(`/api/v1/bills/${dateBill.body.data.id}`).set(auth(pmToken)).send({ // Asserts that the observed result matches the behavior this test is meant to guarantee.
      dueDate: '2026-11-04', // Separates this argument or property from the next item in the surrounding call or object.
    })).status).toBe(400) // Provides `})).status).toBe(400)` as part of this server module.
    expect((await request(app).post('/api/v1/bills').set(auth(pmToken)).send(payload)).status).toBe(409) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect((await request(app).get(`/api/v1/bills/${billId}`).set(auth(otherPmToken))).status).toBe(404) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect((await request(app).get('/api/v1/bills').set(auth(pmToken))).body.data[0].paidAmount).toBe(0) // Asserts that the observed result matches the behavior this test is meant to guarantee.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.

  it('approves bills, records partial and final payments, and prevents overpayment', async () => { // Opens the function, callback, or control-flow block that groups the related statements.
    expect((await request(app).post(`/api/v1/bills/${billId}/approve`).set(auth(adminToken))).status).toBe(200) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    const partial = await request(app).post(`/api/v1/bills/${billId}/payments`).set(auth(adminToken)).send({ // Stores this intermediate `partial` value so later lines can use it.
      amount: 50, paymentDate: '2026-11-02', mode: 'BANK_TRANSFER', referenceNumber: 'UTR-1', // Separates this argument or property from the next item in the surrounding call or object.
    }) // Closes the current call, object, or collection so the surrounding expression can continue.
    expect(partial.status).toBe(201) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(partial.body.data.bill.status).toBe('PARTIALLY_PAID') // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(partial.body.data.bill.outstandingAmount).toBe(68) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect((await request(app).post(`/api/v1/bills/${billId}/payments`).set(auth(adminToken)).send({ // Asserts that the observed result matches the behavior this test is meant to guarantee.
      amount: 69, paymentDate: '2026-11-02', mode: 'BANK_TRANSFER', // Separates this argument or property from the next item in the surrounding call or object.
    })).status).toBe(422) // Provides `})).status).toBe(422)` as part of this server module.
    const final = await request(app).post(`/api/v1/bills/${billId}/payments`).set(auth(adminToken)).send({ // Stores this intermediate `final` value so later lines can use it.
      amount: 68, paymentDate: '2026-11-03', mode: 'BANK_TRANSFER', // Separates this argument or property from the next item in the surrounding call or object.
    }) // Closes the current call, object, or collection so the surrounding expression can continue.
    expect(final.status).toBe(201) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(final.body.data.bill.status).toBe('PAID') // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(final.body.data.bill.outstandingAmount).toBe(0) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect((await request(app).get(`/api/v1/bills/${billId}/payments?from=2026-11-02&to=2026-11-02`).set(auth(pmToken))).body.data).toHaveLength(1) // Asserts that the observed result matches the behavior this test is meant to guarantee.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.

  it('serializes concurrent payments against the same outstanding balance', async () => { // Opens the function, callback, or control-flow block that groups the related statements.
    const created = await request(app).post('/api/v1/bills').set(auth(pmToken)).send({ // Stores this intermediate `created` value so later lines can use it.
      projectId, vendorId, billNumber: `${marker}-INV-RACE`, billDate: '2026-11-01', // Separates this argument or property from the next item in the surrounding call or object.
      category: 'SERVICES', baseAmount: 100, gstPercent: 0, // Separates this argument or property from the next item in the surrounding call or object.
    }) // Closes the current call, object, or collection so the surrounding expression can continue.
    expect(created.status).toBe(201) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    const raceId = created.body.data.id // Stores this intermediate `race id` value so later lines can use it.
    expect((await request(app).post(`/api/v1/bills/${raceId}/approve`).set(auth(adminToken))).status).toBe(200) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    const results = await Promise.all([1, 2].map(() => request(app).post(`/api/v1/bills/${raceId}/payments`).set(auth(adminToken)).send({ // Transforms the matching items into `results`, the shape needed by the caller.
      amount: 70, paymentDate: '2026-11-04', mode: 'BANK_TRANSFER', // Separates this argument or property from the next item in the surrounding call or object.
    }))) // Provides `})))` as part of this server module.
    expect(results.filter((result) => result.status === 201)).toHaveLength(1) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(results.filter((result) => result.status === 422)).toHaveLength(1) // Asserts that the observed result matches the behavior this test is meant to guarantee.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.

  it('returns expense and outstanding reports scoped to the PM project', async () => { // Opens the function, callback, or control-flow block that groups the related statements.
    const expenses = await request(app).get(`/api/v1/projects/${projectId}/expenses?from=2026-11-01&to=2026-11-30`).set(auth(pmToken)) // Stores this intermediate `expenses` value so later lines can use it.
    expect(expenses.status).toBe(200) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(expenses.body.data).toEqual(expect.arrayContaining([ // Asserts that the observed result matches the behavior this test is meant to guarantee.
      expect.objectContaining({ id: billId }), // Separates this argument or property from the next item in the surrounding call or object.
    ])) // Provides `]))` as part of this server module.
    const outstanding = await request(app).get('/api/v1/reports/vendor-outstanding').set(auth(pmToken)) // Stores this intermediate `outstanding` value so later lines can use it.
    expect(outstanding.status).toBe(200) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(outstanding.body.data).toEqual(expect.arrayContaining([expect.objectContaining({ vendorId })])) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect((await request(app).get(`/api/v1/projects/${otherProjectId}/expenses`).set(auth(pmToken))).status).toBe(404) // Asserts that the observed result matches the behavior this test is meant to guarantee.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.

  it('rolls back bill creation when the audit write fails', async () => { // Opens the function, callback, or control-flow block that groups the related statements.
    await prisma.$executeRawUnsafe(`
      CREATE OR REPLACE FUNCTION test_fail_bill_audit() RETURNS trigger AS $$
      BEGIN
        IF NEW.entity_type = 'Bill' THEN RAISE EXCEPTION 'forced bill audit failure'; END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `) // Provides ``)` as part of this server module.
    await prisma.$executeRawUnsafe('CREATE TRIGGER test_bill_audit_failure BEFORE INSERT ON audit_logs FOR EACH ROW EXECUTE FUNCTION test_fail_bill_audit()') // Waits for this asynchronous operation to finish before using its result.
    const number = `${marker}-ROLLBACK` // Stores this intermediate `number` value so later lines can use it.
    const result = await request(app).post('/api/v1/bills').set(auth(pmToken)).send({ // Stores this intermediate `result` value so later lines can use it.
      projectId, vendorId, billNumber: number, billDate: '2026-11-04', category: 'SERVICES', baseAmount: 10, gstPercent: 0, // Separates this argument or property from the next item in the surrounding call or object.
    }) // Closes the current call, object, or collection so the surrounding expression can continue.
    expect(result.status).toBe(500) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(await prisma.bill.findUnique({ where: { vendorId_billNumber: { vendorId, billNumber: number } } })).toBeNull() // Asserts that the observed result matches the behavior this test is meant to guarantee.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
}) // Closes the current call, object, or collection so the surrounding expression can continue.
// File purpose: Checks expected behavior for billing.integration.test using the project test runner.
