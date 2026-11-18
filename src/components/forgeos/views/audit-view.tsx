'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CalendarDays, History, ScrollText, UserCircle, X } from 'lucide-react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import type { AuditRow, AuditStatsResponse, Paginated, SessionUser } from '@/lib/forgeos-types'
import { api, withParams } from '@/lib/client-api'
import { formatDateTime } from '@/lib/format'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
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
  SectionCard,
  StatCard,
  StatusBadge,
  TablePagination,
} from '@/components/forgeos/ui-bits'

const PAGE_LIMIT = 25

function titleCase(value: string): string {
  return value
    .replaceAll('_', ' ')
    .split(' ')
    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : word))
    .join(' ')
}

function entityLabel(row: AuditRow): string {
  if (!row.entityType) return '—'
  return row.entityId ? `${row.entityType} · ${row.entityId.slice(0, 8)}` : row.entityType
}

function prettyMeta(meta: string | null): string {
  if (!meta) return '—'
  try {
    return JSON.stringify(JSON.parse(meta), null, 2)
  } catch {
    return meta
  }
}

export default function AuditView({ user }: { user: SessionUser }) {
  const [page, setPage] = useState(1)
  const [action, setAction] = useState('all')
  const [actorId, setActorId] = useState('all')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selected, setSelected] = useState<AuditRow | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(timer)
  }, [search])

  const statsQuery = useQuery({
    queryKey: ['audit-stats'],
    queryFn: () => api<AuditStatsResponse>('/api/audit-logs/stats'),
  })

  const logsQuery = useQuery({
    queryKey: ['audit-logs', page, action, actorId, debouncedSearch],
    queryFn: () =>
      api<Paginated<AuditRow>>(
        withParams('/api/audit-logs', {
          page,
          limit: PAGE_LIMIT,
          action,
          actorId,
          search: debouncedSearch,
        }),
      ),
  })

  const stats = statsQuery.data
  const last7Total = stats ? stats.last7Days.reduce((sum, d) => sum + d.count, 0) : 0
  const topActor = stats?.byActor[0]
  const topAction = stats?.byAction[0]
  const maxActorCount = stats && stats.byActor.length > 0
    ? Math.max(...stats.byActor.map((a) => a.count))
    : 0
  const hasFilters = action !== 'all' || actorId !== 'all' || search !== ''

  function clearFilters() {
    setAction('all')
    setActorId('all')
    setSearch('')
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Audit Logs" description="Immutable trail of every action taken in ForgeOS." />

      {statsQuery.isPending ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[110px] rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-[280px] rounded-xl" />
            ))}
          </div>
        </>
      ) : statsQuery.error || !stats ? (
        <SectionCard>
          <ErrorState
            message={statsQuery.error?.message ?? 'Failed to load audit statistics.'}
            onRetry={() => void statsQuery.refetch()}
          />
        </SectionCard>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Events" value={stats.total} sub="All time" icon={ScrollText} />
            <StatCard
              label="Top Actor"
              value={topActor?.actorName ?? '—'}
              sub={topActor ? `${topActor.count} events` : 'No activity yet'}
              icon={UserCircle}
            />
            <StatCard label="Last 7 Days" value={last7Total} sub="Events this week" icon={CalendarDays} />
            <StatCard
              label="Top Action"
              value={topAction ? titleCase(topAction.action) : '—'}
              sub={topAction ? `${topAction.count} times` : 'No activity yet'}
              icon={History}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <SectionCard title="Activity — last 7 days">
              {stats.last7Days.length === 0 ? (
                <EmptyState
                  title="No activity yet"
                  description="Daily event counts will appear here as actions are taken."
                />
              ) : (
                <div className="h-[240px]" role="img" aria-label="Audit events in the last 7 days">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.last7Days} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                      <XAxis dataKey="label" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                      <Tooltip />
                      <Bar
                        dataKey="count"
                        name="Events"
                        fill="var(--chart-1)"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={36}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </SectionCard>

            <SectionCard title="Top actors">
              {stats.byActor.length === 0 ? (
                <EmptyState
                  title="No activity yet"
                  description="The most active users will be ranked here."
                />
              ) : (
                <div className="space-y-3">
                  {stats.byActor.map((actor) => (
                    <div key={actor.actorName}>
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="truncate">{actor.actorName}</span>
                        <span className="shrink-0 tabular-nums text-xs text-muted-foreground">
                          {actor.count}
                        </span>
                      </div>
                      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary/70"
                          style={{
                            width: `${maxActorCount > 0 ? (actor.count / maxActorCount) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>
        </>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <Select
          value={action}
          onValueChange={(v) => {
            setAction(v)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-full sm:w-[210px]" aria-label="Filter by action">
            <SelectValue placeholder="All actions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All actions</SelectItem>
            {(stats?.byAction ?? []).map((a) => (
              <SelectItem key={a.action} value={a.action}>
                {titleCase(a.action)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={actorId}
          onValueChange={(v) => {
            setActorId(v)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-full sm:w-[190px]" aria-label="Filter by actor">
            <SelectValue placeholder="All actors" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All actors</SelectItem>
            {(stats?.byActor ?? []).map((a) => (
              <SelectItem key={a.actorName} value={a.actorName}>
                {a.actorName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          placeholder="Search actor, entity, meta…"
          className="w-full sm:max-w-xs"
          aria-label="Search audit logs"
        />
        {hasFilters ? (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X aria-hidden /> Clear
          </Button>
        ) : null}
      </div>

      {logsQuery.isPending ? (
        <LoadingRows rows={6} />
      ) : logsQuery.error ? (
        <ErrorState
          message={logsQuery.error.message}
          onRetry={() => void logsQuery.refetch()}
        />
      ) : logsQuery.data.items.length === 0 ? (
        <EmptyState
          icon={ScrollText}
          title="No matching events"
          description="Try clearing the filters or searching for something else."
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logsQuery.data.items.map((row) => (
                  <TableRow
                    key={row.id}
                    onClick={() => setSelected(row)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setSelected(row)
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`View details: ${titleCase(row.action)}`}
                    className="cursor-pointer"
                  >
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {formatDateTime(row.createdAt)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge value={row.action} label={row.action.replaceAll('_', ' ')} />
                    </TableCell>
                    <TableCell className="font-medium">{row.actorName ?? 'System'}</TableCell>
                    <TableCell className="max-w-[220px] truncate">{entityLabel(row)}</TableCell>
                    <TableCell className="font-mono text-xs">{row.ip ?? '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <TablePagination
            page={page}
            limit={logsQuery.data.limit || PAGE_LIMIT}
            total={logsQuery.data.total}
            onPageChange={setPage}
          />
        </>
      )}

      <Dialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null)
        }}
      >
        <DialogContent className="sm:max-w-lg">
          {selected ? (
            <>
              <DialogHeader>
                <DialogTitle>
                  {titleCase(selected.action)} — {selected.actorName ?? 'System'}
                </DialogTitle>
                <DialogDescription>Full event metadata</DialogDescription>
              </DialogHeader>
              <dl className="space-y-2 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Time</dt>
                  <dd className="font-medium">{formatDateTime(selected.createdAt)}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">IP address</dt>
                  <dd className="font-mono text-xs">{selected.ip ?? '—'}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Entity</dt>
                  <dd className="font-medium">{entityLabel(selected)}</dd>
                </div>
              </dl>
              <div>
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Meta
                </p>
                <pre className="max-h-72 overflow-auto whitespace-pre-wrap break-all rounded-md bg-muted p-3 text-xs font-mono">
                  {prettyMeta(selected.meta)}
                </pre>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
