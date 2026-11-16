// Imports useEffect, useMemo, useState from react so this module can reuse that component, helper, or library.
import { useEffect, useMemo, useState } from 'react'
// Imports AlertCircle, CalendarDays, ClipboardList, FilterX, Plus, Search, Trash2, Users from lucide-react so this module can reuse that component, helper, or library.
import { AlertCircle, CalendarDays, ClipboardList, FilterX, Plus, Search, Trash2, Users } from 'lucide-react'
// Imports ApiError from ../../../lib/api so this module can reuse that component, helper, or library.
import { ApiError } from '../../../lib/api'
// Imports useAuth from ../../authentication/auth/useAuth so this module can reuse that component, helper, or library.
import { useAuth } from '../../authentication/auth/useAuth'
// Imports useProjects from ../../projects/useProjects so this module can reuse that component, helper, or library.
import { useProjects } from '../../projects/useProjects'
// Imports deleteDailyLog, fetchAllDailyLogs from ../data/dailyLogApi so this module can reuse that component, helper, or library.
import { deleteDailyLog, fetchAllDailyLogs } from '../data/dailyLogApi'
// Imports type  DailyLog from ../data/dailyLogApi so this module can reuse that component, helper, or library.
import type { DailyLog } from '../data/dailyLogApi'

// Continues the component or data expression so its related values and behavior stay grouped together.
interface ProjectLogsListingProps {
  // Sets the projectId field so the surrounding object or component receives this setting.
  projectId: string
// Closes the current block or object so the grouped statements or settings end here.
}

// Stores the value in noLogs so later lines can reuse this data or behavior for the current feature.
const noLogs: DailyLog[] = []

