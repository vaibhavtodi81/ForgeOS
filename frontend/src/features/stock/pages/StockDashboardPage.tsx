import { useEffect, useMemo, useState } from 'react'
import { PackageSearch, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react'
import { AppShell } from '../../app-shell/components/AppShell'
import { useProjects } from '../../projects/useProjects'
import { fetchInventorySummary, fetchProjectInventory, type InventoryRow, type InventorySummaryRow } from '../data/inventoryApi'
import { formatQty } from '../data/formatting'

export function StockDashboardPage() {
  const { projects, selectedProject, selectedProjectId, selectProject, isLoading: projectsLoading, error: projectsError, retry: retryProjects } = useProjects()
  const [inventory, setInventory] = useState<InventoryRow[]>([])
  const [summary, setSummary] = useState<InventorySummaryRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    if (!selectedProjectId) {
      setInventory([])
      setSummary([])
      return
    }
    const controller = new AbortController()
    setLoading(true)
    Promise.all([
      fetchProjectInventory(selectedProjectId, controller.signal),
      fetchInventorySummary(selectedProjectId, controller.signal),
    ]).then(([rows, summaryRows]) => {
      if (!controller.signal.aborted) {
        setInventory(rows)
        setSummary(summaryRows)
        setError(null)
      }
    }).catch((cause: unknown) => {
      if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'Unable to load project inventory.')
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false)
    })
    return () => controller.abort()
  }, [selectedProjectId, retry])

  const summaryByMaterial = useMemo(() => new Map(summary.map((row) => [row.materialId, row])), [summary])
  const lowStock = inventory.filter((row) => row.isLowStock)
  const stats = [
    { label: 'Materials Tracked', value: inventory.length, icon: PackageSearch },
    { label: 'Low Stock Alerts', value: lowStock.length, icon: AlertTriangle },
    { label: 'Healthy Items', value: inventory.length - lowStock.length, icon: CheckCircle2 },
  ]

  return <AppShell currentPath="/app/stock">
    <div className="mx-auto max-w-[1600px] space-y-7 p-5 sm:p-7 lg:p-8">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div><p className="text-sm text-[#8E827A]">Workspace / Stock / Available</p><h1 className="mt-1 text-2xl font-semibold text-[#323232] sm:text-3xl">Available Stock</h1><p className="mt-2 text-sm text-[#8E827A]">Current project inventory and transaction-based balances.</p></div>
        <select aria-label="Select project" value={selectedProjectId} onChange={(event) => selectProject(event.target.value)} disabled={projectsLoading || projects.length === 0} className="rounded-xl border border-[#C8BCB4] bg-white px-4 py-3 text-sm text-[#595552]">{projects.length === 0 && <option value="">No accessible projects</option>}{projects.map((project) => <option key={project.id} value={String(project.id)}>{project.code} — {project.name}</option>)}</select>
      </section>
      {projectsError && <ErrorBanner message={projectsError} retry={retryProjects} />}
      {error && <ErrorBanner message={error} retry={() => setRetry((value) => value + 1)} />}
      {selectedProject && <p className="text-sm text-[#8E827A]">{selectedProject.code} · {selectedProject.name}</p>}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map(({ label, value, icon: Icon }) => <div key={label} className="rounded-2xl border border-[#C8BCB4]/70 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-sm text-[#8E827A]">{label}</p><h2 className="mt-3 text-2xl font-semibold text-[#323232]">{loading ? '—' : value}</h2></div><div className={`rounded-xl p-3 ${label === 'Low Stock Alerts' && lowStock.length > 0 ? 'bg-[#F8ECEA] text-[#9B625A]' : 'bg-[#F7F3EE] text-[#595552]'}`}><Icon size={21} /></div></div></div>)}
      </section>
      {lowStock.length > 0 && <section className="rounded-2xl border border-[#EAD5D0] bg-[#F8ECEA] p-5"><p className="flex items-center gap-2 text-sm font-semibold text-[#9B625A]"><AlertTriangle size={16} />{lowStock.length} item(s) are at or below the backend low-stock threshold.</p><p className="mt-2 text-sm text-[#9B625A]/80">{lowStock.map((row) => `${row.materialName} (${formatQty(row.availableStock)} ${row.unit})`).join(' · ')}</p></section>}

      <section className="overflow-hidden rounded-2xl border border-[#C8BCB4]/70 bg-white">
        <div className="border-b border-[#E8DCD4] p-5"><h2 className="font-semibold text-[#323232]">Balances by Material</h2><p className="mt-1 text-xs text-[#8E827A]">Values are returned by the project inventory and summary APIs.</p></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left">
          <thead className="bg-[#F7F3EE] text-xs text-[#8E827A]"><tr><th className="px-5 py-4 font-medium">Material</th><th className="px-5 py-4 font-medium">Opening</th><th className="px-5 py-4 font-medium">Received</th><th className="px-5 py-4 font-medium">Consumed</th><th className="px-5 py-4 font-medium">Adjustments</th><th className="px-5 py-4 font-medium">Available</th><th className="px-5 py-4 font-medium">Planned</th><th className="px-5 py-4 font-medium">Threshold</th><th className="px-5 py-4 font-medium">Status</th></tr></thead>
          <tbody className="divide-y divide-[#E8DCD4]">
            {inventory.map((row) => {
              const details = summaryByMaterial.get(row.materialId)
              const plannedPercent = row.plannedQuantity > 0 ? Math.min(100, row.availableStock / row.plannedQuantity * 100) : null
              return <tr key={row.materialId} className="hover:bg-[#F7F3EE]/60"><td className="px-5 py-4"><p className="text-sm font-medium text-[#323232]">{row.materialName}</p><p className="mt-1 text-xs text-[#8E827A]">{row.category.replaceAll('_', ' ')} · {row.unit}</p></td><td className="px-5 py-4 text-sm">{formatQty(row.openingStock)}</td><td className="px-5 py-4 text-sm text-[#617858]">+{formatQty(details?.totalReceived ?? row.totalIn)}</td><td className="px-5 py-4 text-sm text-[#9A7950]">−{formatQty(details?.totalConsumed ?? row.totalOut)}</td><td className="px-5 py-4 text-sm">+{formatQty(row.adjustmentIn)} / −{formatQty(row.adjustmentOut)}</td><td className="px-5 py-4 text-sm font-semibold">{formatQty(row.availableStock)} {row.unit}</td><td className="px-5 py-4 text-sm">{formatQty(row.plannedQuantity)} {row.unit}{plannedPercent != null && <span className="mt-1 block text-xs text-[#8E827A]">{Math.round(plannedPercent)}% in stock vs plan</span>}</td><td className="px-5 py-4 text-sm">{row.lowStockThreshold == null ? '—' : `${formatQty(row.lowStockThreshold)} ${row.unit}`}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${row.isLowStock ? 'bg-[#F8ECEA] text-[#9B625A]' : 'bg-[#E8EFE5] text-[#617858]'}`}>{row.isLowStock ? 'Low stock' : 'Healthy'}</span></td></tr>
            })}
            {loading && <tr><td colSpan={9} className="px-5 py-12 text-center text-sm text-[#8E827A]">Loading inventory…</td></tr>}
            {!loading && !error && inventory.length === 0 && <tr><td colSpan={9} className="px-5 py-12 text-center text-sm text-[#8E827A]">No project inventory records are configured.</td></tr>}
          </tbody>
        </table></div>
      </section>
    </div>
  </AppShell>
}

function ErrorBanner({ message, retry }: { message: string; retry: () => void }) {
  return <div role="alert" className="flex items-center justify-between gap-3 rounded-xl bg-[#F8ECEA] px-4 py-3 text-sm text-[#9B625A]"><span>{message}</span><button type="button" onClick={retry} className="inline-flex items-center gap-1 font-semibold underline"><RefreshCw size={14} />Retry</button></div>
}
