'use client'

import { useQuery } from '@tanstack/react-query'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Building2, ClipboardList, Gauge, IndianRupee, Percent } from 'lucide-react'
import type {
  AdminDashboardResponse,
  PmDashboardResponse,
  ProjectStatus,
  SessionUser,
} from '@/lib/forgeos-types'
import { PROJECT_STATUS_LABELS } from '@/lib/forgeos-types'
import { api } from '@/lib/client-api'
import {
  formatDate,
  formatMoney,
  formatMoneyCompact,
  formatPct,
  relativeTime,
} from '@/lib/format'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import {
  EmptyState,
  ErrorState,
  PageHeader,
  SectionCard,
  StatCard,
  StatusBadge,
} from '@/components/forgeos/ui-bits'
import { cn } from '@/lib/utils'

const STATUS_COLORS: Record<ProjectStatus, string> = {
  PLANNING: '#94a3b8',
  ACTIVE: '#10b981',
  ON_HOLD: '#f59e0b',
  COMPLETED: '#a8a29e',
}

type MonthSpend = { month: string; label: string; spend: number }[]

function DashboardSkeleton({ description }: { description: string }) {
  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description={description} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[110px] rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-[300px] rounded-xl" />
        ))}
      </div>
    </div>
  )
}

function SpendAreaChart({ data }: { data: MonthSpend }) {
  if (data.length === 0) {
    return (
      <EmptyState
        title="No spend recorded yet"
        description="Monthly burn will appear here as inventory transactions are logged against projects."
      />
    )
  }
  return (
    <div className="h-[240px]" role="img" aria-label="Monthly site spend">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
          <YAxis
            width={72}
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => formatMoneyCompact(Number(v))}
          />
          <Tooltip formatter={(v) => formatMoney(Number(v))} />
          <Area
            type="monotone"
            dataKey="spend"
            name="Spend"
            stroke="var(--chart-1)"
            strokeWidth={2}
            fill="url(#spendGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function AdminDashboard() {
  const { data, isPending, error, refetch } = useQuery({
    queryKey: ['dashboard', 'admin'],
    queryFn: () => api<AdminDashboardResponse>('/api/dashboard/admin'),
  })

  if (isPending) {
    return (
      <DashboardSkeleton description="Portfolio health across every site — budgets, burn, receivables and wastage." />
    )
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Dashboard"
          description="Portfolio health across every site — budgets, burn, receivables and wastage."
        />
        <SectionCard>
          <ErrorState
            message={error?.message ?? 'Failed to load the dashboard.'}
            onRetry={() => void refetch()}
          />
        </SectionCard>
      </div>
    )
  }

  const { kpis } = data
  const pieData = data.statusBreakdown
    .filter((s) => s.count > 0)
    .map((s) => ({ name: PROJECT_STATUS_LABELS[s.status], value: s.count, status: s.status }))
  const wastagePoints = data.wastageByProject.filter((w) => w.wastagePct !== null)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Portfolio health across every site — budgets, burn, receivables and wastage."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active Projects"
          value={kpis.activeProjects}
          sub={`${kpis.totalProjects} total in portfolio`}
          icon={Building2}
        />
        <StatCard
          label="Budget Utilization"
          value={formatPct(kpis.budgetUtilization)}
          sub={`${formatMoneyCompact(kpis.totalSpend)} of ${formatMoneyCompact(kpis.totalBudget)}`}
          icon={Gauge}
        />
        <StatCard
          label="Receivables"
          value={formatMoneyCompact(kpis.receivables)}
          tone={kpis.receivables > 0 ? 'danger' : 'default'}
          sub={`${kpis.overdueInvoices} overdue invoice${kpis.overdueInvoices === 1 ? '' : 's'}`}
          icon={IndianRupee}
        />
        <StatCard
          label="Avg Wastage"
          value={formatPct(kpis.avgWastagePct)}
          tone={
            kpis.avgWastagePct == null
              ? 'default'
              : kpis.avgWastagePct > 8
                ? 'danger'
                : 'warning'
          }
          sub={`Worst: ${kpis.worstProjectName ?? '—'}`}
          icon={Percent}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard title="Portfolio by status">
          {pieData.length === 0 ? (
            <EmptyState
              title="No projects yet"
              description="Create a project to see the portfolio mix here."
            />
          ) : (
            <div className="h-[240px]" role="img" aria-label="Portfolio by status">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={78}
                    paddingAngle={2}
                  >
                    {pieData.map((d) => (
                      <Cell key={d.status} fill={STATUS_COLORS[d.status]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </SectionCard>

        <SectionCard title="Monthly site spend">
          <SpendAreaChart data={data.spendByMonth} />
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard title="Budget vs spend">
          {data.budgetVsSpend.length === 0 ? (
            <EmptyState
              title="No projects yet"
              description="Budget against actual spend will appear here once projects exist."
            />
          ) : (
            <div className="h-[280px]" role="img" aria-label="Budget versus spend by project">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.budgetVsSpend} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="projectName"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={56}
                  />
                  <YAxis
                    width={72}
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => formatMoneyCompact(Number(v))}
                  />
                  <Tooltip formatter={(v) => formatMoney(Number(v))} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="budget" name="Budget" fill="var(--chart-5)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="spend" name="Spend" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </SectionCard>

        <SectionCard title="Wastage by project">
          {wastagePoints.length === 0 ? (
            <EmptyState
              title="No material plans yet"
              description="Wastage tracking starts once material plans are approved for a project."
            />
          ) : (
            <div className="h-[240px]" role="img" aria-label="Wastage percentage by project">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={wastagePoints}
                  layout="vertical"
                  margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    domain={['auto', 'auto']}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <YAxis
                    type="category"
                    dataKey="projectName"
                    width={110}
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip formatter={(v) => formatPct(Number(v))} />
                  <Bar
                    dataKey="wastagePct"
                    name="Wastage"
                    fill="var(--chart-4)"
                    radius={[0, 4, 4, 0]}
                    maxBarSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard title="Recent activity">
          {data.recentActivity.length === 0 ? (
            <EmptyState
              title="No recent activity"
              description="Actions taken across ForgeOS will appear here."
            />
          ) : (
            <ScrollArea className="max-h-72">
              <ul className="space-y-3 pr-3">
                {data.recentActivity.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <StatusBadge value={a.action} label={a.action.replaceAll('_', ' ')} />
                      <span className="truncate text-sm text-muted-foreground">
                        {a.actorName ?? 'System'}
                      </span>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {relativeTime(a.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          )}
        </SectionCard>

        <SectionCard title="Recent invoices">
          {data.recentInvoices.length === 0 ? (
            <EmptyState
              title="No invoices yet"
              description="Issue invoices from the Billing page to see them here."
            />
          ) : (
            <ul className="max-h-72 space-y-3 overflow-y-auto pr-1">
              {data.recentInvoices.map((inv) => {
                const overdue =
                  inv.balance > 0 && new Date(inv.dueDate).getTime() < Date.now()
                return (
                  <li key={inv.id} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{inv.invoiceNo}</p>
                      <p className="truncate text-xs text-muted-foreground">{inv.projectName}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium tabular-nums">
                        {formatMoney(inv.totalWithGst)}
                      </span>
                      <StatusBadge value={inv.status} />
                      <span
                        className={cn(
                          'whitespace-nowrap text-xs',
                          overdue
                            ? 'font-medium text-red-600 dark:text-red-400'
                            : 'text-muted-foreground',
                        )}
                      >
                        Due {formatDate(inv.dueDate)}
                      </span>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </SectionCard>
      </div>
    </div>
  )
}

function PmDashboard() {
  const { data, isPending, error, refetch } = useQuery({
    queryKey: ['dashboard', 'pm'],
    queryFn: () => api<PmDashboardResponse>('/api/dashboard/pm'),
  })

  if (isPending) {
    return <DashboardSkeleton description="Your sites at a glance — burn, plans and site activity." />
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Dashboard"
          description="Your sites at a glance — burn, plans and site activity."
        />
        <SectionCard>
          <ErrorState
            message={error?.message ?? 'Failed to load the dashboard.'}
            onRetry={() => void refetch()}
          />
        </SectionCard>
      </div>
    )
  }

  const { kpis } = data
  const budgetUtilization =
    kpis.totalBudget > 0 ? (kpis.totalSpend / kpis.totalBudget) * 100 : null

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Your sites at a glance — burn, plans and site activity."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="My Projects"
          value={kpis.myProjects}
          sub={`${kpis.activeProjects} active`}
          icon={Building2}
        />
        <StatCard
          label="Budget Utilization"
          value={formatPct(budgetUtilization)}
          sub={`${formatMoneyCompact(kpis.totalSpend)} of ${formatMoneyCompact(kpis.totalBudget)}`}
          icon={Gauge}
        />
        <StatCard
          label="Draft Plans"
          value={kpis.draftPlans}
          sub="Pending approval"
          tone={kpis.draftPlans > 0 ? 'warning' : 'default'}
          icon={ClipboardList}
        />
        <StatCard label="Avg Wastage" value={formatPct(kpis.avgWastagePct)} icon={Percent} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard title="My projects">
          {data.projects.length === 0 ? (
            <EmptyState
              title="No projects assigned"
              description="Your sites will appear here once an admin assigns them to you."
            />
          ) : (
            <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
              {data.projects.map((p) => (
                <div key={p.id} className="rounded-lg border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.code}</p>
                    </div>
                    <StatusBadge value={p.status} />
                  </div>
                  <div className="mt-3">
                    <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="tabular-nums text-muted-foreground">
                        {formatMoneyCompact(p.spend)} of {formatMoneyCompact(p.budget)}
                      </span>
                      <span
                        className={cn(
                          'tabular-nums',
                          p.wastagePct != null && p.wastagePct > 5
                            ? 'font-medium text-red-600 dark:text-red-400'
                            : 'text-muted-foreground',
                        )}
                      >
                        Wastage {formatPct(p.wastagePct)}
                      </span>
                    </div>
                    <Progress
                      value={p.progressPct ?? 0}
                      max={100}
                      aria-label={`${p.name} progress`}
                    />
                    <div className="mt-1.5 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{Math.round(p.progressPct ?? 0)}% complete</span>
                      <span>Ends {formatDate(p.plannedEndDate)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Monthly spend">
          <SpendAreaChart data={data.spendByMonth} />
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard title="Recent site logs">
          {data.recentLogs.length === 0 ? (
            <EmptyState
              title="No site logs yet"
              description="Daily logs recorded on your sites will appear here."
            />
          ) : (
            <ul className="max-h-72 space-y-3 overflow-y-auto pr-1">
              {data.recentLogs.map((log) => (
                <li key={log.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-medium">{log.projectName}</p>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatDate(log.logDate)}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-xs text-muted-foreground">{log.workDone}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{log.headcount} on site</p>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Upcoming handovers">
          {data.upcomingEndDates.length === 0 ? (
            <EmptyState
              title="No upcoming handovers"
              description="Projects approaching their planned end date will appear here."
            />
          ) : (
            <ul className="space-y-3">
              {data.upcomingEndDates.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(p.plannedEndDate)}
                    </span>
                    <StatusBadge value={p.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </div>
  )
}

export default function DashboardView({ user }: { user: SessionUser }) {
  if (user.role === 'PROJECT_MANAGER') {
    return <PmDashboard />
  }
  return <AdminDashboard />
}
