import type { Role } from '@prisma/client'
import { prisma } from '../../utils/prisma.js'
import { AppError } from '../../utils/errors.js'
import { projectAccess } from '../projects/projects.service.js'
import { logAudit, snapshot } from '../../shared/audit.js'
import type { CreatePlanInput, UpdatePlanInput } from './material-plans.validator.js'

type Actor = { id: number; role: Role }

async function assertProjectAccess(actor: Actor, projectId: number) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, ...projectAccess(actor) },
    select: { id: true },
  })
  if (!project) throw new AppError('NOT_FOUND', 'Project not found.', 404)
  return project
}

async function loadPlanWithProject(actor: Actor, planId: number) {
  const plan = await prisma.projectMaterialPlan.findUnique({
    where: { id: planId },
    include: { project: { select: { id: true, assignedPmId: true } } },
  })
  if (!plan) throw new AppError('NOT_FOUND', 'Material plan not found.', 404)
  if (actor.role === 'PM' && plan.project.assignedPmId !== actor.id) {
    throw new AppError('FORBIDDEN', 'You do not have access to this project.', 403)
  }
  return plan
}

export async function listPlans(actor: Actor, projectId: number) {
  await assertProjectAccess(actor, projectId)
  return prisma.projectMaterialPlan.findMany({
    where: { projectId },
    include: { material: true },
    orderBy: { material: { name: 'asc' } },
  })
}

export async function createPlan(actor: Actor, projectId: number, input: CreatePlanInput) {
  await assertProjectAccess(actor, projectId)

  const material = await prisma.material.findUnique({ where: { id: input.materialId } })
  if (!material) throw new AppError('NOT_FOUND', 'Material not found.', 404)
  if (!material.isActive) throw new AppError('BUSINESS_RULE_VIOLATION', 'Material is inactive.', 422)

  const existing = await prisma.projectMaterialPlan.findUnique({
    where: { projectId_materialId: { projectId, materialId: input.materialId } },
  })
  if (existing) throw new AppError('CONFLICT', 'A plan already exists for this material in this project.', 409)

  return prisma.$transaction(async (tx) => {
    const plan = await tx.projectMaterialPlan.create({
      data: {
        projectId,
        materialId: input.materialId,
        openingQuantity: input.openingQuantity,
        plannedQuantity: input.plannedQuantity,
        plannedUnitRate: input.plannedUnitRate,
        lowStockThreshold: input.lowStockThreshold,
        wastageThresholdPct: input.wastageThresholdPct,
      },
      include: { material: true },
    })
    await logAudit(tx, {
      userId: actor.id,
      action: 'CREATE',
      entityType: 'ProjectMaterialPlan',
      entityId: plan.id,
      newValues: snapshot(plan),
    })
    return plan
  })
}

export async function updatePlan(actor: Actor, planId: number, input: UpdatePlanInput) {
  const existing = await loadPlanWithProject(actor, planId)

  return prisma.$transaction(async (tx) => {
    const updated = await tx.projectMaterialPlan.update({
      where: { id: planId },
      data: input,
      include: { material: true },
    })
    await logAudit(tx, {
      userId: actor.id,
      action: 'UPDATE',
      entityType: 'ProjectMaterialPlan',
      entityId: planId,
      oldValues: snapshot(existing),
      newValues: snapshot(updated),
    })
    return updated
  })
}

export async function deletePlan(actor: Actor, planId: number) {
  const existing = await loadPlanWithProject(actor, planId)

  const hasTransactions = await prisma.stockTransaction.findFirst({
    where: { projectId: existing.projectId, materialId: existing.materialId },
    select: { id: true },
  })
  if (hasTransactions) {
    throw new AppError('BUSINESS_RULE_VIOLATION', 'Cannot delete a plan that has stock transactions. Void the transactions first or deactivate the material instead.', 422)
  }

  return prisma.$transaction(async (tx) => {
    await tx.projectMaterialPlan.delete({ where: { id: planId } })
    await logAudit(tx, {
      userId: actor.id,
      action: 'DELETE',
      entityType: 'ProjectMaterialPlan',
      entityId: planId,
      oldValues: snapshot(existing),
    })
  })
}
