import type { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { fail, getClientIp, guardAuth, ok, optString, pageMeta, parsePagination, readJson } from '@/lib/api-helpers'
import { hashPassword } from '@/lib/auth'
import { writeAudit } from '@/lib/audit'
import { INVITE_ROLES, ROLES } from '@/lib/forgeos-types'
import type { Role } from '@/lib/forgeos-types'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type UserWithCount = Prisma.UserGetPayload<{ include: { _count: { select: { managedProjects: true } } } }>

function toUserRow(u: UserWithCount) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role as Role,
    phone: u.phone,
    isActive: u.isActive,
    createdAt: u.createdAt.toISOString(),
    updatedAt: u.updatedAt.toISOString(),
    managedProjects: u._count.managedProjects,
  }
}

export async function GET(req: Request) {
  const auth = await guardAuth(req, ['ADMIN'])
  if (!auth.ok) return auth.response

  const url = new URL(req.url)
  const { page, limit, offset } = parsePagination(url, 20)
  const search = url.searchParams.get('search')?.trim()

  const where: Prisma.UserWhereInput = search
    ? { OR: [{ name: { contains: search } }, { email: { contains: search } }] }
    : {}

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      skip: offset,
      take: limit,
      include: { _count: { select: { managedProjects: true } } },
    }),
    db.user.count({ where }),
  ])

  return ok(users.map(toUserRow), pageMeta(page, limit, total))
}

export async function POST(req: Request) {
  const auth = await guardAuth(req, ['ADMIN'])
  if (!auth.ok) return auth.response

  const body = await readJson<Record<string, unknown>>(req)
  if (!body) return fail('Invalid request body', 400)

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body.password === 'string' ? body.password : ''
  const role = body.role
  const phone = optString(body.phone)

  if (name.length < 2) return fail('Name must be at least 2 characters', 400)
  if (!EMAIL_RE.test(email)) return fail('A valid email address is required', 400)
  if (password.length < 8) return fail('Password must be at least 8 characters', 400)
  if (typeof role !== 'string' || !ROLES.includes(role as Role) || !INVITE_ROLES.includes(role as Role)) {
    return fail(`Role must be one of: ${INVITE_ROLES.join(', ')}`, 400)
  }

  const existing = await db.user.findUnique({ where: { email } })
  if (existing) return fail('A user with this email already exists', 409)

  const user = await db.user.create({
    data: { name, email, passwordHash: hashPassword(password), role, phone, isActive: true },
    include: { _count: { select: { managedProjects: true } } },
  })

  await writeAudit({
    action: 'USER_CREATE',
    actorId: auth.user.id,
    actorName: auth.user.name,
    entityType: 'user',
    entityId: user.id,
    meta: { email, role },
    ip: getClientIp(req),
  })

  return ok(toUserRow(user))
}
