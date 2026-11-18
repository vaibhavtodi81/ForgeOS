'use client'

import { useQuery } from '@tanstack/react-query'
import {
  CalendarDays,
  FileText,
  IndianRupee,
  MapPin,
  TrendingUp,
  User,
  Wallet,
} from 'lucide-react'
import { api } from '@/lib/client-api'
import { formatDate, formatMoney, formatMoneyCompact, formatPct, formatQty } from '@/lib/format'
import {
  INVOICE_STATUS_LABELS,
  PLAN_STATUS_LABELS,
  PROJECT_STATUS_LABELS,
  TXN_TYPE_LABELS,
  type ProjectDetail,
  type SessionUser,
  type TxnType,
} from '@/lib/forgeos-types'
import { cn } from '@/lib/utils'
import { EmptyState, ErrorState, StatCard, StatusBadge } from '@/components/forgeos/ui-bits'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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

function DetailItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="text-sm font-medium">{children}</div>
    </div>
  )
}

function TabEmpty({ title, description }: { title: string; description: string }) {
  return <EmptyState title={title} description={description} />
}

export function ProjectDetailDialog({
  projectId,
  open,
  onOpenChange,
}: {
  projectId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  user: SessionUser
}) {
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => api<ProjectDetail>(`/api/projects/${projectId}`),
    enabled: open && !!projectId,
  })

  const spendPct = data && data.budget > 0 ? (data.spend / data.budget) * 100 : null
  const overBudget = !!data && data.budget > 0 && data.spend > data.budget

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-4xl" aria-describedby="project-detail-desc">
        <DialogDescription id="project-detail-desc" className="sr-only">
          Project overview with plans, inventory, daily logs and invoices.
        </DialogDescription>
        {isPending ? (
          <div className="space-y-4" aria-busy="true">
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-9 w-full max-w-md" />
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
            <Skeleton className="h-32 w-full" />
          </div>
        ) : isError ? (
          <ErrorState message={error.message} onRetry={() => refetch()} />
        ) : data ? (
          <div className="space-y-5">
            <DialogHeader>
              <div className="flex flex-wrap items-center gap-2">
                <DialogTitle className="text-lg">{data.name}</DialogTitle>
                <Badge variant="secondary" className="font-mono text-xs">
                  {data.code}
                </Badge>
                <StatusBadge value={data.status} label={PROJECT_STATUS_LABELS[data.status]} />
              </div>
              <DialogDescription>
                {data.pmName ?? 'Unassigned'} · {data.landName}
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="overview">
              <TabsList className="flex-wrap">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="plans">Plans ({data.plans.length})</TabsTrigger>
                <TabsTrigger value="inventory">Inventory ({data.transactions.length})</TabsTrigger>
                <TabsTrigger value="logs">Logs ({data.logs.length})</TabsTrigger>
                <TabsTrigger value="invoices">Invoices ({data.invoices.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <StatCard label="Budget" value={formatMoneyCompact(data.budget)} sub={formatMoney(data.budget)} icon={Wallet} />
                  <StatCard
                    label="Spend"
                    value={formatMoneyCompact(data.spend)}
                    sub={
                      spendPct !== null ? (
                        <span className="flex items-center gap-1.5">
                          <Progress
                            value={Math.min(100, spendPct)}
                            className={cn('h-1.5 w-16', overBudget && 'bg-red-500/25 [&>div]:!bg-red-600')}
                          />
                          {Math.round(spendPct)}% of budget
                        </span>
                      ) : undefined
                    }
                    icon={TrendingUp}
                    tone={overBudget ? 'danger' : 'default'}
                  />
                  <StatCard label="Invoiced" value={formatMoneyCompact(data.invoiced)} icon={FileText} />
                  <StatCard label="Collected" value={formatMoneyCompact(data.collected)} icon={IndianRupee} tone="success" />
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-4 rounded-md border p-4 sm:grid-cols-3">
                  <DetailItem label="Status">
                    <StatusBadge value={data.status} label={PROJECT_STATUS_LABELS[data.status]} />
                  </DetailItem>
                  <DetailItem label="Start">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                      {formatDate(data.startDate)}
                    </span>
                  </DetailItem>
                  <DetailItem label="Planned end">{formatDate(data.plannedEndDate)}</DetailItem>
                  <DetailItem label="Actual end">{formatDate(data.actualEndDate)}</DetailItem>
                  <DetailItem label="Land">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                      {data.landName}
                    </span>
                  </DetailItem>
                  <DetailItem label="Manager">
                    <span className="inline-flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                      {data.pmName ?? 'Unassigned'}
                    </span>
                  </DetailItem>
                </div>
              </TabsContent>

              <TabsContent value="plans">
                {data.plans.length === 0 ? (
                  <TabEmpty title="No material plans" description="Plans for this project will appear here." />
                ) : (
                  <div className="overflow-x-auto rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Material</TableHead>
                          <TableHead className="text-right">Planned</TableHead>
                          <TableHead className="text-right">Allowance</TableHead>
                          <TableHead className="text-right">Consumed</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created by</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.plans.map((p) => (
                          <TableRow key={p.id}>
                            <TableCell className="font-medium">
                              {p.materialName}
                              <span className="block text-xs font-normal text-muted-foreground">{p.unit}</span>
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-right tabular-nums">
                              {formatQty(p.plannedQty)}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-right tabular-nums">
                              {formatPct(p.wastagePct, 0)}
                            </TableCell>
                            <TableCell
                              className={cn(
                                'whitespace-nowrap text-right tabular-nums',
                                p.consumedQty > p.plannedQty && 'text-red-600 dark:text-red-400',
                              )}
                            >
                              {formatQty(p.consumedQty)}
                            </TableCell>
                            <TableCell>
                              <StatusBadge value={p.status} label={PLAN_STATUS_LABELS[p.status]} />
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-muted-foreground">{p.createdByName}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="inventory">
                {data.transactions.length === 0 ? (
                  <TabEmpty title="No transactions" description="Stock movements for this project will appear here." />
                ) : (
                  <div className="max-h-80 overflow-auto rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow className="sticky top-0 bg-background">
                          <TableHead>Date</TableHead>
                          <TableHead>Material</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead className="text-right">Qty</TableHead>
                          <TableHead className="text-right">Rate</TableHead>
                          <TableHead className="text-right">Cost</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.transactions.map((t) => (
                          <TableRow key={t.id} className={cn(t.voidedAt && 'opacity-60')}>
                            <TableCell className="whitespace-nowrap">{formatDate(t.txnDate)}</TableCell>
                            <TableCell className="font-medium">
                              {t.materialName}
                              <span className="block text-xs font-normal text-muted-foreground">{t.unit}</span>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={cn('whitespace-nowrap', TXN_TYPE_BADGE[t.txnType])}>
                                {TXN_TYPE_LABELS[t.txnType]}
                              </Badge>
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-right tabular-nums">
                              {formatQty(t.quantity)}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-right tabular-nums">
                              {t.unitRate > 0 ? formatMoney(t.unitRate) : '—'}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-right tabular-nums">
                              {formatMoney(t.totalCost)}
                            </TableCell>
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
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="logs">
                {data.logs.length === 0 ? (
                  <TabEmpty title="No logs" description="Daily site logs for this project will appear here." />
                ) : (
                  <div className="space-y-3">
                    {data.logs.map((log) => (
                      <div key={log.id} className="rounded-md border p-3">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <p className="text-sm font-medium">{log.workDone}</p>
                          <span className="text-xs text-muted-foreground">{formatDate(log.logDate)}</span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {log.headcount} workers · by {log.createdByName}
                          {log.notes ? ` · ${log.notes}` : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="invoices">
                {data.invoices.length === 0 ? (
                  <TabEmpty title="No invoices" description="Invoices raised for this project will appear here." />
                ) : (
                  <div className="overflow-x-auto rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Invoice no</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead className="text-right">GST</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead className="text-right">Paid</TableHead>
                          <TableHead className="text-right">Balance</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.invoices.map((inv) => (
                          <TableRow key={inv.id}>
                            <TableCell className="whitespace-nowrap font-medium">{inv.invoiceNo}</TableCell>
                            <TableCell className="whitespace-nowrap text-right tabular-nums">
                              {formatMoney(inv.amount)}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-right tabular-nums">{inv.gstPct}%</TableCell>
                            <TableCell className="whitespace-nowrap text-right tabular-nums">
                              {formatMoney(inv.totalWithGst)}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-right tabular-nums">
                              {formatMoney(inv.paidAmount)}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-right tabular-nums">
                              {formatMoney(inv.balance)}
                            </TableCell>
                            <TableCell>
                              <StatusBadge value={inv.status} label={INVOICE_STATUS_LABELS[inv.status]} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
