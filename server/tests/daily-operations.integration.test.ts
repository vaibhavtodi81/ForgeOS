import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'
import { PrismaClient, Role } from '@prisma/client'
import { createApp } from '../src/app.js'
import { createAccessToken } from '../src/utils/jwt.js'

const integrationEnabled = (process.env.DATABASE_URL ?? '').includes(':55432/')
const describeIntegration = describe.skipIf(!integrationEnabled)
const prisma = new PrismaClient()
const app = createApp()
const marker = `integration-${Date.now()}`

let adminId: number
let pmId: number
let unassignedPmId: number
let landId: number
let projectId: number
let unassignedProjectId: number
let adminToken: string
let pmToken: string
let unassignedPmToken: string

function auth(token: string) {
  return { Authorization: `Bearer ${token}` }
}

function numberValue(value: unknown) {
  return Number(value)
}

async function createUser(name: string, role: Role) {
  return prisma.user.create({
    data: {
      name,
      email: `${name.toLowerCase().replaceAll(' ', '.')}@${marker}.test`,
      passwordHash: 'integration-only',
      role,
    },
  })
}

describeIntegration('Daily Site Operations PostgreSQL integration', () => {
  beforeAll(async () => {
    const admin = await createUser('Integration Admin', Role.ADMIN)
    const pm = await createUser('Integration PM', Role.PM)
    const unassignedPm = await createUser('Integration Unassigned PM', Role.PM)
    adminId = admin.id
    pmId = pm.id
    unassignedPmId = unassignedPm.id
    adminToken = createAccessToken(admin)
    pmToken = createAccessToken(pm)
    unassignedPmToken = createAccessToken(unassignedPm)

    const land = await prisma.land.create({ // Stores the result of creates a record in the land table in `land` for the next steps.
      data: {
        name: `${marker} Land`,
        city: 'Integration City',
        state: 'Integration State',
        areaValue: 1,
        areaUnit: 'ACRE',
        createdById: adminId,
      },
    })
    landId = land.id

    const project = await prisma.project.create({ // Stores the result of creates a record in the project table in `project` for the next steps.
      data: {
        landId,
        code: `${marker}-A`,
        name: `${marker} Assigned Project`,
        status: 'ACTIVE',
        assignedPmId: pmId,
        createdById: adminId,
      },
    })
    projectId = project.id

    const unassignedProject = await prisma.project.create({ // Stores the result of creates a record in the project table in `unassignedProject` for the next steps.
      data: {
        landId,
        code: `${marker}-U`,
        name: `${marker} Unassigned Project`,
        status: 'ACTIVE',
        assignedPmId: unassignedPmId,
        createdById: adminId,
      },
    })
    unassignedProjectId = unassignedProject.id
  })

  afterAll(async () => {
    await prisma.$executeRawUnsafe('DROP TRIGGER IF EXISTS test_daily_log_labour_failure ON labour_entries')
    await prisma.$executeRawUnsafe('DROP FUNCTION IF EXISTS test_fail_daily_log_labour()')
    await prisma.$executeRawUnsafe('DROP TRIGGER IF EXISTS test_milestone_audit_failure ON audit_logs')
    await prisma.$executeRawUnsafe('DROP FUNCTION IF EXISTS test_fail_milestone_audit()')
    await prisma.auditLog.deleteMany({ where: { userId: { in: [adminId, pmId, unassignedPmId] } } })
    await prisma.projectMilestone.deleteMany({ where: { projectId: { in: [projectId, unassignedProjectId] } } })
    await prisma.dailyLog.deleteMany({ where: { projectId: { in: [projectId, unassignedProjectId] } } })
    await prisma.project.deleteMany({ where: { id: { in: [projectId, unassignedProjectId] } } })
    await prisma.land.delete({ where: { id: landId } })
    await prisma.user.deleteMany({ where: { id: { in: [adminId, pmId, unassignedPmId] } } })
    await prisma.$disconnect()
  })

  it('creates, reads, updates, and deletes daily logs with nested entries', async () => {
    const create = await request(app)
      .post(`/api/v1/projects/${projectId}/daily-logs`)
      .set(auth(pmToken))
      .send({
        logDate: '2026-11-09',
        progressPercent: 20,
        workSummary: 'Foundation work',
        labourEntries: [{ trade: 'Mason', headCount: 4, hoursWorked: 8 }],
        machineryEntries: [{ machineName: 'Mixer', operatorName: 'Operator', hoursUsed: 3, fuelLitres: 5 }],
      })
    expect(create.status).toBe(201) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    const logId = create.body.data.id

    const detail = await request(app).get(`/api/v1/daily-logs/${logId}`).set(auth(pmToken))
    expect(detail.status).toBe(200) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(detail.body.data.labourEntries).toHaveLength(1) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(detail.body.data.machineryEntries).toHaveLength(1) // Asserts that the observed result matches the behavior this test is meant to guarantee.

    const update = await request(app)
      .patch(`/api/v1/daily-logs/${logId}`)
      .set(auth(pmToken))
      .send({
        progressPercent: 25,
        workSummary: 'Foundation updated',
        labourEntries: [{ trade: 'Helper', headCount: 6, hoursWorked: 7 }],
        machineryEntries: [{ machineName: 'Crane', hoursUsed: 4, fuelLitres: 2 }],
      })
    expect(update.status).toBe(200) // Asserts that the observed result matches the behavior this test is meant to guarantee.

    const list = await request(app).get(`/api/v1/projects/${projectId}/daily-logs`).set(auth(pmToken))
    expect(list.status).toBe(200) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(list.body.data[0].labourHeadCountTotal).toBe(6) // Asserts that the observed result matches the behavior this test is meant to guarantee.

    expect((await request(app).delete(`/api/v1/daily-logs/${logId}`).set(auth(pmToken))).status).toBe(403) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect((await request(app).delete(`/api/v1/daily-logs/${logId}`).set(auth(adminToken))).status).toBe(200) // Asserts that the observed result matches the behavior this test is meant to guarantee.
  })

  it('enforces access, date rules, duplicate dates, progress rules, and reporting APIs', async () => {
    const first = await request(app)
      .post(`/api/v1/projects/${projectId}/daily-logs`)
      .set(auth(adminToken))
      .send({
        logDate: '2026-11-08',
        progressPercent: 10,
        workSummary: 'Initial work',
        labourEntries: [
          { trade: 'Mason', headCount: 3, hoursWorked: 8 },
          { trade: 'Helper', headCount: 2, hoursWorked: 6 },
        ],
        machineryEntries: [{ machineName: 'Mixer', hoursUsed: 2, fuelLitres: 4 }],
      })
    expect(first.status).toBe(201) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    const logId = first.body.data.id

    expect((await request(app).post(`/api/v1/projects/${projectId}/daily-logs`).set(auth(pmToken)).send({ // Asserts that the observed result matches the behavior this test is meant to guarantee.
      logDate: '2026-11-08', progressPercent: 11, workSummary: 'Duplicate',
    })).status).toBe(409)
    expect((await request(app).post(`/api/v1/projects/${projectId}/daily-logs`).set(auth(pmToken)).send({ // Asserts that the observed result matches the behavior this test is meant to guarantee.
      logDate: '2026-11-12', progressPercent: 12, workSummary: 'Future',
    })).status).toBe(422)
    expect((await request(app).post(`/api/v1/projects/${projectId}/daily-logs`).set(auth(pmToken)).send({ // Asserts that the observed result matches the behavior this test is meant to guarantee.
      logDate: '2026-11-09', progressPercent: 5, workSummary: 'Regressing',
    })).status).toBe(422)
    expect((await request(app).get(`/api/v1/projects/${unassignedProjectId}/daily-logs`).set(auth(pmToken))).status).toBe(403) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect((await request(app).get(`/api/v1/projects/${projectId}/summary`).set(auth(unassignedPmToken))).status).toBe(404) // Asserts that the observed result matches the behavior this test is meant to guarantee.

    const history = await request(app).get(`/api/v1/projects/${projectId}/progress-history`).set(auth(pmToken))
    expect(history.status).toBe(200) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(history.body.data).toEqual(expect.arrayContaining([expect.objectContaining({ id: logId })])) // Asserts that the observed result matches the behavior this test is meant to guarantee.

    const summary = await request(app).get(`/api/v1/projects/${projectId}/summary`).set(auth(adminToken))
    expect(summary.status).toBe(200) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(summary.body.data.totalLabourHeadCount).toBe(5) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(numberValue(summary.body.data.totalMachineryHours)).toBe(2) // Asserts that the observed result matches the behavior this test is meant to guarantee.

    const labour = await request(app).get(`/api/v1/projects/${projectId}/labour-summary`).set(auth(pmToken))
    const machinery = await request(app).get(`/api/v1/projects/${projectId}/machinery-summary`).set(auth(pmToken))
    const workerHistory = await request(app).get(`/api/v1/projects/${projectId}/worker-count-history`).set(auth(pmToken))
    const machineryHistory = await request(app).get(`/api/v1/projects/${projectId}/machinery-usage-history`).set(auth(pmToken))
    expect(labour.status).toBe(200) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(labour.body.data.totalWorkerCount).toBe(5) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(machinery.status).toBe(200) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(numberValue(machinery.body.data.totalMachineryHours)).toBe(2) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(workerHistory.status).toBe(200) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(workerHistory.body.data[0].totalWorkerCount).toBe(5) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(machineryHistory.status).toBe(200) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(machineryHistory.body.data[0].machineName).toBe('Mixer') // Asserts that the observed result matches the behavior this test is meant to guarantee.

    const activity = await request(app).get(`/api/v1/projects/${projectId}/activity`).set(auth(adminToken))
    expect(activity.status).toBe(200) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(activity.body.data).toEqual(expect.arrayContaining([ // Asserts that the observed result matches the behavior this test is meant to guarantee.
      expect.objectContaining({ entityType: 'DailyLog', entityId: logId }),
    ]))
  })

  it('enforces the PM 48-hour edit restriction', async () => {
    const created = await prisma.dailyLog.create({ // Stores the result of creates a record in the daily log table in `created` for the next steps.
      data: {
        projectId,
        logDate: new Date('2026-11-06T00:00:00.000Z'),
        progressPercent: 15,
        workSummary: 'Old log',
        createdById: adminId,
        createdAt: new Date(Date.now() - 49 * 60 * 60 * 1000),
      },
    })
    const response = await request(app)
      .patch(`/api/v1/daily-logs/${created.id}`)
      .set(auth(pmToken))
      .send({ workSummary: 'Too late' })
    expect(response.status).toBe(422) // Asserts that the observed result matches the behavior this test is meant to guarantee.
  })

  it('supports milestone CRUD, project scoping, and audit logging', async () => {
    const create = await request(app)
      .post(`/api/v1/projects/${projectId}/milestones`)
      .set(auth(pmToken))
      .send({
        name: 'Foundation',
        sequence: 1,
        plannedStartDate: '2026-11-01',
        plannedEndDate: '2026-11-30',
        progressPercent: 0,
      })
    expect(create.status).toBe(201) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    const milestoneId = create.body.data.id

    expect((await request(app).get(`/api/v1/projects/${projectId}/milestones`).set(auth(adminToken))).status).toBe(200) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect((await request(app).get(`/api/v1/milestones/${milestoneId}`).set(auth(pmToken))).status).toBe(200) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect((await request(app).patch(`/api/v1/milestones/${milestoneId}`).set(auth(pmToken)).send({ // Asserts that the observed result matches the behavior this test is meant to guarantee.
      progressPercent: 50, status: 'IN_PROGRESS',
    })).status).toBe(200)
    const activity = await request(app).get(`/api/v1/projects/${projectId}/activity`).set(auth(pmToken))
    expect(activity.body.data).toEqual(expect.arrayContaining([ // Asserts that the observed result matches the behavior this test is meant to guarantee.
      expect.objectContaining({ entityType: 'ProjectMilestone', entityId: milestoneId }),
    ]))
    expect((await request(app).delete(`/api/v1/milestones/${milestoneId}`).set(auth(adminToken))).status).toBe(200) // Asserts that the observed result matches the behavior this test is meant to guarantee.
  })

  it('rolls back nested daily-log writes when a child insert fails', async () => {
    await prisma.$executeRawUnsafe(`CREATE OR REPLACE FUNCTION test_fail_daily_log_labour()
      RETURNS trigger LANGUAGE plpgsql AS $$
      BEGIN RAISE EXCEPTION 'integration child failure'; END;
      $$`)
    await prisma.$executeRawUnsafe(`CREATE TRIGGER test_daily_log_labour_failure
      AFTER INSERT ON labour_entries
      FOR EACH ROW EXECUTE FUNCTION test_fail_daily_log_labour()`)
    try {
      const beforeAuditCount = await prisma.auditLog.count({ where: { userId: adminId, entityType: 'DailyLog' } }) // Counts the matching database records and stores the total in `beforeAuditCount` for pagination metadata.
      const response = await request(app)
        .post(`/api/v1/projects/${projectId}/daily-logs`)
        .set(auth(adminToken))
        .send({
          logDate: '2026-11-05',
          progressPercent: 5,
          workSummary: 'Should roll back',
          labourEntries: [{ trade: 'Mason', headCount: 1, hoursWorked: 1 }],
        })
      expect(response.status).toBe(500) // Asserts that the observed result matches the behavior this test is meant to guarantee.
      expect(await prisma.dailyLog.count({ where: { projectId, logDate: new Date('2026-11-05T00:00:00.000Z') } })).toBe(0) // Asserts that the observed result matches the behavior this test is meant to guarantee.
      expect(await prisma.auditLog.count({ where: { userId: adminId, entityType: 'DailyLog' } })).toBe(beforeAuditCount) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    } finally {
      await prisma.$executeRawUnsafe('DROP TRIGGER IF EXISTS test_daily_log_labour_failure ON labour_entries')
      await prisma.$executeRawUnsafe('DROP FUNCTION IF EXISTS test_fail_daily_log_labour()')
    }
  })

  it('rolls back milestone creation when audit logging fails', async () => {
    await prisma.$executeRawUnsafe(`CREATE OR REPLACE FUNCTION test_fail_milestone_audit()
      RETURNS trigger LANGUAGE plpgsql AS $$
      BEGIN
        IF NEW.entity_type = 'ProjectMilestone' THEN RAISE EXCEPTION 'integration audit failure'; END IF;
        RETURN NEW;
      END;
      $$`)
    await prisma.$executeRawUnsafe(`CREATE TRIGGER test_milestone_audit_failure
      BEFORE INSERT ON audit_logs
      FOR EACH ROW EXECUTE FUNCTION test_fail_milestone_audit()`)
    try {
      const response = await request(app)
        .post(`/api/v1/projects/${projectId}/milestones`)
        .set(auth(adminToken))
        .send({ name: 'Rollback milestone', sequence: 99 })
      expect(response.status).toBe(500) // Asserts that the observed result matches the behavior this test is meant to guarantee.
      expect(await prisma.projectMilestone.count({ where: { projectId, sequence: 99 } })).toBe(0) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    } finally {
      await prisma.$executeRawUnsafe('DROP TRIGGER IF EXISTS test_milestone_audit_failure ON audit_logs')
      await prisma.$executeRawUnsafe('DROP FUNCTION IF EXISTS test_fail_milestone_audit()')
    }
  })
})
