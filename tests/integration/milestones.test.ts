import { describe, test, expect, afterAll } from 'vitest'
import { GET as milestonesGET, POST as milestonesPOST } from '@/app/api/projects/[id]/milestones/route'
import { PATCH as milestonePATCH, DELETE as milestoneDELETE } from '@/app/api/milestones/[id]/route'
import { db } from '@/lib/db'
import {
  auth,
  P,
  loginAs,
  okBody,
  errBody,
  RUN_TAG,
  ADMIN_EMAIL,
  RIYA_EMAIL,
  AISHA_EMAIL,
  createProjectFixture,
} from '../helpers'

interface MilestoneRow {
  id: string
  projectId: string
  name: string
  description: string | null
  sequence: number
  status: string
  progressPercent: number
  plannedStartDate: string | null
  plannedEndDate: string | null
  actualStartDate: string | null
  actualEndDate: string | null
}

const fixture = await createProjectFixture('miles', { pmEmail: RIYA_EMAIL })
const yashProject = await db.project.findUniqueOrThrow({ where: { code: 'FOS-002' } })
const yashMilestone = await db.milestone.findFirstOrThrow({ where: { projectId: yashProject.id } })

let msA = '' // seq 2 — edited in PATCH tests
let msB = '' // seq 3
let msC = '' // seq 1 — deleted in DELETE tests

afterAll(async () => {
  await fixture.dispose()
})

describe('POST /api/projects/:id/milestones', () => {
  test('field validation → 400', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    const valid = { sequence: 1, status: 'PLANNED', progressPercent: 0 }
    await errBody(
      await milestonesPOST(
        auth(`/api/projects/${fixture.projectId}/milestones`, riya, { body: { ...valid, name: 'ab' } }),
        P(fixture.projectId)
      ),
      400
    )
    await errBody(
      await milestonesPOST(
        auth(`/api/projects/${fixture.projectId}/milestones`, riya, { body: { ...valid, name: 'Valid name', sequence: 0 } }),
        P(fixture.projectId)
      ),
      400
    )
    await errBody(
      await milestonesPOST(
        auth(`/api/projects/${fixture.projectId}/milestones`, riya, { body: { ...valid, name: 'Valid name', sequence: 1.5 } }),
        P(fixture.projectId)
      ),
      400
    )
    await errBody(
      await milestonesPOST(
        auth(`/api/projects/${fixture.projectId}/milestones`, riya, { body: { ...valid, name: 'Valid name', progressPercent: -1 } }),
        P(fixture.projectId)
      ),
      400
    )
    await errBody(
      await milestonesPOST(
        auth(`/api/projects/${fixture.projectId}/milestones`, riya, { body: { ...valid, name: 'Valid name', progressPercent: 101 } }),
        P(fixture.projectId)
      ),
      400
    )
    await errBody(
      await milestonesPOST(
        auth(`/api/projects/${fixture.projectId}/milestones`, riya, { body: { ...valid, name: 'Valid name', status: 'BOGUS' } }),
        P(fixture.projectId)
      ),
      400
    )
    await errBody(
      await milestonesPOST(
        auth(`/api/projects/${fixture.projectId}/milestones`, riya, {
          body: { ...valid, name: 'Valid name', plannedStartDate: '2026-01-10', plannedEndDate: '2026-01-01' },
        }),
        P(fixture.projectId)
      ),
      400
    )
    await errBody(
      await milestonesPOST(
        auth(`/api/projects/${fixture.projectId}/milestones`, riya, {
          body: { ...valid, name: 'Valid name', actualStartDate: '2026-02-10', actualEndDate: '2026-02-01' },
        }),
        P(fixture.projectId)
      ),
      400
    )
  })

  test('unknown project → 404; VIEWER cannot write; PM cannot write to another PM project', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    const viewer = await loginAs(AISHA_EMAIL)
    await errBody(
      await milestonesPOST(
        auth('/api/projects/nope/milestones', riya, { body: { name: 'Xyz', sequence: 1, status: 'PLANNED', progressPercent: 0 } }),
        P('nope')
      ),
      404
    )
    await errBody(
      await milestonesPOST(
        auth(`/api/projects/${fixture.projectId}/milestones`, viewer, {
          body: { name: 'Xyz', sequence: 1, status: 'PLANNED', progressPercent: 0 },
        }),
        P(fixture.projectId)
      ),
      403
    )
    await errBody(
      await milestonesPOST(
        auth(`/api/projects/${yashProject.id}/milestones`, riya, {
          body: { name: 'Xyz', sequence: 1, status: 'PLANNED', progressPercent: 0 },
        }),
        P(yashProject.id)
      ),
      403
    )
  })

  test('owning PM creates milestones with ISO dates + audit', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    const body = await okBody<MilestoneRow>(
      await milestonesPOST(
        auth(`/api/projects/${fixture.projectId}/milestones`, riya, {
          body: {
            name: `T8 Foundation ${RUN_TAG}`,
            description: 'first milestone',
            sequence: 2,
            status: 'PLANNED',
            progressPercent: 0,
            plannedStartDate: '2026-01-05',
            plannedEndDate: '2026-02-05',
          },
        }),
        P(fixture.projectId)
      )
    )
    msA = body.data.id
    expect(body.data.projectId).toBe(fixture.projectId)
    expect(body.data.status).toBe('PLANNED')
    expect(body.data.plannedStartDate).toBe('2026-01-05T00:00:00.000Z')
    expect(body.data.plannedEndDate).toBe('2026-02-05T00:00:00.000Z')
    expect(body.data.actualStartDate).toBeNull()
    const audit = await db.auditLog.findFirst({
      where: { action: 'MILESTONE_CREATE', entityId: msA },
      orderBy: { createdAt: 'desc' },
    })
    expect(audit?.projectId).toBe(fixture.projectId)

    const b = await okBody<MilestoneRow>(
      await milestonesPOST(
        auth(`/api/projects/${fixture.projectId}/milestones`, riya, {
          body: { name: `T8 Structure ${RUN_TAG}`, sequence: 3, status: 'PLANNED', progressPercent: 0 },
        }),
        P(fixture.projectId)
      )
    )
    msB = b.data.id
    const c = await okBody<MilestoneRow>(
      await milestonesPOST(
        auth(`/api/projects/${fixture.projectId}/milestones`, riya, {
          body: { name: `T8 Site prep ${RUN_TAG}`, sequence: 1, status: 'IN_PROGRESS', progressPercent: 10 },
        }),
        P(fixture.projectId)
      )
    )
    msC = c.data.id
  })
})

