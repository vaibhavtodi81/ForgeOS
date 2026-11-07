import {
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Clock3,
  FolderKanban,
  Plus,
  Users,
  Wallet,
  Activity,
  MoreHorizontal,
  TrendingUp,
} from 'lucide-react'
import { AppShell } from '../components/AppShell'

const stats = [
  {
    label: 'Total Projects',
    value: '24',
    change: '+12.5%',
    note: 'from last month',
    icon: FolderKanban,
  },
  {
    label: 'Active Projects',
    value: '08',
    change: '+2',
    note: 'new this month',
    icon: Building2,
  },
  {
    label: 'Completed Projects',
    value: '12',
    change: '+8.2%',
    note: 'from last month',
    icon: CheckCircle2,
  },
  {
    label: 'Total Users',
    value: '36',
    change: '+4',
    note: 'new team members',
    icon: Users,
  },
]

const projects = [
  {
    name: 'Green Valley Residency',
    id: 'PRJ-001',
    manager: 'Aarav Sharma',
    progress: 76,
    status: 'In Progress',
    color: '#8A9B78',
  },
  {
    name: 'Skyline Commercial Hub',
    id: 'PRJ-002',
    manager: 'Priya Mehta',
    progress: 52,
    status: 'In Progress',
    color: '#C39B6D',
  },
  {
    name: 'Riverside Heights',
    id: 'PRJ-003',
    manager: 'Rohan Verma',
    progress: 100,
    status: 'Completed',
    color: '#8A9B78',
  },
  {
    name: 'Urban Square',
    id: 'PRJ-004',
    manager: 'Neha Kapoor',
    progress: 28,
    status: 'Planning',
    color: '#9B8DB5',
  },
]

const activities = [
  {
    title: 'Project progress updated',
    detail: 'Green Valley Residency · 76% completed',
    time: '25 minutes ago',
    icon: TrendingUp,
  },
  {
    title: 'New team member added',
    detail: 'Priya Mehta · Project Manager',
    time: '2 hours ago',
    icon: Users,
  },
  {
    title: 'Project completed',
    detail: 'Riverside Heights · PRJ-003',
    time: 'Yesterday',
    icon: CheckCircle2,
  },
]

function MetricCard({
  label,
  value,
  change,
  note,
  icon: Icon,
}: {
  label: string
  value: string
  change: string
  note: string
  icon: typeof FolderKanban
}) {
  return (
    <div className="rounded-2xl border border-[#C8BCB4]/70 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[#8E827A]">{label}</p>
          <h3 className="mt-3 text-3xl font-semibold tracking-tight text-[#323232]">
            {value}
          </h3>
        </div>
        <div className="rounded-xl bg-[#F7F3EE] p-3 text-[#595552]">
          <Icon size={21} strokeWidth={1.7} />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 text-xs">
        <span className="font-semibold text-[#71866A]">{change}</span>
        <span className="text-[#8E827A]">{note}</span>
      </div>
    </div>
  )
}

