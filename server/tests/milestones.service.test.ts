import { beforeEach, describe, expect, it, vi } from 'vitest' // Imports test-runner helpers for defining and checking this behavior.

const mocks = vi.hoisted(() => ({ // Stores this intermediate `mocks` value so later lines can use it.
  projectFindFirst: vi.fn(), // Separates this argument or property from the next item in the surrounding call or object.
  milestoneFindUnique: vi.fn(), // Separates this argument or property from the next item in the surrounding call or object.
  milestoneFindMany: vi.fn(), // Separates this argument or property from the next item in the surrounding call or object.
  milestoneCreate: vi.fn(), // Separates this argument or property from the next item in the surrounding call or object.
  milestoneUpdate: vi.fn(), // Separates this argument or property from the next item in the surrounding call or object.
  milestoneDelete: vi.fn(), // Separates this argument or property from the next item in the surrounding call or object.
  auditCreate: vi.fn(), // Separates this argument or property from the next item in the surrounding call or object.
  transaction: vi.fn(), // Separates this argument or property from the next item in the surrounding call or object.
})) // Provides `}))` as part of this server module.

vi.mock('../src/utils/prisma.js', () => ({ // Configures the test double or mock so this test can control the external behavior it depends on.
  prisma: { // Sets `prisma` to the prisma value.
    project: { findFirst: mocks.projectFindFirst }, // Separates this argument or property from the next item in the surrounding call or object.
    projectMilestone: { // Sets `projectMilestone` to the project milestone value.
      findUnique: mocks.milestoneFindUnique, // Separates this argument or property from the next item in the surrounding call or object.
      findMany: mocks.milestoneFindMany, // Separates this argument or property from the next item in the surrounding call or object.
      create: mocks.milestoneCreate, // Separates this argument or property from the next item in the surrounding call or object.
      update: mocks.milestoneUpdate, // Separates this argument or property from the next item in the surrounding call or object.
      delete: mocks.milestoneDelete, // Separates this argument or property from the next item in the surrounding call or object.
    }, // Closes the current call, object, or collection so the surrounding expression can continue.
    auditLog: { create: mocks.auditCreate }, // Separates this argument or property from the next item in the surrounding call or object.
    $transaction: mocks.transaction, // Separates this argument or property from the next item in the surrounding call or object.
  }, // Closes the current call, object, or collection so the surrounding expression can continue.
})) // Provides `}))` as part of this server module.

import { // Imports { from  so this module can reuse that functionality.
  createMilestone, // Separates this argument or property from the next item in the surrounding call or object.
  deleteMilestone, // Separates this argument or property from the next item in the surrounding call or object.
  getMilestone, // Separates this argument or property from the next item in the surrounding call or object.
  listMilestones, // Separates this argument or property from the next item in the surrounding call or object.
  updateMilestone, // Separates this argument or property from the next item in the surrounding call or object.
} from '../src/modules/milestones/milestones.service.js' // Provides `} from '../src/modules/milestones/milestones.service.js'` as part of this server module.
import { // Imports { from  so this module can reuse that functionality.
  createMilestoneSchema, // Separates this argument or property from the next item in the surrounding call or object.
  updateMilestoneSchema, // Separates this argument or property from the next item in the surrounding call or object.
} from '../src/modules/milestones/milestones.validator.js' // Provides `} from '../src/modules/milestones/milestones.validator.js'` as part of this server module.

const admin = { id: 1, role: 'ADMIN' as const } // Stores this intermediate `admin` value so later lines can use it.
const pm = { id: 2, role: 'PM' as const } // Stores this intermediate `pm` value so later lines can use it.
const project = { id: 3, code: 'DEV-001', name: 'Development Project' } // Stores this intermediate `project` value so later lines can use it.

function decimal(value: number) { // Defines `decimal` to decimal, keeping this behavior reusable.
  return { toString: () => String(value) } // Returns the assembled result object so the caller receives the fields it needs.
} // Closes the current block and marks where its grouped work ends.

