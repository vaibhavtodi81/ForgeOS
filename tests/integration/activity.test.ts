import { describe, test, expect, afterAll } from 'vitest'
import { GET as activityGET } from '@/app/api/projects/[id]/activity/route'
import { POST as milestonesPOST } from '@/app/api/projects/[id]/milestones/route'
import { POST as logsPOST } from '@/app/api/projects/[id]/daily-logs/route'
import { db } from '@/lib/db'
import {
  auth,
  P,
  loginAs,
  okBody,
  errBody,
  RUN_TAG,
  RIYA_EMAIL,
  AISHA_EMAIL,
  YASHMEEN_EMAIL,
  createProjectFixture,
} from '../helpers'

interface ActivityRow {
  id: string
  action: string
  entityType: string | null
  entityId: string | null
  userId: string | null
  userName: string | null
  oldData: unknown
  newData: unknown
  createdAt: string
}

const day = (offset: number) => new Date(Date.now() - offset * 86_400_000).toISOString().slice(0, 10)

const fixture = await createProjectFixture('act', { pmEmail: RIYA_EMAIL })
const yashProject = await db.project.findUniqueOrThrow({ where: { code: 'FOS-002' } })

// Generate audit rows tied to this project through the real routes.
const riyaSetup = await loginAs(RIYA_EMAIL)
const milestoneBody = await okBody<{ id: string }>(
  await milestonesPOST(
    auth(`/api/projects/${fixture.projectId}/milestones`, riyaSetup, {
      body: { name: `T8 Activity milestone ${RUN_TAG}`, sequence: 1, status: 'PLANNED', progressPercent: 0 },
    }),
    P(fixture.projectId)
  )
)
const logBody = await okBody<{ id: string }>(
  await logsPOST(
    auth(`/api/projects/${fixture.projectId}/daily-logs`, riyaSetup, {
      body: {
        logDate: day(1),
        progressPercent: 12,
        workSummary: `T8 activity log ${RUN_TAG}`,
        labourEntries: [{ trade: 'Masonry', headCount: 4, hoursWorked: 8 }],
      },
    }),
    P(fixture.projectId)
  )
)
const milestoneId = milestoneBody.data.id
const logId = logBody.data.id

afterAll(async () => {
  await fixture.dispose()
})

describe('GET /api/projects/:id/activity', () => {
  test('returns audit-backed rows for the project with parsed meta', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    const res = await activityGET(auth(`/api/projects/${fixture.projectId}/activity`, riya), P(fixture.projectId))
    const body = await okBody<ActivityRow[]>(res)
    expect(body.data.length).toBeGreaterThanOrEqual(2)

    const byAction = new Map(body.data.map((r) => [r.action, r]))
    expect(byAction.has('MILESTONE_CREATE')).toBe(true)
    expect(byAction.has('LOG_CREATE')).toBe(true)

    const msRow = byAction.get('MILESTONE_CREATE')!
    expect(msRow.entityId).toBe(milestoneId)
    expect(msRow.entityType).toBe('milestone')
    expect(msRow.userId).toBeTypeOf('string')
    expect(msRow.userName).toBeTypeOf('string')
    expect(msRow.oldData).toBeNull()
    // meta JSON string must be parsed into an object
    expect(msRow.newData).toBeTypeOf('object')

    const logRow = byAction.get('LOG_CREATE')!
    expect(logRow.entityId).toBe(logId)
    const meta = logRow.newData as { logDate?: string; progressPercent?: number; workSummary?: string }
    expect(meta.logDate).toBe(day(1))
    expect(meta.progressPercent).toBe(12)
    expect(meta.workSummary).toBe(`T8 activity log ${RUN_TAG}`)
  })

  test('pagination meta matches the DB row count', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    const res = await activityGET(auth(`/api/projects/${fixture.projectId}/activity?limit=1`, riya), P(fixture.projectId))
    const body = await okBody<ActivityRow[]>(res)
    expect(body.data.length).toBe(1)
    const meta = body.meta as { page: number; limit: number; total: number; totalPages: number }
    expect(meta.page).toBe(1)
    expect(meta.limit).toBe(1)
    expect(meta.totalPages).toBeGreaterThanOrEqual(2)
    const dbTotal = await db.auditLog.count({
      where: { OR: [{ projectId: fixture.projectId }, { entityId: fixture.projectId, entityType: 'project' }] },
    })
    expect(meta.total).toBe(dbTotal)
  })

  test('rows are ordered newest first', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    const body = await okBody<ActivityRow[]>(
      await activityGET(auth(`/api/projects/${fixture.projectId}/activity`, riya), P(fixture.projectId))
    )
    for (let i = 1; i < body.data.length; i++) {
      expect(body.data[i - 1].createdAt >= body.data[i].createdAt).toBe(true)
    }
  })

  test('PM scope: riya cannot read yashmeen project activity; yashmeen can read her own', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    const yash = await loginAs(YASHMEEN_EMAIL)
    await errBody(
      await activityGET(auth(`/api/projects/${yashProject.id}/activity`, riya), P(yashProject.id)),
      403
    )
    const own = await okBody<ActivityRow[]>(
      await activityGET(auth(`/api/projects/${yashProject.id}/activity`, yash), P(yashProject.id))
    )
    expect(own.data.length).toBeGreaterThan(0)
    // unknown project → 404
    await errBody(await activityGET(auth('/api/projects/nope/activity', riya), P('nope')), 404)
  })

  test('VIEWER may read any project activity', async () => {
    const viewer = await loginAs(AISHA_EMAIL)
    const body = await okBody<ActivityRow[]>(
      await activityGET(auth(`/api/projects/${fixture.projectId}/activity`, viewer), P(fixture.projectId))
    )
    expect(body.data.length).toBeGreaterThanOrEqual(2)
  })
})
