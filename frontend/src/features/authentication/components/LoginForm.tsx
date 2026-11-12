import { useState, type FormEvent } from 'react'
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-react'
import { ApiError } from '../../../lib/api'
import { useAuth } from '../auth/useAuth'

function errorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === 'INVALID_CREDENTIALS' || error.status === 401) return 'Invalid email or password.'
    return error.message
  }
  return error instanceof Error ? error.message : 'Unable to sign in. Please try again.'
}

export function LoginForm() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!email.trim() || !password) {
      setMessage('Please enter your email and password.')
      return
    }

    setIsSubmitting(true)
    setMessage('')
    try {
      const user = await login(email.trim(), password, rememberMe)
      const destination = user.role === 'ADMIN' ? '/app/admin/dashboard' : '/app/pm/dashboard'
      window.history.replaceState({}, '', destination)
      window.dispatchEvent(new PopStateEvent('popstate'))
    } catch (error) {
      setMessage(errorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-semibold text-[#323232]">Email address</label>
        <div className="flex items-center gap-3 rounded-xl border border-[#C8BCB4] bg-[#F7F3EE] px-4 transition focus-within:border-[#323232] focus-within:ring-2 focus-within:ring-[#323232]/10">
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
            className="w-full bg-transparent py-4 text-sm text-[#323232] outline-none placeholder:text-[#A59A92]"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-sm font-semibold text-[#323232]">Password</label>
          <span className="text-xs text-[#8E827A]">Contact your administrator for account help.</span>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-[#C8BCB4] bg-[#F7F3EE] px-4 transition focus-within:border-[#323232] focus-within:ring-2 focus-within:ring-[#323232]/10">
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
            className="w-full bg-transparent py-4 text-sm text-[#323232] outline-none placeholder:text-[#A59A92]"
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
        {isSubmitting ? 'Signing in…' : 'Sign in'}
        {!isSubmitting && <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />}
      </button>

      <div className="flex items-center justify-center gap-2 text-xs text-[#8E827A]">
        <ShieldCheck size={15} />
        <span>Secure access to your construction workspace</span>
      </div>
    </form>
  )
}
