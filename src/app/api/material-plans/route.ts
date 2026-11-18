import type { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { fail, getClientIp, guardAuth, ok, pmOwns, readJson } from '@/lib/api-helpers'
import { writeAudit } from '@/lib/audit'
import { PLAN_STATUSES } from '@/lib/forgeos-types'
import type { PlanStatus } from '@/lib/forgeos-types'

type PlanWithRefs = Prisma.MaterialPlanGetPayload<{
  include: {
    material: { select: { name: true; unit: true; category: true } }
    project: { select: { name: true; code: true } }
  }
}>

const INCLUDE = {
  material: { select: { name: true, unit: true, category: true } },
  project: { select: { name: true, code: true } },
} satisfies Prisma.MaterialPlanInclude

function toPlanRow(plan: PlanWithRefs) {
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

export async function GET(req: Request) {
  const auth = await guardAuth(req)
  if (!auth.ok) return auth.response

  const url = new URL(req.url)
  const where: Prisma.MaterialPlanWhereInput = {}
  const projectId = url.searchParams.get('projectId')
  if (projectId) where.projectId = projectId
  const materialId = url.searchParams.get('materialId')
  if (materialId) where.materialId = materialId
  const status = url.searchParams.get('status')
  if (status) {
    if (!PLAN_STATUSES.includes(status as PlanStatus)) {
      return fail(`status must be one of: ${PLAN_STATUSES.join(', ')}`, 400)
    }
    where.status = status
  }
  if (auth.user.role === 'PM') where.project = { assignedPmId: auth.user.id }

  const plans = await db.materialPlan.findMany({
    where,
    include: INCLUDE,
    orderBy: [{ project: { code: 'asc' } }, { material: { name: 'asc' } }],
  })

  return ok(plans.map(toPlanRow))
}

interface CreatePlanInput {
  projectId: string
  materialId: string
  openingQuantity: number
  plannedQuantity: number
  plannedUnitRate: number | null
  lowStockThreshold: number | null
  wastageThresholdPct: number | null
  notes: string | null
}

function parseCreateBody(body: Record<string, unknown>): { error: string | null; input: CreatePlanInput | null } {
  const projectId = typeof body.projectId === 'string' ? body.projectId : ''
  if (!projectId) return { error: 'projectId is required', input: null }

  const materialId = typeof body.materialId === 'string' ? body.materialId : ''
  if (!materialId) return { error: 'materialId is required', input: null }

  const openingQuantity = body.openingQuantity === undefined ? 0 : Number(body.openingQuantity)
  if (!(openingQuantity >= 0)) return { error: 'Opening quantity must be zero or more', input: null }

  const plannedQuantity = Number(body.plannedQuantity)
  if (!(plannedQuantity > 0)) return { error: 'Planned quantity must be greater than zero', input: null }

  let plannedUnitRate: number | null = null
  if (body.plannedUnitRate !== undefined && body.plannedUnitRate !== null && body.plannedUnitRate !== '') {
    const rate = Number(body.plannedUnitRate)
    if (!(rate >= 0)) return { error: 'Planned unit rate must be zero or more', input: null }
    plannedUnitRate = rate
  }

  let lowStockThreshold: number | null = null
  if (body.lowStockThreshold !== undefined && body.lowStockThreshold !== null && body.lowStockThreshold !== '') {
    const threshold = Number(body.lowStockThreshold)
    if (!(threshold >= 0)) return { error: 'Low stock threshold must be zero or more', input: null }
    lowStockThreshold = threshold
  }

  let wastageThresholdPct: number | null = null
  if (body.wastageThresholdPct !== undefined && body.wastageThresholdPct !== null && body.wastageThresholdPct !== '') {
    const pct = Number(body.wastageThresholdPct)
    if (!(pct >= 0 && pct <= 100)) return { error: 'Wastage threshold must be between 0 and 100', input: null }
    wastageThresholdPct = pct
  }

  const notes = typeof body.notes === 'string' && body.notes.trim() ? body.notes.trim() : null

  return {
    error: null,
    input: {
      projectId,
      materialId,
      openingQuantity,
      plannedQuantity,
      plannedUnitRate,
      lowStockThreshold,
      wastageThresholdPct,
      notes,
    },
  }
}

export async function POST(req: Request) {
  const auth = await guardAuth(req, ['PM'])
  if (!auth.ok) return auth.response
  const { user } = auth

  const body = await readJson<Record<string, unknown>>(req)
  if (!body) return fail('Invalid request body', 400)

  const { error, input } = parseCreateBody(body)
  if (error || !input) return fail(error ?? 'Invalid request body', 400)

  const project = await db.project.findUnique({ where: { id: input.projectId } })
  if (!project) return fail('Project not found', 404)
  if (!pmOwns(user, project.assignedPmId)) {
    return fail('You are not assigned to this project', 403)
  }

  const material = await db.material.findUnique({ where: { id: input.materialId } })
  if (!material) return fail('Material not found', 404)
  if (!material.isActive) return fail('Material is inactive', 422)

  const existing = await db.materialPlan.findUnique({
    where: { projectId_materialId: { projectId: input.projectId, materialId: input.materialId } },
  })
  if (existing) return fail('A plan already exists for this material in this project', 409)

  const plan = await db.materialPlan.create({
    data: { ...input, status: 'DRAFT', createdById: user.id },
    include: INCLUDE,
  })

  await writeAudit({
    action: 'PLAN_CREATE',
    actorId: user.id,
    actorName: user.name,
    entityType: 'material-plan',
    entityId: plan.id,
    projectId: plan.projectId,
    meta: {
      project: project.name,
      material: material.name,
      plannedQuantity: plan.plannedQuantity,
    },
    ip: getClientIp(req),
  })

  return ok(toPlanRow(plan))
}
