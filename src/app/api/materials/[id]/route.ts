import type { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { fail, getClientIp, guardAuth, ok, optString, readJson } from '@/lib/api-helpers'
import { requirePermission } from '@/lib/rbac'
import { writeAudit } from '@/lib/audit'
import { MATERIAL_CATEGORIES } from '@/lib/forgeos-types'
import type { MaterialCategory } from '@/lib/forgeos-types'

function toMaterialJson(m: Prisma.MaterialGetPayload<Record<string, never>>) {
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

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePermission(req, 'materials:write')
  if (!auth.ok) return auth.response
  const { user } = auth
  const { id } = await params

  const body = await readJson<Record<string, unknown>>(req)
  if (!body) return fail('Invalid request body', 400)

  const existing = await db.material.findUnique({ where: { id } })
  if (!existing) return fail('Material not found', 404)

  const data: Prisma.MaterialUncheckedUpdateInput = {}
  const changes: Record<string, unknown> = {}

  if (body.name !== undefined) {
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    if (name.length < 2) return fail('Name must be at least 2 characters', 400)
    if (name !== existing.name) {
      const duplicate = await db.material.findUnique({ where: { name } })
      if (duplicate) return fail('A material with this name already exists', 409)
      data.name = name
      changes.name = name
    }
  }
  if (body.category !== undefined) {
    const category = typeof body.category === 'string' ? body.category : ''
    if (!MATERIAL_CATEGORIES.includes(category as MaterialCategory)) {
      return fail(`Category must be one of: ${MATERIAL_CATEGORIES.join(', ')}`, 400)
    }
    data.category = category
    changes.category = category
  }
  if (body.unit !== undefined) {
    const unit = typeof body.unit === 'string' ? body.unit.trim() : ''
    if (!unit) return fail('Unit cannot be empty', 400)
    data.unit = unit
    changes.unit = unit
  }
  if (body.description !== undefined) {
    const description = optString(body.description)
    data.description = description
    changes.description = description
  }
  if (body.isActive !== undefined) {
    if (typeof body.isActive !== 'boolean') return fail('isActive must be a boolean', 400)
    if (body.isActive !== existing.isActive) {
      if (!body.isActive) {
        const activePlans = await db.materialPlan.count({
          where: { materialId: id, project: { status: 'ACTIVE' } },
        })
        if (activePlans > 0) {
          return fail(
            `Cannot deactivate a material used in ${activePlans} active project plan(s). Remove the plans first.`,
            422
          )
        }
      }
      data.isActive = body.isActive
      changes.isActive = body.isActive
    }
  }

  if (Object.keys(data).length === 0) return ok(toMaterialJson(existing))

  const updated = await db.material.update({ where: { id }, data })

  const ip = getClientIp(req)
  if (typeof changes.isActive === 'boolean' && Object.keys(changes).length === 1) {
    await writeAudit({
      action: changes.isActive ? 'ACTIVATE' : 'DEACTIVATE',
      actorId: user.id,
      actorName: user.name,
      entityType: 'material',
      entityId: id,
      meta: { name: updated.name, isActive: updated.isActive },
      ip,
    })
  } else {
    await writeAudit({
      action: 'MATERIAL_UPDATE',
      actorId: user.id,
      actorName: user.name,
      entityType: 'material',
      entityId: id,
      meta: changes,
      ip,
    })
  }

  return ok(toMaterialJson(updated))
}
