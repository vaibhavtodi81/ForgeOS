import { beforeEach, describe, expect, it, vi } from 'vitest' // Imports test-runner helpers for defining and checking this behavior.

const mocks = vi.hoisted(() => ({ // Stores this intermediate `mocks` value so later lines can use it.
  projectFindUnique: vi.fn(), // Separates this argument or property from the next item in the surrounding call or object.
  dailyLogFindUnique: vi.fn(), // Separates this argument or property from the next item in the surrounding call or object.
  dailyLogFindFirst: vi.fn(), // Separates this argument or property from the next item in the surrounding call or object.
  dailyLogFindMany: vi.fn(), // Separates this argument or property from the next item in the surrounding call or object.
  dailyLogCount: vi.fn(), // Separates this argument or property from the next item in the surrounding call or object.
  dailyLogCreate: vi.fn(), // Separates this argument or property from the next item in the surrounding call or object.
  dailyLogUpdate: vi.fn(), // Separates this argument or property from the next item in the surrounding call or object.
  dailyLogDelete: vi.fn(), // Separates this argument or property from the next item in the surrounding call or object.
  auditLogCreate: vi.fn(), // Separates this argument or property from the next item in the surrounding call or object.
  labourDeleteMany: vi.fn(), // Separates this argument or property from the next item in the surrounding call or object.
  machineryDeleteMany: vi.fn(), // Separates this argument or property from the next item in the surrounding call or object.
  transaction: vi.fn(), // Separates this argument or property from the next item in the surrounding call or object.
})) // Provides `}))` as part of this server module.

vi.mock('../src/utils/prisma.js', () => ({ // Configures the test double or mock so this test can control the external behavior it depends on.
  prisma: { // Sets `prisma` to the prisma value.
    project: { findUnique: mocks.projectFindUnique }, // Separates this argument or property from the next item in the surrounding call or object.
    dailyLog: { // Sets `dailyLog` to the daily log value.
      findUnique: mocks.dailyLogFindUnique, // Separates this argument or property from the next item in the surrounding call or object.
      findFirst: mocks.dailyLogFindFirst, // Separates this argument or property from the next item in the surrounding call or object.
      findMany: mocks.dailyLogFindMany, // Separates this argument or property from the next item in the surrounding call or object.
      count: mocks.dailyLogCount, // Separates this argument or property from the next item in the surrounding call or object.
      create: mocks.dailyLogCreate, // Separates this argument or property from the next item in the surrounding call or object.
      update: mocks.dailyLogUpdate, // Separates this argument or property from the next item in the surrounding call or object.
      delete: mocks.dailyLogDelete, // Separates this argument or property from the next item in the surrounding call or object.
    }, // Closes the current call, object, or collection so the surrounding expression can continue.
    $transaction: mocks.transaction, // Separates this argument or property from the next item in the surrounding call or object.
  }, // Closes the current call, object, or collection so the surrounding expression can continue.
})) // Provides `}))` as part of this server module.

import { // Imports { from  so this module can reuse that functionality.
  createDailyLog, // Separates this argument or property from the next item in the surrounding call or object.
  deleteDailyLog, // Separates this argument or property from the next item in the surrounding call or object.
  getDailyLog, // Separates this argument or property from the next item in the surrounding call or object.
  listDailyLogs, // Separates this argument or property from the next item in the surrounding call or object.
  updateDailyLog, // Separates this argument or property from the next item in the surrounding call or object.
} from '../src/modules/daily-logs/daily-logs.service.js' // Provides `} from '../src/modules/daily-logs/daily-logs.service.js'` as part of this server module.
import { dailyLogListQuerySchema } from '../src/modules/daily-logs/daily-logs.validator.js' // Imports { dailyLogListQuerySchema } from '../src/modules/daily-logs/daily-logs.validator.js' so this module can reuse that functionality.

const admin = { id: 1, role: 'ADMIN' as const } // Stores this intermediate `admin` value so later lines can use it.
const pm = { id: 2, role: 'PM' as const } // Stores this intermediate `pm` value so later lines can use it.
const today = new Date() // Converts the supplied date into a JavaScript date value and stores it in `today` for consistent comparisons.
const date = today.toISOString().slice(0, 10) // Stores this intermediate `date` value so later lines can use it.
const yesterday = new Date(today.getTime() - 86_400_000).toISOString().slice(0, 10) // Converts the supplied date into a JavaScript date value and stores it in `yesterday` for consistent comparisons.
const tomorrow = new Date(today.getTime() + 86_400_000).toISOString().slice(0, 10) // Converts the supplied date into a JavaScript date value and stores it in `tomorrow` for consistent comparisons.

