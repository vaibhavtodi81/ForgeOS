import {
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  ClipboardList,
  MapPin,
  Plus,
  ShieldAlert,
  Users,
  Wrench,
} from 'lucide-react'
import { useMemo } from 'react'
import { AppShell } from '../components/AppShell'
import { DashboardCard, ProgressBar, SectionTitle, StatusPill } from '../components/dashboard-ui'
import { latestProjectActivity } from '../data/dashboardApi'
import { useDashboardData } from '../hooks/useDashboardData'
import { useAuth } from '../../authentication/auth/useAuth'
import { useProjects } from '../../projects/useProjects'
import type { Project } from '../../projects/projects-context'

const statusLabels: Record<Project['status'], string> = {
  PLANNING: 'Planning',
  ACTIVE: 'Active',
  ON_HOLD: 'On hold',
  COMPLETED: 'Completed',
}

function formatDate(value: string | null) {
  if (!value) return 'Not specified'
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(value))
}

export function ProjectManagerDashboardPage() {
  const { user } = useAuth()
  const { selectedProject, isLoading: projectsLoading, error: projectsError, retry: retryProjects } = useProjects()
  const selectedProjects = useMemo(() => selectedProject ? [selectedProject] : [], [selectedProject])
  const { projects: dashboardProjects, isLoading, error, retry } = useDashboardData(selectedProjects)
  const dashboardProject = dashboardProjects[0]
  const project = selectedProject
  const progressHistory = dashboardProject?.progressHistory ?? []
  const latestProgress = dashboardProject?.summary.totalDailyLogs
    ? Number(dashboardProject.summary.latestProgressPercent)
    : null
  const previousProgress = progressHistory.length > 1
    ? Number(progressHistory[progressHistory.length - 2].progressPercent)
    : null
  const progressChange = latestProgress !== null && previousProgress !== null
    ? latestProgress - previousProgress
    : null
  const activity = dashboardProject ? latestProjectActivity([dashboardProject]).slice(0, 8) : []
  const loading = projectsLoading || isLoading
  const loadError = projectsError ?? error
  const retryLoad = projectsError ? retryProjects : retry
  const projectRoute = (suffix: string) => project ? `/projects/${project.id}${suffix}` : '/app/projects'
  const open = (path: string) => { window.location.href = path }

  return (
    <AppShell currentPath="/app/pm/dashboard">
      <div className="mx-auto max-w-[1680px] space-y-7 p-5 sm:p-7 lg:p-8">
        <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--dashboard-amber)]">Site operations</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[var(--dashboard-ink)] sm:text-5xl">Good morning, <span className="text-white/45">{user?.name ?? 'Project Manager'}.</span></h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--dashboard-muted)]">Your assigned project and the site activity recorded for it.</p>
          </div>
          <button type="button" onClick={() => open(projectRoute('/logs/new'))} className="dashboard-button dashboard-button-primary" disabled={!project}><Plus size={16} /> Add daily site log</button>
        </section>

        {loadError ? (
          <DashboardCard className="p-6">
            <p role="alert" className="text-sm text-rose-300">{loadError}</p>
            <button type="button" onClick={retryLoad} className="mt-3 text-sm font-semibold text-[var(--dashboard-amber)]">Retry</button>
          </DashboardCard>
        ) : loading ? (
          <DashboardCard className="p-6" aria-live="polite"><p className="text-sm text-[var(--dashboard-muted)]">Loading assigned project data…</p></DashboardCard>
        ) : !project ? (
          <DashboardCard className="p-10 text-center"><h2 className="text-lg font-semibold text-[var(--dashboard-ink)]">No assigned project</h2><p className="mt-2 text-sm text-[var(--dashboard-muted)]">A project assigned to your account will appear here.</p></DashboardCard>
        ) : dashboardProject ? (
          <>
            <section className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
              <DashboardCard tone="featured" className="p-5 sm:p-6">
                <div className="flex flex-col justify-between gap-8">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--dashboard-amber)]">Assigned project · {project.code}</p>
                      <StatusPill tone={project.status === 'ACTIVE' ? 'green' : 'amber'}>{statusLabels[project.status]}</StatusPill>
                    </div>
                    <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[var(--dashboard-ink)]">{project.name}</h2>
                    <p className="mt-2 flex items-center gap-1.5 text-sm text-[var(--dashboard-muted)]"><MapPin size={15} />{project.location}</p>
                  </div>
                  <div>
                    <div className="flex items-end justify-between gap-4">
                      <div><p className="text-5xl font-semibold tracking-[-0.06em] text-[var(--dashboard-ink)]">{latestProgress === null ? '—' : `${latestProgress}%`}</p><p className="mt-1 text-xs text-[var(--dashboard-muted)]">{latestProgress === null ? 'No progress log recorded' : 'Latest daily-log progress'}</p></div>
                      {progressChange !== null && <div className="text-right"><p className="text-xl font-semibold text-[var(--dashboard-ink)]">{progressChange > 0 ? '+' : ''}{progressChange}%</p><p className="text-[10px] text-[var(--dashboard-muted)]">change since previous log</p></div>}
                    </div>
                    {latestProgress !== null && <div className="mt-4"><ProgressBar value={latestProgress} /></div>}
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/10 pt-5 sm:grid-cols-4">
                  <div><p className="dashboard-eyebrow">Project started</p><p className="mt-1 text-sm font-semibold text-[var(--dashboard-ink)]">{formatDate(project.startDate)}</p></div>
                  <div><p className="dashboard-eyebrow">Expected completion</p><p className="mt-1 text-sm font-semibold text-[var(--dashboard-ink)]">{formatDate(project.expectedEndDate)}</p></div>
                  <div><p className="dashboard-eyebrow">Daily logs</p><p className="mt-1 text-sm font-semibold text-[var(--dashboard-ink)]">{dashboardProject.summary.totalDailyLogs}</p></div>
                  <div><p className="dashboard-eyebrow">Latest log</p><p className="mt-1 text-sm font-semibold text-[var(--dashboard-ink)]">{formatDate(dashboardProject.summary.latestLogDate)}</p></div>
                </div>
              </DashboardCard>

              <DashboardCard className="p-5 sm:p-6">
                <SectionTitle title="Recorded site totals" description="Totals returned by the project summary API." />
                <div className="mt-5 space-y-4">
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4"><div className="flex items-center gap-3"><span className="dashboard-icon dashboard-icon-green"><Users size={17} /></span><span className="text-sm text-[var(--dashboard-muted)]">Labour headcount total</span></div><strong className="text-lg text-[var(--dashboard-ink)]">{dashboardProject.summary.totalLabourHeadCount}</strong></div>
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4"><div className="flex items-center gap-3"><span className="dashboard-icon dashboard-icon-amber"><CalendarDays size={17} /></span><span className="text-sm text-[var(--dashboard-muted)]">Labour hours</span></div><strong className="text-lg text-[var(--dashboard-ink)]">{dashboardProject.summary.totalLabourHours}</strong></div>
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4"><div className="flex items-center gap-3"><span className="dashboard-icon dashboard-icon-violet"><Wrench size={17} /></span><span className="text-sm text-[var(--dashboard-muted)]">Machinery hours</span></div><strong className="text-lg text-[var(--dashboard-ink)]">{dashboardProject.summary.totalMachineryHours}</strong></div>
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4"><div className="flex items-center gap-3"><span className="dashboard-icon dashboard-icon-amber"><ShieldAlert size={17} /></span><span className="text-sm text-[var(--dashboard-muted)]">Machinery fuel</span></div><strong className="text-lg text-[var(--dashboard-ink)]">{dashboardProject.summary.totalMachineryFuel}</strong></div>
                </div>
              </DashboardCard>
            </section>

            <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <DashboardCard className="p-5 sm:p-6">
                <SectionTitle title="Progress history" description="Daily-log progress records for the selected project." action={<button type="button" onClick={() => open(projectRoute('/progress'))} className="text-xs font-semibold text-[var(--dashboard-amber)]">View history <ArrowUpRight size={13} className="inline" /></button>} />
                {progressHistory.length ? <div className="mt-4 divide-y divide-white/[0.08]">{[...progressHistory].reverse().slice(0, 8).map((entry) => <div key={entry.id} className="py-3 first:pt-0 last:pb-0"><div className="flex items-center justify-between gap-3"><p className="text-sm font-medium text-[var(--dashboard-ink)]">{formatDate(entry.logDate)}</p><StatusPill tone="green">{Number(entry.progressPercent)}%</StatusPill></div><p className="mt-1 text-xs text-[var(--dashboard-muted)]">{entry.workSummary || 'No work summary recorded.'}</p></div>)}</div> : <p className="mt-4 text-sm text-[var(--dashboard-muted)]">No progress history has been recorded.</p>}
              </DashboardCard>

              <DashboardCard className="p-5 sm:p-6">
                <SectionTitle title="Project activity" description="Audit activity returned for the selected project." />
                {activity.length ? <div className="mt-4 divide-y divide-white/[0.08]">{activity.map((item) => <div key={item.id} className="py-3 first:pt-0 last:pb-0"><p className="text-sm font-medium text-[var(--dashboard-ink)]">{item.action} · {item.entityType}</p><p className="mt-1 text-xs text-[var(--dashboard-muted)]">{item.userName ?? 'User not available'}</p><p className="mt-1 text-[10px] text-[var(--dashboard-subtle)]">{formatDate(item.createdAt)}</p></div>)}</div> : <p className="mt-4 text-sm text-[var(--dashboard-muted)]">No project activity has been recorded.</p>}
              </DashboardCard>
            </section>

            <section className="grid gap-4 sm:grid-cols-2">
              <DashboardCard className="flex items-center justify-between gap-4 p-5"><div><p className="font-semibold text-[var(--dashboard-ink)]">Labour and machinery reports</p><p className="mt-1 text-xs text-[var(--dashboard-muted)]">Open the project reporting views.</p></div><button type="button" onClick={() => open(projectRoute('/progress'))} className="text-xs font-semibold text-[var(--dashboard-amber)]">View reports <ArrowUpRight size={13} className="inline" /></button></DashboardCard>
              <DashboardCard className="flex items-center justify-between gap-4 p-5"><div><p className="font-semibold text-[var(--dashboard-ink)]">Construction milestones</p><p className="mt-1 text-xs text-[var(--dashboard-muted)]">View and manage milestones for this project.</p></div><button type="button" onClick={() => open(projectRoute('/progress'))} className="text-xs font-semibold text-[var(--dashboard-amber)]">Manage milestones <ArrowUpRight size={13} className="inline" /></button></DashboardCard>
            </section>

            <section><div className="mb-4"><p className="dashboard-eyebrow">Site shortcuts</p><h2 className="mt-1 text-xl font-semibold text-[var(--dashboard-ink)]">Coordinate the next move</h2></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{[['Add daily log', Plus, projectRoute('/logs/new')], ['View daily logs', ClipboardList, projectRoute('/logs')], ['Update progress', BarChart3, projectRoute('/progress')]].map(([label, Icon, path]) => <button type="button" key={label as string} onClick={() => open(path as string)} className="dashboard-card group p-4 text-left transition hover:-translate-y-0.5 hover:border-[#F2A65A]/40"><div className="flex items-center justify-between"><span className="dashboard-icon dashboard-icon-amber"><Icon size={17} /></span><ArrowUpRight size={15} className="text-[var(--dashboard-subtle)] transition group-hover:text-[var(--dashboard-amber)]" /></div><p className="mt-4 text-sm font-medium text-[var(--dashboard-ink)]">{label as string}</p></button>)}</div></section>
          </>
        ) : null}
      </div>
    </AppShell>
  )
}
