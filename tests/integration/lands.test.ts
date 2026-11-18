import { describe, test, expect, afterAll } from 'vitest'
import { GET as landsGET, POST as landsPOST } from '@/app/api/lands/route'
import { PATCH as landPATCH, DELETE as landDELETE } from '@/app/api/lands/[id]/route'
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
  AISHA_EMAIL,
} from '../helpers'

const landName = `T8 Land Fixture ${RUN_TAG}`
const createdIds: string[] = []

afterAll(async () => {
  await db.land.deleteMany({ where: { name: { startsWith: 'T8 Land' } } })
})

describe('GET /api/lands', () => {
  test('list with pagination meta + full row shape', async () => {
    const adminToken = await loginAs(ADMIN_EMAIL)
    const res = await landsGET(auth('/api/lands?page=1&limit=3', adminToken))
    const body = await okBody<
      {
        id: string
        name: string
        city: string
        state: string
        areaValue: number
        areaUnit: string
        projects: number
        createdAt: string
      }[]
    >(res)
    expect(body.data.length).toBeLessThanOrEqual(3)
    expect(body.meta).toMatchObject({ page: 1, pageSize: 3, limit: 3 })
    const meta = body.meta as { total: number }
    expect(meta.total).toBeGreaterThanOrEqual(4)
    for (const row of body.data) {
      expect(row.name).toBeTruthy()
      expect(typeof row.areaValue).toBe('number')
      expect(typeof row.projects).toBe('number')
    }
  })

  test('search matches name/city/state', async () => {
    const adminToken = await loginAs(ADMIN_EMAIL)
    const res = await landsGET(auth('/api/lands?search=Powai', adminToken))
    const body = await okBody<{ name: string; city: string; state: string }[]>(res)
    expect(body.data.length).toBeGreaterThanOrEqual(1)
    for (const row of body.data) {
      expect(
        row.name.includes('Powai') || row.city.includes('Powai') || row.state.includes('Powai')
      ).toBe(true)
    }
    const dbCount = await db.land.count({
      where: {
        OR: [{ name: { contains: 'Powai' } }, { city: { contains: 'Powai' } }, { state: { contains: 'Powai' } }],
      },
    })
    expect(body.data.length).toBe(dbCount)
  })
})

describe('POST /api/lands (create + validation)', () => {
  test('creates a land (ADMIN) with project count 0', async () => {
    const adminToken = await loginAs(ADMIN_EMAIL)
    const res = await landsPOST(
      auth('/api/lands', adminToken, {
        body: {
          name: landName,
          addressLine: '12 Test Street',
          city: 'Testville',
          state: 'Teststate',
          pincode: '999999',
          areaValue: 5400,
          areaUnit: 'SQFT',
          surveyNumber: 'T8-SRV-1',
          ownerName: 'T8 Owner',
          purchaseDate: '2030-01-05',
          purchaseCost: 2_500_000,
          notes: 'T8 created land',
        },
      })
    )
    const body = await okBody<{ id: string; name: string; projects: number; purchaseCost: number | null; purchaseDate: string | null }>(res)
    expect(body.data.name).toBe(landName)
    expect(body.data.projects).toBe(0)
    expect(body.data.purchaseCost).toBe(2_500_000)
    expect(body.data.purchaseDate).toContain('2030-01-05')
    createdIds.push(body.data.id)
  })

  test('PM can also create lands; VIEWER cannot → 403', async () => {
    const riyaToken = await loginAs(RIYA_EMAIL)
    const res = await landsPOST(
      auth('/api/lands', riyaToken, { body: { name: `T8 Land PM ${RUN_TAG}`, city: 'Testville', state: 'Teststate', areaValue: 100, areaUnit: 'SQM' } })
    )
    const body = await okBody<{ id: string }>(res)
    createdIds.push(body.data.id)

    const viewerToken = await loginAs(AISHA_EMAIL)
    await errBody(
      await landsPOST(
        auth('/api/lands', viewerToken, { body: { name: 'nope', city: 'x-city', state: 'x-state', areaValue: 1, areaUnit: 'SQFT' } })
      ),
      403
    )
  })

  test('validation: short name/city/state, bad areaUnit, area ≤ 0, bad purchaseCost', async () => {
    const adminToken = await loginAs(ADMIN_EMAIL)
    const post = (body: Record<string, unknown>) => landsPOST(auth('/api/lands', adminToken, { body }))
    await errBody(await post({ name: 'x', city: 'Testville', state: 'Teststate', areaValue: 1, areaUnit: 'SQFT' }), 400)
    await errBody(await post({ name: 'T8 X', city: 'x', state: 'Teststate', areaValue: 1, areaUnit: 'SQFT' }), 400)
    await errBody(await post({ name: 'T8 X', city: 'Testville', state: 'x', areaValue: 1, areaUnit: 'SQFT' }), 400)
    await errBody(await post({ name: 'T8 X', city: 'Testville', state: 'Teststate', areaValue: 1, areaUnit: 'HECTARE' }), 400)
    await errBody(await post({ name: 'T8 X', city: 'Testville', state: 'Teststate', areaValue: 0, areaUnit: 'SQFT' }), 400)
    await errBody(await post({ name: 'T8 X', city: 'Testville', state: 'Teststate', areaValue: 5, areaUnit: 'SQFT', purchaseCost: -10 }), 400)
  })
})

describe('PATCH /api/lands/:id', () => {
  test('updates scalar fields', async () => {
    const adminToken = await loginAs(ADMIN_EMAIL)
    const id = createdIds[0]
    const res = await landPATCH(
      auth(`/api/lands/${id}`, adminToken, { method: 'PATCH', body: { notes: 'T8 updated notes', city: 'Newville', areaValue: 6000 } }),
      P(id)
    )
    const body = await okBody<{ notes: string | null; city: string; areaValue: number }>(res)
    expect(body.data.notes).toBe('T8 updated notes')
    expect(body.data.city).toBe('Newville')
    expect(body.data.areaValue).toBe(6000)
  })

  test('bad areaUnit / bad date → 400; unknown id → 404', async () => {
    const adminToken = await loginAs(ADMIN_EMAIL)
    const id = createdIds[0]
    await errBody(
      await landPATCH(auth(`/api/lands/${id}`, adminToken, { method: 'PATCH', body: { areaUnit: 'ACRES2' } }), P(id)),
      400
    )
    await errBody(
      await landPATCH(auth(`/api/lands/${id}`, adminToken, { method: 'PATCH', body: { purchaseDate: '05/01/2030' } }), P(id)),
      400
    )
    await errBody(
      await landPATCH(auth('/api/lands/nope', adminToken, { method: 'PATCH', body: { notes: 'x-none' } }), P('nope')),
      404
    )
  })
})

describe('DELETE /api/lands/:id', () => {
  test('409 while projects depend on the land', async () => {
    const adminToken = await loginAs(ADMIN_EMAIL)
    const whitefield = await db.land.findFirstOrThrow({ where: { name: 'Whitefield Plot' } })
    const body = await errBody(
      await landDELETE(auth(`/api/lands/${whitefield.id}`, adminToken, { method: 'DELETE' }), P(whitefield.id)),
      409
    )
    expect(body.message).toContain('projects depend')
  })

  test('deletes a project-free land, then it is gone', async () => {
    const adminToken = await loginAs(ADMIN_EMAIL)
    const id = createdIds[0]
    await okBody(await landDELETE(auth(`/api/lands/${id}`, adminToken, { method: 'DELETE' }), P(id)))
    expect(await db.land.findUnique({ where: { id } })).toBeNull()
  })
})
