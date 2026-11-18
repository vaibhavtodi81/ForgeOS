import { db } from '@/lib/db'
import { fail, guardAuth, ok } from '@/lib/api-helpers'
import type { Role } from '@/lib/forgeos-types'

export async function GET(req: Request) {
  const auth = await guardAuth(req)
  if (!auth.ok) return auth.response

  const user = await db.user.findUnique({ where: { id: auth.user.id } })
  if (!user) return fail('Not authenticated', 401)
  if (!user.isActive) return fail('Your account has been deactivated', 403)

  return ok({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as Role,
    phone: user.phone,
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  })
}
