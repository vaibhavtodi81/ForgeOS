import { db } from '@/lib/db'
import { ok, fail, guardAuth, getClientIp, readJson } from '@/lib/api-helpers'
import { hashPassword, verifyPassword } from '@/lib/auth'
import { writeAudit } from '@/lib/audit'

export async function POST(req: Request) {
  const auth = await guardAuth(req)
  if (!auth.ok) return auth.response

  const body = await readJson<{ currentPassword?: unknown; newPassword?: unknown }>(req)
  if (!body) return fail('Invalid request body', 400)
  if (typeof body.currentPassword !== 'string' || typeof body.newPassword !== 'string') {
    return fail('Current and new passwords are required', 400)
  }

  const user = await db.user.findUnique({ where: { id: auth.user.id } })
  if (!user) return fail('Not authenticated', 401)

  if (!verifyPassword(body.currentPassword, user.passwordHash)) {
    return fail('Current password is incorrect', 401)
  }
  if (body.newPassword.length < 8) {
    return fail('New password must be at least 8 characters', 400)
  }

  await db.user.update({
    where: { id: user.id },
    data: { passwordHash: hashPassword(body.newPassword) },
  })

  await writeAudit({
    action: 'PASSWORD_CHANGE',
    actorId: user.id,
    actorName: user.name,
    entityType: 'user',
    entityId: user.id,
    ip: getClientIp(req),
  })
  return ok({ ok: true })
}
