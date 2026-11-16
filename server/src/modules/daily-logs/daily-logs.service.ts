import { AuditAction, Role, type Prisma } from '@prisma/client' // Uses Prisma's generated types and client to work safely with database records.
import { prisma } from '../../utils/prisma.js' // Uses the shared Prisma client to run queries through the server's database connection.
import { AppError } from '../../utils/errors.js' // Uses the shared API error type so failures have a consistent message and HTTP status.
import type { // Imports type { from  so this module can reuse that functionality.
  DailyLogInput, // Separates this argument or property from the next item in the surrounding call or object.
  DailyLogListQuery, // Separates this argument or property from the next item in the surrounding call or object.
  DailyLogPatch, // Separates this argument or property from the next item in the surrounding call or object.
} from './daily-logs.validator.js' // Provides `} from './daily-logs.validator.js'` as part of this server module.

type AuthUser = { id: number; role: Role } // Defines the `AuthUser` type so TypeScript can describe the data or behavior used here.
type DailyLogWithEntries = Prisma.DailyLogGetPayload<{ // Defines the `DailyLogWithEntries` type so TypeScript can describe the data or behavior used here.
  include: { labourEntries: true; machineryEntries: true } // Sets `include` to loads related records needed alongside the main result.
}> // Provides `}>` as part of this server module.
const EDIT_WINDOW_HOURS = 48 // Stores this intermediate `edit window hours` value so later lines can use it.

function dateAtUtcMidnight(value: string) { // Defines `dateAtUtcMidnight` to convert at utc midnight, keeping this behavior reusable.
  return new Date(`${value}T00:00:00.000Z`) // Returns `new Date(`${value}T00:00:00.000Z`)` to the caller so the next layer can use the result.
} // Closes the current block and marks where its grouped work ends.

function todayAtUtcMidnight() { // Defines `todayAtUtcMidnight` to today at utc midnight, keeping this behavior reusable.
  const now = new Date() // Converts the supplied date into a JavaScript date value and stores it in `now` for consistent comparisons.
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())) // Returns `new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))` to the caller so the next layer can use the result.
} // Closes the current block and marks where its grouped work ends.

function assertProgressOrder( // Defines `assertProgressOrder` to assert progress order, keeping this behavior reusable.
  progress: number, // Separates this argument or property from the next item in the surrounding call or object.
  previous: { progressPercent: Prisma.Decimal } | null, // Separates this argument or property from the next item in the surrounding call or object.
  next: { progressPercent: Prisma.Decimal } | null, // Separates this argument or property from the next item in the surrounding call or object.
) { // Opens the object or callback body that groups the settings for this operation.
  if (previous && progress < previous.progressPercent.toNumber()) { // Checks whether the supplied values meet this condition; the block handles that case before continuing.
    throw new AppError('BUSINESS_RULE_VIOLATION', 'Progress cannot decrease from the previous log.', 422) // Stops this request with `BUSINESS_RULE_VIOLATION` and HTTP 422 so the client receives a clear failure.
  } // Closes the current block and marks where its grouped work ends.
  if (next && progress > next.progressPercent.toNumber()) { // Checks whether the supplied values meet this condition; the block handles that case before continuing.
    throw new AppError('BUSINESS_RULE_VIOLATION', 'Progress cannot exceed the following log.', 422) // Stops this request with `BUSINESS_RULE_VIOLATION` and HTTP 422 so the client receives a clear failure.
  } // Closes the current block and marks where its grouped work ends.
} // Closes the current block and marks where its grouped work ends.

