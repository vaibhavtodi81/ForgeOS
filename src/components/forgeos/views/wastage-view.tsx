'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Boxes, Package, Percent } from 'lucide-react'
import type { MetaResponse, SessionUser, WastageOverviewResponse } from '@/lib/forgeos-types'
import { PLAN_STATUS_LABELS } from '@/lib/forgeos-types'
import { api, withParams } from '@/lib/client-api'
import { formatPct, formatQty } from '@/lib/format'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  EmptyState,
  ErrorState,
  LoadingRows,
  PageHeader,
  StatCard,
  StatusBadge,
} from '@/components/forgeos/ui-bits'
import { cn } from '@/lib/utils'

type SortMode = 'worst' | 'name'

function varianceClass(varianceQty: number): string {
  if (varianceQty > 0) return 'font-medium text-red-600 dark:text-red-400'
  if (varianceQty < 0) return 'font-medium text-emerald-600 dark:text-emerald-400'
  return ''
}

function wastageClass(wastagePct: number | null): string {
  if (wastagePct == null) return 'text-muted-foreground'
  if (wastagePct > 5) return 'font-medium text-red-600 dark:text-red-400'
  if (wastagePct > 0) return 'text-amber-600 dark:text-amber-400'
  if (wastagePct < 0) return 'text-emerald-600 dark:text-emerald-400'
  return 'text-muted-foreground'
}

export default function WastageView({ user }: { user: SessionUser }) {
  const [projectId, setProjectId] = useState('all')
  const [sort, setSort] = useState<SortMode>('worst')

  const metaQuery = useQuery({
    queryKey: ['meta'],
    queryFn: () => api<MetaResponse>('/api/meta'),
  })

  const wastageQuery = useQuery({
    queryKey: ['wastage-overview', projectId],
    queryFn: () =>
      api<WastageOverviewResponse>(withParams('/api/wastage/overview', { projectId })),
  })

  const rows = useMemo(() => {
    const items = wastageQuery.data?.items ?? []
    if (sort === 'name') {
      return [...items].sort((a, b) => a.projectName.localeCompare(b.projectName))
    }
    return items
  }, [wastageQuery.data, sort])

  const portfolio = wastageQuery.data?.portfolio
  const avgTone =
    portfolio?.avgWastagePct == null
      ? 'default'
      : portfolio.avgWastagePct > 5
        ? 'danger'
        : portfolio.avgWastagePct > 2
          ? 'warning'
          : 'success'

  return (
    <div className="space-y-6">
      <PageHeader title="Wastage Analysis" description="Planned vs actual material burn across the portfolio.">
        <Select value={projectId} onValueChange={setProjectId}>
          <SelectTrigger className="w-full sm:w-[220px]" aria-label="Filter by project">
            <SelectValue placeholder="All projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All projects</SelectItem>
            {(metaQuery.data?.projects ?? []).map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => setSort(v as SortMode)}>
          <SelectTrigger className="w-full sm:w-[170px]" aria-label="Sort rows">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="worst">Worst first</SelectItem>
            <SelectItem value="name">Project A–Z</SelectItem>
          </SelectContent>
        </Select>
      </PageHeader>

      {wastageQuery.isPending ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-[110px] rounded-xl" />
            ))}
          </div>
          <LoadingRows rows={6} />
        </>
      ) : wastageQuery.error || !wastageQuery.data ? (
        <ErrorState
          message={wastageQuery.error?.message ?? 'Failed to load wastage data.'}
          onRetry={() => void wastageQuery.refetch()}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              label="Planned Qty"
              value={formatQty(portfolio?.totalPlanned ?? null)}
              sub="Across all planned materials"
              icon={Boxes}
            />
            <StatCard
              label="Consumed Qty"
              value={formatQty(portfolio?.totalConsumed ?? null)}
              sub="Total consumed to date"
              icon={Package}
            />
            <StatCard
              label="Avg Wastage"
              value={formatPct(portfolio?.avgWastagePct ?? null)}
              sub="Portfolio average"
              tone={avgTone}
              icon={Percent}
            />
          </div>

          <p className="text-xs text-muted-foreground">
            Wastage % = (consumed − estimated requirement) ÷ estimated requirement. Estimated
            requirement = planned qty ÷ (1 + allowance %).
          </p>

          {rows.length === 0 ? (
            <EmptyState
              icon={Percent}
              title="No material plans yet"
              description="Create plans from the Material Plans page to start tracking wastage."
            />
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Material</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead className="text-right">Planned</TableHead>
                    <TableHead className="text-right">Consumed</TableHead>
                    <TableHead className="text-right">Variance</TableHead>
                    <TableHead className="text-right">Wastage %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow
                      key={`${r.projectId}-${r.materialId}`}
                      className={
                        r.wastagePct != null && r.wastagePct > 8
                          ? 'bg-red-50 dark:bg-red-500/5'
                          : undefined
                      }
                    >
                      <TableCell className="font-medium">{r.projectName}</TableCell>
                      <TableCell>{r.materialName}</TableCell>
                      <TableCell>
                        <StatusBadge value={r.status} label={PLAN_STATUS_LABELS[r.status]} />
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right tabular-nums">
                        {formatQty(r.plannedQty)}{' '}
                        <span className="text-muted-foreground">{r.unit}</span>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatQty(r.consumedQty)}
                      </TableCell>
                      <TableCell className={cn('text-right tabular-nums', varianceClass(r.varianceQty))}>
                        {formatQty(r.varianceQty)}
                      </TableCell>
                      <TableCell className={cn('text-right tabular-nums', wastageClass(r.wastagePct))}>
                        {r.wastagePct == null ? '—' : formatPct(r.wastagePct)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
