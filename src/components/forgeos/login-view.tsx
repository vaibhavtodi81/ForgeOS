'use client'

import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Flame, Loader2, LogIn, Mail, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { api, ApiError } from '@/lib/client-api'
import type { LoginResponse, OtpRequestResponse, SessionUser } from '@/lib/forgeos-types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  not_configured:
    'Google sign-in is not configured yet. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env to enable it.',
  cancelled: 'Google sign-in was cancelled.',
  inactive: 'This Google account is deactivated. Contact an administrator.',
  state_mismatch: 'Sign-in session expired. Please try again.',
  no_email: 'Google did not return an email address for this account.',
  exchange_failed: 'Could not verify the Google sign-in. Please try again.',
}

export function LoginView({ onAuthenticated }: { onAuthenticated: (user: SessionUser) => void }) {
  const queryClient = useQueryClient()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const oauthError = params.get('oauth_error')
    if (oauthError) {
      const message = OAUTH_ERROR_MESSAGES[oauthError] ?? 'Google sign-in failed. Please try again.'
      toast.error(message)
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl border bg-card shadow-lg md:grid-cols-2">
          {/* Brand panel */}
          <div className="relative hidden flex-col justify-between bg-sidebar p-10 text-sidebar-foreground md:flex">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Flame className="h-5 w-5" aria-hidden />
                </div>
                <span className="text-lg font-semibold tracking-tight">ForgeOS</span>
              </div>
              <h2 className="mt-10 text-2xl font-semibold leading-snug">
                Run every site, every rupee, on one platform.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-sidebar-foreground/70">
                Project and financial control for Indian builders — budgets, material plans, wastage,
                inventory, billing and a full audit trail.
              </p>
            </div>
            <ul className="space-y-3 text-sm text-sidebar-foreground/80">
              {[
                'Live portfolio dashboards for owners and PMs',
                'Material plans with wastage allowances vs actual burn',
                'GST invoicing, payments and receivables tracking',
                'Every action logged in an immutable audit trail',
              ].map((line) => (
                <li key={line} className="flex items-start gap-2.5">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                  {line}
                </li>
              ))}
            </ul>
          </div>

          {/* Form panel */}
          <div className="p-6 sm:p-10">
            <div className="mb-6 flex items-center gap-2.5 md:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Flame className="h-5 w-5" aria-hidden />
              </div>
              <span className="text-lg font-semibold tracking-tight">ForgeOS</span>
            </div>

            <Tabs defaultValue="password">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="password">Password</TabsTrigger>
                <TabsTrigger value="otp">Email OTP</TabsTrigger>
              </TabsList>
              <TabsContent value="password" className="mt-6">
                <PasswordForm onAuthenticated={onAuthenticated} />
              </TabsContent>
              <TabsContent value="otp" className="mt-6">
                <OtpForm onAuthenticated={onAuthenticated} />
              </TabsContent>
            </Tabs>

            <div className="my-6 flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">or</span>
              <Separator className="flex-1" />
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                window.location.href = '/api/auth/oauth/google'
              }}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Continue with Google
            </Button>
            <p className="mt-3 text-center text-[11px] leading-relaxed text-muted-foreground">
              Requires GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET in the server environment.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t bg-card px-4 py-3 text-center text-xs text-muted-foreground">
        ForgeOS — Project &amp; financial management for Indian builders
      </footer>
    </div>
  )

  function finishLogin(data: LoginResponse) {
    queryClient.setQueryData(['me'], { user: data.user })
    toast.success(`Welcome back, ${data.user.name.split(' ')[0]}`)
    onAuthenticated(data.user)
  }

  function PasswordForm({ onAuthenticated }: { onAuthenticated: (user: SessionUser) => void }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function submit(e: React.FormEvent) {
      e.preventDefault()
      setError(null)
      if (!email.trim() || !password) {
        setError('Enter your email and password.')
        return
      }
      setLoading(true)
      try {
        const data = await api<LoginResponse>('/api/auth/login', {
          method: 'POST',
          body: { email: email.trim().toLowerCase(), password },
        })
        finishLogin(data)
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Login failed. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    return (
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="login-email">Email</Label>
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="you@company.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="login-password">Password</Label>
          <Input
            id="login-password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>
        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <LogIn aria-hidden />}
          Sign in
        </Button>
        <div className="rounded-md border bg-muted/60 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">Demo:</span> admin@forgeos.local / ForgeOS2026
          <span className="block">
            PM: riya@forgeos.local · Accountant: vinayak@forgeos.local · Viewer: aisha@forgeos.local
          </span>
        </div>
      </form>
    )
  }

  function OtpForm({ onAuthenticated }: { onAuthenticated: (user: SessionUser) => void }) {
    const [email, setEmail] = useState('')
    const [code, setCode] = useState('')
    const [stage, setStage] = useState<'email' | 'code'>('email')
    const [sending, setSending] = useState(false)
    const [verifying, setVerifying] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [devCode, setDevCode] = useState<string | null>(null)
    const [delivered, setDelivered] = useState(false)

    async function requestCode(e: React.FormEvent) {
      e.preventDefault()
      setError(null)
      if (!email.trim()) {
        setError('Enter your email first.')
        return
      }
      setSending(true)
      try {
        const res = await api<OtpRequestResponse>('/api/auth/otp/request', {
          method: 'POST',
          body: { email: email.trim().toLowerCase() },
        })
        setDelivered(res.delivered)
        setDevCode(res.devCode ?? null)
        setStage('code')
        if (res.delivered) {
          toast.success(`Verification code sent to ${email.trim()}`)
        } else {
          toast.info('Email delivery is not configured — the code is shown below (dev mode).')
        }
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Could not send the code. Try again.')
      } finally {
        setSending(false)
      }
    }

    async function verify(e?: React.FormEvent) {
      e?.preventDefault()
      setError(null)
      if (code.length !== 6) {
        setError('Enter the 6-digit code from your email.')
        return
      }
      setVerifying(true)
      try {
        const data = await api<LoginResponse>('/api/auth/otp/verify', {
          method: 'POST',
          body: { email: email.trim().toLowerCase(), code },
        })
        finishLogin(data)
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Verification failed. Try again.')
      } finally {
        setVerifying(false)
      }
    }

    if (stage === 'email') {
      return (
        <form onSubmit={requestCode} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="otp-email">Email</Label>
            <Input
              id="otp-email"
              type="email"
              autoComplete="email"
              placeholder="you@company.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={sending}
            />
          </div>
          {error ? (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          ) : null}
          <Button type="submit" className="w-full" disabled={sending}>
            {sending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Mail aria-hidden />}
            Send verification code
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            We&apos;ll email a 6-digit code via Gmail SMTP (app password).
          </p>
        </form>
      )
    }

    return (
      <form onSubmit={verify} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="otp-code">Verification code</Label>
          <p className="text-xs text-muted-foreground">
            {delivered ? (
              <>Sent to <span className="font-medium text-foreground">{email}</span></>
            ) : (
              <>For <span className="font-medium text-foreground">{email}</span></>
            )}
          </p>
          <div className="flex justify-center pt-1">
            <InputOTP maxLength={6} value={code} onChange={setCode} disabled={verifying} autoFocus>
              <InputOTPGroup>
                {Array.from({ length: 6 }).map((_, i) => (
                  <InputOTPSlot key={i} index={i} className="h-11 w-10 text-base" />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
        </div>
        {devCode ? (
          <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
            <span className="font-medium">Dev mode:</span> Gmail SMTP isn&apos;t configured
            (SMTP_USER / SMTP_PASS). Your code is{' '}
            <span className="font-mono text-base font-bold tracking-widest">{devCode}</span>
          </div>
        ) : null}
        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" className="w-full" disabled={verifying || code.length !== 6}>
          {verifying ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <ShieldCheck aria-hidden />}
          Verify &amp; sign in
        </Button>
        <button
          type="button"
          className="w-full text-center text-xs text-muted-foreground underline-offset-4 hover:underline"
          onClick={() => {
            setStage('email')
            setCode('')
            setDevCode(null)
            setError(null)
          }}
          disabled={verifying}
        >
          Use a different email or resend
        </button>
      </form>
    )
  }
}
