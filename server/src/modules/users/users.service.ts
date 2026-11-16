import type { Role } from '@prisma/client' // Uses Prisma's generated types and client to work safely with database records.
import { prisma } from '../../utils/prisma.js' // Uses the shared Prisma client to run queries through the server's database connection.
import { AppError } from '../../utils/errors.js' // Uses the shared API error type so failures have a consistent message and HTTP status.
import { hashPassword } from '../../utils/password.js' // Imports { hashPassword } from '../../utils/password.js' so this module can reuse that functionality.
import { safeUser } from '../auth/auth.service.js' // Imports { safeUser } from '../auth/auth.service.js' so this module can reuse that functionality.

type Actor = { id: number; role: Role } // Defines the `Actor` type so TypeScript can describe the data or behavior used here.

export async function listUsers(page: number, pageSize: number, search?: string) { // Defines `listUsers` to retrieve a list of users, keeping this behavior reusable.
  const where = search ? { OR: [{ name: { contains: search, mode: 'insensitive' as const } }, { email: { contains: search, mode: 'insensitive' as const } }] } : {} // Stores this intermediate `where` value so later lines can use it.
  const [users, total] = await prisma.$transaction([ // Fetches the page and its matching-record count in one transaction so the response metadata stays consistent; stores both results in `users,total`.
    prisma.user.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }), // Separates this argument or property from the next item in the surrounding call or object.
    prisma.user.count({ where }), // Separates this argument or property from the next item in the surrounding call or object.
  ]) // Closes the current call, object, or collection so the surrounding expression can continue.
  return { users: users.map(safeUser), meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } } // Returns the requested data together with pagination or summary metadata for the client.
} // Closes the current block and marks where its grouped work ends.

export async function getUser(id: number) { // Defines `getUser` to retrieve user, keeping this behavior reusable.
  const user = await prisma.user.findUnique({ where: { id } }) // Looks up one matching database record and stores it in `user` so its existence or values can be checked.
  if (!user) throw new AppError('NOT_FOUND', 'User not found.', 404) // Handles a missing database record before later code tries to use it.
  return safeUser(user) // Returns `safeUser(user)` to the caller so the next layer can use the result.
} // Closes the current block and marks where its grouped work ends.

export async function createUser(input: { name: string; email: string; password: string; role: Role; phone?: string | null }) { // Defines `createUser` to create user, keeping this behavior reusable.
  const { password, ...userData } = input // Stores this intermediate `this value` value so later lines can use it.
  return safeUser(await prisma.user.create({ // Returns `safeUser(await prisma.user.create({` to the caller so the next layer can use the result.
    data: { ...userData, passwordHash: hashPassword(password), phone: input.phone ?? null }, // Separates this argument or property from the next item in the surrounding call or object.
  })) // Provides `}))` as part of create user.
} // Closes the current block and marks where its grouped work ends.

export async function updateUser(actor: Actor, id: number, input: { name?: string; email?: string; password?: string; role?: Role; phone?: string | null }) { // Defines `updateUser` to update user, keeping this behavior reusable.
  if (actor.id === id && input.role && input.role !== 'ADMIN') { // Checks the caller's role before allowing this role-restricted operation.
    throw new AppError('BUSINESS_RULE_VIOLATION', 'You cannot remove your own administrator role.', 400) // Stops this request with `BUSINESS_RULE_VIOLATION` and HTTP 400 so the client receives a clear failure.
  } // Closes the current block and marks where its grouped work ends.
  const { password, ...rest } = input // Stores this intermediate `this value` value so later lines can use it.
  const data = password ? { ...rest, passwordHash: hashPassword(password) } : rest // Stores this intermediate `data` value so later lines can use it.
  return safeUser(await prisma.user.update({ where: { id }, data })) // Returns `safeUser(await prisma.user.update({ where: { id }, data }))` to the caller so the next layer can use the result.
} // Closes the current block and marks where its grouped work ends.

export async function updateUserStatus(actor: Actor, id: number, isActive: boolean) { // Defines `updateUserStatus` to update user status, keeping this behavior reusable.
  if (actor.id === id && !isActive) throw new AppError('BUSINESS_RULE_VIOLATION', 'You cannot deactivate your own account.', 400) // Rejects an inactive account so deactivated users cannot continue using the API.
  return safeUser(await prisma.user.update({ where: { id }, data: { isActive } })) // Returns `safeUser(await prisma.user.update({ where: { id }, data: { isActive } }))` to the caller so the next layer can use the result.
} // Closes the current block and marks where its grouped work ends.
// File purpose: Implements users business rules and database operations.
