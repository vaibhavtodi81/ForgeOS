import {
  ArrowUpRight,
  BarChart3,
  Clock3,
  FolderKanban,
  LayoutGrid,
  List,
  MapPin,
  Plus,
  Search,
  UsersRound,
  WalletCards,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { AppShell } from '../components/AppShell'
import { DashboardCard, ProgressBar, SectionTitle, StatCard, StatusPill } from '../components/dashboard-ui'
import { latestProjectActivity } from '../data/dashboardApi'
import { useDashboardData } from '../hooks/useDashboardData'
import { useProjects } from '../../projects/useProjects'
import type { Project } from '../../projects/projects-context'

type ProjectStatus = Project['status'] | 'All'

const statusLabels: Record<Project['status'], string> = {
  PLANNING: 'Planning',
  ACTIVE: 'Active',
  ON_HOLD: 'On hold',
  COMPLETED: 'Completed',
}

const statusTones: Record<Project['status'], 'amber' | 'green' | 'red' | 'violet'> = {
  PLANNING: 'violet',
  ACTIVE: 'green',
  ON_HOLD: 'amber',
  COMPLETED: 'green',
}

function formatDate(value: string | null) {
  if (!value) return 'Not specified'
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(value))
}

function formatBudget(value: string | number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value))
}

function ProjectCard({ project, progress, compact = false }: {
  project: Project
  progress: number | null
  compact?: boolean
}) {
  return (
    <DashboardCard className={compact ? 'flex gap-4 p-4' : 'p-4'}>
      {!compact && (
        <div className="relative mb-4 h-32 overflow-hidden rounded-xl border border-white/10 bg-[#151a1d]">
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.25) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.25) 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
          <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/70 to-transparent p-4">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">{project.code}</span>
            <FolderKanban size={17} className="text-[var(--dashboard-amber)]" />
          </div>
        </div>
      )}
      <div className={compact ? 'min-w-0 flex-1' : ''}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-[var(--dashboard-ink)]">{project.name}</h3>
            <p className="mt-1 flex items-center gap-1 text-xs text-[var(--dashboard-muted)]"><MapPin size={12} />{project.location}</p>
          </div>
          <StatusPill tone={statusTones[project.status]}>{statusLabels[project.status]}</StatusPill>
        </div>
        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-2xl font-semibold tracking-[-0.04em] text-[var(--dashboard-ink)]">{progress === null ? '—' : `${progress}%`}</p>
            <p className="text-[10px] text-[var(--dashboard-muted)]">{progress === null ? 'No progress log recorded' : 'Latest reported progress'}</p>
          </div>
          <button type="button" onClick={() => { window.location.href = `/app/projects/${project.id}` }} className="text-xs font-semibold text-[var(--dashboard-amber)]">
            View project <ArrowUpRight size={13} className="inline" />
          </button>
        </div>
        {progress !== null && <div className="mt-2"><ProgressBar value={progress} /></div>}
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/10 pt-3 text-xs">
          <div><p className="text-[var(--dashboard-subtle)]">Project manager</p><p className="mt-1 font-medium text-[var(--dashboard-ink)]">{project.assignedPm?.name ?? 'Unassigned'}</p></div>
          <div><p className="text-[var(--dashboard-subtle)]">Expected completion</p><p className="mt-1 font-medium text-[var(--dashboard-ink)]">{formatDate(project.expectedEndDate)}</p></div>
        </div>
      </div>
    </DashboardCard>
  )
}

