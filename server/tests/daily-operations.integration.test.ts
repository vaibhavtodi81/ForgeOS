import { afterAll, beforeAll, describe, expect, it } from 'vitest' // Imports test-runner helpers for defining and checking this behavior.
import request from 'supertest' // Imports an HTTP test client so API routes can be exercised without a browser.
import { PrismaClient, Role } from '@prisma/client' // Uses Prisma's generated types and client to work safely with database records.
import { createApp } from '../src/app.js' // Imports { createApp } from '../src/app.js' so this module can reuse that functionality.
import { createAccessToken } from '../src/utils/jwt.js' // Uses JWT helpers to create or verify signed authentication tokens.

const integrationEnabled = (process.env.DATABASE_URL ?? '').includes(':55432/') // Stores this intermediate `integration enabled` value so later lines can use it.
const describeIntegration = describe.skipIf(!integrationEnabled) // Stores this intermediate `describe integration` value so later lines can use it.
const prisma = new PrismaClient() // Stores this intermediate `prisma` value so later lines can use it.
const app = createApp() // Stores this intermediate `app` value so later lines can use it.
const marker = `integration-${Date.now()}` // Stores this intermediate `marker` value so later lines can use it.

let adminId: number // Stores this intermediate `number` value so later lines can use it.
let pmId: number // Stores this intermediate `number` value so later lines can use it.
let unassignedPmId: number // Stores this intermediate `number` value so later lines can use it.
let landId: number // Stores this intermediate `number` value so later lines can use it.
let projectId: number // Stores this intermediate `number` value so later lines can use it.
let unassignedProjectId: number // Stores this intermediate `number` value so later lines can use it.
let adminToken: string // Stores this intermediate `string` value so later lines can use it.
let pmToken: string // Stores this intermediate `string` value so later lines can use it.
let unassignedPmToken: string // Stores this intermediate `string` value so later lines can use it.

function auth(token: string) { // Defines `auth` to auth, keeping this behavior reusable.
  return { Authorization: `Bearer ${token}` } // Returns the assembled result object so the caller receives the fields it needs.
} // Closes the current block and marks where its grouped work ends.

function numberValue(value: unknown) { // Defines `numberValue` to number value, keeping this behavior reusable.
  return Number(value) // Returns `Number(value)` to the caller so the next layer can use the result.
} // Closes the current block and marks where its grouped work ends.

