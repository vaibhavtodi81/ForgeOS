// Continues the component or data expression so its related values and behavior stay grouped together.
import {
  // Continues the component or data expression so its related values and behavior stay grouped together.
  ArrowUpRight,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  BarChart3,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  CalendarDays,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  ClipboardList,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  MapPin,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  Plus,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  ShieldAlert,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  Users,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  Wrench,
// Continues the component or data expression so its related values and behavior stay grouped together.
} from 'lucide-react'
// Imports useMemo from react so this module can reuse that component, helper, or library.
import { useMemo } from 'react'
// Imports AppShell from ../components/AppShell so this module can reuse that component, helper, or library.
import { AppShell } from '../components/AppShell'
// Imports DashboardCard, ProgressBar, SectionTitle, StatusPill from ../components/dashboard-ui so this module can reuse that component, helper, or library.
import { DashboardCard, ProgressBar, SectionTitle, StatusPill } from '../components/dashboard-ui'
// Imports latestProjectActivity from ../data/dashboardApi so this module can reuse that component, helper, or library.
import { latestProjectActivity } from '../data/dashboardApi'
// Imports useDashboardData from ../hooks/useDashboardData so this module can reuse that component, helper, or library.
import { useDashboardData } from '../hooks/useDashboardData'
// Imports useAuth from ../../authentication/auth/useAuth so this module can reuse that component, helper, or library.
import { useAuth } from '../../authentication/auth/useAuth'
// Imports useProjects from ../../projects/useProjects so this module can reuse that component, helper, or library.
import { useProjects } from '../../projects/useProjects'
// Imports type  Project from ../../projects/projects-context so this module can reuse that component, helper, or library.
import type { Project } from '../../projects/projects-context'

