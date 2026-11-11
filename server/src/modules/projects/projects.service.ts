import type { Prisma, Role } from '@prisma/client'
import { prisma } from '../../utils/prisma.js'
import { AppError } from '../../utils/errors.js'

export type ProjectActor = { id: number; role: Role }
type Actor = ProjectActor
type ProgressHistoryQuery = { from?: string; to?: string }
type ActivityQuery = { page: number; limit: number }
type DateRangeQuery = { from?: string; to?: string }

export function projectAccess(actor: ProjectActor) {
  return actor.role === 'ADMIN' ? {} : { assignedPmId: actor.id }
}

async function validateRelations(input: { landId?: number; assignedPmId?: number | null }) {
  if (input.landId !== undefined && !await prisma.land.findUnique({ where: { id: input.landId }, select: { id: true } })) {
    throw new AppError('NOT_FOUND', 'Land not found.', 404)
  }
  if (input.assignedPmId !== undefined && input.assignedPmId !== null) {
    const user = await prisma.user.findUnique({ where: { id: input.assignedPmId }, select: { role: true, isActive: true } })
    if (!user || user.role !== 'PM' || !user.isActive) throw new AppError('VALIDATION_ERROR', 'assignedPmId must reference an active PM.', 400)
  }
}

export async function listProjects(actor: Actor, page: number, pageSize: number, status?: string, search?: string) {
  const where = {
    ...projectAccess(actor),
    ...(status ? { status: status as never } : {}),
    ...(search ? { OR: [{ code: { contains: search, mode: 'insensitive' as const } }, { name: { contains: search, mode: 'insensitive' as const } }] } : {}),
  }
  const [projects, total] = await prisma.$transaction([
    prisma.project.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize, include: { land: true, assignedPm: { select: { id: true, name: true, email: true } } } }),
    prisma.project.count({ where }),
  ])
  return { projects, meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } }
}

export async function getProject(actor: Actor, id: number) {
  const project = await prisma.project.findFirst({ where: { id, ...projectAccess(actor) }, include: { land: true, assignedPm: { select: { id: true, name: true, email: true } } } })
  if (!project) throw new AppError('NOT_FOUND', 'Project not found.', 404)
  return project
}

function dateAtUtcMidnight(value: string) {
  return new Date(`${value}T00:00:00.000Z`)
}

function logDateFilter(query: DateRangeQuery) {
  return query.from || query.to
    ? {
        logDate: {
          ...(query.from ? { gte: dateAtUtcMidnight(query.from) } : {}),
          ...(query.to ? { lte: dateAtUtcMidnight(query.to) } : {}),
        },
      }
    : {}
}

async function getProjectLogsForReporting(actor: Actor, projectId: number, query: DateRangeQuery) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, ...projectAccess(actor) },
    select: { id: true },
  })
  if (!project) throw new AppError('NOT_FOUND', 'Project not found.', 404)
  return prisma.dailyLog.findMany({
    where: { projectId, ...logDateFilter(query) },
    orderBy: { logDate: 'asc' },
    select: {
      id: true,
      logDate: true,
      labourEntries: { select: { trade: true, headCount: true, hoursWorked: true } },
      machineryEntries: { select: { machineName: true, operatorName: true, hoursUsed: true, fuelLitres: true } },
    },
  })
}

type LabourTotals = { workerCount: number; labourHours: number; entries: number }

function aggregateLabour(logs: Awaited<ReturnType<typeof getProjectLogsForReporting>>) {
  const byTrade = new Map<string, LabourTotals>()
  let totalWorkerCount = 0
  let totalLabourHours = 0
  let totalLabourEntries = 0
  for (const log of logs) {
    for (const entry of log.labourEntries) {
      const hours = entry.hoursWorked.toNumber()
      totalWorkerCount += entry.headCount
      totalLabourHours += hours
      totalLabourEntries += 1
      const current = byTrade.get(entry.trade) ?? { workerCount: 0, labourHours: 0, entries: 0 }
      current.workerCount += entry.headCount
      current.labourHours += hours
      current.entries += 1
      byTrade.set(entry.trade, current)
    }
  }
  return {
    totalWorkerCount,
    totalLabourHours,
    totalLabourEntries,
    byTrade: [...byTrade.entries()].map(([trade, totals]) => ({ trade, ...totals })),
  }
}

