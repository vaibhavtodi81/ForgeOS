'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ClipboardList, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'
import { ApiError, api, withParams } from '@/lib/client-api'
import { formatDate, formatPct, formatQty } from '@/lib/format'
import {
  ALLOWED_PLAN_TRANSITIONS,
  PLAN_STATUSES,
  PLAN_STATUS_LABELS,
  type MetaResponse,
  type PlanRow,
  type PlanStatus,
  type SessionUser,
} from '@/lib/forgeos-types'
import { cn } from '@/lib/utils'
import {
  EmptyState,
  ErrorState,
  LoadingRows,
  PageHeader,
  StatusBadge,
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'

// ---------------------------------------------------------------------------
// Create / Edit plan dialog
// ---------------------------------------------------------------------------

function PlanFormDialog({
  mode,
  row,
  meta,
  open,
  onOpenChange,
}: {
  mode: 'create' | 'edit'
  row: PlanRow | null
  meta: MetaResponse | undefined
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const isEdit = mode === 'edit'

  const [projectId, setProjectId] = useState(() => (isEdit && row ? row.projectId : ''))
  const [materialId, setMaterialId] = useState(() => (isEdit && row ? row.materialId : ''))
  const [plannedQty, setPlannedQty] = useState(() => (isEdit && row ? String(row.plannedQty) : ''))
  const [wastagePct, setWastagePct] = useState(() => (isEdit && row ? String(row.wastagePct) : '0'))
  const [notes, setNotes] = useState(() => (isEdit && row ? row.notes ?? '' : ''))
  const [status, setStatus] = useState<PlanStatus>(() => (isEdit && row ? row.status : 'DRAFT'))
  const [errors, setErrors] = useState<Record<string, string>>({})

  function prefill() {
    if (isEdit && row) {
      setProjectId(row.projectId)
      setMaterialId(row.materialId)
      setPlannedQty(String(row.plannedQty))
      setWastagePct(String(row.wastagePct))
      setNotes(row.notes ?? '')
      setStatus(row.status)
    } else {
      setProjectId('')
      setMaterialId('')
      setPlannedQty('')
      setWastagePct('0')
      setNotes('')
      setStatus('DRAFT')
    }
  }

  function close() {
    setErrors({})
    prefill()
    onOpenChange(false)
  }

  const statusOptions: PlanStatus[] = row ? [row.status, ...ALLOWED_PLAN_TRANSITIONS[row.status]] : []

  const mutation = useMutation({
    mutationFn: () => {
      const body = {
        plannedQty: parseFloat(plannedQty),
        wastagePct: parseFloat(wastagePct),
        notes: notes.trim() || null,
      }
      if (isEdit && row) {
        return api(`/api/material-plans/${row.id}`, { method: 'PUT', body: { ...body, status } })
      }
      return api('/api/material-plans', {
        method: 'POST',
        body: { ...body, projectId, materialId },
      })
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Plan updated' : 'Plan created')
      close()
      queryClient.invalidateQueries()
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Something went wrong'),
  })

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!projectId) errs.projectId = 'Select a project'
    if (!materialId) errs.materialId = 'Select a material'
    const qty = parseFloat(plannedQty)
    if (isNaN(qty) || qty <= 0) errs.plannedQty = 'Enter a planned quantity greater than 0'
    const pct = parseFloat(wastagePct)
    if (isNaN(pct) || pct < 0 || pct > 100) errs.wastagePct = 'Allowance must be between 0 and 100'
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
          <DialogTitle>{isEdit ? 'Edit plan' : 'New plan'}</DialogTitle>
          <DialogDescription>
            Plan the estimated material quantity and add a wastage allowance on top.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="plan-project">Project</Label>
            <Select value={projectId} onValueChange={setProjectId} disabled={isEdit}>
              <SelectTrigger id="plan-project" className="w-full">
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
            <Label htmlFor="plan-material">Material</Label>
            <Select value={materialId} onValueChange={setMaterialId} disabled={isEdit}>
              <SelectTrigger id="plan-material" className="w-full">
                <SelectValue placeholder="Select material" />
              </SelectTrigger>
              <SelectContent>
                {(meta?.materials ?? []).map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name} ({m.unit})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.materialId ? <p className="text-sm text-red-600 dark:text-red-400">{errors.materialId}</p> : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="plan-qty">Planned qty</Label>
              <Input
                id="plan-qty"
                type="number"
                min="0"
                step="any"
                value={plannedQty}
                onChange={(e) => setPlannedQty(e.target.value)}
                placeholder="e.g. 500"
              />
              {errors.plannedQty ? <p className="text-sm text-red-600 dark:text-red-400">{errors.plannedQty}</p> : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="plan-allowance">Allowance %</Label>
              <Input
                id="plan-allowance"
                type="number"
                min="0"
                max="100"
                step="any"
                value={wastagePct}
                onChange={(e) => setWastagePct(e.target.value)}
              />
              {errors.wastagePct ? (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.wastagePct}</p>
              ) : (
                <p className="text-xs text-muted-foreground">Wastage allowance, 0–100</p>
              )}
            </div>
          </div>

          {isEdit ? (
            <div className="space-y-1.5">
              <Label htmlFor="plan-status">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as PlanStatus)}>
                <SelectTrigger id="plan-status" className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((s) => (
                    <SelectItem key={s} value={s}>
                      {PLAN_STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Current: {row ? PLAN_STATUS_LABELS[row.status] : '—'}</p>
            </div>
          ) : null}

          <div className="space-y-1.5">
            <Label htmlFor="plan-notes">Notes</Label>
            <Textarea
              id="plan-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Create plan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Plans view
// ---------------------------------------------------------------------------

export default function PlansView({ user }: { user: SessionUser }) {
  const canManage = user.role === 'ADMIN' || user.role === 'PROJECT_MANAGER'
  const queryClient = useQueryClient()

  const [projectId, setProjectId] = useState('all')
  const [status, setStatus] = useState('all')

  const { data: meta } = useQuery({
    queryKey: ['meta'],
    queryFn: () => api<MetaResponse>('/api/meta'),
  })

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['plans', projectId, status],
    queryFn: () =>
      api<{ items: PlanRow[] }>(withParams('/api/material-plans', { projectId, status })),
  })

  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [formOpen, setFormOpen] = useState(false)
  const [editRow, setEditRow] = useState<PlanRow | null>(null)
  const [deleteRow, setDeleteRow] = useState<PlanRow | null>(null)

  const deleteMutation = useMutation({
    mutationFn: () => api(`/api/material-plans/${deleteRow?.id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success('Plan deleted')
      setDeleteRow(null)
      queryClient.invalidateQueries()
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Something went wrong'),
  })

  const rows = data?.items ?? []

  return (
    <div className="space-y-4">
      <PageHeader title="Material Plans" description="Plan quantities with wastage allowances, tracked against actual burn.">
        {canManage ? (
          <Button
            onClick={() => {
              setFormMode('create')
              setEditRow(null)
              setFormOpen(true)
            }}
          >
            <Plus aria-hidden /> New Plan
          </Button>
        ) : null}
      </PageHeader>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Select value={projectId} onValueChange={setProjectId}>
          <SelectTrigger className="w-full sm:w-[220px]" aria-label="Filter by project">
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

        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full sm:w-[170px]" aria-label="Filter by status">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {PLAN_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {PLAN_STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isPending ? (
        <LoadingRows rows={6} />
      ) : isError ? (
        <ErrorState message={error.message} onRetry={() => refetch()} />
      ) : (
        <div className="overflow-x-auto rounded-md border">
          {rows.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="No material plans yet"
              description="Create a plan to start tracking planned vs actual consumption."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead className="text-right">Planned</TableHead>
                  <TableHead className="text-right">Allowance</TableHead>
                  <TableHead className="text-right">Est. requirement</TableHead>
                  <TableHead className="text-right">Consumed</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  {canManage ? (
                    <TableHead className="w-10">
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  ) : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => {
                  const estimated = row.plannedQty / (1 + row.wastagePct / 100)
                  return (
                    <TableRow key={row.id}>
                      <TableCell className="whitespace-nowrap font-medium">{row.projectName}</TableCell>
                      <TableCell>
                        <span className="font-medium">{row.materialName}</span>
                        <span className="block text-xs text-muted-foreground">{row.unit}</span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right tabular-nums">
                        {formatQty(row.plannedQty)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right tabular-nums">
                        {formatPct(row.wastagePct, 0)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right tabular-nums text-muted-foreground">
                        {formatQty(estimated)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          'whitespace-nowrap text-right tabular-nums',
                          row.consumedQty > row.plannedQty && 'text-red-600 dark:text-red-400',
                        )}
                      >
                        {formatQty(row.consumedQty)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge value={row.status} label={PLAN_STATUS_LABELS[row.status]} />
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {row.createdByName}
                        <span className="block text-xs text-muted-foreground">{formatDate(row.createdAt)}</span>
                      </TableCell>
                      {canManage ? (
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                aria-label={`Actions for ${row.materialName} plan`}
                              >
                                <MoreHorizontal className="h-4 w-4" aria-hidden />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setFormMode('edit')
                                  setEditRow(row)
                                  setFormOpen(true)
                                }}
                              >
                                <Pencil aria-hidden /> Edit
                              </DropdownMenuItem>
                              {row.status === 'DRAFT' ? (
                                <DropdownMenuItem variant="destructive" onClick={() => setDeleteRow(row)}>
                                  <Trash2 aria-hidden /> Delete
                                </DropdownMenuItem>
                              ) : null}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      ) : null}
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </div>
      )}

      <PlanFormDialog
        key={`${formMode}-${editRow?.id ?? 'new'}`}
        mode={formMode}
        row={formMode === 'edit' ? editRow : null}
        meta={meta}
        open={formOpen}
        onOpenChange={setFormOpen}
      />

      <AlertDialog open={!!deleteRow} onOpenChange={(o) => !o && setDeleteRow(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete plan?</AlertDialogTitle>
            <AlertDialogDescription>
              Only draft plans can be deleted. This plan&apos;s material will keep its recorded transactions.
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
    </div>
  )
}
