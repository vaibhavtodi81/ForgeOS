import { describe, test, expect, beforeAll, afterAll } from 'vitest'
import { GET as projectsGET, POST as projectsPOST } from '@/app/api/projects/route'
import { GET as projectGET, PUT as projectPUT, DELETE as projectDELETE } from '@/app/api/projects/[id]/route'
import { PATCH as statusPATCH } from '@/app/api/projects/[id]/status/route'
import { PATCH as assignPmPATCH } from '@/app/api/projects/[id]/assign-pm/route'
import { POST as landsPOST } from '@/app/api/lands/route'
import { db } from '@/lib/db'
import {
  req,
  auth,
  P,
  loginAs,
  okBody,
  errBody,
  RUN_TAG,
  ADMIN_EMAIL,
  RIYA_EMAIL,
  YASHMEEN_EMAIL,
  VINAYAK_EMAIL,
  ROHIT_EMAIL,
} from '../helpers'

let adminToken = ''
let riyaToken = ''
let riyaId = ''
let vinayakId = ''
let landId = ''
let projectId = ''

const landName = `T8 Proj Land ${RUN_TAG}`
const projName = `T8 Status Project ${RUN_TAG}`

beforeAll(async () => {
  adminToken = await loginAs(ADMIN_EMAIL)
  riyaToken = await loginAs(RIYA_EMAIL)
  riyaId = await db.user.findUniqueOrThrow({ where: { email: RIYA_EMAIL } }).then((u) => u.id)
  vinayakId = await db.user.findUniqueOrThrow({ where: { email: VINAYAK_EMAIL } }).then((u) => u.id)

  const land = await landsPOST(
    auth('/api/lands', adminToken, {
      body: { name: landName, city: 'Testville', state: 'Teststate', areaValue: 900, areaUnit: 'SQFT' },
    })
  )
  const landBody = await okBody<{ id: string }>(land)
  landId = landBody.data.id

  const created = await projectsPOST(
    auth('/api/projects', adminToken, {
      body: {
        name: projName,
        location: 'Testville',
        landId,
        totalBudget: 5_000_000,
        startDate: '2030-01-15',
        expectedEndDate: '2030-12-15',
        assignedPmId: vinayakId,
      },
    })
  )
  const createdBody = await okBody<{ project: { id: string; code: string; status: string } }>(created)
  projectId = createdBody.data.project.id
})

afterAll(async () => {
  await db.project.deleteMany({ where: { id: projectId } })
  await db.land.deleteMany({ where: { name: landName } })
})

describe('GET /api/projects', () => {
  test('admin sees all projects with pagination meta and full shape', async () => {
    const res = await projectsGET(auth('/api/projects?page=1&limit=3', adminToken))
    const body = await okBody<
      {
        id: string
        code: string
        name: string
        status: string
        totalBudget: number
        assignedPmId: string | null
        assignedPm: { id: string; name: string; email: string } | null
        land: { city: string; state: string } | null
        startDate: string | null
        expectedEndDate: string | null
      }[]
    >(res)
    expect(Array.isArray(body.data)).toBe(true)
    expect(body.data.length).toBeLessThanOrEqual(3)
    expect(body.meta).toMatchObject({ page: 1, pageSize: 3, limit: 3 })
    const meta = body.meta as { total: number; totalPages: number }
    expect(meta.total).toBeGreaterThanOrEqual(6)
    expect(meta.totalPages).toBe(Math.max(1, Math.ceil(meta.total / 3)))
    for (const row of body.data) {
      expect(row.code).toMatch(/^FOS-|T8-/)
      expect(typeof row.totalBudget).toBe('number')
      expect(row.assignedPm === null || typeof row.assignedPm.id === 'string').toBe(true)
      expect(row.land === null || typeof row.land.city === 'string').toBe(true)
    }
  })

  test('limit is capped at 100', async () => {
    const res = await projectsGET(auth('/api/projects?limit=999', adminToken))
    const body = await okBody<unknown[]>(res)
    expect((body.meta as { limit: number }).limit).toBe(100)
    expect(body.data.length).toBeLessThanOrEqual(100)
  })

  test('PM is force-scoped to own projects (riya sees only hers)', async () => {
    const res = await projectsGET(auth('/api/projects?limit=100', riyaToken))
    const body = await okBody<{ id: string; code: string; assignedPmId: string | null }[]>(res)
    expect(body.data.length).toBeGreaterThanOrEqual(3)
    for (const row of body.data) {
      expect(row.assignedPmId).toBe(riyaId)
    }
    const codes = body.data.map((r) => r.code)
    expect(codes).toContain('FOS-001') // Whitefield Villas
    expect(codes).toContain('FOS-003') // Powai Row Houses
    expect(codes).toContain('FOS-005') // Whitefield Phase 2
    expect(codes).not.toContain('FOS-002') // yashmeen's
    // the count matches the DB exactly
    const dbCount = await db.project.count({ where: { assignedPmId: riyaId } })
    expect(body.data.length).toBe(dbCount)
  })

  test('invalid status filter → 400', async () => {
    await errBody(await projectsGET(auth('/api/projects?status=BOGUS', adminToken)), 400)
  })

  test('search filters by name/code', async () => {
    const res = await projectsGET(auth('/api/projects?search=Kharadi', adminToken))
    const body = await okBody<{ name: string; code: string }[]>(res)
    expect(body.data.length).toBeGreaterThanOrEqual(2)
    for (const row of body.data) {
      expect(row.name.includes('Kharadi') || row.code.includes('Kharadi')).toBe(true)
    }
  })

  test('unauthenticated → 401', async () => {
    await errBody(await projectsGET(req('/api/projects')), 401)
  })
})

