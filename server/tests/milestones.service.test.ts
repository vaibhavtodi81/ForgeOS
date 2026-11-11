import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  projectFindFirst: vi.fn(),
  milestoneFindUnique: vi.fn(),
  milestoneFindMany: vi.fn(),
  milestoneCreate: vi.fn(),
  milestoneUpdate: vi.fn(),
  milestoneDelete: vi.fn(),
  auditCreate: vi.fn(),
  transaction: vi.fn(),
}))

vi.mock('../src/utils/prisma.js', () => ({
  prisma: {
    project: { findFirst: mocks.projectFindFirst },
    projectMilestone: {
      findUnique: mocks.milestoneFindUnique,
      findMany: mocks.milestoneFindMany,
      create: mocks.milestoneCreate,
      update: mocks.milestoneUpdate,
      delete: mocks.milestoneDelete,
    },
    auditLog: { create: mocks.auditCreate },
    $transaction: mocks.transaction,
  },
}))

import {
  createMilestone,
  deleteMilestone,
  getMilestone,
  listMilestones,
  updateMilestone,
} from '../src/modules/milestones/milestones.service.js'
import {
  createMilestoneSchema,
  updateMilestoneSchema,
} from '../src/modules/milestones/milestones.validator.js'

const admin = { id: 1, role: 'ADMIN' as const }
const pm = { id: 2, role: 'PM' as const }
const project = { id: 3, code: 'DEV-001', name: 'Development Project' }

function decimal(value: number) {
  return { toString: () => String(value) }
}

function milestone(overrides: Record<string, unknown> = {}) {
  return {
    id: 10,
    projectId: 3,
    name: 'Foundation',
    description: 'Complete foundation works',
    sequence: 1,
    plannedStartDate: new Date('2026-11-01T00:00:00.000Z'),
    plannedEndDate: new Date('2026-11-30T00:00:00.000Z'),
    actualStartDate: null,
    actualEndDate: null,
    status: 'PLANNED',
    progressPercent: decimal(0),
    createdAt: new Date('2026-11-01T10:00:00.000Z'),
    updatedAt: new Date('2026-11-01T10:00:00.000Z'),
    project,
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  mocks.projectFindFirst.mockResolvedValue(project)
  mocks.milestoneFindUnique.mockResolvedValue(milestone())
  mocks.milestoneFindMany.mockResolvedValue([milestone(), milestone({ id: 11, sequence: 2, name: 'Structure' })])
  mocks.milestoneCreate.mockResolvedValue(milestone())
  mocks.milestoneUpdate.mockResolvedValue(milestone({ progressPercent: decimal(50), status: 'IN_PROGRESS' }))
  mocks.milestoneDelete.mockResolvedValue(milestone())
  mocks.auditCreate.mockResolvedValue({})
  mocks.transaction.mockImplementation(async (callback: (tx: unknown) => Promise<unknown>) => callback({
    projectMilestone: {
      create: mocks.milestoneCreate,
      update: mocks.milestoneUpdate,
      delete: mocks.milestoneDelete,
    },
    auditLog: { create: mocks.auditCreate },
  }))
})

describe('project milestones', () => {
  it('allows ADMIN and assigned PM to create and list project milestones', async () => {
    const input = {
      name: 'Foundation',
      description: 'Complete foundation works',
      sequence: 1,
      plannedStartDate: '2026-11-01',
      plannedEndDate: '2026-11-30',
      status: 'PLANNED' as const,
      progressPercent: 0,
    }

    await expect(createMilestone(admin, 3, input)).resolves.toEqual(expect.objectContaining({ id: 10 }))
    await expect(listMilestones(pm, 3)).resolves.toHaveLength(2)
    expect(mocks.milestoneFindMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { projectId: 3 },
      orderBy: [{ sequence: 'asc' }, { plannedStartDate: 'asc' }, { id: 'asc' }],
    }))
    expect(mocks.auditCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        entityType: 'ProjectMilestone',
        newValues: expect.objectContaining({ projectId: 3 }),
      }),
    }))
  })

  it('denies unassigned PMs and nonexistent project milestones', async () => {
    mocks.projectFindFirst.mockResolvedValueOnce(null)
    await expect(listMilestones(pm, 3)).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 })

    mocks.milestoneFindUnique.mockResolvedValueOnce(null)
    await expect(getMilestone(admin, 999)).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 })
  })

  it('gets, updates, and deletes milestones with audit records', async () => {
    await expect(getMilestone(pm, 10)).resolves.toEqual(expect.objectContaining({ id: 10 }))
    await updateMilestone(pm, 10, { progressPercent: 50, status: 'IN_PROGRESS' })
    expect(mocks.auditCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        action: 'UPDATE',
        oldValues: { projectId: 3, progressPercent: '0', status: 'PLANNED' },
        newValues: { projectId: 3, progressPercent: '50', status: 'IN_PROGRESS' },
      }),
    }))

    await deleteMilestone(admin, 10)
    expect(mocks.milestoneDelete).toHaveBeenCalledWith({ where: { id: 10 } })
    expect(mocks.auditCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        action: 'DELETE',
        oldValues: expect.objectContaining({ id: 10, projectId: 3 }),
      }),
    }))
  })

  it('validates progress, status, and date ranges', () => {
    expect(createMilestoneSchema.safeParse({
      name: 'Bad',
      sequence: 1,
      plannedStartDate: '2026-12-01',
      plannedEndDate: '2026-11-01',
      status: 'PLANNED',
      progressPercent: 0,
    }).success).toBe(false)
    expect(updateMilestoneSchema.safeParse({ progressPercent: 101 }).success).toBe(false)
    expect(updateMilestoneSchema.safeParse({ status: 'UNKNOWN' }).success).toBe(false)
  })

  it('does not create an audit row when the milestone transaction fails', async () => {
    mocks.milestoneCreate.mockRejectedValueOnce(new Error('write failed'))
    await expect(createMilestone(admin, 3, {
      name: 'Foundation',
      sequence: 1,
      status: 'PLANNED',
      progressPercent: 0,
    })).rejects.toThrow('write failed')
    expect(mocks.auditCreate).not.toHaveBeenCalled()
  })
})
