import { useEffect, useMemo, useState } from 'react'
import { PackageSearch, AlertTriangle, IndianRupee, CheckCircle2 } from 'lucide-react'
import { AppShell } from '../../app-shell/components/AppShell'
import type { Material } from '../../materials/types/material'
import { getStoredMaterials } from '../../materials/data/materialStore'
import { computeBalances, formatINR, formatQty } from '../data/stockStore'

type Project = {
  id: number
  code: string
  name: string
  status: 'Planning' | 'In Progress' | 'Completed' | 'On Hold'
}

export function StockDashboardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [materials, setMaterials] = useState<Material[]>(() => getStoredMaterials())
  const [projectFilter, setProjectFilter] = useState('All')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('forgeos_projects')
      setProjects(saved ? JSON.parse(saved) : [])
    } catch {
      setProjects([])
    }
  }, [])

  useEffect(() => {
    setMaterials(getStoredMaterials())
  }, [refreshKey])

  const rows = useMemo(
    () => computeBalances(projectFilter === 'All' ? undefined : projectFilter),
    [projectFilter, refreshKey]
  )

  const rowsWithValue = useMemo(() => rows.map((row) => {
    const material = materials.find((m) => m.id === row.materialId)
    const rate = material?.referenceRate
    return { ...row, rate, value: rate != null ? row.balance * rate : undefined }
  }), [rows, materials])

  const lowStockRows = rowsWithValue.filter((row) => row.isLow)
  const totalValue = rowsWithValue.reduce((total, row) => total + (row.value ?? 0), 0)

  const stats = [
    { label: 'Materials Tracked', value: String(rows.length), icon: PackageSearch },
    { label: 'Low Stock Alerts', value: String(lowStockRows.length), icon: AlertTriangle },
    { label: 'Stock Value (at ref. rate)', value: formatINR(totalValue), icon: IndianRupee },
    { label: 'Healthy Items', value: String(rows.length - lowStockRows.length), icon: CheckCircle2 },
  ]

  return (
    <AppShell currentPath="/app/stock">
      <div className="mx-auto max-w-[1600px] space-y-7 p-5 sm:p-7 lg:p-8">
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm text-[#8E827A]">Workspace / Stock / Available</p>
            <h1 className="mt-1 text-2xl font-semibold text-[#323232] sm:text-3xl">Available Stock</h1>
            <p className="mt-2 text-sm text-[#8E827A]">Live balances per material against planned quantities, with low-stock alerts.</p>
          </div>
          <div className="flex gap-3">
            <select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)} className="rounded-xl border border-[#C8BCB4] bg-white px-4 py-3 text-sm text-[#595552] outline-none">
              <option value="All">All projects</option>
              {projects.map((project) => (
                <option key={project.id} value={String(project.id)}>{project.code} — {project.name}</option>
              ))}
            </select>
            <button onClick={() => setRefreshKey((key) => key + 1)} className="rounded-xl border border-[#C8BCB4] px-4 py-3 text-sm text-[#595552] hover:bg-[#F7F3EE]">
              Refresh
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="rounded-2xl border border-[#C8BCB4]/70 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#8E827A]">{stat.label}</p>
                    <h2 className="mt-3 text-2xl font-semibold text-[#323232]">{stat.value}</h2>
                  </div>
                  <div className={`rounded-xl p-3 ${stat.label === 'Low Stock Alerts' && lowStockRows.length > 0 ? 'bg-[#F8ECEA] text-[#9B625A]' : 'bg-[#F7F3EE] text-[#595552]'}`}><Icon size={21} /></div>
                </div>
              </div>
            )
          })}
        </section>

        {lowStockRows.length > 0 && (
          <section className="rounded-2xl border border-[#EAD5D0] bg-[#F8ECEA] p-5">
            <p className="flex items-center gap-2 text-sm font-semibold text-[#9B625A]">
              <AlertTriangle size={16} /> {lowStockRows.length} material{lowStockRows.length > 1 ? 's' : ''} at or below the low-stock threshold
            </p>
            <p className="mt-2 text-sm text-[#9B625A]/80">
              {lowStockRows.map((row) => `${row.materialName} (${formatQty(row.balance)} ${row.materialUnit} left)`).join(' · ')}
            </p>
          </section>
        )}

        <section className="overflow-hidden rounded-2xl border border-[#C8BCB4]/70 bg-white">
          <div className="border-b border-[#E8DCD4] p-5">
            <h2 className="font-semibold text-[#323232]">Balances by Material</h2>
            <p className="mt-1 text-xs text-[#8E827A]">Balance bar shows available stock against the planned quantity</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1040px] text-left">
              <thead className="bg-[#F7F3EE] text-xs text-[#8E827A]">
                <tr>
                  <th className="px-5 py-4 font-medium">Material</th>
                  <th className="px-5 py-4 font-medium">Total IN</th>
                  <th className="px-5 py-4 font-medium">Total OUT</th>
                  <th className="px-5 py-4 font-medium">Balance</th>
                  <th className="px-5 py-4 font-medium">Planned</th>
                  <th className="px-5 py-4 font-medium w-[220px]">Balance vs Planned</th>
                  <th className="px-5 py-4 font-medium">Value</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DCD4]">
                {rowsWithValue.map((row) => {
                  const plannedPercent = row.plannedQty ? Math.min(100, (row.balance / row.plannedQty) * 100) : null
                  return (
                    <tr key={row.materialId} className="hover:bg-[#F7F3EE]/60">
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-[#323232]">{row.materialName}</p>
                        <p className="mt-1 text-xs text-[#8E827A]">per {row.materialUnit}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-[#617858]">+{formatQty(row.totalIn)}</td>
                      <td className="px-5 py-4 text-sm text-[#9A7950]">−{formatQty(row.totalOut)}</td>
                      <td className="px-5 py-4 text-sm font-semibold text-[#323232]">{formatQty(row.balance)} {row.materialUnit}</td>
                      <td className="px-5 py-4 text-sm text-[#595552]">{row.plannedQty != null ? `${formatQty(row.plannedQty)} ${row.materialUnit}` : 'No plan'}</td>
                      <td className="px-5 py-4">
                        {plannedPercent != null ? (
                          <div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-[#F7F3EE]">
                              <div
                                className={`h-full rounded-full ${row.isLow ? 'bg-[#B87A4F]' : 'bg-[#617858]'}`}
                                style={{ width: `${Math.max(2, plannedPercent)}%` }}
                              />
                            </div>
                            <p className="mt-1 text-xs text-[#8E827A]">{Math.round(plannedPercent)}% of plan in stock</p>
                          </div>
                        ) : (
                          <span className="text-xs text-[#8E827A]">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm text-[#595552]">{row.value != null ? formatINR(row.value) : '—'}</td>
                      <td className="px-5 py-4">
                        {row.isLow ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#F8ECEA] px-2.5 py-1 text-xs font-medium text-[#9B625A]"><AlertTriangle size={12} /> Low stock</span>
                        ) : (
                          <span className="rounded-full bg-[#E8EFE5] px-2.5 py-1 text-xs font-medium text-[#617858]">Healthy</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
                {rowsWithValue.length === 0 && <tr><td colSpan={8} className="px-5 py-12 text-center text-sm text-[#8E827A]">No stock activity found. Record a Stock IN entry to get started.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  )
}
