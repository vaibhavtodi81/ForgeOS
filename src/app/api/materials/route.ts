import type { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { fail, getClientIp, guardAuth, ok, optString, readJson } from '@/lib/api-helpers'
import { requirePermission } from '@/lib/rbac'
import { writeAudit } from '@/lib/audit'
import { MATERIAL_CATEGORIES } from '@/lib/forgeos-types'
import type { MaterialCategory } from '@/lib/forgeos-types'

type MaterialRow = Prisma.MaterialGetPayload<Record<string, never>>

function toMaterialJson(m: MaterialRow) {
  return {
    id: m.id,
    name: m.name,
    category: m.category as MaterialCategory,
    unit: m.unit,
    description: m.description,
    isActive: m.isActive,
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt.toISOString(),
  }
}

export async function GET(req: Request) {
  const auth = await guardAuth(req)
  if (!auth.ok) return auth.response

  const url = new URL(req.url)
  const search = url.searchParams.get('search')?.trim()
  const category = url.searchParams.get('category')
  const isActive = url.searchParams.get('isActive')

  const where: Prisma.MaterialWhereInput = {
    ...(search ? { name: { contains: search } } : {}),
    ...(category ? { category } : {}),
    ...(isActive === 'true' ? { isActive: true } : isActive === 'false' ? { isActive: false } : {}),
  }

  const materials = await db.material.findMany({ where, orderBy: { name: 'asc' } })
  return ok(materials.map(toMaterialJson))
}

export async function POST(req: Request) {
  const auth = await requirePermission(req, 'materials:write')
  if (!auth.ok) return auth.response

  const body = await readJson<Record<string, unknown>>(req)
  if (!body) return fail('Invalid request body', 400)

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  if (name.length < 2) return fail('Name must be at least 2 characters', 400)

  const category = typeof body.category === 'string' ? body.category : ''
  if (!MATERIAL_CATEGORIES.includes(category as MaterialCategory)) {
    return fail(`Category must be one of: ${MATERIAL_CATEGORIES.join(', ')}`, 400)
  }

  const unit = typeof body.unit === 'string' ? body.unit.trim() : ''
  if (!unit) return fail('Unit is required', 400)

  const existing = await db.material.findUnique({ where: { name } })
  if (existing) return fail('A material with this name already exists', 409)

  const material = await db.material.create({
    data: { name, category, unit, description: optString(body.description) },
  })

  await writeAudit({
    action: 'MATERIAL_CREATE',
    actorId: auth.user.id,
    actorName: auth.user.name,
    entityType: 'material',
    entityId: material.id,
    meta: { name, category, unit },
    ip: getClientIp(req),
  })

  return ok(toMaterialJson(material))
}
