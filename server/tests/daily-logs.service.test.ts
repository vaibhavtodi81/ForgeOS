import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  projectFindUnique: vi.fn(),
  dailyLogFindUnique: vi.fn(),
  dailyLogFindFirst: vi.fn(),
  dailyLogFindMany: vi.fn(),
  dailyLogCount: vi.fn(),
  dailyLogCreate: vi.fn(),
  dailyLogUpdate: vi.fn(),
  dailyLogDelete: vi.fn(),
  auditLogCreate: vi.fn(),
  labourDeleteMany: vi.fn(),
  machineryDeleteMany: vi.fn(),
  transaction: vi.fn(),
}))

vi.mock('../src/utils/prisma.js', () => ({
  prisma: {
    project: { findUnique: mocks.projectFindUnique },
    dailyLog: {
      findUnique: mocks.dailyLogFindUnique,
      findFirst: mocks.dailyLogFindFirst,
      findMany: mocks.dailyLogFindMany,
      count: mocks.dailyLogCount,
      create: mocks.dailyLogCreate,
      update: mocks.dailyLogUpdate,
      delete: mocks.dailyLogDelete,
    },
    $transaction: mocks.transaction,
  },
}))

import {
  createDailyLog,
  deleteDailyLog,
  getDailyLog,
  listDailyLogs,
  updateDailyLog,
} from '../src/modules/daily-logs/daily-logs.service.js'
import { dailyLogListQuerySchema } from '../src/modules/daily-logs/daily-logs.validator.js'

const admin = { id: 1, role: 'ADMIN' as const }
const pm = { id: 2, role: 'PM' as const }
const today = new Date()
const date = today.toISOString().slice(0, 10)
const yesterday = new Date(today.getTime() - 86_400_000).toISOString().slice(0, 10)
const tomorrow = new Date(today.getTime() + 86_400_000).toISOString().slice(0, 10)

const input = {
  logDate: date,
  progressPercent: 40,
  workSummary: 'Concrete work completed.',
  labourEntries: [{ trade: 'Mason', headCount: 4, hoursWorked: 8 }],
  machineryEntries: [{ machineName: 'Mixer', hoursUsed: 3, fuelLitres: 5 }],
}

function decimal(value: number) {
  return { toNumber: () => value, toString: () => String(value) }
}

