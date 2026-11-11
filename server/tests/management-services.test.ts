import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  landFindMany: vi.fn(),
  landCount: vi.fn(),
  landFindFirst: vi.fn(),
  landFindUnique: vi.fn(),
  landDelete: vi.fn(),
  landCreate: vi.fn(),
  projectFindMany: vi.fn(),
  projectCount: vi.fn(),
  projectFindFirst: vi.fn(),
  projectFindUnique: vi.fn(),
  projectUpdate: vi.fn(),
  projectCreate: vi.fn(),
  projectDelete: vi.fn(),
  transaction: vi.fn(),
}))

vi.mock('../src/utils/prisma.js', () => ({
  prisma: {
    land: {
      findMany: mocks.landFindMany,
      count: mocks.landCount,
      findFirst: mocks.landFindFirst,
      findUnique: mocks.landFindUnique,
      delete: mocks.landDelete,
      create: mocks.landCreate,
    },
    project: {
      findMany: mocks.projectFindMany,
      count: mocks.projectCount,
      findFirst: mocks.projectFindFirst,
      findUnique: mocks.projectFindUnique,
      update: mocks.projectUpdate,
      create: mocks.projectCreate,
      delete: mocks.projectDelete,
    },
    $transaction: mocks.transaction,
  },
}))

import { createLand, listLands, getLand, deleteLand } from '../src/modules/lands/lands.service.js'
import { createProject, deleteProject, getProject, listProjects, updateProject } from '../src/modules/projects/projects.service.js'
import { createLandSchema } from '../src/modules/lands/lands.validator.js'
import { createProjectSchema } from '../src/modules/projects/projects.validator.js'

const admin = { id: 1, role: 'ADMIN' as const }
const pm = { id: 2, role: 'PM' as const }

describe('land and project authorization rules', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.transaction.mockImplementation(async (operations: Array<Promise<unknown>>) => Promise.all(operations))
  })

  it('filters PM land access through assigned projects', async () => {
    mocks.landFindMany.mockResolvedValue([])
    mocks.landCount.mockResolvedValue(0)
    await listLands(pm, 1, 20)
    expect(mocks.landFindMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { projects: { some: { assignedPmId: pm.id } } },
    }))
  })

  it('denies PM access to an unassigned land', async () => {
    mocks.landFindFirst.mockResolvedValue(null)
    await expect(getLand(pm, 99)).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 })
  })

  it('allows ADMIN land listing and creation', async () => {
    mocks.landFindMany.mockResolvedValue([])
    mocks.landCount.mockResolvedValue(0)
    mocks.landCreate.mockResolvedValue({ id: 1 })
    await listLands(admin, 1, 20)
    await createLand(admin, { name: 'Parcel', city: 'Pune', state: 'Maharashtra', areaValue: 1, areaUnit: 'ACRE' })
    expect(mocks.landFindMany).toHaveBeenCalledWith(expect.objectContaining({ where: {} }))
    expect(mocks.landCreate).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ createdById: admin.id }) }))
  })

  it('rejects invalid land and project data at the validation boundary', () => {
    expect(createLandSchema.safeParse({ name: '', city: 'Pune', state: 'Maharashtra', areaValue: -1, areaUnit: 'ACRE' }).success).toBe(false)
    expect(createProjectSchema.safeParse({
      landId: 1,
      code: 'P-1',
      name: 'Project',
      status: 'ACTIVE',
      totalBudget: 10,
      wastageThresholdPct: 10,
      startDate: '2026-12-10',
      expectedEndDate: '2026-12-01',
    }).success).toBe(false)
  })

  it('blocks land deletion when projects depend on it', async () => {
    mocks.landFindUnique.mockResolvedValue({ id: 1, _count: { projects: 1 } })
    await expect(deleteLand(1)).rejects.toMatchObject({ code: 'BUSINESS_RULE_VIOLATION', status: 409 })
    expect(mocks.landDelete).not.toHaveBeenCalled()
  })

  it('rejects PM attempts to change project assignment or administrative fields', async () => {
    mocks.projectFindFirst.mockResolvedValue({ id: 1 })
    await expect(updateProject(pm, 1, { assignedPmId: 3 })).rejects.toMatchObject({ code: 'FORBIDDEN', status: 403 })
    expect(mocks.projectUpdate).not.toHaveBeenCalled()
  })

  it('allows ADMIN project access and denies PM access to unassigned projects', async () => {
    mocks.projectFindMany.mockResolvedValue([])
    mocks.projectCount.mockResolvedValue(0)
    await listProjects(admin, 1, 20)
    expect(mocks.projectFindMany).toHaveBeenCalledWith(expect.objectContaining({ where: {} }))

    mocks.projectFindFirst.mockResolvedValue(null)
    await expect(getProject(pm, 99)).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 })
  })

  it('blocks project deletion when dependent records exist', async () => {
    mocks.projectFindUnique.mockResolvedValue({
      id: 1,
      _count: { materialPlans: 0, dailyLogs: 1, stockTransactions: 0, bills: 0, notifications: 0 },
    })
    await expect(deleteProject(1)).rejects.toMatchObject({ code: 'BUSINESS_RULE_VIOLATION', status: 409 })
    expect(mocks.projectDelete).not.toHaveBeenCalled()
  })

  it('allows ADMIN project deletion when no dependent records exist', async () => {
    mocks.projectFindUnique.mockResolvedValue({
      id: 1,
      _count: { materialPlans: 0, dailyLogs: 0, stockTransactions: 0, bills: 0, notifications: 0 },
    })
    await deleteProject(1)
    expect(mocks.projectDelete).toHaveBeenCalledWith({ where: { id: 1 } })
    expect(admin.role).toBe('ADMIN')
  })
})
