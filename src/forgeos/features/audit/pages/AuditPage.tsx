import { useEffect, useMemo, useState } from 'react'
import { Activity, AlertCircle, ChevronLeft, ChevronRight, FilterX, History, Search, UserRound } from 'lucide-react'
import { AppShell } from '../../app-shell/components/AppShell'
import { Breadcrumbs } from '../../app-shell/components/Breadcrumbs'
import { fetchAuditLogs, fetchAuditStats } from '../data/auditApi'
import type { AuditLogListResult, AuditLogRow, AuditLogStats } from '../data/auditApi'

const PAGE_SIZE = 25

function actionTone(action: string) {
  if (action.endsWith('_DELETE') || action.endsWith('_VOID') || action === 'LOGIN_FAILED') return 'bg-[#F8ECEA] text-[#9B625A]'
  if (action.endsWith('_CREATE')) return 'bg-[#E8EFE5] text-[#617858]'
  if (action.endsWith('_UPDATE') || action.endsWith('_CHANGE') || action === 'ASSIGN' || action.endsWith('_STATUS')) return 'bg-[#F5EDE1] text-[#9A7950]'
  return 'bg-[#F1EBE6] text-[#8E827A]'
}

function formatFactValue(value: unknown): string | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'string') return value || null
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return null
}

function metaFacts(row: AuditLogRow): string[] {
  if (!row.meta) return []
  try {
    const parsed: unknown = JSON.parse(row.meta)
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return []
    const record = parsed as Record<string, unknown>
    const facts: string[] = []
    const from = formatFactValue(record.from)
    const to = formatFactValue(record.to)
    if (from || to) facts.push(`${from ?? '—'} to ${to ?? '—'}`)
    const preferredKeys = ['invoiceNo', 'project', 'material', 'name', 'email', 'logDate', 'reason', 'amount', 'status', 'code', 'phone', 'city']
    for (const key of preferredKeys) {
      if (facts.length >= 2) break
      const value = formatFactValue(record[key])
      if (value) facts.push(`${key}: ${value}`)
    }
    return facts.slice(0, 2)
  } catch {
    return []
  }
}

function formatTime(value: string) {
  return new Date(value).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
}

function shortId(value: string | null) {
  if (!value) return null
  return value.length > 10 ? `${value.slice(0, 10)}…` : value
}

