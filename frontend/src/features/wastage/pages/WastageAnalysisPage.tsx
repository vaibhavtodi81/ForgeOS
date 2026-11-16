// Imports useEffect, useMemo, useState from react so this module can reuse that component, helper, or library.
import { useEffect, useMemo, useState } from 'react'
// Imports TrendingUp, AlertTriangle, CheckCircle2, RefreshCw from lucide-react so this module can reuse that component, helper, or library.
import { TrendingUp, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react'
// Imports AppShell from ../../app-shell/components/AppShell so this module can reuse that component, helper, or library.
import { AppShell } from '../../app-shell/components/AppShell'
// Imports useProjects from ../../projects/useProjects so this module can reuse that component, helper, or library.
import { useProjects } from '../../projects/useProjects'
// Imports fetchWastage, type WastageItem from ../../stock/data/inventoryApi so this module can reuse that component, helper, or library.
import { fetchWastage, type WastageItem } from '../../stock/data/inventoryApi'
// Imports formatQty from ../../stock/data/formatting so this module can reuse that component, helper, or library.
import { formatQty } from '../../stock/data/formatting'

// Stores the value in statusStyles so later lines can reuse this data or behavior for the current feature.
const statusStyles = {
  // Sets the OK field so the surrounding object or component receives this setting.
  OK: 'bg-[#E8EFE5] text-[#617858]',
  // Sets the OVERRUN field so the surrounding object or component receives this setting.
  OVERRUN: 'bg-[#F8ECEA] text-[#9B625A]',
  // Sets the NO_BASELINE field so the surrounding object or component receives this setting.
  NO_BASELINE: 'bg-[#F5EDE1] text-[#9A7950]',
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines WastageAnalysisPage so this module can perform its named task when needed.
export function WastageAnalysisPage() {
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const { projects, selectedProject, selectedProjectId, selectProject, isLoading: projectsLoading, error: projectsError, retry: retryProjects } = useProjects()
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [rows, setRows] = useState<WastageItem[]>([])
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [progress, setProgress] = useState<number | null>(null)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [statusFilter, setStatusFilter] = useState('All')
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [loading, setLoading] = useState(false)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [error, setError] = useState<string | null>(null)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [retry, setRetry] = useState(0)

  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  useEffect(() => {
    // Checks this condition before continuing so the code can choose the correct path for the current state.
    if (!selectedProjectId) {
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setRows([])
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setProgress(null)
      // Returns the result so the caller or React receives the value or interface this function provides.
      return
    // Closes the current block or object so the grouped statements or settings end here.
    }
    // Stores the value in controller so later lines can reuse this data or behavior for the current feature.
    const controller = new AbortController()
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setLoading(true)
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    fetchWastage(selectedProjectId, controller.signal).then((report) => {
      // Checks this condition before continuing so the code can choose the correct path for the current state.
      if (!controller.signal.aborted) {
        // Calls this helper or component so the feature can perform the operation or render the control represented here.
        setRows(report.items)
        // Calls this helper or component so the feature can perform the operation or render the control represented here.
        setProgress(report.progressPercent)
        // Calls this helper or component so the feature can perform the operation or render the control represented here.
        setError(null)
      // Closes the current block or object so the grouped statements or settings end here.
      }
    // Continues the component or data expression so its related values and behavior stay grouped together.
    }).catch((cause: unknown) => {
      // Checks this condition before continuing so the code can choose the correct path for the current state.
      if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'Unable to load wastage report.')
    // Continues the component or data expression so its related values and behavior stay grouped together.
    }).finally(() => {
      // Checks this condition before continuing so the code can choose the correct path for the current state.
      if (!controller.signal.aborted) setLoading(false)
    // Continues the component or data expression so its related values and behavior stay grouped together.
    })
    // Returns the result so the caller or React receives the value or interface this function provides.
    return () => controller.abort()
  // Continues the component or data expression so its related values and behavior stay grouped together.
  }, [selectedProjectId, retry])

  // Caches filtered so its calculation is repeated only when its inputs change.
  // Caches filtered so its calculation is repeated only when its inputs change.
  const filtered = useMemo(() => rows.filter((row) => statusFilter === 'All' || row.status === statusFilter), [rows, statusFilter])
  // Stores the value in overrunCount so later lines can reuse this data or behavior for the current feature.
  const overrunCount = rows.filter((row) => row.status === 'OVERRUN').length
  // Stores the value in totalEstimatedLoss so later lines can reuse this data or behavior for the current feature.
  const totalEstimatedLoss = rows.reduce((sum, row) => sum + row.estimatedLoss, 0)
  // Stores the value in worst so later lines can reuse this data or behavior for the current feature.
  const worst = rows.reduce<WastageItem | null>((current, row) => current == null || row.overrunPercent > current.overrunPercent ? row : current, null)
  // Stores the value in stats so later lines can reuse this data or behavior for the current feature.
  const stats = [
    // Continues the component or data expression so its related values and behavior stay grouped together.
    { label: 'Overrun Materials', value: overrunCount, icon: AlertTriangle },
    // Continues the component or data expression so its related values and behavior stay grouped together.
    { label: 'Estimated Loss', value: totalEstimatedLoss ? `₹${totalEstimatedLoss.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : '₹0', icon: TrendingUp },
    // Continues the component or data expression so its related values and behavior stay grouped together.
    { label: 'Materials Tracked', value: rows.length, icon: TrendingUp },
    // Continues the component or data expression so its related values and behavior stay grouped together.
    { label: 'Worst Overrun', value: worst ? `${Math.round(worst.overrunPercent)}%` : '—', icon: CheckCircle2 },
  // Continues the component or data expression so its related values and behavior stay grouped together.
  ]

  // Returns the result so the caller or React receives the value or interface this function provides.
  return <AppShell currentPath="/app/wastage">
    {/* Starts the <div> element to organize this part of the interface. */}
    <div className="mx-auto max-w-[1600px] space-y-7 p-5 sm:p-7 lg:p-8">
      {/* Starts the <header> element to organize this part of the interface. */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="text-sm text-[#8E827A]">Workspace / Stock / Wastage</p><h1 className="mt-1 text-2xl font-semibold text-[#323232] sm:text-3xl">Wastage Analysis</h1><p className="mt-2 text-sm text-[#8E827A]">Backend-calculated consumption and wastage for the selected project.</p></div><div className="flex gap-3"><select aria-label="Select project" value={selectedProjectId} onChange={(event) => selectProject(event.target.value)} disabled={projectsLoading || !projects.length} className="rounded-xl border border-[#C8BCB4] bg-white px-4 py-3 text-sm">{projects.map((project) => <option key={project.id} value={String(project.id)}>{project.code} — {project.name}</option>)}</select><button type="button" onClick={() => setRetry((value) => value + 1)} className="rounded-xl border border-[#C8BCB4] px-4 py-3 text-sm"><RefreshCw className="mr-1 inline h-4 w-4" />Refresh</button></div></header>
      {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
      {projectsError && <Banner message={projectsError} retry={retryProjects} />}{error && <Banner message={error} retry={() => setRetry((value) => value + 1)} />}
      {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
      {selectedProject && <p className="text-sm text-[#8E827A]">{selectedProject.code} · {selectedProject.name}{progress !== null ? ` · Latest logged progress ${progress}%` : ''}</p>}

      {/* Starts the <section> element to group related content into a meaningful region. */}
      <section className="rounded-2xl border border-[#C8BCB4]/70 bg-[#E8DCD4] p-5 text-sm text-[#595552]"><p className="font-semibold text-[#323232]">Report calculation</p><p className="mt-2">Expected quantity is based on planned quantity and the latest daily-log progress. The status, thresholds, recorded wastage, and estimated loss below are calculated and returned by the backend.</p></section>
      {/* Starts the <section> element to group related content into a meaningful region. */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(({ label, value, icon: Icon }) => <div key={label} className="rounded-2xl border border-[#C8BCB4]/70 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-sm text-[#8E827A]">{label}</p><h2 className="mt-3 text-2xl font-semibold text-[#323232]">{loading ? '—' : value}</h2></div><div className="rounded-xl bg-[#F7F3EE] p-3 text-[#595552]"><Icon size={21} /></div></div></div>)}</section>

      {/* Starts the <section> element to group related content into a meaningful region. */}
      <section className="overflow-hidden rounded-2xl border border-[#C8BCB4]/70 bg-white">
        {/* Starts the <div> element to organize this part of the interface. */}
        <div className="flex flex-col justify-between gap-4 border-b border-[#E8DCD4] p-5 sm:flex-row sm:items-center"><div><h2 className="font-semibold text-[#323232]">Per-Material Wastage</h2><p className="mt-1 text-xs text-[#8E827A]">Report values are returned by the selected project wastage endpoint.</p></div><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-xl border border-[#C8BCB4] bg-white px-3 py-2 text-sm"><option>All</option><option value="OVERRUN">OVERRUN</option><option value="OK">OK</option><option value="NO_BASELINE">NO_BASELINE</option></select></div>
        {/* Starts the <div> element to organize this part of the interface. */}
        <div className="overflow-x-auto"><table className="w-full min-w-[1100px] text-left"><thead className="bg-[#F7F3EE] text-xs text-[#8E827A]"><tr><th className="px-5 py-4 font-medium">Material</th><th className="px-5 py-4 font-medium">Progress</th><th className="px-5 py-4 font-medium">Planned</th><th className="px-5 py-4 font-medium">Expected</th><th className="px-5 py-4 font-medium">Consumed</th><th className="px-5 py-4 font-medium">Overrun</th><th className="px-5 py-4 font-medium">Recorded Wastage</th><th className="px-5 py-4 font-medium">Estimated Loss</th><th className="px-5 py-4 font-medium">Threshold</th><th className="px-5 py-4 font-medium">Status</th></tr></thead><tbody className="divide-y divide-[#E8DCD4]">
          {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
          {filtered.map((row) => <tr key={row.materialId} className="hover:bg-[#F7F3EE]/60"><td className="px-5 py-4"><p className="text-sm font-medium text-[#323232]">{row.materialName}</p><p className="mt-1 text-xs text-[#8E827A]">per {row.unit}</p></td><td className="px-5 py-4 text-sm">{progress ?? '—'}%</td><td className="px-5 py-4 text-sm">{formatQty(row.plannedQuantity)}</td><td className="px-5 py-4 text-sm">{formatQty(row.expectedQuantity)}</td><td className="px-5 py-4 text-sm font-medium">{formatQty(row.consumedQuantity)}</td><td className="px-5 py-4 text-sm">{row.overrunQuantity > 0 ? `${formatQty(row.overrunQuantity)} (${Math.round(row.overrunPercent)}%)` : '—'}</td><td className="px-5 py-4 text-sm">{formatQty(row.recordedWastageQuantity)} {row.unit}</td><td className="px-5 py-4 text-sm">{row.estimatedLoss > 0 ? `₹${row.estimatedLoss.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : '—'}</td><td className="px-5 py-4 text-sm">{row.thresholdPercent}%</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[row.status]}`}>{row.status}</span></td></tr>)}
          {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
          {loading && <tr><td colSpan={10} className="px-5 py-12 text-center text-sm text-[#8E827A]">Loading wastage report…</td></tr>}
          {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
          {!loading && !error && filtered.length === 0 && <tr><td colSpan={10} className="px-5 py-12 text-center text-sm text-[#8E827A]">No wastage data returned for this project and status filter.</td></tr>}
        {/* Closes the <tbody> element so later content is no longer part of this region. */}
        </tbody></table></div>
      {/* Closes the <section> element so later content is no longer part of this region. */}
      </section>
    {/* Closes the <div> element so later content is no longer part of this region. */}
    </div>
  {/* Closes the <AppShell> element so later content is no longer part of this region. */}
  </AppShell>
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines Banner so this module can perform its named task when needed.
function Banner({ message, retry }: { message: string; retry: () => void }) {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return <div role="alert" className="flex items-center justify-between gap-3 rounded-xl bg-[#F8ECEA] px-4 py-3 text-sm text-[#9B625A]"><span>{message}</span><button type="button" onClick={retry} className="font-semibold underline">Retry</button></div>
// Closes the current block or object so the grouped statements or settings end here.
}
// File purpose: Renders the wastage screen and coordinates its page-level interactions.
