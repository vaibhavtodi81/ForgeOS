import { useEffect, useState, type FormEvent } from 'react'
import { Activity, AlertCircle, HardHat, Plus, RefreshCw, Trash2, Wrench } from 'lucide-react'
import {
  createProjectMilestone,
  deleteProjectMilestone,
  fetchLabourSummary,
  fetchMachinerySummary,
  fetchMachineryUsageHistory,
  fetchProjectActivity,
  fetchProjectMilestones,
  fetchWorkerCountHistory,
  updateProjectMilestone,
  type ActivityPage,
  type LabourSummary,
  type MachinerySummary,
  type MachineryUsageHistory,
  type MilestoneInput,
  type MilestoneStatus,
  type ProjectMilestone,
  type WorkerCountHistory,
} from '../../daily-logs/data/projectReportingApi'
import { ApiError } from '../../../lib/api'

interface ProjectOperationsReportsProps {
  projectId: string
  fromDate: string
  toDate: string
}

interface ReportResults {
  key: string
  activity: ReportValue<ActivityPage>
  labour: ReportValue<LabourSummary>
  workerHistory: ReportValue<WorkerCountHistory[]>
  machinery: ReportValue<MachinerySummary>
  machineryHistory: ReportValue<MachineryUsageHistory[]>
  milestones: ReportValue<ProjectMilestone[]>
}

interface ReportValue<T> {
  data: T | null
  error: string | null
}

const statuses: MilestoneStatus[] = ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELLED']

async function loadReport<T>(request: Promise<T>): Promise<ReportValue<T>> {
  try {
    return { data: await request, error: null }
  } catch (cause) {
    return { data: null, error: cause instanceof Error ? cause.message : 'Unable to load this report.' }
  }
}

function displayDate(value: string) {
  return new Date(`${value.slice(0, 10)}T12:00:00`).toLocaleDateString()
}

function dateInputValue(value: string | null) {
  return value?.slice(0, 10) ?? ''
}

