import { ok, guardAuth, getClientIp } from '@/lib/api-helpers'
import { SESSION_COOKIE, sessionCookieOptions } from '@/lib/auth'
import { writeAudit } from '@/lib/audit'

export async function POST(req: Request) {
  const auth = await guardAuth(req)
  if (!auth.ok) return auth.response

  const res = ok({ ok: true })
  res.cookies.set(SESSION_COOKIE, '', sessionCookieOptions(0))

  await writeAudit({
    action: 'LOGOUT',
    actorId: auth.user.id,
    actorName: auth.user.name,
    ip: getClientIp(req),
  })
  return res
}
