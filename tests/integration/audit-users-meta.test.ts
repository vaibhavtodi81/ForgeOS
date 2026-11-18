import { describe, test, expect, afterAll } from 'vitest'
import { GET as auditLogsGET } from '@/app/api/audit-logs/route'
import { GET as auditStatsGET } from '@/app/api/audit-logs/stats/route'
import { GET as usersGET, POST as usersPOST } from '@/app/api/users/route'
import { PATCH as userPATCH } from '@/app/api/users/[id]/route'
import { GET as metaGET } from '@/app/api/meta/route'
import { GET as suppliersGET, POST as suppliersPOST } from '@/app/api/suppliers/route'
import { PATCH as supplierPATCH } from '@/app/api/suppliers/[id]/route'
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
  ROHIT_EMAIL,
  YASHMEEN_EMAIL,
  getUserId,
} from '../helpers'

const INVITE_EMAIL = `t8-invite-${RUN_TAG}@forgeos.local`
const SUPPLIER_NAME = `T8 Supplier ${RUN_TAG}`

const riyaId = await getUserId(RIYA_EMAIL)
const adminId = await getUserId(ADMIN_EMAIL)
const rohitId = await getUserId(ROHIT_EMAIL)
const adminBefore = await db.user.findUniqueOrThrow({ where: { id: adminId } })

let invitedUserId = ''
let supplierId = ''

afterAll(async () => {
  if (invitedUserId) await db.user.delete({ where: { id: invitedUserId } }).catch(() => undefined)
  if (supplierId) await db.supplier.delete({ where: { id: supplierId } }).catch(() => undefined)
  // restore the admin row touched by the self-phone test
  await db.user
    .update({ where: { id: adminId }, data: { phone: adminBefore.phone } })
    .catch(() => undefined)
})

describe('GET /api/audit-logs', () => {
  test('ADMIN-only: PM and VIEWER get 403', async () => {
    await errBody(await auditLogsGET(auth('/api/audit-logs', await loginAs(RIYA_EMAIL))), 403)
    await errBody(await auditLogsGET(auth('/api/audit-logs', await loginAs(AISHA_EMAIL))), 403)
  })

  test('admin sees a paginated, newest-first list with full row shape', async () => {
    const admin = await loginAs(ADMIN_EMAIL)
    interface AuditRow {
      id: string
      action: string
      actorId: string | null
      actorName: string | null
      entityType: string | null
      entityId: string | null
      projectId: string | null
      meta: string | null
      ip: string | null
      createdAt: string
    }
    const body = await okBody<{ items: AuditRow[]; total: number; page: number; limit: number }>(
      await auditLogsGET(auth('/api/audit-logs?limit=10', admin))
    )
    expect(body.data.items.length).toBeLessThanOrEqual(10)
    expect(body.data.items.length).toBeGreaterThan(0)
    for (let i = 1; i < body.data.items.length; i++) {
      expect(body.data.items[i - 1].createdAt >= body.data.items[i].createdAt).toBe(true)
    }
    for (const row of body.data.items) {
      expect(typeof row.action).toBe('string')
      expect(typeof row.createdAt).toBe('string')
    }
    expect(body.data.page).toBe(1)
    expect(body.data.limit).toBe(10)
    expect(body.data.total).toBe(await db.auditLog.count())

    // page 2 lines up with the DB slice under the same ordering
    const page2 = await okBody<{ items: { id: string }[] }>(await auditLogsGET(auth('/api/audit-logs?limit=5&page=2', admin)))
    const dbPage2 = await db.auditLog.findMany({
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip: 5,
      take: 5,
      select: { id: true },
    })
    expect(page2.data.items.map((r) => r.id)).toEqual(dbPage2.map((r) => r.id))
  })

  test('filters: action, entityType, actorId, projectId, search', async () => {
    const admin = await loginAs(ADMIN_EMAIL)

    const logins = await okBody<{ items: { action: string }[] }>(await auditLogsGET(auth('/api/audit-logs?action=LOGIN', admin)))
    expect(logins.data.items.length).toBeGreaterThan(0)
    for (const row of logins.data.items) expect(row.action).toBe('LOGIN')

    const usersRows = await okBody<{ items: { entityType: string }[]; total: number }>(
      await auditLogsGET(auth('/api/audit-logs?entityType=user&limit=50', admin))
    )
    const dbUsers = await db.auditLog.count({ where: { entityType: 'user' } })
    expect(usersRows.data.items.every((r) => r.entityType === 'user')).toBe(true)
    expect(usersRows.data.items.length).toBe(Math.min(dbUsers, 50))
    expect(usersRows.data.total).toBe(dbUsers)

    const byActor = await okBody<{ items: { actorId: string | null }[]; total: number }>(
      await auditLogsGET(auth(`/api/audit-logs?actorId=${riyaId}`, admin))
    )
    const dbByActor = await db.auditLog.count({ where: { OR: [{ actorId: riyaId }, { actorName: riyaId }] } })
    expect(byActor.data.total).toBe(dbByActor)
    expect(byActor.data.items.length).toBe(Math.min(dbByActor, 25)) // default page size
    for (const row of byActor.data.items) expect(row.actorId).toBe(riyaId)

    // search matches actorName / meta / entityId (case-sensitive contains)
    const marker = `T8-marker-${RUN_TAG}`
    await db.auditLog.create({
      data: { actorId: adminId, actorName: 'T8 Admin', action: 'USER_UPDATE', entityType: 'user', entityId: marker, meta: JSON.stringify({ note: marker }) },
    })
    const search = await okBody<{ items: { entityId: string | null }[]; total: number }>(
      await auditLogsGET(auth(`/api/audit-logs?search=${marker}`, admin))
    )
    expect(search.data.items.length).toBe(1)
    expect(search.data.total).toBe(1)
    expect(search.data.items[0].entityId).toBe(marker)
  })
})

