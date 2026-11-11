import { AuditAction, Role, type Prisma } from '@prisma/client'
import { prisma } from '../../utils/prisma.js'
import { AppError } from '../../utils/errors.js'
import type {
  DailyLogInput,
  DailyLogListQuery,
  DailyLogPatch,
} from './daily-logs.validator.js'

type AuthUser = { id: number; role: Role }
type DailyLogWithEntries = Prisma.DailyLogGetPayload<{
  include: { labourEntries: true; machineryEntries: true }
}>
const EDIT_WINDOW_HOURS = 48

function dateAtUtcMidnight(value: string) {
  return new Date(`${value}T00:00:00.000Z`)
}

function todayAtUtcMidnight() {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
}

function assertProgressOrder(
  progress: number,
  previous: { progressPercent: Prisma.Decimal } | null,
  next: { progressPercent: Prisma.Decimal } | null,
) {
  if (previous && progress < previous.progressPercent.toNumber()) {
    throw new AppError('BUSINESS_RULE_VIOLATION', 'Progress cannot decrease from the previous log.', 422)
  }
  if (next && progress > next.progressPercent.toNumber()) {
    throw new AppError('BUSINESS_RULE_VIOLATION', 'Progress cannot exceed the following log.', 422)
  }
}

async function assertProjectAccess(user: AuthUser, projectId: number) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, status: true, assignedPmId: true },
  })
  if (!project) {
    throw new AppError('NOT_FOUND', 'Project not found.', 404)
  }
  if (user.role !== Role.ADMIN && project.assignedPmId !== user.id) {
    throw new AppError('FORBIDDEN', 'You are not assigned to this project.', 403)
  }
  return project
}

async function assertDateAvailable(projectId: number, logDate: Date, id?: number) {
  const existing = await prisma.dailyLog.findUnique({
    where: { projectId_logDate: { projectId, logDate } },
    select: { id: true },
  })
  if (existing && existing.id !== id) {
    throw new AppError('CONFLICT', 'A daily log already exists for this project and date.', 409)
  }
}

async function assertLogAccess(user: AuthUser, id: number) {
  const log = await prisma.dailyLog.findUnique({
    where: { id },
    include: { labourEntries: true, machineryEntries: true },
  })
  if (!log) {
    throw new AppError('NOT_FOUND', 'Daily log not found.', 404)
  }
  await assertProjectAccess(user, log.projectId)
  if (user.role === Role.PM) {
    const ageHours = (Date.now() - log.createdAt.getTime()) / 3_600_000
    if (ageHours > EDIT_WINDOW_HOURS) {
      throw new AppError('BUSINESS_RULE_VIOLATION', 'Project Managers can edit logs only within 48 hours of creation.', 422)
    }
  }
  return log
}

function auditSnapshot(log: DailyLogWithEntries): Prisma.InputJsonValue {
  return {
    id: log.id,
    projectId: log.projectId,
    logDate: log.logDate.toISOString(),
    progressPercent: log.progressPercent.toString(),
    workSummary: log.workSummary,
    weather: log.weather,
    issues: log.issues,
    createdById: log.createdById,
    createdAt: log.createdAt.toISOString(),
    updatedAt: log.updatedAt.toISOString(),
    labourEntries: log.labourEntries.map((entry) => ({
      id: entry.id,
      trade: entry.trade,
      contractorName: entry.contractorName,
      headCount: entry.headCount,
      hoursWorked: entry.hoursWorked.toString(),
      remarks: entry.remarks,
    })),
    machineryEntries: log.machineryEntries.map((entry) => ({
      id: entry.id,
      machineName: entry.machineName,
      operatorName: entry.operatorName,
      hoursUsed: entry.hoursUsed.toString(),
      fuelLitres: entry.fuelLitres?.toString() ?? null,
      remarks: entry.remarks,
    })),
  }
}

function childCreateData(input: DailyLogInput | DailyLogPatch) {
  return {
    labour: input.labourEntries?.map((entry) => ({
      trade: entry.trade,
      contractorName: entry.contractorName,
      headCount: entry.headCount,
      hoursWorked: entry.hoursWorked,
      remarks: entry.remarks,
    })),
    machinery: input.machineryEntries?.map((entry) => ({
      machineName: entry.machineName,
      operatorName: entry.operatorName,
      hoursUsed: entry.hoursUsed,
      fuelLitres: entry.fuelLitres,
      remarks: entry.remarks,
    })),
  }
}

export async function listDailyLogs(
  user: AuthUser,
  projectId: number,
  query: DailyLogListQuery,
) {
  await assertProjectAccess(user, projectId)
  const where: Prisma.DailyLogWhereInput = {
    projectId,
    ...(query.from || query.to ? {
      logDate: {
        ...(query.from ? { gte: dateAtUtcMidnight(query.from) } : {}),
        ...(query.to ? { lte: dateAtUtcMidnight(query.to) } : {}),
      },
    } : {}),
  }
  const [logs, total] = await prisma.$transaction([
    prisma.dailyLog.findMany({
      where,
      orderBy: { logDate: 'desc' },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      include: {
        labourEntries: { select: { headCount: true } },
        machineryEntries: { select: { hoursUsed: true } },
      },
    }),
    prisma.dailyLog.count({ where }),
  ])
  return {
    logs: logs.map((log) => ({
      ...log,
      labourHeadCountTotal: log.labourEntries.reduce((total, entry) => total + entry.headCount, 0),
      machineryHoursTotal: log.machineryEntries.reduce((total, entry) => total + entry.hoursUsed.toNumber(), 0),
    })),
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  }
}

