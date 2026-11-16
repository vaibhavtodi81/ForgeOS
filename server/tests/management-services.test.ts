import { beforeEach, describe, expect, it, vi } from 'vitest' // Imports test-runner helpers for defining and checking this behavior.

const mocks = vi.hoisted(() => ({ // Stores this intermediate `mocks` value so later lines can use it.
  landFindMany: vi.fn(), // Separates this argument or property from the next item in the surrounding call or object.
  landCount: vi.fn(), // Separates this argument or property from the next item in the surrounding call or object.
  landFindFirst: vi.fn(), // Separates this argument or property from the next item in the surrounding call or object.
  landFindUnique: vi.fn(), // Separates this argument or property from the next item in the surrounding call or object.
  landDelete: vi.fn(), // Separates this argument or property from the next item in the surrounding call or object.
  landCreate: vi.fn(), // Separates this argument or property from the next item in the surrounding call or object.
  projectFindMany: vi.fn(), // Separates this argument or property from the next item in the surrounding call or object.
  projectCount: vi.fn(), // Separates this argument or property from the next item in the surrounding call or object.
  projectFindFirst: vi.fn(), // Separates this argument or property from the next item in the surrounding call or object.
  projectFindUnique: vi.fn(), // Separates this argument or property from the next item in the surrounding call or object.
  projectUpdate: vi.fn(), // Separates this argument or property from the next item in the surrounding call or object.
  projectCreate: vi.fn(), // Separates this argument or property from the next item in the surrounding call or object.
  projectDelete: vi.fn(), // Separates this argument or property from the next item in the surrounding call or object.
  transaction: vi.fn(), // Separates this argument or property from the next item in the surrounding call or object.
})) // Provides `}))` as part of this server module.

vi.mock('../src/utils/prisma.js', () => ({ // Configures the test double or mock so this test can control the external behavior it depends on.
  prisma: { // Sets `prisma` to the prisma value.
    land: { // Sets `land` to the land value.
      findMany: mocks.landFindMany, // Separates this argument or property from the next item in the surrounding call or object.
      count: mocks.landCount, // Separates this argument or property from the next item in the surrounding call or object.
      findFirst: mocks.landFindFirst, // Separates this argument or property from the next item in the surrounding call or object.
      findUnique: mocks.landFindUnique, // Separates this argument or property from the next item in the surrounding call or object.
      delete: mocks.landDelete, // Separates this argument or property from the next item in the surrounding call or object.
      create: mocks.landCreate, // Separates this argument or property from the next item in the surrounding call or object.
    }, // Closes the current call, object, or collection so the surrounding expression can continue.
    project: { // Sets `project` to the project value.
      findMany: mocks.projectFindMany, // Separates this argument or property from the next item in the surrounding call or object.
      count: mocks.projectCount, // Separates this argument or property from the next item in the surrounding call or object.
      findFirst: mocks.projectFindFirst, // Separates this argument or property from the next item in the surrounding call or object.
      findUnique: mocks.projectFindUnique, // Separates this argument or property from the next item in the surrounding call or object.
      update: mocks.projectUpdate, // Separates this argument or property from the next item in the surrounding call or object.
      create: mocks.projectCreate, // Separates this argument or property from the next item in the surrounding call or object.
      delete: mocks.projectDelete, // Separates this argument or property from the next item in the surrounding call or object.
    }, // Closes the current call, object, or collection so the surrounding expression can continue.
    $transaction: mocks.transaction, // Separates this argument or property from the next item in the surrounding call or object.
  }, // Closes the current call, object, or collection so the surrounding expression can continue.
})) // Provides `}))` as part of this server module.

import { createLand, listLands, getLand, deleteLand } from '../src/modules/lands/lands.service.js' // Imports { createLand, listLands, getLand, deleteLand } from '../src/modules/lands/lands.service.js' so this module can reuse that functionality.
import { createProject, deleteProject, getProject, listProjects, updateProject } from '../src/modules/projects/projects.service.js' // Imports { createProject, deleteProject, getProject, listProjects, updateProject } from '../src/modules/projects/projects.service.js' so this module can reuse that functionality.
import { createLandSchema } from '../src/modules/lands/lands.validator.js' // Imports { createLandSchema } from '../src/modules/lands/lands.validator.js' so this module can reuse that functionality.
import { createProjectSchema } from '../src/modules/projects/projects.validator.js' // Imports { createProjectSchema } from '../src/modules/projects/projects.validator.js' so this module can reuse that functionality.

