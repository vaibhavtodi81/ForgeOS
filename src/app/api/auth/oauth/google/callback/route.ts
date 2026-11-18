import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { SESSION_COOKIE, sessionCookieOptions, signSession } from '@/lib/auth'
import { writeAudit } from '@/lib/audit'
import type { Role, SessionUser } from '@/lib/forgeos-types'

const OAUTH_STATE_COOKIE = 'forgeos_oauth_state'

function readStateCookie(req: Request): string | null {
  const header = req.headers.get('cookie')
  if (!header) return null
  for (const part of header.split(';')) {
    const [k, ...rest] = part.trim().split('=')
    if (k === OAUTH_STATE_COOKIE) return decodeURIComponent(rest.join('='))
  }
  return null
}

function redirectError(req: Request, code: string): NextResponse {
  const res = NextResponse.redirect(new URL(`/?oauth_error=${code}`, req.url))
  res.cookies.set(OAUTH_STATE_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
  return res
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const error = url.searchParams.get('error')
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')

  if (error === 'access_denied') return redirectError(req, 'cancelled')

  const cookieState = readStateCookie(req)
  if (!state || !cookieState || state !== cookieState) {
    return redirectError(req, 'state_mismatch')
  }
  if (!code) return redirectError(req, 'exchange_failed')

  const redirectUri = `${process.env.APP_URL || url.origin}/api/auth/oauth/google/callback`

  let idToken: string | undefined
  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })
    if (!tokenRes.ok) return redirectError(req, 'exchange_failed')
    const tokens = (await tokenRes.json()) as { id_token?: string }
    idToken = tokens.id_token
  } catch (err) {
    console.error('[oauth] token exchange failed:', err)
    return redirectError(req, 'exchange_failed')
  }
  if (!idToken) return redirectError(req, 'exchange_failed')

  let payload: { email?: string; name?: string; sub?: string }
  try {
    payload = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64url').toString())
  } catch (err) {
    console.error('[oauth] id_token decode failed:', err)
    return redirectError(req, 'exchange_failed')
  }

  const email = payload.email?.trim().toLowerCase() ?? ''
  if (!email) return redirectError(req, 'no_email')
  const providerAccountId = payload.sub || email

  let user = await db.user.findUnique({ where: { email } })
  if (user && !user.isActive) return redirectError(req, 'inactive')

  if (!user) {
    const emailPrefix = email.split('@')[0]
    user = await db.user.create({
      data: {
        name: payload.name?.trim() || emailPrefix,
        email,
        passwordHash: '',
        role: 'VIEWER',
        isActive: true,
      },
    })
    await writeAudit({
      action: 'USER_CREATE',
      actorName: 'Google OAuth',
      entityType: 'user',
      entityId: user.id,
      meta: { email, role: 'VIEWER' },
    })
  }

  await db.oAuthAccount.upsert({
    where: { provider_providerAccountId: { provider: 'google', providerAccountId } },
    update: { userId: user.id },
    create: { provider: 'google', providerAccountId, userId: user.id },
  })

  const sessionUser: SessionUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as Role,
  }
  const { token } = await signSession(sessionUser)

  await writeAudit({
    action: 'OAUTH_LOGIN',
    actorId: user.id,
    actorName: user.name,
    entityType: 'user',
    entityId: user.id,
    meta: { provider: 'google' },
  })

  const res = NextResponse.redirect(new URL('/', req.url))
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions())
  res.cookies.set(OAUTH_STATE_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
  return res
}