describe('GET /api/projects/:id', () => {
  test('returns a project with _count aggregates', async () => {
    const whitefield = await db.project.findUniqueOrThrow({ where: { code: 'FOS-001' } })
    const res = await projectGET(auth(`/api/projects/${whitefield.id}`, adminToken), P(whitefield.id))
    const body = await okBody<{ id: string; code: string; _count: Record<string, number> }>(res)
    expect(body.data.id).toBe(whitefield.id)
    expect(body.data._count).toBeTruthy()
    expect(Object.keys(body.data._count).sort()).toEqual(['invoices', 'logs', 'milestones', 'plans', 'transactions'])
  })

  test('PM cannot read another PM project → 403; unknown id → 404', async () => {
    const kharadi = await db.project.findUniqueOrThrow({ where: { code: 'FOS-002' } })
    await errBody(await projectGET(auth(`/api/projects/${kharadi.id}`, riyaToken), P(kharadi.id)), 403)
    await errBody(await projectGET(auth('/api/projects/does-not-exist', adminToken), P('does-not-exist')), 404)
  })
})

describe('POST /api/projects (validation + success)', () => {
  const base = {
    name: `T8 Validation Project ${RUN_TAG}`,
    landId: '',
    totalBudget: 1_000_000,
    startDate: '2030-02-01',
    expectedEndDate: '2030-08-01',
  }

  test('name < 3 chars → 400', async () => {
    await errBody(
      await projectsPOST(auth('/api/projects', adminToken, { body: { ...base, landId, name: 'ab' } })),
      400
    )
  })

  test('budget ≤ 0 → 400', async () => {
    await errBody(await projectsPOST(auth('/api/projects', adminToken, { body: { ...base, landId, totalBudget: 0 } })), 400)
    await errBody(await projectsPOST(auth('/api/projects', adminToken, { body: { ...base, landId, totalBudget: -5 } })), 400)
  })

  test('expectedEndDate ≤ startDate → 400', async () => {
    await errBody(
      await projectsPOST(auth('/api/projects', adminToken, { body: { ...base, landId, expectedEndDate: '2030-02-01' } })),
      400
    )
  })

  test('unknown land → 404; unknown PM → 400; bad start date → 400', async () => {
    await errBody(await projectsPOST(auth('/api/projects', adminToken, { body: { ...base, landId: 'nope' } })), 404)
    await errBody(
      await projectsPOST(auth('/api/projects', adminToken, { body: { ...base, landId, assignedPmId: 'nope' } })),
      400
    )
    await errBody(
      await projectsPOST(auth('/api/projects', adminToken, { body: { ...base, landId, startDate: '15/02/2030' } })),
      400
    )
  })

  test('PM cannot create projects → 403', async () => {
    await errBody(
      await projectsPOST(auth('/api/projects', riyaToken, { body: { ...base, landId } })),
      403
    )
  })

  test('success: FOS-xxx code auto-generated, status PLANNING, pm assigned', async () => {
    const res = await projectsPOST(
      auth('/api/projects', adminToken, {
        body: { ...base, landId, assignedPmId: vinayakId, wastageThresholdPct: 7, description: 'T8 created by tests' },
      })
    )
    const body = await okBody<{ project: { id: string; code: string; status: string; assignedPmId: string | null; wastageThresholdPct: number } }>(res)
    expect(body.data.project.code).toMatch(/^FOS-\d{3}$/)
    expect(body.data.project.status).toBe('PLANNING')
    expect(body.data.project.assignedPmId).toBe(vinayakId)
    expect(body.data.project.wastageThresholdPct).toBe(7)
    // cleanup
    await db.project.delete({ where: { id: body.data.project.id } })
  })
})

