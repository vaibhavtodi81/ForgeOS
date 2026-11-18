import { useState, type FormEvent } from 'react'
import { ArrowRight, Eye, EyeOff, KeyRound, LockKeyhole, Mail, ShieldCheck } from 'lucide-react'
import { ApiError, apiPost } from '../../../lib/api'
import { navigate } from '../../../lib/router'
import { saveAccessToken } from '../auth/session'
import { useAuth } from '../auth/useAuth'
import type { AuthUser } from '../auth/session'

type LoginMode = 'password' | 'otp'

interface OtpRequestResult {
  ok: boolean
  delivered: boolean
  expiresInSeconds: number
  devCode?: string
}

interface OtpVerifyResult {
  token: string
  expiresAt: string
  user: AuthUser
}

function errorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === 'INVALID_CREDENTIALS' || error.status === 401) return 'Invalid email or password.'
    return error.message
  }
  return error instanceof Error ? error.message : 'Unable to sign in. Please try again.'
}

function destinationFor(user: AuthUser): string {
  if (user.role === 'ADMIN') return '/app/admin/dashboard'
  if (user.role === 'PM') return '/app/pm/dashboard'
  return '/app/projects'
}

const inputClasses = 'w-full bg-transparent py-4 text-sm text-[#323232] outline-none placeholder:text-[#A59A92]'
const fieldClasses = 'flex items-center gap-3 rounded-xl border border-[#C8BCB4] bg-[#F7F3EE] px-4 transition focus-within:border-[#323232] focus-within:ring-2 focus-within:ring-[#323232]/10'

