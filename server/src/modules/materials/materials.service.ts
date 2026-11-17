import type { MaterialCategory, Role } from '@prisma/client'
import { prisma } from '../../utils/prisma.js'
import { AppError } from '../../utils/errors.js'
import { logAudit, snapshot } from '../../shared/audit.js'
import type { CreateMaterialInput, MaterialListQuery, UpdateMaterialInput } from './materials.validator.js'

type Actor = { id: number; role: Role }

export async function listMaterials(query: MaterialListQuery) {
  return prisma.material.findMany({
    where: {
      ...(query.search ? { name: { contains: query.search, mode: 'insensitive' } } : {}),
      ...(query.category ? { category: query.category as MaterialCategory } : {}),
      ...(query.isActive === undefined ? {} : { isActive: query.isActive }),
    },
    orderBy: { name: 'asc' },
  })
}

export async function getMaterial(id: number) {
  const material = await prisma.material.findUnique({ where: { id } })
  if (!material) throw new AppError('NOT_FOUND', 'Material not found.', 404)
  return material
}

export async function createMaterial(actor: Actor, input: CreateMaterialInput) {
  return prisma.$transaction(async (tx) => {
    const material = await tx.material.create({
      data: {
        name: input.name,
        category: input.category as MaterialCategory,
        unit: input.unit,
        description: input.description ?? null,
      },
    })
    await logAudit(tx, {
      userId: actor.id,
      action: 'CREATE',
      entityType: 'Material',
      entityId: material.id,
      newValues: snapshot(material),
    })
    return material
  })
}

export async function updateMaterial(actor: Actor, id: number, input: UpdateMaterialInput) {
  const existing = await getMaterial(id)

  return prisma.$transaction(async (tx) => {
    const updated = await tx.material.update({
      where: { id },
      data: {
        ...(input.name === undefined ? {} : { name: input.name }),
        ...(input.category === undefined ? {} : { category: input.category as MaterialCategory }),
        ...(input.unit === undefined ? {} : { unit: input.unit }),
        ...(input.description === undefined ? {} : { description: input.description }),
      },
    })
    await logAudit(tx, {
      userId: actor.id,
      action: 'UPDATE',
      entityType: 'Material',
      entityId: id,
      oldValues: snapshot(existing),
      newValues: snapshot(updated),
    })
    return updated
  })
}

export async function updateMaterialStatus(actor: Actor, id: number, isActive: boolean) {
  const existing = await getMaterial(id)
  if (existing.isActive === isActive) return existing

  if (!isActive) {
    const activePlans = await prisma.projectMaterialPlan.count({
      where: { materialId: id, project: { status: 'ACTIVE' } },
    })
    if (activePlans > 0) {
      throw new AppError(
        'BUSINESS_RULE_VIOLATION',
        `Cannot deactivate a material used in ${activePlans} active project plan(s). Remove the plans first.`,
        422,
        { activePlanCount: activePlans },
      )
    }
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.material.update({ where: { id }, data: { isActive } })
    await logAudit(tx, {
      userId: actor.id,
      action: isActive ? 'ACTIVATE' : 'DEACTIVATE',
      entityType: 'Material',
      entityId: id,
      oldValues: { isActive: existing.isActive },
      newValues: { isActive },
    })
    return updated
  })
}