export function ProjectOperationsReports({ projectId, fromDate, toDate }: ProjectOperationsReportsProps) {
  const [results, setResults] = useState<ReportResults | null>(null)
  const [retry, setRetry] = useState(0)
  const [mutation, setMutation] = useState(0)
  const [editing, setEditing] = useState<ProjectMilestone | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [mutationError, setMutationError] = useState<string | null>(null)
  const requestKey = `${projectId}:${fromDate}:${toDate}:${retry}:${mutation}`

  useEffect(() => {
    const controller = new AbortController()
    const range = { from: fromDate || undefined, to: toDate || undefined }
    void Promise.all([
      loadReport(fetchProjectActivity(projectId, 1, 20, controller.signal)),
      loadReport(fetchLabourSummary(projectId, range.from, range.to, controller.signal)),
      loadReport(fetchWorkerCountHistory(projectId, range.from, range.to, controller.signal)),
      loadReport(fetchMachinerySummary(projectId, range.from, range.to, controller.signal)),
      loadReport(fetchMachineryUsageHistory(projectId, range.from, range.to, controller.signal)),
      loadReport(fetchProjectMilestones(projectId, controller.signal)),
    ]).then(([activity, labour, workerHistory, machinery, machineryHistory, milestones]) => {
      if (!controller.signal.aborted) {
        setResults({ key: requestKey, activity, labour, workerHistory, machinery, machineryHistory, milestones })
      }
    })
    return () => controller.abort()
  }, [projectId, fromDate, toDate, requestKey])

  const data = results?.key === requestKey ? results : null
  const refresh = () => setRetry((value) => value + 1)

  const saveMilestone = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const input: MilestoneInput = {
      name: String(form.get('name') ?? '').trim(),
      description: String(form.get('description') ?? '').trim() || null,
      sequence: Number(form.get('sequence')),
      plannedStartDate: String(form.get('plannedStartDate') ?? '') || null,
      plannedEndDate: String(form.get('plannedEndDate') ?? '') || null,
      actualStartDate: String(form.get('actualStartDate') ?? '') || null,
      actualEndDate: String(form.get('actualEndDate') ?? '') || null,
      status: String(form.get('status')) as MilestoneStatus,
      progressPercent: Number(form.get('progressPercent')),
    }

    setIsSaving(true)
    setMutationError(null)
    try {
      if (editing) await updateProjectMilestone(editing.id, input)
      else await createProjectMilestone(projectId, input)
      setEditing(null)
      setIsFormOpen(false)
      setMutation((value) => value + 1)
    } catch (cause) {
      setMutationError(cause instanceof ApiError ? cause.message : 'Unable to save the milestone.')
    } finally {
      setIsSaving(false)
    }
  }

  const removeMilestone = async (milestone: ProjectMilestone) => {
    if (!window.confirm(`Delete milestone "${milestone.name}"?`)) return
    setMutationError(null)
    try {
      await deleteProjectMilestone(milestone.id)
      setMutation((value) => value + 1)
    } catch (cause) {
      setMutationError(cause instanceof ApiError ? cause.message : 'Unable to delete the milestone.')
    }
  }

  return <div className="mt-6 space-y-5">
    <div className="grid gap-5 xl:grid-cols-2">
      <ReportPanel
        title="Labour attendance"
        icon={<HardHat size={17} />}
        error={data?.labour.error ?? data?.workerHistory.error ?? null}
        loading={!data}
        onRetry={refresh}
        empty={!data?.labour.data?.byTrade.length && !data?.workerHistory.data?.length}
      >
        {data?.labour.data && <>
          <div className="grid grid-cols-3 gap-3">
            <SmallMetric label="Recorded worker count" value={data.labour.data.totalWorkerCount} />
            <SmallMetric label="Labour hours" value={data.labour.data.totalLabourHours} />
            <SmallMetric label="Entries" value={data.labour.data.totalLabourEntries} />
          </div>
          {data.labour.data.byTrade.length > 0 && <div className="mt-4 divide-y divide-[#F1EBE6]">
            {data.labour.data.byTrade.map((trade) => <div key={trade.trade} className="flex items-center justify-between gap-3 py-3 text-sm">
              <span>{trade.trade}</span><span className="text-right text-[#8E827A]">{trade.workerCount} workers · {trade.labourHours}h · {trade.entries} entries</span>
            </div>)}
          </div>}
        </>}
        {data?.workerHistory.data && data.workerHistory.data.length > 0 && <div className="mt-4 border-t border-[#E8E0DA] pt-3">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#8E827A]">Worker-count history</h3>
          {data.workerHistory.data.map((record) => <div key={record.dailyLogId} className="flex justify-between py-2 text-sm">
            <span>{displayDate(record.logDate)}</span><span>{record.totalWorkerCount} workers · {record.labourHours}h</span>
          </div>)}
        </div>}
      </ReportPanel>

      <ReportPanel
        title="Machinery usage"
        icon={<Wrench size={17} />}
        error={data?.machinery.error ?? data?.machineryHistory.error ?? null}
        loading={!data}
        onRetry={refresh}
        empty={!data?.machinery.data?.byMachine.length && !data?.machineryHistory.data?.length}
      >
        {data?.machinery.data && <>
          <div className="grid grid-cols-3 gap-3">
            <SmallMetric label="Hours used" value={data.machinery.data.totalMachineryHours} />
            <SmallMetric label="Fuel consumption" value={data.machinery.data.totalFuelConsumption} suffix=" L" />
            <SmallMetric label="Entries" value={data.machinery.data.totalMachineryEntries} />
          </div>
          {data.machinery.data.byMachine.length > 0 && <div className="mt-4 divide-y divide-[#F1EBE6]">
            {data.machinery.data.byMachine.map((machine) => <div key={machine.machineName} className="flex items-center justify-between gap-3 py-3 text-sm">
              <span>{machine.machineName}</span><span className="text-right text-[#8E827A]">{machine.hoursUsed}h · {machine.fuelConsumption} L · {machine.entries} entries</span>
            </div>)}
          </div>}
        </>}
        {data?.machineryHistory.data && data.machineryHistory.data.length > 0 && <div className="mt-4 border-t border-[#E8E0DA] pt-3">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#8E827A]">Usage history</h3>
          {data.machineryHistory.data.map((record, index) => <div key={`${record.dailyLogId}:${record.machineName}:${index}`} className="flex justify-between gap-3 py-2 text-sm">
            <span>{displayDate(record.logDate)} · {record.machineName}{record.operatorName ? ` · ${record.operatorName}` : ''}</span><span className="whitespace-nowrap">{record.hoursUsed}h · {record.fuelConsumption} L</span>
          </div>)}
        </div>}
      </ReportPanel>
    </div>

    <ReportPanel
      title="Project activity"
      icon={<Activity size={17} />}
      error={data?.activity.error ?? null}
      loading={!data}
      onRetry={refresh}
      empty={!data?.activity.data?.activities.length}
    >
      {data?.activity.data?.activities.map((entry) => <article key={entry.id} className="border-b border-[#F1EBE6] py-3 last:border-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold">{entry.action.replaceAll('_', ' ')} · {entry.entityType} #{entry.entityId}</p>
          <time className="text-xs text-[#8E827A]" dateTime={entry.createdAt}>{new Date(entry.createdAt).toLocaleString()}</time>
        </div>
        <p className="mt-1 text-xs text-[#8E827A]">{entry.userName ? `By ${entry.userName}` : 'User unavailable'}</p>
      </article>)}
      {data?.activity.data && data.activity.data.total > data.activity.data.activities.length && <p className="pt-3 text-xs text-[#8E827A]">Showing {data.activity.data.activities.length} of {data.activity.data.total} activity records.</p>}
    </ReportPanel>

    <section className="rounded-2xl border border-[#E8E0DA] bg-white p-5 shadow-[0_8px_24px_rgba(50,50,50,0.04)] sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="font-semibold">Project milestones</h2><p className="mt-1 text-xs text-[#8E827A]">Milestone dates, progress, and status recorded by the backend.</p></div>
        {!isFormOpen && <button type="button" onClick={() => { setEditing(null); setIsFormOpen(true); setMutationError(null) }} className="inline-flex items-center gap-2 rounded-xl bg-[#323232] px-3 py-2 text-xs font-semibold text-white"><Plus size={14} /> Add milestone</button>}
      </div>
      {mutationError && <p role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{mutationError}</p>}
      {(!data || data.milestones.error) && <InlineLoadState loading={!data} error={data?.milestones.error ?? null} onRetry={refresh} />}
      {data?.milestones.data && data.milestones.data.length === 0 && <p className="py-6 text-center text-sm text-[#8E827A]">No milestones have been recorded for this project.</p>}
      {data?.milestones.data?.map((milestone) => <div key={milestone.id} className="flex flex-wrap items-center justify-between gap-3 border-t border-[#F1EBE6] py-4">
        <div className="min-w-[220px] flex-1">
          <div className="flex flex-wrap items-center gap-2"><h3 className="font-medium">{milestone.sequence}. {milestone.name}</h3><span className="rounded-full bg-[#F3E9E1] px-2 py-1 text-[10px] font-semibold">{milestone.status.replaceAll('_', ' ')}</span></div>
          {milestone.description && <p className="mt-1 text-sm text-[#595552]">{milestone.description}</p>}
          <p className="mt-1 text-xs text-[#8E827A]">Planned: {milestone.plannedStartDate ? displayDate(milestone.plannedStartDate) : '—'} to {milestone.plannedEndDate ? displayDate(milestone.plannedEndDate) : '—'} · Actual: {milestone.actualStartDate ? displayDate(milestone.actualStartDate) : '—'} to {milestone.actualEndDate ? displayDate(milestone.actualEndDate) : '—'}</p>
        </div>
        <div className="flex items-center gap-3"><span className="text-sm font-semibold">{Number(milestone.progressPercent)}%</span>
          <button type="button" onClick={() => { setEditing(milestone); setIsFormOpen(true); setMutationError(null) }} className="rounded-lg border border-[#E8E0DA] px-3 py-2 text-xs font-semibold">Edit</button>
          <button type="button" onClick={() => void removeMilestone(milestone)} aria-label={`Delete ${milestone.name}`} className="rounded-lg border border-rose-200 p-2 text-rose-700"><Trash2 size={14} /></button>
        </div>
      </div>)}
      {isFormOpen && <form key={editing?.id ?? 'new'} className="mt-4 grid gap-3 rounded-xl border border-[#E8E0DA] bg-[#FBF9F7] p-4 sm:grid-cols-2" onSubmit={(event) => void saveMilestone(event)}>
        <label className="text-xs text-[#8E827A] sm:col-span-2">Name<input required name="name" maxLength={255} defaultValue={editing?.name ?? ''} className="mt-1 w-full rounded-lg border border-[#E8E0DA] bg-white p-2 text-sm text-[#323232]" /></label>
        <label className="text-xs text-[#8E827A] sm:col-span-2">Description<textarea name="description" maxLength={5000} defaultValue={editing?.description ?? ''} className="mt-1 w-full rounded-lg border border-[#E8E0DA] bg-white p-2 text-sm text-[#323232]" /></label>
        <label className="text-xs text-[#8E827A]">Sequence<input required type="number" min="1" step="1" name="sequence" defaultValue={editing?.sequence ?? (data?.milestones.data?.length ?? 0) + 1} className="mt-1 w-full rounded-lg border border-[#E8E0DA] bg-white p-2 text-sm text-[#323232]" /></label>
        <label className="text-xs text-[#8E827A]">Status<select name="status" defaultValue={editing?.status ?? 'PLANNED'} className="mt-1 w-full rounded-lg border border-[#E8E0DA] bg-white p-2 text-sm text-[#323232]">{statuses.map((status) => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}</select></label>
        <label className="text-xs text-[#8E827A]">Progress (%)<input required type="number" min="0" max="100" step="0.01" name="progressPercent" defaultValue={Number(editing?.progressPercent ?? 0)} className="mt-1 w-full rounded-lg border border-[#E8E0DA] bg-white p-2 text-sm text-[#323232]" /></label>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs text-[#8E827A]">Planned start<input type="date" name="plannedStartDate" defaultValue={dateInputValue(editing?.plannedStartDate ?? null)} className="mt-1 w-full rounded-lg border border-[#E8E0DA] bg-white p-2 text-sm text-[#323232]" /></label>
          <label className="text-xs text-[#8E827A]">Planned end<input type="date" name="plannedEndDate" defaultValue={dateInputValue(editing?.plannedEndDate ?? null)} className="mt-1 w-full rounded-lg border border-[#E8E0DA] bg-white p-2 text-sm text-[#323232]" /></label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs text-[#8E827A]">Actual start<input type="date" name="actualStartDate" defaultValue={dateInputValue(editing?.actualStartDate ?? null)} className="mt-1 w-full rounded-lg border border-[#E8E0DA] bg-white p-2 text-sm text-[#323232]" /></label>
          <label className="text-xs text-[#8E827A]">Actual end<input type="date" name="actualEndDate" defaultValue={dateInputValue(editing?.actualEndDate ?? null)} className="mt-1 w-full rounded-lg border border-[#E8E0DA] bg-white p-2 text-sm text-[#323232]" /></label>
        </div>
        <div className="flex justify-end gap-2 sm:col-span-2">
          <button type="button" onClick={() => { setEditing(null); setIsFormOpen(false); setMutationError(null) }} className="rounded-lg border border-[#E8E0DA] px-3 py-2 text-xs font-semibold">Cancel</button>
          <button disabled={isSaving} type="submit" className="rounded-lg bg-[#323232] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">{isSaving ? 'Saving…' : 'Save milestone'}</button>
        </div>
      </form>}
    </section>
  </div>
}

function ReportPanel({
  title,
  icon,
  error,
  loading,
  empty,
  onRetry,
  children,
}: {
  title: string
  icon: React.ReactNode
  error: string | null
  loading: boolean
  empty: boolean
  onRetry: () => void
  children: React.ReactNode
}) {
  return <section className="rounded-2xl border border-[#E8E0DA] bg-white p-5 shadow-[0_8px_24px_rgba(50,50,50,0.04)] sm:p-6">
    <h2 className="mb-4 flex items-center gap-2 font-semibold"><span className="text-[#9A5E3A]">{icon}</span>{title}</h2>
    {loading ? <p aria-live="polite" className="py-8 text-center text-sm text-[#8E827A]">Loading {title.toLowerCase()}…</p>
      : error ? <InlineLoadState loading={false} error={error} onRetry={onRetry} />
        : empty ? <p className="py-8 text-center text-sm text-[#8E827A]">No {title.toLowerCase()} data for this project and date range.</p>
          : children}
  </section>
}

function InlineLoadState({ loading, error, onRetry }: { loading: boolean; error: string | null; onRetry: () => void }) {
  return <div role={error ? 'alert' : 'status'} className="flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
    <span className="flex items-center gap-2">{error ? <AlertCircle size={15} /> : <RefreshCw size={15} />}{error ?? (loading ? 'Loading…' : '')}</span>
    {error && <button type="button" onClick={onRetry} className="font-semibold underline">Retry</button>}
  </div>
}

function SmallMetric({ label, value, suffix = '' }: { label: string; value: number; suffix?: string }) {
  return <div className="rounded-xl bg-[#FBF9F7] p-3"><p className="text-[10px] leading-4 text-[#8E827A]">{label}</p><p className="mt-1 text-lg font-semibold">{value}{suffix}</p></div>
}
