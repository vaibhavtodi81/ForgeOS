'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Ban,
  Boxes,
  IndianRupee,
  MoreHorizontal,
  Package,
  Plus,
} from 'lucide-react'
import { ApiError, api, withParams } from '@/lib/client-api'
import { formatDate, formatMoney, formatMoneyCompact, formatQty, toDateInputValue } from '@/lib/format'
import {
  TXN_TYPES,
  TXN_TYPE_LABELS,
  type MetaResponse,
  type SessionUser,
  type TxnListResponse,
  type TxnRow,
  type TxnType,
} from '@/lib/forgeos-types'
import { cn } from '@/lib/utils'
import {
  EmptyState,
  ErrorState,
  LoadingRows,
  PageHeader,
  StatCard,
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

const TXN_TYPE_BADGE: Record<TxnType, string> = {
  IN: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
  OUT: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30',
  ADJUSTMENT:
    'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-500/15 dark:text-slate-300 dark:border-slate-500/30',
}

const VOIDED_BADGE =
  'bg-red-100 text-red-700 border-red-300 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30'
const ACTIVE_BADGE =
  'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30'

// ---------------------------------------------------------------------------
// Record transaction dialog
// ---------------------------------------------------------------------------

function RecordTxnDialog({
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
  const [materialId, setMaterialId] = useState('')
  const [txnType, setTxnType] = useState<TxnType>('IN')
  const [supplierId, setSupplierId] = useState('none')
  const [quantity, setQuantity] = useState('')
  const [unitRate, setUnitRate] = useState('0')
  const [txnDate, setTxnDate] = useState(() => toDateInputValue(new Date()))
  const [errors, setErrors] = useState<Record<string, string>>({})

  function close() {
    setErrors({})
    setProjectId('')
    setMaterialId('')
    setTxnType('IN')
    setSupplierId('none')
    setQuantity('')
    setUnitRate('0')
    setTxnDate(toDateInputValue(new Date()))
    onOpenChange(false)
  }

  const mutation = useMutation({
    mutationFn: () =>
      api('/api/inventory/transactions', {
        method: 'POST',
        body: {
          projectId,
          materialId,
          txnType,
          supplierId: supplierId === 'none' ? null : supplierId,
          quantity: parseFloat(quantity),
          unitRate: parseFloat(unitRate),
          txnDate,
        },
      }),
    onSuccess: () => {
      toast.success('Transaction recorded')
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
    const qty = parseFloat(quantity)
    if (isNaN(qty)) {
      errs.quantity = 'Enter a quantity'
    } else if (txnType === 'ADJUSTMENT' ? qty === 0 : qty <= 0) {
      errs.quantity =
        txnType === 'ADJUSTMENT'
          ? 'Adjustments require a non-zero quantity'
          : 'Enter a quantity greater than 0'
    }
    const rate = parseFloat(unitRate)
    if (isNaN(rate) || rate < 0) errs.unitRate = 'Rate must be 0 or more'
    if (!txnDate) errs.txnDate = 'Date is required'
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
          <DialogTitle>Record Transaction</DialogTitle>
          <DialogDescription>
            Log a procurement, consumption or stock adjustment as it happened on site.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="txn-project">Project</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger id="txn-project" className="w-full">
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
              <Label htmlFor="txn-material">Material</Label>
              <Select value={materialId} onValueChange={setMaterialId}>
                <SelectTrigger id="txn-material" className="w-full">
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
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="txn-type">Type</Label>
              <Select value={txnType} onValueChange={(v) => setTxnType(v as TxnType)}>
                <SelectTrigger id="txn-type" className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {TXN_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {TXN_TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {txnType === 'IN' ? (
              <div className="space-y-1.5">
                <Label htmlFor="txn-supplier">Supplier</Label>
                <Select value={supplierId} onValueChange={setSupplierId}>
                  <SelectTrigger id="txn-supplier" className="w-full">
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No supplier</SelectItem>
                    {(meta?.suppliers ?? []).map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Optional</p>
              </div>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="txn-qty">Quantity</Label>
              <Input
                id="txn-qty"
                type="number"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 120"
              />
              {errors.quantity ? (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.quantity}</p>
              ) : (
                <p className="text-xs text-muted-foreground">Negative allowed only for adjustments</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="txn-rate">Rate (₹ per unit)</Label>
              <Input
                id="txn-rate"
                type="number"
                min="0"
                step="any"
                value={unitRate}
                onChange={(e) => setUnitRate(e.target.value)}
              />
              {errors.unitRate ? <p className="text-sm text-red-600 dark:text-red-400">{errors.unitRate}</p> : null}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="txn-date">Date</Label>
            <Input id="txn-date" type="date" value={txnDate} onChange={(e) => setTxnDate(e.target.value)} />
            {errors.txnDate ? <p className="text-sm text-red-600 dark:text-red-400">{errors.txnDate}</p> : null}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving…' : 'Record transaction'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Void transaction dialog
// ---------------------------------------------------------------------------

function VoidTxnDialog({
  txn,
  open,
  onOpenChange,
}: {
  txn: TxnRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  function close() {
    setReason('')
    setError('')
    onOpenChange(false)
  }

  const mutation = useMutation({
    mutationFn: () =>
      api(`/api/inventory/transactions/${txn?.id}/void`, {
        method: 'POST',
        body: { reason: reason.trim() },
      }),
    onSuccess: () => {
      toast.success('Transaction voided')
      close()
      queryClient.invalidateQueries()
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Something went wrong'),
  })

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (reason.trim().length < 5) {
      setError('Reason must be at least 5 characters')
      return
    }
    setError('')
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
          <DialogTitle>Void transaction</DialogTitle>
          <DialogDescription>This cannot be undone.</DialogDescription>
        </DialogHeader>
        {txn ? (
          <div className="rounded-md border bg-muted/40 p-3 text-sm">
            <p className="font-medium">
              {txn.materialName} · {TXN_TYPE_LABELS[txn.txnType]}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {formatQty(txn.quantity)} {txn.unit} · {formatMoney(txn.totalCost)} · {formatDate(txn.txnDate)}
            </p>
          </div>
        ) : null}
        <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          Voiding is permanent. The transaction stays visible with a red flag and is excluded from all totals.
        </p>
        <form onSubmit={submit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="void-reason">Reason for voiding</Label>
            <Textarea
              id="void-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Duplicate entry for the same delivery"
              rows={3}
            />
            {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={mutation.isPending}>
              {mutation.isPending ? 'Voiding…' : 'Void transaction'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Inventory view
// ---------------------------------------------------------------------------

export default function InventoryView({ user }: { user: SessionUser }) {
  const isAdmin = user.role === 'ADMIN'
  const canManage = user.role === 'ADMIN' || user.role === 'PROJECT_MANAGER'

  const [page, setPage] = useState(1)
  const [projectId, setProjectId] = useState('all')
  const [materialId, setMaterialId] = useState('all')
  const [type, setType] = useState('all')
  const [voided, setVoided] = useState('all')

  const { data: meta } = useQuery({
    queryKey: ['meta'],
    queryFn: () => api<MetaResponse>('/api/meta'),
  })

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['inventory', page, projectId, materialId, type, voided],
    queryFn: () =>
      api<TxnListResponse>(
        withParams('/api/inventory/transactions', {
          page,
          limit: 15,
          projectId,
          materialId,
          type,
          voided,
        }),
      ),
  })

  const [recordOpen, setRecordOpen] = useState(false)
  const [voidTxn, setVoidTxn] = useState<TxnRow | null>(null)

  const summary = data?.summary
  const txnCount = summary?.txnCount ?? data?.total ?? 0
  const voidedCount = summary?.voidedCount ?? 0

  const rows = data?.items ?? []

  return (
    <div className="space-y-4">
      <PageHeader
        title="Inventory"
        description="Every stock movement — procurement, consumption and adjustments."
      >
        {canManage ? (
          <Button onClick={() => setRecordOpen(true)}>
            <Plus aria-hidden /> Record Transaction
          </Button>
        ) : null}
      </PageHeader>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Spend (filtered)" value={formatMoneyCompact(summary?.spend ?? 0)} icon={IndianRupee} />
        <StatCard label="Transactions" value={txnCount.toLocaleString('en-IN')} icon={Package} />
        <StatCard label="Voided" value={voidedCount.toLocaleString('en-IN')} icon={Ban} tone="danger" />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Select
          value={projectId}
          onValueChange={(v) => {
            setProjectId(v)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-full sm:w-[200px]" aria-label="Filter by project">
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

        <Select
          value={materialId}
          onValueChange={(v) => {
            setMaterialId(v)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-full sm:w-[190px]" aria-label="Filter by material">
            <SelectValue placeholder="All materials" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All materials</SelectItem>
            {(meta?.materials ?? []).map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={type}
          onValueChange={(v) => {
            setType(v)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-full sm:w-[160px]" aria-label="Filter by type">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {TXN_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {TXN_TYPE_LABELS[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={voided}
          onValueChange={(v) => {
            setVoided(v)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-full sm:w-[170px]" aria-label="Filter by voided state">
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any</SelectItem>
            <SelectItem value="false">Active only</SelectItem>
            <SelectItem value="true">Voided only</SelectItem>
          </SelectContent>
        </Select>
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
                icon={Boxes}
                title="No transactions found"
                description="Record a transaction or adjust the filters."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Material</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead>Recorded by</TableHead>
                    <TableHead>Status</TableHead>
                    {isAdmin ? (
                      <TableHead className="w-10">
                        <span className="sr-only">Actions</span>
                      </TableHead>
                    ) : null}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((t) => (
                    <TableRow key={t.id} className={cn(t.voidedAt && 'opacity-60')}>
                      <TableCell className="whitespace-nowrap">{formatDate(t.txnDate)}</TableCell>
                      <TableCell className="whitespace-nowrap font-medium">{t.projectName}</TableCell>
                      <TableCell>
                        <span className="font-medium">{t.materialName}</span>
                        <span className="block text-xs text-muted-foreground">{t.unit}</span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {t.supplierName ?? '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn('whitespace-nowrap', TXN_TYPE_BADGE[t.txnType])}>
                          {TXN_TYPE_LABELS[t.txnType]}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right tabular-nums">
                        {formatQty(t.quantity)} <span className="text-xs text-muted-foreground">{t.unit}</span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right tabular-nums">
                        {t.unitRate > 0 ? formatMoney(t.unitRate) : '—'}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right tabular-nums">
                        {t.txnType === 'IN' ? formatMoney(t.totalCost) : '—'}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">{t.recordedByName}</TableCell>
                      <TableCell>
                        {t.voidedAt ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="outline" className={cn('whitespace-nowrap', VOIDED_BADGE)}>
                                Voided
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>{t.voidReason || 'No reason recorded'}</TooltipContent>
                          </Tooltip>
                        ) : (
                          <Badge variant="outline" className={cn('whitespace-nowrap', ACTIVE_BADGE)}>
                            Active
                          </Badge>
                        )}
                      </TableCell>
                      {isAdmin ? (
                        <TableCell className="text-right">
                          {!t.voidedAt ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  aria-label={`Actions for ${t.materialName} transaction`}
                                >
                                  <MoreHorizontal className="h-4 w-4" aria-hidden />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem variant="destructive" onClick={() => setVoidTxn(t)}>
                                  <Ban aria-hidden /> Void transaction
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : null}
                        </TableCell>
                      ) : null}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
          {data ? (
            <TablePagination page={data.page} limit={data.limit} total={data.total} onPageChange={setPage} />
          ) : null}
        </div>
      )}

      <RecordTxnDialog meta={meta} open={recordOpen} onOpenChange={setRecordOpen} />

      <VoidTxnDialog txn={voidTxn} open={!!voidTxn} onOpenChange={(o) => !o && setVoidTxn(null)} />
    </div>
  )
}
