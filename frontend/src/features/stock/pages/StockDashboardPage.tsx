// Imports useEffect, useMemo, useState from react so this module can reuse that component, helper, or library.
import { useEffect, useMemo, useState } from 'react'
// Imports PackageSearch, AlertTriangle, CheckCircle2, RefreshCw from lucide-react so this module can reuse that component, helper, or library.
import { PackageSearch, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react'
// Imports AppShell from ../../app-shell/components/AppShell so this module can reuse that component, helper, or library.
import { AppShell } from '../../app-shell/components/AppShell'
// Imports useProjects from ../../projects/useProjects so this module can reuse that component, helper, or library.
import { useProjects } from '../../projects/useProjects'
// Imports fetchInventorySummary, fetchProjectInventory, type InventoryRow, type InventorySummaryRow from ../data/inventoryApi so this module can reuse that component, helper, or library.
import { fetchInventorySummary, fetchProjectInventory, type InventoryRow, type InventorySummaryRow } from '../data/inventoryApi'
// Imports formatQty from ../data/formatting so this module can reuse that component, helper, or library.
import { formatQty } from '../data/formatting'

// Defines StockDashboardPage so this module can perform its named task when needed.
export function StockDashboardPage() {
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const { projects, selectedProject, selectedProjectId, selectProject, isLoading: projectsLoading, error: projectsError, retry: retryProjects } = useProjects()
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [inventory, setInventory] = useState<InventoryRow[]>([])
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [summary, setSummary] = useState<InventorySummaryRow[]>([])
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
      setInventory([])
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setSummary([])
      // Returns the result so the caller or React receives the value or interface this function provides.
      return
    // Closes the current block or object so the grouped statements or settings end here.
    }
    // Stores the value in controller so later lines can reuse this data or behavior for the current feature.
    const controller = new AbortController()
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setLoading(true)
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    Promise.all([
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      fetchProjectInventory(selectedProjectId, controller.signal),
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      fetchInventorySummary(selectedProjectId, controller.signal),
    // Continues the component or data expression so its related values and behavior stay grouped together.
    ]).then(([rows, summaryRows]) => {
      // Checks this condition before continuing so the code can choose the correct path for the current state.
      if (!controller.signal.aborted) {
        // Calls this helper or component so the feature can perform the operation or render the control represented here.
        setInventory(rows)
        // Calls this helper or component so the feature can perform the operation or render the control represented here.
        setSummary(summaryRows)
        // Calls this helper or component so the feature can perform the operation or render the control represented here.
        setError(null)
      // Closes the current block or object so the grouped statements or settings end here.
      }
    // Continues the component or data expression so its related values and behavior stay grouped together.
    }).catch((cause: unknown) => {
      // Checks this condition before continuing so the code can choose the correct path for the current state.
      if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'Unable to load project inventory.')
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

  // Caches summaryByMaterial so its calculation is repeated only when its inputs change.
  // Caches summaryByMaterial so its calculation is repeated only when its inputs change.
  const summaryByMaterial = useMemo(() => new Map(summary.map((row) => [row.materialId, row])), [summary])
  // Stores the value in lowStock so later lines can reuse this data or behavior for the current feature.
  const lowStock = inventory.filter((row) => row.isLowStock)
  // Stores the value in stats so later lines can reuse this data or behavior for the current feature.
  const stats = [
    // Continues the component or data expression so its related values and behavior stay grouped together.
    { label: 'Materials Tracked', value: inventory.length, icon: PackageSearch },
    // Continues the component or data expression so its related values and behavior stay grouped together.
    { label: 'Low Stock Alerts', value: lowStock.length, icon: AlertTriangle },
    // Continues the component or data expression so its related values and behavior stay grouped together.
    { label: 'Healthy Items', value: inventory.length - lowStock.length, icon: CheckCircle2 },
  // Continues the component or data expression so its related values and behavior stay grouped together.
  ]

  // Returns the result so the caller or React receives the value or interface this function provides.
  return <AppShell currentPath="/app/stock">
    {/* Starts the <div> element to organize this part of the interface. */}
    <div className="mx-auto max-w-[1600px] space-y-7 p-5 sm:p-7 lg:p-8">
      {/* Starts the <section> element to group related content into a meaningful region. */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        {/* Starts the <div> element to organize this part of the interface. */}
        <div><p className="text-sm text-[#8E827A]">Workspace / Stock / Available</p><h1 className="mt-1 text-2xl font-semibold text-[#323232] sm:text-3xl">Available Stock</h1><p className="mt-2 text-sm text-[#8E827A]">Current project inventory and transaction-based balances.</p></div>
        {/* Starts the <select> element to collect or display a value. */}
        <select aria-label="Select project" value={selectedProjectId} onChange={(event) => selectProject(event.target.value)} disabled={projectsLoading || projects.length === 0} className="rounded-xl border border-[#C8BCB4] bg-white px-4 py-3 text-sm text-[#595552]">{projects.length === 0 && <option value="">No accessible projects</option>}{projects.map((project) => <option key={project.id} value={String(project.id)}>{project.code} — {project.name}</option>)}</select>
      {/* Closes the <section> element so later content is no longer part of this region. */}
      </section>
      {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
      {projectsError && <ErrorBanner message={projectsError} retry={retryProjects} />}
      {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
      {error && <ErrorBanner message={error} retry={() => setRetry((value) => value + 1)} />}
      {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
      {selectedProject && <p className="text-sm text-[#8E827A]">{selectedProject.code} · {selectedProject.name}</p>}

      {/* Starts the <section> element to group related content into a meaningful region. */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
        {stats.map(({ label, value, icon: Icon }) => <div key={label} className="rounded-2xl border border-[#C8BCB4]/70 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-sm text-[#8E827A]">{label}</p><h2 className="mt-3 text-2xl font-semibold text-[#323232]">{loading ? '—' : value}</h2></div><div className={`rounded-xl p-3 ${label === 'Low Stock Alerts' && lowStock.length > 0 ? 'bg-[#F8ECEA] text-[#9B625A]' : 'bg-[#F7F3EE] text-[#595552]'}`}><Icon size={21} /></div></div></div>)}
      {/* Closes the <section> element so later content is no longer part of this region. */}
      </section>
      {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
      {lowStock.length > 0 && <section className="rounded-2xl border border-[#EAD5D0] bg-[#F8ECEA] p-5"><p className="flex items-center gap-2 text-sm font-semibold text-[#9B625A]"><AlertTriangle size={16} />{lowStock.length} item(s) are at or below the backend low-stock threshold.</p><p className="mt-2 text-sm text-[#9B625A]/80">{lowStock.map((row) => `${row.materialName} (${formatQty(row.availableStock)} ${row.unit})`).join(' · ')}</p></section>}

      {/* Starts the <section> element to group related content into a meaningful region. */}
      <section className="overflow-hidden rounded-2xl border border-[#C8BCB4]/70 bg-white">
        {/* Starts the <div> element to organize this part of the interface. */}
        <div className="border-b border-[#E8DCD4] p-5"><h2 className="font-semibold text-[#323232]">Balances by Material</h2><p className="mt-1 text-xs text-[#8E827A]">Values are returned by the project inventory and summary APIs.</p></div>
        {/* Starts the <div> element to organize this part of the interface. */}
        <div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left">
          {/* Starts the <thead> element to organize this part of the interface. */}
          <thead className="bg-[#F7F3EE] text-xs text-[#8E827A]"><tr><th className="px-5 py-4 font-medium">Material</th><th className="px-5 py-4 font-medium">Opening</th><th className="px-5 py-4 font-medium">Received</th><th className="px-5 py-4 font-medium">Consumed</th><th className="px-5 py-4 font-medium">Adjustments</th><th className="px-5 py-4 font-medium">Available</th><th className="px-5 py-4 font-medium">Planned</th><th className="px-5 py-4 font-medium">Threshold</th><th className="px-5 py-4 font-medium">Status</th></tr></thead>
          {/* Starts the <tbody> element to organize this part of the interface. */}
          <tbody className="divide-y divide-[#E8DCD4]">
            {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
            {inventory.map((row) => {
              // Stores the value in details so later lines can reuse this data or behavior for the current feature.
              const details = summaryByMaterial.get(row.materialId)
              // Stores the value in plannedPercent so later lines can reuse this data or behavior for the current feature.
              const plannedPercent = row.plannedQuantity > 0 ? Math.min(100, row.availableStock / row.plannedQuantity * 100) : null
              // Returns the result so the caller or React receives the value or interface this function provides.
              return <tr key={row.materialId} className="hover:bg-[#F7F3EE]/60"><td className="px-5 py-4"><p className="text-sm font-medium text-[#323232]">{row.materialName}</p><p className="mt-1 text-xs text-[#8E827A]">{row.category.replaceAll('_', ' ')} · {row.unit}</p></td><td className="px-5 py-4 text-sm">{formatQty(row.openingStock)}</td><td className="px-5 py-4 text-sm text-[#617858]">+{formatQty(details?.totalReceived ?? row.totalIn)}</td><td className="px-5 py-4 text-sm text-[#9A7950]">−{formatQty(details?.totalConsumed ?? row.totalOut)}</td><td className="px-5 py-4 text-sm">+{formatQty(row.adjustmentIn)} / −{formatQty(row.adjustmentOut)}</td><td className="px-5 py-4 text-sm font-semibold">{formatQty(row.availableStock)} {row.unit}</td><td className="px-5 py-4 text-sm">{formatQty(row.plannedQuantity)} {row.unit}{plannedPercent != null && <span className="mt-1 block text-xs text-[#8E827A]">{Math.round(plannedPercent)}% in stock vs plan</span>}</td><td className="px-5 py-4 text-sm">{row.lowStockThreshold == null ? '—' : `${formatQty(row.lowStockThreshold)} ${row.unit}`}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${row.isLowStock ? 'bg-[#F8ECEA] text-[#9B625A]' : 'bg-[#E8EFE5] text-[#617858]'}`}>{row.isLowStock ? 'Low stock' : 'Healthy'}</span></td></tr>
            {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
            })}
            {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
            {loading && <tr><td colSpan={9} className="px-5 py-12 text-center text-sm text-[#8E827A]">Loading inventory…</td></tr>}
            {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
            {!loading && !error && inventory.length === 0 && <tr><td colSpan={9} className="px-5 py-12 text-center text-sm text-[#8E827A]">No project inventory records are configured.</td></tr>}
          {/* Closes the <tbody> element so later content is no longer part of this region. */}
          </tbody>
        {/* Closes the <table> element so later content is no longer part of this region. */}
        </table></div>
      {/* Closes the <section> element so later content is no longer part of this region. */}
      </section>
    {/* Closes the <div> element so later content is no longer part of this region. */}
    </div>
  {/* Closes the <AppShell> element so later content is no longer part of this region. */}
  </AppShell>
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines ErrorBanner so this module can perform its named task when needed.
function ErrorBanner({ message, retry }: { message: string; retry: () => void }) {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return <div role="alert" className="flex items-center justify-between gap-3 rounded-xl bg-[#F8ECEA] px-4 py-3 text-sm text-[#9B625A]"><span>{message}</span><button type="button" onClick={retry} className="inline-flex items-center gap-1 font-semibold underline"><RefreshCw size={14} />Retry</button></div>
// Closes the current block or object so the grouped statements or settings end here.
}
// File purpose: Renders the stock screen and coordinates its page-level interactions.
