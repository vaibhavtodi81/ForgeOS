// Continues the component or data expression so its related values and behavior stay grouped together.
import {
  // Continues the component or data expression so its related values and behavior stay grouped together.
  ArrowUpRight,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  BarChart3,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  Clock3,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  FolderKanban,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  LayoutGrid,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  List,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  MapPin,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  Plus,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  Search,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  UsersRound,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  WalletCards,
// Continues the component or data expression so its related values and behavior stay grouped together.
} from 'lucide-react'
// Imports useMemo, useState from react so this module can reuse that component, helper, or library.
import { useMemo, useState } from 'react'
// Imports AppShell from ../components/AppShell so this module can reuse that component, helper, or library.
import { AppShell } from '../components/AppShell'
// Imports DashboardCard, ProgressBar, SectionTitle, StatCard, StatusPill from ../components/dashboard-ui so this module can reuse that component, helper, or library.
import { DashboardCard, ProgressBar, SectionTitle, StatCard, StatusPill } from '../components/dashboard-ui'
// Imports latestProjectActivity from ../data/dashboardApi so this module can reuse that component, helper, or library.
import { latestProjectActivity } from '../data/dashboardApi'
// Imports useDashboardData from ../hooks/useDashboardData so this module can reuse that component, helper, or library.
import { useDashboardData } from '../hooks/useDashboardData'
// Imports useProjects from ../../projects/useProjects so this module can reuse that component, helper, or library.
import { useProjects } from '../../projects/useProjects'
// Imports type  Project from ../../projects/projects-context so this module can reuse that component, helper, or library.
import type { Project } from '../../projects/projects-context'

// Continues the component or data expression so its related values and behavior stay grouped together.
type ProjectStatus = Project['status'] | 'All'

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

