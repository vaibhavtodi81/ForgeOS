import { ok, guardAuth } from '@/lib/api-helpers'

export async function GET(req: Request) {
  const auth = await guardAuth(req)
  if (!auth.ok) return auth.response
  return ok({ user: auth.user })
}