describe('PATCH /api/projects/:id/status (state machine)', () => {
  const set = async (status: string) =>
    statusPATCH(auth(`/api/projects/${projectId}/status`, adminToken, { body: { status } }), P(projectId))

  test('PLANNING → COMPLETED is rejected (must go through ACTIVE)', async () => {
    const body = await errBody(await set('COMPLETED'), 422)
    expect(body.message).toContain('Invalid status transition')
  })

  test('invalid status value → 400; unknown project → 404; PM cannot set status → 403', async () => {
    await errBody(await set('CANCELLED'), 400)
    await errBody(
      await statusPATCH(auth('/api/projects/nope/status', adminToken, { body: { status: 'ACTIVE' } }), P('nope')),
      404
    )
    await errBody(await statusPATCH(auth(`/api/projects/${projectId}/status`, riyaToken, { body: { status: 'ACTIVE' } }), P(projectId)), 403)
  })

  test('PLANNING → ACTIVE → ON_HOLD ↔ ACTIVE → COMPLETED sets actualEndDate; COMPLETED is terminal', async () => {
    expect((await okBody<{ project: { status: string } }>(await set('ACTIVE'))).data.project.status).toBe('ACTIVE')
    expect((await okBody<{ project: { status: string } }>(await set('ON_HOLD'))).data.project.status).toBe('ON_HOLD')
    expect((await okBody<{ project: { status: string } }>(await set('ACTIVE'))).data.project.status).toBe('ACTIVE')

    const done = await okBody<{ project: { status: string; actualEndDate: string | null } }>(await set('COMPLETED'))
    expect(done.data.project.status).toBe('COMPLETED')
    expect(typeof done.data.project.actualEndDate).toBe('string')

    await errBody(await set('ACTIVE'), 422)
    await errBody(await set('PLANNING'), 422)

    const audit = await db.auditLog.findFirst({
      where: { action: 'STATUS_CHANGE', projectId: projectId },
      orderBy: { createdAt: 'desc' },
    })
    expect(audit).toBeTruthy()
  })
})

describe('PATCH /api/projects/:id/assign-pm', () => {
  const assign = async (pmId: string | null, token = adminToken) =>
    assignPmPATCH(auth(`/api/projects/${projectId}/assign-pm`, token, { body: { pmId } }), P(projectId))

  test('assign a valid PM, then unassign with null', async () => {
    const res = await assign(riyaId)
    const body = await okBody<{ project: { assignedPmId: string | null; assignedPm: { id: string } | null } }>(res)
    expect(body.data.project.assignedPmId).toBe(riyaId)
    expect(body.data.project.assignedPm?.id).toBe(riyaId)

    const cleared = await okBody<{ project: { assignedPmId: string | null } }>(await assign(null))
    expect(cleared.data.project.assignedPmId).toBeNull()

    const audit = await db.auditLog.findFirst({
      where: { action: 'ASSIGN', projectId: projectId },
      orderBy: { createdAt: 'desc' },
    })
    expect(audit).toBeTruthy()
  })

  test('inactive PM → 400; bogus pmId → 400; PM cannot assign → 403', async () => {
    const rohitId = await db.user.findUniqueOrThrow({ where: { email: ROHIT_EMAIL } }).then((u) => u.id)
    await errBody(await assign(rohitId), 400)
    await errBody(await assign('nope'), 400)
    await errBody(await assign(vinayakId, riyaToken), 403)
    // restore vinayak for later suites
    await okBody(await assign(vinayakId))
  })
})

describe('PUT /api/projects/:id', () => {
  test('updates fields and validates budget', async () => {
    await errBody(
      await projectPUT(auth(`/api/projects/${projectId}`, adminToken, { method: 'PUT', body: { totalBudget: 0 } }), P(projectId)),
      400
    )
    const res = await projectPUT(
      auth(`/api/projects/${projectId}`, adminToken, { method: 'PUT', body: { location: 'Updated Testville', name: `T8 Renamed ${RUN_TAG}` } }),
      P(projectId)
    )
    const body = await okBody<{ project: { location: string | null; name: string } }>(res)
    expect(body.data.project.location).toBe('Updated Testville')
    expect(body.data.project.name).toBe(`T8 Renamed ${RUN_TAG}`)
  })
})

describe('DELETE /api/projects/:id', () => {
  test('blocked with dependent records (409), works for a clean project', async () => {
    const whitefield = await db.project.findUniqueOrThrow({ where: { code: 'FOS-001' } })
    await errBody(
      await projectDELETE(auth(`/api/projects/${whitefield.id}`, adminToken, { method: 'DELETE' }), P(whitefield.id)),
      409
    )

    // our fixture project only has audit rows attached → deletable
    await okBody(await projectDELETE(auth(`/api/projects/${projectId}`, adminToken, { method: 'DELETE' }), P(projectId)))
    expect(await db.project.findUnique({ where: { id: projectId } })).toBeNull()
    projectId = '' // already removed
  })
})
