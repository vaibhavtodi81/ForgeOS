import type { Role } from '@prisma/client'
import { prisma } from '../../utils/prisma.js'
import { AppError } from '../../utils/errors.js'
import { logAudit, snapshot } from '../../shared/audit.js'

type Actor = { id: number; role: Role }

function access(actor: Actor) {
  return actor.role === 'ADMIN' ? {} : { projects: { some: { assignedPmId: actor.id } } }
}

export async function listLands(actor: Actor, page: number, pageSize: number, search?: string) {
  const where = {
    ...access(actor),
    ...(search ? { OR: [{ name: { contains: search, mode: 'insensitive' as const } }, { city: { contains: search, mode: 'insensitive' as const } }] } : {}),
  }
  const [lands, total] = await prisma.$transaction([
    prisma.land.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.land.count({ where }),
  ])
  return { lands, meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } }
}

export async function getLand(actor: Actor, id: number) {
  const land = await prisma.land.findFirst({ where: { id, ...access(actor) } })
  if (!land) throw new AppError('NOT_FOUND', 'Land not found.', 404)
  return land
}

export async function createLand(actor: Actor, input: Record<string, unknown>) {
  return prisma.$transaction(async (tx) => {
    const land = await tx.land.create({ data: { ...input, createdById: actor.id } as never })
    await logAudit(tx, {
      userId: actor.id,
      action: 'CREATE',
      entityType: 'Land',
      entityId: land.id,
      newValues: snapshot(land),
    })
    return land
  })
}

export async function updateLand(actor: Actor, id: number, input: Record<string, unknown>) {
  const existing = await prisma.land.findUnique({ where: { id } })
  if (!existing) throw new AppError('NOT_FOUND', 'Land not found.', 404)

  return prisma.$transaction(async (tx) => {
    const updated = await tx.land.update({ where: { id }, data: input as never })
    await logAudit(tx, {
      userId: actor.id,
      action: 'UPDATE',
      entityType: 'Land',
      entityId: id,
      oldValues: snapshot(existing),
      newValues: snapshot(updated),
    })
    return updated
  })
}

export async function deleteLand(actor: Actor, id: number) {
  const land = await prisma.land.findUnique({ where: { id }, select: { id: true, _count: { select: { projects: true } } } })
  if (!land) throw new AppError('NOT_FOUND', 'Land not found.', 404)
  if (land._count.projects > 0) throw new AppError('BUSINESS_RULE_VIOLATION', 'Land cannot be deleted while projects depend on it.', 409)

  return prisma.$transaction(async (tx) => {
    await tx.land.delete({ where: { id } })
    await logAudit(tx, {
      userId: actor.id,
      action: 'DELETE',
      entityType: 'Land',
      entityId: id,
      oldValues: snapshot(land),
    })
  })
}
