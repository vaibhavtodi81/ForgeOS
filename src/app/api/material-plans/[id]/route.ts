import { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { ok, fail, guardAuth, pmOwns, readJson } from '@/lib/api-helpers'
import { writeAudit } from '@/lib/audit'
import { ALLOWED_PLAN_TRANSITIONS, PLAN_STATUSES } from '@/lib/forgeos-types'
import type { PlanRow, PlanStatus } from '@/lib/forgeos-types'

type PlanWithRefs = Prisma.MaterialPlanGetPayload<{
  include: { project: true; material: true; createdBy: true }
}>

function num(value: unknown): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    if (!Number.isNaN(parsed)) return parsed
  }
  return NaN
}

async function consumedQty(projectId: string, materialId: string): Promise<number> {
  const agg = await db.inventoryTransaction.aggregate({
    where: { projectId, materialId, txnType: 'OUT', voidedAt: null },
    _sum: { quantity: true },
  })
  return agg._sum.quantity ?? 0
}

function toPlanRow(plan: PlanWithRefs, consumed: number): PlanRow {
  return {
    id: plan.id,
    projectId: plan.projectId,
    projectName: plan.project.name,
    materialId: plan.materialId,
    materialName: plan.material.name,
    unit: plan.material.unit,
    plannedQty: plan.plannedQty,
    wastagePct: plan.wastagePct,
    status: plan.status as PlanStatus,
    notes: plan.notes,
    createdByName: plan.createdBy.name,
    createdAt: plan.createdAt.toISOString(),
    consumedQty: consumed,
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await guardAuth(req, ['ADMIN', 'PROJECT_MANAGER'])
  if (!auth.ok) return auth.response
  const { user } = auth
  const { id } = await params

  const body = await readJson<Record<string, unknown>>(req)
  if (!body) return fail('Invalid request body')

  const plan = await db.materialPlan.findUnique({
    where: { id },
    include: { project: true, material: true, createdBy: true },
  })
  if (!plan) return fail('Plan not found', 404)
  if (!pmOwns(user, plan.project.pmId)) return fail('You can only access your own projects', 403)

  if (plan.status === 'ARCHIVED') return fail('Archived plans cannot be edited')

  const data: Prisma.MaterialPlanUncheckedUpdateInput = {}
  const changes: Record<string, unknown> = {}

  if (body.plannedQty !== undefined) {
    const plannedQty = num(body.plannedQty)
    if (!(plannedQty > 0)) return fail('Planned quantity must be greater than zero')
    if (plannedQty !== plan.plannedQty) {
      data.plannedQty = plannedQty
      changes.plannedQty = plannedQty
    }
  }
  if (body.wastagePct !== undefined) {
    const wastagePct = num(body.wastagePct)
    if (!(wastagePct >= 0 && wastagePct <= 100)) {
      return fail('Wastage percentage must be between 0 and 100')
    }
    if (wastagePct !== plan.wastagePct) {
      data.wastagePct = wastagePct
      changes.wastagePct = wastagePct
    }
  }
  if (body.notes !== undefined) {
    const notes = typeof body.notes === 'string' && body.notes.trim() ? body.notes.trim() : null
    if (notes !== plan.notes) {
      data.notes = notes
      changes.notes = notes
    }
  }

  let statusChanged = false
  if (body.status !== undefined) {
    const status = body.status
    if (typeof status !== 'string' || !PLAN_STATUSES.includes(status as PlanStatus)) {
      return fail('Invalid status')
    }
    const allowed = ALLOWED_PLAN_TRANSITIONS[plan.status as PlanStatus]
    if (!allowed.includes(status as PlanStatus)) {
      const targets = allowed.length > 0 ? allowed.join(', ') : 'none'
      return fail(`Cannot move a ${plan.status} plan to ${status} (allowed: ${targets})`)
    }
    if (status !== plan.status) {
      data.status = status
      changes.status = status
      statusChanged = true
    }
  }

  const updated = await db.materialPlan.update({
    where: { id },
    data,
    include: { project: true, material: true, createdBy: true },
  })

  if (Object.keys(changes).length > 0) {
    await writeAudit({
      action: 'PLAN_UPDATE',
      actorId: user.id,
      actorName: user.name,
      entityType: 'MATERIAL_PLAN',
      entityId: id,
      meta: changes,
    })
  }
  if (statusChanged) {
    await writeAudit({
      action: 'PLAN_STATUS_CHANGE',
      actorId: user.id,
      actorName: user.name,
      entityType: 'MATERIAL_PLAN',
      entityId: id,
      meta: { from: plan.status, to: updated.status },
    })
  }

  return ok({ plan: toPlanRow(updated, await consumedQty(updated.projectId, updated.materialId)) })
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await guardAuth(req, ['ADMIN', 'PROJECT_MANAGER'])
  if (!auth.ok) return auth.response
  const { user } = auth
  const { id } = await params

  const plan = await db.materialPlan.findUnique({
    where: { id },
    include: { project: true, material: true },
  })
  if (!plan) return fail('Plan not found', 404)
  if (!pmOwns(user, plan.project.pmId)) return fail('You can only access your own projects', 403)

  if (plan.status !== 'DRAFT') return fail('Only draft plans can be deleted', 409)

  await db.materialPlan.delete({ where: { id } })
  await writeAudit({
    action: 'PLAN_DELETE',
    actorId: user.id,
    actorName: user.name,
    entityType: 'MATERIAL_PLAN',
    entityId: id,
    meta: { project: plan.project.name, material: plan.material.name },
  })

  return ok({ ok: true })
}
