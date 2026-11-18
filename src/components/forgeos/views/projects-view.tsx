'use client'

import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Building2,
  CalendarRange,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserCog,
  Workflow,
} from 'lucide-react'
import { ApiError, api, withParams } from '@/lib/client-api'
import { formatDate, formatMoney, formatMoneyCompact, toDateInputValue } from '@/lib/format'
import {
  ALLOWED_PROJECT_TRANSITIONS,
  PROJECT_STATUSES,
  PROJECT_STATUS_LABELS,
  type MetaResponse,
  type Paginated,
  type ProjectRow,
  type ProjectStatus,
  type SessionUser,
} from '@/lib/forgeos-types'
import { cn } from '@/lib/utils'
import { ProjectDetailDialog } from '@/components/forgeos/views/project-detail-dialog'
import {
  EmptyState,
  ErrorState,
  LoadingRows,
  PageHeader,
  StatusBadge,
  TablePagination,
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
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
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

// ---------------------------------------------------------------------------
// Create / Edit project dialog
// ---------------------------------------------------------------------------

function ProjectFormDialog({
  mode,
  row,
  meta,
  open,
  onOpenChange,
}: {
  mode: 'create' | 'edit'
  row: ProjectRow | null
  meta: MetaResponse | undefined
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const isEdit = mode === 'edit'

  const [name, setName] = useState(() => (isEdit && row ? row.name : ''))
  const [landId, setLandId] = useState(() => (isEdit && row ? row.landId : ''))
  const [pmId, setPmId] = useState('unassigned')
  const [budget, setBudget] = useState(() => (isEdit && row && row.budget > 0 ? String(row.budget) : ''))
  const [startDate, setStartDate] = useState(() =>
    isEdit && row ? row.startDate.slice(0, 10) : toDateInputValue(new Date()),
  )
  const [plannedEndDate, setPlannedEndDate] = useState(() =>
    isEdit && row && row.plannedEndDate ? row.plannedEndDate.slice(0, 10) : '',
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  function prefill() {
    if (isEdit && row) {
      setName(row.name)
      setLandId(row.landId)
      setBudget(row.budget > 0 ? String(row.budget) : '')
      setStartDate(row.startDate.slice(0, 10))
      setPlannedEndDate(row.plannedEndDate ? row.plannedEndDate.slice(0, 10) : '')
    } else {
      setName('')
      setLandId('')
      setPmId('unassigned')
      setBudget('')
      setStartDate(toDateInputValue(new Date()))
      setPlannedEndDate('')
    }
  }

  function close() {
    setErrors({})
    prefill()
    onOpenChange(false)
  }

  const mutation = useMutation({
    mutationFn: () => {
      const parsedBudget = parseFloat(budget)
      if (isEdit && row) {
        return api(`/api/projects/${row.id}`, {
          method: 'PUT',
          body: {
            name: name.trim(),
            landId,
            budget: parsedBudget,
            startDate,
            plannedEndDate: plannedEndDate || null,
          },
        })
      }
      return api('/api/projects', {
        method: 'POST',
        body: {
          name: name.trim(),
          landId,
          pmId: pmId === 'unassigned' ? null : pmId,
          budget: parsedBudget,
          startDate,
          plannedEndDate: plannedEndDate || null,
        },
      })
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Project updated' : 'Project created')
      close()
      queryClient.invalidateQueries()
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Something went wrong'),
  })

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'Project name is required'
    if (!landId) errs.landId = 'Select a land parcel'
    const parsedBudget = parseFloat(budget)
    if (isNaN(parsedBudget) || parsedBudget <= 0) errs.budget = 'Enter a budget greater than 0'
    if (!startDate) errs.startDate = 'Start date is required'
    if (plannedEndDate && startDate && plannedEndDate <= startDate) {
      errs.plannedEndDate = 'Planned end must be after the start date'
    }
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
          <DialogTitle>{isEdit ? 'Edit project' : 'New project'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the project basics. Manager and status have their own actions.'
              : 'Create a site and assign a manager to get started.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="project-name">Name</Label>
            <Input
              id="project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sunrise Residency"
            />
            {errors.name ? <p className="text-sm text-red-600 dark:text-red-400">{errors.name}</p> : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="project-land">Land</Label>
              <Select value={landId} onValueChange={setLandId}>
                <SelectTrigger id="project-land" className="w-full">
                  <SelectValue placeholder="Select land" />
                </SelectTrigger>
                <SelectContent>
                  {(meta?.lands ?? []).map((land) => (
                    <SelectItem key={land.id} value={land.id}>
                      {land.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.landId ? <p className="text-sm text-red-600 dark:text-red-400">{errors.landId}</p> : null}
            </div>

            {!isEdit ? (
              <div className="space-y-1.5">
                <Label htmlFor="project-pm">Manager</Label>
                <Select value={pmId} onValueChange={setPmId}>
                  <SelectTrigger id="project-pm" className="w-full">
                    <SelectValue placeholder="Select manager" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {(meta?.managers ?? []).map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="project-budget">Budget (₹)</Label>
            <Input
              id="project-budget"
              type="number"
              min="0"
              step="1"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="e.g. 25000000"
            />
            {errors.budget ? <p className="text-sm text-red-600 dark:text-red-400">{errors.budget}</p> : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="project-start">Start date</Label>
              <Input
                id="project-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              {errors.startDate ? <p className="text-sm text-red-600 dark:text-red-400">{errors.startDate}</p> : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="project-end">Planned end date</Label>
              <Input
                id="project-end"
                type="date"
                value={plannedEndDate}
                onChange={(e) => setPlannedEndDate(e.target.value)}
              />
              {errors.plannedEndDate ? (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.plannedEndDate}</p>
              ) : (
                <p className="text-xs text-muted-foreground">Optional</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Create project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Change status dialog
// ---------------------------------------------------------------------------

function StatusDialog({
  row,
  open,
  onOpenChange,
}: {
  row: ProjectRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const [next, setNext] = useState<ProjectStatus | ''>('')

  const allowed = row ? ALLOWED_PROJECT_TRANSITIONS[row.status] : []

  function close() {
    setNext('')
    onOpenChange(false)
  }

  const mutation = useMutation({
    mutationFn: () =>
      api(`/api/projects/${row?.id}/status`, { method: 'PATCH', body: { status: next } }),
    onSuccess: () => {
      toast.success('Status updated')
      close()
      queryClient.invalidateQueries()
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Something went wrong'),
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) close()
      }}
    >
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Change status</DialogTitle>
          <DialogDescription>{row?.name}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Current:</span>
            {row ? <StatusBadge value={row.status} label={PROJECT_STATUS_LABELS[row.status]} /> : null}
          </div>
          {allowed.length > 0 ? (
            <div className="space-y-1.5">
              <Label htmlFor="project-next-status">New status</Label>
              <Select value={next} onValueChange={(v) => setNext(v as ProjectStatus)}>
                <SelectTrigger id="project-next-status" className="w-full">
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  {allowed.map((s) => (
                    <SelectItem key={s} value={s}>
                      {PROJECT_STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No further transitions (project is completed).</p>
          )}
          {next === 'COMPLETED' ? (
            <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
              Marking complete sets the actual end date to today and locks further transitions.
            </p>
          ) : null}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button onClick={() => mutation.mutate()} disabled={!next || allowed.length === 0 || mutation.isPending}>
            {mutation.isPending ? 'Updating…' : 'Update status'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Assign manager dialog
// ---------------------------------------------------------------------------

function AssignPmDialog({
  row,
  meta,
  open,
  onOpenChange,
}: {
  row: ProjectRow | null
  meta: MetaResponse | undefined
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const [pmId, setPmId] = useState(() => row?.pmId ?? 'unassigned')

  function close() {
    setPmId(row?.pmId ?? 'unassigned')
    onOpenChange(false)
  }

  const mutation = useMutation({
    mutationFn: () =>
      api(`/api/projects/${row?.id}/assign-pm`, {
        method: 'PATCH',
        body: { pmId: pmId === 'unassigned' ? null : pmId },
      }),
    onSuccess: () => {
      toast.success('Manager assigned')
      close()
      queryClient.invalidateQueries()
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Something went wrong'),
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) close()
      }}
    >
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Assign manager</DialogTitle>
          <DialogDescription>{row?.name}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="project-assign-pm">Project manager</Label>
            <Select value={pmId} onValueChange={setPmId}>
              <SelectTrigger id="project-assign-pm" className="w-full">
                <SelectValue placeholder="Select manager" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {(meta?.managers ?? []).map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Current: {row?.pmName ?? 'Unassigned'}</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving…' : 'Assign manager'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Projects view
// ---------------------------------------------------------------------------

export default function ProjectsView({ user }: { user: SessionUser }) {
  const isAdmin = user.role === 'ADMIN'
  const queryClient = useQueryClient()

  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('all')
  const [pmId, setPmId] = useState('all')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  const { data: meta } = useQuery({
    queryKey: ['meta'],
    queryFn: () => api<MetaResponse>('/api/meta'),
  })

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['projects', page, status, pmId, debouncedSearch],
    queryFn: () =>
      api<Paginated<ProjectRow>>(
        withParams('/api/projects', {
          page,
          limit: 10,
          status,
          pmId: isAdmin ? pmId : undefined,
          search: debouncedSearch,
        }),
      ),
  })

  const [detailId, setDetailId] = useState<string | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [formOpen, setFormOpen] = useState(false)
  const [editRow, setEditRow] = useState<ProjectRow | null>(null)
  const [statusRow, setStatusRow] = useState<ProjectRow | null>(null)
  const [assignRow, setAssignRow] = useState<ProjectRow | null>(null)
  const [deleteRow, setDeleteRow] = useState<ProjectRow | null>(null)

  function openDetail(id: string) {
    setDetailId(id)
    setDetailOpen(true)
  }

  const deleteMutation = useMutation({
    mutationFn: () => api(`/api/projects/${deleteRow?.id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success('Project deleted')
      setDeleteRow(null)
      queryClient.invalidateQueries()
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Something went wrong'),
  })

  function clearFilters() {
    setStatus('all')
    setPmId('all')
    setSearch('')
  }

  const hasFilters = status !== 'all' || (isAdmin && pmId !== 'all') || debouncedSearch !== ''
  const rows = data?.items ?? []

  return (
    <div className="space-y-4">
      <PageHeader title="Projects" description="Every site from planning to handover.">
        {isAdmin ? (
          <Button
            onClick={() => {
              setFormMode('create')
              setEditRow(null)
              setFormOpen(true)
            }}
          >
            <Plus aria-hidden /> New Project
          </Button>
        ) : null}
      </PageHeader>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-full sm:w-[170px]" aria-label="Filter by status">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {PROJECT_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {PROJECT_STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isAdmin ? (
          <Select
            value={pmId}
            onValueChange={(v) => {
              setPmId(v)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-full sm:w-[190px]" aria-label="Filter by manager">
              <SelectValue placeholder="All managers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All managers</SelectItem>
              {(meta?.managers ?? []).map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}

        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search name or code…"
            className="pl-8"
            aria-label="Search projects"
          />
        </div>
      </div>

      {isPending ? (
        <LoadingRows rows={6} />
      ) : isError ? (
        <ErrorState message={error.message} onRetry={() => refetch()} />
      ) : (
        <div className="space-y-3">
          <div className="overflow-x-auto rounded-md border">
            {rows.length === 0 ? (
              <EmptyState
                icon={Building2}
                title="No projects match"
                description="Try adjusting or clearing the filters."
                action={
                  hasFilters ? (
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      Clear filters
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Manager</TableHead>
                    <TableHead>Land</TableHead>
                    <TableHead className="text-right">Budget</TableHead>
                    <TableHead>Spend</TableHead>
                    <TableHead>Invoiced</TableHead>
                    <TableHead>Timeline</TableHead>
                    <TableHead className="w-10">
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => {
                    const spendPct = row.budget > 0 ? (row.spend / row.budget) * 100 : null
                    const overBudget = row.budget > 0 && row.spend > row.budget
                    return (
                      <TableRow key={row.id}>
                        <TableCell>
                          <button
                            type="button"
                            onClick={() => openDetail(row.id)}
                            className="text-left font-medium hover:underline focus:underline focus:outline-none"
                          >
                            {row.name}
                            <span className="block text-xs font-normal text-muted-foreground">{row.code}</span>
                          </button>
                        </TableCell>
                        <TableCell>
                          <StatusBadge value={row.status} label={PROJECT_STATUS_LABELS[row.status]} />
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{row.pmName ?? '—'}</TableCell>
                        <TableCell className="whitespace-nowrap">{row.landName}</TableCell>
                        <TableCell className="whitespace-nowrap text-right tabular-nums">
                          {formatMoney(row.budget)}
                        </TableCell>
                        <TableCell>
                          <div className="whitespace-nowrap tabular-nums">
                            <span>{formatMoneyCompact(row.spend)}</span>
                            {spendPct !== null ? (
                              <div className="mt-1 flex items-center gap-1.5">
                                <Progress
                                  value={Math.min(100, spendPct)}
                                  className={cn(
                                    'h-1.5 w-20',
                                    overBudget && 'bg-red-500/25 [&>div]:!bg-red-600',
                                  )}
                                />
                                <span
                                  className={cn(
                                    'text-xs tabular-nums',
                                    overBudget ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground',
                                  )}
                                >
                                  {Math.round(spendPct)}%
                                </span>
                              </div>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap tabular-nums">
                          <span>{formatMoneyCompact(row.invoiced)}</span>
                          <span className="block text-xs text-muted-foreground">
                            {formatMoneyCompact(row.collected)} collected
                          </span>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {row.status === 'COMPLETED' ? (
                            <span className="inline-flex items-center gap-1">
                              <CalendarRange className="h-3.5 w-3.5" aria-hidden /> Ended {formatDate(row.actualEndDate)}
                            </span>
                          ) : (
                            `${formatDate(row.startDate)} → ${formatDate(row.plannedEndDate ?? row.actualEndDate)}`
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                aria-label={`Actions for ${row.name}`}
                              >
                                <MoreHorizontal className="h-4 w-4" aria-hidden />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openDetail(row.id)}>
                                <Building2 aria-hidden /> View details
                              </DropdownMenuItem>
                              {isAdmin ? (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setFormMode('edit')
                                      setEditRow(row)
                                      setFormOpen(true)
                                    }}
                                  >
                                    <Pencil aria-hidden /> Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => setStatusRow(row)}>
                                    <Workflow aria-hidden /> Change status
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => setAssignRow(row)}>
                                    <UserCog aria-hidden /> Assign manager
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem variant="destructive" onClick={() => setDeleteRow(row)}>
                                    <Trash2 aria-hidden /> Delete
                                  </DropdownMenuItem>
                                </>
                              ) : null}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </div>
          {data ? (
            <TablePagination
              page={data.page}
              limit={data.limit}
              total={data.total}
              onPageChange={setPage}
            />
          ) : null}
        </div>
      )}

      <ProjectFormDialog
        key={`${formMode}-${editRow?.id ?? 'new'}`}
        mode={formMode}
        row={formMode === 'edit' ? editRow : null}
        meta={meta}
        open={formOpen}
        onOpenChange={setFormOpen}
      />

      <StatusDialog row={statusRow} open={!!statusRow} onOpenChange={(o) => !o && setStatusRow(null)} />

      <AssignPmDialog
        key={assignRow?.id ?? 'none'}
        row={assignRow}
        meta={meta}
        open={!!assignRow}
        onOpenChange={(o) => !o && setAssignRow(null)}
      />

      <AlertDialog open={!!deleteRow} onOpenChange={(o) => !o && setDeleteRow(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteRow?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Only planning projects with no recorded activity can be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                deleteMutation.mutate()
              }}
              disabled={deleteMutation.isPending}
              className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:text-white dark:hover:bg-red-700"
            >
              {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ProjectDetailDialog projectId={detailId} open={detailOpen} onOpenChange={setDetailOpen} user={user} />
    </div>
  )
}
