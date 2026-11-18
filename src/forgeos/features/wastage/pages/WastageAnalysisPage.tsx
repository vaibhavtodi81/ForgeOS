import { useEffect, useMemo, useState } from 'react'
import { TrendingUp, AlertTriangle, CheckCircle2, RefreshCw, Layers, Percent } from 'lucide-react'
import { AppShell } from '../../app-shell/components/AppShell'
import { useProjects } from '../../projects/useProjects'
import { fetchWastage, type WastageItem } from '../../stock/data/inventoryApi'
import { fetchWastageOverview, type WastageOverview, type WastageOverviewRow } from '../data/wastageApi'
import { formatQty } from '../../stock/data/formatting'

const statusStyles = {
  OK: 'bg-[#E8EFE5] text-[#617858]',
  OVERRUN: 'bg-[#F8ECEA] text-[#9B625A]',
  NO_BASELINE: 'bg-[#F5EDE1] text-[#9A7950]',
}

interface ProjectReport {
  key: string
  progressPercent: number
  items: WastageItem[]
}

interface OverviewState {
  key: string
  data: WastageOverview
}

export function WastageAnalysisPage() {
  const { projects, selectedProject, selectedProjectId, selectProject, isLoading: projectsLoading, error: projectsError, retry: retryProjects } = useProjects()
  const [report, setReport] = useState<ProjectReport | null>(null)
  const [settledKey, setSettledKey] = useState('')
  const [overviewState, setOverviewState] = useState<OverviewState | null>(null)
  const [overviewSettledKey, setOverviewSettledKey] = useState('')
  const [overviewError, setOverviewError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('All')
  const [error, setError] = useState<string | null>(null)
  const [retry, setRetry] = useState(0)
  const [overviewRetry, setOverviewRetry] = useState(0)

  const requestKey = selectedProjectId ? `${selectedProjectId}#${retry}` : ''
  const currentReport = report?.key === requestKey ? report : null
  const loading = requestKey !== '' && settledKey !== requestKey
  const rows = currentReport?.items ?? []
  const progress = currentReport ? currentReport.progressPercent : null

  const overviewKey = String(overviewRetry)
  const overviewLoading = overviewSettledKey !== overviewKey
  const overview = overviewState?.key === overviewKey ? overviewState.data : null

  useEffect(() => {
    if (!selectedProjectId) return
    const controller = new AbortController()
    fetchWastage(selectedProjectId, controller.signal).then((result) => {
      if (!controller.signal.aborted) {
        setReport({ key: requestKey, progressPercent: result.progressPercent, items: result.items })
        setError(null)
        setSettledKey(requestKey)
      }
    }).catch((cause: unknown) => {
      if (!controller.signal.aborted) {
        setError(cause instanceof Error ? cause.message : 'Unable to load wastage report.')
        setSettledKey(requestKey)
      }
    })
    return () => controller.abort()
  }, [selectedProjectId, requestKey])

  useEffect(() => {
    const controller = new AbortController()
    fetchWastageOverview(controller.signal).then((data) => {
      if (!controller.signal.aborted) {
        setOverviewState({ key: overviewKey, data })
        setOverviewError(null)
        setOverviewSettledKey(overviewKey)
      }
    }).catch((cause: unknown) => {
      if (!controller.signal.aborted) {
        setOverviewError(cause instanceof Error ? cause.message : 'Unable to load the portfolio wastage overview.')
        setOverviewSettledKey(overviewKey)
      }
    })
    return () => controller.abort()
  }, [overviewKey])

  const filtered = useMemo(() => rows.filter((row) => statusFilter === 'All' || row.status === statusFilter), [rows, statusFilter])
  const overrunCount = rows.filter((row) => row.status === 'OVERRUN').length
  const totalEstimatedLoss = rows.reduce((sum, row) => sum + row.estimatedLoss, 0)
  const worst = rows.reduce<WastageItem | null>((current, row) => current == null || (row.overrunPercent ?? -1) > (current.overrunPercent ?? -1) ? row : current, null)
  const stats = [
    { label: 'Overrun Materials', value: overrunCount, icon: AlertTriangle },
    { label: 'Estimated Loss', value: totalEstimatedLoss ? `₹${totalEstimatedLoss.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : '₹0', icon: TrendingUp },
    { label: 'Materials Tracked', value: rows.length, icon: TrendingUp },
    { label: 'Worst Overrun', value: worst && worst.overrunPercent != null ? `${Math.round(worst.overrunPercent)}%` : '—', icon: CheckCircle2 },
  ]

  const overviewItems = overview?.items ?? []
  const overviewOverrun = overviewItems.filter((row) => row.status === 'OVERRUN')
  const overviewWorst = overviewItems.reduce<WastageOverviewRow | null>((current, row) => current == null || (row.overrunPercent ?? -1) > (current.overrunPercent ?? -1) ? row : current, null)
  const overviewStats = [
    { label: 'Plans Tracked', value: overviewItems.length ? String(overviewItems.length) : '0', icon: Layers },
    { label: 'Overrun Share', value: overviewItems.length ? `${overviewOverrun.length} of ${overviewItems.length} (${Math.round(overviewOverrun.length / overviewItems.length * 100)}%)` : '—', icon: AlertTriangle },
    { label: 'Avg Overrun', value: overview?.portfolio.avgOverrunPct != null ? `${Math.round(overview.portfolio.avgOverrunPct)}%` : '—', icon: Percent },
    { label: 'Worst Material', value: overviewWorst && overviewWorst.overrunPercent != null ? `${overviewWorst.materialName} (${Math.round(overviewWorst.overrunPercent)}%)` : '—', icon: TrendingUp },
  ]
  const topOverruns = overviewItems.filter((row) => row.overrunQuantity > 0).slice(0, 6)

  return <AppShell currentPath="/app/wastage">
    <div className="mx-auto max-w-[1600px] space-y-7 p-5 sm:p-7 lg:p-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="text-sm text-[#8E827A]">Workspace / Stock / Wastage</p><h1 className="mt-1 text-2xl font-semibold text-[#323232] sm:text-3xl">Wastage Analysis</h1><p className="mt-2 text-sm text-[#8E827A]">Backend-calculated consumption and wastage for the selected project.</p></div><div className="flex gap-3"><select aria-label="Select project" value={selectedProjectId} onChange={(event) => selectProject(event.target.value)} disabled={projectsLoading || projects.length === 0} className="rounded-xl border border-[#C8BCB4] bg-white px-4 py-3 text-sm">{projects.length === 0 && <option value="">No accessible projects</option>}{projects.map((project) => <option key={project.id} value={String(project.id)}>{project.code} — {project.name}</option>)}</select><button type="button" onClick={() => setRetry((value) => value + 1)} className="rounded-xl border border-[#C8BCB4] px-4 py-3 text-sm"><RefreshCw className="mr-1 inline h-4 w-4" />Refresh</button></div></header>
      {projectsError && <Banner message={projectsError} retry={retryProjects} />}{error && <Banner message={error} retry={() => setRetry((value) => value + 1)} />}

      <section className="space-y-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h2 className="font-semibold text-[#323232]">Portfolio Overview</h2><p className="mt-1 text-xs text-[#8E827A]">Every project-material plan you can access, ranked by consumption overrun.</p></div><button type="button" onClick={() => setOverviewRetry((value) => value + 1)} className="rounded-xl border border-[#C8BCB4] px-4 py-2 text-sm"><RefreshCw className="mr-1 inline h-4 w-4" />Refresh</button></div>
        {overviewError && <Banner message={overviewError} retry={() => setOverviewRetry((value) => value + 1)} />}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{overviewStats.map(({ label, value, icon: Icon }) => <div key={label} className="rounded-2xl border border-[#C8BCB4]/70 bg-white p-5 shadow-sm"><div className="flex items-center justify-between gap-3"><div className="min-w-0"><p className="text-sm text-[#8E827A]">{label}</p><h3 className="mt-3 truncate text-lg font-semibold text-[#323232]">{overviewLoading ? '—' : value}</h3></div><div className="rounded-xl bg-[#F7F3EE] p-3 text-[#595552]"><Icon size={21} /></div></div></div>)}</div>
        {overviewLoading && <p className="rounded-2xl border border-[#C8BCB4]/70 bg-white px-5 py-12 text-center text-sm text-[#8E827A]">Loading portfolio wastage…</p>}
        {!overviewLoading && !overviewError && topOverruns.length === 0 && <p className="rounded-2xl border border-[#C8BCB4]/70 bg-white px-5 py-12 text-center text-sm text-[#8E827A]">No consumption overruns across the portfolio.</p>}
        {!overviewLoading && topOverruns.length > 0 && <div className="overflow-hidden rounded-2xl border border-[#C8BCB4]/70 bg-white"><div className="overflow-x-auto"><table className="w-full min-w-[860px] text-left"><thead className="bg-[#F7F3EE] text-xs text-[#8E827A]"><tr><th className="px-5 py-4 font-medium">Project</th><th className="px-5 py-4 font-medium">Material</th><th className="px-5 py-4 font-medium">Planned</th><th className="px-5 py-4 font-medium">Consumed</th><th className="px-5 py-4 font-medium">Overrun</th><th className="px-5 py-4 font-medium">Overrun %</th><th className="px-5 py-4 font-medium">Status</th></tr></thead><tbody className="divide-y divide-[#E8DCD4]">{topOverruns.map((row) => <tr key={`${row.projectId}:${row.materialId}`} className="hover:bg-[#F7F3EE]/60"><td className="px-5 py-4 text-sm font-medium text-[#323232]">{row.projectName}</td><td className="px-5 py-4 text-sm">{row.materialName}<span className="block text-xs text-[#8E827A]">per {row.unit}</span></td><td className="px-5 py-4 text-sm">{formatQty(row.plannedQuantity)}</td><td className="px-5 py-4 text-sm font-medium">{formatQty(row.consumedQuantity)}</td><td className="px-5 py-4 text-sm">{formatQty(row.overrunQuantity)}</td><td className="px-5 py-4 text-sm">{row.overrunPercent == null ? '—' : `${Math.round(row.overrunPercent)}%`}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[row.status]}`}>{row.status}</span></td></tr>)}</tbody></table></div></div>}
      </section>

      {selectedProject && <p className="text-sm text-[#8E827A]">{selectedProject.code} · {selectedProject.name}{progress !== null ? ` · Latest logged progress ${progress}%` : ''}</p>}

      <section className="rounded-2xl border border-[#C8BCB4]/70 bg-[#E8DCD4] p-5 text-sm text-[#595552]"><p className="font-semibold text-[#323232]">Report calculation</p><p className="mt-2">Expected quantity is based on planned quantity and the latest daily-log progress. The status, thresholds, recorded wastage, and estimated loss below are calculated and returned by the backend.</p></section>
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(({ label, value, icon: Icon }) => <div key={label} className="rounded-2xl border border-[#C8BCB4]/70 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-sm text-[#8E827A]">{label}</p><h2 className="mt-3 text-2xl font-semibold text-[#323232]">{loading ? '—' : value}</h2></div><div className="rounded-xl bg-[#F7F3EE] p-3 text-[#595552]"><Icon size={21} /></div></div></div>)}</section>

      <section className="overflow-hidden rounded-2xl border border-[#C8BCB4]/70 bg-white">
        <div className="flex flex-col justify-between gap-4 border-b border-[#E8DCD4] p-5 sm:flex-row sm:items-center"><div><h2 className="font-semibold text-[#323232]">Per-Material Wastage</h2><p className="mt-1 text-xs text-[#8E827A]">Report values are returned by the selected project wastage endpoint.</p></div><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-xl border border-[#C8BCB4] bg-white px-3 py-2 text-sm"><option>All</option><option value="OVERRUN">OVERRUN</option><option value="OK">OK</option><option value="NO_BASELINE">NO_BASELINE</option></select></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[1100px] text-left"><thead className="bg-[#F7F3EE] text-xs text-[#8E827A]"><tr><th className="px-5 py-4 font-medium">Material</th><th className="px-5 py-4 font-medium">Progress</th><th className="px-5 py-4 font-medium">Planned</th><th className="px-5 py-4 font-medium">Expected</th><th className="px-5 py-4 font-medium">Consumed</th><th className="px-5 py-4 font-medium">Overrun</th><th className="px-5 py-4 font-medium">Recorded Wastage</th><th className="px-5 py-4 font-medium">Estimated Loss</th><th className="px-5 py-4 font-medium">Threshold</th><th className="px-5 py-4 font-medium">Status</th></tr></thead><tbody className="divide-y divide-[#E8DCD4]">
          {filtered.map((row) => <tr key={row.materialId} className="hover:bg-[#F7F3EE]/60"><td className="px-5 py-4"><p className="text-sm font-medium text-[#323232]">{row.materialName}</p><p className="mt-1 text-xs text-[#8E827A]">per {row.unit}</p></td><td className="px-5 py-4 text-sm">{progress ?? '—'}%</td><td className="px-5 py-4 text-sm">{formatQty(row.plannedQuantity)}</td><td className="px-5 py-4 text-sm">{formatQty(row.expectedQuantity)}</td><td className="px-5 py-4 text-sm font-medium">{formatQty(row.consumedQuantity)}</td><td className="px-5 py-4 text-sm">{row.overrunQuantity > 0 ? `${formatQty(row.overrunQuantity)}${row.overrunPercent != null ? ` (${Math.round(row.overrunPercent)}%)` : ''}` : '—'}</td><td className="px-5 py-4 text-sm">{formatQty(row.recordedWastageQuantity)} {row.unit}</td><td className="px-5 py-4 text-sm">{row.estimatedLoss > 0 ? `₹${row.estimatedLoss.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : '—'}</td><td className="px-5 py-4 text-sm">{row.thresholdPercent}%</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[row.status]}`}>{row.status}</span></td></tr>)}
          {loading && <tr><td colSpan={10} className="px-5 py-12 text-center text-sm text-[#8E827A]">Loading wastage report…</td></tr>}
          {!loading && !error && filtered.length === 0 && <tr><td colSpan={10} className="px-5 py-12 text-center text-sm text-[#8E827A]">No wastage data returned for this project and status filter.</td></tr>}
        </tbody></table></div>
      </section>
    </div>
  </AppShell>
}

function Banner({ message, retry }: { message: string; retry: () => void }) {
  return <div role="alert" className="flex items-center justify-between gap-3 rounded-xl bg-[#F8ECEA] px-4 py-3 text-sm text-[#9B625A]"><span>{message}</span><button type="button" onClick={retry} className="font-semibold underline">Retry</button></div>
}
