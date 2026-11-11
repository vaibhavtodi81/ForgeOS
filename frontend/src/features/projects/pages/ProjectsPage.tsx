import { useMemo, useState } from 'react'
import { CalendarDays, FolderKanban, MapPin, Search, Users, Wallet } from 'lucide-react'
import { AppShell } from '../../app-shell/components/AppShell'
import { useAuth } from '../../authentication/auth/useAuth'
import { useProjects } from '../useProjects'
import type { Project } from '../projects-context'

const statusLabels: Record<Project['status'], string> = {
  PLANNING: 'Planning',
  ACTIVE: 'Active',
  ON_HOLD: 'On Hold',
  COMPLETED: 'Completed',
}

const statusStyles: Record<Project['status'], string> = {
  PLANNING: 'bg-[#F1EAF6] text-[#806B96]',
  ACTIVE: 'bg-[#F5EDE1] text-[#9A7950]',
  COMPLETED: 'bg-[#E8EFE5] text-[#617858]',
  ON_HOLD: 'bg-[#F8ECEA] text-[#9B625A]',
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

export function ProjectsPage() {
  const { user } = useAuth()
  const { projects, isLoading, error, retry } = useProjects()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'ALL' | Project['status']>('ALL')

  const filtered = useMemo(() => projects.filter((project) => {
    const query = search.trim().toLowerCase()
    const matchesSearch = `${project.name} ${project.code} ${project.location} ${project.assignedPm?.name ?? ''}`
      .toLowerCase()
      .includes(query)
    return matchesSearch && (filter === 'ALL' || project.status === filter)
  }), [projects, search, filter])

  const stats = [
    { label: 'Accessible Projects', value: projects.length, icon: FolderKanban },
    { label: 'Active', value: projects.filter((project) => project.status === 'ACTIVE').length, icon: CalendarDays },
    { label: 'Completed', value: projects.filter((project) => project.status === 'COMPLETED').length, icon: Users },
    { label: 'On Hold', value: projects.filter((project) => project.status === 'ON_HOLD').length, icon: Wallet },
  ]

  return (
    <AppShell currentPath="/app/projects">
      <div className="mx-auto max-w-[1600px] space-y-7 p-5 sm:p-7 lg:p-8">
        <section>
          <p className="text-sm text-[#8E827A]">Workspace / Projects</p>
          <h1 className="mt-1 text-2xl font-semibold text-[#323232] sm:text-3xl">Project Management</h1>
          <p className="mt-2 text-sm text-[#8E827A]">
            {user?.role === 'ADMIN' ? 'Projects available to your administrator account.' : 'Projects assigned to your account.'}
          </p>
        </section>

        {error && (
          <section role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E8C7BD] bg-white p-5">
            <div>
              <h2 className="font-semibold text-[#8A5143]">Projects could not be loaded</h2>
              <p className="mt-1 text-sm text-[#8E827A]">{error}</p>
            </div>
            <button type="button" onClick={retry} className="rounded-xl bg-[#323232] px-4 py-2 text-sm font-medium text-white">Retry</button>
          </section>
        )}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="rounded-2xl border border-[#C8BCB4]/70 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#8E827A]">{stat.label}</p>
                    <h2 className="mt-3 text-3xl font-semibold text-[#323232]">{isLoading ? '—' : stat.value}</h2>
                  </div>
                  <div className="rounded-xl bg-[#F7F3EE] p-3 text-[#595552]"><Icon size={21} /></div>
                </div>
              </div>
            )
          })}
        </section>

        <section className="overflow-hidden rounded-2xl border border-[#C8BCB4]/70 bg-white">
          <div className="flex flex-col justify-between gap-4 border-b border-[#E8DCD4] p-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-semibold text-[#323232]">{user?.role === 'ADMIN' ? 'All Accessible Projects' : 'My Projects'}</h2>
              <p className="mt-1 text-xs text-[#8E827A]">{isLoading ? 'Loading projects…' : `${filtered.length} projects found`}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex items-center gap-2 rounded-xl border border-[#C8BCB4] px-3 py-2">
                <Search size={17} className="text-[#8E827A]" />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search projects..." className="w-full bg-transparent text-sm outline-none sm:w-48" />
              </div>
              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value as typeof filter)}
                className="rounded-xl border border-[#C8BCB4] bg-white px-3 py-2 text-sm text-[#595552] outline-none"
                aria-label="Filter projects by status"
              >
                <option value="ALL">All statuses</option>
                {Object.entries(statusLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left">
              <thead className="bg-[#F7F3EE] text-xs text-[#8E827A]">
                <tr>
                  <th className="px-5 py-4 font-medium">Project</th>
                  <th className="px-5 py-4 font-medium">Location</th>
                  <th className="px-5 py-4 font-medium">Project Manager</th>
                  <th className="px-5 py-4 font-medium">Timeline</th>
                  <th className="px-5 py-4 font-medium">Budget</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DCD4]">
                {isLoading ? (
                  <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-[#8E827A]">Loading accessible projects…</td></tr>
                ) : filtered.map((project) => (
                  <tr key={project.id} className="hover:bg-[#F7F3EE]/60">
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-[#323232]">{project.name}</p>
                      <p className="mt-1 text-xs text-[#8E827A]">{project.code}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-[#595552]"><span className="flex items-center gap-1"><MapPin size={14} />{project.location}</span></td>
                    <td className="px-5 py-4 text-sm text-[#595552]">{project.assignedPm?.name ?? 'Unassigned'}</td>
                    <td className="px-5 py-4 text-xs text-[#595552]">{formatDate(project.startDate)} – {formatDate(project.expectedEndDate)}</td>
                    <td className="px-5 py-4 text-sm text-[#595552]">{formatBudget(project.totalBudget)}</td>
                    <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[project.status]}`}>{statusLabels[project.status]}</span></td>
                    <td className="px-5 py-4 text-right">
                      <button type="button" onClick={() => { window.location.href = `/app/projects/${project.id}` }} title={`View ${project.name}`} className="rounded-lg p-2 text-xs font-semibold text-[#595552] hover:bg-[#F7F3EE]">View</button>
                    </td>
                  </tr>
                ))}
                {!isLoading && !error && filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-[#8E827A]">
                    {projects.length === 0 ? 'No projects are available to your account.' : 'No projects match your search and status filter.'}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  )
}
