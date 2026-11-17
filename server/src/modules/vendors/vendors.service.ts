import { Prisma, type VendorType } from '@prisma/client'
import { prisma } from '../../utils/prisma.js'
import { AppError } from '../../utils/errors.js'
import { projectAccess, type ProjectActor } from '../projects/projects.service.js'
import type { VendorInput, VendorListQuery, VendorUpdateInput } from './vendors.validator.js'

export type VendorActor = ProjectActor

export async function listVendors(actor: VendorActor, query: VendorListQuery) {
  const where = {
    ...(query.isActive === undefined ? {} : { isActive: query.isActive }),
    ...(query.search ? { OR: [
      { name: { contains: query.search, mode: 'insensitive' as const } },
      { gstin: { contains: query.search, mode: 'insensitive' as const } },
    ] } : {}),
    ...(actor.role === 'PM' ? {
      projectAssignments: { some: { unassignedAt: null, project: { assignedPmId: actor.id } } },
    } : {}),
  }
  return prisma.vendor.findMany({
    where,
    include: { projectAssignments: { where: { unassignedAt: null }, select: { projectId: true } } },
    orderBy: { name: 'asc' },
  })
}

export async function getVendor(actor: VendorActor, id: number) {
  const vendor = await prisma.vendor.findFirst({
    where: {
      id,
      ...(actor.role === 'PM' ? { projectAssignments: { some: { unassignedAt: null, project: { assignedPmId: actor.id } } } } : {}),
    },
    include: { projectAssignments: { include: { project: { select: { id: true, code: true, name: true } } }, orderBy: { assignedAt: 'desc' } } },
  })
  if (!vendor) throw new AppError('NOT_FOUND', 'Vendor not found.', 404)
  return vendor
}

export async function createVendor(actor: VendorActor, input: VendorInput) {
  return prisma.$transaction(async (tx) => {
    const vendor = await tx.vendor.create({
      data: {
        name: input.name,
        vendorType: input.vendorType as VendorType,
        gstin: input.gstin ?? null,
        phone: input.phone ?? null,
        email: input.email ?? null,
        contactPerson: input.contactPerson ?? null,
        address: input.address ?? null,
      },
    })
    await tx.auditLog.create({
      data: {
        userId: actor.id,
        action: 'CREATE',
        entityType: 'Vendor',
        entityId: vendor.id,
        newValues: {
          id: vendor.id,
          name: vendor.name,
          vendorType: vendor.vendorType,
          gstin: vendor.gstin,
          isActive: vendor.isActive,
        } satisfies Prisma.InputJsonValue,
      },
    })
    return vendor
  })
}

export async function updateVendor(actor: VendorActor, id: number, input: VendorUpdateInput) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.vendor.findUnique({ where: { id } })
    if (!existing) throw new AppError('NOT_FOUND', 'Vendor not found.', 404)
    const vendor = await tx.vendor.update({
      where: { id },
      data: {
        ...(input.name === undefined ? {} : { name: input.name }),
        ...(input.vendorType === undefined ? {} : { vendorType: input.vendorType as VendorType }),
        ...(input.gstin === undefined ? {} : { gstin: input.gstin }),
        ...(input.phone === undefined ? {} : { phone: input.phone }),
        ...(input.email === undefined ? {} : { email: input.email }),
        ...(input.contactPerson === undefined ? {} : { contactPerson: input.contactPerson }),
        ...(input.address === undefined ? {} : { address: input.address }),
      },
    })
    await tx.auditLog.create({
      data: {
        userId: actor.id,
        action: 'UPDATE',
        entityType: 'Vendor',
        entityId: id,
        oldValues: { id: existing.id, name: existing.name, vendorType: existing.vendorType, isActive: existing.isActive },
        newValues: { id: vendor.id, name: vendor.name, vendorType: vendor.vendorType, isActive: vendor.isActive },
      },
    })
    return vendor
  })
}

export async function deactivateVendor(actor: VendorActor, id: number) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.vendor.findUnique({ where: { id } })
    if (!existing) throw new AppError('NOT_FOUND', 'Vendor not found.', 404)
    const vendor = await tx.vendor.update({ where: { id }, data: { isActive: false } })
    await tx.auditLog.create({
      data: {
        userId: actor.id,
        action: 'UPDATE',
        entityType: 'Vendor',
        entityId: id,
        oldValues: { id: existing.id, name: existing.name, isActive: existing.isActive },
        newValues: { id: vendor.id, name: vendor.name, isActive: vendor.isActive },
      },
    })
    return vendor
  })
}

async function assertProject(actor: VendorActor, projectId: number) {
  const project = await prisma.project.findFirst({ where: { id: projectId, ...projectAccess(actor) }, select: { id: true } })
  if (!project) throw new AppError('NOT_FOUND', 'Project not found.', 404)
}

export async function listProjectVendors(actor: VendorActor, projectId: number) {
  await assertProject(actor, projectId)
  return prisma.projectVendorAssignment.findMany({
    where: { projectId, unassignedAt: null },
    include: { vendor: true },
    orderBy: { assignedAt: 'desc' },
  })
}

export async function assignVendor(actor: VendorActor, projectId: number, vendorId: number) {
  await assertProject(actor, projectId)
  const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } })
  if (!vendor) throw new AppError('NOT_FOUND', 'Vendor not found.', 404)
  const active = await prisma.projectVendorAssignment.findFirst({ where: { projectId, vendorId, unassignedAt: null } })
  if (active) throw new AppError('CONFLICT', 'Vendor is already assigned to this project.', 409)
  return prisma.$transaction(async (tx) => {
    const assignment = await tx.projectVendorAssignment.create({ data: { projectId, vendorId, assignedById: actor.id }, include: { vendor: true } })
    await tx.auditLog.create({
      data: { userId: actor.id, action: 'CREATE', entityType: 'ProjectVendorAssignment', entityId: assignment.id, newValues: { projectId, vendorId, assignedAt: assignment.assignedAt.toISOString() } },
    })
    return assignment
  })
}

export async function unassignVendor(actor: VendorActor, projectId: number, vendorId: number) {
  await assertProject(actor, projectId)
  const assignment = await prisma.projectVendorAssignment.findFirst({ where: { projectId, vendorId, unassignedAt: null } })
  if (!assignment) throw new AppError('NOT_FOUND', 'Active vendor assignment not found.', 404)
  return prisma.$transaction(async (tx) => {
    const updated = await tx.projectVendorAssignment.update({ where: { id: assignment.id }, data: { unassignedAt: new Date() } })
    await tx.auditLog.create({
      data: { userId: actor.id, action: 'UPDATE', entityType: 'ProjectVendorAssignment', entityId: updated.id, oldValues: { projectId, vendorId, unassignedAt: null }, newValues: { projectId, vendorId, unassignedAt: updated.unassignedAt?.toISOString() } },
    })
    return updated
  })
}