describe('GET /api/audit-logs/stats', () => {
  test('ADMIN-only + shape', async () => {
    await errBody(await auditStatsGET(auth('/api/audit-logs/stats', await loginAs(RIYA_EMAIL))), 403)

    const admin = await loginAs(ADMIN_EMAIL)
    const body = await okBody<{
      total: number
      byAction: { action: string; count: number }[]
      byActor: { actorName: string; count: number }[]
      last7Days: { date: string; label: string; count: number }[]
    }>(await auditStatsGET(auth('/api/audit-logs/stats', admin)))
    const data = body.data
    expect(data.total).toBe(await db.auditLog.count())
    expect(data.byAction.length).toBeLessThanOrEqual(8)
    for (let i = 1; i < data.byAction.length; i++) {
      expect(data.byAction[i - 1].count >= data.byAction[i].count).toBe(true)
    }
    expect(data.byActor.length).toBeLessThanOrEqual(6)
    expect(data.last7Days.length).toBe(7)
    for (const d of data.last7Days) {
      expect(typeof d.date).toBe('string')
      expect(typeof d.label).toBe('string')
      expect(typeof d.count).toBe('number')
      expect(d.count).toBeGreaterThanOrEqual(0)
    }
  })
})

describe('POST /api/users (invite)', () => {
  test('validation and duplicate email', async () => {
    const admin = await loginAs(ADMIN_EMAIL)
    await errBody(await usersPOST(auth('/api/users', admin, { body: { name: 'x', email: INVITE_EMAIL, password: 'ForgeOS2026', role: 'PM' } })), 400)
    await errBody(
      await usersPOST(auth('/api/users', admin, { body: { name: 'T8 Person', email: 'not-an-email', password: 'ForgeOS2026', role: 'PM' } })),
      400
    )
    await errBody(
      await usersPOST(auth('/api/users', admin, { body: { name: 'T8 Person', email: INVITE_EMAIL, password: 'short', role: 'PM' } })),
      400
    )
    await errBody(
      await usersPOST(auth('/api/users', admin, { body: { name: 'T8 Person', email: INVITE_EMAIL, password: 'ForgeOS2026', role: 'VIEWER' } })),
      400
    ) // VIEWER cannot be invited
    await errBody(
      await usersPOST(auth('/api/users', admin, { body: { name: 'T8 Person', email: RIYA_EMAIL, password: 'ForgeOS2026', role: 'PM' } })),
      409
    ) // duplicate
    await errBody(
      await usersPOST(auth('/api/users', await loginAs(RIYA_EMAIL), { body: { name: 'T8 Person', email: INVITE_EMAIL, password: 'ForgeOS2026', role: 'PM' } })),
      403
    ) // PM cannot invite
  })

  test('admin invites a PM; audit written', async () => {
    const admin = await loginAs(ADMIN_EMAIL)
    const body = await okBody<{ id: string; name: string; email: string; role: string; isActive: boolean; managedProjects: number }>(
      await usersPOST(
        auth('/api/users', admin, {
          body: { name: `T8 Invitee ${RUN_TAG}`, email: INVITE_EMAIL, password: 'ForgeOS2026', role: 'PM', phone: '9876500000' },
        })
      )
    )
    invitedUserId = body.data.id
    expect(body.data.role).toBe('PM')
    expect(body.data.isActive).toBe(true)
    expect(body.data.managedProjects).toBe(0)
    const audit = await db.auditLog.findFirst({
      where: { action: 'USER_CREATE', entityId: invitedUserId },
      orderBy: { createdAt: 'desc' },
    })
    expect(audit).toBeTruthy()
  })
})

