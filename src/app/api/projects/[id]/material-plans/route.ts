import type { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { fail, guardAuth, ok, pmOwns } from '@/lib/api-helpers'
import type { PlanStatus } from '@/lib/forgeos-types'

const INCLUDE = {
  material: { select: { name: true, unit: true, category: true } },
  project: { select: { name: true, code: true } },
} satisfies Prisma.MaterialPlanInclude

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await guardAuth(req)
  if (!auth.ok) return auth.response
  const { id } = await params

  const project = await db.project.findUnique({ where: { id } })
  if (!project) return fail('Project not found', 404)
  if (!pmOwns(auth.user, project.assignedPmId)) {
    return fail('You are not assigned to this project', 403)
  }

  const plans = await db.materialPlan.findMany({
    where: { projectId: id },
    include: INCLUDE,
    orderBy: { material: { name: 'asc' } },
  })

  return ok(
    plans.map((plan) => ({
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
    }))
  )
}