const input = { // Stores this intermediate `input` value so later lines can use it.
  logDate: date, // Separates this argument or property from the next item in the surrounding call or object.
  progressPercent: 40, // Separates this argument or property from the next item in the surrounding call or object.
  workSummary: 'Concrete work completed.', // Separates this argument or property from the next item in the surrounding call or object.
  labourEntries: [{ trade: 'Mason', headCount: 4, hoursWorked: 8 }], // Separates this argument or property from the next item in the surrounding call or object.
  machineryEntries: [{ machineName: 'Mixer', hoursUsed: 3, fuelLitres: 5 }], // Separates this argument or property from the next item in the surrounding call or object.
} // Closes the current block and marks where its grouped work ends.

function decimal(value: number) { // Defines `decimal` to decimal, keeping this behavior reusable.
  return { toNumber: () => value, toString: () => String(value) } // Returns the assembled result object so the caller receives the fields it needs.
} // Closes the current block and marks where its grouped work ends.

function configureTransaction() { // Defines `configureTransaction` to configure transaction, keeping this behavior reusable.
  mocks.transaction.mockImplementation(async (operation: unknown) => { // Opens the function, callback, or control-flow block that groups the related statements.
    if (typeof operation === 'function') { // Checks whether the supplied values meet this condition; the block handles that case before continuing.
      return operation({ // Returns `operation({` to the caller so the next layer can use the result.
        dailyLog: { create: mocks.dailyLogCreate, update: mocks.dailyLogUpdate, delete: mocks.dailyLogDelete }, // Separates this argument or property from the next item in the surrounding call or object.
        labourEntry: { deleteMany: mocks.labourDeleteMany }, // Separates this argument or property from the next item in the surrounding call or object.
        machineryEntry: { deleteMany: mocks.machineryDeleteMany }, // Separates this argument or property from the next item in the surrounding call or object.
        auditLog: { create: mocks.auditLogCreate }, // Separates this argument or property from the next item in the surrounding call or object.
      }) // Closes the current call, object, or collection so the surrounding expression can continue.
    } // Closes the current block and marks where its grouped work ends.
    return Promise.all(operation as Array<Promise<unknown>>) // Returns `Promise.all(operation as Array<Promise<unknown>>)` to the caller so the next layer can use the result.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
} // Closes the current block and marks where its grouped work ends.

beforeEach(() => { // Opens the function, callback, or control-flow block that groups the related statements.
  vi.clearAllMocks() // Configures the test double or mock so this test can control the external behavior it depends on.
  configureTransaction() // Provides `configureTransaction()` as part of configure transaction.
  mocks.projectFindUnique.mockResolvedValue({ id: 3, status: 'ACTIVE', assignedPmId: pm.id }) // Provides `mocks.projectFindUnique.mockResolvedValue({ id: 3, status: 'ACTIVE', assignedPmId: pm.id })` as part of configure transaction.
  mocks.dailyLogFindUnique.mockResolvedValue(null) // Provides `mocks.dailyLogFindUnique.mockResolvedValue(null)` as part of configure transaction.
  mocks.dailyLogFindFirst.mockResolvedValue(null) // Provides `mocks.dailyLogFindFirst.mockResolvedValue(null)` as part of configure transaction.
  mocks.dailyLogCreate.mockResolvedValue({ // Opens the object or callback body that groups the settings for this operation.
    id: 10, // Separates this argument or property from the next item in the surrounding call or object.
    projectId: 3, // Separates this argument or property from the next item in the surrounding call or object.
    logDate: new Date(`${date}T00:00:00.000Z`), // Separates this argument or property from the next item in the surrounding call or object.
    progressPercent: decimal(input.progressPercent), // Separates this argument or property from the next item in the surrounding call or object.
    workSummary: input.workSummary, // Separates this argument or property from the next item in the surrounding call or object.
    weather: null, // Separates this argument or property from the next item in the surrounding call or object.
    issues: null, // Separates this argument or property from the next item in the surrounding call or object.
    createdById: pm.id, // Separates this argument or property from the next item in the surrounding call or object.
    createdAt: new Date(), // Separates this argument or property from the next item in the surrounding call or object.
    updatedAt: new Date(), // Separates this argument or property from the next item in the surrounding call or object.
    labourEntries: [{ id: 1, trade: 'Mason', contractorName: null, headCount: 4, hoursWorked: decimal(8), remarks: null }], // Separates this argument or property from the next item in the surrounding call or object.
    machineryEntries: [{ id: 1, machineName: 'Mixer', operatorName: null, hoursUsed: decimal(3), fuelLitres: decimal(5), remarks: null }], // Separates this argument or property from the next item in the surrounding call or object.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
  mocks.dailyLogUpdate.mockImplementation(async (args: { data: Record<string, unknown> }) => ({ // Opens the object or callback body that groups the settings for this operation.
    id: 10, // Separates this argument or property from the next item in the surrounding call or object.
    projectId: 3, // Separates this argument or property from the next item in the surrounding call or object.
    logDate: new Date(`${date}T00:00:00.000Z`), // Separates this argument or property from the next item in the surrounding call or object.
    progressPercent: decimal(input.progressPercent), // Separates this argument or property from the next item in the surrounding call or object.
    workSummary: args.data.workSummary ?? input.workSummary, // Separates this argument or property from the next item in the surrounding call or object.
    weather: null, // Separates this argument or property from the next item in the surrounding call or object.
    issues: null, // Separates this argument or property from the next item in the surrounding call or object.
    createdById: pm.id, // Separates this argument or property from the next item in the surrounding call or object.
    createdAt: new Date(), // Separates this argument or property from the next item in the surrounding call or object.
    updatedAt: new Date(), // Separates this argument or property from the next item in the surrounding call or object.
    labourEntries: args.data.labourEntries // Sets `labourEntries` to the labour entries value.
      ? [{ id: 2, ...((args.data.labourEntries as { create: unknown[] }).create[0] as object), hoursWorked: decimal(6) }] // Provides `? [{ id: 2, ...((args.data.labourEntries as { create: unknown[] }).create[0] as object), hoursWorked: decimal(6) }]` as part of configure transaction.
      : [], // Separates this argument or property from the next item in the surrounding call or object.
    machineryEntries: args.data.machineryEntries // Sets `machineryEntries` to the machinery entries value.
      ? [{ id: 2, ...((args.data.machineryEntries as { create: unknown[] }).create[0] as object), hoursUsed: decimal(4), fuelLitres: null }] // Provides `? [{ id: 2, ...((args.data.machineryEntries as { create: unknown[] }).create[0] as object), hoursUsed: decimal(4), fuelLitres: null }]` as part of configure transaction.
      : [], // Separates this argument or property from the next item in the surrounding call or object.
  })) // Provides `}))` as part of configure transaction.
  mocks.dailyLogDelete.mockResolvedValue({}) // Provides `mocks.dailyLogDelete.mockResolvedValue({})` as part of configure transaction.
  mocks.auditLogCreate.mockResolvedValue({ id: 100 }) // Provides `mocks.auditLogCreate.mockResolvedValue({ id: 100 })` as part of configure transaction.
}) // Closes the current call, object, or collection so the surrounding expression can continue.

describe('daily log authorization and creation rules', () => { // Opens the function, callback, or control-flow block that groups the related statements.
  it('allows ADMIN and assigned PM to list project logs', async () => { // Opens the function, callback, or control-flow block that groups the related statements.
    mocks.dailyLogFindMany.mockResolvedValue([]) // Provides `mocks.dailyLogFindMany.mockResolvedValue([])` as part of configure transaction.
    mocks.dailyLogCount.mockResolvedValue(0) // Provides `mocks.dailyLogCount.mockResolvedValue(0)` as part of configure transaction.

    await expect(listDailyLogs(admin, 3, { page: 1, limit: 20 })).resolves.toMatchObject({ logs: [] }) // Waits for this asynchronous operation to finish before using its result.
    await expect(listDailyLogs(pm, 3, { page: 1, limit: 20 })).resolves.toMatchObject({ logs: [] }) // Waits for this asynchronous operation to finish before using its result.
    expect(mocks.projectFindUnique).toHaveBeenCalledTimes(2) // Asserts that the observed result matches the behavior this test is meant to guarantee.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.

  it('rejects PM access to an unassigned project', async () => { // Opens the function, callback, or control-flow block that groups the related statements.
    mocks.projectFindUnique.mockResolvedValue({ id: 3, status: 'ACTIVE', assignedPmId: 99 }) // Provides `mocks.projectFindUnique.mockResolvedValue({ id: 3, status: 'ACTIVE', assignedPmId: 99 })` as part of configure transaction.

    await expect(listDailyLogs(pm, 3, { page: 1, limit: 20 })).rejects.toMatchObject({ code: 'FORBIDDEN', status: 403 }) // Waits for this asynchronous operation to finish before using its result.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.

  it('allows ADMIN and assigned PM to create logs with labour and machinery entries', async () => { // Opens the function, callback, or control-flow block that groups the related statements.
    await createDailyLog(admin, 3, input) // Waits for this asynchronous operation to finish before using its result.
    await createDailyLog(pm, 3, input) // Waits for this asynchronous operation to finish before using its result.

    expect(mocks.dailyLogCreate).toHaveBeenCalledTimes(2) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(mocks.dailyLogCreate).toHaveBeenCalledWith(expect.objectContaining({ // Asserts that the observed result matches the behavior this test is meant to guarantee.
      data: expect.objectContaining({ // Sets `data` to the values to write to the database.
        labourEntries: { create: [{ trade: 'Mason', contractorName: undefined, headCount: 4, hoursWorked: 8, remarks: undefined }] }, // Separates this argument or property from the next item in the surrounding call or object.
        machineryEntries: { create: [{ machineName: 'Mixer', operatorName: undefined, hoursUsed: 3, fuelLitres: 5, remarks: undefined }] }, // Separates this argument or property from the next item in the surrounding call or object.
      }), // Separates this argument or property from the next item in the surrounding call or object.
    })) // Provides `}))` as part of configure transaction.
    expect(mocks.auditLogCreate).toHaveBeenCalledTimes(2) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(mocks.auditLogCreate).toHaveBeenCalledWith(expect.objectContaining({ // Asserts that the observed result matches the behavior this test is meant to guarantee.
      data: expect.objectContaining({ // Sets `data` to the values to write to the database.
        userId: pm.id, // Separates this argument or property from the next item in the surrounding call or object.
        action: 'CREATE', // Separates this argument or property from the next item in the surrounding call or object.
        entityType: 'DailyLog', // Separates this argument or property from the next item in the surrounding call or object.
        entityId: 10, // Separates this argument or property from the next item in the surrounding call or object.
        newValues: expect.objectContaining({ // Sets `newValues` to the record values after the change.
          labourEntries: expect.arrayContaining([expect.objectContaining({ trade: 'Mason', headCount: 4 })]), // Separates this argument or property from the next item in the surrounding call or object.
          machineryEntries: expect.arrayContaining([expect.objectContaining({ machineName: 'Mixer', hoursUsed: '3' })]), // Separates this argument or property from the next item in the surrounding call or object.
        }), // Separates this argument or property from the next item in the surrounding call or object.
      }), // Separates this argument or property from the next item in the surrounding call or object.
    })) // Provides `}))` as part of configure transaction.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.

  it('rejects creation for inactive projects and future dates', async () => { // Opens the function, callback, or control-flow block that groups the related statements.
    mocks.projectFindUnique.mockResolvedValue({ id: 3, status: 'PLANNING', assignedPmId: pm.id }) // Provides `mocks.projectFindUnique.mockResolvedValue({ id: 3, status: 'PLANNING', assignedPmId: pm.id })` as part of configure transaction.
    await expect(createDailyLog(pm, 3, input)).rejects.toMatchObject({ code: 'BUSINESS_RULE_VIOLATION', status: 422 }) // Waits for this asynchronous operation to finish before using its result.

    mocks.projectFindUnique.mockResolvedValue({ id: 3, status: 'ACTIVE', assignedPmId: pm.id }) // Provides `mocks.projectFindUnique.mockResolvedValue({ id: 3, status: 'ACTIVE', assignedPmId: pm.id })` as part of configure transaction.
    await expect(createDailyLog(pm, 3, { ...input, logDate: tomorrow })).rejects.toMatchObject({ code: 'BUSINESS_RULE_VIOLATION', status: 422 }) // Waits for this asynchronous operation to finish before using its result.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.

  it('rejects duplicate dates and progress that violates chronological order', async () => { // Opens the function, callback, or control-flow block that groups the related statements.
    mocks.dailyLogFindUnique.mockResolvedValue({ id: 20 }) // Provides `mocks.dailyLogFindUnique.mockResolvedValue({ id: 20 })` as part of configure transaction.
    await expect(createDailyLog(pm, 3, input)).rejects.toMatchObject({ code: 'CONFLICT', status: 409 }) // Waits for this asynchronous operation to finish before using its result.
    expect(mocks.auditLogCreate).not.toHaveBeenCalled() // Asserts that the observed result matches the behavior this test is meant to guarantee.

    mocks.dailyLogFindUnique.mockResolvedValue(null) // Provides `mocks.dailyLogFindUnique.mockResolvedValue(null)` as part of configure transaction.
    mocks.dailyLogFindFirst.mockResolvedValueOnce({ progressPercent: decimal(50) }).mockResolvedValueOnce(null) // Provides `mocks.dailyLogFindFirst.mockResolvedValueOnce({ progressPercent: decimal(50) }).mockResolvedValueOnce(null)` as part of configure transaction.
    await expect(createDailyLog(pm, 3, input)).rejects.toMatchObject({ code: 'BUSINESS_RULE_VIOLATION', status: 422 }) // Waits for this asynchronous operation to finish before using its result.

    mocks.dailyLogFindFirst.mockResolvedValueOnce(null).mockResolvedValueOnce({ progressPercent: decimal(30) }) // Provides `mocks.dailyLogFindFirst.mockResolvedValueOnce(null).mockResolvedValueOnce({ progressPercent: decimal(30) })` as part of configure transaction.
    await expect(createDailyLog(pm, 3, input)).rejects.toMatchObject({ code: 'BUSINESS_RULE_VIOLATION', status: 422 }) // Waits for this asynchronous operation to finish before using its result.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.

  it('does not create an audit entry when the log transaction fails', async () => { // Opens the function, callback, or control-flow block that groups the related statements.
    mocks.dailyLogCreate.mockRejectedValue(new Error('database failure')) // Provides `mocks.dailyLogCreate.mockRejectedValue(new Error('database failure'))` as part of configure transaction.

    await expect(createDailyLog(pm, 3, input)).rejects.toThrow('database failure') // Waits for this asynchronous operation to finish before using its result.
    expect(mocks.auditLogCreate).not.toHaveBeenCalled() // Asserts that the observed result matches the behavior this test is meant to guarantee.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
}) // Closes the current call, object, or collection so the surrounding expression can continue.

describe('daily log editing and deletion rules', () => { // Opens the function, callback, or control-flow block that groups the related statements.
  it('allows PM edits within 48 hours and rejects older logs', async () => { // Opens the function, callback, or control-flow block that groups the related statements.
    mocks.dailyLogFindUnique.mockResolvedValue({ // Opens the object or callback body that groups the settings for this operation.
      id: 10, // Separates this argument or property from the next item in the surrounding call or object.
      projectId: 3, // Separates this argument or property from the next item in the surrounding call or object.
      logDate: new Date(`${date}T00:00:00.000Z`), // Separates this argument or property from the next item in the surrounding call or object.
      progressPercent: decimal(30), // Separates this argument or property from the next item in the surrounding call or object.
      workSummary: 'Original.', // Separates this argument or property from the next item in the surrounding call or object.
      weather: null, // Separates this argument or property from the next item in the surrounding call or object.
      issues: null, // Separates this argument or property from the next item in the surrounding call or object.
      createdById: pm.id, // Separates this argument or property from the next item in the surrounding call or object.
      createdAt: new Date(Date.now() - 47 * 3_600_000), // Separates this argument or property from the next item in the surrounding call or object.
      updatedAt: new Date(), // Separates this argument or property from the next item in the surrounding call or object.
      labourEntries: [], // Separates this argument or property from the next item in the surrounding call or object.
      machineryEntries: [], // Separates this argument or property from the next item in the surrounding call or object.
    }) // Closes the current call, object, or collection so the surrounding expression can continue.
    await expect(updateDailyLog(pm, 10, { workSummary: 'Updated.' })).resolves.toBeDefined() // Waits for this asynchronous operation to finish before using its result.
    expect(mocks.auditLogCreate).toHaveBeenCalledWith(expect.objectContaining({ // Asserts that the observed result matches the behavior this test is meant to guarantee.
      data: expect.objectContaining({ // Sets `data` to the values to write to the database.
        userId: pm.id, // Separates this argument or property from the next item in the surrounding call or object.
        action: 'UPDATE', // Separates this argument or property from the next item in the surrounding call or object.
        oldValues: expect.objectContaining({ workSummary: 'Original.' }), // Separates this argument or property from the next item in the surrounding call or object.
        newValues: expect.objectContaining({ workSummary: 'Updated.' }), // Separates this argument or property from the next item in the surrounding call or object.
      }), // Separates this argument or property from the next item in the surrounding call or object.
    })) // Provides `}))` as part of configure transaction.

    mocks.dailyLogFindUnique.mockResolvedValue({ // Opens the object or callback body that groups the settings for this operation.
      id: 10, // Separates this argument or property from the next item in the surrounding call or object.
      projectId: 3, // Separates this argument or property from the next item in the surrounding call or object.
      logDate: new Date(`${date}T00:00:00.000Z`), // Separates this argument or property from the next item in the surrounding call or object.
      progressPercent: decimal(30), // Separates this argument or property from the next item in the surrounding call or object.
      workSummary: 'Original.', // Separates this argument or property from the next item in the surrounding call or object.
      weather: null, // Separates this argument or property from the next item in the surrounding call or object.
      issues: null, // Separates this argument or property from the next item in the surrounding call or object.
      createdById: pm.id, // Separates this argument or property from the next item in the surrounding call or object.
      createdAt: new Date(Date.now() - 49 * 3_600_000), // Separates this argument or property from the next item in the surrounding call or object.
      updatedAt: new Date(), // Separates this argument or property from the next item in the surrounding call or object.
      labourEntries: [], // Separates this argument or property from the next item in the surrounding call or object.
      machineryEntries: [], // Separates this argument or property from the next item in the surrounding call or object.
    }) // Closes the current call, object, or collection so the surrounding expression can continue.
    await expect(updateDailyLog(pm, 10, { workSummary: 'Too late.' })).rejects.toMatchObject({ code: 'BUSINESS_RULE_VIOLATION', status: 422 }) // Waits for this asynchronous operation to finish before using its result.
    expect(mocks.auditLogCreate).toHaveBeenCalledTimes(1) // Asserts that the observed result matches the behavior this test is meant to guarantee.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.

  it('allows ADMIN to edit logs regardless of age', async () => { // Opens the function, callback, or control-flow block that groups the related statements.
    mocks.dailyLogFindUnique.mockResolvedValue({ // Opens the object or callback body that groups the settings for this operation.
      id: 10, // Separates this argument or property from the next item in the surrounding call or object.
      projectId: 3, // Separates this argument or property from the next item in the surrounding call or object.
      logDate: new Date(`${date}T00:00:00.000Z`), // Separates this argument or property from the next item in the surrounding call or object.
      progressPercent: decimal(30), // Separates this argument or property from the next item in the surrounding call or object.
      workSummary: 'Original.', // Separates this argument or property from the next item in the surrounding call or object.
      weather: null, // Separates this argument or property from the next item in the surrounding call or object.
      issues: null, // Separates this argument or property from the next item in the surrounding call or object.
      createdById: pm.id, // Separates this argument or property from the next item in the surrounding call or object.
      createdAt: new Date(Date.now() - 100 * 3_600_000), // Separates this argument or property from the next item in the surrounding call or object.
      updatedAt: new Date(), // Separates this argument or property from the next item in the surrounding call or object.
      labourEntries: [], // Separates this argument or property from the next item in the surrounding call or object.
      machineryEntries: [], // Separates this argument or property from the next item in the surrounding call or object.
    }) // Closes the current call, object, or collection so the surrounding expression can continue.

    await expect(updateDailyLog(admin, 10, { workSummary: 'Admin correction.' })).resolves.toBeDefined() // Waits for this asynchronous operation to finish before using its result.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.

  it('replaces nested labour and machinery entries on update', async () => { // Opens the function, callback, or control-flow block that groups the related statements.
    mocks.dailyLogFindUnique.mockResolvedValue({ // Opens the object or callback body that groups the settings for this operation.
      id: 10, // Separates this argument or property from the next item in the surrounding call or object.
      projectId: 3, // Separates this argument or property from the next item in the surrounding call or object.
      logDate: new Date(`${date}T00:00:00.000Z`), // Separates this argument or property from the next item in the surrounding call or object.
      progressPercent: decimal(30), // Separates this argument or property from the next item in the surrounding call or object.
      workSummary: 'Original.', // Separates this argument or property from the next item in the surrounding call or object.
      weather: null, // Separates this argument or property from the next item in the surrounding call or object.
      issues: null, // Separates this argument or property from the next item in the surrounding call or object.
      createdById: pm.id, // Separates this argument or property from the next item in the surrounding call or object.
      createdAt: new Date(), // Separates this argument or property from the next item in the surrounding call or object.
      updatedAt: new Date(), // Separates this argument or property from the next item in the surrounding call or object.
      labourEntries: [{ id: 1, trade: 'Mason', contractorName: null, headCount: 4, hoursWorked: decimal(8), remarks: null }], // Separates this argument or property from the next item in the surrounding call or object.
      machineryEntries: [{ id: 1, machineName: 'Mixer', operatorName: null, hoursUsed: decimal(3), fuelLitres: decimal(5), remarks: null }], // Separates this argument or property from the next item in the surrounding call or object.
    }) // Closes the current call, object, or collection so the surrounding expression can continue.

    await updateDailyLog(pm, 10, { // Waits for this asynchronous operation to finish before using its result.
      labourEntries: [{ trade: 'Helper', headCount: 2, hoursWorked: 6 }], // Separates this argument or property from the next item in the surrounding call or object.
      machineryEntries: [{ machineName: 'Crane', hoursUsed: 4 }], // Separates this argument or property from the next item in the surrounding call or object.
    }) // Closes the current call, object, or collection so the surrounding expression can continue.

    expect(mocks.labourDeleteMany).toHaveBeenCalledWith({ where: { dailyLogId: 10 } }) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(mocks.machineryDeleteMany).toHaveBeenCalledWith({ where: { dailyLogId: 10 } }) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(mocks.dailyLogUpdate).toHaveBeenCalledWith(expect.objectContaining({ // Asserts that the observed result matches the behavior this test is meant to guarantee.
      data: expect.objectContaining({ // Sets `data` to the values to write to the database.
        labourEntries: { create: [{ trade: 'Helper', contractorName: undefined, headCount: 2, hoursWorked: 6, remarks: undefined }] }, // Separates this argument or property from the next item in the surrounding call or object.
        machineryEntries: { create: [{ machineName: 'Crane', operatorName: undefined, hoursUsed: 4, fuelLitres: undefined, remarks: undefined }] }, // Separates this argument or property from the next item in the surrounding call or object.
      }), // Separates this argument or property from the next item in the surrounding call or object.
    })) // Provides `}))` as part of configure transaction.
    expect(mocks.auditLogCreate).toHaveBeenCalledWith(expect.objectContaining({ // Asserts that the observed result matches the behavior this test is meant to guarantee.
      data: expect.objectContaining({ // Sets `data` to the values to write to the database.
        oldValues: expect.objectContaining({ // Sets `oldValues` to the record values before the change.
          labourEntries: expect.arrayContaining([expect.objectContaining({ trade: 'Mason' })]), // Separates this argument or property from the next item in the surrounding call or object.
          machineryEntries: expect.arrayContaining([expect.objectContaining({ machineName: 'Mixer' })]), // Separates this argument or property from the next item in the surrounding call or object.
        }), // Separates this argument or property from the next item in the surrounding call or object.
        newValues: expect.objectContaining({ // Sets `newValues` to the record values after the change.
          labourEntries: expect.arrayContaining([expect.objectContaining({ trade: 'Helper' })]), // Separates this argument or property from the next item in the surrounding call or object.
          machineryEntries: expect.arrayContaining([expect.objectContaining({ machineName: 'Crane' })]), // Separates this argument or property from the next item in the surrounding call or object.
        }), // Separates this argument or property from the next item in the surrounding call or object.
      }), // Separates this argument or property from the next item in the surrounding call or object.
    })) // Provides `}))` as part of configure transaction.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.

  it('allows only ADMIN to delete daily logs', async () => { // Opens the function, callback, or control-flow block that groups the related statements.
    mocks.dailyLogFindUnique.mockResolvedValue({ // Opens the object or callback body that groups the settings for this operation.
      id: 10, // Separates this argument or property from the next item in the surrounding call or object.
      projectId: 3, // Separates this argument or property from the next item in the surrounding call or object.
      logDate: new Date(`${date}T00:00:00.000Z`), // Separates this argument or property from the next item in the surrounding call or object.
      progressPercent: decimal(40), // Separates this argument or property from the next item in the surrounding call or object.
      workSummary: 'Deleted log.', // Separates this argument or property from the next item in the surrounding call or object.
      weather: null, // Separates this argument or property from the next item in the surrounding call or object.
      issues: 'None', // Separates this argument or property from the next item in the surrounding call or object.
      createdById: pm.id, // Separates this argument or property from the next item in the surrounding call or object.
      createdAt: new Date(), // Separates this argument or property from the next item in the surrounding call or object.
      updatedAt: new Date(), // Separates this argument or property from the next item in the surrounding call or object.
      labourEntries: [{ id: 1, trade: 'Mason', contractorName: null, headCount: 4, hoursWorked: decimal(8), remarks: null }], // Separates this argument or property from the next item in the surrounding call or object.
      machineryEntries: [{ id: 1, machineName: 'Mixer', operatorName: null, hoursUsed: decimal(3), fuelLitres: null, remarks: null }], // Separates this argument or property from the next item in the surrounding call or object.
    }) // Closes the current call, object, or collection so the surrounding expression can continue.
    await expect(deleteDailyLog(pm, 10)).rejects.toMatchObject({ code: 'FORBIDDEN', status: 403 }) // Waits for this asynchronous operation to finish before using its result.
    await expect(deleteDailyLog(admin, 10)).resolves.toBeUndefined() // Waits for this asynchronous operation to finish before using its result.
    expect(mocks.dailyLogDelete).toHaveBeenCalledWith({ where: { id: 10 } }) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(mocks.auditLogCreate).toHaveBeenCalledWith(expect.objectContaining({ // Asserts that the observed result matches the behavior this test is meant to guarantee.
      data: expect.objectContaining({ // Sets `data` to the values to write to the database.
        userId: admin.id, // Separates this argument or property from the next item in the surrounding call or object.
        action: 'DELETE', // Separates this argument or property from the next item in the surrounding call or object.
        entityType: 'DailyLog', // Separates this argument or property from the next item in the surrounding call or object.
        entityId: 10, // Separates this argument or property from the next item in the surrounding call or object.
        oldValues: expect.objectContaining({ // Sets `oldValues` to the record values before the change.
          workSummary: 'Deleted log.', // Separates this argument or property from the next item in the surrounding call or object.
          labourEntries: expect.any(Array), // Separates this argument or property from the next item in the surrounding call or object.
          machineryEntries: expect.any(Array), // Separates this argument or property from the next item in the surrounding call or object.
        }), // Separates this argument or property from the next item in the surrounding call or object.
      }), // Separates this argument or property from the next item in the surrounding call or object.
    })) // Provides `}))` as part of configure transaction.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.

  it('rejects a historical update that exceeds the next log progress', async () => { // Opens the function, callback, or control-flow block that groups the related statements.
    mocks.dailyLogFindUnique.mockResolvedValue({ // Opens the object or callback body that groups the settings for this operation.
      id: 10, // Separates this argument or property from the next item in the surrounding call or object.
      projectId: 3, // Separates this argument or property from the next item in the surrounding call or object.
      logDate: new Date(`${yesterday}T00:00:00.000Z`), // Separates this argument or property from the next item in the surrounding call or object.
      createdAt: new Date(), // Separates this argument or property from the next item in the surrounding call or object.
    }) // Closes the current call, object, or collection so the surrounding expression can continue.
    mocks.dailyLogFindFirst.mockResolvedValueOnce(null).mockResolvedValueOnce({ progressPercent: decimal(60) }) // Provides `mocks.dailyLogFindFirst.mockResolvedValueOnce(null).mockResolvedValueOnce({ progressPercent: decimal(60) })` as part of configure transaction.

    await expect(updateDailyLog(admin, 10, { progressPercent: 70 })).rejects.toMatchObject({ // Waits for this asynchronous operation to finish before using its result.
      code: 'BUSINESS_RULE_VIOLATION', // Separates this argument or property from the next item in the surrounding call or object.
      status: 422, // Separates this argument or property from the next item in the surrounding call or object.
    }) // Closes the current call, object, or collection so the surrounding expression can continue.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
}) // Closes the current call, object, or collection so the surrounding expression can continue.

describe('daily log validation', () => { // Opens the function, callback, or control-flow block that groups the related statements.
  it('rejects inverted date filters', () => { // Opens the function, callback, or control-flow block that groups the related statements.
    expect(dailyLogListQuerySchema.safeParse({ from: '2026-11-11', to: '2026-11-10' }).success).toBe(false) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(dailyLogListQuerySchema.safeParse({ from: '2026-11-10', to: '2026-11-11' }).success).toBe(true) // Asserts that the observed result matches the behavior this test is meant to guarantee.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
}) // Closes the current call, object, or collection so the surrounding expression can continue.
// File purpose: Checks expected behavior for daily logs.service.test using the project test runner.
