// Imports useMemo, useState from react so this module can reuse that component, helper, or library.
import { useMemo, useState } from 'react'
// Imports CalendarDays, FolderKanban, MapPin, Search, Users, Wallet from lucide-react so this module can reuse that component, helper, or library.
import { CalendarDays, FolderKanban, MapPin, Search, Users, Wallet } from 'lucide-react'
// Imports AppShell from ../../app-shell/components/AppShell so this module can reuse that component, helper, or library.
import { AppShell } from '../../app-shell/components/AppShell'
// Imports useAuth from ../../authentication/auth/useAuth so this module can reuse that component, helper, or library.
import { useAuth } from '../../authentication/auth/useAuth'
// Imports useProjects from ../useProjects so this module can reuse that component, helper, or library.
import { useProjects } from '../useProjects'
// Imports type  Project from ../projects-context so this module can reuse that component, helper, or library.
import type { Project } from '../projects-context'

// Stores the value in statusLabels so later lines can reuse this data or behavior for the current feature.
const statusLabels: Record<Project['status'], string> = {
  // Sets the PLANNING field so the surrounding object or component receives this setting.
  PLANNING: 'Planning',
  // Sets the ACTIVE field so the surrounding object or component receives this setting.
  ACTIVE: 'Active',
  // Sets the ON_HOLD field so the surrounding object or component receives this setting.
  ON_HOLD: 'On Hold',
  // Sets the COMPLETED field so the surrounding object or component receives this setting.
  COMPLETED: 'Completed',
// Closes the current block or object so the grouped statements or settings end here.
}