describe('GET /api/users', () => {
  test('admin list with search + pagination; PM blocked', async () => {
    const admin = await loginAs(ADMIN_EMAIL)
    await errBody(await usersGET(auth('/api/users', await loginAs(RIYA_EMAIL))), 403)

    const search = await okBody<{ name: string; email: string; managedProjects: number }[]>(
      await usersGET(auth('/api/users?search=iya', admin))
    )
    const dbCount = await db.user.count({ where: { OR: [{ name: { contains: 'iya' } }, { email: { contains: 'iya' } }] } })
    expect(search.data.length).toBe(dbCount)
    for (const row of search.data) {
      expect(row.name.includes('iya') || row.email.includes('iya')).toBe(true)
      expect(typeof row.managedProjects).toBe('number')
    }

    const paged = await okBody<{ id: string }[]>(await usersGET(auth('/api/users?limit=2&page=3', admin)))
    expect(paged.data.length).toBeLessThanOrEqual(2)
    const meta = paged.meta as { page: number; limit: number; total: number }
    expect(meta.page).toBe(3)
    expect(meta.limit).toBe(2)
    expect(meta.total).toBe(await db.user.count())
  })
})

describe('PATCH /api/users/:id', () => {
  test('empty body → 400; bad values → 400; unknown → 404; PM → 403', async () => {
    const admin = await loginAs(ADMIN_EMAIL)
    await errBody(await userPATCH(auth(`/api/users/${invitedUserId}`, admin, { method: 'PATCH', body: {} }), P(invitedUserId)), 400)
    await errBody(
      await userPATCH(auth(`/api/users/${invitedUserId}`, admin, { method: 'PATCH', body: { isActive: 'yes' } }), P(invitedUserId)),
      400
    )
    await errBody(
      await userPATCH(auth(`/api/users/${invitedUserId}`, admin, { method: 'PATCH', body: { role: 'VIEWER' } }), P(invitedUserId)),
      400
    )
    await errBody(await userPATCH(auth('/api/users/nope', admin, { method: 'PATCH', body: { phone: '123' } }), P('nope')), 404)
    await errBody(
      await userPATCH(auth(`/api/users/${invitedUserId}`, await loginAs(RIYA_EMAIL), { method: 'PATCH', body: { phone: '1234567890' } }), P(invitedUserId)),
      403
    )
  })

  test('role change updates the user and writes ROLE_CHANGE audit', async () => {
    const admin = await loginAs(ADMIN_EMAIL)
    const body = await okBody<{ role: string }>(
      await userPATCH(auth(`/api/users/${invitedUserId}`, admin, { method: 'PATCH', body: { role: 'ADMIN' } }), P(invitedUserId))
    )
    expect(body.data.role).toBe('ADMIN')
    const audit = await db.auditLog.findFirst({
      where: { action: 'ROLE_CHANGE', entityId: invitedUserId },
      orderBy: { createdAt: 'desc' },
    })
    const meta = audit?.meta ? (JSON.parse(audit.meta) as { from: string; to: string }) : null
    expect(meta).toEqual({ from: 'PM', to: 'ADMIN' })
    // and back to PM for the deactivate test
    await okBody(
      await userPATCH(auth(`/api/users/${invitedUserId}`, admin, { method: 'PATCH', body: { role: 'PM' } }), P(invitedUserId))
    )
  })

  test('self-modify guards: cannot deactivate or demote yourself', async () => {
    const admin = await loginAs(ADMIN_EMAIL)
    const off = await errBody(
      await userPATCH(auth(`/api/users/${adminId}`, admin, { method: 'PATCH', body: { isActive: false } }), P(adminId)),
      403
    )
    expect(off.message).toContain('own account')
    const demote = await errBody(
      await userPATCH(auth(`/api/users/${adminId}`, admin, { method: 'PATCH', body: { role: 'PM' } }), P(adminId)),
      403
    )
    expect(demote.message).toContain('own administrator role')
    // phone changes on self are allowed
    await okBody(await userPATCH(auth(`/api/users/${adminId}`, admin, { method: 'PATCH', body: { phone: '9876511111' } }), P(adminId)))
    expect((await db.user.findUniqueOrThrow({ where: { id: adminId } })).phone).toBe('9876511111')
  })

  test('deactivating a PM with an ACTIVE project → 409', async () => {
    const admin = await loginAs(ADMIN_EMAIL)
    const body = await errBody(
      await userPATCH(auth(`/api/users/${riyaId}`, admin, { method: 'PATCH', body: { isActive: false } }), P(riyaId)),
      409
    )
    expect(body.message).toContain('active project')
    expect((await db.user.findUniqueOrThrow({ where: { id: riyaId } })).isActive).toBe(true)
  })

  test('deactivating a PM without active projects works + audits; reactivate works', async () => {
    const admin = await loginAs(ADMIN_EMAIL)
    const body = await okBody<{ isActive: boolean }>(
      await userPATCH(auth(`/api/users/${invitedUserId}`, admin, { method: 'PATCH', body: { isActive: false } }), P(invitedUserId))
    )
    expect(body.data.isActive).toBe(false)
    const deactivate = await db.auditLog.findFirst({
      where: { action: 'DEACTIVATE', entityId: invitedUserId },
      orderBy: { createdAt: 'desc' },
    })
    expect(deactivate).toBeTruthy()

    const back = await okBody<{ isActive: boolean }>(
      await userPATCH(auth(`/api/users/${invitedUserId}`, admin, { method: 'PATCH', body: { isActive: true } }), P(invitedUserId))
    )
    expect(back.data.isActive).toBe(true)
    expect(
      await db.auditLog.findFirst({ where: { action: 'ACTIVATE', entityId: invitedUserId }, orderBy: { createdAt: 'desc' } })
    ).toBeTruthy()
  })

  test('phone update persists and audits USER_UPDATE', async () => {
    const admin = await loginAs(ADMIN_EMAIL)
    const body = await okBody<{ phone: string | null }>(
      await userPATCH(auth(`/api/users/${invitedUserId}`, admin, { method: 'PATCH', body: { phone: '9876522222' } }), P(invitedUserId))
    )
    expect(body.data.phone).toBe('9876522222')
    expect((await db.user.findUniqueOrThrow({ where: { id: invitedUserId } })).phone).toBe('9876522222')
    expect(
      await db.auditLog.findFirst({ where: { action: 'USER_UPDATE', entityId: invitedUserId }, orderBy: { createdAt: 'desc' } })
    ).toBeTruthy()
  })
})