export function LoginForm() {
  const { login } = useAuth()
  const [mode, setMode] = useState<LoginMode>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [devCode, setDevCode] = useState<string | null>(null)

  const switchMode = (next: LoginMode) => {
    setMode(next)
    setOtpSent(false)
    setOtpCode('')
    setDevCode(null)
    setMessage('')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (mode === 'otp') {
      if (otpSent) void verifyOtp()
      else void sendOtp()
      return
    }

    if (!email.trim() || !password) {
      setMessage('Please enter your email and password.')
      return
    }

    setIsSubmitting(true)
    setMessage('')
    try {
      const user = await login(email.trim(), password, rememberMe)
      navigate(destinationFor(user))
    } catch (error) {
      setMessage(errorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const sendOtp = async () => {
    if (!email.trim()) {
      setMessage('Please enter your email address first.')
      return
    }
    setIsSubmitting(true)
    setMessage('')
    setDevCode(null)
    try {
      const { data } = await apiPost<OtpRequestResult>('/auth/otp/request', { email: email.trim() })
      setOtpSent(true)
      if (!data.delivered && data.devCode) setDevCode(data.devCode)
    } catch (error) {
      setMessage(errorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const verifyOtp = async () => {
    if (!/^\d{6}$/.test(otpCode.trim())) {
      setMessage('Please enter the 6-digit code from your email.')
      return
    }
    setIsSubmitting(true)
    setMessage('')
    try {
      const { data } = await apiPost<OtpVerifyResult>('/auth/otp/verify', {
        email: email.trim(),
        code: otpCode.trim(),
      })
      saveAccessToken(data.token, rememberMe)
      window.location.hash = `#${destinationFor(data.user)}`
      window.location.reload()
    } catch (error) {
      setMessage(errorMessage(error))
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-semibold text-[#323232]">Email address</label>
        <div className={fieldClasses}>
          <Mail size={19} className="shrink-0 text-[#8E827A]" />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => { setEmail(event.target.value); setMessage('') }}
            placeholder="you@company.com"
            autoComplete="email"
            required
            disabled={isSubmitting}
            className={inputClasses}
          />
        </div>
      </div>

      {mode === 'password' ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-semibold text-[#323232]">Password</label>
            <span className="text-xs text-[#8E827A]">Contact your administrator for account help.</span>
          </div>
          <div className={fieldClasses}>
            <LockKeyhole size={19} className="shrink-0 text-[#8E827A]" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => { setPassword(event.target.value); setMessage('') }}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              disabled={isSubmitting}
              className={inputClasses}
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="text-[#8E827A] hover:text-[#323232]"
            >
              {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
          </div>
        </div>
      ) : otpSent ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="otp-code" className="text-sm font-semibold text-[#323232]">Sign-in code</label>
            <span className="text-xs text-[#8E827A]">Sent to {email.trim()}</span>
          </div>
          <div className={fieldClasses}>
            <KeyRound size={19} className="shrink-0 text-[#8E827A]" />
            <input
              id="otp-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={otpCode}
              onChange={(event) => { setOtpCode(event.target.value.replace(/\D/g, '').slice(0, 6)); setMessage('') }}
              placeholder="6-digit code"
              maxLength={6}
              disabled={isSubmitting}
              className={`${inputClasses} tracking-[0.45em]`}
            />
          </div>
          {devCode && (
            <p className="rounded-xl border border-[#C8BCB4] bg-[#E8DCD4]/60 p-3 text-xs leading-5 text-[#595552]">
              Email delivery is not configured on this server — demo code: <span className="font-semibold">{devCode}</span>
            </p>
          )}
          <button type="button" onClick={() => { setOtpSent(false); setOtpCode(''); setDevCode(null) }} className="text-xs font-semibold text-[#595552] underline underline-offset-2 hover:text-[#323232]">
            Send a new code
          </button>
        </div>
      ) : (
        <p className="rounded-xl border border-[#C8BCB4] bg-[#E8DCD4]/40 p-3 text-xs leading-5 text-[#595552]">
          We will email a 6-digit sign-in code to this address. No password needed.
        </p>
      )}

      <label className="flex cursor-pointer items-center gap-3 text-sm text-[#595552]">
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={(event) => setRememberMe(event.target.checked)}
          className="h-4 w-4 accent-[#323232]"
        />
        Remember me on this device
      </label>

      {message && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm leading-6 text-rose-800">
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="group flex w-full items-center justify-center gap-3 rounded-xl bg-[#323232] px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-[#323232]/10 transition-all hover:-translate-y-0.5 hover:bg-[#1E1E1E] hover:shadow-xl active:translate-y-0 disabled:cursor-wait disabled:opacity-60"
      >
        {mode === 'otp' && !otpSent
          ? (isSubmitting ? 'Sending code…' : 'Send code')
          : mode === 'otp'
            ? (isSubmitting ? 'Verifying…' : 'Verify and sign in')
            : (isSubmitting ? 'Signing in…' : 'Sign in')}
        {!isSubmitting && <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />}
      </button>

      <div className="flex items-center justify-center gap-2 text-xs text-[#8E827A]">
        <ShieldCheck size={15} />
        <span>Secure access to your construction workspace</span>
      </div>

      <div className="relative" aria-hidden="true">
        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-[#C8BCB4]/70" /></div>
        <div className="relative flex justify-center text-xs uppercase tracking-[0.15em]">
          <span className="bg-[#F7F3EE] px-3 text-[#8E827A]">or</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => switchMode(mode === 'password' ? 'otp' : 'password')}
        className="w-full rounded-xl border border-[#C8BCB4] bg-[#F7F3EE] px-5 py-3.5 text-sm font-semibold text-[#323232] transition-all hover:-translate-y-0.5 hover:border-[#323232]"
      >
        {mode === 'password' ? 'Email me a sign-in code' : 'Sign in with password instead'}
      </button>

      <a
        href="/api/auth/oauth/google"
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#C8BCB4] bg-white px-5 py-3.5 text-sm font-semibold text-[#323232] transition-all hover:-translate-y-0.5 hover:border-[#323232]"
      >
        Continue with Google
      </a>
    </form>
  )
}
