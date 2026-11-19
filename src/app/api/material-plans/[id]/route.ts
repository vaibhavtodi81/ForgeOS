import type { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { fail, getClientIp, guardAuth, num, ok, optString, pmOwns, readJson } from '@/lib/api-helpers'
import { requirePermission } from '@/lib/rbac'
import { writeAudit } from '@/lib/audit'
import { ALLOWED_PLAN_TRANSITIONS, PLAN_STATUSES } from '@/lib/forgeos-types'
import type { PlanStatus } from '@/lib/forgeos-types'

const INCLUDE = {
  material: { select: { name: true, unit: true, category: true } },
  project: { select: { name: true, code: true } },
} satisfies Prisma.MaterialPlanInclude

function toPlanRow(plan: Prisma.MaterialPlanGetPayload<{ include: typeof INCLUDE }>) {
  return {
    id: plan.id,
    projectId: plan.projectId,
    materialId: plan.materialId,
    openingQuantity: plan.openingQuantity,
    plannedQuantity: plan.plannedQuantity,
    plannedUnitRate: plan.plannedUnitRate,
    lowStockThreshold: plan.lowStockThreshold,
    wastageThresholdPct: plan.wastageThresholdPct,
    status: plan.status as PlanStatus,
    notes: plan.notes,
    createdById: plan.createdById,
    createdAt: plan.createdAt.toISOString(),
    updatedAt: plan.updatedAt.toISOString(),
    material: plan.material,
    project: plan.project,
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePermission(req, 'plans:write')
  if (!auth.ok) return auth.response
  const { user } = auth
  const { id } = await params

  const body = await readJson<Record<string, unknown>>(req)
  if (!body) return fail('Invalid request body', 400)

  const existing = await db.materialPlan.findUnique({ where: { id }, include: INCLUDE })
  if (!existing) return fail('Material plan not found', 404)
  const project = await db.project.findUnique({ where: { id: existing.projectId } })
  if (!project) return fail('Project not found', 404)
  if (!pmOwns(user, project.assignedPmId)) {
    return fail('You are not assigned to this project', 403)
  }

  if (existing.status === 'ARCHIVED') {
    return fail('Archived plans cannot be edited', 409)
  }

  const data: Prisma.MaterialPlanUncheckedUpdateInput = {}
  const changes: Record<string, unknown> = {}

  if (body.openingQuantity !== undefined) {
    const openingQuantity = num(body.openingQuantity)
    if (!(openingQuantity >= 0)) return fail('Opening quantity must be zero or more', 400)
    data.openingQuantity = openingQuantity
    changes.openingQuantity = openingQuantity
  }
  if (body.plannedQuantity !== undefined) {
    const plannedQuantity = num(body.plannedQuantity)
    if (!(plannedQuantity > 0)) return fail('Planned quantity must be greater than zero', 400)
    data.plannedQuantity = plannedQuantity
    changes.plannedQuantity = plannedQuantity
  }
  if (body.plannedUnitRate !== undefined) {
    if (body.plannedUnitRate === null || body.plannedUnitRate === '') {
      data.plannedUnitRate = null
      changes.plannedUnitRate = null
    } else {
      const rate = num(body.plannedUnitRate)
      if (!(rate >= 0)) return fail('Planned unit rate must be zero or more', 400)
      data.plannedUnitRate = rate
      changes.plannedUnitRate = rate
    }
  }
  if (body.lowStockThreshold !== undefined) {
    if (body.lowStockThreshold === null || body.lowStockThreshold === '') {
      data.lowStockThreshold = null
      changes.lowStockThreshold = null
    } else {
      const threshold = num(body.lowStockThreshold)
      if (!(threshold >= 0)) return fail('Low stock threshold must be zero or more', 400)
      data.lowStockThreshold = threshold
      changes.lowStockThreshold = threshold
    }
  }
  if (body.wastageThresholdPct !== undefined) {
    if (body.wastageThresholdPct === null || body.wastageThresholdPct === '') {
      data.wastageThresholdPct = null
      changes.wastageThresholdPct = null
    } else {
      const pct = num(body.wastageThresholdPct)
      if (!(pct >= 0 && pct <= 100)) return fail('Wastage threshold must be between 0 and 100', 400)
      data.wastageThresholdPct = pct
      changes.wastageThresholdPct = pct
    }
  }
  if (body.notes !== undefined) {
    const notes = optString(body.notes)
    data.notes = notes
    changes.notes = notes
  }

  let statusChanged = false
  if (body.status !== undefined) {
    const status = body.status
    if (typeof status !== 'string' || !PLAN_STATUSES.includes(status as PlanStatus)) {
      return fail('Invalid status', 400)
    }
    const allowed = ALLOWED_PLAN_TRANSITIONS[existing.status as PlanStatus]
    if (!allowed.includes(status as PlanStatus)) {
      const targets = allowed.length > 0 ? allowed.join(', ') : 'none'
      return fail(`Cannot move a ${existing.status} plan to ${status} (allowed: ${targets})`, 409)
    }
    if (status !== existing.status) {
      data.status = status
      changes.status = status
      statusChanged = true
    }
  }

  const updated = await db.materialPlan.update({ where: { id }, data, include: INCLUDE })

  if (statusChanged) {
    await writeAudit({
      action: 'PLAN_STATUS',
      actorId: user.id,
      actorName: user.name,
      entityType: 'material-plan',
      entityId: id,
      projectId: existing.projectId,
      meta: { from: existing.status, to: updated.status },
      ip: getClientIp(req),
    })
  }
  if (Object.keys(changes).some((key) => key !== 'status')) {
    await writeAudit({
      action: 'PLAN_UPDATE',
      actorId: user.id,
      actorName: user.name,
      entityType: 'material-plan',
      entityId: id,
      projectId: existing.projectId,
      meta: changes,
      ip: getClientIp(req),
    })
  }

  return ok(toPlanRow(updated))
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePermission(req, 'plans:write')
  if (!auth.ok) return auth.response
  const { user } = auth
  const { id } = await params

  const existing = await db.materialPlan.findUnique({ where: { id }, include: INCLUDE })
  if (!existing) return fail('Material plan not found', 404)
  const project = await db.project.findUnique({ where: { id: existing.projectId } })
  if (!project) return fail('Project not found', 404)
  if (!pmOwns(user, project.assignedPmId)) {
    return fail('You are not assigned to this project', 403)
  }

  if (existing.status !== 'DRAFT') {
    return fail('Only draft plans can be deleted', 409)
  }

  await db.materialPlan.delete({ where: { id } })

  await writeAudit({
    action: 'PLAN_DELETE',
    actorId: user.id,
    actorName: user.name,
    entityType: 'material-plan',
    entityId: id,
    projectId: existing.projectId,
    meta: { material: existing.material.name, plannedQuantity: existing.plannedQuantity },
    ip: getClientIp(req),
  })

  return ok(null)
}
