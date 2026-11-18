import { db } from '@/lib/db'
import { ok, fail, guardAuth, getClientIp, readJson } from '@/lib/api-helpers'
import { writeAudit } from '@/lib/audit'
import type { MaterialRow } from '@/lib/forgeos-types'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await guardAuth(req, ['ADMIN'])
  if (!auth.ok) return auth.response

  const { id } = await params
  const body = await readJson<{ isActive?: unknown }>(req)
  if (!body) return fail('Invalid request body', 400)
  if (typeof body.isActive !== 'boolean') {
    return fail('isActive must be a boolean', 400)
  }

  const existing = await db.material.findUnique({ where: { id } })
  if (!existing) return fail('Material not found', 404)

  const material = await db.material.update({
    where: { id },
    data: { isActive: body.isActive },
    include: {
      transactions: {
        where: { txnType: 'IN', voidedAt: null },
        orderBy: { txnDate: 'desc' },
        take: 1,
        select: { unitRate: true },
      },
    },
  })

  await writeAudit({
    action: body.isActive ? 'MATERIAL_ACTIVATE' : 'MATERIAL_DEACTIVATE',
    actorId: auth.user.id,
    actorName: auth.user.name,
    entityType: 'material',
    entityId: material.id,
    meta: { name: material.name },
    ip: getClientIp(req),
  })

  const row: MaterialRow = {
    id: material.id,
    name: material.name,
    unit: material.unit,
    category: material.category,
    isActive: material.isActive,
    lastRate: material.transactions[0]?.unitRate ?? null,
  }
  return ok({ material: row })
}