describe('GET /api/projects/:id/milestones', () => {
  test('lists the project milestones ordered by sequence; scoping enforced', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    const body = await okBody<MilestoneRow[]>(
      await milestonesGET(auth(`/api/projects/${fixture.projectId}/milestones`, riya), P(fixture.projectId))
    )
    const ids = body.data.map((m) => m.id)
    expect(ids).toEqual([msC, msA, msB]) // sequence 1, 2, 3
    expect(body.data.every((m) => m.projectId === fixture.projectId)).toBe(true)

    await errBody(
      await milestonesGET(auth(`/api/projects/${fixture.projectId}/milestones`, riya), P('nope')),
      404
    )
    // aisha is VIEWER — reads are allowed for any project
    await okBody(await milestonesGET(auth(`/api/projects/${fixture.projectId}/milestones`, await loginAs(AISHA_EMAIL)), P(fixture.projectId)))
  })
})

describe('PATCH /api/milestones/:id', () => {
  test('updates status/progress/dates and audits MILESTONE_UPDATE', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    const body = await okBody<MilestoneRow>(
      await milestonePATCH(
        auth(`/api/milestones/${msA}`, riya, {
          method: 'PATCH',
          body: { status: 'IN_PROGRESS', progressPercent: 40, actualStartDate: '2026-01-06', description: 'underway' },
        }),
        P(msA)
      )
    )
    expect(body.data.status).toBe('IN_PROGRESS')
    expect(body.data.progressPercent).toBe(40)
    expect(body.data.actualStartDate).toBe('2026-01-06T00:00:00.000Z')
    const dbRow = await db.milestone.findUniqueOrThrow({ where: { id: msA } })
    expect(dbRow.progressPercent).toBe(40)
    const audit = await db.auditLog.findFirst({
      where: { action: 'MILESTONE_UPDATE', entityId: msA },
      orderBy: { createdAt: 'desc' },
    })
    expect(audit).toBeTruthy()
  })

  test('can clear dates to null', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    const body = await okBody<MilestoneRow>(
      await milestonePATCH(
        auth(`/api/milestones/${msA}`, riya, { method: 'PATCH', body: { actualStartDate: null } }),
        P(msA)
      )
    )
    expect(body.data.actualStartDate).toBeNull()
  })

  test('validation → 400 (name, status, sequence, progress, dates, end-before-start)', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    await errBody(await milestonePATCH(auth(`/api/milestones/${msA}`, riya, { method: 'PATCH', body: { name: 'ab' } }), P(msA)), 400)
    await errBody(await milestonePATCH(auth(`/api/milestones/${msA}`, riya, { method: 'PATCH', body: { status: 'NOPE' } }), P(msA)), 400)
    await errBody(await milestonePATCH(auth(`/api/milestones/${msA}`, riya, { method: 'PATCH', body: { sequence: 0 } }), P(msA)), 400)
    await errBody(
      await milestonePATCH(auth(`/api/milestones/${msA}`, riya, { method: 'PATCH', body: { progressPercent: 200 } }), P(msA)),
      400
    )
    await errBody(
      await milestonePATCH(auth(`/api/milestones/${msA}`, riya, { method: 'PATCH', body: { plannedStartDate: 'oops' } }), P(msA)),
      400
    )
    // planned start (2026-01-05) already has end 2026-02-05; pushing start past end fails
    await errBody(
      await milestonePATCH(
        auth(`/api/milestones/${msA}`, riya, { method: 'PATCH', body: { plannedStartDate: '2026-03-01' } }),
        P(msA)
      ),
      400
    )
    await errBody(await milestonePATCH(auth('/api/milestones/nope', riya, { method: 'PATCH', body: { name: 'Xyz' } }), P('nope')), 404)
  })

  test('PM cannot edit another PM milestone; ADMIN can edit any; VIEWER 403', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    const admin = await loginAs(ADMIN_EMAIL)
    const viewer = await loginAs(AISHA_EMAIL)
    await errBody(
      await milestonePATCH(
        auth(`/api/milestones/${yashMilestone.id}`, riya, { method: 'PATCH', body: { description: 'nope' } }),
        P(yashMilestone.id)
      ),
      403
    )
    await errBody(
      await milestonePATCH(auth(`/api/milestones/${msB}`, viewer, { method: 'PATCH', body: { description: 'nope' } }), P(msB)),
      403
    )
    await okBody(
      await milestonePATCH(auth(`/api/milestones/${msB}`, admin, { method: 'PATCH', body: { progressPercent: 15 } }), P(msB))
    )
  })
})

describe('DELETE /api/milestones/:id', () => {
  test('PM scoping → 403; unknown → 404', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    await errBody(
      await milestoneDELETE(auth(`/api/milestones/${yashMilestone.id}`, riya, { method: 'DELETE' }), P(yashMilestone.id)),
      403
    )
    await errBody(await milestoneDELETE(auth('/api/milestones/nope', riya, { method: 'DELETE' }), P('nope')), 404)
  })

  test('owning PM deletes; row gone; audit written', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    await okBody(await milestoneDELETE(auth(`/api/milestones/${msC}`, riya, { method: 'DELETE' }), P(msC)))
    expect(await db.milestone.findUnique({ where: { id: msC } })).toBeNull()
    const audit = await db.auditLog.findFirst({
      where: { action: 'MILESTONE_DELETE', entityId: msC },
      orderBy: { createdAt: 'desc' },
    })
    expect(audit).toBeTruthy()
    const remaining = await okBody<MilestoneRow[]>(
      await milestonesGET(auth(`/api/projects/${fixture.projectId}/milestones`, riya), P(fixture.projectId))
    )
    expect(remaining.data.map((m) => m.id).sort()).toEqual([msA, msB].sort())
  })
})
