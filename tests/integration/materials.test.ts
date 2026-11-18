import { describe, test, expect, afterAll } from 'vitest'
import { GET as materialsGET, POST as materialsPOST } from '@/app/api/materials/route'
import { PATCH as materialPATCH } from '@/app/api/materials/[id]/route'
import { db } from '@/lib/db'
import { auth, P, loginAs, okBody, errBody, RUN_TAG, ADMIN_EMAIL, RIYA_EMAIL, AISHA_EMAIL } from '../helpers'

const matName = `T8 Material ${RUN_TAG}`

afterAll(async () => {
  await db.material.deleteMany({ where: { name: { startsWith: 'T8 Material' } } })
})

describe('GET /api/materials', () => {
  test('lists materials ordered by name with full shape', async () => {
    const adminToken = await loginAs(ADMIN_EMAIL)
    const res = await materialsGET(auth('/api/materials', adminToken))
    const body = await okBody<
      { id: string; name: string; category: string; unit: string; isActive: boolean; description: string | null }[]
    >(res)
    expect(body.data.length).toBeGreaterThanOrEqual(14)
    for (const row of body.data) {
      expect(typeof row.name).toBe('string')
      expect(typeof row.category).toBe('string')
      expect(typeof row.unit).toBe('string')
      expect(typeof row.isActive).toBe('boolean')
    }
    const names = body.data.map((m) => m.name)
    expect(names).toContain('OPC 53 Grade Cement')
    // ordered by name asc
    const sorted = [...names].sort((a, b) => a.localeCompare(b))
    expect(names).toEqual(sorted)
  })

  test('search / category / isActive filters', async () => {
    const adminToken = await loginAs(ADMIN_EMAIL)
    const cement = await okBody<{ name: string }[]>(await materialsGET(auth('/api/materials?search=Cement', adminToken)))
    expect(cement.data.length).toBeGreaterThanOrEqual(1)
    for (const row of cement.data) expect(row.name.includes('Cement')).toBe(true)

    const steel = await okBody<{ category: string }[]>(await materialsGET(auth('/api/materials?category=STEEL', adminToken)))
    expect(steel.data.length).toBeGreaterThanOrEqual(2)
    for (const row of steel.data) expect(row.category).toBe('STEEL')

    const inactive = await okBody<{ name: string; isActive: boolean }[]>(
      await materialsGET(auth('/api/materials?isActive=false', adminToken))
    )
    expect(inactive.data.some((m) => m.name === 'Asbestos Sheet' && m.isActive === false)).toBe(true)
    for (const row of inactive.data) expect(row.isActive).toBe(false)
  })
})

describe('POST /api/materials', () => {
  test('duplicate name → 409', async () => {
    const adminToken = await loginAs(ADMIN_EMAIL)
    await errBody(
      await materialsPOST(
        auth('/api/materials', adminToken, { body: { name: 'OPC 53 Grade Cement', category: 'CEMENT', unit: 'bag' } })
      ),
      409
    )
  })

  test('validation: short name, bad category, empty unit', async () => {
    const adminToken = await loginAs(ADMIN_EMAIL)
    await errBody(await materialsPOST(auth('/api/materials', adminToken, { body: { name: 'x', category: 'CEMENT', unit: 'bag' } })), 400)
    await errBody(
      await materialsPOST(auth('/api/materials', adminToken, { body: { name: 'T8 Bad Cat', category: 'MAGIC', unit: 'bag' } })),
      400
    )
    await errBody(await materialsPOST(auth('/api/materials', adminToken, { body: { name: 'T8 No Unit', category: 'CEMENT' } })), 400)
  })

  test('PM and VIEWER cannot create → 403; ADMIN success', async () => {
    const riyaToken = await loginAs(RIYA_EMAIL)
    const viewerToken = await loginAs(AISHA_EMAIL)
    await errBody(
      await materialsPOST(auth('/api/materials', riyaToken, { body: { name: matName, category: 'OTHER', unit: 'kg' } })),
      403
    )
    await errBody(
      await materialsPOST(auth('/api/materials', viewerToken, { body: { name: matName, category: 'OTHER', unit: 'kg' } })),
      403
    )

    const adminToken = await loginAs(ADMIN_EMAIL)
    const res = await materialsPOST(
      auth('/api/materials', adminToken, { body: { name: matName, category: 'OTHER', unit: 'kg', description: 'T8 created' } })
    )
    const body = await okBody<{ id: string; name: string; isActive: boolean }>(res)
    expect(body.data.name).toBe(matName)
    expect(body.data.isActive).toBe(true)
    const audit = await db.auditLog.findFirst({
      where: { action: 'MATERIAL_CREATE', entityId: body.data.id },
      orderBy: { createdAt: 'desc' },
    })
    expect(audit).toBeTruthy()
  })
})