type MachineryTotals = { hoursUsed: number; fuelConsumption: number; entries: number }

function aggregateMachinery(logs: Awaited<ReturnType<typeof getProjectLogsForReporting>>) {
  const byMachine = new Map<string, MachineryTotals>()
  let totalMachineryHours = 0
  let totalFuelConsumption = 0
  let totalMachineryEntries = 0
  for (const log of logs) {
    for (const entry of log.machineryEntries) {
      const hours = entry.hoursUsed.toNumber()
      const fuel = entry.fuelLitres?.toNumber() ?? 0
      totalMachineryHours += hours
      totalFuelConsumption += fuel
      totalMachineryEntries += 1
      const current = byMachine.get(entry.machineName) ?? { hoursUsed: 0, fuelConsumption: 0, entries: 0 }
      current.hoursUsed += hours
      current.fuelConsumption += fuel
      current.entries += 1
      byMachine.set(entry.machineName, current)
    }
  }
  return {
    totalMachineryHours,
    totalFuelConsumption,
    totalMachineryEntries,
    byMachine: [...byMachine.entries()].map(([machineName, totals]) => ({ machineName, ...totals })),
  }
}

export async function getLabourSummary(actor: Actor, projectId: number, query: DateRangeQuery) {
  return aggregateLabour(await getProjectLogsForReporting(actor, projectId, query))
}

export async function getMachinerySummary(actor: Actor, projectId: number, query: DateRangeQuery) {
  return aggregateMachinery(await getProjectLogsForReporting(actor, projectId, query))
}

export async function getWorkerCountHistory(actor: Actor, projectId: number, query: DateRangeQuery) {
  const logs = await getProjectLogsForReporting(actor, projectId, query)
  return logs.map((log) => {
    const labour = aggregateLabour([log])
    return {
      dailyLogId: log.id,
      logDate: log.logDate,
      totalWorkerCount: labour.totalWorkerCount,
      labourHours: labour.totalLabourHours,
      byTrade: labour.byTrade,
    }
  })
}

export async function getMachineryUsageHistory(actor: Actor, projectId: number, query: DateRangeQuery) {
  const logs = await getProjectLogsForReporting(actor, projectId, query)
  return logs.flatMap((log) => log.machineryEntries.map((entry) => ({
    dailyLogId: log.id,
    logDate: log.logDate,
    machineName: entry.machineName,
    hoursUsed: entry.hoursUsed.toNumber(),
    fuelConsumption: entry.fuelLitres?.toNumber() ?? 0,
    operatorName: entry.operatorName,
  })))
}

export async function getProjectProgressHistory(actor: Actor, projectId: number, query: ProgressHistoryQuery) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, ...projectAccess(actor) },
    select: { id: true },
  })
  if (!project) throw new AppError('NOT_FOUND', 'Project not found.', 404)

  const logs = await prisma.dailyLog.findMany({
    where: {
      projectId,
      ...(query.from || query.to ? {
        logDate: {
          ...(query.from ? { gte: dateAtUtcMidnight(query.from) } : {}),
          ...(query.to ? { lte: dateAtUtcMidnight(query.to) } : {}),
        },
      } : {}),
    },
    orderBy: { logDate: 'asc' },
    select: {
      id: true,
      logDate: true,
      progressPercent: true,
      workSummary: true,
      createdBy: { select: { id: true, name: true, email: true, role: true } },
      createdAt: true,
      updatedAt: true,
    },
  })

  return logs.map((log) => ({
    id: log.id,
    logDate: log.logDate,
    progressPercent: log.progressPercent,
    workSummary: log.workSummary,
    createdBy: log.createdBy,
    createdAt: log.createdAt,
    updatedAt: log.updatedAt,
  }))
}

