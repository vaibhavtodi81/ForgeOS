import { useEffect, useState } from 'react'
import { Activity, ArrowLeft, BarChart3, CalendarDays, ClipboardList, Layers3, MapPin, UserRound, Wallet } from 'lucide-react'
import { AppShell } from '../../app-shell/components/AppShell'
import { apiGet, ApiError } from '../../../lib/api'
import { navigate, useHashRoute } from '../../../lib/router'
import { mapProject, type ApiProject } from '../project-utils'
import type { Project } from '../projects-context'

const statusLabels: Record<Project['status'], string> = {
  PLANNING: 'Planning',
  ACTIVE: 'Active',
  ON_HOLD: 'On Hold',
  COMPLETED: 'Completed',
}

interface ProjectDetailCounts {
  logs: number
  transactions: number
  plans: number
  milestones: number
  invoices: number
}

interface ApiProjectDetail extends ApiProject {
  landId: string | null
  assignedPmId: string | null
  createdAt: string
  updatedAt: string
  _count: ProjectDetailCounts
}

interface RecentLog {
  id: string
  logDate: string
  progressPercent: number
  workSummary: string | null
  createdBy: { id: string; name: string } | null
}

interface StockTxn {
  id: string
  txnType: 'IN' | 'OUT' | 'ADJUSTMENT'
  quantity: number
  unitRate: number | null
  txnDate: string
  isVoided: boolean
  material: { name: string; unit: string }
}

interface PlanRow {
  id: string
  plannedQuantity: number
  plannedUnitRate: number | null
  lowStockThreshold: number | null
  wastageThresholdPct: number | null
  status: 'DRAFT' | 'APPROVED' | 'ARCHIVED'
  material: { name: string; unit: string; category: string }
}

interface DetailResult {
  key: string
  detail: ApiProjectDetail | null
  recentLogs: RecentLog[]
  transactions: StockTxn[]
  plans: PlanRow[]
  error: string | null
}

const txnTypeLabels: Record<StockTxn['txnType'], string> = {
  IN: 'Stock in',
  OUT: 'Stock out',
  ADJUSTMENT: 'Adjustment',
}

const txnTypeStyles: Record<StockTxn['txnType'], string> = {
  IN: 'bg-[#E8EFE5] text-[#617858]',
  OUT: 'bg-[#F5EDE1] text-[#9A7950]',
  ADJUSTMENT: 'bg-[#F1EAF6] text-[#806B96]',
}

const planStatusStyles: Record<PlanRow['status'], string> = {
  DRAFT: 'bg-[#F5EDE1] text-[#9A7950]',
  APPROVED: 'bg-[#E8EFE5] text-[#617858]',
  ARCHIVED: 'bg-[#F7F3EE] text-[#8E827A]',
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString() : 'Not specified'
}

function formatBudget(value: string | number) {
  const amount = Number(value)
  return Number.isFinite(amount)
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount)
    : 'Not specified'
}

function formatNumber(value: number | null, digits = 0) {
  if (value === null || !Number.isFinite(value)) return '—'
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: digits }).format(value)
}

function extractProjectId(route: string): string | null {
  const parts = route.split('/').filter(Boolean)
  return parts.length === 3 && parts[0] === 'app' && parts[1] === 'projects' && parts[2] ? parts[2] : null
}

