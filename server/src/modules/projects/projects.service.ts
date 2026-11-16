import type { Prisma, Role } from '@prisma/client' // Uses Prisma's generated types and client to work safely with database records.
import { prisma } from '../../utils/prisma.js' // Uses the shared Prisma client to run queries through the server's database connection.
import { AppError } from '../../utils/errors.js' // Uses the shared API error type so failures have a consistent message and HTTP status.

export type ProjectActor = { id: number; role: Role } // Defines the `ProjectActor` type so TypeScript can describe the data or behavior used here.
type Actor = ProjectActor // Defines the `Actor` type so TypeScript can describe the data or behavior used here.
type ProgressHistoryQuery = { from?: string; to?: string } // Defines the `ProgressHistoryQuery` type so TypeScript can describe the data or behavior used here.
type ActivityQuery = { page: number; limit: number } // Defines the `ActivityQuery` type so TypeScript can describe the data or behavior used here.
type DateRangeQuery = { from?: string; to?: string } // Defines the `DateRangeQuery` type so TypeScript can describe the data or behavior used here.

export function projectAccess(actor: ProjectActor) { // Defines `projectAccess` to work with access, keeping this behavior reusable.
  // Apply PM ownership in the database filter, so every caller shares the same project scope.
  return actor.role === 'ADMIN' ? {} : { assignedPmId: actor.id } // Returns `actor.role === 'ADMIN' ? {} : { assignedPmId: actor.id }` to the caller so the next layer can use the result.
} // Closes the current block and marks where its grouped work ends.

async function validateRelations(input: { landId?: number; assignedPmId?: number | null }) { // Defines `validateRelations` to check relations, keeping this behavior reusable.
  if (input.landId !== undefined && !await prisma.land.findUnique({ where: { id: input.landId }, select: { id: true } })) { // Checks whether the caller supplied this optional value before validating or applying it.
    throw new AppError('NOT_FOUND', 'Land not found.', 404) // Stops this request with `NOT_FOUND` and HTTP 404 so the client receives a clear failure.
  } // Closes the current block and marks where its grouped work ends.
  if (input.assignedPmId !== undefined && input.assignedPmId !== null) { // Checks whether the caller supplied this optional value before validating or applying it.
    const user = await prisma.user.findUnique({ where: { id: input.assignedPmId }, select: { role: true, isActive: true } }) // Looks up one matching database record and stores it in `user` so its existence or values can be checked.
    if (!user || user.role !== 'PM' || !user.isActive) throw new AppError('VALIDATION_ERROR', 'assignedPmId must reference an active PM.', 400) // Rejects an inactive account so deactivated users cannot continue using the API.
  } // Closes the current block and marks where its grouped work ends.
} // Closes the current block and marks where its grouped work ends.

export async function listProjects(actor: Actor, page: number, pageSize: number, status?: string, search?: string) { // Defines `listProjects` to retrieve a list of projects, keeping this behavior reusable.
  const where = { // Builds the database filter so role access, status, and search rules are applied together.
    ...projectAccess(actor), // Separates this argument or property from the next item in the surrounding call or object.
    ...(status ? { status: status as never } : {}), // Separates this argument or property from the next item in the surrounding call or object.
    ...(search ? { OR: [{ code: { contains: search, mode: 'insensitive' as const } }, { name: { contains: search, mode: 'insensitive' as const } }] } : {}), // Separates this argument or property from the next item in the surrounding call or object.
  } // Closes the current block and marks where its grouped work ends.
  const [projects, total] = await prisma.$transaction([ // Fetches the page and its matching-record count in one transaction so the response metadata stays consistent; stores both results in `projects,total`.
    prisma.project.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize, include: { land: true, assignedPm: { select: { id: true, name: true, email: true } } } }), // Separates this argument or property from the next item in the surrounding call or object.
    prisma.project.count({ where }), // Separates this argument or property from the next item in the surrounding call or object.
  ]) // Closes the current call, object, or collection so the surrounding expression can continue.
  return { projects, meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } } // Returns the requested data together with pagination or summary metadata for the client.
} // Closes the current block and marks where its grouped work ends.

