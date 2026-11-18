'use client'

import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CalendarDays, ClipboardEdit, Plus, Users } from 'lucide-react'
import { ApiError, api, withParams } from '@/lib/client-api'
import { formatDate, toDateInputValue } from '@/lib/format'
import { type LogRow, type MetaResponse, type SessionUser } from '@/lib/forgeos-types'
import {
  EmptyState,
  ErrorState,
  LoadingRows,
  PageHeader,
} from '@/components/forgeos/ui-bits'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
import { Textarea } from '@/components/ui/textarea'

// ---------------------------------------------------------------------------
// Add log dialog
// ---------------------------------------------------------------------------

function AddLogDialog({
  meta,
  open,
  onOpenChange,
}: {
  meta: MetaResponse | undefined
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()

  const [projectId, setProjectId] = useState('')
  const [logDate, setLogDate] = useState(() => toDateInputValue(new Date()))
  const [workDone, setWorkDone] = useState('')
  const [headcount, setHeadcount] = useState('')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  function close() {
    setErrors({})
    setProjectId('')
    setLogDate(toDateInputValue(new Date()))
    setWorkDone('')
    setHeadcount('')
    setNotes('')
    onOpenChange(false)
  }

  const mutation = useMutation({
    mutationFn: () =>
      api('/api/daily-logs', {
        method: 'POST',
        body: {
          projectId,
          logDate,
          workDone: workDone.trim(),
          headcount: parseInt(headcount, 10),
          notes: notes.trim() || null,
        },
      }),
    onSuccess: () => {
      toast.success('Log added')
      close()
      queryClient.invalidateQueries()
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Something went wrong'),
  })

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!projectId) errs.projectId = 'Select a project'
    if (!logDate) errs.logDate = 'Date is required'
    if (workDone.trim().length < 3) errs.workDone = 'Describe the work done (min 3 characters)'
    const hc = parseInt(headcount, 10)
    if (isNaN(hc) || hc < 1) errs.headcount = 'Headcount must be at least 1'
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    mutation.mutate()
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
          <DialogTitle>Add log</DialogTitle>
          <DialogDescription>Record what happened on site today (or on a past date).</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="log-project">Project</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger id="log-project" className="w-full">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {(meta?.projects ?? []).map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.projectId ? <p className="text-sm text-red-600 dark:text-red-400">{errors.projectId}</p> : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="log-date">Date</Label>
              <Input id="log-date" type="date" value={logDate} onChange={(e) => setLogDate(e.target.value)} />
              {errors.logDate ? <p className="text-sm text-red-600 dark:text-red-400">{errors.logDate}</p> : null}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="log-work">Work done</Label>
            <Textarea
              id="log-work"
              value={workDone}
              onChange={(e) => setWorkDone(e.target.value)}
              placeholder="e.g. Casting of first floor slab started"
              rows={3}
            />
            {errors.workDone ? <p className="text-sm text-red-600 dark:text-red-400">{errors.workDone}</p> : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="log-headcount">Headcount</Label>
            <Input
              id="log-headcount"
              type="number"
              min="1"
              step="1"
              value={headcount}
              onChange={(e) => setHeadcount(e.target.value)}
              placeholder="e.g. 24"
            />
            {errors.headcount ? <p className="text-sm text-red-600 dark:text-red-400">{errors.headcount}</p> : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="log-notes">Notes</Label>
            <Textarea
              id="log-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes"
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving…' : 'Add log'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Logs view
// ---------------------------------------------------------------------------

function weekdayShort(iso: string): string {
  const d = new Date(iso)
  return isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString('en-IN', { weekday: 'short' })
}

export default function LogsView({ user }: { user: SessionUser }) {
  const canManage = user.role === 'ADMIN' || user.role === 'PROJECT_MANAGER'

  const [projectId, setProjectId] = useState('all')
  const [addOpen, setAddOpen] = useState(false)

  const { data: meta } = useQuery({
    queryKey: ['meta'],
    queryFn: () => api<MetaResponse>('/api/meta'),
  })

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['daily-logs', projectId],
    queryFn: () => api<{ items: LogRow[] }>(withParams('/api/daily-logs', { projectId, limit: 30 })),
  })

  const logs = useMemo(
    () => (data ? [...data.items].sort((a, b) => b.logDate.localeCompare(a.logDate)) : []),
    [data],
  )

  return (
    <div className="space-y-4">
      <PageHeader title="Daily Logs" description="What happened on site, day by day.">
        {canManage ? (
          <Button onClick={() => setAddOpen(true)}>
            <Plus aria-hidden /> Add Log
          </Button>
        ) : null}
      </PageHeader>

      <Select value={projectId} onValueChange={setProjectId}>
        <SelectTrigger className="w-full sm:w-[240px]" aria-label="Filter by project">
          <SelectValue placeholder="All projects" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All projects</SelectItem>
          {(meta?.projects ?? []).map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {isPending ? (
        <LoadingRows rows={6} />
      ) : isError ? (
        <ErrorState message={error.message} onRetry={() => refetch()} />
      ) : (
        <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-1">
          {logs.length === 0 ? (
            <EmptyState
              icon={ClipboardEdit}
              title="No logs yet"
              description="Record the first site log to build site history."
            />
          ) : (
            logs.map((log) => (
              <Card key={log.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                    <div className="flex w-fit shrink-0 flex-col items-center rounded-md border bg-muted/40 px-3 py-1.5 sm:w-20">
                      <span className="text-sm font-semibold">{weekdayShort(log.logDate)}</span>
                      <span className="whitespace-nowrap text-[11px] text-muted-foreground">
                        {formatDate(log.logDate)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <p className="text-sm font-medium">{log.workDone}</p>
                        <p className="text-xs text-muted-foreground">{log.projectName}</p>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" aria-hidden />
                          {log.headcount} workers
                        </span>
                        {log.notes ? <span>{log.notes}</span> : null}
                        <span>by {log.createdByName}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      <AddLogDialog meta={meta} open={addOpen} onOpenChange={setAddOpen} />
    </div>
  )
}
