import type { Role } from '@prisma/client' // Uses Prisma's generated types and client to work safely with database records.
import { prisma } from '../../utils/prisma.js' // Uses the shared Prisma client to run queries through the server's database connection.
import { AppError } from '../../utils/errors.js' // Uses the shared API error type so failures have a consistent message and HTTP status.

type Actor = { id: number; role: Role } // Defines the `Actor` type so TypeScript can describe the data or behavior used here.

function access(actor: Actor) { // Defines `access` to access, keeping this behavior reusable.
  return actor.role === 'ADMIN' ? {} : { projects: { some: { assignedPmId: actor.id } } } // Returns `actor.role === 'ADMIN' ? {} : { projects: { some: { assignedPmId: actor.id } } }` to the caller so the next layer can use the result.
} // Closes the current block and marks where its grouped work ends.

export async function listLands(actor: Actor, page: number, pageSize: number, search?: string) { // Defines `listLands` to retrieve a list of lands, keeping this behavior reusable.
  const where = { // Builds the database filter so role access, status, and search rules are applied together.
    ...access(actor), // Separates this argument or property from the next item in the surrounding call or object.
    ...(search ? { OR: [{ name: { contains: search, mode: 'insensitive' as const } }, { city: { contains: search, mode: 'insensitive' as const } }] } : {}), // Separates this argument or property from the next item in the surrounding call or object.
  } // Closes the current block and marks where its grouped work ends.
  const [lands, total] = await prisma.$transaction([ // Fetches the page and its matching-record count in one transaction so the response metadata stays consistent; stores both results in `lands,total`.
    prisma.land.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }), // Separates this argument or property from the next item in the surrounding call or object.
    prisma.land.count({ where }), // Separates this argument or property from the next item in the surrounding call or object.
  ]) // Closes the current call, object, or collection so the surrounding expression can continue.
  return { lands, meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } } // Returns the requested data together with pagination or summary metadata for the client.
} // Closes the current block and marks where its grouped work ends.

export async function getLand(actor: Actor, id: number) { // Defines `getLand` to retrieve land, keeping this behavior reusable.
  const land = await prisma.land.findFirst({ where: { id, ...access(actor) } }) // Looks up one matching database record and stores it in `land` so its existence or values can be checked.
  if (!land) throw new AppError('NOT_FOUND', 'Land not found.', 404) // Checks whether the value is missing; the block handles that case before continuing.
  return land // Returns `land` to the caller so the next layer can use the result.
} // Closes the current block and marks where its grouped work ends.

export async function createLand(actor: Actor, input: Record<string, unknown>) { // Defines `createLand` to create land, keeping this behavior reusable.
  return prisma.land.create({ data: { ...input, createdById: actor.id } as never }) // Returns the database result to the route handler so it can form the API response.
} // Closes the current block and marks where its grouped work ends.

export async function updateLand(id: number, input: Record<string, unknown>) { // Defines `updateLand` to update land, keeping this behavior reusable.
  return prisma.land.update({ where: { id }, data: input as never }) // Returns the database result to the route handler so it can form the API response.
} // Closes the current block and marks where its grouped work ends.

export async function deleteLand(id: number) { // Defines `deleteLand` to delete land, keeping this behavior reusable.
  const land = await prisma.land.findUnique({ where: { id }, select: { id: true, _count: { select: { projects: true } } } }) // Looks up one matching database record and stores it in `land` so its existence or values can be checked.
  if (!land) throw new AppError('NOT_FOUND', 'Land not found.', 404) // Checks whether the value is missing; the block handles that case before continuing.
  if (land._count.projects > 0) throw new AppError('BUSINESS_RULE_VIOLATION', 'Land cannot be deleted while projects depend on it.', 409) // Checks whether the supplied values meet this condition; the block handles that case before continuing.
  await prisma.land.delete({ where: { id } }) // Waits for the database to deletes a record in the land table before dependent work continues.
} // Closes the current block and marks where its grouped work ends.
// File purpose: Implements lands business rules and database operations.
