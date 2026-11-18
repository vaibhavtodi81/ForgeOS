import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'

export async function GET(req: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL('/?oauth_error=not_configured', req.url))
  }

  const state = randomBytes(16).toString('hex')
  const redirectUri = `${process.env.APP_URL || new URL(req.url).origin}/api/auth/oauth/google/callback`

  const googleUrl =
    'https://accounts.google.com/o/oauth2/v2/auth?' +
    new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      state,
      access_type: 'online',
      prompt: 'select_account',
    })

  const res = NextResponse.redirect(googleUrl)
  res.cookies.set('forgeos_oauth_state', state, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
  })
  return res
}
