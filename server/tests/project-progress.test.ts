import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  projectFindFirst: vi.fn(),
  dailyLogFindMany: vi.fn(),
  auditLogFindMany: vi.fn(),
  auditLogCount: vi.fn(),
  transaction: vi.fn(),
}))

vi.mock('../src/utils/prisma.js', () => ({
  prisma: {
    project: { findFirst: mocks.projectFindFirst },
    dailyLog: { findMany: mocks.dailyLogFindMany },
    auditLog: { findMany: mocks.auditLogFindMany, count: mocks.auditLogCount },
    $transaction: mocks.transaction,
  },
}))

import { getProjectActivity, getProjectProgressHistory, getProjectSummary } from '../src/modules/projects/projects.service.js'
import {
  projectActivityQuerySchema,
  projectDateRangeQuerySchema,
  projectProgressHistoryQuerySchema,
} from '../src/modules/projects/projects.validator.js'
import {
  getLabourSummary,
  getMachinerySummary,
  getMachineryUsageHistory,
  getWorkerCountHistory,
} from '../src/modules/projects/projects.service.js'

const admin = { id: 1, role: 'ADMIN' as const }
const pm = { id: 2, role: 'PM' as const }
const project = {
  id: 3,
  code: 'DEV-001',
  name: 'Development Project',
  status: 'ACTIVE',
  land: { id: 1, name: 'Parcel' },
  assignedPm: { id: 2, name: 'PM', email: 'pm@example.test' },
}

function decimal(value: number) {
  return { toNumber: () => value }
}

const logs = [
  {
    id: 10,
    logDate: new Date('2026-11-09T00:00:00.000Z'),
    progressPercent: decimal(20),
    workSummary: 'Foundation work.',
    createdBy: { id: 2, name: 'PM', email: 'pm@example.test', role: 'PM' },
    createdAt: new Date('2026-11-09T10:00:00.000Z'),
    updatedAt: new Date('2026-11-09T10:00:00.000Z'),
    labourEntries: [{ trade: 'Mason', headCount: 4, hoursWorked: decimal(8) }],
    machineryEntries: [{ machineName: 'Mixer', operatorName: null, hoursUsed: decimal(3), fuelLitres: decimal(5) }],
  },
  {
    id: 11,
    logDate: new Date('2026-11-10T00:00:00.000Z'),
    progressPercent: decimal(35),
    workSummary: 'Slab work.',
    createdBy: { id: 1, name: 'Admin', email: 'admin@example.test', role: 'ADMIN' },
    createdAt: new Date('2026-11-10T10:00:00.000Z'),
    updatedAt: new Date('2026-11-10T10:00:00.000Z'),
    labourEntries: [{ trade: 'Mason', headCount: 6, hoursWorked: decimal(7.5) }],
    machineryEntries: [{ machineName: 'Mixer', operatorName: 'Operator', hoursUsed: decimal(4), fuelLitres: null }],
  },
]

beforeEach(() => {
  vi.clearAllMocks()
  mocks.transaction.mockImplementation(async (operations: Array<Promise<unknown>>) => Promise.all(operations))
  mocks.projectFindFirst.mockResolvedValue(project)
  mocks.dailyLogFindMany.mockResolvedValue(logs)
  mocks.auditLogFindMany.mockResolvedValue([])
  mocks.auditLogCount.mockResolvedValue(0)
})

describe('project progress history and summary', () => {
  it('allows ADMIN and assigned PM to read chronological progress history', async () => {
    await expect(getProjectProgressHistory(admin, 3, {})).resolves.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: 10 }), expect.objectContaining({ id: 11 })]),
    )
    await expect(getProjectProgressHistory(pm, 3, {})).resolves.toHaveLength(2)
    expect(mocks.projectFindFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 3, assignedPmId: pm.id } }))
    expect(mocks.dailyLogFindMany).toHaveBeenCalledWith(expect.objectContaining({ orderBy: { logDate: 'asc' } }))
  })

  it('rejects an unassigned PM and nonexistent project', async () => {
    mocks.projectFindFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(null)
    await expect(getProjectProgressHistory(pm, 3, {})).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 })
    await expect(getProjectSummary(pm, 99)).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 })
  })

  it('returns a safe empty summary when a project has no daily logs', async () => {
    mocks.dailyLogFindMany.mockResolvedValue([])
    const result = await getProjectSummary(admin, 3)

    expect(result).toMatchObject({
      project,
      latestProgressPercent: 0,
      latestLogDate: null,
      totalDailyLogs: 0,
      totalLabourHeadCount: 0,
      totalLabourHours: 0,
      totalMachineryHours: 0,
      totalMachineryFuel: 0,
    })
  })

  it('calculates latest progress and labour/machinery totals', async () => {
    const result = await getProjectSummary(admin, 3)

    expect(result.latestProgressPercent).toBe(logs[0].progressPercent)
    expect(result.latestLogDate).toEqual(logs[0].logDate)
    expect(result.totalDailyLogs).toBe(2)
    expect(result.totalLabourHeadCount).toBe(10)
    expect(result.totalLabourHours).toBe(15.5)
    expect(result.totalMachineryHours).toBe(7)
    expect(result.totalMachineryFuel).toBe(5)
  })

  it('validates optional progress-history date filters', () => {
    expect(projectProgressHistoryQuerySchema.safeParse({}).success).toBe(true)
    expect(projectProgressHistoryQuerySchema.safeParse({ from: '2026-11-10', to: '2026-11-09' }).success).toBe(false)
    expect(projectProgressHistoryQuerySchema.safeParse({ from: 'bad-date' }).success).toBe(false)
  })
})

