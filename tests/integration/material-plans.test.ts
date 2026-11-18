import { describe, test, expect, afterAll } from 'vitest'
import { GET as plansGET, POST as plansPOST } from '@/app/api/material-plans/route'
import { PATCH as planPATCH, DELETE as planDELETE } from '@/app/api/material-plans/[id]/route'
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
  YASHMEEN_EMAIL,
  createProjectFixture,
  createMaterialFixture,
} from '../helpers'

// Fixtures: an ACTIVE project owned by riya + three dedicated materials.
const fixture = await createProjectFixture('plans', { pmEmail: RIYA_EMAIL })
const matA = await createMaterialFixture(`PlanA-${RUN_TAG}`)
const matB = await createMaterialFixture(`PlanB-${RUN_TAG}`)
const matInactive = await createMaterialFixture(`PlanInactive-${RUN_TAG}`, false)

// Seeded data used for PM-scoping assertions (never modified).
const yashProject = await db.project.findUniqueOrThrow({ where: { code: 'FOS-002' } })
const yashPlan = await db.materialPlan.findFirstOrThrow({ where: { projectId: yashProject.id } })

let planAId = ''
let planBId = ''

afterAll(async () => {
  // cascade removes the plans created through the API
  await fixture.dispose()
  await db.material
    .deleteMany({ where: { id: { in: [matA, matB, matInactive] } } })
    .catch(() => undefined)
})

describe('POST /api/material-plans', () => {
  test('owning PM creates a DRAFT plan with full shape + PLAN_CREATE audit', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    const res = await plansPOST(
      auth('/api/material-plans', riya, {
        body: {
          projectId: fixture.projectId,
          materialId: matA,
          openingQuantity: 100,
          plannedQuantity: 1000,
          plannedUnitRate: 50,
          lowStockThreshold: 40,
          wastageThresholdPct: 10,
          notes: `T8 plan notes ${RUN_TAG}`,
        },
      })
    )
    const body = await okBody<{
      id: string
      status: string
      openingQuantity: number
      plannedQuantity: number
      plannedUnitRate: number
      notes: string | null
      material: { name: string; unit: string; category: string }
      project: { name: string; code: string }
      createdById: string
    }>(res)
    planAId = body.data.id
    expect(body.data.status).toBe('DRAFT')
    expect(body.data.openingQuantity).toBe(100)
    expect(body.data.plannedQuantity).toBe(1000)
    expect(body.data.plannedUnitRate).toBe(50)
    expect(body.data.notes).toBe(`T8 plan notes ${RUN_TAG}`)
    expect(body.data.material.unit).toBe('bag')
    expect(body.data.project.code).toBe(`T8-${RUN_TAG}-plans`)
    const audit = await db.auditLog.findFirst({
      where: { action: 'PLAN_CREATE', entityId: planAId },
      orderBy: { createdAt: 'desc' },
    })
    expect(audit?.projectId).toBe(fixture.projectId)
  })

  test('second plan for a different material (used later in the suite)', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    const body = await okBody<{ id: string; status: string; openingQuantity: number; plannedUnitRate: number | null }>(
      await plansPOST(
        auth('/api/material-plans', riya, {
          body: { projectId: fixture.projectId, materialId: matB, plannedQuantity: 500 },
        })
      )
    )
    planBId = body.data.id
    expect(body.data.status).toBe('DRAFT')
    expect(body.data.openingQuantity).toBe(0)
    expect(body.data.plannedUnitRate).toBeNull()
  })

  test('duplicate project+material plan → 409', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    await errBody(
      await plansPOST(
        auth('/api/material-plans', riya, { body: { projectId: fixture.projectId, materialId: matA, plannedQuantity: 5 } })
      ),
      409
    )
  })

  test('unknown material → 404; inactive material → 422; unknown project → 404', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    await errBody(
      await plansPOST(
        auth('/api/material-plans', riya, { body: { projectId: fixture.projectId, materialId: 'nope', plannedQuantity: 5 } })
      ),
      404
    )
    const inactive = await errBody(
      await plansPOST(
        auth('/api/material-plans', riya, { body: { projectId: fixture.projectId, materialId: matInactive, plannedQuantity: 5 } })
      ),
      422
    )
    expect(inactive.message).toContain('inactive')
    await errBody(
      await plansPOST(auth('/api/material-plans', riya, { body: { projectId: 'nope', materialId: matA, plannedQuantity: 5 } })),
      404
    )
  })

  test('field validation → 400', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    const base = { materialId: matA, plannedQuantity: 10 }
    await errBody(await plansPOST(auth('/api/material-plans', riya, { body: { ...base } })), 400) // no projectId
    await errBody(
      await plansPOST(auth('/api/material-plans', riya, { body: { projectId: fixture.projectId, materialId: matA } })),
      400
    ) // no plannedQuantity
    await errBody(
      await plansPOST(
        auth('/api/material-plans', riya, { body: { projectId: fixture.projectId, materialId: matA, plannedQuantity: 0 } })
      ),
      400
    )
    await errBody(
      await plansPOST(
        auth('/api/material-plans', riya, {
          body: { projectId: fixture.projectId, materialId: matA, plannedQuantity: 10, openingQuantity: -1 },
        })
      ),
      400
    )
    await errBody(
      await plansPOST(
        auth('/api/material-plans', riya, {
          body: { projectId: fixture.projectId, materialId: matA, plannedQuantity: 10, plannedUnitRate: -5 },
        })
      ),
      400
    )
    await errBody(
      await plansPOST(
        auth('/api/material-plans', riya, {
          body: { projectId: fixture.projectId, materialId: matA, plannedQuantity: 10, wastageThresholdPct: 150 },
        })
      ),
      400
    )
  })

  test('PM cannot plan another PM project; VIEWER cannot write; missing body → 400', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    const viewer = await loginAs(AISHA_EMAIL)
    await errBody(
      await plansPOST(
        auth('/api/material-plans', riya, { body: { projectId: yashProject.id, materialId: matA, plannedQuantity: 5 } })
      ),
      403
    )
    await errBody(
      await plansPOST(
        auth('/api/material-plans', viewer, { body: { projectId: fixture.projectId, materialId: matA, plannedQuantity: 5 } })
      ),
      403
    )
    await errBody(
      await plansPOST(
        new Request('http://localhost:3000/api/material-plans', {
          method: 'POST',
          body: 'not-json',
          headers: { 'content-type': 'application/json', authorization: `Bearer ${riya}` },
        })
      ),
      400
    )
  })
})