export function ProjectDetailsPage() {
  const route = useHashRoute()
  const projectId = extractProjectId(route)
  const [result, setResult] = useState<DetailResult | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const requestKey = `${projectId ?? ''}:${retryCount}`

  useEffect(() => {
    if (!projectId) return
    const controller = new AbortController()
    const id = encodeURIComponent(projectId)

    Promise.all([
      apiGet<ApiProjectDetail>(`/projects/${id}`, { signal: controller.signal }),
      apiGet<RecentLog[]>(`/projects/${id}/daily-logs?limit=5`, { signal: controller.signal }),
      apiGet<StockTxn[]>(`/projects/${id}/inventory/transactions`, { signal: controller.signal }),
      apiGet<PlanRow[]>(`/projects/${id}/material-plans`, { signal: controller.signal }),
    ]).then(([projectResponse, logsResponse, txnsResponse, plansResponse]) => {
      setResult({
        key: requestKey,
        detail: projectResponse.data,
        recentLogs: logsResponse.data,
        transactions: txnsResponse.data.slice(0, 6),
        plans: plansResponse.data,
        error: null,
      })
    }).catch((cause: unknown) => {
      if (controller.signal.aborted) return
      setResult({
        key: requestKey,
        detail: null,
        recentLogs: [],
        transactions: [],
        plans: [],
        error: cause instanceof ApiError && cause.status === 404
          ? 'This project is unavailable to your account.'
          : cause instanceof Error ? cause.message : 'Unable to load project details.',
      })
    })

    return () => controller.abort()
  }, [projectId, requestKey])

  const currentResult = result?.key === requestKey ? result : null
  const error = projectId ? currentResult?.error ?? null : 'The project ID is invalid.'
  const isLoading = Boolean(projectId) && !currentResult
  const detail = currentResult?.detail ?? null
  const project = detail
    ? mapProject({ ...detail, status: detail.status as Project['status'] })
    : null

  return (
    <AppShell currentPath="/app/projects">
      <div className="mx-auto max-w-5xl space-y-6 p-5 sm:p-7 lg:p-8">
        <button
          type="button"
          onClick={() => navigate('/app/projects')}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#595552] hover:text-[#323232]"
        >
          <ArrowLeft size={17} /> Back to Projects
        </button>

        {isLoading ? (
          <section aria-live="polite" className="rounded-2xl border border-[#C8BCB4] bg-white p-8 text-sm text-[#8E827A]">
            Loading project details…
          </section>
        ) : error ? (
          <section role="alert" className="rounded-2xl border border-[#C8BCB4] bg-white p-8">
            <h1 className="text-xl font-semibold text-[#323232]">Project unavailable</h1>
            <p className="mt-2 text-sm text-[#8E827A]">{error}</p>
            <button type="button" onClick={() => setRetryCount((count) => count + 1)} className="mt-5 rounded-xl bg-[#323232] px-4 py-2 text-sm font-medium text-white">Retry</button>
          </section>
        ) : project && detail && currentResult ? (
          <>
            <section className="rounded-2xl border border-[#C8BCB4]/70 bg-white p-6">
              <p className="text-sm font-medium text-[#8E827A]">{project.code}</p>
              <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-semibold text-[#323232]">{project.name}</h1>
                  <p className="mt-2 flex items-center gap-2 text-sm text-[#8E827A]">
                    <MapPin size={16} /> {project.location}
                  </p>
                </div>
                <span className="rounded-full bg-[#F7F3EE] px-3 py-1.5 text-sm font-medium text-[#595552]">
                  {statusLabels[project.status]}
                </span>
              </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2">
              {[
                { label: 'Project Manager', value: project.assignedPm?.name ?? 'Unassigned', icon: UserRound },
                { label: 'Budget', value: formatBudget(project.totalBudget), icon: Wallet },
                { label: 'Start Date', value: formatDate(project.startDate), icon: CalendarDays },
                { label: 'Expected End Date', value: formatDate(project.expectedEndDate), icon: CalendarDays },
                { label: 'Actual End Date', value: formatDate(project.actualEndDate), icon: CalendarDays },
                {
                  label: 'Land Parcel',
                  value: detail.land ? [detail.land.name, detail.land.city].filter(Boolean).join(', ') || 'Not linked' : 'Not linked',
                  icon: MapPin,
                },
                { label: 'Wastage Threshold', value: `${project.wastageThresholdPct ?? 10}%`, icon: Activity },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="rounded-2xl border border-[#C8BCB4]/70 bg-white p-5">
                  <div className="flex items-center gap-2 text-sm text-[#8E827A]">
                    <Icon size={17} /> {label}
                  </div>
                  <p className="mt-3 font-semibold text-[#323232]">{value}</p>
                </div>
              ))}
            </section>

            <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
              {[
                { label: 'Daily logs', value: detail._count.logs, icon: ClipboardList },
                { label: 'Stock movements', value: detail._count.transactions, icon: Layers3 },
                { label: 'Material plans', value: detail._count.plans, icon: BarChart3 },
                { label: 'Milestones', value: detail._count.milestones, icon: CalendarDays },
                { label: 'Invoices', value: detail._count.invoices, icon: Wallet },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="rounded-2xl border border-[#C8BCB4]/70 bg-white p-4">
                  <div className="flex items-center gap-2 text-xs text-[#8E827A]">
                    <Icon size={15} /> {label}
                  </div>
                  <p className="mt-2 text-2xl font-semibold text-[#323232]">{value}</p>
                </div>
              ))}
            </section>

            <section className="rounded-2xl border border-[#C8BCB4]/70 bg-white">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8DCD4] p-5">
                <div>
                  <h2 className="font-semibold text-[#323232]">Recent site logs</h2>
                  <p className="mt-1 text-xs text-[#8E827A]">Latest daily-log records for this project.</p>
                </div>
                <button type="button" onClick={() => navigate(`/projects/${project.id}/logs`)} className="text-sm font-medium text-[#595552] hover:text-[#323232]">
                  View all logs
                </button>
              </div>
              {currentResult.recentLogs.length ? (
                <div className="divide-y divide-[#E8DCD4]">
                  {currentResult.recentLogs.map((log) => (
                    <div key={log.id} className="flex flex-wrap items-start justify-between gap-3 p-5">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#323232]">{formatDate(log.logDate)}</p>
                        <p className="mt-1 text-sm text-[#8E827A]">{log.workSummary || 'No work summary recorded.'}</p>
                        <p className="mt-1 text-xs text-[#8E827A]">Recorded by {log.createdBy?.name ?? 'Unknown user'}</p>
                      </div>
                      <span className="rounded-full bg-[#F7F3EE] px-3 py-1.5 text-sm font-medium text-[#595552]">{Number(log.progressPercent)}%</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="p-5 text-sm text-[#8E827A]">No daily logs have been recorded for this project yet.</p>
              )}
            </section>

            <section className="rounded-2xl border border-[#C8BCB4]/70 bg-white">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8DCD4] p-5">
                <div>
                  <h2 className="font-semibold text-[#323232]">Recent stock movements</h2>
                  <p className="mt-1 text-xs text-[#8E827A]">Latest inventory transactions for this project.</p>
                </div>
                <button type="button" onClick={() => navigate('/app/stock-ledger')} className="text-sm font-medium text-[#595552] hover:text-[#323232]">
                  Open stock ledger
                </button>
              </div>
              {currentResult.transactions.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left">
                    <thead className="bg-[#F7F3EE] text-xs text-[#8E827A]">
                      <tr>
                        <th className="px-5 py-3 font-medium">Date</th>
                        <th className="px-5 py-3 font-medium">Material</th>
                        <th className="px-5 py-3 font-medium">Type</th>
                        <th className="px-5 py-3 font-medium">Quantity</th>
                        <th className="px-5 py-3 text-right font-medium">Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8DCD4]">
                      {currentResult.transactions.map((txn) => (
                        <tr key={txn.id} className={txn.isVoided ? 'opacity-50' : ''}>
                          <td className="px-5 py-3.5 text-xs text-[#595552]">{formatDate(txn.txnDate)}</td>
                          <td className="px-5 py-3.5 text-sm text-[#323232]">{txn.material.name}</td>
                          <td className="px-5 py-3.5">
                            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${txnTypeStyles[txn.txnType]}`}>
                              {txnTypeLabels[txn.txnType]}{txn.isVoided ? ' (voided)' : ''}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-sm text-[#595552]">{formatNumber(txn.quantity, 2)} {txn.material.unit}</td>
                          <td className="px-5 py-3.5 text-right text-sm text-[#595552]">
                            {txn.unitRate === null ? '—' : formatBudget(txn.quantity * txn.unitRate)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="p-5 text-sm text-[#8E827A]">No stock movements have been recorded for this project yet.</p>
              )}
            </section>

            <section className="rounded-2xl border border-[#C8BCB4]/70 bg-white">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8DCD4] p-5">
                <div>
                  <h2 className="font-semibold text-[#323232]">Material plans</h2>
                  <p className="mt-1 text-xs text-[#8E827A]">Planned quantities and thresholds for this project.</p>
                </div>
                <button type="button" onClick={() => navigate('/app/material-planning')} className="text-sm font-medium text-[#595552] hover:text-[#323232]">
                  Manage plans
                </button>
              </div>
              {currentResult.plans.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left">
                    <thead className="bg-[#F7F3EE] text-xs text-[#8E827A]">
                      <tr>
                        <th className="px-5 py-3 font-medium">Material</th>
                        <th className="px-5 py-3 font-medium">Planned</th>
                        <th className="px-5 py-3 font-medium">Rate</th>
                        <th className="px-5 py-3 font-medium">Low stock</th>
                        <th className="px-5 py-3 font-medium">Wastage</th>
                        <th className="px-5 py-3 text-right font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8DCD4]">
                      {currentResult.plans.map((plan) => (
                        <tr key={plan.id}>
                          <td className="px-5 py-3.5 text-sm text-[#323232]">{plan.material.name}</td>
                          <td className="px-5 py-3.5 text-sm text-[#595552]">{formatNumber(plan.plannedQuantity, 2)} {plan.material.unit}</td>
                          <td className="px-5 py-3.5 text-sm text-[#595552]">{plan.plannedUnitRate === null ? '—' : formatBudget(plan.plannedUnitRate)}</td>
                          <td className="px-5 py-3.5 text-sm text-[#595552]">{formatNumber(plan.lowStockThreshold, 2)} {plan.material.unit}</td>
                          <td className="px-5 py-3.5 text-sm text-[#595552]">{plan.wastageThresholdPct === null ? '—' : `${plan.wastageThresholdPct}%`}</td>
                          <td className="px-5 py-3.5 text-right">
                            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${planStatusStyles[plan.status]}`}>{plan.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="p-5 text-sm text-[#8E827A]">No material plans have been prepared for this project yet.</p>
              )}
            </section>
          </>
        ) : null}
      </div>
    </AppShell>
  )
}