export function AuditPage() {
  const [statsResult, setStatsResult] = useState<{ data: AuditLogStats | null; error: string | null } | null>(null)
  const [statsRetry, setStatsRetry] = useState(0)
  const [loadResult, setLoadResult] = useState<{ key: string; result: AuditLogListResult | null; error: string | null } | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [action, setAction] = useState('')
  const [entityType, setEntityType] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const requestKey = `${action}:${entityType}:${search}:${page}:${retryCount}`

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 350)
    return () => clearTimeout(timer)
  }, [searchInput])

  const changeAction = (value: string) => {
    setAction(value)
    setPage(1)
  }

  const changeEntityType = (value: string) => {
    setEntityType(value)
    setPage(1)
  }

  useEffect(() => {
    const controller = new AbortController()
    fetchAuditStats(controller.signal)
      .then((data) => setStatsResult({ data, error: null }))
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setStatsResult({ data: null, error: cause instanceof Error ? cause.message : 'Unable to load audit statistics.' })
        }
      })
    return () => controller.abort()
  }, [statsRetry])

  useEffect(() => {
    const controller = new AbortController()
    fetchAuditLogs(
      {
        page,
        limit: PAGE_SIZE,
        ...(action ? { action } : {}),
        ...(entityType ? { entityType } : {}),
        ...(search ? { search } : {}),
      },
      controller.signal,
    )
      .then((result) => setLoadResult({ key: requestKey, result, error: null }))
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setLoadResult({
            key: requestKey,
            result: null,
            error: cause instanceof Error ? cause.message : 'Unable to load audit logs.',
          })
        }
      })
    return () => controller.abort()
  }, [action, entityType, search, page, requestKey])

  const currentLoadResult = loadResult?.key === requestKey ? loadResult : null
  const result = currentLoadResult?.result ?? null
  const isLoading = !currentLoadResult
  const error = currentLoadResult?.error ?? null
  const stats = statsResult?.data ?? null

  const actionOptions = useMemo(() => [...new Set([
    ...(stats?.byAction.map((entry) => entry.action) ?? []),
    ...(result?.items.map((item) => item.action) ?? []),
  ])].sort(), [stats, result])
  const entityTypeOptions = useMemo(() => {
    const types = new Set(result?.items
      .map((item) => item.entityType)
      .filter((type): type is string => Boolean(type)) ?? [])
    if (entityType) types.add(entityType)
    return [...types].sort()
  }, [result, entityType])

  const total = result?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / (result?.limit ?? PAGE_SIZE)))
  const topAction = stats?.byAction[0] ?? null
  const topActor = stats?.byActor[0] ?? null
  const busiestDay = stats ? stats.last7Days.reduce((current, entry) => entry.count > current.count ? entry : current, { label: '', count: -1, date: '' }) : null
  const maxDayCount = stats ? Math.max(1, ...stats.last7Days.map((entry) => entry.count)) : 1
  const hasFilters = Boolean(action || entityType || search)

  const clearFilters = () => {
    setAction('')
    setEntityType('')
    setSearchInput('')
    setSearch('')
  }

  return <AppShell currentPath="/app/audit">
    <div className="mx-auto max-w-[1400px] p-5 sm:p-6 lg:p-8">
      <Breadcrumbs current="Audit Logs" />
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-[#323232] sm:text-3xl">Audit Logs</h1>
        <p className="mt-2 text-sm text-[#8E827A]">Every write and sign-in event recorded across the ForgeOS workspace.</p>
      </header>

      {statsResult?.error && (
        <div role="alert" className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-[#E8C7BD] bg-white p-4 text-sm text-[#8A5143]">
          <span className="flex items-center gap-2"><AlertCircle size={16} />{statsResult.error}</span>
          <button type="button" onClick={() => setStatsRetry((value) => value + 1)} className="font-semibold underline">Retry</button>
        </div>
      )}

      <section className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<History size={20} />} label="Total events" value={stats ? String(stats.total) : '—'} detail="All recorded audit events" loading={!stats} />
        <StatCard icon={<Activity size={20} />} label="Top action" value={topAction ? topAction.action.replaceAll('_', ' ') : '—'} detail={topAction ? `${topAction.count} events` : 'No events recorded'} loading={!stats} />
        <StatCard icon={<UserRound size={20} />} label="Top actor" value={topActor ? topActor.actorName : '—'} detail={topActor ? `${topActor.count} events` : 'No actors recorded'} loading={!stats} />
        <StatCard icon={<Activity size={20} />} label="Busiest day" value={busiestDay && busiestDay.count > 0 ? busiestDay.label : '—'} detail={busiestDay && busiestDay.count > 0 ? `${busiestDay.count} events` : 'No events in the last 7 days'} loading={!stats} />
      </section>

      {stats && (
        <section className="mb-5 rounded-2xl border border-[#C8BCB4]/70 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-semibold text-[#323232]">Events in the last 7 days</h2>
              <p className="mt-1 text-xs text-[#8E827A]">Daily audit activity across the workspace.</p>
            </div>
            <span className="rounded-full bg-[#F3E9E1] px-2.5 py-1 text-xs font-semibold text-[#9A5E3A]">{stats.last7Days.reduce((sum, entry) => sum + entry.count, 0)} events</span>
          </div>
          <div className="flex items-end justify-between gap-2 sm:gap-4">
            {stats.last7Days.map((entry) => (
              <div key={entry.date} className="flex min-w-0 flex-1 flex-col items-center gap-2" title={`${entry.label}: ${entry.count} events`}>
                <span className="text-[10px] font-semibold text-[#8E827A]">{entry.count}</span>
                <div className="flex h-20 w-full items-end overflow-hidden rounded-t-lg bg-[#F7F3EE]">
                  <div className="w-full rounded-t-lg bg-[#9A5E3A]/85 transition-all" style={{ height: entry.count > 0 ? `${Math.max(8, (entry.count / maxDayCount) * 100)}%` : '2%' }} />
                </div>
                <span className="w-full truncate text-center text-[10px] text-[#8E827A]">{entry.label}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="overflow-hidden rounded-2xl border border-[#C8BCB4]/70 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[#E8DCD4] p-5 xl:flex-row xl:items-center">
          <label className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-[#A59A93]" />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search actor, entity id, or details..."
              aria-label="Search audit logs"
              className="w-full rounded-xl border border-[#C8BCB4] bg-white py-2.5 pl-9 pr-3 text-sm outline-none placeholder:text-[#A59A93] focus:border-[#9A5E3A]"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2 xl:flex">
            <label className="block">
              <span className="sr-only">Filter by action</span>
              <select value={action} onChange={(event) => changeAction(event.target.value)} className="w-full rounded-xl border border-[#C8BCB4] bg-white px-3 py-2.5 text-sm text-[#595552] outline-none focus:border-[#9A5E3A] xl:w-52">
                <option value="">All actions</option>
                {actionOptions.map((option) => <option key={option} value={option}>{option.replaceAll('_', ' ')}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="sr-only">Filter by entity type</span>
              <select value={entityType} onChange={(event) => changeEntityType(event.target.value)} className="w-full rounded-xl border border-[#C8BCB4] bg-white px-3 py-2.5 text-sm text-[#595552] outline-none focus:border-[#9A5E3A] xl:w-44">
                <option value="">All entity types</option>
                {entityTypeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
          </div>
          {hasFilters && (
            <button type="button" onClick={clearFilters} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold text-[#9A5E3A] hover:bg-[#F3E9E1]">
              <FilterX className="h-4 w-4" /> Clear filters
            </button>
          )}
        </div>

        {error && (
          <div role="alert" className="flex items-center justify-between gap-3 border-b border-[#E8DCD4] bg-[#F8ECEA] px-5 py-4 text-sm text-[#9B625A]">
            <span className="flex items-center gap-2"><AlertCircle size={16} />{error}</span>
            <button type="button" onClick={() => setRetryCount((count) => count + 1)} className="font-semibold underline">Retry</button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="bg-[#F7F3EE] text-xs text-[#8E827A]">
              <tr>
                <th className="px-5 py-4 font-medium">Time</th>
                <th className="px-5 py-4 font-medium">Actor</th>
                <th className="px-5 py-4 font-medium">Action</th>
                <th className="px-5 py-4 font-medium">Entity</th>
                <th className="px-5 py-4 font-medium">IP</th>
                <th className="px-5 py-4 font-medium">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8DCD4]">
              {isLoading && (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-[#8E827A]" aria-live="polite">Loading audit logs…</td></tr>
              )}
              {!isLoading && !error && result && result.items.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-[#8E827A]">No audit events match the current filters.</td></tr>
              )}
              {!isLoading && !error && result?.items.map((row) => {
                const facts = metaFacts(row)
                return <tr key={row.id} className="hover:bg-[#F7F3EE]/60">
                  <td className="whitespace-nowrap px-5 py-4 text-sm text-[#595552]"><time dateTime={row.createdAt}>{formatTime(row.createdAt)}</time></td>
                  <td className="px-5 py-4 text-sm font-medium text-[#323232]">{row.actorName ?? 'System'}</td>
                  <td className="px-5 py-4"><span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${actionTone(row.action)}`}>{row.action.replaceAll('_', ' ')}</span></td>
                  <td className="px-5 py-4 text-sm text-[#595552]">
                    <span className="font-medium">{row.entityType ?? '—'}</span>
                    {row.entityId && <span className="ml-1.5 font-mono text-xs text-[#8E827A]" title={row.entityId}>#{shortId(row.entityId)}</span>}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 font-mono text-xs text-[#8E827A]">{row.ip ?? '—'}</td>
                  <td className="max-w-xs px-5 py-4 text-xs text-[#8E827A]">{facts.length ? facts.join(' · ') : '—'}</td>
                </tr>
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E8DCD4] px-5 py-4">
          <p className="text-xs text-[#8E827A]">{isLoading ? 'Loading…' : `${total} event${total === 1 ? '' : 's'} · Page ${page} of ${totalPages}`}</p>
          <div className="flex items-center gap-2">
            <button type="button" disabled={page <= 1 || isLoading} onClick={() => setPage((value) => Math.max(1, value - 1))} className="inline-flex items-center gap-1 rounded-xl border border-[#C8BCB4] bg-white px-3 py-2 text-xs font-semibold text-[#595552] disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft size={14} /> Previous</button>
            <button type="button" disabled={page >= totalPages || isLoading} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} className="inline-flex items-center gap-1 rounded-xl border border-[#C8BCB4] bg-white px-3 py-2 text-xs font-semibold text-[#595552] disabled:cursor-not-allowed disabled:opacity-40">Next <ChevronRight size={14} /></button>
          </div>
        </div>
      </section>
    </div>
  </AppShell>
}

function StatCard({ icon, label, value, detail, loading }: { icon: React.ReactNode; label: string; value: string; detail: string; loading: boolean }) {
  return <div className="rounded-2xl border border-[#C8BCB4]/70 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm text-[#8E827A]">{label}</p>
        <h2 className="mt-2 truncate text-xl font-semibold text-[#323232]">{loading ? '—' : value}</h2>
        <p className="mt-1 text-xs text-[#A59A93]">{loading ? 'Loading…' : detail}</p>
      </div>
      <div className="shrink-0 rounded-xl bg-[#F7F3EE] p-3 text-[#595552]">{icon}</div>
    </div>
  </div>
}