function configureTransaction() {
  mocks.transaction.mockImplementation(async (operation: unknown) => {
    if (typeof operation === 'function') {
      return operation({
        dailyLog: { create: mocks.dailyLogCreate, update: mocks.dailyLogUpdate, delete: mocks.dailyLogDelete },
        labourEntry: { deleteMany: mocks.labourDeleteMany },
        machineryEntry: { deleteMany: mocks.machineryDeleteMany },
        auditLog: { create: mocks.auditLogCreate },
      })
    }
    return Promise.all(operation as Array<Promise<unknown>>)
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  configureTransaction()
  mocks.projectFindUnique.mockResolvedValue({ id: 3, status: 'ACTIVE', assignedPmId: pm.id })
  mocks.dailyLogFindUnique.mockResolvedValue(null)
  mocks.dailyLogFindFirst.mockResolvedValue(null)
  mocks.dailyLogCreate.mockResolvedValue({
    id: 10,
    projectId: 3,
    logDate: new Date(`${date}T00:00:00.000Z`),
    progressPercent: decimal(input.progressPercent),
    workSummary: input.workSummary,
    weather: null,
    issues: null,
    createdById: pm.id,
    createdAt: new Date(),
    updatedAt: new Date(),
    labourEntries: [{ id: 1, trade: 'Mason', contractorName: null, headCount: 4, hoursWorked: decimal(8), remarks: null }],
    machineryEntries: [{ id: 1, machineName: 'Mixer', operatorName: null, hoursUsed: decimal(3), fuelLitres: decimal(5), remarks: null }],
  })
  mocks.dailyLogUpdate.mockImplementation(async (args: { data: Record<string, unknown> }) => ({
    id: 10,
    projectId: 3,
    logDate: new Date(`${date}T00:00:00.000Z`),
    progressPercent: decimal(input.progressPercent),
    workSummary: args.data.workSummary ?? input.workSummary,
    weather: null,
    issues: null,
    createdById: pm.id,
    createdAt: new Date(),
    updatedAt: new Date(),
    labourEntries: args.data.labourEntries
      ? [{ id: 2, ...((args.data.labourEntries as { create: unknown[] }).create[0] as object), hoursWorked: decimal(6) }]
      : [],
    machineryEntries: args.data.machineryEntries
      ? [{ id: 2, ...((args.data.machineryEntries as { create: unknown[] }).create[0] as object), hoursUsed: decimal(4), fuelLitres: null }]
      : [],
  }))
  mocks.dailyLogDelete.mockResolvedValue({})
  mocks.auditLogCreate.mockResolvedValue({ id: 100 })
})

describe('daily log authorization and creation rules', () => {
  it('allows ADMIN and assigned PM to list project logs', async () => {
    mocks.dailyLogFindMany.mockResolvedValue([])
    mocks.dailyLogCount.mockResolvedValue(0)

    await expect(listDailyLogs(admin, 3, { page: 1, limit: 20 })).resolves.toMatchObject({ logs: [] })
    await expect(listDailyLogs(pm, 3, { page: 1, limit: 20 })).resolves.toMatchObject({ logs: [] })
    expect(mocks.projectFindUnique).toHaveBeenCalledTimes(2)
  })

  it('rejects PM access to an unassigned project', async () => {
    mocks.projectFindUnique.mockResolvedValue({ id: 3, status: 'ACTIVE', assignedPmId: 99 })

    await expect(listDailyLogs(pm, 3, { page: 1, limit: 20 })).rejects.toMatchObject({ code: 'FORBIDDEN', status: 403 })
  })

  it('allows ADMIN and assigned PM to create logs with labour and machinery entries', async () => {
    await createDailyLog(admin, 3, input)
    await createDailyLog(pm, 3, input)

    expect(mocks.dailyLogCreate).toHaveBeenCalledTimes(2)
    expect(mocks.dailyLogCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        labourEntries: { create: [{ trade: 'Mason', contractorName: undefined, headCount: 4, hoursWorked: 8, remarks: undefined }] },
        machineryEntries: { create: [{ machineName: 'Mixer', operatorName: undefined, hoursUsed: 3, fuelLitres: 5, remarks: undefined }] },
      }),
    }))
    expect(mocks.auditLogCreate).toHaveBeenCalledTimes(2)
    expect(mocks.auditLogCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        userId: pm.id,
        action: 'CREATE',
        entityType: 'DailyLog',
        entityId: 10,
        newValues: expect.objectContaining({
          labourEntries: expect.arrayContaining([expect.objectContaining({ trade: 'Mason', headCount: 4 })]),
          machineryEntries: expect.arrayContaining([expect.objectContaining({ machineName: 'Mixer', hoursUsed: '3' })]),
        }),
      }),
    }))
  })

  it('rejects creation for inactive projects and future dates', async () => {
    mocks.projectFindUnique.mockResolvedValue({ id: 3, status: 'PLANNING', assignedPmId: pm.id })
    await expect(createDailyLog(pm, 3, input)).rejects.toMatchObject({ code: 'BUSINESS_RULE_VIOLATION', status: 422 })

    mocks.projectFindUnique.mockResolvedValue({ id: 3, status: 'ACTIVE', assignedPmId: pm.id })
    await expect(createDailyLog(pm, 3, { ...input, logDate: tomorrow })).rejects.toMatchObject({ code: 'BUSINESS_RULE_VIOLATION', status: 422 })
  })

  it('rejects duplicate dates and progress that violates chronological order', async () => {
    mocks.dailyLogFindUnique.mockResolvedValue({ id: 20 })
    await expect(createDailyLog(pm, 3, input)).rejects.toMatchObject({ code: 'CONFLICT', status: 409 })
    expect(mocks.auditLogCreate).not.toHaveBeenCalled()

    mocks.dailyLogFindUnique.mockResolvedValue(null)
    mocks.dailyLogFindFirst.mockResolvedValueOnce({ progressPercent: decimal(50) }).mockResolvedValueOnce(null)
    await expect(createDailyLog(pm, 3, input)).rejects.toMatchObject({ code: 'BUSINESS_RULE_VIOLATION', status: 422 })

    mocks.dailyLogFindFirst.mockResolvedValueOnce(null).mockResolvedValueOnce({ progressPercent: decimal(30) })
    await expect(createDailyLog(pm, 3, input)).rejects.toMatchObject({ code: 'BUSINESS_RULE_VIOLATION', status: 422 })
  })

  it('does not create an audit entry when the log transaction fails', async () => {
    mocks.dailyLogCreate.mockRejectedValue(new Error('database failure'))

    await expect(createDailyLog(pm, 3, input)).rejects.toThrow('database failure')
    expect(mocks.auditLogCreate).not.toHaveBeenCalled()
  })
})