describe('GET /api/meta', () => {
  test('PM sees only her projects; managers are ACTIVE PMs; materials are active-only', async () => {
    const riya = await loginAs(RIYA_EMAIL)
    const body = await okBody<{
      materials: { id: string; name: string; unit: string; category: string }[]
      suppliers: { id: string; name: string; phone: string }[]
      lands: { id: string; name: string; city: string; state: string }[]
      projects: { id: string; name: string; code: string; status: string; pmId: string | null; pmName: string | null }[]
      managers: { id: string; name: string }[]
    }>(await metaGET(auth('/api/meta', riya)))
    const data = body.data

    const riyaProjects = await db.project.findMany({ where: { assignedPmId: riyaId }, select: { code: true, assignedPmId: true } })
    expect(data.projects.map((p) => p.code).sort()).toEqual(riyaProjects.map((p) => p.code).sort())
    expect(data.projects.some((p) => p.code === 'FOS-002')).toBe(false)
    expect(data.projects.some((p) => p.code === 'FOS-006')).toBe(false)
    for (const p of data.projects) expect(p.pmId).toBe(riyaId)

    const activePmIds = new Set(
      (await db.user.findMany({ where: { role: 'PM', isActive: true }, select: { id: true } })).map((u) => u.id)
    )
    expect(activePmIds.has(rohitId)).toBe(false) // rohit is inactive
    for (const m of data.managers) expect(activePmIds.has(m.id)).toBe(true)
    expect(data.managers.some((m) => m.id === riyaId)).toBe(true)
    expect(data.managers.some((m) => m.id === rohitId)).toBe(false)

    const activeMaterialIds = new Set(
      (await db.material.findMany({ where: { isActive: true }, select: { id: true } })).map((m) => m.id)
    )
    for (const m of data.materials) expect(activeMaterialIds.has(m.id)).toBe(true)
    expect(data.materials.some((m) => m.name === 'Asbestos Sheet')).toBe(false) // seeded inactive material

    expect(data.suppliers.length).toBe(await db.supplier.count())
    expect(data.lands.length).toBe(await db.land.count())
    expect(data.lands.length).toBeGreaterThanOrEqual(4)
  })

  test('VIEWER and admin see every project', async () => {
    const viewer = await loginAs(AISHA_EMAIL)
    const viewerBody = await okBody<{ projects: { code: string }[] }>(await metaGET(auth('/api/meta', viewer)))
    expect(viewerBody.data.projects.length).toBe(await db.project.count())
    const admin = await loginAs(ADMIN_EMAIL)
    const adminBody = await okBody<{ projects: { code: string }[] }>(await metaGET(auth('/api/meta', admin)))
    expect(adminBody.data.projects.map((p) => p.code)).toContain('FOS-002')
  })
})

