import { useEffect, useState } from 'react'
import { Activity, AlertCircle, HardHat, RefreshCw, Wrench } from 'lucide-react'
import {
  fetchLabourSummary,
  fetchMachinerySummary,
  fetchMachineryUsageHistory,
  fetchProjectActivity,
  fetchWorkerCountHistory,
  type ActivityPage,
  type LabourSummary,
  type MachinerySummary,
  type MachineryUsageHistory,
  type WorkerCountHistory,
} from '../../daily-logs/data/projectReportingApi'

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
}

interface ReportValue<T> {
  data: T | null
  error: string | null
}

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

export function ProjectOperationsReports({ projectId, fromDate, toDate }: ProjectOperationsReportsProps) {
  const [results, setResults] = useState<ReportResults | null>(null)
  const [retry, setRetry] = useState(0)
  const requestKey = `${projectId}:${fromDate}:${toDate}:${retry}`

  useEffect(() => {
    const controller = new AbortController()
    const range = { from: fromDate || undefined, to: toDate || undefined }
    void Promise.all([
      loadReport(fetchProjectActivity(projectId, 1, 20, controller.signal)),
      loadReport(fetchLabourSummary(projectId, range.from, range.to, controller.signal)),
      loadReport(fetchWorkerCountHistory(projectId, range.from, range.to, controller.signal)),
      loadReport(fetchMachinerySummary(projectId, range.from, range.to, controller.signal)),
      loadReport(fetchMachineryUsageHistory(projectId, range.from, range.to, controller.signal)),
    ]).then(([activity, labour, workerHistory, machinery, machineryHistory]) => {
      if (!controller.signal.aborted) {
        setResults({ key: requestKey, activity, labour, workerHistory, machinery, machineryHistory })
      }
    })
    return () => controller.abort()
  }, [projectId, fromDate, toDate, requestKey])

  const data = results?.key === requestKey ? results : null
  const refresh = () => setRetry((value) => value + 1)

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
          <p className="text-sm font-semibold">{entry.action.replaceAll('_', ' ')}{entry.entityType ? ` · ${entry.entityType}` : ''}{entry.entityId ? ` #${entry.entityId}` : ''}</p>
          <time className="text-xs text-[#8E827A]" dateTime={entry.createdAt}>{new Date(entry.createdAt).toLocaleString()}</time>
        </div>
        <p className="mt-1 text-xs text-[#8E827A]">{entry.userName ? `By ${entry.userName}` : 'User unavailable'}</p>
      </article>)}
      {data?.activity.data && data.activity.data.total > data.activity.data.activities.length && <p className="pt-3 text-xs text-[#8E827A]">Showing {data.activity.data.activities.length} of {data.activity.data.total} activity records.</p>}
    </ReportPanel>
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
      : error ? <InlineLoadState error={error} onRetry={onRetry} />
        : empty ? <p className="py-8 text-center text-sm text-[#8E827A]">No {title.toLowerCase()} data for this project and date range.</p>
          : children}
  </section>
}

function InlineLoadState({ error, onRetry }: { error: string | null; onRetry: () => void }) {
  return <div role={error ? 'alert' : 'status'} className="flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
    <span className="flex items-center gap-2">{error ? <AlertCircle size={15} /> : <RefreshCw size={15} />}{error ?? ''}</span>
    {error && <button type="button" onClick={onRetry} className="font-semibold underline">Retry</button>}
  </div>
}

function SmallMetric({ label, value, suffix = '' }: { label: string; value: number; suffix?: string }) {
  return <div className="rounded-xl bg-[#FBF9F7] p-3"><p className="text-[10px] leading-4 text-[#8E827A]">{label}</p><p className="mt-1 text-lg font-semibold">{value}{suffix}</p></div>
}
