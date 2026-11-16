// Imports useEffect, useState from react so this module can reuse that component, helper, or library.
import { useEffect, useState } from 'react'
// Imports AlertCircle, ArrowLeft, CalendarDays, CloudSun, Edit3, MapPin, Trash2, Users, Wrench from lucide-react so this module can reuse that component, helper, or library.
import { AlertCircle, ArrowLeft, CalendarDays, CloudSun, Edit3, MapPin, Trash2, Users, Wrench } from 'lucide-react'
// Imports AppShell from ../../app-shell/components/AppShell so this module can reuse that component, helper, or library.
import { AppShell } from '../../app-shell/components/AppShell'
// Imports ApiError from ../../../lib/api so this module can reuse that component, helper, or library.
import { ApiError } from '../../../lib/api'
// Imports useAuth from ../../authentication/auth/useAuth so this module can reuse that component, helper, or library.
import { useAuth } from '../../authentication/auth/useAuth'
// Imports useProjects from ../../projects/useProjects so this module can reuse that component, helper, or library.
import { useProjects } from '../../projects/useProjects'
// Imports deleteDailyLog, fetchDailyLog from ../data/dailyLogApi so this module can reuse that component, helper, or library.
import { deleteDailyLog, fetchDailyLog } from '../data/dailyLogApi'
// Imports type  DailyLog from ../data/dailyLogApi so this module can reuse that component, helper, or library.
import type { DailyLog } from '../data/dailyLogApi'

