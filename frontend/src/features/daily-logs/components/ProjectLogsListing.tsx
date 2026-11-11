import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, CalendarDays, ClipboardList, FilterX, Plus, Search, Trash2, Users } from 'lucide-react'
import { ApiError } from '../../../lib/api'
import { useAuth } from '../../authentication/auth/useAuth'
import { useProjects } from '../../projects/useProjects'
import { deleteDailyLog, fetchAllDailyLogs } from '../data/dailyLogApi'
import type { DailyLog } from '../data/dailyLogApi'

interface ProjectLogsListingProps {
  projectId: string
}

const noLogs: DailyLog[] = []

function formatDate(value: string) {
  return new Date(`${value.slice(0, 10)}T12:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function editWindowOpen(log: DailyLog) {
  return (Date.now() - new Date(log.createdAt).getTime()) <= 48 * 60 * 60 * 1000
}

function goTo(path: string) {
  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

export function ProjectLogsListing({ projectId }: ProjectLogsListingProps) {
  const { user } = useAuth()
  const { projects } = useProjects()
  const project = projects.find((item) => String(item.id) === projectId)
  const [loadResult, setLoadResult] = useState<{ key: string; logs: DailyLog[]; error: string | null } | null>(null)
  const [mutationError, setMutationError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const requestKey = `${projectId}:${fromDate}:${toDate}:${retryCount}`

  useEffect(() => {
    const controller = new AbortController()
    fetchAllDailyLogs(projectId, { from: fromDate || undefined, to: toDate || undefined }, controller.signal)
      .then((logs) => setLoadResult({ key: requestKey, logs, error: null }))
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setLoadResult({
            key: requestKey,
            logs: [],
            error: cause instanceof Error ? cause.message : 'Unable to load daily logs.',
          })
        }
      })
    return () => controller.abort()
  }, [projectId, fromDate, toDate, retryCount, requestKey])

  const currentLoadResult = loadResult?.key === requestKey ? loadResult : null
  const logs = currentLoadResult?.logs ?? noLogs
  const error = mutationError ?? currentLoadResult?.error ?? null
  const isLoading = !currentLoadResult
  const visibleLogs = useMemo(() => logs.filter((log) =>
    `${log.workSummary} ${log.weather ?? ''} ${log.issues ?? ''}`.toLowerCase().includes(search.trim().toLowerCase())
  ), [logs, search])

  const latestLog = logs[0]
  const totalWorkers = Number(latestLog?.labourHeadCountTotal ?? 0)
  const hasFilters = Boolean(search || fromDate || toDate)

  const clearFilters = () => {
    setSearch('')
    setFromDate('')
    setToDate('')
  }

  const removeLog = async (log: DailyLog) => {
    if (!window.confirm(`Delete the daily log for ${formatDate(log.logDate)}? This cannot be undone.`)) return
    setMutationError(null)
    setSuccess(null)
    try {
      await deleteDailyLog(String(log.id))
      setSuccess('Daily log deleted.')
      setRetryCount((count) => count + 1)
    } catch (cause) {
      setMutationError(cause instanceof ApiError ? cause.message : 'Unable to delete this daily log.')
    }
  }

  return (
    <div className="mx-auto max-w-7xl p-5 sm:p-6 lg:p-10">
      <div className="mb-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#9A5E3A]">
            {project?.name ?? `Project ${projectId}`} · {project?.code ?? projectId}
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-[#323232]">Daily Site Logs</h1>
          <p className="mt-2 text-sm text-[#8E827A]">Daily work, resources, progress, and site conditions.</p>
        </div>
        <button
          type="button"
          disabled={isLoading || Boolean(error)}
          onClick={() => goTo(`/projects/${projectId}/logs/new`)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#323232] px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#9A5E3A] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-4 w-4" /> Add Daily Log
        </button>
      </div>

      {error && <div role="alert" className="mb-5 flex items-start justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
        <div className="flex items-start gap-3"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><div><p className="font-semibold">Daily logs could not be loaded or updated</p><p className="mt-1">{error}</p></div></div>
        <button type="button" className="shrink-0 font-semibold underline" onClick={() => setRetryCount((count) => count + 1)}>Retry</button>
      </div>}
      {success && <p role="status" className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{success}</p>}

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard icon={<ClipboardList />} label="Daily logs" value={isLoading ? '—' : `${logs.length}`} detail="Recorded on this project" />
        <SummaryCard icon={<CalendarDays />} label="Latest progress" value={latestLog ? `${Number(latestLog.progressPercent)}%` : '—'} detail="Latest reported completion" />
        <SummaryCard icon={<CalendarDays />} label="Latest log date" value={latestLog ? formatDate(latestLog.logDate) : '—'} detail="Most recent site record" />
        <SummaryCard icon={<Users />} label="Workers in latest log" value={latestLog ? String(totalWorkers) : '—'} detail="Headcount recorded on site" />
      </div>

      <section className="mb-5 rounded-2xl border border-[#E8E0DA] bg-white p-4 shadow-[0_8px_24px_rgba(50,50,50,0.04)]">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <label className="relative min-w-0 flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-[#A59A93]" /><input className="w-full rounded-xl border border-[#E8E0DA] bg-[#FBF9F7] py-2.5 pl-9 pr-3 text-sm outline-none placeholder:text-[#A59A93] focus:border-[#9A5E3A]" onChange={(event) => setSearch(event.target.value)} placeholder="Search work summary..." value={search} /></label>
          <div className="grid gap-3 sm:grid-cols-2 xl:flex">
            <label className="relative"><span className="sr-only">From date</span><CalendarDays className="absolute left-3 top-3 h-4 w-4 text-[#A59A93]" /><input className="w-full rounded-xl border border-[#E8E0DA] bg-[#FBF9F7] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#9A5E3A] xl:w-40" onChange={(event) => setFromDate(event.target.value)} type="date" value={fromDate} /></label>
            <label className="relative"><span className="sr-only">To date</span><CalendarDays className="absolute left-3 top-3 h-4 w-4 text-[#A59A93]" /><input className="w-full rounded-xl border border-[#E8E0DA] bg-[#FBF9F7] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#9A5E3A] xl:w-40" onChange={(event) => setToDate(event.target.value)} type="date" value={toDate} /></label>
          </div>
          {hasFilters && <button className="inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold text-[#9A5E3A] hover:bg-[#F3E9E1]" onClick={clearFilters} type="button"><FilterX className="h-4 w-4" /> Clear filters</button>}
        </div>
        <p className="mt-3 text-xs text-[#8E827A]">{isLoading ? 'Loading records…' : `Showing ${visibleLogs.length} of ${logs.length} logs · Newest first`}</p>
      </section>

      {isLoading ? (
        <div aria-live="polite" className="rounded-2xl border border-[#E8E0DA] bg-white p-10 text-center text-sm text-[#8E827A]">Loading daily logs…</div>
      ) : visibleLogs.length ? (
        <div className="overflow-hidden rounded-2xl border border-[#E8E0DA] bg-white shadow-[0_8px_24px_rgba(50,50,50,0.04)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead className="border-b border-[#E8E0DA] bg-[#FBF9F7] text-[10px] font-bold uppercase tracking-[0.12em] text-[#8E827A]"><tr><th className="px-5 py-4">Date</th><th className="px-5 py-4">Work summary</th><th className="px-5 py-4">Progress</th><th className="px-5 py-4">Workers</th><th className="px-5 py-4">Machine hours</th><th className="px-5 py-4">Actions</th></tr></thead>
              <tbody className="divide-y divide-[#F1EBE6]">
                {visibleLogs.map((log) => {
                  const canEdit = user?.role === 'ADMIN' || editWindowOpen(log)
                  return <tr className="hover:bg-[#FCFAF8]" key={log.id}>
                    <td className="whitespace-nowrap px-5 py-4 text-sm">{formatDate(log.logDate)}</td>
                    <td className="max-w-md px-5 py-4"><p className="truncate text-sm font-medium">{log.workSummary}</p><p className="mt-1 text-xs text-[#8E827A]">{log.weather || 'Weather not recorded'}</p></td>
                    <td className="px-5 py-4 text-sm font-semibold">{Number(log.progressPercent)}%</td>
                    <td className="px-5 py-4 text-sm">{log.labourHeadCountTotal ?? 0}</td>
                    <td className="px-5 py-4 text-sm">{Number(log.machineryHoursTotal ?? 0)}h</td>
                    <td className="px-5 py-4"><div className="flex items-center gap-3 text-xs font-semibold">
                      <button type="button" onClick={() => goTo(`/projects/${projectId}/logs/${log.id}`)} className="text-[#595552] hover:text-[#9A5E3A]">View</button>
                      <button type="button" disabled={!canEdit} title={!canEdit ? 'Project Managers can edit within 48 hours of creation.' : undefined} onClick={() => goTo(`/projects/${projectId}/logs/${log.id}/edit`)} className="text-[#595552] hover:text-[#9A5E3A] disabled:cursor-not-allowed disabled:opacity-40">Edit</button>
                      {user?.role === 'ADMIN' && <button type="button" aria-label="Delete daily log" onClick={() => void removeLog(log)} className="text-rose-700 hover:text-rose-900"><Trash2 size={15} /></button>}
                    </div></td>
                  </tr>
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#C8BCB4] bg-white p-10 text-center">
          <ClipboardList className="mx-auto h-8 w-8 text-[#B6AAA2]" />
          <h2 className="mt-3 text-lg font-semibold text-[#323232]">{logs.length === 0 ? 'No daily logs yet' : 'No matching daily logs'}</h2>
          <p className="mt-2 text-sm text-[#8E827A]">{logs.length === 0 ? 'Create a log to record work, progress, labour, and machinery.' : 'Try changing or clearing the search and date filters.'}</p>
          {logs.length === 0 && !error && <button type="button" onClick={() => goTo(`/projects/${projectId}/logs/new`)} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#323232] px-4 py-2.5 text-sm font-semibold text-white"><Plus className="h-4 w-4" /> Add Daily Log</button>}
          {hasFilters && <button type="button" onClick={clearFilters} className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[#E8E0DA] px-4 py-2.5 text-sm font-semibold text-[#9A5E3A]"><FilterX size={15} /> Clear filters</button>}
        </div>
      )}
    </div>
  )
}

function SummaryCard({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string; detail: string }) {
  return <div className="rounded-2xl border border-[#E8E0DA] bg-white p-4 shadow-[0_8px_24px_rgba(50,50,50,0.04)]"><div className="flex items-center gap-2 text-[#9A5E3A]"><span className="h-4 w-4 [&>svg]:h-4 [&>svg]:w-4">{icon}</span><span className="text-xs font-medium text-[#8E827A]">{label}</span></div><p className="mt-3 text-2xl font-bold text-[#323232]">{value}</p><p className="mt-1 text-[11px] text-[#A59A93]">{detail}</p></div>
}
