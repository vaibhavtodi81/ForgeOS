import { AuditAction, MilestoneStatus, type Prisma } from '@prisma/client' // Uses Prisma's generated types and client to work safely with database records.
import { prisma } from '../../utils/prisma.js' // Uses the shared Prisma client to run queries through the server's database connection.
import { AppError } from '../../utils/errors.js' // Uses the shared API error type so failures have a consistent message and HTTP status.
import { projectAccess, type ProjectActor } from '../projects/projects.service.js' // Imports { projectAccess, type ProjectActor } from '../projects/projects.service.js' so this module can reuse that functionality.
import type { CreateMilestoneInput, UpdateMilestoneInput } from './milestones.validator.js' // Imports type { CreateMilestoneInput, UpdateMilestoneInput } from './milestones.validator.js' so this module can reuse that functionality.

type MilestoneInput = CreateMilestoneInput | UpdateMilestoneInput // Defines the `MilestoneInput` type so TypeScript can describe the data or behavior used here.

function dateAtUtcMidnight(value: string) { // Defines `dateAtUtcMidnight` to convert at utc midnight, keeping this behavior reusable.
  return new Date(`${value}T00:00:00.000Z`) // Returns `new Date(`${value}T00:00:00.000Z`)` to the caller so the next layer can use the result.
} // Closes the current block and marks where its grouped work ends.