export function DashboardPage() {
  return (
    <AppShell currentPath="/app">
      <div className="mx-auto max-w-[1600px] space-y-7 p-5 sm:p-7 lg:p-8">
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-[#8E827A]">
              Saturday, November 7, 2026
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#323232] sm:text-3xl">
              Good morning, Admin
            </h1>
            <p className="mt-2 text-sm text-[#8E827A]">
              Here’s what’s happening across your construction projects.
            </p>
          </div>
          <button
            type="button"
            onClick={() => { window.location.href = '/app/projects' }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#323232] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#1E1E1E]"
          >
            <Plus size={17} />
            Create Project
          </button>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <MetricCard key={stat.label} {...stat} />
          ))}
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.65fr_1fr]">
          <div className="overflow-hidden rounded-2xl border border-[#C8BCB4]/70 bg-white">
            <div className="flex items-center justify-between border-b border-[#E8DCD4] px-5 py-5">
              <div>
                <h2 className="font-semibold text-[#323232]">Project Overview</h2>
                <p className="mt-1 text-xs text-[#8E827A]">
                  Track progress across your projects
                </p>
              </div>
              <button
                type="button"
                onClick={() => { window.location.href = '/app/projects' }}
                className="flex items-center gap-1 text-sm font-medium text-[#595552] hover:text-[#1E1E1E]"
              >
                View all <ArrowUpRight size={15} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[580px] text-left">
                <thead className="bg-[#F7F3EE] text-xs text-[#8E827A]">
                  <tr>
                    <th className="px-5 py-3 font-medium">Project</th>
                    <th className="px-5 py-3 font-medium">Project Manager</th>
                    <th className="px-5 py-3 font-medium">Progress</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DCD4]">
                  {projects.map((project) => (
                    <tr key={project.id} className="hover:bg-[#F7F3EE]/60">
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-[#323232]">
                          {project.name}
                        </p>
                        <p className="mt-1 text-xs text-[#8E827A]">{project.id}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-[#595552]">
                        {project.manager}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-[#E8DCD4]">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${project.progress}%`,
                                backgroundColor: project.color,
                              }}
                            />
                          </div>
                          <span className="text-xs font-medium text-[#595552]">
                            {project.progress}%
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          project.status === 'Completed'
                            ? 'bg-[#E8EFE5] text-[#617858]'
                            : project.status === 'Planning'
                              ? 'bg-[#F1EAF6] text-[#806B96]'
                              : 'bg-[#F5EDE1] text-[#9A7950]'
                        }`}>
                          {project.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl border border-[#C8BCB4]/70 bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-[#323232]">Recent Activity</h2>
                <p className="mt-1 text-xs text-[#8E827A]">
                  Latest updates from your workspace
                </p>
              </div>
              <button type="button" className="rounded-lg p-2 text-[#8E827A] hover:bg-[#F7F3EE]">
                <MoreHorizontal size={19} />
              </button>
            </div>

            <div className="mt-6 space-y-6">
              {activities.map((activity) => {
                const Icon = activity.icon
                return (
                  <div key={activity.title} className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F7F3EE] text-[#595552]">
                      <Icon size={18} strokeWidth={1.7} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#323232]">
                        {activity.title}
                      </p>
                      <p className="mt-1 text-xs text-[#8E827A]">
                        {activity.detail}
                      </p>
                      <p className="mt-2 text-[11px] text-[#A69A92]">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="flex items-center gap-4 rounded-2xl border border-[#C8BCB4]/70 bg-white p-5">
            <div className="rounded-xl bg-[#F7F3EE] p-3 text-[#595552]">
              <Plus size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#323232]">Create a project</p>
              <p className="mt-1 text-xs text-[#8E827A]">Start a new construction project</p>
            </div>
            <ArrowUpRight className="ml-auto text-[#8E827A]" size={17} />
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-[#C8BCB4]/70 bg-white p-5">
            <div className="rounded-xl bg-[#F7F3EE] p-3 text-[#595552]">
              <Users size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#323232]">Manage users</p>
              <p className="mt-1 text-xs text-[#8E827A]">Manage your team and roles</p>
            </div>
            <ArrowUpRight className="ml-auto text-[#8E827A]" size={17} />
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-[#C8BCB4]/70 bg-white p-5">
            <div className="rounded-xl bg-[#F7F3EE] p-3 text-[#595552]">
              <Wallet size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#323232]">Manage land</p>
              <p className="mt-1 text-xs text-[#8E827A]">View and manage land records</p>
            </div>
            <ArrowUpRight className="ml-auto text-[#8E827A]" size={17} />
          </div>
        </section>

        <div className="flex items-center justify-center gap-2 pb-2 text-xs text-[#A69A92]">
          <Activity size={14} />
          <span>ForgeOS Workspace · Demo dashboard data</span>
          <Clock3 size={13} className="ml-2" />
          <span>Last updated just now</span>
        </div>
      </div>
    </AppShell>
  )
}