export async function getProjectSummary(actor: Actor, projectId: number) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, ...projectAccess(actor) },
    include: {
      land: true,
      assignedPm: { select: { id: true, name: true, email: true } },
    },
  })
  if (!project) throw new AppError('NOT_FOUND', 'Project not found.', 404)

  const logs = await prisma.dailyLog.findMany({
    where: { projectId },
    orderBy: { logDate: 'desc' },
    select: {
      id: true,
      logDate: true,
      progressPercent: true,
      labourEntries: { select: { headCount: true, hoursWorked: true } },
      machineryEntries: { select: { hoursUsed: true, fuelLitres: true } },
    },
  })
  const latest = logs[0]
  return {
    project,
    latestProgressPercent: latest?.progressPercent ?? 0,
    latestLogDate: latest?.logDate ?? null,
    totalDailyLogs: logs.length,
    totalLabourHeadCount: logs.reduce(
      (total, log) => total + log.labourEntries.reduce((sum, entry) => sum + entry.headCount, 0),
      0,
    ),
    totalLabourHours: logs.reduce(
      (total, log) => total + log.labourEntries.reduce((sum, entry) => sum + entry.hoursWorked.toNumber(), 0),
      0,
    ),
    totalMachineryHours: logs.reduce(
      (total, log) => total + log.machineryEntries.reduce((sum, entry) => sum + entry.hoursUsed.toNumber(), 0),
      0,
    ),
    totalMachineryFuel: logs.reduce(
      (total, log) => total + log.machineryEntries.reduce((sum, entry) => sum + (entry.fuelLitres?.toNumber() ?? 0), 0),
      0,
    ),
  }
}

export async function getProjectActivity(actor: Actor, projectId: number, query: ActivityQuery) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, ...projectAccess(actor) },
    select: { id: true },
  })
  if (!project) throw new AppError('NOT_FOUND', 'Project not found.', 404)

  const scope: Prisma.AuditLogWhereInput = {
    OR: [
      { entityType: 'Project', entityId: projectId },
      { oldValues: { path: ['projectId'], equals: projectId } },
      { newValues: { path: ['projectId'], equals: projectId } },
    ],
  }
  const [activities, total] = await prisma.$transaction([
    prisma.auditLog.findMany({
      where: scope,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      select: {
        id: true,
        action: true,
        entityType: true,
        entityId: true,
        oldValues: true,
        newValues: true,
        createdAt: true,
        user: { select: { id: true, name: true } },
      },
    }),
    prisma.auditLog.count({ where: scope }),
  ])
  return {
    activities: activities.map((activity) => ({
      id: activity.id,
      action: activity.action,
      entityType: activity.entityType,
      entityId: activity.entityId,
      userId: activity.user?.id ?? null,
      userName: activity.user?.name ?? null,
      oldData: activity.oldValues,
      newData: activity.newValues,
      createdAt: activity.createdAt,
    })),
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  }
}

export async function createProject(actor: Actor, input: Record<string, unknown>) {
  await validateRelations(input as { landId: number; assignedPmId?: number | null })
  return prisma.project.create({ data: { ...input, createdById: actor.id } as never, include: { land: true } })
}

export async function updateProject(actor: Actor, id: number, input: Record<string, unknown>) {
  await getProject(actor, id)
  if (actor.role !== 'ADMIN') {
    const administrativeFields = ['landId', 'assignedPmId', 'createdById', 'totalBudget', 'wastageThresholdPct', 'startDate', 'expectedEndDate', 'actualEndDate']
    if (administrativeFields.some((field) => field in input)) {
      throw new AppError('FORBIDDEN', 'Project assignment and administrative fields can only be changed by an administrator.', 403)
    }
  }
  const data = actor.role === 'ADMIN' ? input : Object.fromEntries(Object.entries(input).filter(([key]) => ['name', 'description', 'status'].includes(key)))
  if (actor.role === 'ADMIN') await validateRelations(input as { landId?: number; assignedPmId?: number | null })
  return prisma.project.update({ where: { id }, data: data as never, include: { land: true, assignedPm: { select: { id: true, name: true, email: true } } } })
}

export async function deleteProject(id: number) {
  const project = await prisma.project.findUnique({
    where: { id },
    select: { id: true, _count: { select: { materialPlans: true, milestones: true, dailyLogs: true, stockTransactions: true, bills: true, notifications: true } } },
  })
  if (!project) throw new AppError('NOT_FOUND', 'Project not found.', 404)
  if (Object.values(project._count).some((count) => count > 0)) throw new AppError('BUSINESS_RULE_VIOLATION', 'Project cannot be deleted while dependent records exist.', 409)
  await prisma.project.delete({ where: { id } })
}
