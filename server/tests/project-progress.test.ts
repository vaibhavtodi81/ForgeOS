import { beforeEach, describe, expect, it, vi } from 'vitest' // Imports test-runner helpers for defining and checking this behavior.

const mocks = vi.hoisted(() => ({ // Stores this intermediate `mocks` value so later lines can use it.
  projectFindFirst: vi.fn(), // Separates this argument or property from the next item in the surrounding call or object.
  dailyLogFindMany: vi.fn(), // Separates this argument or property from the next item in the surrounding call or object.
  auditLogFindMany: vi.fn(), // Separates this argument or property from the next item in the surrounding call or object.
  auditLogCount: vi.fn(), // Separates this argument or property from the next item in the surrounding call or object.
  transaction: vi.fn(), // Separates this argument or property from the next item in the surrounding call or object.
})) // Provides `}))` as part of this server module.

vi.mock('../src/utils/prisma.js', () => ({ // Configures the test double or mock so this test can control the external behavior it depends on.
  prisma: { // Sets `prisma` to the prisma value.
    project: { findFirst: mocks.projectFindFirst }, // Separates this argument or property from the next item in the surrounding call or object.
    dailyLog: { findMany: mocks.dailyLogFindMany }, // Separates this argument or property from the next item in the surrounding call or object.
    auditLog: { findMany: mocks.auditLogFindMany, count: mocks.auditLogCount }, // Separates this argument or property from the next item in the surrounding call or object.
    $transaction: mocks.transaction, // Separates this argument or property from the next item in the surrounding call or object.
  }, // Closes the current call, object, or collection so the surrounding expression can continue.
})) // Provides `}))` as part of this server module.

import { getProjectActivity, getProjectProgressHistory, getProjectSummary } from '../src/modules/projects/projects.service.js' // Imports { getProjectActivity, getProjectProgressHistory, getProjectSummary } from '../src/modules/projects/projects.service.js' so this module can reuse that functionality.
import { // Imports { from  so this module can reuse that functionality.
  projectActivityQuerySchema, // Separates this argument or property from the next item in the surrounding call or object.
  projectDateRangeQuerySchema, // Separates this argument or property from the next item in the surrounding call or object.
  projectProgressHistoryQuerySchema, // Separates this argument or property from the next item in the surrounding call or object.
} from '../src/modules/projects/projects.validator.js' // Provides `} from '../src/modules/projects/projects.validator.js'` as part of this server module.
import { // Imports { from  so this module can reuse that functionality.
  getLabourSummary, // Separates this argument or property from the next item in the surrounding call or object.
  getMachinerySummary, // Separates this argument or property from the next item in the surrounding call or object.
  getMachineryUsageHistory, // Separates this argument or property from the next item in the surrounding call or object.
  getWorkerCountHistory, // Separates this argument or property from the next item in the surrounding call or object.
} from '../src/modules/projects/projects.service.js' // Provides `} from '../src/modules/projects/projects.service.js'` as part of this server module.

const admin = { id: 1, role: 'ADMIN' as const } // Stores this intermediate `admin` value so later lines can use it.
const pm = { id: 2, role: 'PM' as const } // Stores this intermediate `pm` value so later lines can use it.
const project = { // Stores this intermediate `project` value so later lines can use it.
  id: 3, // Separates this argument or property from the next item in the surrounding call or object.
  code: 'DEV-001', // Separates this argument or property from the next item in the surrounding call or object.
  name: 'Development Project', // Separates this argument or property from the next item in the surrounding call or object.
  status: 'ACTIVE', // Separates this argument or property from the next item in the surrounding call or object.
  land: { id: 1, name: 'Parcel' }, // Separates this argument or property from the next item in the surrounding call or object.
  assignedPm: { id: 2, name: 'PM', email: 'pm@example.test' }, // Separates this argument or property from the next item in the surrounding call or object.
} // Closes the current block and marks where its grouped work ends.

function decimal(value: number) { // Defines `decimal` to decimal, keeping this behavior reusable.
  return { toNumber: () => value } // Returns the assembled result object so the caller receives the fields it needs.
} // Closes the current block and marks where its grouped work ends.

