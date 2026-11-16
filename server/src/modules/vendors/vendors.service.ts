import { Prisma, type VendorType } from '@prisma/client' // Uses Prisma's generated types and client to work safely with database records.
import { prisma } from '../../utils/prisma.js' // Uses the shared Prisma client to run queries through the server's database connection.
import { AppError } from '../../utils/errors.js' // Uses the shared API error type so failures have a consistent message and HTTP status.
import { projectAccess, type ProjectActor } from '../projects/projects.service.js' // Imports { projectAccess, type ProjectActor } from '../projects/projects.service.js' so this module can reuse that functionality.
import type { VendorInput, VendorListQuery, VendorUpdateInput } from './vendors.validator.js' // Imports type { VendorInput, VendorListQuery, VendorUpdateInput } from './vendors.validator.js' so this module can reuse that functionality.

export type VendorActor = ProjectActor // Defines the `VendorActor` type so TypeScript can describe the data or behavior used here.

export async function listVendors(actor: VendorActor, query: VendorListQuery) { // Defines `listVendors` to retrieve a list of vendors, keeping this behavior reusable.
  const where = { // Builds the database filter so role access, status, and search rules are applied together.
    ...(query.isActive === undefined ? {} : { isActive: query.isActive }), // Separates this argument or property from the next item in the surrounding call or object.
    ...(query.search ? { OR: [ // Provides `...(query.search ? { OR: [` as part of list vendors.
      { name: { contains: query.search, mode: 'insensitive' as const } }, // Separates this argument or property from the next item in the surrounding call or object.
      { gstin: { contains: query.search, mode: 'insensitive' as const } }, // Separates this argument or property from the next item in the surrounding call or object.
    ] } : {}), // Separates this argument or property from the next item in the surrounding call or object.
    ...(actor.role === 'PM' ? { // Opens the object or callback body that groups the settings for this operation.
      projectAssignments: { some: { unassignedAt: null, project: { assignedPmId: actor.id } } }, // Separates this argument or property from the next item in the surrounding call or object.
    } : {}), // Separates this argument or property from the next item in the surrounding call or object.
  } // Closes the current block and marks where its grouped work ends.
  return prisma.vendor.findMany({ // Returns the database result to the route handler so it can form the API response.
    where, // Separates this argument or property from the next item in the surrounding call or object.
    include: { projectAssignments: { where: { unassignedAt: null }, select: { projectId: true } } }, // Separates this argument or property from the next item in the surrounding call or object.
    orderBy: { name: 'asc' }, // Separates this argument or property from the next item in the surrounding call or object.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
} // Closes the current block and marks where its grouped work ends.

export async function getVendor(actor: VendorActor, id: number) { // Defines `getVendor` to retrieve vendor, keeping this behavior reusable.
  const vendor = await prisma.vendor.findFirst({ // Looks up one matching database record and stores it in `vendor` so its existence or values can be checked.
    where: { // Sets `where` to filters the database records to the requested scope.
      id, // Separates this argument or property from the next item in the surrounding call or object.
      ...(actor.role === 'PM' ? { projectAssignments: { some: { unassignedAt: null, project: { assignedPmId: actor.id } } } } : {}), // Separates this argument or property from the next item in the surrounding call or object.
    }, // Closes the current call, object, or collection so the surrounding expression can continue.
    include: { projectAssignments: { include: { project: { select: { id: true, code: true, name: true } } }, orderBy: { assignedAt: 'desc' } } }, // Separates this argument or property from the next item in the surrounding call or object.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
  if (!vendor) throw new AppError('NOT_FOUND', 'Vendor not found.', 404) // Checks whether the value is missing; the block handles that case before continuing.
  return vendor // Returns `vendor` to the caller so the next layer can use the result.
} // Closes the current block and marks where its grouped work ends.

export async function createVendor(actor: VendorActor, input: VendorInput) { // Defines `createVendor` to create vendor, keeping this behavior reusable.
  return prisma.$transaction(async (tx) => { // Returns the database result to the route handler so it can form the API response.
    const vendor = await tx.vendor.create({ // Stores this intermediate `vendor` value so later lines can use it.
      data: { // Sets `data` to the values to write to the database.
        name: input.name, // Separates this argument or property from the next item in the surrounding call or object.
        vendorType: input.vendorType as VendorType, // Separates this argument or property from the next item in the surrounding call or object.
        gstin: input.gstin ?? null, // Separates this argument or property from the next item in the surrounding call or object.
        phone: input.phone ?? null, // Separates this argument or property from the next item in the surrounding call or object.
        email: input.email ?? null, // Separates this argument or property from the next item in the surrounding call or object.
        contactPerson: input.contactPerson ?? null, // Separates this argument or property from the next item in the surrounding call or object.
        address: input.address ?? null, // Separates this argument or property from the next item in the surrounding call or object.
      }, // Closes the current call, object, or collection so the surrounding expression can continue.
    }) // Closes the current call, object, or collection so the surrounding expression can continue.
    await tx.auditLog.create({ // Waits for this asynchronous operation to finish before using its result.
      data: { // Sets `data` to the values to write to the database.
        userId: actor.id, // Separates this argument or property from the next item in the surrounding call or object.
        action: 'CREATE', // Separates this argument or property from the next item in the surrounding call or object.
        entityType: 'Vendor', // Separates this argument or property from the next item in the surrounding call or object.
        entityId: vendor.id, // Separates this argument or property from the next item in the surrounding call or object.
        newValues: { // Sets `newValues` to the record values after the change.
          id: vendor.id, // Separates this argument or property from the next item in the surrounding call or object.
          name: vendor.name, // Separates this argument or property from the next item in the surrounding call or object.
          vendorType: vendor.vendorType, // Separates this argument or property from the next item in the surrounding call or object.
          gstin: vendor.gstin, // Separates this argument or property from the next item in the surrounding call or object.
          isActive: vendor.isActive, // Separates this argument or property from the next item in the surrounding call or object.
        } satisfies Prisma.InputJsonValue, // Separates this argument or property from the next item in the surrounding call or object.
      }, // Closes the current call, object, or collection so the surrounding expression can continue.
    }) // Closes the current call, object, or collection so the surrounding expression can continue.
    return vendor // Returns `vendor` to the caller so the next layer can use the result.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
} // Closes the current block and marks where its grouped work ends.

export async function updateVendor(actor: VendorActor, id: number, input: VendorUpdateInput) { // Defines `updateVendor` to update vendor, keeping this behavior reusable.
  return prisma.$transaction(async (tx) => { // Returns the database result to the route handler so it can form the API response.
    const existing = await tx.vendor.findUnique({ where: { id } }) // Stores this intermediate `existing` value so later lines can use it.
    if (!existing) throw new AppError('NOT_FOUND', 'Vendor not found.', 404) // Checks whether the value is missing; the block handles that case before continuing.
    const vendor = await tx.vendor.update({ // Stores this intermediate `vendor` value so later lines can use it.
      where: { id }, // Separates this argument or property from the next item in the surrounding call or object.
      data: { // Sets `data` to the values to write to the database.
        ...(input.name === undefined ? {} : { name: input.name }), // Separates this argument or property from the next item in the surrounding call or object.
        ...(input.vendorType === undefined ? {} : { vendorType: input.vendorType as VendorType }), // Separates this argument or property from the next item in the surrounding call or object.
        ...(input.gstin === undefined ? {} : { gstin: input.gstin }), // Separates this argument or property from the next item in the surrounding call or object.
        ...(input.phone === undefined ? {} : { phone: input.phone }), // Separates this argument or property from the next item in the surrounding call or object.
        ...(input.email === undefined ? {} : { email: input.email }), // Separates this argument or property from the next item in the surrounding call or object.
        ...(input.contactPerson === undefined ? {} : { contactPerson: input.contactPerson }), // Separates this argument or property from the next item in the surrounding call or object.
        ...(input.address === undefined ? {} : { address: input.address }), // Separates this argument or property from the next item in the surrounding call or object.
      }, // Closes the current call, object, or collection so the surrounding expression can continue.
    }) // Closes the current call, object, or collection so the surrounding expression can continue.
    await tx.auditLog.create({ // Waits for this asynchronous operation to finish before using its result.
      data: { // Sets `data` to the values to write to the database.
        userId: actor.id, // Separates this argument or property from the next item in the surrounding call or object.
        action: 'UPDATE', // Separates this argument or property from the next item in the surrounding call or object.
        entityType: 'Vendor', // Separates this argument or property from the next item in the surrounding call or object.
        entityId: id, // Separates this argument or property from the next item in the surrounding call or object.
        oldValues: { id: existing.id, name: existing.name, vendorType: existing.vendorType, isActive: existing.isActive }, // Separates this argument or property from the next item in the surrounding call or object.
        newValues: { id: vendor.id, name: vendor.name, vendorType: vendor.vendorType, isActive: vendor.isActive }, // Separates this argument or property from the next item in the surrounding call or object.
      }, // Closes the current call, object, or collection so the surrounding expression can continue.
    }) // Closes the current call, object, or collection so the surrounding expression can continue.
    return vendor // Returns `vendor` to the caller so the next layer can use the result.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
} // Closes the current block and marks where its grouped work ends.

export async function deactivateVendor(actor: VendorActor, id: number) { // Defines `deactivateVendor` to deactivate vendor, keeping this behavior reusable.
  return prisma.$transaction(async (tx) => { // Returns the database result to the route handler so it can form the API response.
    const existing = await tx.vendor.findUnique({ where: { id } }) // Stores this intermediate `existing` value so later lines can use it.
    if (!existing) throw new AppError('NOT_FOUND', 'Vendor not found.', 404) // Checks whether the value is missing; the block handles that case before continuing.
    const vendor = await tx.vendor.update({ where: { id }, data: { isActive: false } }) // Stores this intermediate `vendor` value so later lines can use it.
    await tx.auditLog.create({ // Waits for this asynchronous operation to finish before using its result.
      data: { // Sets `data` to the values to write to the database.
        userId: actor.id, // Separates this argument or property from the next item in the surrounding call or object.
        action: 'UPDATE', // Separates this argument or property from the next item in the surrounding call or object.
        entityType: 'Vendor', // Separates this argument or property from the next item in the surrounding call or object.
        entityId: id, // Separates this argument or property from the next item in the surrounding call or object.
        oldValues: { id: existing.id, name: existing.name, isActive: existing.isActive }, // Separates this argument or property from the next item in the surrounding call or object.
        newValues: { id: vendor.id, name: vendor.name, isActive: vendor.isActive }, // Separates this argument or property from the next item in the surrounding call or object.
      }, // Closes the current call, object, or collection so the surrounding expression can continue.
    }) // Closes the current call, object, or collection so the surrounding expression can continue.
    return vendor // Returns `vendor` to the caller so the next layer can use the result.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
} // Closes the current block and marks where its grouped work ends.

async function assertProject(actor: VendorActor, projectId: number) { // Defines `assertProject` to assert project, keeping this behavior reusable.
  const project = await prisma.project.findFirst({ where: { id: projectId, ...projectAccess(actor) }, select: { id: true } }) // Looks up one matching database record and stores it in `project` so its existence or values can be checked.
  if (!project) throw new AppError('NOT_FOUND', 'Project not found.', 404) // Handles a missing database record before later code tries to use it.
} // Closes the current block and marks where its grouped work ends.

export async function listProjectVendors(actor: VendorActor, projectId: number) { // Defines `listProjectVendors` to retrieve a list of project vendors, keeping this behavior reusable.
  await assertProject(actor, projectId) // Waits for this asynchronous operation to finish before using its result.
  return prisma.projectVendorAssignment.findMany({ // Returns the database result to the route handler so it can form the API response.
    where: { projectId, unassignedAt: null }, // Separates this argument or property from the next item in the surrounding call or object.
    include: { vendor: true }, // Separates this argument or property from the next item in the surrounding call or object.
    orderBy: { assignedAt: 'desc' }, // Separates this argument or property from the next item in the surrounding call or object.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
} // Closes the current block and marks where its grouped work ends.

export async function assignVendor(actor: VendorActor, projectId: number, vendorId: number) { // Defines `assignVendor` to assign vendor, keeping this behavior reusable.
  await assertProject(actor, projectId) // Waits for this asynchronous operation to finish before using its result.
  const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } }) // Looks up one matching database record and stores it in `vendor` so its existence or values can be checked.
  if (!vendor) throw new AppError('NOT_FOUND', 'Vendor not found.', 404) // Checks whether the value is missing; the block handles that case before continuing.
  const active = await prisma.projectVendorAssignment.findFirst({ where: { projectId, vendorId, unassignedAt: null } }) // Looks up one matching database record and stores it in `active` so its existence or values can be checked.
  if (active) throw new AppError('CONFLICT', 'Vendor is already assigned to this project.', 409) // Checks whether the supplied values meet this condition; the block handles that case before continuing.
  return prisma.$transaction(async (tx) => { // Returns the database result to the route handler so it can form the API response.
    const assignment = await tx.projectVendorAssignment.create({ data: { projectId, vendorId, assignedById: actor.id }, include: { vendor: true } }) // Stores this intermediate `assignment` value so later lines can use it.
    await tx.auditLog.create({ // Waits for this asynchronous operation to finish before using its result.
      data: { userId: actor.id, action: 'CREATE', entityType: 'ProjectVendorAssignment', entityId: assignment.id, newValues: { projectId, vendorId, assignedAt: assignment.assignedAt.toISOString() } }, // Separates this argument or property from the next item in the surrounding call or object.
    }) // Closes the current call, object, or collection so the surrounding expression can continue.
    return assignment // Returns `assignment` to the caller so the next layer can use the result.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
} // Closes the current block and marks where its grouped work ends.

export async function unassignVendor(actor: VendorActor, projectId: number, vendorId: number) { // Defines `unassignVendor` to unassign vendor, keeping this behavior reusable.
  await assertProject(actor, projectId) // Waits for this asynchronous operation to finish before using its result.
  const assignment = await prisma.projectVendorAssignment.findFirst({ where: { projectId, vendorId, unassignedAt: null } }) // Looks up one matching database record and stores it in `assignment` so its existence or values can be checked.
  if (!assignment) throw new AppError('NOT_FOUND', 'Active vendor assignment not found.', 404) // Checks whether the value is missing; the block handles that case before continuing.
  return prisma.$transaction(async (tx) => { // Returns the database result to the route handler so it can form the API response.
    const updated = await tx.projectVendorAssignment.update({ where: { id: assignment.id }, data: { unassignedAt: new Date() } }) // Converts the supplied date into a JavaScript date value and stores it in `updated` for consistent comparisons.
    await tx.auditLog.create({ // Waits for this asynchronous operation to finish before using its result.
      data: { userId: actor.id, action: 'UPDATE', entityType: 'ProjectVendorAssignment', entityId: updated.id, oldValues: { projectId, vendorId, unassignedAt: null }, newValues: { projectId, vendorId, unassignedAt: updated.unassignedAt?.toISOString() } }, // Separates this argument or property from the next item in the surrounding call or object.
    }) // Closes the current call, object, or collection so the surrounding expression can continue.
    return updated // Returns `updated` to the caller so the next layer can use the result.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
} // Closes the current block and marks where its grouped work ends.
// File purpose: Implements vendors business rules and database operations.
