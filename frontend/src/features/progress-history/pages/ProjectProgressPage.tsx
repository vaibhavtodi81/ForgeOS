// Imports useEffect, useMemo, useState from react so this module can reuse that component, helper, or library.
import { useEffect, useMemo, useState } from 'react'
// Imports AlertCircle, ArrowUpRight, BarChart3, CalendarDays, ClipboardList, FilterX, Users, Wrench from lucide-react so this module can reuse that component, helper, or library.
import { AlertCircle, ArrowUpRight, BarChart3, CalendarDays, ClipboardList, FilterX, Users, Wrench } from 'lucide-react'
// Imports AppShell from ../../app-shell/components/AppShell so this module can reuse that component, helper, or library.
import { AppShell } from '../../app-shell/components/AppShell'
// Imports Breadcrumbs from ../../app-shell/components/Breadcrumbs so this module can reuse that component, helper, or library.
import { Breadcrumbs } from '../../app-shell/components/Breadcrumbs'
// Imports useProjects from ../../projects/useProjects so this module can reuse that component, helper, or library.
import { useProjects } from '../../projects/useProjects'
// Imports fetchAllDailyLogs from ../../daily-logs/data/dailyLogApi so this module can reuse that component, helper, or library.
import { fetchAllDailyLogs } from '../../daily-logs/data/dailyLogApi'
// Imports type  DailyLog from ../../daily-logs/data/dailyLogApi so this module can reuse that component, helper, or library.
import type { DailyLog } from '../../daily-logs/data/dailyLogApi'
// Imports ProjectOperationsReports from ../components/ProjectOperationsReports so this module can reuse that component, helper, or library.
import { ProjectOperationsReports } from '../components/ProjectOperationsReports'

// Continues the component or data expression so its related values and behavior stay grouped together.
interface ProjectProgressPageProps {
  // Sets the projectId field so the surrounding object or component receives this setting.
  projectId: string
// Closes the current block or object so the grouped statements or settings end here.
}

// Stores the value in noLogs so later lines can reuse this data or behavior for the current feature.
const noLogs: DailyLog[] = []

