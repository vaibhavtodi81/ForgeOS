import { useState, type FormEvent } from 'react'
import { KeyRound, LogIn } from 'lucide-react'
import { AppShell } from '../../app-shell/components/AppShell'
import { Breadcrumbs } from '../../app-shell/components/Breadcrumbs'
import { useAuth } from '../../authentication/auth/useAuth'
import { ApiError, apiPost } from '../../../lib/api'

const roleLabels: Record<string, string> = {
  ADMIN: 'Admin',
  PM: 'Project Manager',
  VIEWER: 'Viewer',
}

function initialsOf(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join('') || '—'
}

function dateLabel(value?: string | null) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await apiPost<{ ok: boolean }>('/auth/change-password', { currentPassword, newPassword })
}

export function ProfilePage() {
  const { user } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const confirmMismatch = confirmPassword !== '' && confirmPassword !== newPassword
  const canSubmit = currentPassword !== '' && newPassword.length >= 8 && !confirmMismatch && !saving
  const memberSince = dateLabel(user?.createdAt)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSubmit) return
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      await changePassword(currentPassword, newPassword)
      setSuccess('Password updated successfully.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Unable to change the password. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppShell currentPath="/app/profile">
      <div className="mx-auto max-w-4xl p-6 lg:p-10">
        <Breadcrumbs current="Profile" />
        <div className="space-y-6">
          <section className="rounded-2xl border border-[#C8BCB4]/70 bg-white p-6 shadow-sm">
            <h1 className="text-xl font-semibold text-[#323232]">Account</h1>
            {!user ? (
              <p className="mt-6 text-sm text-[#8E827A]">Loading profile…</p>
            ) : (
              <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#323232] text-xl font-semibold text-white" aria-hidden="true">{initialsOf(user.name)}</div>
                <div className="min-w-0 space-y-1">
                  <p className="text-lg font-semibold text-[#323232]">{user.name}</p>
                  <p className="text-sm text-[#595552]">{user.email}</p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="rounded-full bg-[#F1EAF6] px-2.5 py-1 text-xs font-medium text-[#806B96]">{roleLabels[user.role] ?? user.role}</span>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${user.isActive ? 'bg-[#E8EFE5] text-[#617858]' : 'bg-[#F5EDE1] text-[#9A7950]'}`}>{user.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                  <p className="pt-1 text-sm text-[#8E827A]">{user.phone ? `Phone: ${user.phone}` : 'No phone number on file'}{memberSince ? ` · Member since ${memberSince}` : ''}</p>
                </div>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-[#C8BCB4]/70 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-[#323232]"><KeyRound size={19} /> Change Password</h2>
            <p className="mt-1 text-sm text-[#8E827A]">Choose a new password of at least 8 characters. All other sessions keep working.</p>
            <form className="mt-5 space-y-4" onSubmit={(event) => void submit(event)}>
              <label className="block text-sm font-medium text-[#595552]">Current Password<input required type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal outline-none focus:border-[#595552]" /></label>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-[#595552]">New Password (min 8 characters)<input required minLength={8} type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal outline-none focus:border-[#595552]" /></label>
                <label className="block text-sm font-medium text-[#595552]">Confirm New Password<input required type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal outline-none focus:border-[#595552]" /></label>
              </div>
              {confirmMismatch && <p role="alert" className="rounded-xl bg-[#F8ECEA] px-4 py-3 text-sm text-[#9B625A]">The confirmation does not match the new password.</p>}
              {newPassword !== '' && newPassword.length < 8 && <p role="alert" className="rounded-xl bg-[#F5EDE1] px-4 py-3 text-sm text-[#9A7950]">The new password must be at least 8 characters.</p>}
              {error && <p role="alert" className="rounded-xl bg-[#F8ECEA] px-4 py-3 text-sm text-[#9B625A]">{error}</p>}
              {success && <p role="status" className="rounded-xl bg-[#E8EFE5] px-4 py-3 text-sm text-[#617858]">{success}</p>}
              <button disabled={!canSubmit} type="submit" className="inline-flex items-center gap-2 rounded-xl bg-[#323232] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"><LogIn size={16} />{saving ? 'Updating…' : 'Update password'}</button>
            </form>
          </section>
        </div>
      </div>
    </AppShell>
  )
}

export default ProfilePage