describe('daily log editing and deletion rules', () => {
  it('allows PM edits within 48 hours and rejects older logs', async () => {
    mocks.dailyLogFindUnique.mockResolvedValue({
      id: 10,
      projectId: 3,
      logDate: new Date(`${date}T00:00:00.000Z`),
      progressPercent: decimal(30),
      workSummary: 'Original.',
      weather: null,
      issues: null,
      createdById: pm.id,
      createdAt: new Date(Date.now() - 47 * 3_600_000),
      updatedAt: new Date(),
      labourEntries: [],
      machineryEntries: [],
    })
    await expect(updateDailyLog(pm, 10, { workSummary: 'Updated.' })).resolves.toBeDefined()
    expect(mocks.auditLogCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        userId: pm.id,
        action: 'UPDATE',
        oldValues: expect.objectContaining({ workSummary: 'Original.' }),
        newValues: expect.objectContaining({ workSummary: 'Updated.' }),
      }),
    }))

    mocks.dailyLogFindUnique.mockResolvedValue({
      id: 10,
      projectId: 3,
      logDate: new Date(`${date}T00:00:00.000Z`),
      progressPercent: decimal(30),
      workSummary: 'Original.',
      weather: null,
      issues: null,
      createdById: pm.id,
      createdAt: new Date(Date.now() - 49 * 3_600_000),
      updatedAt: new Date(),
      labourEntries: [],
      machineryEntries: [],
    })
    await expect(updateDailyLog(pm, 10, { workSummary: 'Too late.' })).rejects.toMatchObject({ code: 'BUSINESS_RULE_VIOLATION', status: 422 })
    expect(mocks.auditLogCreate).toHaveBeenCalledTimes(1)
  })

  it('allows ADMIN to edit logs regardless of age', async () => {
    mocks.dailyLogFindUnique.mockResolvedValue({
      id: 10,
      projectId: 3,
      logDate: new Date(`${date}T00:00:00.000Z`),
      progressPercent: decimal(30),
      workSummary: 'Original.',
      weather: null,
      issues: null,
      createdById: pm.id,
      createdAt: new Date(Date.now() - 100 * 3_600_000),
      updatedAt: new Date(),
      labourEntries: [],
      machineryEntries: [],
    })

    await expect(updateDailyLog(admin, 10, { workSummary: 'Admin correction.' })).resolves.toBeDefined()
  })

  it('replaces nested labour and machinery entries on update', async () => {
    mocks.dailyLogFindUnique.mockResolvedValue({
      id: 10,
      projectId: 3,
      logDate: new Date(`${date}T00:00:00.000Z`),
      progressPercent: decimal(30),
      workSummary: 'Original.',
      weather: null,
      issues: null,
      createdById: pm.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      labourEntries: [{ id: 1, trade: 'Mason', contractorName: null, headCount: 4, hoursWorked: decimal(8), remarks: null }],
      machineryEntries: [{ id: 1, machineName: 'Mixer', operatorName: null, hoursUsed: decimal(3), fuelLitres: decimal(5), remarks: null }],
    })

    await updateDailyLog(pm, 10, {
      labourEntries: [{ trade: 'Helper', headCount: 2, hoursWorked: 6 }],
      machineryEntries: [{ machineName: 'Crane', hoursUsed: 4 }],
    })

    expect(mocks.labourDeleteMany).toHaveBeenCalledWith({ where: { dailyLogId: 10 } })
    expect(mocks.machineryDeleteMany).toHaveBeenCalledWith({ where: { dailyLogId: 10 } })
    expect(mocks.dailyLogUpdate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        labourEntries: { create: [{ trade: 'Helper', contractorName: undefined, headCount: 2, hoursWorked: 6, remarks: undefined }] },
        machineryEntries: { create: [{ machineName: 'Crane', operatorName: undefined, hoursUsed: 4, fuelLitres: undefined, remarks: undefined }] },
      }),
    }))
    expect(mocks.auditLogCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        oldValues: expect.objectContaining({
          labourEntries: expect.arrayContaining([expect.objectContaining({ trade: 'Mason' })]),
          machineryEntries: expect.arrayContaining([expect.objectContaining({ machineName: 'Mixer' })]),
        }),
        newValues: expect.objectContaining({
          labourEntries: expect.arrayContaining([expect.objectContaining({ trade: 'Helper' })]),
          machineryEntries: expect.arrayContaining([expect.objectContaining({ machineName: 'Crane' })]),
        }),
      }),
    }))
  })

  it('allows only ADMIN to delete daily logs', async () => {
    mocks.dailyLogFindUnique.mockResolvedValue({
      id: 10,
      projectId: 3,
      logDate: new Date(`${date}T00:00:00.000Z`),
      progressPercent: decimal(40),
      workSummary: 'Deleted log.',
      weather: null,
      issues: 'None',
      createdById: pm.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      labourEntries: [{ id: 1, trade: 'Mason', contractorName: null, headCount: 4, hoursWorked: decimal(8), remarks: null }],
      machineryEntries: [{ id: 1, machineName: 'Mixer', operatorName: null, hoursUsed: decimal(3), fuelLitres: null, remarks: null }],
    })
    await expect(deleteDailyLog(pm, 10)).rejects.toMatchObject({ code: 'FORBIDDEN', status: 403 })
    await expect(deleteDailyLog(admin, 10)).resolves.toBeUndefined()
    expect(mocks.dailyLogDelete).toHaveBeenCalledWith({ where: { id: 10 } })
    expect(mocks.auditLogCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        userId: admin.id,
        action: 'DELETE',
        entityType: 'DailyLog',
        entityId: 10,
        oldValues: expect.objectContaining({
          workSummary: 'Deleted log.',
          labourEntries: expect.any(Array),
          machineryEntries: expect.any(Array),
        }),
      }),
    }))
  })

  it('rejects a historical update that exceeds the next log progress', async () => {
    mocks.dailyLogFindUnique.mockResolvedValue({
      id: 10,
      projectId: 3,
      logDate: new Date(`${yesterday}T00:00:00.000Z`),
      createdAt: new Date(),
    })
    mocks.dailyLogFindFirst.mockResolvedValueOnce(null).mockResolvedValueOnce({ progressPercent: decimal(60) })

    await expect(updateDailyLog(admin, 10, { progressPercent: 70 })).rejects.toMatchObject({
      code: 'BUSINESS_RULE_VIOLATION',
      status: 422,
    })
  })
})

describe('daily log validation', () => {
  it('rejects inverted date filters', () => {
    expect(dailyLogListQuerySchema.safeParse({ from: '2026-11-11', to: '2026-11-10' }).success).toBe(false)
    expect(dailyLogListQuerySchema.safeParse({ from: '2026-11-10', to: '2026-11-11' }).success).toBe(true)
  })
})