// Stores the value in statusStyles so later lines can reuse this data or behavior for the current feature.
const statusStyles: Record<Project['status'], string> = {
  // Sets the PLANNING field so the surrounding object or component receives this setting.
  PLANNING: 'bg-[#F1EAF6] text-[#806B96]',
  // Sets the ACTIVE field so the surrounding object or component receives this setting.
  ACTIVE: 'bg-[#F5EDE1] text-[#9A7950]',
  // Sets the COMPLETED field so the surrounding object or component receives this setting.
  COMPLETED: 'bg-[#E8EFE5] text-[#617858]',
  // Sets the ON_HOLD field so the surrounding object or component receives this setting.
  ON_HOLD: 'bg-[#F8ECEA] text-[#9B625A]',
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines formatDate so this module can perform its named task when needed.
function formatDate(value: string | null) {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return value ? new Date(value).toLocaleDateString() : 'Not specified'
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines formatBudget so this module can perform its named task when needed.
function formatBudget(value: string | number) {
  // Stores the value in amount so later lines can reuse this data or behavior for the current feature.
  const amount = Number(value)
  // Returns the result so the caller or React receives the value or interface this function provides.
  return Number.isFinite(amount)
    // Continues the component or data expression so its related values and behavior stay grouped together.
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount)
    // Continues the component or data expression so its related values and behavior stay grouped together.
    : 'Not specified'
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines ProjectsPage so this module can perform its named task when needed.
export function ProjectsPage() {
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const { user } = useAuth()
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const { projects, isLoading, error, retry } = useProjects()
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [search, setSearch] = useState('')
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [filter, setFilter] = useState<'ALL' | Project['status']>('ALL')

  // Caches filtered so its calculation is repeated only when its inputs change.
  // Caches filtered so its calculation is repeated only when its inputs change.
  const filtered = useMemo(() => projects.filter((project) => {
    // Stores the value in query so later lines can reuse this data or behavior for the current feature.
    const query = search.trim().toLowerCase()
    // Stores the value in matchesSearch so later lines can reuse this data or behavior for the current feature.
    const matchesSearch = `${project.name} ${project.code} ${project.location} ${project.assignedPm?.name ?? ''}`
      // Continues the component or data expression so its related values and behavior stay grouped together.
      .toLowerCase()
      // Continues the component or data expression so its related values and behavior stay grouped together.
      .includes(query)
    // Returns the result so the caller or React receives the value or interface this function provides.
    return matchesSearch && (filter === 'ALL' || project.status === filter)
  // Continues the component or data expression so its related values and behavior stay grouped together.
  }), [projects, search, filter])

  // Stores the value in stats so later lines can reuse this data or behavior for the current feature.
  const stats = [
    // Continues the component or data expression so its related values and behavior stay grouped together.
    { label: 'Accessible Projects', value: projects.length, icon: FolderKanban },
    // Keeps only items matching this condition so the result contains relevant data.
    { label: 'Active', value: projects.filter((project) => project.status === 'ACTIVE').length, icon: CalendarDays },
    // Keeps only items matching this condition so the result contains relevant data.
    { label: 'Completed', value: projects.filter((project) => project.status === 'COMPLETED').length, icon: Users },
    // Keeps only items matching this condition so the result contains relevant data.
    { label: 'On Hold', value: projects.filter((project) => project.status === 'ON_HOLD').length, icon: Wallet },
  // Continues the component or data expression so its related values and behavior stay grouped together.
  ]

  // Returns the result so the caller or React receives the value or interface this function provides.
  return (
    // Continues the component or data expression so its related values and behavior stay grouped together.
    <AppShell currentPath="/app/projects">
      {/* Starts the <div> element to organize this part of the interface. */}
      <div className="mx-auto max-w-[1600px] space-y-7 p-5 sm:p-7 lg:p-8">
        {/* Starts the <section> element to group related content into a meaningful region. */}
        <section>
          {/* Starts the <p> element to organize this part of the interface. */}
          <p className="text-sm text-[#8E827A]">Workspace / Projects</p>
          {/* Starts the <h1> element to organize this part of the interface. */}
          <h1 className="mt-1 text-2xl font-semibold text-[#323232] sm:text-3xl">Project Management</h1>
          {/* Starts the <p> element to organize this part of the interface. */}
          <p className="mt-2 text-sm text-[#8E827A]">
            {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
            {user?.role === 'ADMIN' ? 'Projects available to your administrator account.' : 'Projects assigned to your account.'}
          {/* Closes the <p> element so later content is no longer part of this region. */}
          </p>
        {/* Closes the <section> element so later content is no longer part of this region. */}
        </section>

        {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
        {error && (
          // Continues the component or data expression so its related values and behavior stay grouped together.
          <section role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E8C7BD] bg-white p-5">
            {/* Starts the <div> element to organize this part of the interface. */}
            <div>
              {/* Starts the <h2> element to organize this part of the interface. */}
              <h2 className="font-semibold text-[#8A5143]">Projects could not be loaded</h2>
              {/* Starts the <p> element to organize this part of the interface. */}
              <p className="mt-1 text-sm text-[#8E827A]">{error}</p>
            {/* Closes the <div> element so later content is no longer part of this region. */}
            </div>
            {/* Starts the <button> element to provide an action the user can activate. */}
            <button type="button" onClick={retry} className="rounded-xl bg-[#323232] px-4 py-2 text-sm font-medium text-white">Retry</button>
          {/* Closes the <section> element so later content is no longer part of this region. */}
          </section>
        // Continues the component or data expression so its related values and behavior stay grouped together.
        )}

        {/* Starts the <section> element to group related content into a meaningful region. */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
          {stats.map((stat) => {
            // Stores the value in Icon so later lines can reuse this data or behavior for the current feature.
            const Icon = stat.icon
            // Returns the result so the caller or React receives the value or interface this function provides.
            return (
              // Continues the component or data expression so its related values and behavior stay grouped together.
              <div key={stat.label} className="rounded-2xl border border-[#C8BCB4]/70 bg-white p-5 shadow-sm">
                {/* Starts the <div> element to organize this part of the interface. */}
                <div className="flex items-center justify-between">
                  {/* Starts the <div> element to organize this part of the interface. */}
                  <div>
                    {/* Starts the <p> element to organize this part of the interface. */}
                    <p className="text-sm text-[#8E827A]">{stat.label}</p>
                    {/* Starts the <h2> element to organize this part of the interface. */}
                    <h2 className="mt-3 text-3xl font-semibold text-[#323232]">{isLoading ? '—' : stat.value}</h2>
                  {/* Closes the <div> element so later content is no longer part of this region. */}
                  </div>
                  {/* Starts the <div> element to organize this part of the interface. */}
                  <div className="rounded-xl bg-[#F7F3EE] p-3 text-[#595552]"><Icon size={21} /></div>
                {/* Closes the <div> element so later content is no longer part of this region. */}
                </div>
              {/* Closes the <div> element so later content is no longer part of this region. */}
              </div>
            // Closes this function call or grouped expression so the surrounding code can continue.
            )
          // Continues the component or data expression so its related values and behavior stay grouped together.
          })}
        {/* Closes the <section> element so later content is no longer part of this region. */}
        </section>

        {/* Starts the <section> element to group related content into a meaningful region. */}
        <section className="overflow-hidden rounded-2xl border border-[#C8BCB4]/70 bg-white">
          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="flex flex-col justify-between gap-4 border-b border-[#E8DCD4] p-5 sm:flex-row sm:items-center">
            {/* Starts the <div> element to organize this part of the interface. */}
            <div>
              {/* Starts the <h2> element to organize this part of the interface. */}
              <h2 className="font-semibold text-[#323232]">{user?.role === 'ADMIN' ? 'All Accessible Projects' : 'My Projects'}</h2>
              {/* Starts the <p> element to organize this part of the interface. */}
              <p className="mt-1 text-xs text-[#8E827A]">{isLoading ? 'Loading projects…' : `${filtered.length} projects found`}</p>
            {/* Closes the <div> element so later content is no longer part of this region. */}
            </div>
            {/* Starts the <div> element to organize this part of the interface. */}
            <div className="flex flex-col gap-3 sm:flex-row">
              {/* Starts the <div> element to organize this part of the interface. */}
              <div className="flex items-center gap-2 rounded-xl border border-[#C8BCB4] px-3 py-2">
                {/* Starts the <Search> element to organize this part of the interface. */}
                <Search size={17} className="text-[#8E827A]" />
                {/* Starts the <input> element to collect or display a value. */}
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search projects..." className="w-full bg-transparent text-sm outline-none sm:w-48" />
              {/* Closes the <div> element so later content is no longer part of this region. */}
              </div>
              {/* Starts the <select> element to collect or display a value. */}
              <select
                /* Supplies the value shown by this form control so the user sees the current data. */
                value={filter}
                /* Connects the Change event to its handler so the interface can respond to interaction. */
                onChange={(event) => setFilter(event.target.value as typeof filter)}
                /* Applies utility classes so the element’s layout, spacing, and appearance match the design. */
                className="rounded-xl border border-[#C8BCB4] bg-white px-3 py-2 text-sm text-[#595552] outline-none"
                /* Provides aria-label accessibility information so assistive technology can describe the element. */
                aria-label="Filter projects by status"
              /* Continues the component or data expression so its related values and behavior stay grouped together. */
              /* Continues the component or data expression so its related values and behavior stay grouped together. */
              >
                {/* Starts the <option> element to organize this part of the interface. */}
                <option value="ALL">All statuses</option>
                {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                {Object.entries(statusLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
              {/* Closes the <select> element so later content is no longer part of this region. */}
              </select>
            {/* Closes the <div> element so later content is no longer part of this region. */}
            </div>
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>

          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="overflow-x-auto">
            {/* Starts the <table> element to organize this part of the interface. */}
            <table className="w-full min-w-[950px] text-left">
              {/* Starts the <thead> element to organize this part of the interface. */}
              <thead className="bg-[#F7F3EE] text-xs text-[#8E827A]">
                {/* Starts the <tr> element to organize this part of the interface. */}
                <tr>
                  {/* Starts the <th> element to organize this part of the interface. */}
                  <th className="px-5 py-4 font-medium">Project</th>
                  {/* Starts the <th> element to organize this part of the interface. */}
                  <th className="px-5 py-4 font-medium">Location</th>
                  {/* Starts the <th> element to organize this part of the interface. */}
                  <th className="px-5 py-4 font-medium">Project Manager</th>
                  {/* Starts the <th> element to organize this part of the interface. */}
                  <th className="px-5 py-4 font-medium">Timeline</th>
                  {/* Starts the <th> element to organize this part of the interface. */}
                  <th className="px-5 py-4 font-medium">Budget</th>
                  {/* Starts the <th> element to organize this part of the interface. */}
                  <th className="px-5 py-4 font-medium">Status</th>
                  {/* Starts the <th> element to organize this part of the interface. */}
                  <th className="px-5 py-4 text-right font-medium">Actions</th>
                {/* Closes the <tr> element so later content is no longer part of this region. */}
                </tr>
              {/* Closes the <thead> element so later content is no longer part of this region. */}
              </thead>
              {/* Starts the <tbody> element to organize this part of the interface. */}
              <tbody className="divide-y divide-[#E8DCD4]">
                {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                {isLoading ? (
                  // Continues the component or data expression so its related values and behavior stay grouped together.
                  <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-[#8E827A]">Loading accessible projects…</td></tr>
                // Transforms each collection item so the corresponding values or interface elements can be produced.
                ) : filtered.map((project) => (
                  // Continues the component or data expression so its related values and behavior stay grouped together.
                  <tr key={project.id} className="hover:bg-[#F7F3EE]/60">
                    {/* Starts the <td> element to organize this part of the interface. */}
                    <td className="px-5 py-4">
                      {/* Starts the <p> element to organize this part of the interface. */}
                      <p className="text-sm font-medium text-[#323232]">{project.name}</p>
                      {/* Starts the <p> element to organize this part of the interface. */}
                      <p className="mt-1 text-xs text-[#8E827A]">{project.code}</p>
                    {/* Closes the <td> element so later content is no longer part of this region. */}
                    </td>
                    {/* Starts the <td> element to organize this part of the interface. */}
                    <td className="px-5 py-4 text-sm text-[#595552]"><span className="flex items-center gap-1"><MapPin size={14} />{project.location}</span></td>
                    {/* Starts the <td> element to organize this part of the interface. */}
                    <td className="px-5 py-4 text-sm text-[#595552]">{project.assignedPm?.name ?? 'Unassigned'}</td>
                    {/* Starts the <td> element to organize this part of the interface. */}
                    <td className="px-5 py-4 text-xs text-[#595552]">{formatDate(project.startDate)} – {formatDate(project.expectedEndDate)}</td>
                    {/* Starts the <td> element to organize this part of the interface. */}
                    <td className="px-5 py-4 text-sm text-[#595552]">{formatBudget(project.totalBudget)}</td>
                    {/* Starts the <td> element to organize this part of the interface. */}
                    <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[project.status]}`}>{statusLabels[project.status]}</span></td>
                    {/* Starts the <td> element to organize this part of the interface. */}
                    <td className="px-5 py-4 text-right">
                      {/* Starts the <button> element to provide an action the user can activate. */}
                      <button type="button" onClick={() => { window.location.href = `/app/projects/${project.id}` }} title={`View ${project.name}`} className="rounded-lg p-2 text-xs font-semibold text-[#595552] hover:bg-[#F7F3EE]">View</button>
                    {/* Closes the <td> element so later content is no longer part of this region. */}
                    </td>
                  {/* Closes the <tr> element so later content is no longer part of this region. */}
                  </tr>
                ))}
                {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                {!isLoading && !error && filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-[#8E827A]">
                    {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                    {projects.length === 0 ? 'No projects are available to your account.' : 'No projects match your search and status filter.'}
                  {/* Closes the <td> element so later content is no longer part of this region. */}
                  </td></tr>
                )}
              {/* Closes the <tbody> element so later content is no longer part of this region. */}
              </tbody>
            {/* Closes the <table> element so later content is no longer part of this region. */}
            </table>
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>
        {/* Closes the <section> element so later content is no longer part of this region. */}
        </section>
      {/* Closes the <div> element so later content is no longer part of this region. */}
      </div>
    {/* Closes the <AppShell> element so later content is no longer part of this region. */}
    </AppShell>
  // Closes this function call or grouped expression so the surrounding code can continue.
  )
// Closes the current block or object so the grouped statements or settings end here.
}
// File purpose: Renders the projects screen and coordinates its page-level interactions.