function milestone(overrides: Record<string, unknown> = {}) { // Defines `milestone` to milestone, keeping this behavior reusable.
  return { // Returns the assembled result object so the caller receives the fields it needs.
    id: 10, // Separates this argument or property from the next item in the surrounding call or object.
    projectId: 3, // Separates this argument or property from the next item in the surrounding call or object.
    name: 'Foundation', // Separates this argument or property from the next item in the surrounding call or object.
    description: 'Complete foundation works', // Separates this argument or property from the next item in the surrounding call or object.
    sequence: 1, // Separates this argument or property from the next item in the surrounding call or object.
    plannedStartDate: new Date('2026-11-01T00:00:00.000Z'), // Separates this argument or property from the next item in the surrounding call or object.
    plannedEndDate: new Date('2026-11-30T00:00:00.000Z'), // Separates this argument or property from the next item in the surrounding call or object.
    actualStartDate: null, // Separates this argument or property from the next item in the surrounding call or object.
    actualEndDate: null, // Separates this argument or property from the next item in the surrounding call or object.
    status: 'PLANNED', // Separates this argument or property from the next item in the surrounding call or object.
    progressPercent: decimal(0), // Separates this argument or property from the next item in the surrounding call or object.
    createdAt: new Date('2026-11-01T10:00:00.000Z'), // Separates this argument or property from the next item in the surrounding call or object.
    updatedAt: new Date('2026-11-01T10:00:00.000Z'), // Separates this argument or property from the next item in the surrounding call or object.
    project, // Separates this argument or property from the next item in the surrounding call or object.
    ...overrides, // Separates this argument or property from the next item in the surrounding call or object.
  } // Closes the current block and marks where its grouped work ends.
} // Closes the current block and marks where its grouped work ends.

beforeEach(() => { // Opens the function, callback, or control-flow block that groups the related statements.
  vi.clearAllMocks() // Configures the test double or mock so this test can control the external behavior it depends on.
  mocks.projectFindFirst.mockResolvedValue(project) // Provides `mocks.projectFindFirst.mockResolvedValue(project)` as part of milestone.
  mocks.milestoneFindUnique.mockResolvedValue(milestone()) // Provides `mocks.milestoneFindUnique.mockResolvedValue(milestone())` as part of milestone.
  mocks.milestoneFindMany.mockResolvedValue([milestone(), milestone({ id: 11, sequence: 2, name: 'Structure' })]) // Provides `mocks.milestoneFindMany.mockResolvedValue([milestone(), milestone({ id: 11, sequence: 2, name: 'Structure' })])` as part of milestone.
  mocks.milestoneCreate.mockResolvedValue(milestone()) // Provides `mocks.milestoneCreate.mockResolvedValue(milestone())` as part of milestone.
  mocks.milestoneUpdate.mockResolvedValue(milestone({ progressPercent: decimal(50), status: 'IN_PROGRESS' })) // Provides `mocks.milestoneUpdate.mockResolvedValue(milestone({ progressPercent: decimal(50), status: 'IN_PROGRESS' }))` as part of milestone.
  mocks.milestoneDelete.mockResolvedValue(milestone()) // Provides `mocks.milestoneDelete.mockResolvedValue(milestone())` as part of milestone.
  mocks.auditCreate.mockResolvedValue({}) // Provides `mocks.auditCreate.mockResolvedValue({})` as part of milestone.
  mocks.transaction.mockImplementation(async (callback: (tx: unknown) => Promise<unknown>) => callback({ // Opens the object or callback body that groups the settings for this operation.
    projectMilestone: { // Sets `projectMilestone` to the project milestone value.
      create: mocks.milestoneCreate, // Separates this argument or property from the next item in the surrounding call or object.
      update: mocks.milestoneUpdate, // Separates this argument or property from the next item in the surrounding call or object.
      delete: mocks.milestoneDelete, // Separates this argument or property from the next item in the surrounding call or object.
    }, // Closes the current call, object, or collection so the surrounding expression can continue.
    auditLog: { create: mocks.auditCreate }, // Separates this argument or property from the next item in the surrounding call or object.
  })) // Provides `}))` as part of milestone.
}) // Closes the current call, object, or collection so the surrounding expression can continue.