const logs = [ // Stores this intermediate `logs` value so later lines can use it.
  { // Opens the function, callback, or control-flow block that groups the related statements.
    id: 10, // Separates this argument or property from the next item in the surrounding call or object.
    logDate: new Date('2026-11-09T00:00:00.000Z'), // Separates this argument or property from the next item in the surrounding call or object.
    progressPercent: decimal(20), // Separates this argument or property from the next item in the surrounding call or object.
    workSummary: 'Foundation work.', // Separates this argument or property from the next item in the surrounding call or object.
    createdBy: { id: 2, name: 'PM', email: 'pm@example.test', role: 'PM' }, // Separates this argument or property from the next item in the surrounding call or object.
    createdAt: new Date('2026-11-09T10:00:00.000Z'), // Separates this argument or property from the next item in the surrounding call or object.
    updatedAt: new Date('2026-11-09T10:00:00.000Z'), // Separates this argument or property from the next item in the surrounding call or object.
    labourEntries: [{ trade: 'Mason', headCount: 4, hoursWorked: decimal(8) }], // Separates this argument or property from the next item in the surrounding call or object.
    machineryEntries: [{ machineName: 'Mixer', operatorName: null, hoursUsed: decimal(3), fuelLitres: decimal(5) }], // Separates this argument or property from the next item in the surrounding call or object.
  }, // Closes the current call, object, or collection so the surrounding expression can continue.
  { // Opens the function, callback, or control-flow block that groups the related statements.
    id: 11, // Separates this argument or property from the next item in the surrounding call or object.
    logDate: new Date('2026-11-10T00:00:00.000Z'), // Separates this argument or property from the next item in the surrounding call or object.
    progressPercent: decimal(35), // Separates this argument or property from the next item in the surrounding call or object.
    workSummary: 'Slab work.', // Separates this argument or property from the next item in the surrounding call or object.
    createdBy: { id: 1, name: 'Admin', email: 'admin@example.test', role: 'ADMIN' }, // Separates this argument or property from the next item in the surrounding call or object.
    createdAt: new Date('2026-11-10T10:00:00.000Z'), // Separates this argument or property from the next item in the surrounding call or object.
    updatedAt: new Date('2026-11-10T10:00:00.000Z'), // Separates this argument or property from the next item in the surrounding call or object.
    labourEntries: [{ trade: 'Mason', headCount: 6, hoursWorked: decimal(7.5) }], // Separates this argument or property from the next item in the surrounding call or object.
    machineryEntries: [{ machineName: 'Mixer', operatorName: 'Operator', hoursUsed: decimal(4), fuelLitres: null }], // Separates this argument or property from the next item in the surrounding call or object.
  }, // Closes the current call, object, or collection so the surrounding expression can continue.
] // Provides `]` as part of decimal.

beforeEach(() => { // Opens the function, callback, or control-flow block that groups the related statements.
  vi.clearAllMocks() // Configures the test double or mock so this test can control the external behavior it depends on.
  mocks.transaction.mockImplementation(async (operations: Array<Promise<unknown>>) => Promise.all(operations)) // Provides `mocks.transaction.mockImplementation(async (operations: Array<Promise<unknown>>) => Promise.all(operations))` as part of decimal.
  mocks.projectFindFirst.mockResolvedValue(project) // Provides `mocks.projectFindFirst.mockResolvedValue(project)` as part of decimal.
  mocks.dailyLogFindMany.mockResolvedValue(logs) // Provides `mocks.dailyLogFindMany.mockResolvedValue(logs)` as part of decimal.
  mocks.auditLogFindMany.mockResolvedValue([]) // Provides `mocks.auditLogFindMany.mockResolvedValue([])` as part of decimal.
  mocks.auditLogCount.mockResolvedValue(0) // Provides `mocks.auditLogCount.mockResolvedValue(0)` as part of decimal.
}) // Closes the current call, object, or collection so the surrounding expression can continue.

