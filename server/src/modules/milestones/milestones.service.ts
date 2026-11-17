import { AuditAction, MilestoneStatus, type Prisma } from '@prisma/client'
import { prisma } from '../../utils/prisma.js'
import { AppError } from '../../utils/errors.js'
import { projectAccess, type ProjectActor } from '../projects/projects.service.js'
import type { CreateMilestoneInput, UpdateMilestoneInput } from './milestones.validator.js'

type MilestoneInput = CreateMilestoneInput | UpdateMilestoneInput

function dateAtUtcMidnight(value: string) {
  return new Date(`${value}T00:00:00.000Z`)
}

async function assertProjectAccess(actor: ProjectActor, projectId: number) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, ...projectAccess(actor) },
    select: { id: true },
  })
  if (!project) throw new AppError('NOT_FOUND', 'Project not found.', 404)
}

async function getMilestoneForActor(actor: ProjectActor, id: number) {
  const milestone = await prisma.projectMilestone.findUnique({
    where: { id },
    include: { project: { select: { id: true, code: true, name: true } } },
  })
  if (!milestone) throw new AppError('NOT_FOUND', 'Milestone not found.', 404)
  await assertProjectAccess(actor, milestone.projectId)
  return milestone
}

function validateDateRanges(input: {
  plannedStartDate?: Date | null
  plannedEndDate?: Date | null
  actualStartDate?: Date | null
  actualEndDate?: Date | null
}) {
  if (input.plannedStartDate && input.plannedEndDate && input.plannedEndDate < input.plannedStartDate) {
    throw new AppError('VALIDATION_ERROR', 'Planned end date must be on or after planned start date.', 400)
  }
  if (input.actualStartDate && input.actualEndDate && input.actualEndDate < input.actualStartDate) {
    throw new AppError('VALIDATION_ERROR', 'Actual end date must be on or after actual start date.', 400)
  }
}

function dateValue(value: string | null | undefined) {
  return value === undefined || value === null ? value : dateAtUtcMidnight(value)
}

function createData(input: CreateMilestoneInput) {
  const data = {
    name: input.name,
    description: input.description,
    sequence: input.sequence,
    plannedStartDate: dateValue(input.plannedStartDate),
    plannedEndDate: dateValue(input.plannedEndDate),
    actualStartDate: dateValue(input.actualStartDate),
    actualEndDate: dateValue(input.actualEndDate),
    status: input.status as MilestoneStatus,
    progressPercent: input.progressPercent,
  }
  validateDateRanges(data)
  return data
}

function snapshot(milestone: {
  id: number
  projectId: number
  name: string
  description: string | null
  sequence: number
  plannedStartDate: Date | null
  plannedEndDate: Date | null
  actualStartDate: Date | null
  actualEndDate: Date | null
  status: MilestoneStatus
  progressPercent: Prisma.Decimal
  createdAt: Date
  updatedAt: Date
}): Prisma.InputJsonValue {
  return {
    id: milestone.id,
    projectId: milestone.projectId,
    name: milestone.name,
    description: milestone.description,
    sequence: milestone.sequence,
    plannedStartDate: milestone.plannedStartDate?.toISOString() ?? null,
    plannedEndDate: milestone.plannedEndDate?.toISOString() ?? null,
    actualStartDate: milestone.actualStartDate?.toISOString() ?? null,
    actualEndDate: milestone.actualEndDate?.toISOString() ?? null,
    status: milestone.status,
    progressPercent: milestone.progressPercent.toString(),
    createdAt: milestone.createdAt.toISOString(),
    updatedAt: milestone.updatedAt.toISOString(),
  }
}

function changedSnapshot(
  existing: Awaited<ReturnType<typeof getMilestoneForActor>>,
  input: UpdateMilestoneInput,
  updated: Awaited<ReturnType<typeof getMilestoneForActor>>,
) {
  const oldData: Record<string, unknown> = { projectId: existing.projectId }
  const newData: Record<string, unknown> = { projectId: updated.projectId }
  for (const key of Object.keys(input) as (keyof UpdateMilestoneInput)[]) {
    oldData[key] = (snapshot(existing) as Record<string, unknown>)[key]
    newData[key] = (snapshot(updated) as Record<string, unknown>)[key]
  }
  return { oldData: oldData as Prisma.InputJsonValue, newData: newData as Prisma.InputJsonValue }
}

export async function createMilestone(actor: ProjectActor, projectId: number, input: CreateMilestoneInput) {
  await assertProjectAccess(actor, projectId)
  const data = createData(input)
  return prisma.$transaction(async (tx) => {
    const milestone = await tx.projectMilestone.create({
      data: { ...data, projectId },
      include: { project: { select: { id: true, code: true, name: true } } },
    })
    await tx.auditLog.create({
      data: {
        userId: actor.id,
        action: AuditAction.CREATE,
        entityType: 'ProjectMilestone',
        entityId: milestone.id,
        newValues: snapshot(milestone),
      },
    })
    return milestone
  })
}

export async function listMilestones(actor: ProjectActor, projectId: number) {
  await assertProjectAccess(actor, projectId)
  return prisma.projectMilestone.findMany({
    where: { projectId },
    orderBy: [{ sequence: 'asc' }, { plannedStartDate: 'asc' }, { id: 'asc' }],
  })
}

export async function getMilestone(actor: ProjectActor, id: number) {
  return getMilestoneForActor(actor, id)
}

export async function updateMilestone(actor: ProjectActor, id: number, input: UpdateMilestoneInput) {
  const existing = await getMilestoneForActor(actor, id)
  const data = Object.fromEntries(Object.entries(input).map(([key, value]) => [
    key,
    key.endsWith('Date') ? dateValue(value as string | null | undefined) : value,
  ]))
  const merged: {
    plannedStartDate: Date | null
    plannedEndDate: Date | null
    actualStartDate: Date | null
    actualEndDate: Date | null
  } = {
    plannedStartDate: data.plannedStartDate === undefined ? existing.plannedStartDate : data.plannedStartDate as Date | null,
    plannedEndDate: data.plannedEndDate === undefined ? existing.plannedEndDate : data.plannedEndDate as Date | null,
    actualStartDate: data.actualStartDate === undefined ? existing.actualStartDate : data.actualStartDate as Date | null,
    actualEndDate: data.actualEndDate === undefined ? existing.actualEndDate : data.actualEndDate as Date | null,
  }
  validateDateRanges(merged)
  return prisma.$transaction(async (tx) => {
    const updated = await tx.projectMilestone.update({
      where: { id },
      data: data as Prisma.ProjectMilestoneUpdateInput,
      include: { project: { select: { id: true, code: true, name: true } } },
    })
    const changes = changedSnapshot(existing, input, updated)
    await tx.auditLog.create({
      data: {
        userId: actor.id,
        action: AuditAction.UPDATE,
        entityType: 'ProjectMilestone',
        entityId: id,
        oldValues: changes.oldData,
        newValues: changes.newData,
      },
    })
    return updated
  })
}

export async function deleteMilestone(actor: ProjectActor, id: number) {
  const existing = await getMilestoneForActor(actor, id)
  await prisma.$transaction(async (tx) => {
    await tx.projectMilestone.delete({ where: { id } })
    await tx.auditLog.create({
      data: {
        userId: actor.id,
        action: AuditAction.DELETE,
        entityType: 'ProjectMilestone',
        entityId: id,
        oldValues: snapshot(existing),
      },
    })
  })
}
