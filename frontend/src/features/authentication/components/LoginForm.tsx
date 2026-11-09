import { useState, type FormEvent } from 'react'
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from 'lucide-react'

type UserRole = 'admin' | 'pm'

type RegisteredUser = {
  id?: string | number
  name?: string
  email?: string
  role?: string
  status?: string
}

export function LoginForm() {
  const [role, setRole] = useState<UserRole>('admin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [message, setMessage] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!email.trim() || !password.trim()) {
      setMessage('Please enter your email and password.')
      return
    }

    let registeredUsers: RegisteredUser[] = []
    try {
      const savedUsers = localStorage.getItem('forgeos_users')
      const parsedUsers = savedUsers ? JSON.parse(savedUsers) : []
      registeredUsers = Array.isArray(parsedUsers) ? parsedUsers : []
    } catch {
      setMessage('Unable to load workspace users. Please try again.')
      return
    }

    const matchedUser = registeredUsers.find((user) =>
      String(user.email || '').trim().toLowerCase() === email.trim().toLowerCase()
    )

    if (matchedUser && String(matchedUser.status).toLowerCase() === 'inactive') {
      setMessage('Your account is inactive. Please contact the administrator.')
      return
    }

    if (matchedUser && matchedUser.status !== 'Active') {
      setMessage('Your account is inactive. Please contact the administrator.')
      return
    }

    const registeredRole = String(matchedUser?.role ?? '').toLowerCase()
    const authenticatedRole: UserRole =
      registeredRole === 'project manager' || registeredRole === 'pm'
        ? 'pm'
        : registeredRole === 'admin' || registeredRole === 'administrator'
          ? 'admin'
          : role

    localStorage.setItem('forgeos_demo_user', JSON.stringify({
      id: matchedUser?.id,
      name: String(matchedUser?.name || '').trim(),
      email: email.trim(),
      role: authenticatedRole,
      rememberMe,
    }))

    window.location.href = '/app'
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="mb-3 block text-sm font-semibold text-[#323232]">
          Sign in as
        </label>

        <div className="grid grid-cols-2 gap-3 rounded-2xl bg-[#F7F3EE] p-1.5">
          <button
            type="button"
            onClick={() => setRole('admin')}
            className={`rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
              role === 'admin'
                ? 'bg-[#323232] text-white shadow-md'
                : 'text-[#7A7470] hover:bg-white'
            }`}
          >
            Administrator
          </button>

          <button
            type="button"
            onClick={() => setRole('pm')}
            className={`rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
              role === 'pm'
                ? 'bg-[#323232] text-white shadow-md'
                : 'text-[#7A7470] hover:bg-white'
            }`}
          >
            Project Manager
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-semibold text-[#323232]">
          Email address
        </label>

        <div className="flex items-center gap-3 rounded-xl border border-[#C8BCB4] bg-[#F7F3EE] px-4 transition focus-within:border-[#323232] focus-within:ring-2 focus-within:ring-[#323232]/10">
          <Mail size={19} className="shrink-0 text-[#8E827A]" />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value)
              setMessage('')
            }}
            placeholder="name@company.com"
            autoComplete="email"
            required
            className="w-full bg-transparent py-4 text-sm text-[#323232] outline-none placeholder:text-[#A59A92]"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-sm font-semibold text-[#323232]">
            Password
          </label>
          <button
            type="button"
            onClick={() =>
              setMessage('Password recovery will be available when authentication is connected.')
            }
            className="text-xs font-semibold text-[#595552] underline-offset-4 hover:underline"
          >
            Forgot password?
          </button>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-[#C8BCB4] bg-[#F7F3EE] px-4 transition focus-within:border-[#323232] focus-within:ring-2 focus-within:ring-[#323232]/10">
          <LockKeyhole size={19} className="shrink-0 text-[#8E827A]" />
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(event) => {
              setPassword(event.target.value)
              setMessage('')
            }}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
            className="w-full bg-transparent py-4 text-sm text-[#323232] outline-none placeholder:text-[#A59A92]"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
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
        <div
          role="status"
          className="rounded-xl border border-[#C8BCB4] bg-[#E8DCD4] p-3 text-sm leading-6 text-[#323232]"
        >
          {message}
        </div>
      )}

      <button
        type="submit"
        className="group flex w-full items-center justify-center gap-3 rounded-xl bg-[#323232] px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-[#323232]/10 transition-all hover:-translate-y-0.5 hover:bg-[#1E1E1E] hover:shadow-xl active:translate-y-0"
      >
        Sign in to ForgeOS
        <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
      </button>

      <div className="flex items-center justify-center gap-2 text-xs text-[#8E827A]">
        <ShieldCheck size={15} />
        <span>Secure workspace access · {role === 'admin' ? 'Administrator' : 'Project Manager'}</span>
      </div>
    </form>
  )
}