describe('GET /api/material-plans', () => {
  test('PM list is scoped to own projects; admin sees everything', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    const admin = await loginAs(ADMIN_EMAIL)
    const riyaBody = await okBody<{ id: string; project: { code: string }; material: { name: string } }[]>(
      await plansGET(auth('/api/material-plans', riya))
    )
    for (const row of riyaBody.data) {
      expect(row.project.code).not.toBe('FOS-002')
      expect(row.project.code).not.toBe('FOS-006')
    }
    expect(riyaBody.data.some((r) => r.id === planAId)).toBe(true)
    expect(riyaBody.data.some((r) => r.project.code === 'FOS-001')).toBe(true)

    const adminBody = await okBody<{ project: { code: string } }[]>(await plansGET(auth('/api/material-plans', admin)))
    expect(adminBody.data.some((r) => r.project.code === 'FOS-002')).toBe(true)
  })

  test('status filter validates against DRAFT|APPROVED|ARCHIVED', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    await errBody(await plansGET(auth('/api/material-plans?status=BOGUS', riya)), 400)
    await errBody(await plansGET(auth('/api/material-plans?status=deleted', riya)), 400)

    const drafts = await okBody<{ status: string; projectId: string }[]>(
      await plansGET(auth(`/api/material-plans?status=DRAFT&projectId=${fixture.projectId}`, riya))
    )
    expect(drafts.data.length).toBe(2) // plan A + plan B, both DRAFT at this point
    for (const row of drafts.data) expect(row.status).toBe('DRAFT')

    const approved = await okBody<{ status: string }[]>(
      await plansGET(auth(`/api/material-plans?status=APPROVED&projectId=${fixture.projectId}`, riya))
    )
    expect(approved.data).toEqual([])
  })

  test('materialId filter narrows the list', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    const mine = await okBody<{ materialId: string }[]>(
      await plansGET(auth(`/api/material-plans?projectId=${fixture.projectId}&materialId=${matA}`, riya))
    )
    expect(mine.data.length).toBe(1)
    expect(mine.data[0].materialId).toBe(matA)
    const none = await okBody<{ materialId: string }[]>(
      await plansGET(auth(`/api/material-plans?projectId=${fixture.projectId}&materialId=${matInactive}`, riya))
    )
    expect(none.data).toEqual([])
  })
})

describe('PATCH /api/material-plans/:id', () => {
  test('updates editable fields, audits PLAN_UPDATE, can null optionals', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    const body = await okBody<{ plannedQuantity: number; notes: string | null; plannedUnitRate: number | null }>(
      await planPATCH(
        auth(`/api/material-plans/${planAId}`, riya, {
          method: 'PATCH',
          body: { plannedQuantity: 1200, notes: `T8 updated ${RUN_TAG}` },
        }),
        P(planAId)
      )
    )
    expect(body.data.plannedQuantity).toBe(1200)
    expect(body.data.notes).toBe(`T8 updated ${RUN_TAG}`)
    const dbRow = await db.materialPlan.findUniqueOrThrow({ where: { id: planAId } })
    expect(dbRow.plannedQuantity).toBe(1200)
    const audit = await db.auditLog.findFirst({
      where: { action: 'PLAN_UPDATE', entityId: planAId },
      orderBy: { createdAt: 'desc' },
    })
    expect(audit).toBeTruthy()

    const cleared = await okBody<{ plannedUnitRate: number | null; lowStockThreshold: number | null }>(
      await planPATCH(
        auth(`/api/material-plans/${planAId}`, riya, { method: 'PATCH', body: { plannedUnitRate: null, lowStockThreshold: null } }),
        P(planAId)
      )
    )
    expect(cleared.data.plannedUnitRate).toBeNull()
    expect(cleared.data.lowStockThreshold).toBeNull()
  })

  test('bad values → 400; unknown plan → 404; other PM plan → 403', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    await errBody(
      await planPATCH(auth(`/api/material-plans/${planAId}`, riya, { method: 'PATCH', body: { plannedQuantity: 0 } }), P(planAId)),
      400
    )
    await errBody(
      await planPATCH(
        auth(`/api/material-plans/${planAId}`, riya, { method: 'PATCH', body: { wastageThresholdPct: 101 } }),
        P(planAId)
      ),
      400
    )
    await errBody(await planPATCH(auth('/api/material-plans/nope', riya, { method: 'PATCH', body: { notes: 'x' } }), P('nope')), 404)
    await errBody(
      await planPATCH(auth(`/api/material-plans/${yashPlan.id}`, riya, { method: 'PATCH', body: { notes: 'nope' } }), P(yashPlan.id)),
      403
    )
  })
})

