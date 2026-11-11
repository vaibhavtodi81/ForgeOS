import { useEffect, useMemo, useState } from 'react'
import { ClipboardCheck, Search, RefreshCw, PackageSearch } from 'lucide-react'
import { AppShell } from '../../app-shell/components/AppShell'
import { useProjects } from '../../projects/useProjects'
import { fetchProjectInventory, type InventoryRow } from '../../stock/data/inventoryApi'
import { formatQty } from '../../stock/data/formatting'

export function MaterialPlanningPage() {
  const { projects, selectedProject, selectedProjectId, selectProject, isLoading: projectsLoading, error: projectsError, retry: retryProjects } = useProjects()
  const [inventory, setInventory] = useState<InventoryRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retry, setRetry] = useState(0)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!selectedProjectId) {
      setInventory([])
      return
    }
    const controller = new AbortController()
    setLoading(true)
    fetchProjectInventory(selectedProjectId, controller.signal).then((rows) => {
      if (!controller.signal.aborted) {
        setInventory(rows)
        setError(null)
      }
    }).catch((cause: unknown) => {
      if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'Unable to load project material plans.')
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false)
    })
    return () => controller.abort()
  }, [selectedProjectId, retry])

  const filtered = useMemo(() => inventory.filter((row) => row.materialName.toLowerCase().includes(search.toLowerCase())), [inventory, search])
  const lowStock = inventory.filter((row) => row.isLowStock).length

  return <AppShell currentPath="/app/material-planning">
    <div className="mx-auto max-w-[1600px] space-y-7 p-5 sm:p-7 lg:p-8">
      <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div><p className="text-sm text-[#8E827A]">Workspace / Materials / Planning</p><h1 className="mt-1 text-2xl font-semibold text-[#323232] sm:text-3xl">Project Material Planning</h1><p className="mt-2 text-sm text-[#8E827A]">Project plans and current stock quantities returned by the backend.</p></div>
        <select aria-label="Select project" value={selectedProjectId} onChange={(event) => selectProject(event.target.value)} disabled={projectsLoading || projects.length === 0} className="rounded-xl border border-[#C8BCB4] bg-white px-4 py-3 text-sm text-[#595552]">
          {projects.length === 0 && <option value="">No accessible projects</option>}
          {projects.map((project) => <option key={project.id} value={String(project.id)}>{project.code} — {project.name}</option>)}
        </select>
      </section>

      {projectsError && <ErrorBanner message={projectsError} retry={retryProjects} />}
      {error && <ErrorBanner message={error} retry={() => setRetry((value) => value + 1)} />}
      {selectedProject && <section className="rounded-2xl border border-[#C8BCB4]/70 bg-[#E8DCD4] p-5">
        <h2 className="font-semibold text-[#323232]">{selectedProject.code} · {selectedProject.name}</h2>
        <p className="mt-1 text-xs text-[#595552]">{selectedProject.location} · {selectedProject.status.replace('_', ' ')}</p>
        <p className="mt-3 text-sm text-[#595552]">Material-plan quantities are displayed from the project inventory API. This backend currently exposes no plan create/update/delete endpoint.</p>
      </section>}

      <section className="grid gap-4 sm:grid-cols-2">
        <Stat label="Materials Planned" value={loading ? '—' : inventory.length} icon={<ClipboardCheck size={20} />} />
        <Stat label="Low Stock Items" value={loading ? '—' : lowStock} icon={<PackageSearch size={20} />} />
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#C8BCB4]/70 bg-white">
        <div className="flex flex-col justify-between gap-4 border-b border-[#E8DCD4] p-5 sm:flex-row sm:items-center">
          <div><h2 className="font-semibold text-[#323232]">Planned Materials & Inventory</h2><p className="mt-1 text-xs text-[#8E827A]">{filtered.length} materials in this project plan</p></div>
          <div className="flex items-center gap-2 rounded-xl border border-[#C8BCB4] px-3 py-2"><Search size={17} className="text-[#8E827A]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search material..." className="w-full bg-transparent text-sm outline-none sm:w-52" /></div>
        </div>
        <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left">
          <thead className="bg-[#F7F3EE] text-xs text-[#8E827A]"><tr><th className="px-5 py-4 font-medium">Material</th><th className="px-5 py-4 font-medium">Planned</th><th className="px-5 py-4 font-medium">Opening Stock</th><th className="px-5 py-4 font-medium">Received</th><th className="px-5 py-4 font-medium">Consumed</th><th className="px-5 py-4 font-medium">Available</th><th className="px-5 py-4 font-medium">Low-stock threshold</th><th className="px-5 py-4 font-medium">Status</th></tr></thead>
          <tbody className="divide-y divide-[#E8DCD4]">
            {filtered.map((row) => <tr key={row.materialId} className="hover:bg-[#F7F3EE]/60"><td className="px-5 py-4"><p className="text-sm font-medium text-[#323232]">{row.materialName}</p><p className="mt-1 text-xs text-[#8E827A]">{row.category.replaceAll('_', ' ')}</p></td><td className="px-5 py-4 text-sm">{formatQty(row.plannedQuantity)} {row.unit}</td><td className="px-5 py-4 text-sm">{formatQty(row.openingStock)} {row.unit}</td><td className="px-5 py-4 text-sm text-[#617858]">+{formatQty(row.totalIn)} {row.unit}</td><td className="px-5 py-4 text-sm text-[#9A7950]">−{formatQty(row.totalOut)} {row.unit}</td><td className="px-5 py-4 text-sm font-semibold">{formatQty(row.availableStock)} {row.unit}</td><td className="px-5 py-4 text-sm">{row.lowStockThreshold == null ? '—' : `${formatQty(row.lowStockThreshold)} ${row.unit}`}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${row.isLowStock ? 'bg-[#F8ECEA] text-[#9B625A]' : 'bg-[#E8EFE5] text-[#617858]'}`}>{row.isLowStock ? 'Low stock' : 'Healthy'}</span></td></tr>)}
            {loading && <tr><td colSpan={8} className="px-5 py-12 text-center text-sm text-[#8E827A]">Loading project inventory…</td></tr>}
            {!loading && !error && filtered.length === 0 && <tr><td colSpan={8} className="px-5 py-12 text-center text-sm text-[#8E827A]">No planned materials returned for this project.</td></tr>}
          </tbody>
        </table></div>
      </section>
    </div>
  </AppShell>
}

function Stat({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return <div className="flex items-center justify-between rounded-2xl border border-[#C8BCB4]/70 bg-white p-5"><div><p className="text-sm text-[#8E827A]">{label}</p><p className="mt-2 text-2xl font-semibold text-[#323232]">{value}</p></div><div className="rounded-xl bg-[#F7F3EE] p-3 text-[#595552]">{icon}</div></div>
}

function ErrorBanner({ message, retry }: { message: string; retry: () => void }) {
  return <div role="alert" className="flex items-center justify-between gap-3 rounded-xl bg-[#F8ECEA] px-4 py-3 text-sm text-[#9B625A]"><span>{message}</span><button type="button" onClick={retry} className="inline-flex items-center gap-1 font-semibold underline"><RefreshCw size={14} />Retry</button></div>
}