async function assertProjectAccess(user: AuthUser, projectId: number) { // Defines `assertProjectAccess` to assert project access, keeping this behavior reusable.
  const project = await prisma.project.findUnique({ // Looks up one matching database record and stores it in `project` so its existence or values can be checked.
    where: { id: projectId }, // Separates this argument or property from the next item in the surrounding call or object.
    select: { id: true, status: true, assignedPmId: true }, // Separates this argument or property from the next item in the surrounding call or object.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
  if (!project) { // Handles a missing database record before later code tries to use it.
    throw new AppError('NOT_FOUND', 'Project not found.', 404) // Stops this request with `NOT_FOUND` and HTTP 404 so the client receives a clear failure.
  } // Closes the current block and marks where its grouped work ends.
  if (user.role !== Role.ADMIN && project.assignedPmId !== user.id) { // Checks the caller's role before allowing this role-restricted operation.
    throw new AppError('FORBIDDEN', 'You are not assigned to this project.', 403) // Stops this request with `FORBIDDEN` and HTTP 403 so the client receives a clear failure.
  } // Closes the current block and marks where its grouped work ends.
  return project // Returns `project` to the caller so the next layer can use the result.
} // Closes the current block and marks where its grouped work ends.

async function assertDateAvailable(projectId: number, logDate: Date, id?: number) { // Defines `assertDateAvailable` to assert date available, keeping this behavior reusable.
  const existing = await prisma.dailyLog.findUnique({ // Looks up one matching database record and stores it in `existing` so its existence or values can be checked.
    where: { projectId_logDate: { projectId, logDate } }, // Separates this argument or property from the next item in the surrounding call or object.
    select: { id: true }, // Separates this argument or property from the next item in the surrounding call or object.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
  if (existing && existing.id !== id) { // Checks whether the value is missing; the block handles that case before continuing.
    throw new AppError('CONFLICT', 'A daily log already exists for this project and date.', 409) // Stops this request with `CONFLICT` and HTTP 409 so the client receives a clear failure.
  } // Closes the current block and marks where its grouped work ends.
} // Closes the current block and marks where its grouped work ends.

async function assertLogAccess(user: AuthUser, id: number) { // Defines `assertLogAccess` to assert log access, keeping this behavior reusable.
  const log = await prisma.dailyLog.findUnique({ // Looks up one matching database record and stores it in `log` so its existence or values can be checked.
    where: { id }, // Separates this argument or property from the next item in the surrounding call or object.
    include: { labourEntries: true, machineryEntries: true }, // Separates this argument or property from the next item in the surrounding call or object.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
  if (!log) { // Checks whether the value is missing; the block handles that case before continuing.
    throw new AppError('NOT_FOUND', 'Daily log not found.', 404) // Stops this request with `NOT_FOUND` and HTTP 404 so the client receives a clear failure.
  } // Closes the current block and marks where its grouped work ends.
  await assertProjectAccess(user, log.projectId) // Waits for this asynchronous operation to finish before using its result.
  if (user.role === Role.PM) { // Checks the caller's role before allowing this role-restricted operation.
    const ageHours = (Date.now() - log.createdAt.getTime()) / 3_600_000 // Stores this intermediate `age hours` value so later lines can use it.
    if (ageHours > EDIT_WINDOW_HOURS) { // Checks whether the supplied values meet this condition; the block handles that case before continuing.
      throw new AppError('BUSINESS_RULE_VIOLATION', 'Project Managers can edit logs only within 48 hours of creation.', 422) // Stops this request with `BUSINESS_RULE_VIOLATION` and HTTP 422 so the client receives a clear failure.
    } // Closes the current block and marks where its grouped work ends.
  } // Closes the current block and marks where its grouped work ends.
  return log // Returns `log` to the caller so the next layer can use the result.
} // Closes the current block and marks where its grouped work ends.

function auditSnapshot(log: DailyLogWithEntries): Prisma.InputJsonValue { // Defines `auditSnapshot` to audit snapshot, keeping this behavior reusable.
  return { // Returns the assembled result object so the caller receives the fields it needs.
    id: log.id, // Separates this argument or property from the next item in the surrounding call or object.
    projectId: log.projectId, // Separates this argument or property from the next item in the surrounding call or object.
    logDate: log.logDate.toISOString(), // Separates this argument or property from the next item in the surrounding call or object.
    progressPercent: log.progressPercent.toString(), // Separates this argument or property from the next item in the surrounding call or object.
    workSummary: log.workSummary, // Separates this argument or property from the next item in the surrounding call or object.
    weather: log.weather, // Separates this argument or property from the next item in the surrounding call or object.
    issues: log.issues, // Separates this argument or property from the next item in the surrounding call or object.
    createdById: log.createdById, // Separates this argument or property from the next item in the surrounding call or object.
    createdAt: log.createdAt.toISOString(), // Separates this argument or property from the next item in the surrounding call or object.
    updatedAt: log.updatedAt.toISOString(), // Separates this argument or property from the next item in the surrounding call or object.
    labourEntries: log.labourEntries.map((entry) => ({ // Sets `labourEntries` to the labour entries value.
      id: entry.id, // Separates this argument or property from the next item in the surrounding call or object.
      trade: entry.trade, // Separates this argument or property from the next item in the surrounding call or object.
      contractorName: entry.contractorName, // Separates this argument or property from the next item in the surrounding call or object.
      headCount: entry.headCount, // Separates this argument or property from the next item in the surrounding call or object.
      hoursWorked: entry.hoursWorked.toString(), // Separates this argument or property from the next item in the surrounding call or object.
      remarks: entry.remarks, // Separates this argument or property from the next item in the surrounding call or object.
    })), // Separates this argument or property from the next item in the surrounding call or object.
    machineryEntries: log.machineryEntries.map((entry) => ({ // Sets `machineryEntries` to the machinery entries value.
      id: entry.id, // Separates this argument or property from the next item in the surrounding call or object.
      machineName: entry.machineName, // Separates this argument or property from the next item in the surrounding call or object.
      operatorName: entry.operatorName, // Separates this argument or property from the next item in the surrounding call or object.
      hoursUsed: entry.hoursUsed.toString(), // Separates this argument or property from the next item in the surrounding call or object.
      fuelLitres: entry.fuelLitres?.toString() ?? null, // Separates this argument or property from the next item in the surrounding call or object.
      remarks: entry.remarks, // Separates this argument or property from the next item in the surrounding call or object.
    })), // Separates this argument or property from the next item in the surrounding call or object.
  } // Closes the current block and marks where its grouped work ends.
} // Closes the current block and marks where its grouped work ends.

function childCreateData(input: DailyLogInput | DailyLogPatch) { // Defines `childCreateData` to child create data, keeping this behavior reusable.
  return { // Returns the assembled result object so the caller receives the fields it needs.
    labour: input.labourEntries?.map((entry) => ({ // Sets `labour` to the labour value.
      trade: entry.trade, // Separates this argument or property from the next item in the surrounding call or object.
      contractorName: entry.contractorName, // Separates this argument or property from the next item in the surrounding call or object.
      headCount: entry.headCount, // Separates this argument or property from the next item in the surrounding call or object.
      hoursWorked: entry.hoursWorked, // Separates this argument or property from the next item in the surrounding call or object.
      remarks: entry.remarks, // Separates this argument or property from the next item in the surrounding call or object.
    })), // Separates this argument or property from the next item in the surrounding call or object.
    machinery: input.machineryEntries?.map((entry) => ({ // Sets `machinery` to the machinery value.
      machineName: entry.machineName, // Separates this argument or property from the next item in the surrounding call or object.
      operatorName: entry.operatorName, // Separates this argument or property from the next item in the surrounding call or object.
      hoursUsed: entry.hoursUsed, // Separates this argument or property from the next item in the surrounding call or object.
      fuelLitres: entry.fuelLitres, // Separates this argument or property from the next item in the surrounding call or object.
      remarks: entry.remarks, // Separates this argument or property from the next item in the surrounding call or object.
    })), // Separates this argument or property from the next item in the surrounding call or object.
  } // Closes the current block and marks where its grouped work ends.
} // Closes the current block and marks where its grouped work ends.

export async function listDailyLogs( // Defines `listDailyLogs` to retrieve a list of daily logs, keeping this behavior reusable.
  user: AuthUser, // Separates this argument or property from the next item in the surrounding call or object.
  projectId: number, // Separates this argument or property from the next item in the surrounding call or object.
  query: DailyLogListQuery, // Separates this argument or property from the next item in the surrounding call or object.
) { // Opens the object or callback body that groups the settings for this operation.
  await assertProjectAccess(user, projectId) // Waits for this asynchronous operation to finish before using its result.
  const where: Prisma.DailyLogWhereInput = { // Stores this intermediate `prisma.daily log where input` value so later lines can use it.
    projectId, // Separates this argument or property from the next item in the surrounding call or object.
    ...(query.from || query.to ? { // Opens the object or callback body that groups the settings for this operation.
      logDate: { // Sets `logDate` to the date covered by the daily report.
        ...(query.from ? { gte: dateAtUtcMidnight(query.from) } : {}), // Separates this argument or property from the next item in the surrounding call or object.
        ...(query.to ? { lte: dateAtUtcMidnight(query.to) } : {}), // Separates this argument or property from the next item in the surrounding call or object.
      }, // Closes the current call, object, or collection so the surrounding expression can continue.
    } : {}), // Separates this argument or property from the next item in the surrounding call or object.
  } // Closes the current block and marks where its grouped work ends.
  const [logs, total] = await prisma.$transaction([ // Fetches the page and its matching-record count in one transaction so the response metadata stays consistent; stores both results in `logs,total`.
    prisma.dailyLog.findMany({ // Opens the object or callback body that groups the settings for this operation.
      where, // Separates this argument or property from the next item in the surrounding call or object.
      orderBy: { logDate: 'desc' }, // Separates this argument or property from the next item in the surrounding call or object.
      skip: (query.page - 1) * query.limit, // Separates this argument or property from the next item in the surrounding call or object.
      take: query.limit, // Separates this argument or property from the next item in the surrounding call or object.
      include: { // Sets `include` to loads related records needed alongside the main result.
        labourEntries: { select: { headCount: true } }, // Separates this argument or property from the next item in the surrounding call or object.
        machineryEntries: { select: { hoursUsed: true } }, // Separates this argument or property from the next item in the surrounding call or object.
      }, // Closes the current call, object, or collection so the surrounding expression can continue.
    }), // Separates this argument or property from the next item in the surrounding call or object.
    prisma.dailyLog.count({ where }), // Separates this argument or property from the next item in the surrounding call or object.
  ]) // Closes the current call, object, or collection so the surrounding expression can continue.
  return { // Returns the assembled result object so the caller receives the fields it needs.
    logs: logs.map((log) => ({ // Sets `logs` to the logs value.
      ...log, // Separates this argument or property from the next item in the surrounding call or object.
      labourHeadCountTotal: log.labourEntries.reduce((total, entry) => total + entry.headCount, 0), // Separates this argument or property from the next item in the surrounding call or object.
      machineryHoursTotal: log.machineryEntries.reduce((total, entry) => total + entry.hoursUsed.toNumber(), 0), // Separates this argument or property from the next item in the surrounding call or object.
    })), // Separates this argument or property from the next item in the surrounding call or object.
    meta: { // Sets `meta` to the meta value.
      page: query.page, // Separates this argument or property from the next item in the surrounding call or object.
      limit: query.limit, // Separates this argument or property from the next item in the surrounding call or object.
      total, // Separates this argument or property from the next item in the surrounding call or object.
      totalPages: Math.ceil(total / query.limit), // Separates this argument or property from the next item in the surrounding call or object.
    }, // Closes the current call, object, or collection so the surrounding expression can continue.
  } // Closes the current block and marks where its grouped work ends.
} // Closes the current block and marks where its grouped work ends.

export async function getDailyLog(user: AuthUser, id: number) { // Defines `getDailyLog` to retrieve daily log, keeping this behavior reusable.
  const log = await prisma.dailyLog.findUnique({ // Looks up one matching database record and stores it in `log` so its existence or values can be checked.
    where: { id }, // Separates this argument or property from the next item in the surrounding call or object.
    include: { // Sets `include` to loads related records needed alongside the main result.
      labourEntries: true, // Separates this argument or property from the next item in the surrounding call or object.
      machineryEntries: true, // Separates this argument or property from the next item in the surrounding call or object.
      stockTransactions: true, // Separates this argument or property from the next item in the surrounding call or object.
    }, // Closes the current call, object, or collection so the surrounding expression can continue.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
  if (!log) throw new AppError('NOT_FOUND', 'Daily log not found.', 404) // Checks whether the value is missing; the block handles that case before continuing.
  await assertProjectAccess(user, log.projectId) // Waits for this asynchronous operation to finish before using its result.
  return log // Returns `log` to the caller so the next layer can use the result.
} // Closes the current block and marks where its grouped work ends.

export async function createDailyLog(user: AuthUser, projectId: number, input: DailyLogInput) { // Defines `createDailyLog` to create daily log, keeping this behavior reusable.
  const project = await assertProjectAccess(user, projectId) // Stores this intermediate `project` value so later lines can use it.
  if (project.status !== 'ACTIVE') { // Checks whether the value is missing; the block handles that case before continuing.
    throw new AppError('BUSINESS_RULE_VIOLATION', 'Daily logs can only be created for ACTIVE projects.', 422) // Stops this request with `BUSINESS_RULE_VIOLATION` and HTTP 422 so the client receives a clear failure.
  } // Closes the current block and marks where its grouped work ends.
  const logDate = dateAtUtcMidnight(input.logDate) // Stores this intermediate `log date` value so later lines can use it.
  if (logDate > todayAtUtcMidnight()) { // Checks whether the supplied values meet this condition; the block handles that case before continuing.
    throw new AppError('BUSINESS_RULE_VIOLATION', 'Log date cannot be in the future.', 422) // Stops this request with `BUSINESS_RULE_VIOLATION` and HTTP 422 so the client receives a clear failure.
  } // Closes the current block and marks where its grouped work ends.
  await assertDateAvailable(projectId, logDate) // Waits for this asynchronous operation to finish before using its result.
  const [previous, next] = await Promise.all([ // Stores this intermediate `next` value so later lines can use it.
    prisma.dailyLog.findFirst({ // Opens the object or callback body that groups the settings for this operation.
      where: { projectId, logDate: { lt: logDate } }, // Separates this argument or property from the next item in the surrounding call or object.
      orderBy: { logDate: 'desc' }, // Separates this argument or property from the next item in the surrounding call or object.
      select: { progressPercent: true }, // Separates this argument or property from the next item in the surrounding call or object.
    }), // Separates this argument or property from the next item in the surrounding call or object.
    prisma.dailyLog.findFirst({ // Opens the object or callback body that groups the settings for this operation.
      where: { projectId, logDate: { gt: logDate } }, // Separates this argument or property from the next item in the surrounding call or object.
      orderBy: { logDate: 'asc' }, // Separates this argument or property from the next item in the surrounding call or object.
      select: { progressPercent: true }, // Separates this argument or property from the next item in the surrounding call or object.
    }), // Separates this argument or property from the next item in the surrounding call or object.
  ]) // Closes the current call, object, or collection so the surrounding expression can continue.
  assertProgressOrder(input.progressPercent, previous, next) // Provides `assertProgressOrder(input.progressPercent, previous, next)` as part of create daily log.
  const children = childCreateData(input) // Stores this intermediate `children` value so later lines can use it.

  return prisma.$transaction(async (tx) => { // Returns the database result to the route handler so it can form the API response.
    const created = await tx.dailyLog.create({ // Stores this intermediate `created` value so later lines can use it.
      data: { // Sets `data` to the values to write to the database.
        projectId, // Separates this argument or property from the next item in the surrounding call or object.
        logDate, // Separates this argument or property from the next item in the surrounding call or object.
        progressPercent: input.progressPercent, // Separates this argument or property from the next item in the surrounding call or object.
        workSummary: input.workSummary, // Separates this argument or property from the next item in the surrounding call or object.
        weather: input.weather, // Separates this argument or property from the next item in the surrounding call or object.
        issues: input.issues, // Separates this argument or property from the next item in the surrounding call or object.
        createdById: user.id, // Separates this argument or property from the next item in the surrounding call or object.
        labourEntries: children.labour ? { create: children.labour } : undefined, // Separates this argument or property from the next item in the surrounding call or object.
        machineryEntries: children.machinery ? { create: children.machinery } : undefined, // Separates this argument or property from the next item in the surrounding call or object.
      }, // Closes the current call, object, or collection so the surrounding expression can continue.
      include: { labourEntries: true, machineryEntries: true }, // Separates this argument or property from the next item in the surrounding call or object.
    }) // Closes the current call, object, or collection so the surrounding expression can continue.
    await tx.auditLog.create({ // Waits for this asynchronous operation to finish before using its result.
      data: { // Sets `data` to the values to write to the database.
        userId: user.id, // Separates this argument or property from the next item in the surrounding call or object.
        action: AuditAction.CREATE, // Separates this argument or property from the next item in the surrounding call or object.
        entityType: 'DailyLog', // Separates this argument or property from the next item in the surrounding call or object.
        entityId: created.id, // Separates this argument or property from the next item in the surrounding call or object.
        newValues: auditSnapshot(created), // Separates this argument or property from the next item in the surrounding call or object.
      }, // Closes the current call, object, or collection so the surrounding expression can continue.
    }) // Closes the current call, object, or collection so the surrounding expression can continue.
    return created // Returns `created` to the caller so the next layer can use the result.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
} // Closes the current block and marks where its grouped work ends.

export async function updateDailyLog(user: AuthUser, id: number, input: DailyLogPatch) { // Defines `updateDailyLog` to update daily log, keeping this behavior reusable.
  const existing = await assertLogAccess(user, id) // Stores this intermediate `existing` value so later lines can use it.
  if (input.logDate && dateAtUtcMidnight(input.logDate) > todayAtUtcMidnight()) { // Checks whether the supplied values meet this condition; the block handles that case before continuing.
    throw new AppError('BUSINESS_RULE_VIOLATION', 'Log date cannot be in the future.', 422) // Stops this request with `BUSINESS_RULE_VIOLATION` and HTTP 422 so the client receives a clear failure.
  } // Closes the current block and marks where its grouped work ends.
  const nextDate = input.logDate ? dateAtUtcMidnight(input.logDate) : existing.logDate // Stores this intermediate `next date` value so later lines can use it.
  await assertDateAvailable(existing.projectId, nextDate, id) // Waits for this asynchronous operation to finish before using its result.
  const previous = await prisma.dailyLog.findFirst({ // Looks up one matching database record and stores it in `previous` so its existence or values can be checked.
    where: { // Sets `where` to filters the database records to the requested scope.
      projectId: existing.projectId, // Separates this argument or property from the next item in the surrounding call or object.
      id: { not: id }, // Separates this argument or property from the next item in the surrounding call or object.
      logDate: { lt: nextDate }, // Separates this argument or property from the next item in the surrounding call or object.
    }, // Closes the current call, object, or collection so the surrounding expression can continue.
    orderBy: { logDate: 'desc' }, // Separates this argument or property from the next item in the surrounding call or object.
    select: { progressPercent: true }, // Separates this argument or property from the next item in the surrounding call or object.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
  const next = await prisma.dailyLog.findFirst({ // Looks up one matching database record and stores it in `next` so its existence or values can be checked.
    where: { // Sets `where` to filters the database records to the requested scope.
      projectId: existing.projectId, // Separates this argument or property from the next item in the surrounding call or object.
      id: { not: id }, // Separates this argument or property from the next item in the surrounding call or object.
      logDate: { gt: nextDate }, // Separates this argument or property from the next item in the surrounding call or object.
    }, // Closes the current call, object, or collection so the surrounding expression can continue.
    orderBy: { logDate: 'asc' }, // Separates this argument or property from the next item in the surrounding call or object.
    select: { progressPercent: true }, // Separates this argument or property from the next item in the surrounding call or object.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
  if (input.progressPercent !== undefined) { // Checks whether the caller supplied this optional value before validating or applying it.
    assertProgressOrder(input.progressPercent, previous, next) // Provides `assertProgressOrder(input.progressPercent, previous, next)` as part of update daily log.
  } // Closes the current block and marks where its grouped work ends.
  const children = childCreateData(input) // Stores this intermediate `children` value so later lines can use it.

  return prisma.$transaction(async (tx) => { // Returns the database result to the route handler so it can form the API response.
    if (input.labourEntries) { // Checks whether the supplied values meet this condition; the block handles that case before continuing.
      await tx.labourEntry.deleteMany({ where: { dailyLogId: id } }) // Waits for this asynchronous operation to finish before using its result.
    } // Closes the current block and marks where its grouped work ends.
    if (input.machineryEntries) { // Checks whether the supplied values meet this condition; the block handles that case before continuing.
      await tx.machineryEntry.deleteMany({ where: { dailyLogId: id } }) // Waits for this asynchronous operation to finish before using its result.
    } // Closes the current block and marks where its grouped work ends.
    const updated = await tx.dailyLog.update({ // Stores this intermediate `updated` value so later lines can use it.
      where: { id }, // Separates this argument or property from the next item in the surrounding call or object.
      data: { // Sets `data` to the values to write to the database.
        ...(input.logDate ? { logDate: nextDate } : {}), // Separates this argument or property from the next item in the surrounding call or object.
        ...(input.progressPercent !== undefined ? { progressPercent: input.progressPercent } : {}), // Separates this argument or property from the next item in the surrounding call or object.
        ...(input.workSummary !== undefined ? { workSummary: input.workSummary } : {}), // Separates this argument or property from the next item in the surrounding call or object.
        ...(input.weather !== undefined ? { weather: input.weather } : {}), // Separates this argument or property from the next item in the surrounding call or object.
        ...(input.issues !== undefined ? { issues: input.issues } : {}), // Separates this argument or property from the next item in the surrounding call or object.
        ...(children.labour ? { labourEntries: { create: children.labour } } : {}), // Separates this argument or property from the next item in the surrounding call or object.
        ...(children.machinery ? { machineryEntries: { create: children.machinery } } : {}), // Separates this argument or property from the next item in the surrounding call or object.
      }, // Closes the current call, object, or collection so the surrounding expression can continue.
      include: { labourEntries: true, machineryEntries: true }, // Separates this argument or property from the next item in the surrounding call or object.
    }) // Closes the current call, object, or collection so the surrounding expression can continue.
    await tx.auditLog.create({ // Waits for this asynchronous operation to finish before using its result.
      data: { // Sets `data` to the values to write to the database.
        userId: user.id, // Separates this argument or property from the next item in the surrounding call or object.
        action: AuditAction.UPDATE, // Separates this argument or property from the next item in the surrounding call or object.
        entityType: 'DailyLog', // Separates this argument or property from the next item in the surrounding call or object.
        entityId: updated.id, // Separates this argument or property from the next item in the surrounding call or object.
        oldValues: auditSnapshot(existing), // Separates this argument or property from the next item in the surrounding call or object.
        newValues: auditSnapshot(updated), // Separates this argument or property from the next item in the surrounding call or object.
      }, // Closes the current call, object, or collection so the surrounding expression can continue.
    }) // Closes the current call, object, or collection so the surrounding expression can continue.
    return updated // Returns `updated` to the caller so the next layer can use the result.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
} // Closes the current block and marks where its grouped work ends.

export async function deleteDailyLog(user: AuthUser, id: number) { // Defines `deleteDailyLog` to delete daily log, keeping this behavior reusable.
  const existing = await prisma.dailyLog.findUnique({ // Looks up one matching database record and stores it in `existing` so its existence or values can be checked.
    where: { id }, // Separates this argument or property from the next item in the surrounding call or object.
    include: { labourEntries: true, machineryEntries: true }, // Separates this argument or property from the next item in the surrounding call or object.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
  if (!existing) throw new AppError('NOT_FOUND', 'Daily log not found.', 404) // Checks whether the value is missing; the block handles that case before continuing.
  await assertProjectAccess(user, existing.projectId) // Waits for this asynchronous operation to finish before using its result.
  if (user.role !== Role.ADMIN) { // Checks the caller's role before allowing this role-restricted operation.
    throw new AppError('FORBIDDEN', 'Only Administrators can delete daily logs.', 403) // Stops this request with `FORBIDDEN` and HTTP 403 so the client receives a clear failure.
  } // Closes the current block and marks where its grouped work ends.
  await prisma.$transaction(async (tx) => { // Opens the function, callback, or control-flow block that groups the related statements.
    await tx.dailyLog.delete({ where: { id } }) // Waits for this asynchronous operation to finish before using its result.
    await tx.auditLog.create({ // Waits for this asynchronous operation to finish before using its result.
      data: { // Sets `data` to the values to write to the database.
        userId: user.id, // Separates this argument or property from the next item in the surrounding call or object.
        action: AuditAction.DELETE, // Separates this argument or property from the next item in the surrounding call or object.
        entityType: 'DailyLog', // Separates this argument or property from the next item in the surrounding call or object.
        entityId: id, // Separates this argument or property from the next item in the surrounding call or object.
        oldValues: auditSnapshot(existing), // Separates this argument or property from the next item in the surrounding call or object.
      }, // Closes the current call, object, or collection so the surrounding expression can continue.
    }) // Closes the current call, object, or collection so the surrounding expression can continue.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
} // Closes the current block and marks where its grouped work ends.
// File purpose: Implements daily logs business rules and database operations.
