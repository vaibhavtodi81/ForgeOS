import { useEffect, useMemo, useState } from 'react'
import { TrendingUp, AlertTriangle, CheckCircle2, IndianRupee } from 'lucide-react'
import { AppShell } from '../../app-shell/components/AppShell'
import { computeWastage, formatINR, formatQty } from '../../stock/data/stockStore'
import type { WastageRow, WastageStatus } from '../../stock/types/stock'

type Project = {
  id: number
  code: string
  name: string
  status: 'Planning' | 'In Progress' | 'Completed' | 'On Hold'
}

const statusStyles: Record<WastageStatus, string> = {
  OK: 'bg-[#E8EFE5] text-[#617858]',
  OVERRUN: 'bg-[#F8ECEA] text-[#9B625A]',
  NO_BASELINE: 'bg-[#F5EDE1] text-[#9A7950]',
}

export function WastageAnalysisPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [projectFilter, setProjectFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('forgeos_projects')
      setProjects(saved ? JSON.parse(saved) : [])
    } catch {
      setProjects([])
    }
  }, [])

  const rows = useMemo(
    () => computeWastage(projectFilter === 'All' ? undefined : projectFilter),
    [projectFilter, refreshKey]
  )

  const filtered = useMemo(
    () => rows.filter((row) => statusFilter === 'All' || row.status === statusFilter),
    [rows, statusFilter]
  )

  const overrunRows = rows.filter((row) => row.status === 'OVERRUN')
  const totalEstimatedLoss = rows.reduce((total, row) => total + row.estimatedLoss, 0)
  const worstOverrun = rows.reduce<WastageRow | null>((worst, row) => (
    worst == null || row.overrunPercent > worst.overrunPercent ? row : worst
  ), null)

  const stats = [
    { label: 'Overrun Materials', value: String(overrunRows.length), icon: AlertTriangle },
    { label: 'Total Estimated Loss', value: totalEstimatedLoss > 0 ? formatINR(totalEstimatedLoss) : '₹0', icon: IndianRupee },
    { label: 'Materials Tracked', value: String(rows.length), icon: TrendingUp },
    { label: 'Worst Overrun', value: worstOverrun ? `${Math.round(worstOverrun.overrunPercent)}%` : '—', icon: CheckCircle2 },
  ]

  return (
    <AppShell currentPath="/app/wastage">
      <div className="mx-auto max-w-[1600px] space-y-7 p-5 sm:p-7 lg:p-8">
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm text-[#8E827A]">Workspace / Stock / Wastage</p>
            <h1 className="mt-1 text-2xl font-semibold text-[#323232] sm:text-3xl">Wastage Analysis</h1>
            <p className="mt-2 text-sm text-[#8E827A]">Progress-adjusted consumption vs plan, across every project and material.</p>
          </div>
          <div className="flex gap-3">
            <select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)} className="rounded-xl border border-[#C8BCB4] bg-white px-4 py-3 text-sm text-[#595552] outline-none">
              <option value="All">All projects (portfolio)</option>
              {projects.map((project) => (
                <option key={project.id} value={String(project.id)}>{project.code} — {project.name}</option>
              ))}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-[#C8BCB4] bg-white px-4 py-3 text-sm text-[#595552] outline-none">
              <option value="All">All statuses</option>
              <option value="OVERRUN">OVERRUN</option>
              <option value="OK">OK</option>
              <option value="NO_BASELINE">NO_BASELINE</option>
            </select>
            <button onClick={() => setRefreshKey((key) => key + 1)} className="rounded-xl border border-[#C8BCB4] px-4 py-3 text-sm text-[#595552] hover:bg-[#F7F3EE]">
              Refresh
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-[#C8BCB4]/70 bg-[#E8DCD4] p-5 text-sm text-[#595552]">
          <p className="font-semibold text-[#323232]">How status is calculated</p>
          <p className="mt-2">
            Expected-to-date = planned quantity × site progress %. Consumption above that is an overrun.
            A material flags <span className="font-medium text-[#9B625A]">OVERRUN</span> when the overrun reaches its wastage threshold (default 10%).
            <span className="font-medium text-[#9A7950]"> NO_BASELINE</span> means stock was consumed without a material plan.
            Estimated loss = overrun quantity × planned rate. Recorded wastage counts DAMAGED and LOST stock OUT entries.
          </p>
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
                  <div className={`rounded-xl p-3 ${stat.label === 'Overrun Materials' && overrunRows.length > 0 ? 'bg-[#F8ECEA] text-[#9B625A]' : 'bg-[#F7F3EE] text-[#595552]'}`}><Icon size={21} /></div>
                </div>
              </div>
            )
          })}
        </section>

        <section className="overflow-hidden rounded-2xl border border-[#C8BCB4]/70 bg-white">
          <div className="border-b border-[#E8DCD4] p-5">
            <h2 className="font-semibold text-[#323232]">Per-Material Wastage</h2>
            <p className="mt-1 text-xs text-[#8E827A]">Sorted by estimated loss, then overrun % — worst offenders first</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px] text-left">
              <thead className="bg-[#F7F3EE] text-xs text-[#8E827A]">
                <tr>
                  <th className="px-5 py-4 font-medium">Project</th>
                  <th className="px-5 py-4 font-medium">Material</th>
                  <th className="px-5 py-4 font-medium">Progress</th>
                  <th className="px-5 py-4 font-medium">Planned</th>
                  <th className="px-5 py-4 font-medium">Expected-to-date</th>
                  <th className="px-5 py-4 font-medium">Consumed</th>
                  <th className="px-5 py-4 font-medium">Overrun</th>
                  <th className="px-5 py-4 font-medium">Recorded Wastage</th>
                  <th className="px-5 py-4 font-medium">Est. Loss</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DCD4]">
                {filtered.map((row) => (
                  <tr key={`${row.projectId}-${row.materialId}`} className="hover:bg-[#F7F3EE]/60">
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-[#323232]">{row.projectCode}</p>
                      <p className="mt-1 text-xs text-[#8E827A]">{row.projectName}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-[#323232]">{row.materialName}</p>
                      <p className="mt-1 text-xs text-[#8E827A]">per {row.materialUnit}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-[#595552]">{row.progressPercent}%</td>
                    <td className="px-5 py-4 text-sm text-[#595552]">{row.plannedQty > 0 ? formatQty(row.plannedQty) : '—'}</td>
                    <td className="px-5 py-4 text-sm text-[#595552]">{row.plannedQty > 0 ? formatQty(row.expectedToDate) : '—'}</td>
                    <td className="px-5 py-4 text-sm font-medium text-[#323232]">{formatQty(row.consumed)}</td>
                    <td className="px-5 py-4 text-sm">
                      {row.overrunQty > 0 ? (
                        <span className="font-medium text-[#9B625A]">{formatQty(row.overrunQty)} ({Math.round(row.overrunPercent)}%)</span>
                      ) : (
                        <span className="text-[#617858]">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm text-[#595552]">
                      {row.recordedWastageQty > 0 ? `${formatQty(row.recordedWastageQty)} ${row.materialUnit}` : '—'}
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-[#9B625A]">{row.estimatedLoss > 0 ? formatINR(row.estimatedLoss) : '—'}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[row.status]}`} title={row.status === 'OVERRUN' ? `Exceeds ${row.wastageThreshold}% threshold` : undefined}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={10} className="px-5 py-12 text-center text-sm text-[#8E827A]">No wastage data for the current selection.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  )
}
