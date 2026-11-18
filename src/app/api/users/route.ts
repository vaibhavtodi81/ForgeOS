import { db } from '@/lib/db'
import { ok, fail, guardAuth, getClientIp, readJson } from '@/lib/api-helpers'
import { hashPassword } from '@/lib/auth'
import { writeAudit } from '@/lib/audit'
import { ROLES } from '@/lib/forgeos-types'
import type { Role, UserRow } from '@/lib/forgeos-types'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const ACTIVE_PROJECT_STATUSES = ['ACTIVE', 'ON_HOLD']

function toUserRow(
  u: { id: string; name: string; email: string; role: string; isActive: boolean; createdAt: Date },
  activeProjects: number
): UserRow {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role as Role,
    isActive: u.isActive,
    createdAt: u.createdAt.toISOString(),
    activeProjects,
  }
}

export async function GET(req: Request) {
  const auth = await guardAuth(req, ['ADMIN'])
  if (!auth.ok) return auth.response

  const users = await db.user.findMany({
    orderBy: { createdAt: 'asc' },
    include: {
      managedProjects: {
        where: { status: { in: ACTIVE_PROJECT_STATUSES } },
        select: { id: true },
      },
    },
  })

  return ok({ items: users.map((u) => toUserRow(u, u.managedProjects.length)) })
}

export async function POST(req: Request) {
  const auth = await guardAuth(req, ['ADMIN'])
  if (!auth.ok) return auth.response

  const body = await readJson<{ name?: unknown; email?: unknown; password?: unknown; role?: unknown }>(req)
  if (!body) return fail('Invalid request body', 400)

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body.password === 'string' ? body.password : ''
  const role = body.role

  if (name.length < 2) return fail('Name must be at least 2 characters', 400)
  if (!EMAIL_RE.test(email)) return fail('A valid email address is required', 400)
  if (password.length < 8) return fail('Password must be at least 8 characters', 400)
  if (typeof role !== 'string' || !ROLES.includes(role as Role)) {
    return fail(`Role must be one of: ${ROLES.join(', ')}`, 400)
  }

  const existing = await db.user.findUnique({ where: { email } })
  if (existing) return fail('A user with this email already exists', 409)

  const user = await db.user.create({
    data: {
      name,
      email,
      passwordHash: hashPassword(password),
      role,
      isActive: true,
    },
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

  return ok({ user: toUserRow(user, 0) })
}