describe('plan status machine (DRAFT→APPROVED→ARCHIVED)', () => {
  test('DRAFT→APPROVED succeeds and writes PLAN_STATUS audit', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    const body = await okBody<{ status: string }>(
      await planPATCH(
        auth(`/api/material-plans/${planAId}`, riya, { method: 'PATCH', body: { status: 'APPROVED' } }),
        P(planAId)
      )
    )
    expect(body.data.status).toBe('APPROVED')
    const audit = await db.auditLog.findFirst({
      where: { action: 'PLAN_STATUS', entityId: planAId },
      orderBy: { createdAt: 'desc' },
    })
    expect(audit).toBeTruthy()
    const meta = audit?.meta ? (JSON.parse(audit.meta) as { from: string; to: string }) : null
    expect(meta).toEqual({ from: 'DRAFT', to: 'APPROVED' })
  })

  test('invalid status string → 400; DRAFT target from APPROVED → 409', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    await errBody(
      await planPATCH(auth(`/api/material-plans/${planAId}`, riya, { method: 'PATCH', body: { status: 'NOPE' } }), P(planAId)),
      400
    )
    await errBody(
      await planPATCH(auth(`/api/material-plans/${planAId}`, riya, { method: 'PATCH', body: { status: 'DRAFT' } }), P(planAId)),
      409
    )
  })

  test('DRAFT→ARCHIVED is not allowed (must go through APPROVED)', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    const body = await errBody(
      await planPATCH(auth(`/api/material-plans/${planBId}`, riya, { method: 'PATCH', body: { status: 'ARCHIVED' } }), P(planBId)),
      409
    )
    expect(body.message).toContain('DRAFT plan to ARCHIVED')
  })

  test('APPROVED→ARCHIVED succeeds', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    const body = await okBody<{ status: string }>(
      await planPATCH(
        auth(`/api/material-plans/${planAId}`, riya, { method: 'PATCH', body: { status: 'ARCHIVED' } }),
        P(planAId)
      )
    )
    expect(body.data.status).toBe('ARCHIVED')
  })

  test('archived plans cannot be edited (field or status) → 409', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    const field = await errBody(
      await planPATCH(auth(`/api/material-plans/${planAId}`, riya, { method: 'PATCH', body: { notes: 'x' } }), P(planAId)),
      409
    )
    expect(field.message).toContain('Archived plans cannot be edited')
    await errBody(
      await planPATCH(auth(`/api/material-plans/${planAId}`, riya, { method: 'PATCH', body: { status: 'DRAFT' } }), P(planAId)),
      409
    )
  })

  test('non-draft plans cannot be deleted → 409', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    const body = await errBody(
      await planDELETE(auth(`/api/material-plans/${planAId}`, riya, { method: 'DELETE' }), P(planAId)),
      409
    )
    expect(body.message).toContain('Only draft plans can be deleted')
  })

  test('ADMIN may edit a PM-owned plan; DRAFT delete succeeds with audit', async () => {
    const admin = await loginAs(ADMIN_EMAIL)
    const edited = await okBody<{ notes: string | null }>(
      await planPATCH(auth(`/api/material-plans/${planBId}`, admin, { method: 'PATCH', body: { notes: 'admin edit' } }), P(planBId))
    )
    expect(edited.data.notes).toBe('admin edit')

    const riya = await loginAs(RIYA_EMAIL)
    await okBody(await planDELETE(auth(`/api/material-plans/${planBId}`, riya, { method: 'DELETE' }), P(planBId)))
    expect(await db.materialPlan.findUnique({ where: { id: planBId } })).toBeNull()
    const audit = await db.auditLog.findFirst({
      where: { action: 'PLAN_DELETE', entityId: planBId },
      orderBy: { createdAt: 'desc' },
    })
    expect(audit).toBeTruthy()
    // other PM cannot delete either
    await errBody(await planDELETE(auth(`/api/material-plans/${yashPlan.id}`, riya, { method: 'DELETE' }), P(yashPlan.id)), 403)
    await errBody(await planDELETE(auth('/api/material-plans/nope', riya, { method: 'DELETE' }), P('nope')), 404)
  })
})