export async function getDailyLog(user: AuthUser, id: number) {
  const log = await prisma.dailyLog.findUnique({
    where: { id },
    include: {
      labourEntries: true,
      machineryEntries: true,
      stockTransactions: true,
    },
  })
  if (!log) throw new AppError('NOT_FOUND', 'Daily log not found.', 404)
  await assertProjectAccess(user, log.projectId)
  return log
}

export async function createDailyLog(user: AuthUser, projectId: number, input: DailyLogInput) {
  const project = await assertProjectAccess(user, projectId)
  if (project.status !== 'ACTIVE') {
    throw new AppError('BUSINESS_RULE_VIOLATION', 'Daily logs can only be created for ACTIVE projects.', 422)
  }
  const logDate = dateAtUtcMidnight(input.logDate)
  if (logDate > todayAtUtcMidnight()) {
    throw new AppError('BUSINESS_RULE_VIOLATION', 'Log date cannot be in the future.', 422)
  }
  await assertDateAvailable(projectId, logDate)
  const [previous, next] = await Promise.all([
    prisma.dailyLog.findFirst({
      where: { projectId, logDate: { lt: logDate } },
      orderBy: { logDate: 'desc' },
      select: { progressPercent: true },
    }),
    prisma.dailyLog.findFirst({
      where: { projectId, logDate: { gt: logDate } },
      orderBy: { logDate: 'asc' },
      select: { progressPercent: true },
    }),
  ])
  assertProgressOrder(input.progressPercent, previous, next)
  const children = childCreateData(input)

  return prisma.$transaction(async (tx) => {
    const created = await tx.dailyLog.create({
      data: {
        projectId,
        logDate,
        progressPercent: input.progressPercent,
        workSummary: input.workSummary,
        weather: input.weather,
        issues: input.issues,
        createdById: user.id,
        labourEntries: children.labour ? { create: children.labour } : undefined,
        machineryEntries: children.machinery ? { create: children.machinery } : undefined,
      },
      include: { labourEntries: true, machineryEntries: true },
    })
    await tx.auditLog.create({
      data: {
        userId: user.id,
        action: AuditAction.CREATE,
        entityType: 'DailyLog',
        entityId: created.id,
        newValues: auditSnapshot(created),
      },
    })
    return created
  })
}

export async function updateDailyLog(user: AuthUser, id: number, input: DailyLogPatch) {
  const existing = await assertLogAccess(user, id)
  if (input.logDate && dateAtUtcMidnight(input.logDate) > todayAtUtcMidnight()) {
    throw new AppError('BUSINESS_RULE_VIOLATION', 'Log date cannot be in the future.', 422)
  }
  const nextDate = input.logDate ? dateAtUtcMidnight(input.logDate) : existing.logDate
  await assertDateAvailable(existing.projectId, nextDate, id)
  const previous = await prisma.dailyLog.findFirst({
    where: {
      projectId: existing.projectId,
      id: { not: id },
      logDate: { lt: nextDate },
    },
    orderBy: { logDate: 'desc' },
    select: { progressPercent: true },
  })
  const next = await prisma.dailyLog.findFirst({
    where: {
      projectId: existing.projectId,
      id: { not: id },
      logDate: { gt: nextDate },
    },
    orderBy: { logDate: 'asc' },
    select: { progressPercent: true },
  })
  if (input.progressPercent !== undefined) {
    assertProgressOrder(input.progressPercent, previous, next)
  }
  const children = childCreateData(input)

  return prisma.$transaction(async (tx) => {
    if (input.labourEntries) {
      await tx.labourEntry.deleteMany({ where: { dailyLogId: id } })
    }
    if (input.machineryEntries) {
      await tx.machineryEntry.deleteMany({ where: { dailyLogId: id } })
    }
    const updated = await tx.dailyLog.update({
      where: { id },
      data: {
        ...(input.logDate ? { logDate: nextDate } : {}),
        ...(input.progressPercent !== undefined ? { progressPercent: input.progressPercent } : {}),
        ...(input.workSummary !== undefined ? { workSummary: input.workSummary } : {}),
        ...(input.weather !== undefined ? { weather: input.weather } : {}),
        ...(input.issues !== undefined ? { issues: input.issues } : {}),
        ...(children.labour ? { labourEntries: { create: children.labour } } : {}),
        ...(children.machinery ? { machineryEntries: { create: children.machinery } } : {}),
      },
      include: { labourEntries: true, machineryEntries: true },
    })
    await tx.auditLog.create({
      data: {
        userId: user.id,
        action: AuditAction.UPDATE,
        entityType: 'DailyLog',
        entityId: updated.id,
        oldValues: auditSnapshot(existing),
        newValues: auditSnapshot(updated),
      },
    })
    return updated
  })
}

export async function deleteDailyLog(user: AuthUser, id: number) {
  const existing = await prisma.dailyLog.findUnique({
    where: { id },
    include: { labourEntries: true, machineryEntries: true },
  })
  if (!existing) throw new AppError('NOT_FOUND', 'Daily log not found.', 404)
  await assertProjectAccess(user, existing.projectId)
  if (user.role !== Role.ADMIN) {
    throw new AppError('FORBIDDEN', 'Only Administrators can delete daily logs.', 403)
  }
  await prisma.$transaction(async (tx) => {
    await tx.dailyLog.delete({ where: { id } })
    await tx.auditLog.create({
      data: {
        userId: user.id,
        action: AuditAction.DELETE,
        entityType: 'DailyLog',
        entityId: id,
        oldValues: auditSnapshot(existing),
      },
    })
  })
}
