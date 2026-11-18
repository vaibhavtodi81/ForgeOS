'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { KeyRound } from 'lucide-react'
import type { Role, SessionUser } from '@/lib/forgeos-types'
import { ROLE_LABELS } from '@/lib/forgeos-types'
import { api, ApiError } from '@/lib/client-api'
import { PageHeader, SectionCard, StatusBadge } from '@/components/forgeos/ui-bits'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

const ROLE_DESCRIPTIONS: Record<Role, string> = {
  ADMIN: 'Full access across projects, finance, masters and administration.',
  PROJECT_MANAGER: 'Runs assigned projects — plans, inventory and daily logs.',
  ACCOUNTANT: 'Manages billing, payments and inventory transactions.',
  VIEWER: 'Read-only access to dashboards and billing.',
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default function ProfileView({ user }: { user: SessionUser }) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title="Profile" description="Your account details and security." />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
          <SectionCard title="Account">
            <div className="flex flex-col items-center gap-3 py-2 text-center">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg">{initials(user.name)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-base font-semibold">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <StatusBadge value={user.role} label={ROLE_LABELS[user.role]} />
              <p className="text-xs text-muted-foreground">
                Password, email OTP and Google sign-in are supported
              </p>
            </div>
          </SectionCard>

          <SectionCard title="Session">
            <div className="space-y-1.5">
              <p className="text-sm">
                Signed in as <span className="font-medium">{user.email}</span>
              </p>
              <p className="text-xs text-muted-foreground">{ROLE_DESCRIPTIONS[user.role]}</p>
            </div>
          </SectionCard>
        </div>

        <div className="lg:col-span-2">
          <ChangePasswordCard />
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Change password
// ---------------------------------------------------------------------------

function ChangePasswordCard() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const currentError = currentPassword === '' ? 'Enter your current password' : null
  const newError = newPassword.length < 8 ? 'Password must be at least 8 characters' : null
  const confirmError =
    confirmPassword === ''
      ? 'Confirm your new password'
      : confirmPassword !== newPassword
        ? 'Passwords do not match'
        : null
  const valid = currentError === null && newError === null && confirmError === null

  const changeMutation = useMutation({
    mutationFn: () =>
      api('/api/auth/change-password', {
        method: 'POST',
        body: { currentPassword, newPassword },
      }),
    onSuccess: () => {
      toast.success('Password updated')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setFormError(null)
      setSubmitted(false)
    },
    onError: (err) => {
      if (err instanceof ApiError && (err.status === 401 || err.status === 400)) {
        setFormError(err.status === 401 ? 'Current password is incorrect' : err.message)
      } else {
        toast.error(err instanceof ApiError ? err.message : 'Something went wrong')
      }
    },
  })

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    setFormError(null)
    if (!valid) return
    changeMutation.mutate()
  }

  return (
    <SectionCard
      title="Change password"
      description="Use at least 8 characters — mix letters, numbers and symbols."
      className="h-full"
    >
      <form className="space-y-3" onSubmit={onSubmit}>
        <div className="space-y-1.5">
          <Label htmlFor="current-password">Current password</Label>
          <Input
            id="current-password"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          {submitted && currentError ? (
            <p className="text-sm text-red-600 dark:text-red-400">{currentError}</p>
          ) : null}
        </div>
        <Separator />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            {newError && (submitted || newPassword !== '') ? (
              <p className="text-sm text-red-600 dark:text-red-400">{newError}</p>
            ) : (
              <p className="text-xs text-muted-foreground">At least 8 characters</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm-password">Confirm new password</Label>
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {confirmPassword !== '' && confirmPassword !== newPassword ? (
              <p className="text-sm text-red-600 dark:text-red-400">Passwords do not match</p>
            ) : null}
          </div>
        </div>
        {formError ? <p className="text-sm text-red-600 dark:text-red-400">{formError}</p> : null}
        <Button type="submit" disabled={changeMutation.isPending}>
          <KeyRound aria-hidden />
          {changeMutation.isPending ? 'Updating…' : 'Update Password'}
        </Button>
      </form>
    </SectionCard>
  )
}