export async function getProject(actor: Actor, id: number) { // Defines `getProject` to retrieve project, keeping this behavior reusable.
  const project = await prisma.project.findFirst({ where: { id, ...projectAccess(actor) }, include: { land: true, assignedPm: { select: { id: true, name: true, email: true } } } }) // Looks up one matching database record and stores it in `project` so its existence or values can be checked.
  if (!project) throw new AppError('NOT_FOUND', 'Project not found.', 404) // Handles a missing database record before later code tries to use it.
  return project // Returns `project` to the caller so the next layer can use the result.
} // Closes the current block and marks where its grouped work ends.

function dateAtUtcMidnight(value: string) { // Defines `dateAtUtcMidnight` to convert at utc midnight, keeping this behavior reusable.
  return new Date(`${value}T00:00:00.000Z`) // Returns `new Date(`${value}T00:00:00.000Z`)` to the caller so the next layer can use the result.
} // Closes the current block and marks where its grouped work ends.

function logDateFilter(query: DateRangeQuery) { // Defines `logDateFilter` to write a log entry for date filter, keeping this behavior reusable.
  return query.from || query.to // Returns `query.from || query.to` to the caller so the next layer can use the result.
    ? { // Opens the object or callback body that groups the settings for this operation.
        logDate: { // Sets `logDate` to the date covered by the daily report.
          ...(query.from ? { gte: dateAtUtcMidnight(query.from) } : {}), // Separates this argument or property from the next item in the surrounding call or object.
          ...(query.to ? { lte: dateAtUtcMidnight(query.to) } : {}), // Separates this argument or property from the next item in the surrounding call or object.
        }, // Closes the current call, object, or collection so the surrounding expression can continue.
      } // Closes the current block and marks where its grouped work ends.
    : {} // Provides `: {}` as part of log date filter.
} // Closes the current block and marks where its grouped work ends.

