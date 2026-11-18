import { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { ok, fail, guardAuth, pmOwns, readJson } from '@/lib/api-helpers'
import { writeAudit } from '@/lib/audit'
import { PLAN_STATUSES } from '@/lib/forgeos-types'
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

export async function GET(req: Request) {
  const auth = await guardAuth(req)
  if (!auth.ok) return auth.response
  const { user } = auth

  const url = new URL(req.url)
  const where: Prisma.MaterialPlanWhereInput = {}
  const projectId = url.searchParams.get('projectId')
  if (projectId) where.projectId = projectId
  const materialId = url.searchParams.get('materialId')
  if (materialId) where.materialId = materialId
  const status = url.searchParams.get('status')
  if (status) {
    if (!PLAN_STATUSES.includes(status as PlanStatus)) return fail('Invalid status filter')
    where.status = status
  }
  if (user.role === 'PROJECT_MANAGER') where.project = { pmId: user.id }

  const plans = await db.materialPlan.findMany({
    where,
    include: { project: true, material: true, createdBy: true },
    orderBy: { createdAt: 'desc' },
  })

  const items = await Promise.all(
    plans.map(async (plan) => toPlanRow(plan, await consumedQty(plan.projectId, plan.materialId)))
  )

  return ok({ items })
}

export async function POST(req: Request) {
  const auth = await guardAuth(req, ['ADMIN', 'PROJECT_MANAGER'])
  if (!auth.ok) return auth.response
  const { user } = auth

  const body = await readJson<Record<string, unknown>>(req)
  if (!body) return fail('Invalid request body')

  const projectId = typeof body.projectId === 'string' ? body.projectId : ''
  const project = projectId ? await db.project.findUnique({ where: { id: projectId } }) : null
  if (!project) return fail('Project not found', 404)
  if (!pmOwns(user, project.pmId)) return fail('You can only access your own projects', 403)

  const materialId = typeof body.materialId === 'string' ? body.materialId : ''
  const material = materialId ? await db.material.findUnique({ where: { id: materialId } }) : null
  if (!material || !material.isActive) return fail('Material not found or inactive')

  const plannedQty = num(body.plannedQty)
  if (!(plannedQty > 0)) return fail('Planned quantity must be greater than zero')

  const wastagePct = num(body.wastagePct)
  if (!(wastagePct >= 0 && wastagePct <= 100)) {
    return fail('Wastage percentage must be between 0 and 100')
  }

  const notes = typeof body.notes === 'string' && body.notes.trim() ? body.notes.trim() : null

  const existing = await db.materialPlan.findUnique({
    where: { projectId_materialId: { projectId, materialId } },
  })
  if (existing) return fail('A plan for this material already exists on this project', 409)

  try {
    const plan = await db.materialPlan.create({
      data: { projectId, materialId, plannedQty, wastagePct, notes, status: 'DRAFT', createdById: user.id },
      include: { project: true, material: true, createdBy: true },
    })

    await writeAudit({
      action: 'PLAN_CREATE',
      actorId: user.id,
      actorName: user.name,
      entityType: 'MATERIAL_PLAN',
      entityId: plan.id,
      meta: { project: project.name, material: material.name, plannedQty },
    })

    return ok({ plan: toPlanRow(plan, await consumedQty(projectId, materialId)) })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return fail('A plan for this material already exists on this project', 409)
    }
    throw err
  }
}