async function assertProjectAccess(actor: ProjectActor, projectId: number) { // Defines `assertProjectAccess` to assert project access, keeping this behavior reusable.
  const project = await prisma.project.findFirst({ // Looks up one matching database record and stores it in `project` so its existence or values can be checked.
    where: { id: projectId, ...projectAccess(actor) }, // Separates this argument or property from the next item in the surrounding call or object.
    select: { id: true }, // Separates this argument or property from the next item in the surrounding call or object.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
  if (!project) throw new AppError('NOT_FOUND', 'Project not found.', 404) // Handles a missing database record before later code tries to use it.
} // Closes the current block and marks where its grouped work ends.

async function getMilestoneForActor(actor: ProjectActor, id: number) { // Defines `getMilestoneForActor` to retrieve milestone for actor, keeping this behavior reusable.
  const milestone = await prisma.projectMilestone.findUnique({ // Looks up one matching database record and stores it in `milestone` so its existence or values can be checked.
    where: { id }, // Separates this argument or property from the next item in the surrounding call or object.
    include: { project: { select: { id: true, code: true, name: true } } }, // Separates this argument or property from the next item in the surrounding call or object.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
  if (!milestone) throw new AppError('NOT_FOUND', 'Milestone not found.', 404) // Checks whether the value is missing; the block handles that case before continuing.
  await assertProjectAccess(actor, milestone.projectId) // Waits for this asynchronous operation to finish before using its result.
  return milestone // Returns `milestone` to the caller so the next layer can use the result.
} // Closes the current block and marks where its grouped work ends.

function validateDateRanges(input: { // Defines `validateDateRanges` to check date ranges, keeping this behavior reusable.
  plannedStartDate?: Date | null // Provides `plannedStartDate?: Date | null` as part of validate date ranges.
  plannedEndDate?: Date | null // Provides `plannedEndDate?: Date | null` as part of validate date ranges.
  actualStartDate?: Date | null // Provides `actualStartDate?: Date | null` as part of validate date ranges.
  actualEndDate?: Date | null // Provides `actualEndDate?: Date | null` as part of validate date ranges.
}) { // Opens the object or callback body that groups the settings for this operation.
  if (input.plannedStartDate && input.plannedEndDate && input.plannedEndDate < input.plannedStartDate) { // Checks whether the supplied values meet this condition; the block handles that case before continuing.
    throw new AppError('VALIDATION_ERROR', 'Planned end date must be on or after planned start date.', 400) // Stops this request with `VALIDATION_ERROR` and HTTP 400 so the client receives a clear failure.
  } // Closes the current block and marks where its grouped work ends.
  if (input.actualStartDate && input.actualEndDate && input.actualEndDate < input.actualStartDate) { // Checks whether the supplied values meet this condition; the block handles that case before continuing.
    throw new AppError('VALIDATION_ERROR', 'Actual end date must be on or after actual start date.', 400) // Stops this request with `VALIDATION_ERROR` and HTTP 400 so the client receives a clear failure.
  } // Closes the current block and marks where its grouped work ends.
} // Closes the current block and marks where its grouped work ends.

function dateValue(value: string | null | undefined) { // Defines `dateValue` to convert value, keeping this behavior reusable.
  return value === undefined || value === null ? value : dateAtUtcMidnight(value) // Returns `value === undefined || value === null ? value : dateAtUtcMidnight(value)` to the caller so the next layer can use the result.
} // Closes the current block and marks where its grouped work ends.

function createData(input: CreateMilestoneInput) { // Defines `createData` to create data, keeping this behavior reusable.
  const data = { // Stores this intermediate `data` value so later lines can use it.
    name: input.name, // Separates this argument or property from the next item in the surrounding call or object.
    description: input.description, // Separates this argument or property from the next item in the surrounding call or object.
    sequence: input.sequence, // Separates this argument or property from the next item in the surrounding call or object.
    plannedStartDate: dateValue(input.plannedStartDate), // Separates this argument or property from the next item in the surrounding call or object.
    plannedEndDate: dateValue(input.plannedEndDate), // Separates this argument or property from the next item in the surrounding call or object.
    actualStartDate: dateValue(input.actualStartDate), // Separates this argument or property from the next item in the surrounding call or object.
    actualEndDate: dateValue(input.actualEndDate), // Separates this argument or property from the next item in the surrounding call or object.
    status: input.status as MilestoneStatus, // Separates this argument or property from the next item in the surrounding call or object.
    progressPercent: input.progressPercent, // Separates this argument or property from the next item in the surrounding call or object.
  } // Closes the current block and marks where its grouped work ends.
  validateDateRanges(data) // Provides `validateDateRanges(data)` as part of create data.
  return data // Returns `data` to the caller so the next layer can use the result.
} // Closes the current block and marks where its grouped work ends.

function snapshot(milestone: { // Defines `snapshot` to snapshot, keeping this behavior reusable.
  id: number // Sets `id` to the unique database identifier.
  projectId: number // Sets `projectId` to the project this record belongs to.
  name: string // Sets `name` to the human-readable name.
  description: string | null // Sets `description` to optional details for readers.
  sequence: number // Sets `sequence` to the sequence value.
  plannedStartDate: Date | null // Sets `plannedStartDate` to the planned start date value.
  plannedEndDate: Date | null // Sets `plannedEndDate` to the planned end date value.
  actualStartDate: Date | null // Sets `actualStartDate` to the actual start date value.
  actualEndDate: Date | null // Sets `actualEndDate` to the date work was actually completed.
  status: MilestoneStatus // Sets `status` to the record's current workflow state.
  progressPercent: Prisma.Decimal // Sets `progressPercent` to the project's reported completion percentage.
  createdAt: Date // Sets `createdAt` to when the record was first created.
  updatedAt: Date // Sets `updatedAt` to when the record was last changed.
}): Prisma.InputJsonValue { // Opens the object or callback body that groups the settings for this operation.
  return { // Returns the assembled result object so the caller receives the fields it needs.
    id: milestone.id, // Separates this argument or property from the next item in the surrounding call or object.
    projectId: milestone.projectId, // Separates this argument or property from the next item in the surrounding call or object.
    name: milestone.name, // Separates this argument or property from the next item in the surrounding call or object.
    description: milestone.description, // Separates this argument or property from the next item in the surrounding call or object.
    sequence: milestone.sequence, // Separates this argument or property from the next item in the surrounding call or object.
    plannedStartDate: milestone.plannedStartDate?.toISOString() ?? null, // Separates this argument or property from the next item in the surrounding call or object.
    plannedEndDate: milestone.plannedEndDate?.toISOString() ?? null, // Separates this argument or property from the next item in the surrounding call or object.
    actualStartDate: milestone.actualStartDate?.toISOString() ?? null, // Separates this argument or property from the next item in the surrounding call or object.
    actualEndDate: milestone.actualEndDate?.toISOString() ?? null, // Separates this argument or property from the next item in the surrounding call or object.
    status: milestone.status, // Separates this argument or property from the next item in the surrounding call or object.
    progressPercent: milestone.progressPercent.toString(), // Separates this argument or property from the next item in the surrounding call or object.
    createdAt: milestone.createdAt.toISOString(), // Separates this argument or property from the next item in the surrounding call or object.
    updatedAt: milestone.updatedAt.toISOString(), // Separates this argument or property from the next item in the surrounding call or object.
  } // Closes the current block and marks where its grouped work ends.
} // Closes the current block and marks where its grouped work ends.

function changedSnapshot( // Defines `changedSnapshot` to changed snapshot, keeping this behavior reusable.
  existing: Awaited<ReturnType<typeof getMilestoneForActor>>, // Separates this argument or property from the next item in the surrounding call or object.
  input: UpdateMilestoneInput, // Separates this argument or property from the next item in the surrounding call or object.
  updated: Awaited<ReturnType<typeof getMilestoneForActor>>, // Separates this argument or property from the next item in the surrounding call or object.
) { // Opens the object or callback body that groups the settings for this operation.
  const oldData: Record<string, unknown> = { projectId: existing.projectId } // Stores this intermediate `unknown>` value so later lines can use it.
  const newData: Record<string, unknown> = { projectId: updated.projectId } // Stores this intermediate `unknown>` value so later lines can use it.
  for (const key of Object.keys(input) as (keyof UpdateMilestoneInput)[]) { // Repeats the block for each `key` in `Object.keys(input` so every item is processed.
    oldData[key] = (snapshot(existing) as Record<string, unknown>)[key] // Provides `oldData[key] = (snapshot(existing) as Record<string, unknown>)[key]` as part of changed snapshot.
    newData[key] = (snapshot(updated) as Record<string, unknown>)[key] // Provides `newData[key] = (snapshot(updated) as Record<string, unknown>)[key]` as part of changed snapshot.
  } // Closes the current block and marks where its grouped work ends.
  return { oldData: oldData as Prisma.InputJsonValue, newData: newData as Prisma.InputJsonValue } // Returns the assembled result object so the caller receives the fields it needs.
} // Closes the current block and marks where its grouped work ends.

export async function createMilestone(actor: ProjectActor, projectId: number, input: CreateMilestoneInput) { // Defines `createMilestone` to create milestone, keeping this behavior reusable.
  await assertProjectAccess(actor, projectId) // Waits for this asynchronous operation to finish before using its result.
  const data = createData(input) // Stores this intermediate `data` value so later lines can use it.
  return prisma.$transaction(async (tx) => { // Returns the database result to the route handler so it can form the API response.
    const milestone = await tx.projectMilestone.create({ // Stores this intermediate `milestone` value so later lines can use it.
      data: { ...data, projectId }, // Separates this argument or property from the next item in the surrounding call or object.
      include: { project: { select: { id: true, code: true, name: true } } }, // Separates this argument or property from the next item in the surrounding call or object.
    }) // Closes the current call, object, or collection so the surrounding expression can continue.
    await tx.auditLog.create({ // Waits for this asynchronous operation to finish before using its result.
      data: { // Sets `data` to the values to write to the database.
        userId: actor.id, // Separates this argument or property from the next item in the surrounding call or object.
        action: AuditAction.CREATE, // Separates this argument or property from the next item in the surrounding call or object.
        entityType: 'ProjectMilestone', // Separates this argument or property from the next item in the surrounding call or object.
        entityId: milestone.id, // Separates this argument or property from the next item in the surrounding call or object.
        newValues: snapshot(milestone), // Separates this argument or property from the next item in the surrounding call or object.
      }, // Closes the current call, object, or collection so the surrounding expression can continue.
    }) // Closes the current call, object, or collection so the surrounding expression can continue.
    return milestone // Returns `milestone` to the caller so the next layer can use the result.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
} // Closes the current block and marks where its grouped work ends.

export async function listMilestones(actor: ProjectActor, projectId: number) { // Defines `listMilestones` to retrieve a list of milestones, keeping this behavior reusable.
  await assertProjectAccess(actor, projectId) // Waits for this asynchronous operation to finish before using its result.
  return prisma.projectMilestone.findMany({ // Returns the database result to the route handler so it can form the API response.
    where: { projectId }, // Separates this argument or property from the next item in the surrounding call or object.
    orderBy: [{ sequence: 'asc' }, { plannedStartDate: 'asc' }, { id: 'asc' }], // Separates this argument or property from the next item in the surrounding call or object.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
} // Closes the current block and marks where its grouped work ends.

export async function getMilestone(actor: ProjectActor, id: number) { // Defines `getMilestone` to retrieve milestone, keeping this behavior reusable.
  return getMilestoneForActor(actor, id) // Returns `getMilestoneForActor(actor, id)` to the caller so the next layer can use the result.
} // Closes the current block and marks where its grouped work ends.

export async function updateMilestone(actor: ProjectActor, id: number, input: UpdateMilestoneInput) { // Defines `updateMilestone` to update milestone, keeping this behavior reusable.
  const existing = await getMilestoneForActor(actor, id) // Stores this intermediate `existing` value so later lines can use it.
  const data = Object.fromEntries(Object.entries(input).map(([key, value]) => [ // Transforms the object's entries into the `data` result shape expected by the caller.
    key, // Separates this argument or property from the next item in the surrounding call or object.
    key.endsWith('Date') ? dateValue(value as string | null | undefined) : value, // Separates this argument or property from the next item in the surrounding call or object.
  ])) // Provides `]))` as part of update milestone.
  const merged: { // Stores this intermediate `this value` value so later lines can use it.
    plannedStartDate: Date | null // Sets `plannedStartDate` to the planned start date value.
    plannedEndDate: Date | null // Sets `plannedEndDate` to the planned end date value.
    actualStartDate: Date | null // Sets `actualStartDate` to the actual start date value.
    actualEndDate: Date | null // Sets `actualEndDate` to the date work was actually completed.
  } = { // Opens the object or callback body that groups the settings for this operation.
    plannedStartDate: data.plannedStartDate === undefined ? existing.plannedStartDate : data.plannedStartDate as Date | null, // Separates this argument or property from the next item in the surrounding call or object.
    plannedEndDate: data.plannedEndDate === undefined ? existing.plannedEndDate : data.plannedEndDate as Date | null, // Separates this argument or property from the next item in the surrounding call or object.
    actualStartDate: data.actualStartDate === undefined ? existing.actualStartDate : data.actualStartDate as Date | null, // Separates this argument or property from the next item in the surrounding call or object.
    actualEndDate: data.actualEndDate === undefined ? existing.actualEndDate : data.actualEndDate as Date | null, // Separates this argument or property from the next item in the surrounding call or object.
  } // Closes the current block and marks where its grouped work ends.
  validateDateRanges(merged) // Provides `validateDateRanges(merged)` as part of update milestone.
  return prisma.$transaction(async (tx) => { // Returns the database result to the route handler so it can form the API response.
    const updated = await tx.projectMilestone.update({ // Stores this intermediate `updated` value so later lines can use it.
      where: { id }, // Separates this argument or property from the next item in the surrounding call or object.
      data: data as Prisma.ProjectMilestoneUpdateInput, // Separates this argument or property from the next item in the surrounding call or object.
      include: { project: { select: { id: true, code: true, name: true } } }, // Separates this argument or property from the next item in the surrounding call or object.
    }) // Closes the current call, object, or collection so the surrounding expression can continue.
    const changes = changedSnapshot(existing, input, updated) // Stores this intermediate `changes` value so later lines can use it.
    await tx.auditLog.create({ // Waits for this asynchronous operation to finish before using its result.
      data: { // Sets `data` to the values to write to the database.
        userId: actor.id, // Separates this argument or property from the next item in the surrounding call or object.
        action: AuditAction.UPDATE, // Separates this argument or property from the next item in the surrounding call or object.
        entityType: 'ProjectMilestone', // Separates this argument or property from the next item in the surrounding call or object.
        entityId: id, // Separates this argument or property from the next item in the surrounding call or object.
        oldValues: changes.oldData, // Separates this argument or property from the next item in the surrounding call or object.
        newValues: changes.newData, // Separates this argument or property from the next item in the surrounding call or object.
      }, // Closes the current call, object, or collection so the surrounding expression can continue.
    }) // Closes the current call, object, or collection so the surrounding expression can continue.
    return updated // Returns `updated` to the caller so the next layer can use the result.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
} // Closes the current block and marks where its grouped work ends.

export async function deleteMilestone(actor: ProjectActor, id: number) { // Defines `deleteMilestone` to delete milestone, keeping this behavior reusable.
  const existing = await getMilestoneForActor(actor, id) // Stores this intermediate `existing` value so later lines can use it.
  await prisma.$transaction(async (tx) => { // Opens the function, callback, or control-flow block that groups the related statements.
    await tx.projectMilestone.delete({ where: { id } }) // Waits for this asynchronous operation to finish before using its result.
    await tx.auditLog.create({ // Waits for this asynchronous operation to finish before using its result.
      data: { // Sets `data` to the values to write to the database.
        userId: actor.id, // Separates this argument or property from the next item in the surrounding call or object.
        action: AuditAction.DELETE, // Separates this argument or property from the next item in the surrounding call or object.
        entityType: 'ProjectMilestone', // Separates this argument or property from the next item in the surrounding call or object.
        entityId: id, // Separates this argument or property from the next item in the surrounding call or object.
        oldValues: snapshot(existing), // Separates this argument or property from the next item in the surrounding call or object.
      }, // Closes the current call, object, or collection so the surrounding expression can continue.
    }) // Closes the current call, object, or collection so the surrounding expression can continue.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
} // Closes the current block and marks where its grouped work ends.
// File purpose: Implements milestones business rules and database operations.