describe('PATCH /api/materials/:id', () => {
  test('toggling isActive writes ACTIVATE/DEACTIVATE audit rows', async () => {
    const adminToken = await loginAs(ADMIN_EMAIL)
    const material = await db.material.findUniqueOrThrow({ where: { name: matName } })

    const off = await materialPATCH(
      auth(`/api/materials/${material.id}`, adminToken, { method: 'PATCH', body: { isActive: false } }),
      P(material.id)
    )
    const offBody = await okBody<{ isActive: boolean }>(off)
    expect(offBody.data.isActive).toBe(false)
    const deactivated = await db.auditLog.findFirst({
      where: { action: 'DEACTIVATE', entityId: material.id },
      orderBy: { createdAt: 'desc' },
    })
    expect(deactivated).toBeTruthy()

    const on = await materialPATCH(
      auth(`/api/materials/${material.id}`, adminToken, { method: 'PATCH', body: { isActive: true } }),
      P(material.id)
    )
    const onBody = await okBody<{ isActive: boolean }>(on)
    expect(onBody.data.isActive).toBe(true)
    const activated = await db.auditLog.findFirst({
      where: { action: 'ACTIVATE', entityId: material.id },
      orderBy: { createdAt: 'desc' },
    })
    expect(activated).toBeTruthy()
  })

  test('renaming to an existing name → 409; bad category → 400; description update works', async () => {
    const adminToken = await loginAs(ADMIN_EMAIL)
    const material = await db.material.findUniqueOrThrow({ where: { name: matName } })
    await errBody(
      await materialPATCH(
        auth(`/api/materials/${material.id}`, adminToken, { method: 'PATCH', body: { name: 'River Sand' } }),
        P(material.id)
      ),
      409
    )
    await errBody(
      await materialPATCH(auth(`/api/materials/${material.id}`, adminToken, { method: 'PATCH', body: { category: 'NOPE' } }), P(material.id)),
      400
    )
    const res = await materialPATCH(
      auth(`/api/materials/${material.id}`, adminToken, { method: 'PATCH', body: { description: 'T8 updated description' } }),
      P(material.id)
    )
    const body = await okBody<{ description: string | null }>(res)
    expect(body.data.description).toBe('T8 updated description')
  })

  test('deactivating a material used in an ACTIVE project plan → 422', async () => {
    const adminToken = await loginAs(ADMIN_EMAIL)
    const whitefield = await db.project.findUniqueOrThrow({ where: { code: 'FOS-001' } })
    const plan = await db.materialPlan.findFirstOrThrow({
      where: { projectId: whitefield.id },
      include: { material: true },
    })
    const res = await materialPATCH(
      auth(`/api/materials/${plan.materialId}`, adminToken, { method: 'PATCH', body: { isActive: false } }),
      P(plan.materialId)
    )
    const body = await errBody(res, 422)
    expect(body.message).toContain('active project plan')
    // unchanged in DB
    const still = await db.material.findUniqueOrThrow({ where: { id: plan.materialId } })
    expect(still.isActive).toBe(true)
  })
})