export function AdminDashboardPage() {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<ProjectStatus>('All')
  const [listView, setListView] = useState(false)
  const { projects, isLoading: projectsLoading, error: projectsError, retry: retryProjects } = useProjects()
  const { projects: dashboardProjects, isLoading, error, retry } = useDashboardData(projects)
  const filteredProjects = useMemo(() => dashboardProjects.filter(({ project }) => {
    const matchesQuery = `${project.name} ${project.location} ${project.code} ${project.assignedPm?.name ?? ''}`.toLowerCase().includes(query.toLowerCase())
    return matchesQuery && (filter === 'All' || project.status === filter)
  }), [dashboardProjects, filter, query])
  const activity = useMemo(() => latestProjectActivity(dashboardProjects).slice(0, 8), [dashboardProjects])
  const progressUpdates = useMemo(() => dashboardProjects
    .flatMap(({ project, progressHistory }) => progressHistory.map((entry) => ({ project, entry })))
    .sort((left, right) => new Date(right.entry.logDate).getTime() - new Date(left.entry.logDate).getTime())
    .slice(0, 8), [dashboardProjects])

  const loading = projectsLoading || isLoading
  const loadError = projectsError ?? error
  const retryLoad = projectsError ? retryProjects : retry
  const projectsCount = projects.length
  const activeCount = projects.filter((project) => project.status === 'ACTIVE').length
  const completedCount = projects.filter((project) => project.status === 'COMPLETED').length
  const onHoldCount = projects.filter((project) => project.status === 'ON_HOLD').length
  const projectsWithProgress = dashboardProjects.filter(({ summary }) => summary.totalDailyLogs > 0)
  const averageProgress = projectsWithProgress.length
    ? Math.round(projectsWithProgress.reduce((sum, item) => sum + Number(item.summary.latestProgressPercent), 0) / projectsWithProgress.length)
    : null
  const activeBudget = projects.filter((project) => project.status === 'ACTIVE')
    .reduce((sum, project) => sum + Number(project.totalBudget), 0)

  return (
    <AppShell currentPath="/app/admin/dashboard">
      <div className="mx-auto max-w-[1680px] space-y-7 p-5 sm:p-7 lg:p-8">
        <section className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--dashboard-amber)]">Portfolio overview</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[var(--dashboard-ink)] sm:text-5xl">Your Portfolio, <span className="text-white/45">Under Control.</span></h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--dashboard-muted)]">Projects and recorded site updates available to your account.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => { window.location.href = '/app/projects' }} className="dashboard-button dashboard-button-ghost"><Plus size={16} /> Create project</button>
            <button type="button" onClick={() => { window.location.href = '/app/reports' }} className="dashboard-button dashboard-button-primary"><BarChart3 size={16} /> Open reports</button>
          </div>
        </section>

        {loadError ? (
          <DashboardCard className="p-6" >
            <p role="alert" className="text-sm text-rose-300">{loadError}</p>
            <button type="button" onClick={retryLoad} className="mt-3 text-sm font-semibold text-[var(--dashboard-amber)]">Retry</button>
          </DashboardCard>
        ) : loading ? (
          <DashboardCard className="p-6" aria-live="polite"><p className="text-sm text-[var(--dashboard-muted)]">Loading portfolio data…</p></DashboardCard>
        ) : projectsCount === 0 ? (
          <DashboardCard className="p-10 text-center"><h2 className="text-lg font-semibold text-[var(--dashboard-ink)]">No accessible projects</h2><p className="mt-2 text-sm text-[var(--dashboard-muted)]">Projects permitted for your account will appear here.</p></DashboardCard>
        ) : (
          <>
            <section className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr_0.8fr]">
              <DashboardCard tone="featured" className="p-5 sm:p-6">
                <div className="flex items-start justify-between">
                  <div><p className="dashboard-eyebrow">Average latest reported progress</p><p className="mt-3 text-5xl font-semibold tracking-[-0.06em] text-[var(--dashboard-ink)]">{averageProgress === null ? '—' : `${averageProgress}%`}</p><p className="mt-2 text-xs text-[var(--dashboard-muted)]">{projectsWithProgress.length} of {projectsCount} projects have progress logs</p></div>
                  <span className="dashboard-icon dashboard-icon-amber"><BarChart3 size={19} /></span>
                </div>
                {averageProgress !== null && <div className="mt-6"><ProgressBar value={averageProgress} /><div className="mt-2 text-[10px] text-[var(--dashboard-muted)]">Unweighted mean of each project’s latest daily-log progress</div></div>}
              </DashboardCard>
              <DashboardCard className="p-5 sm:p-6"><p className="dashboard-eyebrow">Active project budget</p><p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[var(--dashboard-ink)]">{formatBudget(activeBudget)}</p><div className="mt-5 flex items-center gap-2 text-xs text-[var(--dashboard-muted)]"><WalletCards size={14} className="text-[var(--dashboard-amber)]" /> {activeCount} active {activeCount === 1 ? 'project' : 'projects'}</div></DashboardCard>
              <DashboardCard className="p-5 sm:p-6"><p className="dashboard-eyebrow">Projects on hold</p><p className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[var(--dashboard-ink)]">{onHoldCount}</p><p className="mt-2 text-xs text-[var(--dashboard-muted)]">Based on backend project status</p></DashboardCard>
            </section>

            <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard label="Total projects" value={String(projectsCount)} note="Accessible project records" icon={FolderKanban} />
              <StatCard label="Active" value={String(activeCount)} note="Backend status: active" icon={UsersRound} accent="green" />
              <StatCard label="Completed" value={String(completedCount)} note="Backend status: completed" icon={BarChart3} accent="violet" />
              <StatCard label="Progress logs" value={String(dashboardProjects.reduce((sum, item) => sum + item.summary.totalDailyLogs, 0))} note="Across accessible projects" icon={Clock3} accent="amber" />
            </section>

            <section>
              <div className="mb-4 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                <div><p className="dashboard-eyebrow">Portfolio workspace</p><h2 className="mt-1 text-xl font-semibold text-[var(--dashboard-ink)]">Projects in motion</h2></div>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--dashboard-subtle)]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects..." className="dashboard-input pl-9" /></label>
                  <select value={filter} onChange={(event) => setFilter(event.target.value as ProjectStatus)} className="dashboard-input">
                    <option value="All">All statuses</option>
                    <option value="PLANNING">Planning</option>
                    <option value="ACTIVE">Active</option>
                    <option value="ON_HOLD">On hold</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                  <button type="button" aria-label="Grid view" onClick={() => setListView(false)} className={`dashboard-view-button ${!listView ? 'dashboard-view-active' : ''}`}><LayoutGrid size={16} /></button>
                  <button type="button" aria-label="List view" onClick={() => setListView(true)} className={`dashboard-view-button ${listView ? 'dashboard-view-active' : ''}`}><List size={16} /></button>
                </div>
              </div>
              {filteredProjects.length
                ? <div className={listView ? 'grid gap-3' : 'grid gap-4 md:grid-cols-2 xl:grid-cols-3'}>{filteredProjects.map(({ project, summary }) => <ProjectCard key={project.id} project={project} progress={summary.totalDailyLogs ? Number(summary.latestProgressPercent) : null} compact={listView} />)}</div>
                : <DashboardCard className="p-10 text-center"><p className="text-sm text-[var(--dashboard-ink)]">{projectsCount ? 'No projects match your filters.' : 'No projects are available.'}</p><button type="button" onClick={() => { setQuery(''); setFilter('All') }} className="mt-3 text-xs text-[var(--dashboard-amber)]">Clear filters</button></DashboardCard>}
            </section>

            <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <DashboardCard className="p-5 sm:p-6">
                <SectionTitle title="Recent progress updates" description="Daily-log history returned by the project progress API." />
                {progressUpdates.length ? <div className="mt-4 divide-y divide-white/[0.08]">{progressUpdates.map(({ project, entry }) => <div key={`${project.id}-${entry.id}`} className="py-3 first:pt-0 last:pb-0"><div className="flex items-center justify-between gap-3"><p className="truncate text-sm font-medium text-[var(--dashboard-ink)]">{project.name}</p><StatusPill tone="green">{Number(entry.progressPercent)}%</StatusPill></div><p className="mt-1 text-xs text-[var(--dashboard-muted)]">{entry.workSummary || 'No work summary recorded.'}</p><p className="mt-1 text-[10px] text-[var(--dashboard-subtle)]">{formatDate(entry.logDate)} · {project.code}</p></div>)}</div> : <p className="mt-4 text-sm text-[var(--dashboard-muted)]">No project progress logs have been recorded.</p>}
              </DashboardCard>
              <DashboardCard className="p-5 sm:p-6">
                <SectionTitle title="Recent activity" description="Audit activity returned for accessible projects." action={<Clock3 size={17} className="text-[var(--dashboard-amber)]" />} />
                {activity.length ? <div className="mt-4 divide-y divide-white/[0.08]">{activity.map((item) => <div className="py-3 first:pt-0 last:pb-0" key={`${item.project.id}-${item.id}`}><p className="text-sm font-medium text-[var(--dashboard-ink)]">{item.action} · {item.entityType}</p><p className="mt-1 text-xs text-[var(--dashboard-muted)]">{item.project.name} · {item.userName ?? 'User not available'}</p><p className="mt-1 text-[10px] text-[var(--dashboard-subtle)]">{formatDate(item.createdAt)}</p></div>)}</div> : <p className="mt-4 text-sm text-[var(--dashboard-muted)]">No project activity has been recorded.</p>}
              </DashboardCard>
            </section>
          </>
        )}

        <section><div className="mb-4"><p className="dashboard-eyebrow">Command shortcuts</p><h2 className="mt-1 text-xl font-semibold text-[var(--dashboard-ink)]">Move work forward</h2></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{[['Create project', Plus, '/app/projects'], ['Manage users', UsersRound, '/app/users'], ['View all projects', FolderKanban, '/app/projects'], ['Open reports', BarChart3, '/app/reports']].map(([label, Icon, path]) => <button type="button" key={label as string} onClick={() => { window.location.href = path as string }} className="dashboard-card group p-4 text-left transition hover:-translate-y-0.5 hover:border-[#F2A65A]/40"><div className="flex items-center justify-between"><span className="dashboard-icon dashboard-icon-amber"><Icon size={17} /></span><ArrowUpRight size={15} className="text-[var(--dashboard-subtle)] transition group-hover:text-[var(--dashboard-amber)]" /></div><p className="mt-4 text-sm font-medium text-[var(--dashboard-ink)]">{label as string}</p></button>)}</div></section>
      </div>
    </AppShell>
  )
}
