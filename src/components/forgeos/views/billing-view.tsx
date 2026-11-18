'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  AlertTriangle,
  Ban,
  HandCoins,
  MoreHorizontal,
  Plus,
  ReceiptIndianRupee,
  Send,
  Wallet,
} from 'lucide-react'
import type {
  InvoiceListResponse,
  InvoiceRow,
  InvoiceStatus,
  MetaResponse,
  PaymentMethod,
  PaymentRow,
  SessionUser,
} from '@/lib/forgeos-types'
import {
  GST_OPTIONS,
  INVOICE_STATUSES,
  INVOICE_STATUS_LABELS,
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
} from '@/lib/forgeos-types'
import { api, ApiError, withParams } from '@/lib/client-api'
import {
  formatDate,
  formatMoney,
  formatMoneyCompact,
  formatPct,
  toDateInputValue,
} from '@/lib/format'
import {
  EmptyState,
  ErrorState,
  LoadingRows,
  PageHeader,
  StatCard,
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
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type StatusAction = { kind: 'send' | 'void'; invoice: InvoiceRow }

/** Invoice due date default: 30 days from today. */
function defaultDueDate(): string {
  return toDateInputValue(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
}

export default function BillingView({ user }: { user: SessionUser }) {
  const isFinance = user.role === 'ADMIN' || user.role === 'ACCOUNTANT'

  const [statusFilter, setStatusFilter] = useState('all')
  const [projectFilter, setProjectFilter] = useState('all')
  const [newOpen, setNewOpen] = useState(false)
  const [paymentsFor, setPaymentsFor] = useState<InvoiceRow | null>(null)
  const [statusAction, setStatusAction] = useState<StatusAction | null>(null)

  const invoicesQuery = useQuery({
    queryKey: ['invoices', statusFilter, projectFilter],
    queryFn: () =>
      api<InvoiceListResponse>(
        withParams('/api/invoices', { status: statusFilter, projectId: projectFilter }),
      ),
  })
  const metaQuery = useQuery({
    queryKey: ['meta'],
    queryFn: () => api<MetaResponse>('/api/meta'),
  })

  const queryClient = useQueryClient()

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: InvoiceStatus }) =>
      api(`/api/invoices/${id}/status`, { method: 'PATCH', body: { status } }),
    onSuccess: (_data, vars) => {
      toast.success(vars.status === 'SENT' ? 'Invoice sent' : 'Invoice voided')
      void queryClient.invalidateQueries()
    },
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : 'Something went wrong'),
  })

  const invoices = invoicesQuery.data?.items ?? []
  const summary = invoicesQuery.data?.summary
  const paymentsInvoice = paymentsFor
    ? (invoices.find((inv) => inv.id === paymentsFor.id) ?? paymentsFor)
    : null

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title="Billing & Payments" description="Client invoices, GST and collections.">
        {isFinance ? (
          <Button onClick={() => setNewOpen(true)}>
            <Plus aria-hidden /> New Invoice
          </Button>
        ) : null}
      </PageHeader>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Invoiced"
          value={summary ? formatMoneyCompact(summary.invoiced) : '—'}
          icon={ReceiptIndianRupee}
        />
        <StatCard
          label="Collected"
          value={summary ? formatMoneyCompact(summary.collected) : '—'}
          tone="success"
          icon={HandCoins}
        />
        <StatCard
          label="Receivables"
          value={summary ? formatMoneyCompact(summary.receivables) : '—'}
          tone={summary && summary.receivables > 0 ? 'danger' : 'default'}
          icon={Wallet}
        />
        <StatCard
          label="Overdue"
          value={summary ? formatMoneyCompact(summary.overdue) : '—'}
          tone={summary && summary.overdue > 0 ? 'danger' : 'default'}
          icon={AlertTriangle}
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]" aria-label="Filter by status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {INVOICE_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {INVOICE_STATUS_LABELS[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-full sm:w-[240px]" aria-label="Filter by project">
            <SelectValue placeholder="Project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All projects</SelectItem>
            {(metaQuery.data?.projects ?? []).map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {invoicesQuery.isLoading ? (
        <LoadingRows rows={6} />
      ) : invoicesQuery.isError ? (
        <ErrorState
          message={invoicesQuery.error instanceof Error ? invoicesQuery.error.message : 'Failed to load invoices'}
          onRetry={() => void invoicesQuery.refetch()}
        />
      ) : invoices.length === 0 ? (
        <EmptyState
          title="No invoices yet"
          description={isFinance ? 'Create the first invoice for a project.' : 'Invoices will appear here once created.'}
        />
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Project</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">GST</TableHead>
                <TableHead className="text-right">Total incl. GST</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => {
                const overdue = inv.balance > 0 && new Date(inv.dueDate).getTime() < Date.now()
                return (
                  <TableRow key={inv.id}>
                    <TableCell className="font-mono text-xs">{inv.invoiceNo}</TableCell>
                    <TableCell className="max-w-[180px] truncate">{inv.projectName}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatMoney(inv.amount)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatPct(inv.gstPct, 0)}</TableCell>
                    <TableCell className="text-right tabular-nums font-medium">{formatMoney(inv.totalWithGst)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatMoney(inv.paidAmount)}</TableCell>
                    <TableCell
                      className={
                        inv.balance > 0
                          ? 'text-right tabular-nums font-medium text-red-600 dark:text-red-400'
                          : 'text-right tabular-nums'
                      }
                    >
                      {formatMoney(inv.balance)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge value={inv.status} label={INVOICE_STATUS_LABELS[inv.status]} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {formatDate(inv.issueDate)}
                      <span className="mx-1">→</span>
                      <span className={overdue ? 'font-medium text-red-600 dark:text-red-400' : undefined}>
                        {formatDate(inv.dueDate)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            aria-label={`Actions for invoice ${inv.invoiceNo}`}
                          >
                            <MoreHorizontal className="h-4 w-4" aria-hidden />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {isFinance && inv.status === 'DRAFT' ? (
                            <DropdownMenuItem onSelect={() => setStatusAction({ kind: 'send', invoice: inv })}>
                              <Send aria-hidden /> Send
                            </DropdownMenuItem>
                          ) : null}
                          {isFinance && (inv.status === 'DRAFT' || inv.status === 'SENT') ? (
                            <DropdownMenuItem
                              variant="destructive"
                              onSelect={() => setStatusAction({ kind: 'void', invoice: inv })}
                            >
                              <Ban aria-hidden /> Void
                            </DropdownMenuItem>
                          ) : null}
                          <DropdownMenuItem onSelect={() => setPaymentsFor(inv)}>
                            <Wallet aria-hidden /> Payments
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {paymentsInvoice ? (
        <PaymentsDialog
          invoice={paymentsInvoice}
          isFinance={isFinance}
          onClose={() => setPaymentsFor(null)}
        />
      ) : null}

      <NewInvoiceDialog
        open={newOpen}
        onOpenChange={setNewOpen}
        projects={metaQuery.data?.projects ?? []}
      />

      <AlertDialog
        open={statusAction !== null}
        onOpenChange={(open) => {
          if (!open) setStatusAction(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {statusAction?.kind === 'send'
                ? `Send invoice ${statusAction.invoice.invoiceNo} to the client?`
                : `Void invoice ${statusAction?.invoice.invoiceNo ?? ''}?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {statusAction?.kind === 'send'
                ? 'It becomes collectable.'
                : 'The invoice will be cancelled and excluded from receivables.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={statusMutation.isPending}
              onClick={() => {
                if (!statusAction) return
                statusMutation.mutate({
                  id: statusAction.invoice.id,
                  status: statusAction.kind === 'send' ? 'SENT' : 'VOID',
                })
                setStatusAction(null)
              }}
            >
              {statusAction?.kind === 'send' ? 'Send' : 'Void'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Payments dialog (list + record payment form)
// ---------------------------------------------------------------------------

function PaymentsDialog({
  invoice,
  isFinance,
  onClose,
}: {
  invoice: InvoiceRow
  isFinance: boolean
  onClose: () => void
}) {
  const queryClient = useQueryClient()

  const paymentsQuery = useQuery({
    queryKey: ['payments', invoice.id],
    queryFn: () =>
      api<{ items: PaymentRow[] }>(withParams('/api/payments', { invoiceId: invoice.id })),
  })

  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState<PaymentMethod>('BANK')
  const [reference, setReference] = useState('')
  const [paidAt, setPaidAt] = useState(toDateInputValue(new Date()))

  const canRecord =
    isFinance && (invoice.status === 'SENT' || invoice.status === 'PARTIALLY_PAID')

  const amountNum = parseFloat(amount)
  const amountError =
    amount.trim() === ''
      ? null
      : isNaN(amountNum) || amountNum <= 0
        ? 'Enter an amount greater than zero'
        : amountNum > invoice.balance
          ? 'Amount exceeds the balance due'
          : null

  const recordMutation = useMutation({
    mutationFn: () =>
      api('/api/payments', {
        method: 'POST',
        body: {
          invoiceId: invoice.id,
          amount: amountNum,
          method,
          reference: reference.trim() || null,
          paidAt,
        },
      }),
    onSuccess: () => {
      toast.success('Payment recorded')
      void queryClient.invalidateQueries()
      setAmount('')
      setReference('')
    },
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : 'Something went wrong'),
  })

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (amount.trim() === '' || amountError) return
    recordMutation.mutate()
  }

  const payments = paymentsQuery.data?.items ?? []

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="font-mono text-base">{invoice.invoiceNo}</DialogTitle>
          <DialogDescription>
            {invoice.projectName} · Balance due{' '}
            <span className="font-medium tabular-nums text-foreground">
              {formatMoney(invoice.balance)}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="max-h-64 overflow-y-auto rounded-md border">
            {paymentsQuery.isLoading ? (
              <div className="p-3">
                <LoadingRows rows={3} />
              </div>
            ) : paymentsQuery.isError ? (
              <ErrorState
                message={paymentsQuery.error instanceof Error ? paymentsQuery.error.message : 'Failed to load payments'}
                onRetry={() => void paymentsQuery.refetch()}
              />
            ) : payments.length === 0 ? (
              <EmptyState title="No payments recorded" />
            ) : (
              <ul className="divide-y">
                {payments.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
                    <div className="min-w-0">
                      <p className="text-sm font-medium tabular-nums">{formatMoney(p.amount)}</p>
                      <p className="text-xs text-muted-foreground">
                        {PAYMENT_METHOD_LABELS[p.method]} · {formatDate(p.paidAt)}
                      </p>
                    </div>
                    {p.reference ? (
                      <p className="max-w-[45%] truncate font-mono text-xs text-muted-foreground">
                        {p.reference}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {canRecord ? (
            <>
              <Separator />
              <form className="space-y-3" onSubmit={onSubmit}>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="payment-amount">Amount (₹)</Label>
                    <Input
                      id="payment-amount"
                      type="number"
                      min="0"
                      step="0.01"
                      inputMode="decimal"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder={String(invoice.balance)}
                    />
                    {amountError ? (
                      <p className="text-sm text-red-600 dark:text-red-400">{amountError}</p>
                    ) : null}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Method</Label>
                    <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
                      <SelectTrigger className="w-full" aria-label="Payment method">
                        <SelectValue placeholder="Method" />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_METHODS.map((m) => (
                          <SelectItem key={m} value={m}>
                            {PAYMENT_METHOD_LABELS[m]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="payment-reference">Reference (optional)</Label>
                    <Input
                      id="payment-reference"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      placeholder="UTR / cheque no."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="payment-date">Date</Label>
                    <Input
                      id="payment-date"
                      type="date"
                      value={paidAt}
                      onChange={(e) => setPaidAt(e.target.value)}
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={recordMutation.isPending || amount.trim() === '' || amountError !== null}
                >
                  {recordMutation.isPending ? 'Recording…' : 'Record Payment'}
                </Button>
              </form>
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// New invoice dialog
// ---------------------------------------------------------------------------

function NewInvoiceDialog({
  open,
  onOpenChange,
  projects,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  projects: MetaResponse['projects']
}) {
  const queryClient = useQueryClient()

  const [projectId, setProjectId] = useState('')
  const [amount, setAmount] = useState('')
  const [gstPct, setGstPct] = useState('18')
  const [issueDate, setIssueDate] = useState(toDateInputValue(new Date()))
  const [dueDate, setDueDate] = useState(defaultDueDate())
  const [submitted, setSubmitted] = useState(false)

  function resetForm() {
    setProjectId('')
    setAmount('')
    setGstPct('18')
    setIssueDate(toDateInputValue(new Date()))
    setDueDate(defaultDueDate())
    setSubmitted(false)
  }

  function close() {
    resetForm()
    onOpenChange(false)
  }

  const amountNum = parseFloat(amount)
  const amountError =
    amount.trim() === ''
      ? null
      : isNaN(amountNum) || amountNum <= 0
        ? 'Enter an amount greater than zero'
        : null
  const dueDateError = dueDate <= issueDate ? 'Due date must be after the issue date' : null
  const valid = projectId !== '' && amountError === null && amount.trim() !== '' && dueDateError === null

  const createMutation = useMutation({
    mutationFn: () =>
      api<{ invoice: { id: string; invoiceNo: string } }>('/api/invoices', {
        method: 'POST',
        body: { projectId, amount: amountNum, gstPct: Number(gstPct), issueDate, dueDate },
      }),
    onSuccess: (data) => {
      toast.success(`Invoice ${data.invoice.invoiceNo} created as draft`)
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
    createMutation.mutate()
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
          <DialogTitle>New Invoice</DialogTitle>
          <DialogDescription>
            The invoice is created as a draft — send it to the client once you are ready to collect.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-3" onSubmit={onSubmit}>
          <div className="space-y-1.5">
            <Label>Project</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger className="w-full" aria-label="Project">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {submitted && projectId === '' ? (
              <p className="text-sm text-red-600 dark:text-red-400">Select a project</p>
            ) : null}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="invoice-amount">Amount (₹)</Label>
              <Input
                id="invoice-amount"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              {submitted && amountError ? (
                <p className="text-sm text-red-600 dark:text-red-400">{amountError}</p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label>GST</Label>
              <Select value={gstPct} onValueChange={setGstPct}>
                <SelectTrigger className="w-full" aria-label="GST percentage">
                  <SelectValue placeholder="GST" />
                </SelectTrigger>
                <SelectContent>
                  {GST_OPTIONS.map((g) => (
                    <SelectItem key={g} value={String(g)}>
                      {g}%
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="invoice-issue-date">Issue date</Label>
              <Input
                id="invoice-issue-date"
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="invoice-due-date">Due date</Label>
              <Input
                id="invoice-due-date"
                type="date"
                value={dueDate}
                min={issueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
              {submitted && dueDateError ? (
                <p className="text-sm text-red-600 dark:text-red-400">{dueDateError}</p>
              ) : null}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating…' : 'Create Invoice'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