async function createUser(name: string, role: Role) { // Defines `createUser` to create user, keeping this behavior reusable.
  return prisma.user.create({ // Returns the database result to the route handler so it can form the API response.
    data: { // Sets `data` to the values to write to the database.
      name, // Separates this argument or property from the next item in the surrounding call or object.
      email: `${name.toLowerCase().replaceAll(' ', '.')}@${marker}.test`, // Separates this argument or property from the next item in the surrounding call or object.
      passwordHash: 'integration-only', // Separates this argument or property from the next item in the surrounding call or object.
      role, // Separates this argument or property from the next item in the surrounding call or object.
    }, // Closes the current call, object, or collection so the surrounding expression can continue.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
} // Closes the current block and marks where its grouped work ends.

describeIntegration('Daily Site Operations PostgreSQL integration', () => { // Opens the function, callback, or control-flow block that groups the related statements.
  beforeAll(async () => { // Opens the function, callback, or control-flow block that groups the related statements.
    const admin = await createUser('Integration Admin', Role.ADMIN) // Stores this intermediate `admin` value so later lines can use it.
    const pm = await createUser('Integration PM', Role.PM) // Stores this intermediate `pm` value so later lines can use it.
    const unassignedPm = await createUser('Integration Unassigned PM', Role.PM) // Stores this intermediate `unassigned pm` value so later lines can use it.
    adminId = admin.id // Provides `adminId = admin.id` as part of create user.
    pmId = pm.id // Provides `pmId = pm.id` as part of create user.
    unassignedPmId = unassignedPm.id // Provides `unassignedPmId = unassignedPm.id` as part of create user.
    adminToken = createAccessToken(admin) // Provides `adminToken = createAccessToken(admin)` as part of create user.
    pmToken = createAccessToken(pm) // Provides `pmToken = createAccessToken(pm)` as part of create user.
    unassignedPmToken = createAccessToken(unassignedPm) // Provides `unassignedPmToken = createAccessToken(unassignedPm)` as part of create user.

    const land = await prisma.land.create({ // Stores the result of creates a record in the land table in `land` for the next steps.
      data: { // Sets `data` to the values to write to the database.
        name: `${marker} Land`, // Separates this argument or property from the next item in the surrounding call or object.
        city: 'Integration City', // Separates this argument or property from the next item in the surrounding call or object.
        state: 'Integration State', // Separates this argument or property from the next item in the surrounding call or object.
        areaValue: 1, // Separates this argument or property from the next item in the surrounding call or object.
        areaUnit: 'ACRE', // Separates this argument or property from the next item in the surrounding call or object.
        createdById: adminId, // Separates this argument or property from the next item in the surrounding call or object.
      }, // Closes the current call, object, or collection so the surrounding expression can continue.
    }) // Closes the current call, object, or collection so the surrounding expression can continue.
    landId = land.id // Provides `landId = land.id` as part of create user.

    const project = await prisma.project.create({ // Stores the result of creates a record in the project table in `project` for the next steps.
      data: { // Sets `data` to the values to write to the database.
        landId, // Separates this argument or property from the next item in the surrounding call or object.
        code: `${marker}-A`, // Separates this argument or property from the next item in the surrounding call or object.
        name: `${marker} Assigned Project`, // Separates this argument or property from the next item in the surrounding call or object.
        status: 'ACTIVE', // Separates this argument or property from the next item in the surrounding call or object.
        assignedPmId: pmId, // Separates this argument or property from the next item in the surrounding call or object.
        createdById: adminId, // Separates this argument or property from the next item in the surrounding call or object.
      }, // Closes the current call, object, or collection so the surrounding expression can continue.
    }) // Closes the current call, object, or collection so the surrounding expression can continue.
    projectId = project.id // Provides `projectId = project.id` as part of create user.

    const unassignedProject = await prisma.project.create({ // Stores the result of creates a record in the project table in `unassignedProject` for the next steps.
      data: { // Sets `data` to the values to write to the database.
        landId, // Separates this argument or property from the next item in the surrounding call or object.
        code: `${marker}-U`, // Separates this argument or property from the next item in the surrounding call or object.
        name: `${marker} Unassigned Project`, // Separates this argument or property from the next item in the surrounding call or object.
        status: 'ACTIVE', // Separates this argument or property from the next item in the surrounding call or object.
        assignedPmId: unassignedPmId, // Separates this argument or property from the next item in the surrounding call or object.
        createdById: adminId, // Separates this argument or property from the next item in the surrounding call or object.
      }, // Closes the current call, object, or collection so the surrounding expression can continue.
    }) // Closes the current call, object, or collection so the surrounding expression can continue.
    unassignedProjectId = unassignedProject.id // Provides `unassignedProjectId = unassignedProject.id` as part of create user.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.

  afterAll(async () => { // Opens the function, callback, or control-flow block that groups the related statements.
    await prisma.$executeRawUnsafe('DROP TRIGGER IF EXISTS test_daily_log_labour_failure ON labour_entries') // Waits for this asynchronous operation to finish before using its result.
    await prisma.$executeRawUnsafe('DROP FUNCTION IF EXISTS test_fail_daily_log_labour()') // Waits for this asynchronous operation to finish before using its result.
    await prisma.$executeRawUnsafe('DROP TRIGGER IF EXISTS test_milestone_audit_failure ON audit_logs') // Waits for this asynchronous operation to finish before using its result.
    await prisma.$executeRawUnsafe('DROP FUNCTION IF EXISTS test_fail_milestone_audit()') // Waits for this asynchronous operation to finish before using its result.
    await prisma.auditLog.deleteMany({ where: { userId: { in: [adminId, pmId, unassignedPmId] } } }) // Waits for the database to deletes matching records in the audit log table before dependent work continues.
    await prisma.projectMilestone.deleteMany({ where: { projectId: { in: [projectId, unassignedProjectId] } } }) // Waits for the database to deletes matching records in the project milestone table before dependent work continues.
    await prisma.dailyLog.deleteMany({ where: { projectId: { in: [projectId, unassignedProjectId] } } }) // Waits for the database to deletes matching records in the daily log table before dependent work continues.
    await prisma.project.deleteMany({ where: { id: { in: [projectId, unassignedProjectId] } } }) // Waits for the database to deletes matching records in the project table before dependent work continues.
    await prisma.land.delete({ where: { id: landId } }) // Waits for the database to deletes a record in the land table before dependent work continues.
    await prisma.user.deleteMany({ where: { id: { in: [adminId, pmId, unassignedPmId] } } }) // Waits for the database to deletes matching records in the user table before dependent work continues.
    await prisma.$disconnect() // Waits for this asynchronous operation to finish before using its result.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.

  it('creates, reads, updates, and deletes daily logs with nested entries', async () => { // Opens the function, callback, or control-flow block that groups the related statements.
    const create = await request(app) // Stores this intermediate `create` value so later lines can use it.
      .post(`/api/v1/projects/${projectId}/daily-logs`) // Provides `.post(`/api/v1/projects/${projectId}/daily-logs`)` as part of create user.
      .set(auth(pmToken)) // Provides `.set(auth(pmToken))` as part of create user.
      .send({ // Opens the object or callback body that groups the settings for this operation.
        logDate: '2026-11-09', // Separates this argument or property from the next item in the surrounding call or object.
        progressPercent: 20, // Separates this argument or property from the next item in the surrounding call or object.
        workSummary: 'Foundation work', // Separates this argument or property from the next item in the surrounding call or object.
        labourEntries: [{ trade: 'Mason', headCount: 4, hoursWorked: 8 }], // Separates this argument or property from the next item in the surrounding call or object.
        machineryEntries: [{ machineName: 'Mixer', operatorName: 'Operator', hoursUsed: 3, fuelLitres: 5 }], // Separates this argument or property from the next item in the surrounding call or object.
      }) // Closes the current call, object, or collection so the surrounding expression can continue.
    expect(create.status).toBe(201) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    const logId = create.body.data.id // Stores this intermediate `log id` value so later lines can use it.

    const detail = await request(app).get(`/api/v1/daily-logs/${logId}`).set(auth(pmToken)) // Stores this intermediate `detail` value so later lines can use it.
    expect(detail.status).toBe(200) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(detail.body.data.labourEntries).toHaveLength(1) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(detail.body.data.machineryEntries).toHaveLength(1) // Asserts that the observed result matches the behavior this test is meant to guarantee.

    const update = await request(app) // Stores this intermediate `update` value so later lines can use it.
      .patch(`/api/v1/daily-logs/${logId}`) // Provides `.patch(`/api/v1/daily-logs/${logId}`)` as part of create user.
      .set(auth(pmToken)) // Provides `.set(auth(pmToken))` as part of create user.
      .send({ // Opens the object or callback body that groups the settings for this operation.
        progressPercent: 25, // Separates this argument or property from the next item in the surrounding call or object.
        workSummary: 'Foundation updated', // Separates this argument or property from the next item in the surrounding call or object.
        labourEntries: [{ trade: 'Helper', headCount: 6, hoursWorked: 7 }], // Separates this argument or property from the next item in the surrounding call or object.
        machineryEntries: [{ machineName: 'Crane', hoursUsed: 4, fuelLitres: 2 }], // Separates this argument or property from the next item in the surrounding call or object.
      }) // Closes the current call, object, or collection so the surrounding expression can continue.
    expect(update.status).toBe(200) // Asserts that the observed result matches the behavior this test is meant to guarantee.

    const list = await request(app).get(`/api/v1/projects/${projectId}/daily-logs`).set(auth(pmToken)) // Stores this intermediate `list` value so later lines can use it.
    expect(list.status).toBe(200) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(list.body.data[0].labourHeadCountTotal).toBe(6) // Asserts that the observed result matches the behavior this test is meant to guarantee.

    expect((await request(app).delete(`/api/v1/daily-logs/${logId}`).set(auth(pmToken))).status).toBe(403) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect((await request(app).delete(`/api/v1/daily-logs/${logId}`).set(auth(adminToken))).status).toBe(200) // Asserts that the observed result matches the behavior this test is meant to guarantee.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.

  it('enforces access, date rules, duplicate dates, progress rules, and reporting APIs', async () => { // Opens the function, callback, or control-flow block that groups the related statements.
    const first = await request(app) // Stores this intermediate `first` value so later lines can use it.
      .post(`/api/v1/projects/${projectId}/daily-logs`) // Provides `.post(`/api/v1/projects/${projectId}/daily-logs`)` as part of create user.
      .set(auth(adminToken)) // Provides `.set(auth(adminToken))` as part of create user.
      .send({ // Opens the object or callback body that groups the settings for this operation.
        logDate: '2026-11-08', // Separates this argument or property from the next item in the surrounding call or object.
        progressPercent: 10, // Separates this argument or property from the next item in the surrounding call or object.
        workSummary: 'Initial work', // Separates this argument or property from the next item in the surrounding call or object.
        labourEntries: [ // Sets `labourEntries` to the labour entries value.
          { trade: 'Mason', headCount: 3, hoursWorked: 8 }, // Separates this argument or property from the next item in the surrounding call or object.
          { trade: 'Helper', headCount: 2, hoursWorked: 6 }, // Separates this argument or property from the next item in the surrounding call or object.
        ], // Closes the current call, object, or collection so the surrounding expression can continue.
        machineryEntries: [{ machineName: 'Mixer', hoursUsed: 2, fuelLitres: 4 }], // Separates this argument or property from the next item in the surrounding call or object.
      }) // Closes the current call, object, or collection so the surrounding expression can continue.
    expect(first.status).toBe(201) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    const logId = first.body.data.id // Stores this intermediate `log id` value so later lines can use it.

    expect((await request(app).post(`/api/v1/projects/${projectId}/daily-logs`).set(auth(pmToken)).send({ // Asserts that the observed result matches the behavior this test is meant to guarantee.
      logDate: '2026-11-08', progressPercent: 11, workSummary: 'Duplicate', // Separates this argument or property from the next item in the surrounding call or object.
    })).status).toBe(409) // Provides `})).status).toBe(409)` as part of create user.
    expect((await request(app).post(`/api/v1/projects/${projectId}/daily-logs`).set(auth(pmToken)).send({ // Asserts that the observed result matches the behavior this test is meant to guarantee.
      logDate: '2026-11-12', progressPercent: 12, workSummary: 'Future', // Separates this argument or property from the next item in the surrounding call or object.
    })).status).toBe(422) // Provides `})).status).toBe(422)` as part of create user.
    expect((await request(app).post(`/api/v1/projects/${projectId}/daily-logs`).set(auth(pmToken)).send({ // Asserts that the observed result matches the behavior this test is meant to guarantee.
      logDate: '2026-11-09', progressPercent: 5, workSummary: 'Regressing', // Separates this argument or property from the next item in the surrounding call or object.
    })).status).toBe(422) // Provides `})).status).toBe(422)` as part of create user.
    expect((await request(app).get(`/api/v1/projects/${unassignedProjectId}/daily-logs`).set(auth(pmToken))).status).toBe(403) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect((await request(app).get(`/api/v1/projects/${projectId}/summary`).set(auth(unassignedPmToken))).status).toBe(404) // Asserts that the observed result matches the behavior this test is meant to guarantee.

    const history = await request(app).get(`/api/v1/projects/${projectId}/progress-history`).set(auth(pmToken)) // Stores this intermediate `history` value so later lines can use it.
    expect(history.status).toBe(200) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(history.body.data).toEqual(expect.arrayContaining([expect.objectContaining({ id: logId })])) // Asserts that the observed result matches the behavior this test is meant to guarantee.

    const summary = await request(app).get(`/api/v1/projects/${projectId}/summary`).set(auth(adminToken)) // Stores this intermediate `summary` value so later lines can use it.
    expect(summary.status).toBe(200) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(summary.body.data.totalLabourHeadCount).toBe(5) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(numberValue(summary.body.data.totalMachineryHours)).toBe(2) // Asserts that the observed result matches the behavior this test is meant to guarantee.

    const labour = await request(app).get(`/api/v1/projects/${projectId}/labour-summary`).set(auth(pmToken)) // Stores this intermediate `labour` value so later lines can use it.
    const machinery = await request(app).get(`/api/v1/projects/${projectId}/machinery-summary`).set(auth(pmToken)) // Stores this intermediate `machinery` value so later lines can use it.
    const workerHistory = await request(app).get(`/api/v1/projects/${projectId}/worker-count-history`).set(auth(pmToken)) // Stores this intermediate `worker history` value so later lines can use it.
    const machineryHistory = await request(app).get(`/api/v1/projects/${projectId}/machinery-usage-history`).set(auth(pmToken)) // Stores this intermediate `machinery history` value so later lines can use it.
    expect(labour.status).toBe(200) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(labour.body.data.totalWorkerCount).toBe(5) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(machinery.status).toBe(200) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(numberValue(machinery.body.data.totalMachineryHours)).toBe(2) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(workerHistory.status).toBe(200) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(workerHistory.body.data[0].totalWorkerCount).toBe(5) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(machineryHistory.status).toBe(200) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(machineryHistory.body.data[0].machineName).toBe('Mixer') // Asserts that the observed result matches the behavior this test is meant to guarantee.

    const activity = await request(app).get(`/api/v1/projects/${projectId}/activity`).set(auth(adminToken)) // Stores this intermediate `activity` value so later lines can use it.
    expect(activity.status).toBe(200) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(activity.body.data).toEqual(expect.arrayContaining([ // Asserts that the observed result matches the behavior this test is meant to guarantee.
      expect.objectContaining({ entityType: 'DailyLog', entityId: logId }), // Separates this argument or property from the next item in the surrounding call or object.
    ])) // Provides `]))` as part of create user.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.

  it('enforces the PM 48-hour edit restriction', async () => { // Opens the function, callback, or control-flow block that groups the related statements.
    const created = await prisma.dailyLog.create({ // Stores the result of creates a record in the daily log table in `created` for the next steps.
      data: { // Sets `data` to the values to write to the database.
        projectId, // Separates this argument or property from the next item in the surrounding call or object.
        logDate: new Date('2026-11-06T00:00:00.000Z'), // Separates this argument or property from the next item in the surrounding call or object.
        progressPercent: 15, // Separates this argument or property from the next item in the surrounding call or object.
        workSummary: 'Old log', // Separates this argument or property from the next item in the surrounding call or object.
        createdById: adminId, // Separates this argument or property from the next item in the surrounding call or object.
        createdAt: new Date(Date.now() - 49 * 60 * 60 * 1000), // Separates this argument or property from the next item in the surrounding call or object.
      }, // Closes the current call, object, or collection so the surrounding expression can continue.
    }) // Closes the current call, object, or collection so the surrounding expression can continue.
    const response = await request(app) // Stores this intermediate `response` value so later lines can use it.
      .patch(`/api/v1/daily-logs/${created.id}`) // Provides `.patch(`/api/v1/daily-logs/${created.id}`)` as part of create user.
      .set(auth(pmToken)) // Provides `.set(auth(pmToken))` as part of create user.
      .send({ workSummary: 'Too late' }) // Provides `.send({ workSummary: 'Too late' })` as part of create user.
    expect(response.status).toBe(422) // Asserts that the observed result matches the behavior this test is meant to guarantee.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.

  it('supports milestone CRUD, project scoping, and audit logging', async () => { // Opens the function, callback, or control-flow block that groups the related statements.
    const create = await request(app) // Stores this intermediate `create` value so later lines can use it.
      .post(`/api/v1/projects/${projectId}/milestones`) // Provides `.post(`/api/v1/projects/${projectId}/milestones`)` as part of create user.
      .set(auth(pmToken)) // Provides `.set(auth(pmToken))` as part of create user.
      .send({ // Opens the object or callback body that groups the settings for this operation.
        name: 'Foundation', // Separates this argument or property from the next item in the surrounding call or object.
        sequence: 1, // Separates this argument or property from the next item in the surrounding call or object.
        plannedStartDate: '2026-11-01', // Separates this argument or property from the next item in the surrounding call or object.
        plannedEndDate: '2026-11-30', // Separates this argument or property from the next item in the surrounding call or object.
        progressPercent: 0, // Separates this argument or property from the next item in the surrounding call or object.
      }) // Closes the current call, object, or collection so the surrounding expression can continue.
    expect(create.status).toBe(201) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    const milestoneId = create.body.data.id // Stores this intermediate `milestone id` value so later lines can use it.

    expect((await request(app).get(`/api/v1/projects/${projectId}/milestones`).set(auth(adminToken))).status).toBe(200) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect((await request(app).get(`/api/v1/milestones/${milestoneId}`).set(auth(pmToken))).status).toBe(200) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect((await request(app).patch(`/api/v1/milestones/${milestoneId}`).set(auth(pmToken)).send({ // Asserts that the observed result matches the behavior this test is meant to guarantee.
      progressPercent: 50, status: 'IN_PROGRESS', // Separates this argument or property from the next item in the surrounding call or object.
    })).status).toBe(200) // Provides `})).status).toBe(200)` as part of create user.
    const activity = await request(app).get(`/api/v1/projects/${projectId}/activity`).set(auth(pmToken)) // Stores this intermediate `activity` value so later lines can use it.
    expect(activity.body.data).toEqual(expect.arrayContaining([ // Asserts that the observed result matches the behavior this test is meant to guarantee.
      expect.objectContaining({ entityType: 'ProjectMilestone', entityId: milestoneId }), // Separates this argument or property from the next item in the surrounding call or object.
    ])) // Provides `]))` as part of create user.
    expect((await request(app).delete(`/api/v1/milestones/${milestoneId}`).set(auth(adminToken))).status).toBe(200) // Asserts that the observed result matches the behavior this test is meant to guarantee.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.

  it('rolls back nested daily-log writes when a child insert fails', async () => { // Opens the function, callback, or control-flow block that groups the related statements.
    await prisma.$executeRawUnsafe(`CREATE OR REPLACE FUNCTION test_fail_daily_log_labour()
      RETURNS trigger LANGUAGE plpgsql AS $$
      BEGIN RAISE EXCEPTION 'integration child failure'; END;
      $$`) // Provides `$$`)` as part of create user.
    await prisma.$executeRawUnsafe(`CREATE TRIGGER test_daily_log_labour_failure
      AFTER INSERT ON labour_entries
      FOR EACH ROW EXECUTE FUNCTION test_fail_daily_log_labour()`) // Provides `FOR EACH ROW EXECUTE FUNCTION test_fail_daily_log_labour()`)` as part of create user.
    try { // Starts a protected block so errors from the following operation can be handled.
      const beforeAuditCount = await prisma.auditLog.count({ where: { userId: adminId, entityType: 'DailyLog' } }) // Counts the matching database records and stores the total in `beforeAuditCount` for pagination metadata.
      const response = await request(app) // Stores this intermediate `response` value so later lines can use it.
        .post(`/api/v1/projects/${projectId}/daily-logs`) // Provides `.post(`/api/v1/projects/${projectId}/daily-logs`)` as part of create user.
        .set(auth(adminToken)) // Provides `.set(auth(adminToken))` as part of create user.
        .send({ // Opens the object or callback body that groups the settings for this operation.
          logDate: '2026-11-05', // Separates this argument or property from the next item in the surrounding call or object.
          progressPercent: 5, // Separates this argument or property from the next item in the surrounding call or object.
          workSummary: 'Should roll back', // Separates this argument or property from the next item in the surrounding call or object.
          labourEntries: [{ trade: 'Mason', headCount: 1, hoursWorked: 1 }], // Separates this argument or property from the next item in the surrounding call or object.
        }) // Closes the current call, object, or collection so the surrounding expression can continue.
      expect(response.status).toBe(500) // Asserts that the observed result matches the behavior this test is meant to guarantee.
      expect(await prisma.dailyLog.count({ where: { projectId, logDate: new Date('2026-11-05T00:00:00.000Z') } })).toBe(0) // Asserts that the observed result matches the behavior this test is meant to guarantee.
      expect(await prisma.auditLog.count({ where: { userId: adminId, entityType: 'DailyLog' } })).toBe(beforeAuditCount) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    } finally { // Opens the object or callback body that groups the settings for this operation.
      await prisma.$executeRawUnsafe('DROP TRIGGER IF EXISTS test_daily_log_labour_failure ON labour_entries') // Waits for this asynchronous operation to finish before using its result.
      await prisma.$executeRawUnsafe('DROP FUNCTION IF EXISTS test_fail_daily_log_labour()') // Waits for this asynchronous operation to finish before using its result.
    } // Closes the current block and marks where its grouped work ends.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.

  it('rolls back milestone creation when audit logging fails', async () => { // Opens the function, callback, or control-flow block that groups the related statements.
    await prisma.$executeRawUnsafe(`CREATE OR REPLACE FUNCTION test_fail_milestone_audit()
      RETURNS trigger LANGUAGE plpgsql AS $$
      BEGIN
        IF NEW.entity_type = 'ProjectMilestone' THEN RAISE EXCEPTION 'integration audit failure'; END IF;
        RETURN NEW;
      END;
      $$`) // Provides `$$`)` as part of create user.
    await prisma.$executeRawUnsafe(`CREATE TRIGGER test_milestone_audit_failure
      BEFORE INSERT ON audit_logs
      FOR EACH ROW EXECUTE FUNCTION test_fail_milestone_audit()`) // Provides `FOR EACH ROW EXECUTE FUNCTION test_fail_milestone_audit()`)` as part of create user.
    try { // Starts a protected block so errors from the following operation can be handled.
      const response = await request(app) // Stores this intermediate `response` value so later lines can use it.
        .post(`/api/v1/projects/${projectId}/milestones`) // Provides `.post(`/api/v1/projects/${projectId}/milestones`)` as part of create user.
        .set(auth(adminToken)) // Provides `.set(auth(adminToken))` as part of create user.
        .send({ name: 'Rollback milestone', sequence: 99 }) // Provides `.send({ name: 'Rollback milestone', sequence: 99 })` as part of create user.
      expect(response.status).toBe(500) // Asserts that the observed result matches the behavior this test is meant to guarantee.
      expect(await prisma.projectMilestone.count({ where: { projectId, sequence: 99 } })).toBe(0) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    } finally { // Opens the object or callback body that groups the settings for this operation.
      await prisma.$executeRawUnsafe('DROP TRIGGER IF EXISTS test_milestone_audit_failure ON audit_logs') // Waits for this asynchronous operation to finish before using its result.
      await prisma.$executeRawUnsafe('DROP FUNCTION IF EXISTS test_fail_milestone_audit()') // Waits for this asynchronous operation to finish before using its result.
    } // Closes the current block and marks where its grouped work ends.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
}) // Closes the current call, object, or collection so the surrounding expression can continue.
// File purpose: Checks expected behavior for daily operations.integration.test using the project test runner.