async function getProjectLogsForReporting(actor: Actor, projectId: number, query: DateRangeQuery) { // Defines `getProjectLogsForReporting` to retrieve project logs for reporting, keeping this behavior reusable.
  const project = await prisma.project.findFirst({ // Looks up one matching database record and stores it in `project` so its existence or values can be checked.
    where: { id: projectId, ...projectAccess(actor) }, // Separates this argument or property from the next item in the surrounding call or object.
    select: { id: true }, // Separates this argument or property from the next item in the surrounding call or object.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
  if (!project) throw new AppError('NOT_FOUND', 'Project not found.', 404) // Handles a missing database record before later code tries to use it.
  return prisma.dailyLog.findMany({ // Returns the database result to the route handler so it can form the API response.
    where: { projectId, ...logDateFilter(query) }, // Separates this argument or property from the next item in the surrounding call or object.
    orderBy: { logDate: 'asc' }, // Separates this argument or property from the next item in the surrounding call or object.
    select: { // Sets `select` to requests only the fields needed for this response.
      id: true, // Separates this argument or property from the next item in the surrounding call or object.
      logDate: true, // Separates this argument or property from the next item in the surrounding call or object.
      labourEntries: { select: { trade: true, headCount: true, hoursWorked: true } }, // Separates this argument or property from the next item in the surrounding call or object.
      machineryEntries: { select: { machineName: true, operatorName: true, hoursUsed: true, fuelLitres: true } }, // Separates this argument or property from the next item in the surrounding call or object.
    }, // Closes the current call, object, or collection so the surrounding expression can continue.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
} // Closes the current block and marks where its grouped work ends.

type LabourTotals = { workerCount: number; labourHours: number; entries: number } // Defines the `LabourTotals` type so TypeScript can describe the data or behavior used here.

function aggregateLabour(logs: Awaited<ReturnType<typeof getProjectLogsForReporting>>) { // Defines `aggregateLabour` to combine and total labour, keeping this behavior reusable.
  const byTrade = new Map<string, LabourTotals>() // Creates a lookup map named `byTrade` so values can be grouped by key while records are processed.
  let totalWorkerCount = 0 // Initializes `totalWorkerCount` with a safe starting value before the operation continues.
  let totalLabourHours = 0 // Initializes `totalLabourHours` with a safe starting value before the operation continues.
  let totalLabourEntries = 0 // Initializes `totalLabourEntries` with a safe starting value before the operation continues.
  for (const log of logs) { // Repeats the block for each `log` in `logs` so every item is processed.
    for (const entry of log.labourEntries) { // Repeats the block for each `entry` in `log.labourEntries` so every item is processed.
      const hours = entry.hoursWorked.toNumber() // Stores this intermediate `hours` value so later lines can use it.
      totalWorkerCount += entry.headCount // Adds `entry.headCount` to the running `totalWorkerCount` total.
      totalLabourHours += hours // Adds `hours` to the running `totalLabourHours` total.
      totalLabourEntries += 1 // Adds `1` to the running `totalLabourEntries` total.
      const current = byTrade.get(entry.trade) ?? { workerCount: 0, labourHours: 0, entries: 0 } // Stores this intermediate `current` value so later lines can use it.
      current.workerCount += entry.headCount // Adds `entry.headCount` to the running `current.workerCount` total.
      current.labourHours += hours // Adds `hours` to the running `current.labourHours` total.
      current.entries += 1 // Adds `1` to the running `current.entries` total.
      byTrade.set(entry.trade, current) // Provides `byTrade.set(entry.trade, current)` as part of aggregate labour.
    } // Closes the current block and marks where its grouped work ends.
  } // Closes the current block and marks where its grouped work ends.
  return { // Returns the assembled result object so the caller receives the fields it needs.
    totalWorkerCount, // Separates this argument or property from the next item in the surrounding call or object.
    totalLabourHours, // Separates this argument or property from the next item in the surrounding call or object.
    totalLabourEntries, // Separates this argument or property from the next item in the surrounding call or object.
    byTrade: [...byTrade.entries()].map(([trade, totals]) => ({ trade, ...totals })), // Separates this argument or property from the next item in the surrounding call or object.
  } // Closes the current block and marks where its grouped work ends.
} // Closes the current block and marks where its grouped work ends.

type MachineryTotals = { hoursUsed: number; fuelConsumption: number; entries: number } // Defines the `MachineryTotals` type so TypeScript can describe the data or behavior used here.

function aggregateMachinery(logs: Awaited<ReturnType<typeof getProjectLogsForReporting>>) { // Defines `aggregateMachinery` to combine and total machinery, keeping this behavior reusable.
  const byMachine = new Map<string, MachineryTotals>() // Creates a lookup map named `byMachine` so values can be grouped by key while records are processed.
  let totalMachineryHours = 0 // Initializes `totalMachineryHours` with a safe starting value before the operation continues.
  let totalFuelConsumption = 0 // Initializes `totalFuelConsumption` with a safe starting value before the operation continues.
  let totalMachineryEntries = 0 // Initializes `totalMachineryEntries` with a safe starting value before the operation continues.
  for (const log of logs) { // Repeats the block for each `log` in `logs` so every item is processed.
    for (const entry of log.machineryEntries) { // Repeats the block for each `entry` in `log.machineryEntries` so every item is processed.
      const hours = entry.hoursUsed.toNumber() // Stores this intermediate `hours` value so later lines can use it.
      const fuel = entry.fuelLitres?.toNumber() ?? 0 // Stores this intermediate `fuel` value so later lines can use it.
      totalMachineryHours += hours // Adds `hours` to the running `totalMachineryHours` total.
      totalFuelConsumption += fuel // Adds `fuel` to the running `totalFuelConsumption` total.
      totalMachineryEntries += 1 // Adds `1` to the running `totalMachineryEntries` total.
      const current = byMachine.get(entry.machineName) ?? { hoursUsed: 0, fuelConsumption: 0, entries: 0 } // Stores this intermediate `current` value so later lines can use it.
      current.hoursUsed += hours // Adds `hours` to the running `current.hoursUsed` total.
      current.fuelConsumption += fuel // Adds `fuel` to the running `current.fuelConsumption` total.
      current.entries += 1 // Adds `1` to the running `current.entries` total.
      byMachine.set(entry.machineName, current) // Provides `byMachine.set(entry.machineName, current)` as part of aggregate machinery.
    } // Closes the current block and marks where its grouped work ends.
  } // Closes the current block and marks where its grouped work ends.
  return { // Returns the assembled result object so the caller receives the fields it needs.
    totalMachineryHours, // Separates this argument or property from the next item in the surrounding call or object.
    totalFuelConsumption, // Separates this argument or property from the next item in the surrounding call or object.
    totalMachineryEntries, // Separates this argument or property from the next item in the surrounding call or object.
    byMachine: [...byMachine.entries()].map(([machineName, totals]) => ({ machineName, ...totals })), // Separates this argument or property from the next item in the surrounding call or object.
  } // Closes the current block and marks where its grouped work ends.
} // Closes the current block and marks where its grouped work ends.

export async function getLabourSummary(actor: Actor, projectId: number, query: DateRangeQuery) { // Defines `getLabourSummary` to retrieve labour summary, keeping this behavior reusable.
  return aggregateLabour(await getProjectLogsForReporting(actor, projectId, query)) // Returns `aggregateLabour(await getProjectLogsForReporting(actor, projectId, query))` to the caller so the next layer can use the result.
} // Closes the current block and marks where its grouped work ends.

export async function getMachinerySummary(actor: Actor, projectId: number, query: DateRangeQuery) { // Defines `getMachinerySummary` to retrieve machinery summary, keeping this behavior reusable.
  return aggregateMachinery(await getProjectLogsForReporting(actor, projectId, query)) // Returns `aggregateMachinery(await getProjectLogsForReporting(actor, projectId, query))` to the caller so the next layer can use the result.
} // Closes the current block and marks where its grouped work ends.

export async function getWorkerCountHistory(actor: Actor, projectId: number, query: DateRangeQuery) { // Defines `getWorkerCountHistory` to retrieve worker count history, keeping this behavior reusable.
  const logs = await getProjectLogsForReporting(actor, projectId, query) // Stores this intermediate `logs` value so later lines can use it.
  return logs.map((log) => { // Opens the function, callback, or control-flow block that groups the related statements.
    const labour = aggregateLabour([log]) // Stores this intermediate `labour` value so later lines can use it.
    return { // Returns the assembled result object so the caller receives the fields it needs.
      dailyLogId: log.id, // Separates this argument or property from the next item in the surrounding call or object.
      logDate: log.logDate, // Separates this argument or property from the next item in the surrounding call or object.
      totalWorkerCount: labour.totalWorkerCount, // Separates this argument or property from the next item in the surrounding call or object.
      labourHours: labour.totalLabourHours, // Separates this argument or property from the next item in the surrounding call or object.
      byTrade: labour.byTrade, // Separates this argument or property from the next item in the surrounding call or object.
    } // Closes the current block and marks where its grouped work ends.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
} // Closes the current block and marks where its grouped work ends.

export async function getMachineryUsageHistory(actor: Actor, projectId: number, query: DateRangeQuery) { // Defines `getMachineryUsageHistory` to retrieve machinery usage history, keeping this behavior reusable.
  const logs = await getProjectLogsForReporting(actor, projectId, query) // Stores this intermediate `logs` value so later lines can use it.
  return logs.flatMap((log) => log.machineryEntries.map((entry) => ({ // Returns `logs.flatMap((log) => log.machineryEntries.map((entry) => ({` to the caller so the next layer can use the result.
    dailyLogId: log.id, // Separates this argument or property from the next item in the surrounding call or object.
    logDate: log.logDate, // Separates this argument or property from the next item in the surrounding call or object.
    machineName: entry.machineName, // Separates this argument or property from the next item in the surrounding call or object.
    hoursUsed: entry.hoursUsed.toNumber(), // Separates this argument or property from the next item in the surrounding call or object.
    fuelConsumption: entry.fuelLitres?.toNumber() ?? 0, // Separates this argument or property from the next item in the surrounding call or object.
    operatorName: entry.operatorName, // Separates this argument or property from the next item in the surrounding call or object.
  }))) // Provides `})))` as part of get machinery usage history.
} // Closes the current block and marks where its grouped work ends.

export async function getProjectProgressHistory(actor: Actor, projectId: number, query: ProgressHistoryQuery) { // Defines `getProjectProgressHistory` to retrieve project progress history, keeping this behavior reusable.
  const project = await prisma.project.findFirst({ // Looks up one matching database record and stores it in `project` so its existence or values can be checked.
    where: { id: projectId, ...projectAccess(actor) }, // Separates this argument or property from the next item in the surrounding call or object.
    select: { id: true }, // Separates this argument or property from the next item in the surrounding call or object.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
  if (!project) throw new AppError('NOT_FOUND', 'Project not found.', 404) // Handles a missing database record before later code tries to use it.

  const logs = await prisma.dailyLog.findMany({ // Fetches matching database records and stores them in `logs` for the response or next calculation.
    where: { // Sets `where` to filters the database records to the requested scope.
      projectId, // Separates this argument or property from the next item in the surrounding call or object.
      ...(query.from || query.to ? { // Opens the object or callback body that groups the settings for this operation.
        logDate: { // Sets `logDate` to the date covered by the daily report.
          ...(query.from ? { gte: dateAtUtcMidnight(query.from) } : {}), // Separates this argument or property from the next item in the surrounding call or object.
          ...(query.to ? { lte: dateAtUtcMidnight(query.to) } : {}), // Separates this argument or property from the next item in the surrounding call or object.
        }, // Closes the current call, object, or collection so the surrounding expression can continue.
      } : {}), // Separates this argument or property from the next item in the surrounding call or object.
    }, // Closes the current call, object, or collection so the surrounding expression can continue.
    orderBy: { logDate: 'asc' }, // Separates this argument or property from the next item in the surrounding call or object.
    select: { // Sets `select` to requests only the fields needed for this response.
      id: true, // Separates this argument or property from the next item in the surrounding call or object.
      logDate: true, // Separates this argument or property from the next item in the surrounding call or object.
      progressPercent: true, // Separates this argument or property from the next item in the surrounding call or object.
      workSummary: true, // Separates this argument or property from the next item in the surrounding call or object.
      createdBy: { select: { id: true, name: true, email: true, role: true } }, // Separates this argument or property from the next item in the surrounding call or object.
      createdAt: true, // Separates this argument or property from the next item in the surrounding call or object.
      updatedAt: true, // Separates this argument or property from the next item in the surrounding call or object.
    }, // Closes the current call, object, or collection so the surrounding expression can continue.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.

  return logs.map((log) => ({ // Returns `logs.map((log) => ({` to the caller so the next layer can use the result.
    id: log.id, // Separates this argument or property from the next item in the surrounding call or object.
    logDate: log.logDate, // Separates this argument or property from the next item in the surrounding call or object.
    progressPercent: log.progressPercent, // Separates this argument or property from the next item in the surrounding call or object.
    workSummary: log.workSummary, // Separates this argument or property from the next item in the surrounding call or object.
    createdBy: log.createdBy, // Separates this argument or property from the next item in the surrounding call or object.
    createdAt: log.createdAt, // Separates this argument or property from the next item in the surrounding call or object.
    updatedAt: log.updatedAt, // Separates this argument or property from the next item in the surrounding call or object.
  })) // Provides `}))` as part of get project progress history.
} // Closes the current block and marks where its grouped work ends.

export async function getProjectSummary(actor: Actor, projectId: number) { // Defines `getProjectSummary` to retrieve project summary, keeping this behavior reusable.
  const project = await prisma.project.findFirst({ // Looks up one matching database record and stores it in `project` so its existence or values can be checked.
    where: { id: projectId, ...projectAccess(actor) }, // Separates this argument or property from the next item in the surrounding call or object.
    include: { // Sets `include` to loads related records needed alongside the main result.
      land: true, // Separates this argument or property from the next item in the surrounding call or object.
      assignedPm: { select: { id: true, name: true, email: true } }, // Separates this argument or property from the next item in the surrounding call or object.
    }, // Closes the current call, object, or collection so the surrounding expression can continue.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
  if (!project) throw new AppError('NOT_FOUND', 'Project not found.', 404) // Handles a missing database record before later code tries to use it.

  const logs = await prisma.dailyLog.findMany({ // Fetches matching database records and stores them in `logs` for the response or next calculation.
    where: { projectId }, // Separates this argument or property from the next item in the surrounding call or object.
    orderBy: { logDate: 'desc' }, // Separates this argument or property from the next item in the surrounding call or object.
    select: { // Sets `select` to requests only the fields needed for this response.
      id: true, // Separates this argument or property from the next item in the surrounding call or object.
      logDate: true, // Separates this argument or property from the next item in the surrounding call or object.
      progressPercent: true, // Separates this argument or property from the next item in the surrounding call or object.
      labourEntries: { select: { headCount: true, hoursWorked: true } }, // Separates this argument or property from the next item in the surrounding call or object.
      machineryEntries: { select: { hoursUsed: true, fuelLitres: true } }, // Separates this argument or property from the next item in the surrounding call or object.
    }, // Closes the current call, object, or collection so the surrounding expression can continue.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
  const latest = logs[0] // Stores this intermediate `latest` value so later lines can use it.
  return { // Returns the assembled result object so the caller receives the fields it needs.
    project, // Separates this argument or property from the next item in the surrounding call or object.
    latestProgressPercent: latest?.progressPercent ?? 0, // Separates this argument or property from the next item in the surrounding call or object.
    latestLogDate: latest?.logDate ?? null, // Separates this argument or property from the next item in the surrounding call or object.
    totalDailyLogs: logs.length, // Separates this argument or property from the next item in the surrounding call or object.
    totalLabourHeadCount: logs.reduce( // Sets `totalLabourHeadCount` to the total labour head count value.
      (total, log) => total + log.labourEntries.reduce((sum, entry) => sum + entry.headCount, 0), // Separates this argument or property from the next item in the surrounding call or object.
      0, // Separates this argument or property from the next item in the surrounding call or object.
    ), // Closes the current call, object, or collection so the surrounding expression can continue.
    totalLabourHours: logs.reduce( // Sets `totalLabourHours` to the total labour hours value.
      (total, log) => total + log.labourEntries.reduce((sum, entry) => sum + entry.hoursWorked.toNumber(), 0), // Separates this argument or property from the next item in the surrounding call or object.
      0, // Separates this argument or property from the next item in the surrounding call or object.
    ), // Closes the current call, object, or collection so the surrounding expression can continue.
    totalMachineryHours: logs.reduce( // Sets `totalMachineryHours` to the total machinery hours value.
      (total, log) => total + log.machineryEntries.reduce((sum, entry) => sum + entry.hoursUsed.toNumber(), 0), // Separates this argument or property from the next item in the surrounding call or object.
      0, // Separates this argument or property from the next item in the surrounding call or object.
    ), // Closes the current call, object, or collection so the surrounding expression can continue.
    totalMachineryFuel: logs.reduce( // Sets `totalMachineryFuel` to the total machinery fuel value.
      (total, log) => total + log.machineryEntries.reduce((sum, entry) => sum + (entry.fuelLitres?.toNumber() ?? 0), 0), // Separates this argument or property from the next item in the surrounding call or object.
      0, // Separates this argument or property from the next item in the surrounding call or object.
    ), // Closes the current call, object, or collection so the surrounding expression can continue.
  } // Closes the current block and marks where its grouped work ends.
} // Closes the current block and marks where its grouped work ends.

export async function getProjectActivity(actor: Actor, projectId: number, query: ActivityQuery) { // Defines `getProjectActivity` to retrieve project activity, keeping this behavior reusable.
  const project = await prisma.project.findFirst({ // Looks up one matching database record and stores it in `project` so its existence or values can be checked.
    where: { id: projectId, ...projectAccess(actor) }, // Separates this argument or property from the next item in the surrounding call or object.
    select: { id: true }, // Separates this argument or property from the next item in the surrounding call or object.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
  if (!project) throw new AppError('NOT_FOUND', 'Project not found.', 404) // Handles a missing database record before later code tries to use it.

  const scope: Prisma.AuditLogWhereInput = { // Stores this intermediate `prisma.audit log where input` value so later lines can use it.
    OR: [ // Sets `OR` to matches a record when any listed condition is true.
      { entityType: 'Project', entityId: projectId }, // Separates this argument or property from the next item in the surrounding call or object.
      { oldValues: { path: ['projectId'], equals: projectId } }, // Separates this argument or property from the next item in the surrounding call or object.
      { newValues: { path: ['projectId'], equals: projectId } }, // Separates this argument or property from the next item in the surrounding call or object.
    ], // Closes the current call, object, or collection so the surrounding expression can continue.
  } // Closes the current block and marks where its grouped work ends.
  const [activities, total] = await prisma.$transaction([ // Fetches the page and its matching-record count in one transaction so the response metadata stays consistent; stores both results in `activities,total`.
    prisma.auditLog.findMany({ // Opens the object or callback body that groups the settings for this operation.
      where: scope, // Separates this argument or property from the next item in the surrounding call or object.
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], // Separates this argument or property from the next item in the surrounding call or object.
      skip: (query.page - 1) * query.limit, // Separates this argument or property from the next item in the surrounding call or object.
      take: query.limit, // Separates this argument or property from the next item in the surrounding call or object.
      select: { // Sets `select` to requests only the fields needed for this response.
        id: true, // Separates this argument or property from the next item in the surrounding call or object.
        action: true, // Separates this argument or property from the next item in the surrounding call or object.
        entityType: true, // Separates this argument or property from the next item in the surrounding call or object.
        entityId: true, // Separates this argument or property from the next item in the surrounding call or object.
        oldValues: true, // Separates this argument or property from the next item in the surrounding call or object.
        newValues: true, // Separates this argument or property from the next item in the surrounding call or object.
        createdAt: true, // Separates this argument or property from the next item in the surrounding call or object.
        user: { select: { id: true, name: true } }, // Separates this argument or property from the next item in the surrounding call or object.
      }, // Closes the current call, object, or collection so the surrounding expression can continue.
    }), // Separates this argument or property from the next item in the surrounding call or object.
    prisma.auditLog.count({ where: scope }), // Separates this argument or property from the next item in the surrounding call or object.
  ]) // Closes the current call, object, or collection so the surrounding expression can continue.
  return { // Returns the assembled result object so the caller receives the fields it needs.
    activities: activities.map((activity) => ({ // Sets `activities` to the activities value.
      id: activity.id, // Separates this argument or property from the next item in the surrounding call or object.
      action: activity.action, // Separates this argument or property from the next item in the surrounding call or object.
      entityType: activity.entityType, // Separates this argument or property from the next item in the surrounding call or object.
      entityId: activity.entityId, // Separates this argument or property from the next item in the surrounding call or object.
      userId: activity.user?.id ?? null, // Separates this argument or property from the next item in the surrounding call or object.
      userName: activity.user?.name ?? null, // Separates this argument or property from the next item in the surrounding call or object.
      oldData: activity.oldValues, // Separates this argument or property from the next item in the surrounding call or object.
      newData: activity.newValues, // Separates this argument or property from the next item in the surrounding call or object.
      createdAt: activity.createdAt, // Separates this argument or property from the next item in the surrounding call or object.
    })), // Separates this argument or property from the next item in the surrounding call or object.
    meta: { // Sets `meta` to the meta value.
      page: query.page, // Separates this argument or property from the next item in the surrounding call or object.
      limit: query.limit, // Separates this argument or property from the next item in the surrounding call or object.
      total, // Separates this argument or property from the next item in the surrounding call or object.
      totalPages: Math.ceil(total / query.limit), // Separates this argument or property from the next item in the surrounding call or object.
    }, // Closes the current call, object, or collection so the surrounding expression can continue.
  } // Closes the current block and marks where its grouped work ends.
} // Closes the current block and marks where its grouped work ends.

export async function createProject(actor: Actor, input: Record<string, unknown>) { // Defines `createProject` to create project, keeping this behavior reusable.
  await validateRelations(input as { landId: number; assignedPmId?: number | null }) // Waits for this asynchronous operation to finish before using its result.
  return prisma.project.create({ data: { ...input, createdById: actor.id } as never, include: { land: true } }) // Returns the database result to the route handler so it can form the API response.
} // Closes the current block and marks where its grouped work ends.

export async function updateProject(actor: Actor, id: number, input: Record<string, unknown>) { // Defines `updateProject` to update project, keeping this behavior reusable.
  await getProject(actor, id) // Waits for this asynchronous operation to finish before using its result.
  if (actor.role !== 'ADMIN') { // Checks the caller's role before allowing this role-restricted operation.
    const administrativeFields = ['landId', 'assignedPmId', 'createdById', 'totalBudget', 'wastageThresholdPct', 'startDate', 'expectedEndDate', 'actualEndDate'] // Stores this intermediate `administrative fields` value so later lines can use it.
    if (administrativeFields.some((field) => field in input)) { // Checks whether any item violates this rule before the operation continues.
      throw new AppError('FORBIDDEN', 'Project assignment and administrative fields can only be changed by an administrator.', 403) // Stops this request with `FORBIDDEN` and HTTP 403 so the client receives a clear failure.
    } // Closes the current block and marks where its grouped work ends.
  } // Closes the current block and marks where its grouped work ends.
  const data = actor.role === 'ADMIN' ? input : Object.fromEntries(Object.entries(input).filter(([key]) => ['name', 'description', 'status'].includes(key))) // Builds `data` from only the permitted input fields so unapproved values are not written.
  if (actor.role === 'ADMIN') await validateRelations(input as { landId?: number; assignedPmId?: number | null }) // Checks the caller's role before allowing this role-restricted operation.
  return prisma.project.update({ where: { id }, data: data as never, include: { land: true, assignedPm: { select: { id: true, name: true, email: true } } } }) // Returns the database result to the route handler so it can form the API response.
} // Closes the current block and marks where its grouped work ends.

export async function deleteProject(id: number) { // Defines `deleteProject` to delete project, keeping this behavior reusable.
  const project = await prisma.project.findUnique({ // Looks up one matching database record and stores it in `project` so its existence or values can be checked.
    where: { id }, // Separates this argument or property from the next item in the surrounding call or object.
    select: { id: true, _count: { select: { materialPlans: true, milestones: true, dailyLogs: true, stockTransactions: true, bills: true, notifications: true } } }, // Separates this argument or property from the next item in the surrounding call or object.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
  if (!project) throw new AppError('NOT_FOUND', 'Project not found.', 404) // Handles a missing database record before later code tries to use it.
  if (Object.values(project._count).some((count) => count > 0)) throw new AppError('BUSINESS_RULE_VIOLATION', 'Project cannot be deleted while dependent records exist.', 409) // Checks whether any item violates this rule before the operation continues.
  await prisma.project.delete({ where: { id } }) // Waits for the database to deletes a record in the project table before dependent work continues.
} // Closes the current block and marks where its grouped work ends.
// File purpose: Implements projects business rules and database operations.