describe('project activity timeline', () => {
  const activities = [
    {
      id: 2,
      action: 'UPDATE',
      entityType: 'DailyLog',
      entityId: 11,
      oldValues: { projectId: 3, workSummary: 'Old' },
      newValues: { projectId: 3, workSummary: 'New' },
      createdAt: new Date('2026-11-11T12:00:00.000Z'),
      user: { id: 2, name: 'PM' },
    },
    {
      id: 1,
      action: 'CREATE',
      entityType: 'Project',
      entityId: 3,
      oldValues: null,
      newValues: { name: 'Development Project' },
      createdAt: new Date('2026-11-10T12:00:00.000Z'),
      user: { id: 1, name: 'Admin' },
    },
  ]

  it('allows ADMIN and assigned PM, scopes multiple entity types, and paginates', async () => {
    mocks.auditLogFindMany.mockResolvedValue(activities)
    mocks.auditLogCount.mockResolvedValue(3)

    const result = await getProjectActivity(admin, 3, { page: 1, limit: 2 })
    expect(result.activities).toEqual([
      expect.objectContaining({ id: 2, userId: 2, userName: 'PM', oldData: activities[0].oldValues }),
      expect.objectContaining({ id: 1, entityType: 'Project', newData: activities[1].newValues }),
    ])
    expect(result.meta).toEqual({ page: 1, limit: 2, total: 3, totalPages: 2 })
    expect(mocks.auditLogFindMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        OR: expect.arrayContaining([
          { entityType: 'Project', entityId: 3 },
          { oldValues: { path: ['projectId'], equals: 3 } },
        ]),
      }),
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip: 0,
      take: 2,
    }))

    await expect(getProjectActivity(pm, 3, { page: 2, limit: 1 })).resolves.toMatchObject({
      meta: { page: 2, limit: 1 },
    })
    expect(mocks.projectFindFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 3, assignedPmId: pm.id } }))
  })

  it('returns 404 for unassigned or nonexistent projects and handles empty history', async () => {
    mocks.projectFindFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(null).mockResolvedValueOnce(project)
    await expect(getProjectActivity(pm, 3, { page: 1, limit: 20 })).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 })
    await expect(getProjectActivity(admin, 99, { page: 1, limit: 20 })).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 })

    const result = await getProjectActivity(admin, 3, { page: 1, limit: 20 })
    expect(result).toMatchObject({ activities: [], meta: { total: 0, totalPages: 0 } })
  })

  it('validates activity pagination parameters', () => {
    expect(projectActivityQuerySchema.parse({})).toEqual({ page: 1, limit: 20 })
    expect(projectActivityQuerySchema.safeParse({ page: 0 }).success).toBe(false)
    expect(projectActivityQuerySchema.safeParse({ limit: 101 }).success).toBe(false)
    expect(projectActivityQuerySchema.safeParse({ page: 'bad' }).success).toBe(false)
  })
})

describe('labour and machinery reporting', () => {
  it('calculates labour totals and trade grouping for ADMIN and assigned PM', async () => {
    const adminResult = await getLabourSummary(admin, 3, {})
    const pmResult = await getLabourSummary(pm, 3, { from: '2026-11-09', to: '2026-11-10' })

    expect(adminResult).toMatchObject({
      totalWorkerCount: 10,
      totalLabourHours: 15.5,
      totalLabourEntries: 2,
      byTrade: [
        { trade: 'Mason', workerCount: 10, labourHours: 15.5, entries: 2 },
      ],
    })
    expect(pmResult.totalWorkerCount).toBe(10)
    expect(mocks.dailyLogFindMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ projectId: 3, logDate: expect.any(Object) }),
    }))
  })

  it('calculates machinery totals and machine grouping', async () => {
    const result = await getMachinerySummary(admin, 3, {})

    expect(result).toMatchObject({
      totalMachineryHours: 7,
      totalFuelConsumption: 5,
      totalMachineryEntries: 2,
      byMachine: [
        { machineName: 'Mixer', hoursUsed: 7, fuelConsumption: 5, entries: 2 },
      ],
    })
  })

  it('returns chronological worker and machinery histories', async () => {
    const workerHistory = await getWorkerCountHistory(admin, 3, {})
    const machineryHistory = await getMachineryUsageHistory(admin, 3, {})

    expect(workerHistory.map((entry) => entry.dailyLogId)).toEqual([10, 11])
    expect(workerHistory[0]).toMatchObject({ totalWorkerCount: 4, labourHours: 8 })
    expect(machineryHistory.map((entry) => entry.dailyLogId)).toEqual([10, 11])
    expect(machineryHistory[0]).toMatchObject({
      machineName: 'Mixer',
      hoursUsed: 3,
      fuelConsumption: 5,
      operatorName: null,
    })
  })

  it('handles empty reporting history and validates date ranges', async () => {
    mocks.dailyLogFindMany.mockResolvedValue([])
    await expect(getLabourSummary(admin, 3, {})).resolves.toMatchObject({
      totalWorkerCount: 0,
      totalLabourHours: 0,
      totalLabourEntries: 0,
      byTrade: [],
    })
    await expect(getMachinerySummary(admin, 3, {})).resolves.toMatchObject({
      totalMachineryHours: 0,
      totalFuelConsumption: 0,
      totalMachineryEntries: 0,
      byMachine: [],
    })
    expect(projectDateRangeQuerySchema.safeParse({ from: '2026-11-10', to: '2026-11-09' }).success).toBe(false)
    expect(projectDateRangeQuerySchema.safeParse({ from: 'invalid' }).success).toBe(false)
  })

  it('denies unassigned PMs and nonexistent projects', async () => {
    mocks.projectFindFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(null)
    await expect(getWorkerCountHistory(pm, 3, {})).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 })
    await expect(getMachineryUsageHistory(admin, 999, {})).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 })
  })
})