// Defines formatDate so this module can perform its named task when needed.
function formatDate(value: string) {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return new Date(`${value.slice(0, 10)}T12:00:00`).toLocaleDateString('en-US', {
    // Sets the month field so the surrounding object or component receives this setting.
    month: 'short',
    // Sets the day field so the surrounding object or component receives this setting.
    day: 'numeric',
    // Sets the year field so the surrounding object or component receives this setting.
    year: 'numeric',
  // Continues the component or data expression so its related values and behavior stay grouped together.
  })
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines editWindowOpen so this module can perform its named task when needed.
function editWindowOpen(log: DailyLog) {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return (Date.now() - new Date(log.createdAt).getTime()) <= 48 * 60 * 60 * 1000
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines goTo so this module can perform its named task when needed.
function goTo(path: string) {
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  window.history.pushState({}, '', path)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  window.dispatchEvent(new PopStateEvent('popstate'))
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines ProjectLogsListing so this module can perform its named task when needed.
export function ProjectLogsListing({ projectId }: ProjectLogsListingProps) {
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const { user } = useAuth()
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const { projects } = useProjects()
  // Stores the value in project so later lines can reuse this data or behavior for the current feature.
  const project = projects.find((item) => String(item.id) === projectId)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [loadResult, setLoadResult] = useState<{ key: string; logs: DailyLog[]; error: string | null } | null>(null)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [mutationError, setMutationError] = useState<string | null>(null)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [success, setSuccess] = useState<string | null>(null)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [search, setSearch] = useState('')
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
            error: cause instanceof Error ? cause.message : 'Unable to load daily logs.',
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
  const error = mutationError ?? currentLoadResult?.error ?? null
  // Stores the value in isLoading so later lines can reuse this data or behavior for the current feature.
  const isLoading = !currentLoadResult
  // Caches visibleLogs so its calculation is repeated only when its inputs change.
  // Caches visibleLogs so its calculation is repeated only when its inputs change.
  const visibleLogs = useMemo(() => logs.filter((log) =>
    // Continues the component or data expression so its related values and behavior stay grouped together.
    `${log.workSummary} ${log.weather ?? ''} ${log.issues ?? ''}`.toLowerCase().includes(search.trim().toLowerCase())
  // Continues the component or data expression so its related values and behavior stay grouped together.
  ), [logs, search])

  // Stores the value in latestLog so later lines can reuse this data or behavior for the current feature.
  const latestLog = logs[0]
  // Stores the value in totalWorkers so later lines can reuse this data or behavior for the current feature.
  const totalWorkers = Number(latestLog?.labourHeadCountTotal ?? 0)
  // Stores the value in hasFilters so later lines can reuse this data or behavior for the current feature.
  const hasFilters = Boolean(search || fromDate || toDate)

  // Stores the value in clearFilters so later lines can reuse this data or behavior for the current feature.
  const clearFilters = () => {
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setSearch('')
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setFromDate('')
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setToDate('')
  // Closes the current block or object so the grouped statements or settings end here.
  }

  // Stores the value in removeLog so later lines can reuse this data or behavior for the current feature.
  const removeLog = async (log: DailyLog) => {
    // Checks this condition before continuing so the code can choose the correct path for the current state.
    if (!window.confirm(`Delete the daily log for ${formatDate(log.logDate)}? This cannot be undone.`)) return
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setMutationError(null)
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setSuccess(null)
    // Starts an error-handling region so failures can be caught and handled safely.
    try {
      // Waits for the asynchronous result before using it, so later work receives completed data.
      await deleteDailyLog(String(log.id))
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setSuccess('Daily log deleted.')
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setRetryCount((count) => count + 1)
    // Continues the component or data expression so its related values and behavior stay grouped together.
    } catch (cause) {
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setMutationError(cause instanceof ApiError ? cause.message : 'Unable to delete this daily log.')
    // Closes the current block or object so the grouped statements or settings end here.
    }
  // Closes the current block or object so the grouped statements or settings end here.
  }

  // Returns the result so the caller or React receives the value or interface this function provides.
  return (
    // Continues the component or data expression so its related values and behavior stay grouped together.
    <div className="mx-auto max-w-7xl p-5 sm:p-6 lg:p-10">
      {/* Starts the <div> element to organize this part of the interface. */}
      <div className="mb-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        {/* Starts the <div> element to organize this part of the interface. */}
        <div>
          {/* Starts the <p> element to organize this part of the interface. */}
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#9A5E3A]">
            {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
            {project?.name ?? `Project ${projectId}`} · {project?.code ?? projectId}
          {/* Closes the <p> element so later content is no longer part of this region. */}
          </p>
          {/* Starts the <h1> element to organize this part of the interface. */}
          <h1 className="text-3xl font-bold tracking-tight text-[#323232]">Daily Site Logs</h1>
          {/* Starts the <p> element to organize this part of the interface. */}
          <p className="mt-2 text-sm text-[#8E827A]">Daily work, resources, progress, and site conditions.</p>
        {/* Closes the <div> element so later content is no longer part of this region. */}
        </div>
        {/* Starts the <button> element to provide an action the user can activate. */}
        <button
          /* Chooses the element’s browser behavior, such as a button action or input format. */
          type="button"
          /* Controls whether the element can be used, preventing actions that are not currently available. */
          disabled={isLoading || Boolean(error)}
          /* Connects the Click event to its handler so the interface can respond to interaction. */
          onClick={() => goTo(`/projects/${projectId}/logs/new`)}
          /* Applies utility classes so the element’s layout, spacing, and appearance match the design. */
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#323232] px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#9A5E3A] disabled:cursor-not-allowed disabled:opacity-50"
        /* Continues the component or data expression so its related values and behavior stay grouped together. */
        /* Continues the component or data expression so its related values and behavior stay grouped together. */
        >
          {/* Starts the <Plus> element to organize this part of the interface. */}
          <Plus className="h-4 w-4" /> Add Daily Log
        {/* Closes the <button> element so later content is no longer part of this region. */}
        </button>
      {/* Closes the <div> element so later content is no longer part of this region. */}
      </div>

      {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
      {error && <div role="alert" className="mb-5 flex items-start justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
        {/* Starts the <div> element to organize this part of the interface. */}
        <div className="flex items-start gap-3"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><div><p className="font-semibold">Daily logs could not be loaded or updated</p><p className="mt-1">{error}</p></div></div>
        {/* Starts the <button> element to provide an action the user can activate. */}
        <button type="button" className="shrink-0 font-semibold underline" onClick={() => setRetryCount((count) => count + 1)}>Retry</button>
      {/* Closes the <div> element so later content is no longer part of this region. */}
      </div>}
      {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
      {success && <p role="status" className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{success}</p>}

      {/* Starts the <div> element to organize this part of the interface. */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {/* Starts the <SummaryCard> element to organize this part of the interface. */}
        <SummaryCard icon={<ClipboardList />} label="Daily logs" value={isLoading ? '—' : `${logs.length}`} detail="Recorded on this project" />
        {/* Starts the <SummaryCard> element to organize this part of the interface. */}
        <SummaryCard icon={<CalendarDays />} label="Latest progress" value={latestLog ? `${Number(latestLog.progressPercent)}%` : '—'} detail="Latest reported completion" />
        {/* Starts the <SummaryCard> element to organize this part of the interface. */}
        <SummaryCard icon={<CalendarDays />} label="Latest log date" value={latestLog ? formatDate(latestLog.logDate) : '—'} detail="Most recent site record" />
        {/* Starts the <SummaryCard> element to organize this part of the interface. */}
        <SummaryCard icon={<Users />} label="Workers in latest log" value={latestLog ? String(totalWorkers) : '—'} detail="Headcount recorded on site" />
      {/* Closes the <div> element so later content is no longer part of this region. */}
      </div>

      {/* Starts the <section> element to group related content into a meaningful region. */}
      <section className="mb-5 rounded-2xl border border-[#E8E0DA] bg-white p-4 shadow-[0_8px_24px_rgba(50,50,50,0.04)]">
        {/* Starts the <div> element to organize this part of the interface. */}
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          {/* Starts the <label> element to name a form control for users and assistive technology. */}
          <label className="relative min-w-0 flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-[#A59A93]" /><input className="w-full rounded-xl border border-[#E8E0DA] bg-[#FBF9F7] py-2.5 pl-9 pr-3 text-sm outline-none placeholder:text-[#A59A93] focus:border-[#9A5E3A]" onChange={(event) => setSearch(event.target.value)} placeholder="Search work summary..." value={search} /></label>
          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="grid gap-3 sm:grid-cols-2 xl:flex">
            {/* Starts the <label> element to name a form control for users and assistive technology. */}
            <label className="relative"><span className="sr-only">From date</span><CalendarDays className="absolute left-3 top-3 h-4 w-4 text-[#A59A93]" /><input className="w-full rounded-xl border border-[#E8E0DA] bg-[#FBF9F7] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#9A5E3A] xl:w-40" onChange={(event) => setFromDate(event.target.value)} type="date" value={fromDate} /></label>
            {/* Starts the <label> element to name a form control for users and assistive technology. */}
            <label className="relative"><span className="sr-only">To date</span><CalendarDays className="absolute left-3 top-3 h-4 w-4 text-[#A59A93]" /><input className="w-full rounded-xl border border-[#E8E0DA] bg-[#FBF9F7] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#9A5E3A] xl:w-40" onChange={(event) => setToDate(event.target.value)} type="date" value={toDate} /></label>
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>
          {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
          {hasFilters && <button className="inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold text-[#9A5E3A] hover:bg-[#F3E9E1]" onClick={clearFilters} type="button"><FilterX className="h-4 w-4" /> Clear filters</button>}
        {/* Closes the <div> element so later content is no longer part of this region. */}
        </div>
        {/* Starts the <p> element to organize this part of the interface. */}
        <p className="mt-3 text-xs text-[#8E827A]">{isLoading ? 'Loading records…' : `Showing ${visibleLogs.length} of ${logs.length} logs · Newest first`}</p>
      {/* Closes the <section> element so later content is no longer part of this region. */}
      </section>

      {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
      {isLoading ? (
        // Continues the component or data expression so its related values and behavior stay grouped together.
        <div aria-live="polite" className="rounded-2xl border border-[#E8E0DA] bg-white p-10 text-center text-sm text-[#8E827A]">Loading daily logs…</div>
      // Continues the component or data expression so its related values and behavior stay grouped together.
      ) : visibleLogs.length ? (
        // Continues the component or data expression so its related values and behavior stay grouped together.
        <div className="overflow-hidden rounded-2xl border border-[#E8E0DA] bg-white shadow-[0_8px_24px_rgba(50,50,50,0.04)]">
          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="overflow-x-auto">
            {/* Starts the <table> element to organize this part of the interface. */}
            <table className="w-full min-w-[850px] text-left">
              {/* Starts the <thead> element to organize this part of the interface. */}
              <thead className="border-b border-[#E8E0DA] bg-[#FBF9F7] text-[10px] font-bold uppercase tracking-[0.12em] text-[#8E827A]"><tr><th className="px-5 py-4">Date</th><th className="px-5 py-4">Work summary</th><th className="px-5 py-4">Progress</th><th className="px-5 py-4">Workers</th><th className="px-5 py-4">Machine hours</th><th className="px-5 py-4">Actions</th></tr></thead>
              {/* Starts the <tbody> element to organize this part of the interface. */}
              <tbody className="divide-y divide-[#F1EBE6]">
                {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                {visibleLogs.map((log) => {
                  const canEdit = user?.role === 'ADMIN' || editWindowOpen(log)
                  return <tr className="hover:bg-[#FCFAF8]" key={log.id}>
                    {/* Starts the <td> element to organize this part of the interface. */}
                    <td className="whitespace-nowrap px-5 py-4 text-sm">{formatDate(log.logDate)}</td>
                    {/* Starts the <td> element to organize this part of the interface. */}
                    <td className="max-w-md px-5 py-4"><p className="truncate text-sm font-medium">{log.workSummary}</p><p className="mt-1 text-xs text-[#8E827A]">{log.weather || 'Weather not recorded'}</p></td>
                    {/* Starts the <td> element to organize this part of the interface. */}
                    <td className="px-5 py-4 text-sm font-semibold">{Number(log.progressPercent)}%</td>
                    {/* Starts the <td> element to organize this part of the interface. */}
                    <td className="px-5 py-4 text-sm">{log.labourHeadCountTotal ?? 0}</td>
                    {/* Starts the <td> element to organize this part of the interface. */}
                    <td className="px-5 py-4 text-sm">{Number(log.machineryHoursTotal ?? 0)}h</td>
                    {/* Starts the <td> element to organize this part of the interface. */}
                    <td className="px-5 py-4"><div className="flex items-center gap-3 text-xs font-semibold">
                      {/* Starts the <button> element to provide an action the user can activate. */}
                      <button type="button" onClick={() => goTo(`/projects/${projectId}/logs/${log.id}`)} className="text-[#595552] hover:text-[#9A5E3A]">View</button>
                      {/* Starts the <button> element to provide an action the user can activate. */}
                      <button type="button" disabled={!canEdit} title={!canEdit ? 'Project Managers can edit within 48 hours of creation.' : undefined} onClick={() => goTo(`/projects/${projectId}/logs/${log.id}/edit`)} className="text-[#595552] hover:text-[#9A5E3A] disabled:cursor-not-allowed disabled:opacity-40">Edit</button>
                      {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                      {user?.role === 'ADMIN' && <button type="button" aria-label="Delete daily log" onClick={() => void removeLog(log)} className="text-rose-700 hover:text-rose-900"><Trash2 size={15} /></button>}
                    {/* Closes the <div> element so later content is no longer part of this region. */}
                    </div></td>
                  {/* Closes the <tr> element so later content is no longer part of this region. */}
                  </tr>
                })}
              {/* Closes the <tbody> element so later content is no longer part of this region. */}
              </tbody>
            {/* Closes the <table> element so later content is no longer part of this region. */}
            </table>
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>
        {/* Closes the <div> element so later content is no longer part of this region. */}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#C8BCB4] bg-white p-10 text-center">
          {/* Starts the <ClipboardList> element to organize this part of the interface. */}
          <ClipboardList className="mx-auto h-8 w-8 text-[#B6AAA2]" />
          {/* Starts the <h2> element to organize this part of the interface. */}
          <h2 className="mt-3 text-lg font-semibold text-[#323232]">{logs.length === 0 ? 'No daily logs yet' : 'No matching daily logs'}</h2>
          {/* Starts the <p> element to organize this part of the interface. */}
          <p className="mt-2 text-sm text-[#8E827A]">{logs.length === 0 ? 'Create a log to record work, progress, labour, and machinery.' : 'Try changing or clearing the search and date filters.'}</p>
          {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
          {logs.length === 0 && !error && <button type="button" onClick={() => goTo(`/projects/${projectId}/logs/new`)} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#323232] px-4 py-2.5 text-sm font-semibold text-white"><Plus className="h-4 w-4" /> Add Daily Log</button>}
          {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
          {hasFilters && <button type="button" onClick={clearFilters} className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[#E8E0DA] px-4 py-2.5 text-sm font-semibold text-[#9A5E3A]"><FilterX size={15} /> Clear filters</button>}
        {/* Closes the <div> element so later content is no longer part of this region. */}
        </div>
      )}
    {/* Closes the <div> element so later content is no longer part of this region. */}
    </div>
  // Closes this function call or grouped expression so the surrounding code can continue.
  )
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines SummaryCard so this module can perform its named task when needed.
function SummaryCard({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string; detail: string }) {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return <div className="rounded-2xl border border-[#E8E0DA] bg-white p-4 shadow-[0_8px_24px_rgba(50,50,50,0.04)]"><div className="flex items-center gap-2 text-[#9A5E3A]"><span className="h-4 w-4 [&>svg]:h-4 [&>svg]:w-4">{icon}</span><span className="text-xs font-medium text-[#8E827A]">{label}</span></div><p className="mt-3 text-2xl font-bold text-[#323232]">{value}</p><p className="mt-1 text-[11px] text-[#A59A93]">{detail}</p></div>
// Closes the current block or object so the grouped statements or settings end here.
}
// File purpose: Renders the reusable ProjectLogsListing interface component.