// Continues the component or data expression so its related values and behavior stay grouped together.
interface ProjectLogDetailPageProps {
  // Sets the projectId field so the surrounding object or component receives this setting.
  projectId: string
  // Sets the logId field so the surrounding object or component receives this setting.
  logId: string
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines formatDate so this module can perform its named task when needed.
function formatDate(value: string) {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return new Date(`${value.slice(0, 10)}T12:00:00`).toLocaleDateString('en-US', {
    // Sets the weekday field so the surrounding object or component receives this setting.
    weekday: 'long',
    // Sets the month field so the surrounding object or component receives this setting.
    month: 'long',
    // Sets the day field so the surrounding object or component receives this setting.
    day: 'numeric',
    // Sets the year field so the surrounding object or component receives this setting.
    year: 'numeric',
  // Continues the component or data expression so its related values and behavior stay grouped together.
  })
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines navigate so this module can perform its named task when needed.
function navigate(path: string) {
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  window.history.pushState({}, '', path)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  window.dispatchEvent(new PopStateEvent('popstate'))
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines ProjectLogDetailPage so this module can perform its named task when needed.
export function ProjectLogDetailPage({ projectId, logId }: ProjectLogDetailPageProps) {
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const { user } = useAuth()
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const { projects } = useProjects()
  // Stores the value in project so later lines can reuse this data or behavior for the current feature.
  const project = projects.find((entry) => String(entry.id) === projectId)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [result, setResult] = useState<{ key: string; log: DailyLog | null; error: string | null } | null>(null)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [retryCount, setRetryCount] = useState(0)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [isDeleting, setIsDeleting] = useState(false)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [deleteError, setDeleteError] = useState<string | null>(null)
  // Stores the value in requestKey so later lines can reuse this data or behavior for the current feature.
  const requestKey = `${projectId}:${logId}:${retryCount}`
  // Stores the value in savedNotice so later lines can reuse this data or behavior for the current feature.
  const savedNotice = new URLSearchParams(window.location.search).get('saved')

  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  useEffect(() => {
    // Stores the value in controller so later lines can reuse this data or behavior for the current feature.
    const controller = new AbortController()
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    fetchDailyLog(logId, controller.signal)
      // Continues the component or data expression so its related values and behavior stay grouped together.
      .then((log) => {
        // Checks this condition before continuing so the code can choose the correct path for the current state.
        if (String(log.projectId) !== projectId) throw new Error('This log does not belong to the requested project.')
        // Calls this helper or component so the feature can perform the operation or render the control represented here.
        setResult({ key: requestKey, log, error: null })
      // Continues the component or data expression so its related values and behavior stay grouped together.
      })
      // Continues the component or data expression so its related values and behavior stay grouped together.
      .catch((cause: unknown) => {
        // Checks this condition before continuing so the code can choose the correct path for the current state.
        if (!controller.signal.aborted) {
          // Calls this helper or component so the feature can perform the operation or render the control represented here.
          setResult({
            // Sets the key field so the surrounding object or component receives this setting.
            key: requestKey,
            // Sets the log field so the surrounding object or component receives this setting.
            log: null,
            // Sets the error field so the surrounding object or component receives this setting.
            error: cause instanceof Error ? cause.message : 'Unable to load daily log.',
          // Continues the component or data expression so its related values and behavior stay grouped together.
          })
        // Closes the current block or object so the grouped statements or settings end here.
        }
      // Continues the component or data expression so its related values and behavior stay grouped together.
      })
    // Returns the result so the caller or React receives the value or interface this function provides.
    return () => controller.abort()
  // Continues the component or data expression so its related values and behavior stay grouped together.
  }, [logId, projectId, requestKey])

  // Stores the value in currentResult so later lines can reuse this data or behavior for the current feature.
  const currentResult = result?.key === requestKey ? result : null
  // Stores the value in log so later lines can reuse this data or behavior for the current feature.
  const log = currentResult?.log ?? null
  // Stores the value in isLoading so later lines can reuse this data or behavior for the current feature.
  const isLoading = !currentResult
  // Stores the value in totalWorkers so later lines can reuse this data or behavior for the current feature.
  const totalWorkers = log?.labourEntries.reduce((total, entry) => total + entry.headCount, 0) ?? 0
  // Stores the value in totalLabourHours so later lines can reuse this data or behavior for the current feature.
  const totalLabourHours = log?.labourEntries.reduce((total, entry) => total + entry.headCount * Number(entry.hoursWorked), 0) ?? 0
  // Stores the value in totalMachineryHours so later lines can reuse this data or behavior for the current feature.
  const totalMachineryHours = log?.machineryEntries.reduce((total, entry) => total + Number(entry.hoursUsed), 0) ?? 0
  // Stores the value in totalFuel so later lines can reuse this data or behavior for the current feature.
  const totalFuel = log?.machineryEntries.reduce((total, entry) => total + Number(entry.fuelLitres ?? 0), 0) ?? 0

  // Stores the value in remove so later lines can reuse this data or behavior for the current feature.
  const remove = async () => {
    // Checks this condition before continuing so the code can choose the correct path for the current state.
    if (!log || !window.confirm(`Delete the daily log for ${formatDate(log.logDate)}? This cannot be undone.`)) return
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setIsDeleting(true)
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setDeleteError(null)
    // Starts an error-handling region so failures can be caught and handled safely.
    try {
      // Waits for the asynchronous result before using it, so later work receives completed data.
      await deleteDailyLog(String(log.id))
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      navigate(`/projects/${projectId}/logs`)
    // Continues the component or data expression so its related values and behavior stay grouped together.
    } catch (cause) {
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setDeleteError(cause instanceof ApiError ? cause.message : 'Unable to delete this daily log.')
    // Continues the component or data expression so its related values and behavior stay grouped together.
    } finally {
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setIsDeleting(false)
    // Closes the current block or object so the grouped statements or settings end here.
    }
  // Closes the current block or object so the grouped statements or settings end here.
  }

  // Returns the result so the caller or React receives the value or interface this function provides.
  return <AppShell currentPath={`/projects/${projectId}/logs`}>
    {/* Starts the <div> element to organize this part of the interface. */}
    <div className="mx-auto max-w-6xl p-5 sm:p-6 lg:p-10">
      {/* Starts the <button> element to provide an action the user can activate. */}
      <button type="button" onClick={() => navigate(`/projects/${projectId}/logs`)} className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[#8E827A] hover:text-[#323232]"><ArrowLeft size={16} /> Back to daily logs</button>
      {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
      {isLoading ? <div aria-live="polite" className="rounded-2xl border border-[#E8E0DA] bg-white p-8 text-sm text-[#8E827A]">Loading daily log…</div> : !log ? (
        // Continues the component or data expression so its related values and behavior stay grouped together.
        <section role="alert" className="rounded-2xl border border-dashed border-[#C8BCB4] bg-white p-10 text-center">
          {/* Starts the <AlertCircle> element to organize this part of the interface. */}
          <AlertCircle className="mx-auto h-8 w-8 text-[#A59A93]" />
          {/* Starts the <h1> element to organize this part of the interface. */}
          <h1 className="mt-3 text-2xl font-bold">Daily log unavailable</h1>
          {/* Starts the <p> element to organize this part of the interface. */}
          <p className="mt-2 text-sm text-[#8E827A]">{currentResult?.error}</p>
          {/* Starts the <button> element to provide an action the user can activate. */}
          <button type="button" onClick={() => setRetryCount((count) => count + 1)} className="mt-5 rounded-xl bg-[#323232] px-4 py-2.5 text-sm font-semibold text-white">Retry</button>
        {/* Closes the <section> element so later content is no longer part of this region. */}
        </section>
      // Continues the component or data expression so its related values and behavior stay grouped together.
      ) : <>
        {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
        {savedNotice && <p role="status" className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">Daily log {savedNotice} successfully.</p>}
        {/* Starts the <header> element to organize this part of the interface. */}
        <header className="mb-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          {/* Starts the <div> element to organize this part of the interface. */}
          <div>
            {/* Starts the <p> element to organize this part of the interface. */}
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9A5E3A]">{project?.name ?? `Project ${projectId}`} · {project?.code ?? projectId}</p>
            {/* Starts the <h1> element to organize this part of the interface. */}
            <h1 className="mt-2 text-3xl font-bold tracking-tight">{formatDate(log.logDate)}</h1>
            {/* Starts the <p> element to organize this part of the interface. */}
            <p className="mt-2 flex items-center gap-1.5 text-sm text-[#8E827A]"><MapPin size={14} /> Daily site record</p>
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>
          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="flex items-center gap-2">
            {/* Starts the <button> element to provide an action the user can activate. */}
            <button type="button" onClick={() => navigate(`/projects/${projectId}/logs/${logId}/edit`)} className="inline-flex items-center gap-2 rounded-xl bg-[#323232] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#9A5E3A]"><Edit3 size={14} /> Edit log</button>
            {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
            {user?.role === 'ADMIN' && <button type="button" disabled={isDeleting} onClick={() => void remove()} className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-4 py-2.5 text-xs font-semibold text-rose-700 disabled:opacity-50"><Trash2 size={14} /> {isDeleting ? 'Deleting…' : 'Delete'}</button>}
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>
        {/* Closes the <header> element so later content is no longer part of this region. */}
        </header>

        {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
        {deleteError && <p role="alert" className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{deleteError}</p>}

        {/* Starts the <section> element to group related content into a meaningful region. */}
        <section className="grid gap-5 lg:grid-cols-[1.4fr_0.8fr]">
          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="rounded-2xl border border-[#E8E0DA] bg-white p-5 shadow-[0_8px_24px_rgba(50,50,50,0.04)] sm:p-6">
            {/* Starts the <p> element to organize this part of the interface. */}
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#9A5E3A]">Cumulative project progress</p>
            {/* Starts the <p> element to organize this part of the interface. */}
            <p className="mt-3 text-4xl font-bold tracking-tight">{Number(log.progressPercent)}%</p>
            {/* Starts the <div> element to organize this part of the interface. */}
            <div className="mt-6 h-3 overflow-hidden rounded-full bg-[#F0E9E4]"><div className="h-full rounded-full bg-[#B87A4F]" style={{ width: `${Number(log.progressPercent)}%` }} /></div>
            {/* Starts the <p> element to organize this part of the interface. */}
            <p className="mt-5 text-xs text-[#8E827A]">Updated {new Date(log.updatedAt).toLocaleString()}</p>
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>
          {/* Starts the <section> element to group related content into a meaningful region. */}
          <section className="grid grid-cols-2 gap-3 rounded-2xl border border-[#E8E0DA] bg-[#FBF9F7] p-4">
            {/* Starts the <Metric> element to organize this part of the interface. */}
            <Metric icon={<Users />} label="Workers" value={String(totalWorkers)} />
            {/* Starts the <Metric> element to organize this part of the interface. */}
            <Metric icon={<CalendarDays />} label="Labour hours" value={`${totalLabourHours}h`} />
            {/* Starts the <Metric> element to organize this part of the interface. */}
            <Metric icon={<Wrench />} label="Machine hours" value={`${totalMachineryHours}h`} />
            {/* Starts the <Metric> element to organize this part of the interface. */}
            <Metric icon={<Wrench />} label="Fuel used" value={`${totalFuel} L`} />
          {/* Closes the <section> element so later content is no longer part of this region. */}
          </section>
        {/* Closes the <section> element so later content is no longer part of this region. */}
        </section>

        {/* Starts the <section> element to group related content into a meaningful region. */}
        <section className="mt-5 rounded-2xl border border-[#E8E0DA] bg-white p-5 shadow-[0_8px_24px_rgba(50,50,50,0.04)] sm:p-6">
          {/* Starts the <h2> element to organize this part of the interface. */}
          <h2 className="font-semibold">Work summary</h2>
          {/* Starts the <p> element to organize this part of the interface. */}
          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#595552]">{log.workSummary}</p>
          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {/* Starts the <Info> element to organize this part of the interface. */}
            <Info label="Weather" value={log.weather || 'Not recorded'} icon={<CloudSun />} />
            {/* Starts the <Info> element to organize this part of the interface. */}
            <Info label="Issues or delays" value={log.issues || 'None recorded'} icon={<AlertCircle />} />
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>
        {/* Closes the <section> element so later content is no longer part of this region. */}
        </section>

        {/* Starts the <div> element to organize this part of the interface. */}
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          {/* Starts the <section> element to group related content into a meaningful region. */}
          <section className="rounded-2xl border border-[#E8E0DA] bg-white p-5 shadow-[0_8px_24px_rgba(50,50,50,0.04)] sm:p-6">
            {/* Starts the <h2> element to organize this part of the interface. */}
            <h2 className="font-semibold">Labour attendance</h2>
            {/* Starts the <p> element to organize this part of the interface. */}
            <p className="mt-1 text-xs text-[#8E827A]">Headcount by trade or contractor</p>
            {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
            {log.labourEntries.length ? <div className="mt-4 space-y-3">{log.labourEntries.map((entry) => <div key={entry.id} className="rounded-xl bg-[#FBF9F7] p-4">
              {/* Starts the <div> element to organize this part of the interface. */}
              <div className="flex flex-wrap items-start justify-between gap-2"><div><p className="text-sm font-semibold">{entry.trade}</p><p className="mt-1 text-xs text-[#8E827A]">{entry.contractorName || 'Contractor not recorded'}</p></div><span className="rounded-full bg-[#F3E9E1] px-2.5 py-1 text-xs font-bold text-[#9A5E3A]">{entry.headCount} workers</span></div>
              {/* Starts the <p> element to organize this part of the interface. */}
              <p className="mt-3 text-xs text-[#595552]">{Number(entry.hoursWorked)} hours worked{entry.remarks ? ` · ${entry.remarks}` : ''}</p>
            {/* Closes the <div> element so later content is no longer part of this region. */}
            </div>)}</div> : <p className="mt-4 text-sm text-[#8E827A]">No labour entries recorded.</p>}
          {/* Closes the <section> element so later content is no longer part of this region. */}
          </section>

          {/* Starts the <section> element to group related content into a meaningful region. */}
          <section className="rounded-2xl border border-[#E8E0DA] bg-white p-5 shadow-[0_8px_24px_rgba(50,50,50,0.04)] sm:p-6">
            {/* Starts the <h2> element to organize this part of the interface. */}
            <h2 className="font-semibold">Machinery usage</h2>
            {/* Starts the <p> element to organize this part of the interface. */}
            <p className="mt-1 text-xs text-[#8E827A]">Equipment hours and fuel recorded</p>
            {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
            {log.machineryEntries.length ? <div className="mt-4 space-y-3">{log.machineryEntries.map((entry) => <div key={entry.id} className="rounded-xl bg-[#FBF9F7] p-4">
              {/* Starts the <div> element to organize this part of the interface. */}
              <div className="flex flex-wrap items-start justify-between gap-2"><div><p className="text-sm font-semibold">{entry.machineName}</p><p className="mt-1 text-xs text-[#8E827A]">{entry.operatorName || 'Operator not recorded'}</p></div><span className="rounded-full bg-[#F3E9E1] px-2.5 py-1 text-xs font-bold text-[#9A5E3A]">{Number(entry.hoursUsed)}h</span></div>
              {/* Starts the <p> element to organize this part of the interface. */}
              <p className="mt-3 text-xs text-[#595552]">{entry.fuelLitres == null ? 'Fuel not recorded' : `${Number(entry.fuelLitres)} L fuel`}{entry.remarks ? ` · ${entry.remarks}` : ''}</p>
            {/* Closes the <div> element so later content is no longer part of this region. */}
            </div>)}</div> : <p className="mt-4 text-sm text-[#8E827A]">No machinery entries recorded.</p>}
          {/* Closes the <section> element so later content is no longer part of this region. */}
          </section>
        {/* Closes the <div> element so later content is no longer part of this region. */}
        </div>
      {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
      </>}
    {/* Closes the <div> element so later content is no longer part of this region. */}
    </div>
  {/* Closes the <AppShell> element so later content is no longer part of this region. */}
  </AppShell>
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines Metric so this module can perform its named task when needed.
function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return <div className="rounded-xl bg-white p-3"><div className="flex items-center gap-2 text-[#9A5E3A]"><span className="h-4 w-4 [&>svg]:h-4 [&>svg]:w-4">{icon}</span><span className="text-[11px] text-[#8E827A]">{label}</span></div><p className="mt-2 text-lg font-bold text-[#323232]">{value}</p></div>
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines Info so this module can perform its named task when needed.
function Info({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return <div className="rounded-xl bg-[#FBF9F7] p-3"><div className="flex items-center gap-2 text-xs font-semibold text-[#8E827A]"><span className="h-4 w-4 [&>svg]:h-4 [&>svg]:w-4">{icon}</span>{label}</div><p className="mt-2 whitespace-pre-wrap text-sm text-[#595552]">{value}</p></div>
// Closes the current block or object so the grouped statements or settings end here.
}
// File purpose: Renders the daily logs screen and coordinates its page-level interactions.
