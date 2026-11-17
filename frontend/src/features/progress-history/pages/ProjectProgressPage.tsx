import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, ArrowUpRight, BarChart3, CalendarDays, ClipboardList, FilterX, Users, Wrench } from 'lucide-react'
import { AppShell } from '../../app-shell/components/AppShell'
import { Breadcrumbs } from '../../app-shell/components/Breadcrumbs'
import { useProjects } from '../../projects/useProjects'
import { fetchAllDailyLogs } from '../../daily-logs/data/dailyLogApi'
import type { DailyLog } from '../../daily-logs/data/dailyLogApi'
import { ProjectOperationsReports } from '../components/ProjectOperationsReports'

interface ProjectProgressPageProps {
  projectId: string
}

const noLogs: DailyLog[] = []

function dateLabel(value: string) {
  return new Date(`${value.slice(0, 10)}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function ProjectProgressPage({ projectId }: ProjectProgressPageProps) {
  const { projects, isLoading: projectsLoading } = useProjects()
  const project = projects.find((entry) => String(entry.id) === projectId)
  const [loadResult, setLoadResult] = useState<{ key: string; logs: DailyLog[]; error: string | null } | null>(null)
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
            error: cause instanceof Error ? cause.message : 'Unable to load progress history.',
          })
        }
      })
    return () => controller.abort()
  }, [projectId, fromDate, toDate, retryCount, requestKey])

  const currentLoadResult = loadResult?.key === requestKey ? loadResult : null
  const logs = currentLoadResult?.logs ?? noLogs
  const error = currentLoadResult?.error ?? null
  const isLoading = !currentLoadResult
  const chronological = useMemo(() => logs.slice().sort((a, b) => a.logDate.localeCompare(b.logDate)), [logs])
  const latest = chronological.at(-1)
  const first = chronological[0]
  const previous = chronological.at(-2)
  const increase = latest && first ? Number((Number(latest.progressPercent) - Number(first.progressPercent)).toFixed(2)) : 0
  const chartPoints = useMemo(() => chronological.map((log, index) => ({
    log,
    x: chronological.length < 2 ? 450 : 40 + (index / (chronological.length - 1)) * 820,
    y: 240 - (Number(log.progressPercent) / 100) * 210,
  })), [chronological])
  const line = chartPoints.map((point) => `${point.x},${point.y}`).join(' ')
  const clearFilters = () => { setFromDate(''); setToDate('') }

  return <AppShell currentPath={`/projects/${projectId}/progress`}>
    <div className="mx-auto max-w-7xl p-5 sm:p-6 lg:p-10">
      <Breadcrumbs current="Progress History" />
      <header className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9A5E3A]">{project?.name ?? `Project ${projectId}`} · {project?.code ?? projectId}</p><h1 className="mt-2 text-3xl font-bold tracking-tight">Project Progress History</h1><p className="mt-2 text-sm text-[#8E827A]">Cumulative progress recorded in daily site logs.</p></div>
        <div className="flex items-center gap-2"><DateInput label="From" value={fromDate} onChange={setFromDate} /><DateInput label="To" value={toDate} onChange={setToDate} />{(fromDate || toDate) && <button className="mt-5 rounded-xl p-2 text-[#9A5E3A] hover:bg-[#F3E9E1]" onClick={clearFilters} type="button" aria-label="Clear date filters"><FilterX className="h-4 w-4" /></button>}</div>
      </header>

      {error && <div role="alert" className="mb-5 flex items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"><span className="flex items-center gap-2"><AlertCircle size={16} />{error}</span><button type="button" onClick={() => setRetryCount((count) => count + 1)} className="font-semibold underline">Retry</button></div>}

      <section className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Metric icon={<BarChart3 />} label="Current progress" value={latest ? `${Number(latest.progressPercent)}%` : '—'} detail="Latest cumulative value" />
        <Metric icon={<ArrowUpRight />} label="Previous progress" value={previous ? `${Number(previous.progressPercent)}%` : first ? `${Number(first.progressPercent)}%` : '—'} detail="Prior recorded value" />
        <Metric icon={<ArrowUpRight />} label="Total increase" value={`${increase >= 0 ? '+' : ''}${increase} pts`} detail="Since first log" />
        <Metric icon={<ClipboardList />} label="Daily logs" value={isLoading || projectsLoading ? '—' : `${logs.length}`} detail="Recorded on project" />
        <Metric icon={<CalendarDays />} label="Last updated" value={latest ? dateLabel(latest.logDate) : '—'} detail="Latest site record" />
      </section>

      <section className="rounded-2xl border border-[#E8E0DA] bg-white p-5 shadow-[0_8px_24px_rgba(50,50,50,0.04)] sm:p-6">
        <div className="mb-5"><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#9A5E3A]">Progress chart</p><h2 className="mt-2 text-lg font-semibold">Cumulative project progress</h2></div>
        {isLoading ? <p aria-live="polite" className="py-12 text-center text-sm text-[#8E827A]">Loading progress history…</p> : chronological.length ? <div className="overflow-x-auto"><svg className="h-auto min-w-[620px] w-full" viewBox="0 0 900 280" role="img" aria-label="Cumulative project progress over time">
          {[0, 25, 50, 75, 100].map((value) => { const y = 240 - value * 2.1; return <g key={value}><line stroke="#EEE7E1" strokeDasharray="3 4" x1="40" x2="870" y1={y} y2={y} /><text fill="#A59A93" fontSize="11" x="5" y={y + 4}>{value}%</text></g> })}
          {chartPoints.length > 1 && <polyline fill="none" points={line} stroke="#9A5E3A" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />}
          {chartPoints.map(({ log, x, y }) => <g key={log.id}><circle cx={x} cy={y} fill="white" r="5" stroke="#9A5E3A" strokeWidth="3"><title>{dateLabel(log.logDate)}: {Number(log.progressPercent)}%</title></circle></g>)}
        </svg></div> : <p className="py-12 text-center text-sm text-[#8E827A]">No progress history is available for this date range.</p>}
      </section>

      <section className="mt-5 overflow-hidden rounded-2xl border border-[#E8E0DA] bg-white shadow-[0_8px_24px_rgba(50,50,50,0.04)]">
        <div className="border-b border-[#E8E0DA] px-5 py-5"><h2 className="font-semibold">Progress history</h2><p className="mt-1 text-xs text-[#8E827A]">Daily cumulative progress and resource records</p></div>
        {isLoading ? <p className="p-8 text-center text-sm text-[#8E827A]">Loading records…</p> : logs.length ? <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left"><thead className="bg-[#FBF9F7] text-[10px] font-bold uppercase tracking-[0.12em] text-[#8E827A]"><tr><th className="px-5 py-4">Date</th><th className="px-5 py-4">Progress</th><th className="px-5 py-4">Work summary</th><th className="px-5 py-4">Workers</th><th className="px-5 py-4">Machine hours</th><th className="px-5 py-4">View</th></tr></thead><tbody className="divide-y divide-[#F1EBE6]">{chronological.slice().reverse().map((log, index, list) => {
          const nextOlder = list[index + 1]
          const change = nextOlder ? Number((Number(log.progressPercent) - Number(nextOlder.progressPercent)).toFixed(2)) : 0
          const workers = log.labourHeadCountTotal ?? log.labourEntries.reduce((sum, entry) => sum + entry.headCount, 0)
          return <tr key={log.id} className="hover:bg-[#FCFAF8]"><td className="whitespace-nowrap px-5 py-4 text-sm">{dateLabel(log.logDate)}</td><td className="px-5 py-4 text-sm font-semibold">{Number(log.progressPercent)}%</td><td className="max-w-lg px-5 py-4 text-sm text-[#595552]">{log.workSummary}<span className="mt-1 block text-xs text-[#8E827A]">{change > 0 ? '+' : ''}{change} pts</span></td><td className="px-5 py-4 text-sm"><span className="inline-flex items-center gap-1"><Users size={14} />{workers}</span></td><td className="px-5 py-4 text-sm"><span className="inline-flex items-center gap-1"><Wrench size={14} />{Number(log.machineryHoursTotal ?? 0)}h</span></td><td className="px-5 py-4"><a className="text-xs font-semibold text-[#9A5E3A]" href={`/projects/${projectId}/logs/${log.id}`}>Open log</a></td></tr>
        })}</tbody></table></div> : <p className="p-8 text-center text-sm text-[#8E827A]">No daily logs are available for this date range.</p>}
      </section>

      <ProjectOperationsReports projectId={projectId} fromDate={fromDate} toDate={toDate} />
    </div>
  </AppShell>
}

function Metric({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string; detail: string }) {
  return <div className="rounded-2xl border border-[#E8E0DA] bg-white p-4"><div className="flex items-center gap-2 text-[#9A5E3A]"><span className="h-4 w-4 [&>svg]:h-4 [&>svg]:w-4">{icon}</span><span className="text-xs text-[#8E827A]">{label}</span></div><p className="mt-3 text-2xl font-bold">{value}</p><p className="mt-1 text-[11px] text-[#A59A93]">{detail}</p></div>
}

function DateInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="text-xs text-[#8E827A]">{label}<input type="date" value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 block rounded-lg border border-[#E8E0DA] bg-white px-2 py-2 text-sm text-[#323232]" /></label>
}