// Stores the value in statusLabels so later lines can reuse this data or behavior for the current feature.
const statusLabels: Record<Project['status'], string> = {
  // Sets the PLANNING field so the surrounding object or component receives this setting.
  PLANNING: 'Planning',
  // Sets the ACTIVE field so the surrounding object or component receives this setting.
  ACTIVE: 'Active',
  // Sets the ON_HOLD field so the surrounding object or component receives this setting.
  ON_HOLD: 'On hold',
  // Sets the COMPLETED field so the surrounding object or component receives this setting.
  COMPLETED: 'Completed',
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines formatDate so this module can perform its named task when needed.
function formatDate(value: string | null) {
  // Checks this condition before continuing so the code can choose the correct path for the current state.
  if (!value) return 'Not specified'
  // Returns the result so the caller or React receives the value or interface this function provides.
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(value))
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines ProjectManagerDashboardPage so this module can perform its named task when needed.
export function ProjectManagerDashboardPage() {
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const { user } = useAuth()
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const { selectedProject, isLoading: projectsLoading, error: projectsError, retry: retryProjects } = useProjects()
  // Caches selectedProjects so its calculation is repeated only when its inputs change.
  // Caches selectedProjects so its calculation is repeated only when its inputs change.
  const selectedProjects = useMemo(() => selectedProject ? [selectedProject] : [], [selectedProject])
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const { projects: dashboardProjects, isLoading, error, retry } = useDashboardData(selectedProjects)
  // Stores the value in dashboardProject so later lines can reuse this data or behavior for the current feature.
  const dashboardProject = dashboardProjects[0]
  // Stores the value in project so later lines can reuse this data or behavior for the current feature.
  const project = selectedProject
  // Stores the value in progressHistory so later lines can reuse this data or behavior for the current feature.
  const progressHistory = dashboardProject?.progressHistory ?? []
  // Stores the value in latestProgress so later lines can reuse this data or behavior for the current feature.
  const latestProgress = dashboardProject?.summary.totalDailyLogs
    // Continues the component or data expression so its related values and behavior stay grouped together.
    ? Number(dashboardProject.summary.latestProgressPercent)
    // Continues the component or data expression so its related values and behavior stay grouped together.
    : null
  // Stores the value in previousProgress so later lines can reuse this data or behavior for the current feature.
  const previousProgress = progressHistory.length > 1
    // Continues the component or data expression so its related values and behavior stay grouped together.
    ? Number(progressHistory[progressHistory.length - 2].progressPercent)
    // Continues the component or data expression so its related values and behavior stay grouped together.
    : null
  // Stores the value in progressChange so later lines can reuse this data or behavior for the current feature.
  const progressChange = latestProgress !== null && previousProgress !== null
    // Continues the component or data expression so its related values and behavior stay grouped together.
    ? latestProgress - previousProgress
    // Continues the component or data expression so its related values and behavior stay grouped together.
    : null
  // Stores the value in activity so later lines can reuse this data or behavior for the current feature.
  const activity = dashboardProject ? latestProjectActivity([dashboardProject]).slice(0, 8) : []
  // Stores the value in loading so later lines can reuse this data or behavior for the current feature.
  const loading = projectsLoading || isLoading
  // Stores the value in loadError so later lines can reuse this data or behavior for the current feature.
  const loadError = projectsError ?? error
  // Stores the value in retryLoad so later lines can reuse this data or behavior for the current feature.
  const retryLoad = projectsError ? retryProjects : retry
  // Stores the value in projectRoute so later lines can reuse this data or behavior for the current feature.
  const projectRoute = (suffix: string) => project ? `/projects/${project.id}${suffix}` : '/app/projects'
  // Stores the value in open so later lines can reuse this data or behavior for the current feature.
  const open = (path: string) => { window.location.href = path }

  // Returns the result so the caller or React receives the value or interface this function provides.
  return (
    // Continues the component or data expression so its related values and behavior stay grouped together.
    <AppShell currentPath="/app/pm/dashboard">
      {/* Starts the <div> element to organize this part of the interface. */}
      <div className="mx-auto max-w-[1680px] space-y-7 p-5 sm:p-7 lg:p-8">
        {/* Starts the <section> element to group related content into a meaningful region. */}
        <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          {/* Starts the <div> element to organize this part of the interface. */}
          <div>
            {/* Starts the <p> element to organize this part of the interface. */}
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--dashboard-amber)]">Site operations</p>
            {/* Starts the <h1> element to organize this part of the interface. */}
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[var(--dashboard-ink)] sm:text-5xl">Good morning, <span className="text-white/45">{user?.name ?? 'Project Manager'}.</span></h1>
            {/* Starts the <p> element to organize this part of the interface. */}
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--dashboard-muted)]">Your assigned project and the site activity recorded for it.</p>
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>
          {/* Starts the <button> element to provide an action the user can activate. */}
          <button type="button" onClick={() => open(projectRoute('/logs/new'))} className="dashboard-button dashboard-button-primary" disabled={!project}><Plus size={16} /> Add daily site log</button>
        {/* Closes the <section> element so later content is no longer part of this region. */}
        </section>

        {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
        {loadError ? (
          // Continues the component or data expression so its related values and behavior stay grouped together.
          <DashboardCard className="p-6">
            {/* Starts the <p> element to organize this part of the interface. */}
            <p role="alert" className="text-sm text-rose-300">{loadError}</p>
            {/* Starts the <button> element to provide an action the user can activate. */}
            <button type="button" onClick={retryLoad} className="mt-3 text-sm font-semibold text-[var(--dashboard-amber)]">Retry</button>
          {/* Closes the <DashboardCard> element so later content is no longer part of this region. */}
          </DashboardCard>
        // Continues the component or data expression so its related values and behavior stay grouped together.
        ) : loading ? (
          // Continues the component or data expression so its related values and behavior stay grouped together.
          <DashboardCard className="p-6" aria-live="polite"><p className="text-sm text-[var(--dashboard-muted)]">Loading assigned project data…</p></DashboardCard>
        // Continues the component or data expression so its related values and behavior stay grouped together.
        ) : !project ? (
          // Continues the component or data expression so its related values and behavior stay grouped together.
          <DashboardCard className="p-10 text-center"><h2 className="text-lg font-semibold text-[var(--dashboard-ink)]">No assigned project</h2><p className="mt-2 text-sm text-[var(--dashboard-muted)]">A project assigned to your account will appear here.</p></DashboardCard>
        // Continues the component or data expression so its related values and behavior stay grouped together.
        ) : dashboardProject ? (
          // Continues the component or data expression so its related values and behavior stay grouped together.
          <>
            {/* Starts the <section> element to group related content into a meaningful region. */}
            <section className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
              {/* Starts the <DashboardCard> element to organize this part of the interface. */}
              <DashboardCard tone="featured" className="p-5 sm:p-6">
                {/* Starts the <div> element to organize this part of the interface. */}
                <div className="flex flex-col justify-between gap-8">
                  {/* Starts the <div> element to organize this part of the interface. */}
                  <div>
                    {/* Starts the <div> element to organize this part of the interface. */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Starts the <p> element to organize this part of the interface. */}
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--dashboard-amber)]">Assigned project · {project.code}</p>
                      {/* Starts the <StatusPill> element to organize this part of the interface. */}
                      <StatusPill tone={project.status === 'ACTIVE' ? 'green' : 'amber'}>{statusLabels[project.status]}</StatusPill>
                    {/* Closes the <div> element so later content is no longer part of this region. */}
                    </div>
                    {/* Starts the <h2> element to organize this part of the interface. */}
                    <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[var(--dashboard-ink)]">{project.name}</h2>
                    {/* Starts the <p> element to organize this part of the interface. */}
                    <p className="mt-2 flex items-center gap-1.5 text-sm text-[var(--dashboard-muted)]"><MapPin size={15} />{project.location}</p>
                  {/* Closes the <div> element so later content is no longer part of this region. */}
                  </div>
                  {/* Starts the <div> element to organize this part of the interface. */}
                  <div>
                    {/* Starts the <div> element to organize this part of the interface. */}
                    <div className="flex items-end justify-between gap-4">
                      {/* Starts the <div> element to organize this part of the interface. */}
                      <div><p className="text-5xl font-semibold tracking-[-0.06em] text-[var(--dashboard-ink)]">{latestProgress === null ? '—' : `${latestProgress}%`}</p><p className="mt-1 text-xs text-[var(--dashboard-muted)]">{latestProgress === null ? 'No progress log recorded' : 'Latest daily-log progress'}</p></div>
                      {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                      {progressChange !== null && <div className="text-right"><p className="text-xl font-semibold text-[var(--dashboard-ink)]">{progressChange > 0 ? '+' : ''}{progressChange}%</p><p className="text-[10px] text-[var(--dashboard-muted)]">change since previous log</p></div>}
                    {/* Closes the <div> element so later content is no longer part of this region. */}
                    </div>
                    {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                    {latestProgress !== null && <div className="mt-4"><ProgressBar value={latestProgress} /></div>}
                  {/* Closes the <div> element so later content is no longer part of this region. */}
                  </div>
                {/* Closes the <div> element so later content is no longer part of this region. */}
                </div>
                {/* Starts the <div> element to organize this part of the interface. */}
                <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/10 pt-5 sm:grid-cols-4">
                  {/* Starts the <div> element to organize this part of the interface. */}
                  <div><p className="dashboard-eyebrow">Project started</p><p className="mt-1 text-sm font-semibold text-[var(--dashboard-ink)]">{formatDate(project.startDate)}</p></div>
                  {/* Starts the <div> element to organize this part of the interface. */}
                  <div><p className="dashboard-eyebrow">Expected completion</p><p className="mt-1 text-sm font-semibold text-[var(--dashboard-ink)]">{formatDate(project.expectedEndDate)}</p></div>
                  {/* Starts the <div> element to organize this part of the interface. */}
                  <div><p className="dashboard-eyebrow">Daily logs</p><p className="mt-1 text-sm font-semibold text-[var(--dashboard-ink)]">{dashboardProject.summary.totalDailyLogs}</p></div>
                  {/* Starts the <div> element to organize this part of the interface. */}
                  <div><p className="dashboard-eyebrow">Latest log</p><p className="mt-1 text-sm font-semibold text-[var(--dashboard-ink)]">{formatDate(dashboardProject.summary.latestLogDate)}</p></div>
                {/* Closes the <div> element so later content is no longer part of this region. */}
                </div>
              {/* Closes the <DashboardCard> element so later content is no longer part of this region. */}
              </DashboardCard>

              {/* Starts the <DashboardCard> element to organize this part of the interface. */}
              <DashboardCard className="p-5 sm:p-6">
                {/* Starts the <SectionTitle> element to organize this part of the interface. */}
                <SectionTitle title="Recorded site totals" description="Totals returned by the project summary API." />
                {/* Starts the <div> element to organize this part of the interface. */}
                <div className="mt-5 space-y-4">
                  {/* Starts the <div> element to organize this part of the interface. */}
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4"><div className="flex items-center gap-3"><span className="dashboard-icon dashboard-icon-green"><Users size={17} /></span><span className="text-sm text-[var(--dashboard-muted)]">Labour headcount total</span></div><strong className="text-lg text-[var(--dashboard-ink)]">{dashboardProject.summary.totalLabourHeadCount}</strong></div>
                  {/* Starts the <div> element to organize this part of the interface. */}
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4"><div className="flex items-center gap-3"><span className="dashboard-icon dashboard-icon-amber"><CalendarDays size={17} /></span><span className="text-sm text-[var(--dashboard-muted)]">Labour hours</span></div><strong className="text-lg text-[var(--dashboard-ink)]">{dashboardProject.summary.totalLabourHours}</strong></div>
                  {/* Starts the <div> element to organize this part of the interface. */}
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4"><div className="flex items-center gap-3"><span className="dashboard-icon dashboard-icon-violet"><Wrench size={17} /></span><span className="text-sm text-[var(--dashboard-muted)]">Machinery hours</span></div><strong className="text-lg text-[var(--dashboard-ink)]">{dashboardProject.summary.totalMachineryHours}</strong></div>
                  {/* Starts the <div> element to organize this part of the interface. */}
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4"><div className="flex items-center gap-3"><span className="dashboard-icon dashboard-icon-amber"><ShieldAlert size={17} /></span><span className="text-sm text-[var(--dashboard-muted)]">Machinery fuel</span></div><strong className="text-lg text-[var(--dashboard-ink)]">{dashboardProject.summary.totalMachineryFuel}</strong></div>
                {/* Closes the <div> element so later content is no longer part of this region. */}
                </div>
              {/* Closes the <DashboardCard> element so later content is no longer part of this region. */}
              </DashboardCard>
            {/* Closes the <section> element so later content is no longer part of this region. */}
            </section>

            {/* Starts the <section> element to group related content into a meaningful region. */}
            <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {/* Starts the <DashboardCard> element to organize this part of the interface. */}
              <DashboardCard className="p-5 sm:p-6">
                {/* Starts the <SectionTitle> element to organize this part of the interface. */}
                <SectionTitle title="Progress history" description="Daily-log progress records for the selected project." action={<button type="button" onClick={() => open(projectRoute('/progress'))} className="text-xs font-semibold text-[var(--dashboard-amber)]">View history <ArrowUpRight size={13} className="inline" /></button>} />
                {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                {progressHistory.length ? <div className="mt-4 divide-y divide-white/[0.08]">{[...progressHistory].reverse().slice(0, 8).map((entry) => <div key={entry.id} className="py-3 first:pt-0 last:pb-0"><div className="flex items-center justify-between gap-3"><p className="text-sm font-medium text-[var(--dashboard-ink)]">{formatDate(entry.logDate)}</p><StatusPill tone="green">{Number(entry.progressPercent)}%</StatusPill></div><p className="mt-1 text-xs text-[var(--dashboard-muted)]">{entry.workSummary || 'No work summary recorded.'}</p></div>)}</div> : <p className="mt-4 text-sm text-[var(--dashboard-muted)]">No progress history has been recorded.</p>}
              {/* Closes the <DashboardCard> element so later content is no longer part of this region. */}
              </DashboardCard>

              {/* Starts the <DashboardCard> element to organize this part of the interface. */}
              <DashboardCard className="p-5 sm:p-6">
                {/* Starts the <SectionTitle> element to organize this part of the interface. */}
                <SectionTitle title="Project activity" description="Audit activity returned for the selected project." />
                {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                {activity.length ? <div className="mt-4 divide-y divide-white/[0.08]">{activity.map((item) => <div key={item.id} className="py-3 first:pt-0 last:pb-0"><p className="text-sm font-medium text-[var(--dashboard-ink)]">{item.action} · {item.entityType}</p><p className="mt-1 text-xs text-[var(--dashboard-muted)]">{item.userName ?? 'User not available'}</p><p className="mt-1 text-[10px] text-[var(--dashboard-subtle)]">{formatDate(item.createdAt)}</p></div>)}</div> : <p className="mt-4 text-sm text-[var(--dashboard-muted)]">No project activity has been recorded.</p>}
              {/* Closes the <DashboardCard> element so later content is no longer part of this region. */}
              </DashboardCard>
            {/* Closes the <section> element so later content is no longer part of this region. */}
            </section>

            {/* Starts the <section> element to group related content into a meaningful region. */}
            <section className="grid gap-4 sm:grid-cols-2">
              {/* Starts the <DashboardCard> element to organize this part of the interface. */}
              <DashboardCard className="flex items-center justify-between gap-4 p-5"><div><p className="font-semibold text-[var(--dashboard-ink)]">Labour and machinery reports</p><p className="mt-1 text-xs text-[var(--dashboard-muted)]">Open the project reporting views.</p></div><button type="button" onClick={() => open(projectRoute('/progress'))} className="text-xs font-semibold text-[var(--dashboard-amber)]">View reports <ArrowUpRight size={13} className="inline" /></button></DashboardCard>
              {/* Starts the <DashboardCard> element to organize this part of the interface. */}
              <DashboardCard className="flex items-center justify-between gap-4 p-5"><div><p className="font-semibold text-[var(--dashboard-ink)]">Construction milestones</p><p className="mt-1 text-xs text-[var(--dashboard-muted)]">View and manage milestones for this project.</p></div><button type="button" onClick={() => open(projectRoute('/progress'))} className="text-xs font-semibold text-[var(--dashboard-amber)]">Manage milestones <ArrowUpRight size={13} className="inline" /></button></DashboardCard>
            {/* Closes the <section> element so later content is no longer part of this region. */}
            </section>

            {/* Starts the <section> element to group related content into a meaningful region. */}
            <section><div className="mb-4"><p className="dashboard-eyebrow">Site shortcuts</p><h2 className="mt-1 text-xl font-semibold text-[var(--dashboard-ink)]">Coordinate the next move</h2></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{[['Add daily log', Plus, projectRoute('/logs/new')], ['View daily logs', ClipboardList, projectRoute('/logs')], ['Update progress', BarChart3, projectRoute('/progress')]].map(([label, Icon, path]) => <button type="button" key={label as string} onClick={() => open(path as string)} className="dashboard-card group p-4 text-left transition hover:-translate-y-0.5 hover:border-[#F2A65A]/40"><div className="flex items-center justify-between"><span className="dashboard-icon dashboard-icon-amber"><Icon size={17} /></span><ArrowUpRight size={15} className="text-[var(--dashboard-subtle)] transition group-hover:text-[var(--dashboard-amber)]" /></div><p className="mt-4 text-sm font-medium text-[var(--dashboard-ink)]">{label as string}</p></button>)}</div></section>
          {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
          </>
        ) : null}
      {/* Closes the <div> element so later content is no longer part of this region. */}
      </div>
    {/* Closes the <AppShell> element so later content is no longer part of this region. */}
    </AppShell>
  // Closes this function call or grouped expression so the surrounding code can continue.
  )
// Closes the current block or object so the grouped statements or settings end here.
}
// File purpose: Renders the app shell screen and coordinates its page-level interactions.