describe('suppliers', () => {
  test('list exposes supplyTxnCount consistent with the DB', async () => {
    const riya = await loginAs(RIYA_EMAIL) // any authenticated user may read
    const body = await okBody<{ items: { id: string; name: string; phone: string; supplyTxnCount: number }[] }>(
      await suppliersGET(auth('/api/suppliers', riya))
    )
    expect(body.data.items.length).toBeGreaterThanOrEqual(6)
    const withTxns = await db.supplier.findFirst({
      where: { transactions: { some: {} } },
      include: { _count: { select: { transactions: true } } },
    })
    expect(withTxns).toBeTruthy()
    const row = body.data.items.find((s) => s.id === withTxns!.id)!
    expect(row.supplyTxnCount).toBe(withTxns!._count.transactions)
  })

  test('create: validation, duplicate name → 409, success', async () => {
    const admin = await loginAs(ADMIN_EMAIL)
    await errBody(await suppliersPOST(auth('/api/suppliers', admin, { body: { name: 'x', phone: '123456' } })), 400)
    await errBody(await suppliersPOST(auth('/api/suppliers', admin, { body: { name: 'T8 Name', phone: '123' } })), 400)
    await errBody(
      await suppliersPOST(auth('/api/suppliers', admin, { body: { name: 'Deccan Block Works', phone: '123456' } })),
      409
    )
    await errBody(
      await suppliersPOST(auth('/api/suppliers', await loginAs(RIYA_EMAIL), { body: { name: SUPPLIER_NAME, phone: '123456' } })),
      403
    )

    const body = await okBody<{ supplier: { id: string; name: string; phone: string; supplyTxnCount: number } }>(
      await suppliersPOST(
        auth('/api/suppliers', admin, { body: { name: SUPPLIER_NAME, phone: '9876533333', email: `t8sup-${RUN_TAG}@example.com` } })
      )
    )
    supplierId = body.data.supplier.id
    expect(body.data.supplier.name).toBe(SUPPLIER_NAME)
    expect(body.data.supplier.supplyTxnCount).toBe(0)
    expect(
      await db.auditLog.findFirst({ where: { action: 'SUPPLIER_CREATE', entityId: supplierId }, orderBy: { createdAt: 'desc' } })
    ).toBeTruthy()
    // duplicate of the new name
    await errBody(await suppliersPOST(auth('/api/suppliers', admin, { body: { name: SUPPLIER_NAME, phone: '9876533333' } })), 409)
  })

  test('PATCH: rename, duplicate name → 409, phone update, no-op returns counts, PM 403', async () => {
    const admin = await loginAs(ADMIN_EMAIL)
    const renamed = await okBody<{ supplier: { name: string; phone: string; supplyTxnCount: number } }>(
      await supplierPATCH(
        auth(`/api/suppliers/${supplierId}`, admin, { method: 'PATCH', body: { name: `${SUPPLIER_NAME} Renamed` } }),
        P(supplierId)
      )
    )
    expect(renamed.data.supplier.name).toBe(`${SUPPLIER_NAME} Renamed`)
    expect(
      await db.auditLog.findFirst({ where: { action: 'SUPPLIER_UPDATE', entityId: supplierId }, orderBy: { createdAt: 'desc' } })
    ).toBeTruthy()

    await errBody(
      await supplierPATCH(
        auth(`/api/suppliers/${supplierId}`, admin, { method: 'PATCH', body: { name: 'Deccan Block Works' } }),
        P(supplierId)
      ),
      409
    )
    const phone = await okBody<{ supplier: { phone: string } }>(
      await supplierPATCH(auth(`/api/suppliers/${supplierId}`, admin, { method: 'PATCH', body: { phone: '9876544444' } }), P(supplierId))
    )
    expect(phone.data.supplier.phone).toBe('9876544444')

    // a no-change PATCH short-circuits and still returns the row with counts
    const noop = await okBody<{ supplier: { phone: string; supplyTxnCount: number } }>(
      await supplierPATCH(auth(`/api/suppliers/${supplierId}`, admin, { method: 'PATCH', body: { phone: '9876544444' } }), P(supplierId))
    )
    expect(noop.data.supplier.phone).toBe('9876544444')
    expect(typeof noop.data.supplier.supplyTxnCount).toBe('number')

    await errBody(
      await supplierPATCH(
        auth(`/api/suppliers/${supplierId}`, await loginAs(RIYA_EMAIL), { method: 'PATCH', body: { phone: '9876555555' } }),
        P(supplierId)
      ),
      403
    )
    await errBody(
      await supplierPATCH(auth('/api/suppliers/nope', admin, { method: 'PATCH', body: { phone: '9876555555' } }), P('nope')),
      404
    )
  })
})
