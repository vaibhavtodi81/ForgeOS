// Imports useEffect, useMemo, useState from react so this module can reuse that component, helper, or library.
import { useEffect, useMemo, useState } from 'react'
// Imports ClipboardCheck, Search, RefreshCw, PackageSearch from lucide-react so this module can reuse that component, helper, or library.
import { ClipboardCheck, Search, RefreshCw, PackageSearch } from 'lucide-react'
// Imports AppShell from ../../app-shell/components/AppShell so this module can reuse that component, helper, or library.
import { AppShell } from '../../app-shell/components/AppShell'
// Imports useProjects from ../../projects/useProjects so this module can reuse that component, helper, or library.
import { useProjects } from '../../projects/useProjects'
// Imports fetchProjectInventory, type InventoryRow from ../../stock/data/inventoryApi so this module can reuse that component, helper, or library.
import { fetchProjectInventory, type InventoryRow } from '../../stock/data/inventoryApi'
// Imports formatQty from ../../stock/data/formatting so this module can reuse that component, helper, or library.
import { formatQty } from '../../stock/data/formatting'

// Defines MaterialPlanningPage so this module can perform its named task when needed.
export function MaterialPlanningPage() {
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const { projects, selectedProject, selectedProjectId, selectProject, isLoading: projectsLoading, error: projectsError, retry: retryProjects } = useProjects()
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [inventory, setInventory] = useState<InventoryRow[]>([])
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [loading, setLoading] = useState(false)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [error, setError] = useState<string | null>(null)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [retry, setRetry] = useState(0)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [search, setSearch] = useState('')

  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  useEffect(() => {
    // Checks this condition before continuing so the code can choose the correct path for the current state.
    if (!selectedProjectId) {
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setInventory([])
      // Returns the result so the caller or React receives the value or interface this function provides.
      return
    // Closes the current block or object so the grouped statements or settings end here.
    }
    // Stores the value in controller so later lines can reuse this data or behavior for the current feature.
    const controller = new AbortController()
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setLoading(true)
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    fetchProjectInventory(selectedProjectId, controller.signal).then((rows) => {
      // Checks this condition before continuing so the code can choose the correct path for the current state.
      if (!controller.signal.aborted) {
        // Calls this helper or component so the feature can perform the operation or render the control represented here.
        setInventory(rows)
        // Calls this helper or component so the feature can perform the operation or render the control represented here.
        setError(null)
      // Closes the current block or object so the grouped statements or settings end here.
      }
    // Continues the component or data expression so its related values and behavior stay grouped together.
    }).catch((cause: unknown) => {
      // Checks this condition before continuing so the code can choose the correct path for the current state.
      if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'Unable to load project material plans.')
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
  const filtered = useMemo(() => inventory.filter((row) => row.materialName.toLowerCase().includes(search.toLowerCase())), [inventory, search])
  // Stores the value in lowStock so later lines can reuse this data or behavior for the current feature.
  const lowStock = inventory.filter((row) => row.isLowStock).length

  // Returns the result so the caller or React receives the value or interface this function provides.
  return <AppShell currentPath="/app/material-planning">
    {/* Starts the <div> element to organize this part of the interface. */}
    <div className="mx-auto max-w-[1600px] space-y-7 p-5 sm:p-7 lg:p-8">
      {/* Starts the <section> element to group related content into a meaningful region. */}
      <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        {/* Starts the <div> element to organize this part of the interface. */}
        <div><p className="text-sm text-[#8E827A]">Workspace / Materials / Planning</p><h1 className="mt-1 text-2xl font-semibold text-[#323232] sm:text-3xl">Project Material Planning</h1><p className="mt-2 text-sm text-[#8E827A]">Project plans and current stock quantities returned by the backend.</p></div>
        {/* Starts the <select> element to collect or display a value. */}
        <select aria-label="Select project" value={selectedProjectId} onChange={(event) => selectProject(event.target.value)} disabled={projectsLoading || projects.length === 0} className="rounded-xl border border-[#C8BCB4] bg-white px-4 py-3 text-sm text-[#595552]">
          {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
          {projects.length === 0 && <option value="">No accessible projects</option>}
          {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
          {projects.map((project) => <option key={project.id} value={String(project.id)}>{project.code} — {project.name}</option>)}
        {/* Closes the <select> element so later content is no longer part of this region. */}
        </select>
      {/* Closes the <section> element so later content is no longer part of this region. */}
      </section>

      {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
      {projectsError && <ErrorBanner message={projectsError} retry={retryProjects} />}
      {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
      {error && <ErrorBanner message={error} retry={() => setRetry((value) => value + 1)} />}
      {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
      {selectedProject && <section className="rounded-2xl border border-[#C8BCB4]/70 bg-[#E8DCD4] p-5">
        {/* Starts the <h2> element to organize this part of the interface. */}
        <h2 className="font-semibold text-[#323232]">{selectedProject.code} · {selectedProject.name}</h2>
        {/* Starts the <p> element to organize this part of the interface. */}
        <p className="mt-1 text-xs text-[#595552]">{selectedProject.location} · {selectedProject.status.replace('_', ' ')}</p>
        {/* Starts the <p> element to organize this part of the interface. */}
        <p className="mt-3 text-sm text-[#595552]">Material-plan quantities are displayed from the project inventory API. This backend currently exposes no plan create/update/delete endpoint.</p>
      {/* Closes the <section> element so later content is no longer part of this region. */}
      </section>}

      {/* Starts the <section> element to group related content into a meaningful region. */}
      <section className="grid gap-4 sm:grid-cols-2">
        {/* Starts the <Stat> element to organize this part of the interface. */}
        <Stat label="Materials Planned" value={loading ? '—' : inventory.length} icon={<ClipboardCheck size={20} />} />
        {/* Starts the <Stat> element to organize this part of the interface. */}
        <Stat label="Low Stock Items" value={loading ? '—' : lowStock} icon={<PackageSearch size={20} />} />
      {/* Closes the <section> element so later content is no longer part of this region. */}
      </section>

      {/* Starts the <section> element to group related content into a meaningful region. */}
      <section className="overflow-hidden rounded-2xl border border-[#C8BCB4]/70 bg-white">
        {/* Starts the <div> element to organize this part of the interface. */}
        <div className="flex flex-col justify-between gap-4 border-b border-[#E8DCD4] p-5 sm:flex-row sm:items-center">
          {/* Starts the <div> element to organize this part of the interface. */}
          <div><h2 className="font-semibold text-[#323232]">Planned Materials & Inventory</h2><p className="mt-1 text-xs text-[#8E827A]">{filtered.length} materials in this project plan</p></div>
          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="flex items-center gap-2 rounded-xl border border-[#C8BCB4] px-3 py-2"><Search size={17} className="text-[#8E827A]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search material..." className="w-full bg-transparent text-sm outline-none sm:w-52" /></div>
        {/* Closes the <div> element so later content is no longer part of this region. */}
        </div>
        {/* Starts the <div> element to organize this part of the interface. */}
        <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left">
          {/* Starts the <thead> element to organize this part of the interface. */}
          <thead className="bg-[#F7F3EE] text-xs text-[#8E827A]"><tr><th className="px-5 py-4 font-medium">Material</th><th className="px-5 py-4 font-medium">Planned</th><th className="px-5 py-4 font-medium">Opening Stock</th><th className="px-5 py-4 font-medium">Received</th><th className="px-5 py-4 font-medium">Consumed</th><th className="px-5 py-4 font-medium">Available</th><th className="px-5 py-4 font-medium">Low-stock threshold</th><th className="px-5 py-4 font-medium">Status</th></tr></thead>
          {/* Starts the <tbody> element to organize this part of the interface. */}
          <tbody className="divide-y divide-[#E8DCD4]">
            {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
            {filtered.map((row) => <tr key={row.materialId} className="hover:bg-[#F7F3EE]/60"><td className="px-5 py-4"><p className="text-sm font-medium text-[#323232]">{row.materialName}</p><p className="mt-1 text-xs text-[#8E827A]">{row.category.replaceAll('_', ' ')}</p></td><td className="px-5 py-4 text-sm">{formatQty(row.plannedQuantity)} {row.unit}</td><td className="px-5 py-4 text-sm">{formatQty(row.openingStock)} {row.unit}</td><td className="px-5 py-4 text-sm text-[#617858]">+{formatQty(row.totalIn)} {row.unit}</td><td className="px-5 py-4 text-sm text-[#9A7950]">−{formatQty(row.totalOut)} {row.unit}</td><td className="px-5 py-4 text-sm font-semibold">{formatQty(row.availableStock)} {row.unit}</td><td className="px-5 py-4 text-sm">{row.lowStockThreshold == null ? '—' : `${formatQty(row.lowStockThreshold)} ${row.unit}`}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${row.isLowStock ? 'bg-[#F8ECEA] text-[#9B625A]' : 'bg-[#E8EFE5] text-[#617858]'}`}>{row.isLowStock ? 'Low stock' : 'Healthy'}</span></td></tr>)}
            {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
            {loading && <tr><td colSpan={8} className="px-5 py-12 text-center text-sm text-[#8E827A]">Loading project inventory…</td></tr>}
            {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
            {!loading && !error && filtered.length === 0 && <tr><td colSpan={8} className="px-5 py-12 text-center text-sm text-[#8E827A]">No planned materials returned for this project.</td></tr>}
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

// Defines Stat so this module can perform its named task when needed.
function Stat({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return <div className="flex items-center justify-between rounded-2xl border border-[#C8BCB4]/70 bg-white p-5"><div><p className="text-sm text-[#8E827A]">{label}</p><p className="mt-2 text-2xl font-semibold text-[#323232]">{value}</p></div><div className="rounded-xl bg-[#F7F3EE] p-3 text-[#595552]">{icon}</div></div>
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines ErrorBanner so this module can perform its named task when needed.
function ErrorBanner({ message, retry }: { message: string; retry: () => void }) {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return <div role="alert" className="flex items-center justify-between gap-3 rounded-xl bg-[#F8ECEA] px-4 py-3 text-sm text-[#9B625A]"><span>{message}</span><button type="button" onClick={retry} className="inline-flex items-center gap-1 font-semibold underline"><RefreshCw size={14} />Retry</button></div>
// Closes the current block or object so the grouped statements or settings end here.
}
// File purpose: Renders the materials screen and coordinates its page-level interactions.
