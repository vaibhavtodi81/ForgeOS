import { db } from '@/lib/db'
import { ok, fail, guardAuth, getClientIp, readJson } from '@/lib/api-helpers'
import { writeAudit } from '@/lib/audit'
import type { MaterialRow } from '@/lib/forgeos-types'

function toMaterialRow(
  m: { id: string; name: string; unit: string; category: string; isActive: boolean },
  lastRate: number | null
): MaterialRow {
  return { id: m.id, name: m.name, unit: m.unit, category: m.category, isActive: m.isActive, lastRate }
}

const lastRateInclude = {
  transactions: {
    where: { txnType: 'IN', voidedAt: null },
    orderBy: { txnDate: 'desc' },
    take: 1,
    select: { unitRate: true },
  },
} as const

export async function GET(req: Request) {
  const auth = await guardAuth(req)
  if (!auth.ok) return auth.response

  const materials = await db.material.findMany({
    orderBy: { name: 'asc' },
    include: lastRateInclude,
  })

  return ok({
    items: materials.map((m) => toMaterialRow(m, m.transactions[0]?.unitRate ?? null)),
  })
}

export async function POST(req: Request) {
  const auth = await guardAuth(req, ['ADMIN'])
  if (!auth.ok) return auth.response

  const body = await readJson<{ name?: unknown; unit?: unknown; category?: unknown }>(req)
  if (!body) return fail('Invalid request body', 400)

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const unit = typeof body.unit === 'string' ? body.unit.trim() : ''
  const category = typeof body.category === 'string' ? body.category.trim() : ''

  if (name.length < 2) return fail('Name must be at least 2 characters', 400)
  if (unit.length < 1) return fail('Unit is required', 400)
  if (category.length < 2) return fail('Category must be at least 2 characters', 400)

  const material = await db.material.create({
    data: { name, unit, category, isActive: true },
  })

  await writeAudit({
    action: 'MATERIAL_CREATE',
    actorId: auth.user.id,
    actorName: auth.user.name,
    entityType: 'material',
    entityId: material.id,
    meta: { name, unit },
    ip: getClientIp(req),
  })

  return ok({ material: toMaterialRow(material, null) })
}