const admin = { id: 1, role: 'ADMIN' as const } // Stores this intermediate `admin` value so later lines can use it.
const pm = { id: 2, role: 'PM' as const } // Stores this intermediate `pm` value so later lines can use it.

describe('land and project authorization rules', () => { // Opens the function, callback, or control-flow block that groups the related statements.
  beforeEach(() => { // Opens the function, callback, or control-flow block that groups the related statements.
    vi.clearAllMocks() // Configures the test double or mock so this test can control the external behavior it depends on.
    mocks.transaction.mockImplementation(async (operations: Array<Promise<unknown>>) => Promise.all(operations)) // Provides `mocks.transaction.mockImplementation(async (operations: Array<Promise<unknown>>) => Promise.all(operations))` as part of this server module.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.

  it('filters PM land access through assigned projects', async () => { // Opens the function, callback, or control-flow block that groups the related statements.
    mocks.landFindMany.mockResolvedValue([]) // Provides `mocks.landFindMany.mockResolvedValue([])` as part of this server module.
    mocks.landCount.mockResolvedValue(0) // Provides `mocks.landCount.mockResolvedValue(0)` as part of this server module.
    await listLands(pm, 1, 20) // Waits for this asynchronous operation to finish before using its result.
    expect(mocks.landFindMany).toHaveBeenCalledWith(expect.objectContaining({ // Asserts that the observed result matches the behavior this test is meant to guarantee.
      where: { projects: { some: { assignedPmId: pm.id } } }, // Separates this argument or property from the next item in the surrounding call or object.
    })) // Provides `}))` as part of this server module.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.

  it('denies PM access to an unassigned land', async () => { // Opens the function, callback, or control-flow block that groups the related statements.
    mocks.landFindFirst.mockResolvedValue(null) // Provides `mocks.landFindFirst.mockResolvedValue(null)` as part of this server module.
    await expect(getLand(pm, 99)).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 }) // Waits for this asynchronous operation to finish before using its result.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.

  it('allows ADMIN land listing and creation', async () => { // Opens the function, callback, or control-flow block that groups the related statements.
    mocks.landFindMany.mockResolvedValue([]) // Provides `mocks.landFindMany.mockResolvedValue([])` as part of this server module.
    mocks.landCount.mockResolvedValue(0) // Provides `mocks.landCount.mockResolvedValue(0)` as part of this server module.
    mocks.landCreate.mockResolvedValue({ id: 1 }) // Provides `mocks.landCreate.mockResolvedValue({ id: 1 })` as part of this server module.
    await listLands(admin, 1, 20) // Waits for this asynchronous operation to finish before using its result.
    await createLand(admin, { name: 'Parcel', city: 'Pune', state: 'Maharashtra', areaValue: 1, areaUnit: 'ACRE' }) // Waits for this asynchronous operation to finish before using its result.
    expect(mocks.landFindMany).toHaveBeenCalledWith(expect.objectContaining({ where: {} })) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(mocks.landCreate).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ createdById: admin.id }) })) // Asserts that the observed result matches the behavior this test is meant to guarantee.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.

  it('rejects invalid land and project data at the validation boundary', () => { // Opens the function, callback, or control-flow block that groups the related statements.
    expect(createLandSchema.safeParse({ name: '', city: 'Pune', state: 'Maharashtra', areaValue: -1, areaUnit: 'ACRE' }).success).toBe(false) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(createProjectSchema.safeParse({ // Asserts that the observed result matches the behavior this test is meant to guarantee.
      landId: 1, // Separates this argument or property from the next item in the surrounding call or object.
      code: 'P-1', // Separates this argument or property from the next item in the surrounding call or object.
      name: 'Project', // Separates this argument or property from the next item in the surrounding call or object.
      status: 'ACTIVE', // Separates this argument or property from the next item in the surrounding call or object.
      totalBudget: 10, // Separates this argument or property from the next item in the surrounding call or object.
      wastageThresholdPct: 10, // Separates this argument or property from the next item in the surrounding call or object.
      startDate: '2026-12-10', // Separates this argument or property from the next item in the surrounding call or object.
      expectedEndDate: '2026-12-01', // Separates this argument or property from the next item in the surrounding call or object.
    }).success).toBe(false) // Provides `}).success).toBe(false)` as part of this server module.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.

  it('blocks land deletion when projects depend on it', async () => { // Opens the function, callback, or control-flow block that groups the related statements.
    mocks.landFindUnique.mockResolvedValue({ id: 1, _count: { projects: 1 } }) // Provides `mocks.landFindUnique.mockResolvedValue({ id: 1, _count: { projects: 1 } })` as part of this server module.
    await expect(deleteLand(1)).rejects.toMatchObject({ code: 'BUSINESS_RULE_VIOLATION', status: 409 }) // Waits for this asynchronous operation to finish before using its result.
    expect(mocks.landDelete).not.toHaveBeenCalled() // Asserts that the observed result matches the behavior this test is meant to guarantee.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.

  it('rejects PM attempts to change project assignment or administrative fields', async () => { // Opens the function, callback, or control-flow block that groups the related statements.
    mocks.projectFindFirst.mockResolvedValue({ id: 1 }) // Provides `mocks.projectFindFirst.mockResolvedValue({ id: 1 })` as part of this server module.
    await expect(updateProject(pm, 1, { assignedPmId: 3 })).rejects.toMatchObject({ code: 'FORBIDDEN', status: 403 }) // Waits for this asynchronous operation to finish before using its result.
    expect(mocks.projectUpdate).not.toHaveBeenCalled() // Asserts that the observed result matches the behavior this test is meant to guarantee.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.

  it('allows ADMIN project access and denies PM access to unassigned projects', async () => { // Opens the function, callback, or control-flow block that groups the related statements.
    mocks.projectFindMany.mockResolvedValue([]) // Provides `mocks.projectFindMany.mockResolvedValue([])` as part of this server module.
    mocks.projectCount.mockResolvedValue(0) // Provides `mocks.projectCount.mockResolvedValue(0)` as part of this server module.
    await listProjects(admin, 1, 20) // Waits for this asynchronous operation to finish before using its result.
    expect(mocks.projectFindMany).toHaveBeenCalledWith(expect.objectContaining({ where: {} })) // Asserts that the observed result matches the behavior this test is meant to guarantee.

    mocks.projectFindFirst.mockResolvedValue(null) // Provides `mocks.projectFindFirst.mockResolvedValue(null)` as part of this server module.
    await expect(getProject(pm, 99)).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 }) // Waits for this asynchronous operation to finish before using its result.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.

  it('blocks project deletion when dependent records exist', async () => { // Opens the function, callback, or control-flow block that groups the related statements.
    mocks.projectFindUnique.mockResolvedValue({ // Opens the object or callback body that groups the settings for this operation.
      id: 1, // Separates this argument or property from the next item in the surrounding call or object.
      _count: { materialPlans: 0, dailyLogs: 1, stockTransactions: 0, bills: 0, notifications: 0 }, // Separates this argument or property from the next item in the surrounding call or object.
    }) // Closes the current call, object, or collection so the surrounding expression can continue.
    await expect(deleteProject(1)).rejects.toMatchObject({ code: 'BUSINESS_RULE_VIOLATION', status: 409 }) // Waits for this asynchronous operation to finish before using its result.
    expect(mocks.projectDelete).not.toHaveBeenCalled() // Asserts that the observed result matches the behavior this test is meant to guarantee.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.

  it('allows ADMIN project deletion when no dependent records exist', async () => { // Opens the function, callback, or control-flow block that groups the related statements.
    mocks.projectFindUnique.mockResolvedValue({ // Opens the object or callback body that groups the settings for this operation.
      id: 1, // Separates this argument or property from the next item in the surrounding call or object.
      _count: { materialPlans: 0, dailyLogs: 0, stockTransactions: 0, bills: 0, notifications: 0 }, // Separates this argument or property from the next item in the surrounding call or object.
    }) // Closes the current call, object, or collection so the surrounding expression can continue.
    await deleteProject(1) // Waits for this asynchronous operation to finish before using its result.
    expect(mocks.projectDelete).toHaveBeenCalledWith({ where: { id: 1 } }) // Asserts that the observed result matches the behavior this test is meant to guarantee.
    expect(admin.role).toBe('ADMIN') // Asserts that the observed result matches the behavior this test is meant to guarantee.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
}) // Closes the current call, object, or collection so the surrounding expression can continue.
// File purpose: Checks expected behavior for management services.test using the project test runner.