// Stores the value in statusTones so later lines can reuse this data or behavior for the current feature.
const statusTones: Record<Project['status'], 'amber' | 'green' | 'red' | 'violet'> = {
  // Sets the PLANNING field so the surrounding object or component receives this setting.
  PLANNING: 'violet',
  // Sets the ACTIVE field so the surrounding object or component receives this setting.
  ACTIVE: 'green',
  // Sets the ON_HOLD field so the surrounding object or component receives this setting.
  ON_HOLD: 'amber',
  // Sets the COMPLETED field so the surrounding object or component receives this setting.
  COMPLETED: 'green',
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

// Defines formatBudget so this module can perform its named task when needed.
function formatBudget(value: string | number) {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return new Intl.NumberFormat('en-IN', {
    // Sets the style field so the surrounding object or component receives this setting.
    style: 'currency',
    // Sets the currency field so the surrounding object or component receives this setting.
    currency: 'INR',
    // Sets the maximumFractionDigits field so the surrounding object or component receives this setting.
    maximumFractionDigits: 0,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  }).format(Number(value))
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines ProjectCard so this module can perform its named task when needed.
function ProjectCard({ project, progress, compact = false }: {
  // Sets the project field so the surrounding object or component receives this setting.
  project: Project
  // Sets the progress field so the surrounding object or component receives this setting.
  progress: number | null
  // Continues the component or data expression so its related values and behavior stay grouped together.
  compact?: boolean
// Continues the component or data expression so its related values and behavior stay grouped together.
}) {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return (
    // Continues the component or data expression so its related values and behavior stay grouped together.
    <DashboardCard className={compact ? 'flex gap-4 p-4' : 'p-4'}>
      {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
      {!compact && (
        // Continues the component or data expression so its related values and behavior stay grouped together.
        <div className="relative mb-4 h-32 overflow-hidden rounded-xl border border-white/10 bg-[#151a1d]">
          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.25) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.25) 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/70 to-transparent p-4">
            {/* Starts the <span> element to organize this part of the interface. */}
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">{project.code}</span>
            {/* Starts the <FolderKanban> element to organize this part of the interface. */}
            <FolderKanban size={17} className="text-[var(--dashboard-amber)]" />
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>
        {/* Closes the <div> element so later content is no longer part of this region. */}
        </div>
      // Continues the component or data expression so its related values and behavior stay grouped together.
      )}
      {/* Starts the <div> element to organize this part of the interface. */}
      <div className={compact ? 'min-w-0 flex-1' : ''}>
        {/* Starts the <div> element to organize this part of the interface. */}
        <div className="flex items-start justify-between gap-3">
          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="min-w-0">
            {/* Starts the <h3> element to organize this part of the interface. */}
            <h3 className="truncate text-sm font-semibold text-[var(--dashboard-ink)]">{project.name}</h3>
            {/* Starts the <p> element to organize this part of the interface. */}
            <p className="mt-1 flex items-center gap-1 text-xs text-[var(--dashboard-muted)]"><MapPin size={12} />{project.location}</p>
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>
          {/* Starts the <StatusPill> element to organize this part of the interface. */}
          <StatusPill tone={statusTones[project.status]}>{statusLabels[project.status]}</StatusPill>
        {/* Closes the <div> element so later content is no longer part of this region. */}
        </div>
        {/* Starts the <div> element to organize this part of the interface. */}
        <div className="mt-4 flex items-end justify-between gap-3">
          {/* Starts the <div> element to organize this part of the interface. */}
          <div>
            {/* Starts the <p> element to organize this part of the interface. */}
            <p className="text-2xl font-semibold tracking-[-0.04em] text-[var(--dashboard-ink)]">{progress === null ? '—' : `${progress}%`}</p>
            {/* Starts the <p> element to organize this part of the interface. */}
            <p className="text-[10px] text-[var(--dashboard-muted)]">{progress === null ? 'No progress log recorded' : 'Latest reported progress'}</p>
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>
          {/* Starts the <button> element to provide an action the user can activate. */}
          <button type="button" onClick={() => { window.location.href = `/app/projects/${project.id}` }} className="text-xs font-semibold text-[var(--dashboard-amber)]">
            {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
            View project <ArrowUpRight size={13} className="inline" />
          {/* Closes the <button> element so later content is no longer part of this region. */}
          </button>
        {/* Closes the <div> element so later content is no longer part of this region. */}
        </div>
        {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
        {progress !== null && <div className="mt-2"><ProgressBar value={progress} /></div>}
        {/* Starts the <div> element to organize this part of the interface. */}
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/10 pt-3 text-xs">
          {/* Starts the <div> element to organize this part of the interface. */}
          <div><p className="text-[var(--dashboard-subtle)]">Project manager</p><p className="mt-1 font-medium text-[var(--dashboard-ink)]">{project.assignedPm?.name ?? 'Unassigned'}</p></div>
          {/* Starts the <div> element to organize this part of the interface. */}
          <div><p className="text-[var(--dashboard-subtle)]">Expected completion</p><p className="mt-1 font-medium text-[var(--dashboard-ink)]">{formatDate(project.expectedEndDate)}</p></div>
        {/* Closes the <div> element so later content is no longer part of this region. */}
        </div>
      {/* Closes the <div> element so later content is no longer part of this region. */}
      </div>
    {/* Closes the <DashboardCard> element so later content is no longer part of this region. */}
    </DashboardCard>
  // Closes this function call or grouped expression so the surrounding code can continue.
  )
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines AdminDashboardPage so this module can perform its named task when needed.
export function AdminDashboardPage() {
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [query, setQuery] = useState('')
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [filter, setFilter] = useState<ProjectStatus>('All')
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [listView, setListView] = useState(false)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const { projects, isLoading: projectsLoading, error: projectsError, retry: retryProjects } = useProjects()
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const { projects: dashboardProjects, isLoading, error, retry } = useDashboardData(projects)
  // Caches filteredProjects so its calculation is repeated only when its inputs change.
  // Caches filteredProjects so its calculation is repeated only when its inputs change.
  const filteredProjects = useMemo(() => dashboardProjects.filter(({ project }) => {
    // Stores the value in matchesQuery so later lines can reuse this data or behavior for the current feature.
    const matchesQuery = `${project.name} ${project.location} ${project.code} ${project.assignedPm?.name ?? ''}`.toLowerCase().includes(query.toLowerCase())
    // Returns the result so the caller or React receives the value or interface this function provides.
    return matchesQuery && (filter === 'All' || project.status === filter)
  // Continues the component or data expression so its related values and behavior stay grouped together.
  }), [dashboardProjects, filter, query])
  // Caches activity so its calculation is repeated only when its inputs change.
  // Caches activity so its calculation is repeated only when its inputs change.
  const activity = useMemo(() => latestProjectActivity(dashboardProjects).slice(0, 8), [dashboardProjects])
  // Caches progressUpdates so its calculation is repeated only when its inputs change.
  // Caches progressUpdates so its calculation is repeated only when its inputs change.
  const progressUpdates = useMemo(() => dashboardProjects
    // Transforms each collection item so the corresponding values or interface elements can be produced.
    .flatMap(({ project, progressHistory }) => progressHistory.map((entry) => ({ project, entry })))
    // Continues the component or data expression so its related values and behavior stay grouped together.
    .sort((left, right) => new Date(right.entry.logDate).getTime() - new Date(left.entry.logDate).getTime())
    // Continues the component or data expression so its related values and behavior stay grouped together.
    .slice(0, 8), [dashboardProjects])

  // Stores the value in loading so later lines can reuse this data or behavior for the current feature.
  const loading = projectsLoading || isLoading
  // Stores the value in loadError so later lines can reuse this data or behavior for the current feature.
  const loadError = projectsError ?? error
  // Stores the value in retryLoad so later lines can reuse this data or behavior for the current feature.
  const retryLoad = projectsError ? retryProjects : retry
  // Stores the value in projectsCount so later lines can reuse this data or behavior for the current feature.
  const projectsCount = projects.length
  // Stores the value in activeCount so later lines can reuse this data or behavior for the current feature.
  const activeCount = projects.filter((project) => project.status === 'ACTIVE').length
  // Stores the value in completedCount so later lines can reuse this data or behavior for the current feature.
  const completedCount = projects.filter((project) => project.status === 'COMPLETED').length
  // Stores the value in onHoldCount so later lines can reuse this data or behavior for the current feature.
  const onHoldCount = projects.filter((project) => project.status === 'ON_HOLD').length
  // Stores the value in projectsWithProgress so later lines can reuse this data or behavior for the current feature.
  const projectsWithProgress = dashboardProjects.filter(({ summary }) => summary.totalDailyLogs > 0)
  // Stores the value in averageProgress so later lines can reuse this data or behavior for the current feature.
  const averageProgress = projectsWithProgress.length
    // Continues the component or data expression so its related values and behavior stay grouped together.
    ? Math.round(projectsWithProgress.reduce((sum, item) => sum + Number(item.summary.latestProgressPercent), 0) / projectsWithProgress.length)
    // Continues the component or data expression so its related values and behavior stay grouped together.
    : null
  // Stores the value in activeBudget so later lines can reuse this data or behavior for the current feature.
  const activeBudget = projects.filter((project) => project.status === 'ACTIVE')
    // Continues the component or data expression so its related values and behavior stay grouped together.
    .reduce((sum, project) => sum + Number(project.totalBudget), 0)

  // Returns the result so the caller or React receives the value or interface this function provides.
  return (
    // Continues the component or data expression so its related values and behavior stay grouped together.
    <AppShell currentPath="/app/admin/dashboard">
      {/* Starts the <div> element to organize this part of the interface. */}
      <div className="mx-auto max-w-[1680px] space-y-7 p-5 sm:p-7 lg:p-8">
        {/* Starts the <section> element to group related content into a meaningful region. */}
        <section className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          {/* Starts the <div> element to organize this part of the interface. */}
          <div>
            {/* Starts the <p> element to organize this part of the interface. */}
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--dashboard-amber)]">Portfolio overview</p>
            {/* Starts the <h1> element to organize this part of the interface. */}
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[var(--dashboard-ink)] sm:text-5xl">Your Portfolio, <span className="text-white/45">Under Control.</span></h1>
            {/* Starts the <p> element to organize this part of the interface. */}
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--dashboard-muted)]">Projects and recorded site updates available to your account.</p>
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>
          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="flex flex-wrap gap-3">
            {/* Starts the <button> element to provide an action the user can activate. */}
            <button type="button" onClick={() => { window.location.href = '/app/projects' }} className="dashboard-button dashboard-button-ghost"><Plus size={16} /> Create project</button>
            {/* Starts the <button> element to provide an action the user can activate. */}
            <button type="button" onClick={() => { window.location.href = '/app/reports' }} className="dashboard-button dashboard-button-primary"><BarChart3 size={16} /> Open reports</button>
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>
        {/* Closes the <section> element so later content is no longer part of this region. */}
        </section>

        {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
        {loadError ? (
          // Continues the component or data expression so its related values and behavior stay grouped together.
          <DashboardCard className="p-6" >
            {/* Starts the <p> element to organize this part of the interface. */}
            <p role="alert" className="text-sm text-rose-300">{loadError}</p>
            {/* Starts the <button> element to provide an action the user can activate. */}
            <button type="button" onClick={retryLoad} className="mt-3 text-sm font-semibold text-[var(--dashboard-amber)]">Retry</button>
          {/* Closes the <DashboardCard> element so later content is no longer part of this region. */}
          </DashboardCard>
        // Continues the component or data expression so its related values and behavior stay grouped together.
        ) : loading ? (
          // Continues the component or data expression so its related values and behavior stay grouped together.
          <DashboardCard className="p-6" aria-live="polite"><p className="text-sm text-[var(--dashboard-muted)]">Loading portfolio data…</p></DashboardCard>
        // Continues the component or data expression so its related values and behavior stay grouped together.
        ) : projectsCount === 0 ? (
          // Continues the component or data expression so its related values and behavior stay grouped together.
          <DashboardCard className="p-10 text-center"><h2 className="text-lg font-semibold text-[var(--dashboard-ink)]">No accessible projects</h2><p className="mt-2 text-sm text-[var(--dashboard-muted)]">Projects permitted for your account will appear here.</p></DashboardCard>
        // Continues the component or data expression so its related values and behavior stay grouped together.
        ) : (
          // Continues the component or data expression so its related values and behavior stay grouped together.
          <>
            {/* Starts the <section> element to group related content into a meaningful region. */}
            <section className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr_0.8fr]">
              {/* Starts the <DashboardCard> element to organize this part of the interface. */}
              <DashboardCard tone="featured" className="p-5 sm:p-6">
                {/* Starts the <div> element to organize this part of the interface. */}
                <div className="flex items-start justify-between">
                  {/* Starts the <div> element to organize this part of the interface. */}
                  <div><p className="dashboard-eyebrow">Average latest reported progress</p><p className="mt-3 text-5xl font-semibold tracking-[-0.06em] text-[var(--dashboard-ink)]">{averageProgress === null ? '—' : `${averageProgress}%`}</p><p className="mt-2 text-xs text-[var(--dashboard-muted)]">{projectsWithProgress.length} of {projectsCount} projects have progress logs</p></div>
                  {/* Starts the <span> element to organize this part of the interface. */}
                  <span className="dashboard-icon dashboard-icon-amber"><BarChart3 size={19} /></span>
                {/* Closes the <div> element so later content is no longer part of this region. */}
                </div>
                {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                {averageProgress !== null && <div className="mt-6"><ProgressBar value={averageProgress} /><div className="mt-2 text-[10px] text-[var(--dashboard-muted)]">Unweighted mean of each project’s latest daily-log progress</div></div>}
              {/* Closes the <DashboardCard> element so later content is no longer part of this region. */}
              </DashboardCard>
              {/* Starts the <DashboardCard> element to organize this part of the interface. */}
              <DashboardCard className="p-5 sm:p-6"><p className="dashboard-eyebrow">Active project budget</p><p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[var(--dashboard-ink)]">{formatBudget(activeBudget)}</p><div className="mt-5 flex items-center gap-2 text-xs text-[var(--dashboard-muted)]"><WalletCards size={14} className="text-[var(--dashboard-amber)]" /> {activeCount} active {activeCount === 1 ? 'project' : 'projects'}</div></DashboardCard>
              {/* Starts the <DashboardCard> element to organize this part of the interface. */}
              <DashboardCard className="p-5 sm:p-6"><p className="dashboard-eyebrow">Projects on hold</p><p className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[var(--dashboard-ink)]">{onHoldCount}</p><p className="mt-2 text-xs text-[var(--dashboard-muted)]">Based on backend project status</p></DashboardCard>
            {/* Closes the <section> element so later content is no longer part of this region. */}
            </section>

            {/* Starts the <section> element to group related content into a meaningful region. */}
            <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {/* Starts the <StatCard> element to organize this part of the interface. */}
              <StatCard label="Total projects" value={String(projectsCount)} note="Accessible project records" icon={FolderKanban} />
              {/* Starts the <StatCard> element to organize this part of the interface. */}
              <StatCard label="Active" value={String(activeCount)} note="Backend status: active" icon={UsersRound} accent="green" />
              {/* Starts the <StatCard> element to organize this part of the interface. */}
              <StatCard label="Completed" value={String(completedCount)} note="Backend status: completed" icon={BarChart3} accent="violet" />
              {/* Starts the <StatCard> element to organize this part of the interface. */}
              <StatCard label="Progress logs" value={String(dashboardProjects.reduce((sum, item) => sum + item.summary.totalDailyLogs, 0))} note="Across accessible projects" icon={Clock3} accent="amber" />
            {/* Closes the <section> element so later content is no longer part of this region. */}
            </section>

            {/* Starts the <section> element to group related content into a meaningful region. */}
            <section>
              {/* Starts the <div> element to organize this part of the interface. */}
              <div className="mb-4 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                {/* Starts the <div> element to organize this part of the interface. */}
                <div><p className="dashboard-eyebrow">Portfolio workspace</p><h2 className="mt-1 text-xl font-semibold text-[var(--dashboard-ink)]">Projects in motion</h2></div>
                {/* Starts the <div> element to organize this part of the interface. */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Starts the <label> element to name a form control for users and assistive technology. */}
                  <label className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--dashboard-subtle)]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects..." className="dashboard-input pl-9" /></label>
                  {/* Starts the <select> element to collect or display a value. */}
                  <select value={filter} onChange={(event) => setFilter(event.target.value as ProjectStatus)} className="dashboard-input">
                    {/* Starts the <option> element to organize this part of the interface. */}
                    <option value="All">All statuses</option>
                    {/* Starts the <option> element to organize this part of the interface. */}
                    <option value="PLANNING">Planning</option>
                    {/* Starts the <option> element to organize this part of the interface. */}
                    <option value="ACTIVE">Active</option>
                    {/* Starts the <option> element to organize this part of the interface. */}
                    <option value="ON_HOLD">On hold</option>
                    {/* Starts the <option> element to organize this part of the interface. */}
                    <option value="COMPLETED">Completed</option>
                  {/* Closes the <select> element so later content is no longer part of this region. */}
                  </select>
                  {/* Starts the <button> element to provide an action the user can activate. */}
                  <button type="button" aria-label="Grid view" onClick={() => setListView(false)} className={`dashboard-view-button ${!listView ? 'dashboard-view-active' : ''}`}><LayoutGrid size={16} /></button>
                  {/* Starts the <button> element to provide an action the user can activate. */}
                  <button type="button" aria-label="List view" onClick={() => setListView(true)} className={`dashboard-view-button ${listView ? 'dashboard-view-active' : ''}`}><List size={16} /></button>
                {/* Closes the <div> element so later content is no longer part of this region. */}
                </div>
              {/* Closes the <div> element so later content is no longer part of this region. */}
              </div>
              {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
              {filteredProjects.length
                // Transforms each collection item so the corresponding values or interface elements can be produced.
                ? <div className={listView ? 'grid gap-3' : 'grid gap-4 md:grid-cols-2 xl:grid-cols-3'}>{filteredProjects.map(({ project, summary }) => <ProjectCard key={project.id} project={project} progress={summary.totalDailyLogs ? Number(summary.latestProgressPercent) : null} compact={listView} />)}</div>
                // Continues the component or data expression so its related values and behavior stay grouped together.
                : <DashboardCard className="p-10 text-center"><p className="text-sm text-[var(--dashboard-ink)]">{projectsCount ? 'No projects match your filters.' : 'No projects are available.'}</p><button type="button" onClick={() => { setQuery(''); setFilter('All') }} className="mt-3 text-xs text-[var(--dashboard-amber)]">Clear filters</button></DashboardCard>}
            {/* Closes the <section> element so later content is no longer part of this region. */}
            </section>

            {/* Starts the <section> element to group related content into a meaningful region. */}
            <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {/* Starts the <DashboardCard> element to organize this part of the interface. */}
              <DashboardCard className="p-5 sm:p-6">
                {/* Starts the <SectionTitle> element to organize this part of the interface. */}
                <SectionTitle title="Recent progress updates" description="Daily-log history returned by the project progress API." />
                {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                {progressUpdates.length ? <div className="mt-4 divide-y divide-white/[0.08]">{progressUpdates.map(({ project, entry }) => <div key={`${project.id}-${entry.id}`} className="py-3 first:pt-0 last:pb-0"><div className="flex items-center justify-between gap-3"><p className="truncate text-sm font-medium text-[var(--dashboard-ink)]">{project.name}</p><StatusPill tone="green">{Number(entry.progressPercent)}%</StatusPill></div><p className="mt-1 text-xs text-[var(--dashboard-muted)]">{entry.workSummary || 'No work summary recorded.'}</p><p className="mt-1 text-[10px] text-[var(--dashboard-subtle)]">{formatDate(entry.logDate)} · {project.code}</p></div>)}</div> : <p className="mt-4 text-sm text-[var(--dashboard-muted)]">No project progress logs have been recorded.</p>}
              {/* Closes the <DashboardCard> element so later content is no longer part of this region. */}
              </DashboardCard>
              {/* Starts the <DashboardCard> element to organize this part of the interface. */}
              <DashboardCard className="p-5 sm:p-6">
                {/* Starts the <SectionTitle> element to organize this part of the interface. */}
                <SectionTitle title="Recent activity" description="Audit activity returned for accessible projects." action={<Clock3 size={17} className="text-[var(--dashboard-amber)]" />} />
                {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                {activity.length ? <div className="mt-4 divide-y divide-white/[0.08]">{activity.map((item) => <div className="py-3 first:pt-0 last:pb-0" key={`${item.project.id}-${item.id}`}><p className="text-sm font-medium text-[var(--dashboard-ink)]">{item.action} · {item.entityType}</p><p className="mt-1 text-xs text-[var(--dashboard-muted)]">{item.project.name} · {item.userName ?? 'User not available'}</p><p className="mt-1 text-[10px] text-[var(--dashboard-subtle)]">{formatDate(item.createdAt)}</p></div>)}</div> : <p className="mt-4 text-sm text-[var(--dashboard-muted)]">No project activity has been recorded.</p>}
              {/* Closes the <DashboardCard> element so later content is no longer part of this region. */}
              </DashboardCard>
            {/* Closes the <section> element so later content is no longer part of this region. */}
            </section>
          {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
          </>
        )}

        {/* Starts the <section> element to group related content into a meaningful region. */}
        <section><div className="mb-4"><p className="dashboard-eyebrow">Command shortcuts</p><h2 className="mt-1 text-xl font-semibold text-[var(--dashboard-ink)]">Move work forward</h2></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{[['Create project', Plus, '/app/projects'], ['Manage users', UsersRound, '/app/users'], ['View all projects', FolderKanban, '/app/projects'], ['Open reports', BarChart3, '/app/reports']].map(([label, Icon, path]) => <button type="button" key={label as string} onClick={() => { window.location.href = path as string }} className="dashboard-card group p-4 text-left transition hover:-translate-y-0.5 hover:border-[#F2A65A]/40"><div className="flex items-center justify-between"><span className="dashboard-icon dashboard-icon-amber"><Icon size={17} /></span><ArrowUpRight size={15} className="text-[var(--dashboard-subtle)] transition group-hover:text-[var(--dashboard-amber)]" /></div><p className="mt-4 text-sm font-medium text-[var(--dashboard-ink)]">{label as string}</p></button>)}</div></section>
      {/* Closes the <div> element so later content is no longer part of this region. */}
      </div>
    {/* Closes the <AppShell> element so later content is no longer part of this region. */}
    </AppShell>
  // Closes this function call or grouped expression so the surrounding code can continue.
  )
// Closes the current block or object so the grouped statements or settings end here.
}
// File purpose: Renders the app shell screen and coordinates its page-level interactions.