describe('project progress history and summary', () => { // Opens the function, callback, or control-flow block that groups the related statements.
  it('allows ADMIN and assigned PM to read chronological progress history', async () => { // Opens the function, callback, or control-flow block that groups the related statements.
    await expect(getProjectProgressHistory(admin, 3, {})).resolves.toEqual( // Waits for this asynchronous operation to finish before using its result.
      expect.arrayContaining([expect.objectContaining({ id: 10 }), expect.objectContaining({ id: 11 })]), // Separates this argument or property from the next item in the surrounding call or object.
    ) // Closes the current call, object, or collection so the surrounding expression can continue.
    await expect(getProjectProgressHistory(pm, 3, {})).resolves.toHaveLength(2) // Waits for this asynchronous operation to finish before using its result.
    expect(mocks.projectFindFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 3, assignedPmId: pm.id } })) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(mocks.dailyLogFindMany).toHaveBeenCalledWith(expect.objectContaining({ orderBy: { logDate: 'asc' } })) // Asserts that the observed result matches the behavior this test is meant to guarantee.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.

  it('rejects an unassigned PM and nonexistent project', async () => { // Opens the function, callback, or control-flow block that groups the related statements.
    mocks.projectFindFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(null) // Provides `mocks.projectFindFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(null)` as part of decimal.
    await expect(getProjectProgressHistory(pm, 3, {})).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 }) // Waits for this asynchronous operation to finish before using its result.
    await expect(getProjectSummary(pm, 99)).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 }) // Waits for this asynchronous operation to finish before using its result.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.

  it('returns a safe empty summary when a project has no daily logs', async () => { // Opens the function, callback, or control-flow block that groups the related statements.
    mocks.dailyLogFindMany.mockResolvedValue([]) // Provides `mocks.dailyLogFindMany.mockResolvedValue([])` as part of decimal.
    const result = await getProjectSummary(admin, 3) // Stores this intermediate `result` value so later lines can use it.

    expect(result).toMatchObject({ // Asserts that the observed result matches the behavior this test is meant to guarantee.
      project, // Separates this argument or property from the next item in the surrounding call or object.
      latestProgressPercent: 0, // Separates this argument or property from the next item in the surrounding call or object.
      latestLogDate: null, // Separates this argument or property from the next item in the surrounding call or object.
      totalDailyLogs: 0, // Separates this argument or property from the next item in the surrounding call or object.
      totalLabourHeadCount: 0, // Separates this argument or property from the next item in the surrounding call or object.
      totalLabourHours: 0, // Separates this argument or property from the next item in the surrounding call or object.
      totalMachineryHours: 0, // Separates this argument or property from the next item in the surrounding call or object.
      totalMachineryFuel: 0, // Separates this argument or property from the next item in the surrounding call or object.
    }) // Closes the current call, object, or collection so the surrounding expression can continue.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.

  it('calculates latest progress and labour/machinery totals', async () => { // Opens the function, callback, or control-flow block that groups the related statements.
    const result = await getProjectSummary(admin, 3) // Stores this intermediate `result` value so later lines can use it.

    expect(result.latestProgressPercent).toBe(logs[0].progressPercent) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(result.latestLogDate).toEqual(logs[0].logDate) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(result.totalDailyLogs).toBe(2) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(result.totalLabourHeadCount).toBe(10) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(result.totalLabourHours).toBe(15.5) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(result.totalMachineryHours).toBe(7) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(result.totalMachineryFuel).toBe(5) // Asserts that the observed result matches the behavior this test is meant to guarantee.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.

  it('validates optional progress-history date filters', () => { // Opens the function, callback, or control-flow block that groups the related statements.
    expect(projectProgressHistoryQuerySchema.safeParse({}).success).toBe(true) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(projectProgressHistoryQuerySchema.safeParse({ from: '2026-11-10', to: '2026-11-09' }).success).toBe(false) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(projectProgressHistoryQuerySchema.safeParse({ from: 'bad-date' }).success).toBe(false) // Asserts that the observed result matches the behavior this test is meant to guarantee.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
}) // Closes the current call, object, or collection so the surrounding expression can continue.

describe('project activity timeline', () => { // Opens the function, callback, or control-flow block that groups the related statements.
  const activities = [ // Stores this intermediate `activities` value so later lines can use it.
    { // Opens the function, callback, or control-flow block that groups the related statements.
      id: 2, // Separates this argument or property from the next item in the surrounding call or object.
      action: 'UPDATE', // Separates this argument or property from the next item in the surrounding call or object.
      entityType: 'DailyLog', // Separates this argument or property from the next item in the surrounding call or object.
      entityId: 11, // Separates this argument or property from the next item in the surrounding call or object.
      oldValues: { projectId: 3, workSummary: 'Old' }, // Separates this argument or property from the next item in the surrounding call or object.
      newValues: { projectId: 3, workSummary: 'New' }, // Separates this argument or property from the next item in the surrounding call or object.
      createdAt: new Date('2026-11-11T12:00:00.000Z'), // Separates this argument or property from the next item in the surrounding call or object.
      user: { id: 2, name: 'PM' }, // Separates this argument or property from the next item in the surrounding call or object.
    }, // Closes the current call, object, or collection so the surrounding expression can continue.
    { // Opens the function, callback, or control-flow block that groups the related statements.
      id: 1, // Separates this argument or property from the next item in the surrounding call or object.
      action: 'CREATE', // Separates this argument or property from the next item in the surrounding call or object.
      entityType: 'Project', // Separates this argument or property from the next item in the surrounding call or object.
      entityId: 3, // Separates this argument or property from the next item in the surrounding call or object.
      oldValues: null, // Separates this argument or property from the next item in the surrounding call or object.
      newValues: { name: 'Development Project' }, // Separates this argument or property from the next item in the surrounding call or object.
      createdAt: new Date('2026-11-10T12:00:00.000Z'), // Separates this argument or property from the next item in the surrounding call or object.
      user: { id: 1, name: 'Admin' }, // Separates this argument or property from the next item in the surrounding call or object.
    }, // Closes the current call, object, or collection so the surrounding expression can continue.
  ] // Provides `]` as part of decimal.

  it('allows ADMIN and assigned PM, scopes multiple entity types, and paginates', async () => { // Opens the function, callback, or control-flow block that groups the related statements.
    mocks.auditLogFindMany.mockResolvedValue(activities) // Provides `mocks.auditLogFindMany.mockResolvedValue(activities)` as part of decimal.
    mocks.auditLogCount.mockResolvedValue(3) // Provides `mocks.auditLogCount.mockResolvedValue(3)` as part of decimal.

    const result = await getProjectActivity(admin, 3, { page: 1, limit: 2 }) // Stores this intermediate `result` value so later lines can use it.
    expect(result.activities).toEqual([ // Asserts that the observed result matches the behavior this test is meant to guarantee.
      expect.objectContaining({ id: 2, userId: 2, userName: 'PM', oldData: activities[0].oldValues }), // Separates this argument or property from the next item in the surrounding call or object.
      expect.objectContaining({ id: 1, entityType: 'Project', newData: activities[1].newValues }), // Separates this argument or property from the next item in the surrounding call or object.
    ]) // Closes the current call, object, or collection so the surrounding expression can continue.
    expect(result.meta).toEqual({ page: 1, limit: 2, total: 3, totalPages: 2 }) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(mocks.auditLogFindMany).toHaveBeenCalledWith(expect.objectContaining({ // Asserts that the observed result matches the behavior this test is meant to guarantee.
      where: expect.objectContaining({ // Sets `where` to filters the database records to the requested scope.
        OR: expect.arrayContaining([ // Sets `OR` to matches a record when any listed condition is true.
          { entityType: 'Project', entityId: 3 }, // Separates this argument or property from the next item in the surrounding call or object.
          { oldValues: { path: ['projectId'], equals: 3 } }, // Separates this argument or property from the next item in the surrounding call or object.
        ]), // Separates this argument or property from the next item in the surrounding call or object.
      }), // Separates this argument or property from the next item in the surrounding call or object.
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], // Separates this argument or property from the next item in the surrounding call or object.
      skip: 0, // Separates this argument or property from the next item in the surrounding call or object.
      take: 2, // Separates this argument or property from the next item in the surrounding call or object.
    })) // Provides `}))` as part of decimal.

    await expect(getProjectActivity(pm, 3, { page: 2, limit: 1 })).resolves.toMatchObject({ // Waits for this asynchronous operation to finish before using its result.
      meta: { page: 2, limit: 1 }, // Separates this argument or property from the next item in the surrounding call or object.
    }) // Closes the current call, object, or collection so the surrounding expression can continue.
    expect(mocks.projectFindFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 3, assignedPmId: pm.id } })) // Asserts that the observed result matches the behavior this test is meant to guarantee.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.

  it('returns 404 for unassigned or nonexistent projects and handles empty history', async () => { // Opens the function, callback, or control-flow block that groups the related statements.
    mocks.projectFindFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(null).mockResolvedValueOnce(project) // Provides `mocks.projectFindFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(null).mockResolvedValueOnce(project)` as part of decimal.
    await expect(getProjectActivity(pm, 3, { page: 1, limit: 20 })).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 }) // Waits for this asynchronous operation to finish before using its result.
    await expect(getProjectActivity(admin, 99, { page: 1, limit: 20 })).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 }) // Waits for this asynchronous operation to finish before using its result.

    const result = await getProjectActivity(admin, 3, { page: 1, limit: 20 }) // Stores this intermediate `result` value so later lines can use it.
    expect(result).toMatchObject({ activities: [], meta: { total: 0, totalPages: 0 } }) // Asserts that the observed result matches the behavior this test is meant to guarantee.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.

  it('validates activity pagination parameters', () => { // Opens the function, callback, or control-flow block that groups the related statements.
    expect(projectActivityQuerySchema.parse({})).toEqual({ page: 1, limit: 20 }) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(projectActivityQuerySchema.safeParse({ page: 0 }).success).toBe(false) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(projectActivityQuerySchema.safeParse({ limit: 101 }).success).toBe(false) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(projectActivityQuerySchema.safeParse({ page: 'bad' }).success).toBe(false) // Asserts that the observed result matches the behavior this test is meant to guarantee.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
}) // Closes the current call, object, or collection so the surrounding expression can continue.

describe('labour and machinery reporting', () => { // Opens the function, callback, or control-flow block that groups the related statements.
  it('calculates labour totals and trade grouping for ADMIN and assigned PM', async () => { // Opens the function, callback, or control-flow block that groups the related statements.
    const adminResult = await getLabourSummary(admin, 3, {}) // Stores this intermediate `admin result` value so later lines can use it.
    const pmResult = await getLabourSummary(pm, 3, { from: '2026-11-09', to: '2026-11-10' }) // Stores this intermediate `pm result` value so later lines can use it.

    expect(adminResult).toMatchObject({ // Asserts that the observed result matches the behavior this test is meant to guarantee.
      totalWorkerCount: 10, // Separates this argument or property from the next item in the surrounding call or object.
      totalLabourHours: 15.5, // Separates this argument or property from the next item in the surrounding call or object.
      totalLabourEntries: 2, // Separates this argument or property from the next item in the surrounding call or object.
      byTrade: [ // Sets `byTrade` to the by trade value.
        { trade: 'Mason', workerCount: 10, labourHours: 15.5, entries: 2 }, // Separates this argument or property from the next item in the surrounding call or object.
      ], // Closes the current call, object, or collection so the surrounding expression can continue.
    }) // Closes the current call, object, or collection so the surrounding expression can continue.
    expect(pmResult.totalWorkerCount).toBe(10) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(mocks.dailyLogFindMany).toHaveBeenCalledWith(expect.objectContaining({ // Asserts that the observed result matches the behavior this test is meant to guarantee.
      where: expect.objectContaining({ projectId: 3, logDate: expect.any(Object) }), // Separates this argument or property from the next item in the surrounding call or object.
    })) // Provides `}))` as part of decimal.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.

  it('calculates machinery totals and machine grouping', async () => { // Opens the function, callback, or control-flow block that groups the related statements.
    const result = await getMachinerySummary(admin, 3, {}) // Stores this intermediate `result` value so later lines can use it.

    expect(result).toMatchObject({ // Asserts that the observed result matches the behavior this test is meant to guarantee.
      totalMachineryHours: 7, // Separates this argument or property from the next item in the surrounding call or object.
      totalFuelConsumption: 5, // Separates this argument or property from the next item in the surrounding call or object.
      totalMachineryEntries: 2, // Separates this argument or property from the next item in the surrounding call or object.
      byMachine: [ // Sets `byMachine` to the by machine value.
        { machineName: 'Mixer', hoursUsed: 7, fuelConsumption: 5, entries: 2 }, // Separates this argument or property from the next item in the surrounding call or object.
      ], // Closes the current call, object, or collection so the surrounding expression can continue.
    }) // Closes the current call, object, or collection so the surrounding expression can continue.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.

  it('returns chronological worker and machinery histories', async () => { // Opens the function, callback, or control-flow block that groups the related statements.
    const workerHistory = await getWorkerCountHistory(admin, 3, {}) // Stores this intermediate `worker history` value so later lines can use it.
    const machineryHistory = await getMachineryUsageHistory(admin, 3, {}) // Stores this intermediate `machinery history` value so later lines can use it.

    expect(workerHistory.map((entry) => entry.dailyLogId)).toEqual([10, 11]) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(workerHistory[0]).toMatchObject({ totalWorkerCount: 4, labourHours: 8 }) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(machineryHistory.map((entry) => entry.dailyLogId)).toEqual([10, 11]) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(machineryHistory[0]).toMatchObject({ // Asserts that the observed result matches the behavior this test is meant to guarantee.
      machineName: 'Mixer', // Separates this argument or property from the next item in the surrounding call or object.
      hoursUsed: 3, // Separates this argument or property from the next item in the surrounding call or object.
      fuelConsumption: 5, // Separates this argument or property from the next item in the surrounding call or object.
      operatorName: null, // Separates this argument or property from the next item in the surrounding call or object.
    }) // Closes the current call, object, or collection so the surrounding expression can continue.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.

  it('handles empty reporting history and validates date ranges', async () => { // Opens the function, callback, or control-flow block that groups the related statements.
    mocks.dailyLogFindMany.mockResolvedValue([]) // Provides `mocks.dailyLogFindMany.mockResolvedValue([])` as part of decimal.
    await expect(getLabourSummary(admin, 3, {})).resolves.toMatchObject({ // Waits for this asynchronous operation to finish before using its result.
      totalWorkerCount: 0, // Separates this argument or property from the next item in the surrounding call or object.
      totalLabourHours: 0, // Separates this argument or property from the next item in the surrounding call or object.
      totalLabourEntries: 0, // Separates this argument or property from the next item in the surrounding call or object.
      byTrade: [], // Separates this argument or property from the next item in the surrounding call or object.
    }) // Closes the current call, object, or collection so the surrounding expression can continue.
    await expect(getMachinerySummary(admin, 3, {})).resolves.toMatchObject({ // Waits for this asynchronous operation to finish before using its result.
      totalMachineryHours: 0, // Separates this argument or property from the next item in the surrounding call or object.
      totalFuelConsumption: 0, // Separates this argument or property from the next item in the surrounding call or object.
      totalMachineryEntries: 0, // Separates this argument or property from the next item in the surrounding call or object.
      byMachine: [], // Separates this argument or property from the next item in the surrounding call or object.
    }) // Closes the current call, object, or collection so the surrounding expression can continue.
    expect(projectDateRangeQuerySchema.safeParse({ from: '2026-11-10', to: '2026-11-09' }).success).toBe(false) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(projectDateRangeQuerySchema.safeParse({ from: 'invalid' }).success).toBe(false) // Asserts that the observed result matches the behavior this test is meant to guarantee.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.

  it('denies unassigned PMs and nonexistent projects', async () => { // Opens the function, callback, or control-flow block that groups the related statements.
    mocks.projectFindFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(null) // Provides `mocks.projectFindFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(null)` as part of decimal.
    await expect(getWorkerCountHistory(pm, 3, {})).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 }) // Waits for this asynchronous operation to finish before using its result.
    await expect(getMachineryUsageHistory(admin, 999, {})).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 }) // Waits for this asynchronous operation to finish before using its result.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
}) // Closes the current call, object, or collection so the surrounding expression can continue.
// File purpose: Checks expected behavior for project progress.test using the project test runner.