// Defines dateLabel so this module can perform its named task when needed.
function dateLabel(value: string) {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return new Date(`${value.slice(0, 10)}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines ProjectProgressPage so this module can perform its named task when needed.
export function ProjectProgressPage({ projectId }: ProjectProgressPageProps) {
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const { projects, isLoading: projectsLoading } = useProjects()
  // Stores the value in project so later lines can reuse this data or behavior for the current feature.
  const project = projects.find((entry) => String(entry.id) === projectId)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [loadResult, setLoadResult] = useState<{ key: string; logs: DailyLog[]; error: string | null } | null>(null)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [fromDate, setFromDate] = useState('')
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [toDate, setToDate] = useState('')
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [retryCount, setRetryCount] = useState(0)
  // Stores the value in requestKey so later lines can reuse this data or behavior for the current feature.
  const requestKey = `${projectId}:${fromDate}:${toDate}:${retryCount}`

  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  useEffect(() => {
    // Stores the value in controller so later lines can reuse this data or behavior for the current feature.
    const controller = new AbortController()
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    fetchAllDailyLogs(projectId, { from: fromDate || undefined, to: toDate || undefined }, controller.signal)
      // Continues the component or data expression so its related values and behavior stay grouped together.
      .then((logs) => setLoadResult({ key: requestKey, logs, error: null }))
      // Continues the component or data expression so its related values and behavior stay grouped together.
      .catch((cause: unknown) => {
        // Checks this condition before continuing so the code can choose the correct path for the current state.
        if (!controller.signal.aborted) {
          // Calls this helper or component so the feature can perform the operation or render the control represented here.
          setLoadResult({
            // Sets the key field so the surrounding object or component receives this setting.
            key: requestKey,
            // Sets the logs field so the surrounding object or component receives this setting.
            logs: [],
            // Sets the error field so the surrounding object or component receives this setting.
            error: cause instanceof Error ? cause.message : 'Unable to load progress history.',
          // Continues the component or data expression so its related values and behavior stay grouped together.
          })
        // Closes the current block or object so the grouped statements or settings end here.
        }
      // Continues the component or data expression so its related values and behavior stay grouped together.
      })
    // Returns the result so the caller or React receives the value or interface this function provides.
    return () => controller.abort()
  // Continues the component or data expression so its related values and behavior stay grouped together.
  }, [projectId, fromDate, toDate, retryCount, requestKey])

  // Stores the value in currentLoadResult so later lines can reuse this data or behavior for the current feature.
  const currentLoadResult = loadResult?.key === requestKey ? loadResult : null
  // Stores the value in logs so later lines can reuse this data or behavior for the current feature.
  const logs = currentLoadResult?.logs ?? noLogs
  // Stores the value in error so later lines can reuse this data or behavior for the current feature.
  const error = currentLoadResult?.error ?? null
  // Stores the value in isLoading so later lines can reuse this data or behavior for the current feature.
  const isLoading = !currentLoadResult
  // Caches chronological so its calculation is repeated only when its inputs change.
  // Caches chronological so its calculation is repeated only when its inputs change.
  const chronological = useMemo(() => logs.slice().sort((a, b) => a.logDate.localeCompare(b.logDate)), [logs])
  // Stores the value in latest so later lines can reuse this data or behavior for the current feature.
  const latest = chronological.at(-1)
  // Stores the value in first so later lines can reuse this data or behavior for the current feature.
  const first = chronological[0]
  // Stores the value in previous so later lines can reuse this data or behavior for the current feature.
  const previous = chronological.at(-2)
  // Stores the value in increase so later lines can reuse this data or behavior for the current feature.
  const increase = latest && first ? Number((Number(latest.progressPercent) - Number(first.progressPercent)).toFixed(2)) : 0
  // Caches chartPoints so its calculation is repeated only when its inputs change.
  // Caches chartPoints so its calculation is repeated only when its inputs change.
  const chartPoints = useMemo(() => chronological.map((log, index) => ({
    // Continues the component or data expression so its related values and behavior stay grouped together.
    log,
    // Sets the x field so the surrounding object or component receives this setting.
    x: chronological.length < 2 ? 450 : 40 + (index / (chronological.length - 1)) * 820,
    // Sets the y field so the surrounding object or component receives this setting.
    y: 240 - (Number(log.progressPercent) / 100) * 210,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  })), [chronological])
  // Stores the value in line so later lines can reuse this data or behavior for the current feature.
  const line = chartPoints.map((point) => `${point.x},${point.y}`).join(' ')
  // Stores the value in clearFilters so later lines can reuse this data or behavior for the current feature.
  const clearFilters = () => { setFromDate(''); setToDate('') }

  // Returns the result so the caller or React receives the value or interface this function provides.
  return <AppShell currentPath={`/projects/${projectId}/progress`}>
    {/* Starts the <div> element to organize this part of the interface. */}
    <div className="mx-auto max-w-7xl p-5 sm:p-6 lg:p-10">
      {/* Starts the <Breadcrumbs> element to organize this part of the interface. */}
      <Breadcrumbs current="Progress History" />
      {/* Starts the <header> element to organize this part of the interface. */}
      <header className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        {/* Starts the <div> element to organize this part of the interface. */}
        <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9A5E3A]">{project?.name ?? `Project ${projectId}`} · {project?.code ?? projectId}</p><h1 className="mt-2 text-3xl font-bold tracking-tight">Project Progress History</h1><p className="mt-2 text-sm text-[#8E827A]">Cumulative progress recorded in daily site logs.</p></div>
        {/* Starts the <div> element to organize this part of the interface. */}
        <div className="flex items-center gap-2"><DateInput label="From" value={fromDate} onChange={setFromDate} /><DateInput label="To" value={toDate} onChange={setToDate} />{(fromDate || toDate) && <button className="mt-5 rounded-xl p-2 text-[#9A5E3A] hover:bg-[#F3E9E1]" onClick={clearFilters} type="button" aria-label="Clear date filters"><FilterX className="h-4 w-4" /></button>}</div>
      {/* Closes the <header> element so later content is no longer part of this region. */}
      </header>

      {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
      {error && <div role="alert" className="mb-5 flex items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"><span className="flex items-center gap-2"><AlertCircle size={16} />{error}</span><button type="button" onClick={() => setRetryCount((count) => count + 1)} className="font-semibold underline">Retry</button></div>}

      {/* Starts the <section> element to group related content into a meaningful region. */}
      <section className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {/* Starts the <Metric> element to organize this part of the interface. */}
        <Metric icon={<BarChart3 />} label="Current progress" value={latest ? `${Number(latest.progressPercent)}%` : '—'} detail="Latest cumulative value" />
        {/* Starts the <Metric> element to organize this part of the interface. */}
        <Metric icon={<ArrowUpRight />} label="Previous progress" value={previous ? `${Number(previous.progressPercent)}%` : first ? `${Number(first.progressPercent)}%` : '—'} detail="Prior recorded value" />
        {/* Starts the <Metric> element to organize this part of the interface. */}
        <Metric icon={<ArrowUpRight />} label="Total increase" value={`${increase >= 0 ? '+' : ''}${increase} pts`} detail="Since first log" />
        {/* Starts the <Metric> element to organize this part of the interface. */}
        <Metric icon={<ClipboardList />} label="Daily logs" value={isLoading || projectsLoading ? '—' : `${logs.length}`} detail="Recorded on project" />
        {/* Starts the <Metric> element to organize this part of the interface. */}
        <Metric icon={<CalendarDays />} label="Last updated" value={latest ? dateLabel(latest.logDate) : '—'} detail="Latest site record" />
      {/* Closes the <section> element so later content is no longer part of this region. */}
      </section>

      {/* Starts the <section> element to group related content into a meaningful region. */}
      <section className="rounded-2xl border border-[#E8E0DA] bg-white p-5 shadow-[0_8px_24px_rgba(50,50,50,0.04)] sm:p-6">
        {/* Starts the <div> element to organize this part of the interface. */}
        <div className="mb-5"><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#9A5E3A]">Progress chart</p><h2 className="mt-2 text-lg font-semibold">Cumulative project progress</h2></div>
        {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
        {isLoading ? <p aria-live="polite" className="py-12 text-center text-sm text-[#8E827A]">Loading progress history…</p> : chronological.length ? <div className="overflow-x-auto"><svg className="h-auto min-w-[620px] w-full" viewBox="0 0 900 280" role="img" aria-label="Cumulative project progress over time">
          {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
          {[0, 25, 50, 75, 100].map((value) => { const y = 240 - value * 2.1; return <g key={value}><line stroke="#EEE7E1" strokeDasharray="3 4" x1="40" x2="870" y1={y} y2={y} /><text fill="#A59A93" fontSize="11" x="5" y={y + 4}>{value}%</text></g> })}
          {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
          {chartPoints.length > 1 && <polyline fill="none" points={line} stroke="#9A5E3A" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />}
          {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
          {chartPoints.map(({ log, x, y }) => <g key={log.id}><circle cx={x} cy={y} fill="white" r="5" stroke="#9A5E3A" strokeWidth="3"><title>{dateLabel(log.logDate)}: {Number(log.progressPercent)}%</title></circle></g>)}
        {/* Closes the <svg> element so later content is no longer part of this region. */}
        </svg></div> : <p className="py-12 text-center text-sm text-[#8E827A]">No progress history is available for this date range.</p>}
      {/* Closes the <section> element so later content is no longer part of this region. */}
      </section>

      {/* Starts the <section> element to group related content into a meaningful region. */}
      <section className="mt-5 overflow-hidden rounded-2xl border border-[#E8E0DA] bg-white shadow-[0_8px_24px_rgba(50,50,50,0.04)]">
        {/* Starts the <div> element to organize this part of the interface. */}
        <div className="border-b border-[#E8E0DA] px-5 py-5"><h2 className="font-semibold">Progress history</h2><p className="mt-1 text-xs text-[#8E827A]">Daily cumulative progress and resource records</p></div>
        {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
        {isLoading ? <p className="p-8 text-center text-sm text-[#8E827A]">Loading records…</p> : logs.length ? <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left"><thead className="bg-[#FBF9F7] text-[10px] font-bold uppercase tracking-[0.12em] text-[#8E827A]"><tr><th className="px-5 py-4">Date</th><th className="px-5 py-4">Progress</th><th className="px-5 py-4">Work summary</th><th className="px-5 py-4">Workers</th><th className="px-5 py-4">Machine hours</th><th className="px-5 py-4">View</th></tr></thead><tbody className="divide-y divide-[#F1EBE6]">{chronological.slice().reverse().map((log, index, list) => {
          {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
          const nextOlder = list[index + 1]
          {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
          const change = nextOlder ? Number((Number(log.progressPercent) - Number(nextOlder.progressPercent)).toFixed(2)) : 0
          {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
          const workers = log.labourHeadCountTotal ?? log.labourEntries.reduce((sum, entry) => sum + entry.headCount, 0)
          {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
          return <tr key={log.id} className="hover:bg-[#FCFAF8]"><td className="whitespace-nowrap px-5 py-4 text-sm">{dateLabel(log.logDate)}</td><td className="px-5 py-4 text-sm font-semibold">{Number(log.progressPercent)}%</td><td className="max-w-lg px-5 py-4 text-sm text-[#595552]">{log.workSummary}<span className="mt-1 block text-xs text-[#8E827A]">{change > 0 ? '+' : ''}{change} pts</span></td><td className="px-5 py-4 text-sm"><span className="inline-flex items-center gap-1"><Users size={14} />{workers}</span></td><td className="px-5 py-4 text-sm"><span className="inline-flex items-center gap-1"><Wrench size={14} />{Number(log.machineryHoursTotal ?? 0)}h</span></td><td className="px-5 py-4"><a className="text-xs font-semibold text-[#9A5E3A]" href={`/projects/${projectId}/logs/${log.id}`}>Open log</a></td></tr>
        {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
        })}</tbody></table></div> : <p className="p-8 text-center text-sm text-[#8E827A]">No daily logs are available for this date range.</p>}
      {/* Closes the <section> element so later content is no longer part of this region. */}
      </section>

      {/* Starts the <ProjectOperationsReports> element to organize this part of the interface. */}
      <ProjectOperationsReports projectId={projectId} fromDate={fromDate} toDate={toDate} />
    {/* Closes the <div> element so later content is no longer part of this region. */}
    </div>
  {/* Closes the <AppShell> element so later content is no longer part of this region. */}
  </AppShell>
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines Metric so this module can perform its named task when needed.
function Metric({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string; detail: string }) {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return <div className="rounded-2xl border border-[#E8E0DA] bg-white p-4"><div className="flex items-center gap-2 text-[#9A5E3A]"><span className="h-4 w-4 [&>svg]:h-4 [&>svg]:w-4">{icon}</span><span className="text-xs text-[#8E827A]">{label}</span></div><p className="mt-3 text-2xl font-bold">{value}</p><p className="mt-1 text-[11px] text-[#A59A93]">{detail}</p></div>
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines DateInput so this module can perform its named task when needed.
function DateInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return <label className="text-xs text-[#8E827A]">{label}<input type="date" value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 block rounded-lg border border-[#E8E0DA] bg-white px-2 py-2 text-sm text-[#323232]" /></label>
// Closes the current block or object so the grouped statements or settings end here.
}
// File purpose: Renders the progress history screen and coordinates its page-level interactions.