describe('project milestones', () => { // Opens the function, callback, or control-flow block that groups the related statements.
  it('allows ADMIN and assigned PM to create and list project milestones', async () => { // Opens the function, callback, or control-flow block that groups the related statements.
    const input = { // Stores this intermediate `input` value so later lines can use it.
      name: 'Foundation', // Separates this argument or property from the next item in the surrounding call or object.
      description: 'Complete foundation works', // Separates this argument or property from the next item in the surrounding call or object.
      sequence: 1, // Separates this argument or property from the next item in the surrounding call or object.
      plannedStartDate: '2026-11-01', // Separates this argument or property from the next item in the surrounding call or object.
      plannedEndDate: '2026-11-30', // Separates this argument or property from the next item in the surrounding call or object.
      status: 'PLANNED' as const, // Separates this argument or property from the next item in the surrounding call or object.
      progressPercent: 0, // Separates this argument or property from the next item in the surrounding call or object.
    } // Closes the current block and marks where its grouped work ends.

    await expect(createMilestone(admin, 3, input)).resolves.toEqual(expect.objectContaining({ id: 10 })) // Waits for this asynchronous operation to finish before using its result.
    await expect(listMilestones(pm, 3)).resolves.toHaveLength(2) // Waits for this asynchronous operation to finish before using its result.
    expect(mocks.milestoneFindMany).toHaveBeenCalledWith(expect.objectContaining({ // Asserts that the observed result matches the behavior this test is meant to guarantee.
      where: { projectId: 3 }, // Separates this argument or property from the next item in the surrounding call or object.
      orderBy: [{ sequence: 'asc' }, { plannedStartDate: 'asc' }, { id: 'asc' }], // Separates this argument or property from the next item in the surrounding call or object.
    })) // Provides `}))` as part of milestone.
    expect(mocks.auditCreate).toHaveBeenCalledWith(expect.objectContaining({ // Asserts that the observed result matches the behavior this test is meant to guarantee.
      data: expect.objectContaining({ // Sets `data` to the values to write to the database.
        entityType: 'ProjectMilestone', // Separates this argument or property from the next item in the surrounding call or object.
        newValues: expect.objectContaining({ projectId: 3 }), // Separates this argument or property from the next item in the surrounding call or object.
      }), // Separates this argument or property from the next item in the surrounding call or object.
    })) // Provides `}))` as part of milestone.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.

  it('denies unassigned PMs and nonexistent project milestones', async () => { // Opens the function, callback, or control-flow block that groups the related statements.
    mocks.projectFindFirst.mockResolvedValueOnce(null) // Provides `mocks.projectFindFirst.mockResolvedValueOnce(null)` as part of milestone.
    await expect(listMilestones(pm, 3)).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 }) // Waits for this asynchronous operation to finish before using its result.

    mocks.milestoneFindUnique.mockResolvedValueOnce(null) // Provides `mocks.milestoneFindUnique.mockResolvedValueOnce(null)` as part of milestone.
    await expect(getMilestone(admin, 999)).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 }) // Waits for this asynchronous operation to finish before using its result.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.

  it('gets, updates, and deletes milestones with audit records', async () => { // Opens the function, callback, or control-flow block that groups the related statements.
    await expect(getMilestone(pm, 10)).resolves.toEqual(expect.objectContaining({ id: 10 })) // Waits for this asynchronous operation to finish before using its result.
    await updateMilestone(pm, 10, { progressPercent: 50, status: 'IN_PROGRESS' }) // Waits for this asynchronous operation to finish before using its result.
    expect(mocks.auditCreate).toHaveBeenCalledWith(expect.objectContaining({ // Asserts that the observed result matches the behavior this test is meant to guarantee.
      data: expect.objectContaining({ // Sets `data` to the values to write to the database.
        action: 'UPDATE', // Separates this argument or property from the next item in the surrounding call or object.
        oldValues: { projectId: 3, progressPercent: '0', status: 'PLANNED' }, // Separates this argument or property from the next item in the surrounding call or object.
        newValues: { projectId: 3, progressPercent: '50', status: 'IN_PROGRESS' }, // Separates this argument or property from the next item in the surrounding call or object.
      }), // Separates this argument or property from the next item in the surrounding call or object.
    })) // Provides `}))` as part of milestone.

    await deleteMilestone(admin, 10) // Waits for this asynchronous operation to finish before using its result.
    expect(mocks.milestoneDelete).toHaveBeenCalledWith({ where: { id: 10 } }) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(mocks.auditCreate).toHaveBeenCalledWith(expect.objectContaining({ // Asserts that the observed result matches the behavior this test is meant to guarantee.
      data: expect.objectContaining({ // Sets `data` to the values to write to the database.
        action: 'DELETE', // Separates this argument or property from the next item in the surrounding call or object.
        oldValues: expect.objectContaining({ id: 10, projectId: 3 }), // Separates this argument or property from the next item in the surrounding call or object.
      }), // Separates this argument or property from the next item in the surrounding call or object.
    })) // Provides `}))` as part of milestone.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.

  it('validates progress, status, and date ranges', () => { // Opens the function, callback, or control-flow block that groups the related statements.
    expect(createMilestoneSchema.safeParse({ // Asserts that the observed result matches the behavior this test is meant to guarantee.
      name: 'Bad', // Separates this argument or property from the next item in the surrounding call or object.
      sequence: 1, // Separates this argument or property from the next item in the surrounding call or object.
      plannedStartDate: '2026-12-01', // Separates this argument or property from the next item in the surrounding call or object.
      plannedEndDate: '2026-11-01', // Separates this argument or property from the next item in the surrounding call or object.
      status: 'PLANNED', // Separates this argument or property from the next item in the surrounding call or object.
      progressPercent: 0, // Separates this argument or property from the next item in the surrounding call or object.
    }).success).toBe(false) // Provides `}).success).toBe(false)` as part of milestone.
    expect(updateMilestoneSchema.safeParse({ progressPercent: 101 }).success).toBe(false) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(updateMilestoneSchema.safeParse({ status: 'UNKNOWN' }).success).toBe(false) // Asserts that the observed result matches the behavior this test is meant to guarantee.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.

  it('does not create an audit row when the milestone transaction fails', async () => { // Opens the function, callback, or control-flow block that groups the related statements.
    mocks.milestoneCreate.mockRejectedValueOnce(new Error('write failed')) // Provides `mocks.milestoneCreate.mockRejectedValueOnce(new Error('write failed'))` as part of milestone.
    await expect(createMilestone(admin, 3, { // Waits for this asynchronous operation to finish before using its result.
      name: 'Foundation', // Separates this argument or property from the next item in the surrounding call or object.
      sequence: 1, // Separates this argument or property from the next item in the surrounding call or object.
      status: 'PLANNED', // Separates this argument or property from the next item in the surrounding call or object.
      progressPercent: 0, // Separates this argument or property from the next item in the surrounding call or object.
    })).rejects.toThrow('write failed') // Provides `})).rejects.toThrow('write failed')` as part of milestone.
    expect(mocks.auditCreate).not.toHaveBeenCalled() // Asserts that the observed result matches the behavior this test is meant to guarantee.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
}) // Closes the current call, object, or collection so the surrounding expression can continue.
// File purpose: Checks expected behavior for milestones.service.test using the project test runner.
