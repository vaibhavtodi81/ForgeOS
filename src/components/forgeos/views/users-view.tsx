'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { UserPlus } from 'lucide-react'
import type { Role, SessionUser, UserRow } from '@/lib/forgeos-types'
import { BADGE_CLASSES, ROLES, ROLE_LABELS } from '@/lib/forgeos-types'
import { api, ApiError } from '@/lib/client-api'
import { formatDate } from '@/lib/format'
import {
  EmptyState,
  ErrorState,
  LoadingRows,
  PageHeader,
} from '@/components/forgeos/ui-bits'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default function UsersView({ user }: { user: SessionUser }) {
  const queryClient = useQueryClient()
  const [inviteOpen, setInviteOpen] = useState(false)
  const [deactivateTarget, setDeactivateTarget] = useState<UserRow | null>(null)

  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: () => api<{ items: UserRow[] }>('/api/users'),
  })

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) =>
      api(`/api/users/${id}`, { method: 'PATCH', body: { role } }),
    onSuccess: () => {
      toast.success('Role updated')
      void queryClient.invalidateQueries()
    },
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : 'Something went wrong'),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api(`/api/users/${id}`, { method: 'PATCH', body: { isActive } }),
    onSuccess: (_data, vars) => {
      toast.success(vars.isActive ? 'User activated' : 'User deactivated')
      void queryClient.invalidateQueries()
    },
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : 'Something went wrong'),
  })

  const users = usersQuery.data?.items ?? []

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title="Users" description="Team access and roles.">
        <Button onClick={() => setInviteOpen(true)}>
          <UserPlus aria-hidden /> Invite User
        </Button>
      </PageHeader>

      {usersQuery.isLoading ? (
        <LoadingRows rows={6} />
      ) : usersQuery.isError ? (
        <ErrorState
          message={usersQuery.error instanceof Error ? usersQuery.error.message : 'Failed to load users'}
          onRetry={() => void usersQuery.refetch()}
        />
      ) : users.length === 0 ? (
        <EmptyState title="No users" description="Invite teammates to collaborate." />
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Active Projects</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => {
                const isSelf = u.id === user.id
                return (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">{initials(u.name)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {u.name}
                            {isSelf ? <span className="ml-1 text-xs text-muted-foreground">(you)</span> : null}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={u.role}
                        onValueChange={(role) => roleMutation.mutate({ id: u.id, role: role as Role })}
                        disabled={isSelf || roleMutation.isPending}
                      >
                        <SelectTrigger
                          className="h-8 w-[170px]"
                          aria-label={`Role for ${u.name}`}
                          title={isSelf ? 'You cannot modify your own account' : undefined}
                        >
                          <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLES.map((role) => (
                            <SelectItem key={role} value={role}>
                              {ROLE_LABELS[role]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {u.isActive ? (
                          <Badge variant="outline" className={`w-fit whitespace-nowrap ${BADGE_CLASSES.ACTIVE}`}>
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className={`w-fit whitespace-nowrap ${BADGE_CLASSES.VOID}`}>
                            Inactive
                          </Badge>
                        )}
                        {u.role === 'PROJECT_MANAGER' ? (
                          <span className="text-xs text-muted-foreground">
                            {u.activeProjects} active projects
                          </span>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{u.activeProjects}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {formatDate(u.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      {isSelf ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled
                          title="You cannot modify your own account"
                        >
                          Deactivate
                        </Button>
                      ) : u.isActive ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          onClick={() => setDeactivateTarget(u)}
                        >
                          Deactivate
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={statusMutation.isPending}
                          onClick={() => statusMutation.mutate({ id: u.id, isActive: true })}
                        >
                          Activate
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <InviteUserDialog open={inviteOpen} onOpenChange={setInviteOpen} />

      <AlertDialog
        open={deactivateTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeactivateTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate {deactivateTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              They can no longer sign in. Managers with active projects cannot be deactivated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={statusMutation.isPending}
              onClick={() => {
                if (!deactivateTarget) return
                statusMutation.mutate({ id: deactivateTarget.id, isActive: false })
                setDeactivateTarget(null)
              }}
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Invite user dialog
// ---------------------------------------------------------------------------

function InviteUserDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Role>('PROJECT_MANAGER')
  const [password, setPassword] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function resetForm() {
    setName('')
    setEmail('')
    setRole('PROJECT_MANAGER')
    setPassword('')
    setSubmitted(false)
  }

  function close() {
    resetForm()
    onOpenChange(false)
  }

  const nameError = name.trim() === '' ? 'Name is required' : null
  const emailError = email.trim() === '' ? 'Email is required' : !/^\S+@\S+\.\S+$/.test(email) ? 'Enter a valid email' : null
  const passwordError = password.length < 8 ? 'Password must be at least 8 characters' : null
  const valid = nameError === null && emailError === null && passwordError === null

  const inviteMutation = useMutation({
    mutationFn: () =>
      api('/api/users', {
        method: 'POST',
        body: { name: name.trim(), email: email.trim().toLowerCase(), role, password },
      }),
    onSuccess: () => {
      toast.success('User invited')
      void queryClient.invalidateQueries()
      close()
    },
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : 'Something went wrong'),
  })

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    if (!valid) return
    inviteMutation.mutate()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) close()
      }}
    >
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Invite User</DialogTitle>
          <DialogDescription>
            Create a team account and share the temporary password securely.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-3" onSubmit={onSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="invite-name">Name</Label>
            <Input
              id="invite-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
            />
            {submitted && nameError ? (
              <p className="text-sm text-red-600 dark:text-red-400">{nameError}</p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="invite-email">Email</Label>
            <Input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
            />
            {submitted && emailError ? (
              <p className="text-sm text-red-600 dark:text-red-400">{emailError}</p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger className="w-full" aria-label="Role">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="invite-password">Temporary password</Label>
            <Input
              id="invite-password"
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
            />
            {submitted && passwordError ? (
              <p className="text-sm text-red-600 dark:text-red-400">{passwordError}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Share this securely — the user can change it from Profile
              </p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" disabled={inviteMutation.isPending}>
              {inviteMutation.isPending ? 'Inviting…' : 'Invite User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
