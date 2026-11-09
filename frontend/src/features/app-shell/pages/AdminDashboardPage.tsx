import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  BellRing,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock3,
  FolderKanban,
  PackageCheck,
  Plus,
  TrendingUp,
  UsersRound,
} from 'lucide-react'
import { AppShell } from '../components/AppShell'

type ProjectStatus = 'In Progress' | 'Completed' | 'Delayed' | 'Planning'

type Project = {
  id: string
  name: string
  location: string
  manager: string
  progress: number
  stage: string
  status: ProjectStatus
  completionDate: string
  color: string
}

const projects: Project[] = [
  { id: 'PRJ-001', name: 'Green Valley Residency', location: 'Gurugram, Haryana', manager: 'Aarav Sharma', progress: 76, stage: 'Finishing', status: 'In Progress', completionDate: '20 Dec 2026', color: '#B87A4F' },
  { id: 'PRJ-002', name: 'Skyline Commercial Hub', location: 'Delhi, India', manager: 'Priya Mehta', progress: 52, stage: 'Structure', status: 'In Progress', completionDate: '15 Mar 2027', color: '#8A9B78' },
  { id: 'PRJ-003', name: 'Riverside Heights', location: 'Noida, Uttar Pradesh', manager: 'Rohan Verma', progress: 100, stage: 'Handover', status: 'Completed', completionDate: '30 Aug 2026', color: '#71866A' },
  { id: 'PRJ-004', name: 'Urban Square', location: 'Jaipur, Rajasthan', manager: 'Neha Kapoor', progress: 28, stage: 'Planning', status: 'Planning', completionDate: '30 Oct 2027', color: '#9B8DB5' },
  { id: 'PRJ-005', name: 'Harbor View Villas', location: 'Mumbai, Maharashtra', manager: 'Priya Mehta', progress: 41, stage: 'Foundation', status: 'Delayed', completionDate: '08 Jan 2027', color: '#C66B5D' },
]

const currentDate = new Intl.DateTimeFormat('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date())

const activities = [
  { title: 'Progress update recorded', detail: 'Green Valley Residency reached 76%', time: '25 minutes ago', icon: TrendingUp, tone: 'bg-[#F5EDE1] text-[#9A7950]' },
  { title: 'New project created', detail: 'Harbor View Villas · PRJ-005', time: '2 hours ago', icon: FolderKanban, tone: 'bg-[#F3E9E1] text-[#9A5E3A]' },
  { title: 'Daily site log added', detail: 'Skyline Commercial Hub · 12 entries', time: 'Yesterday', icon: ClipboardList, tone: 'bg-[#E8EFE5] text-[#617858]' },
  { title: 'Project assignment changed', detail: 'Urban Square assigned to Neha Kapoor', time: 'Yesterday', icon: UsersRound, tone: 'bg-[#F1EAF6] text-[#806B96]' },
]

const statusStyles: Record<ProjectStatus, string> = {
  'In Progress': 'bg-[#F5EDE1] text-[#9A7950]',
  Completed: 'bg-[#E8EFE5] text-[#617858]',
  Delayed: 'bg-[#F8ECEA] text-[#9B625A]',
  Planning: 'bg-[#F1EAF6] text-[#806B96]',
}

function goTo(path: string) {
  window.location.href = path
}

function MetricCard({ label, value, note, icon: Icon, tone }: {
  label: string
  value: string
  note: string
  icon: typeof FolderKanban
  tone: string
}) {
  return (
    <div className="rounded-2xl border border-[#C8BCB4]/70 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[#8E827A]">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#323232]">{value}</p>
        </div>
        <div className={`rounded-xl p-3 ${tone}`}><Icon size={20} strokeWidth={1.8} /></div>
      </div>
      <p className="mt-4 text-xs text-[#8E827A]">{note}</p>
    </div>
  )
}

function SectionHeading({ title, description, action }: { title: string; description: string; action?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#E8DCD4] px-5 py-5">
      <div>
        <h2 className="font-semibold text-[#323232]">{title}</h2>
        <p className="mt-1 text-xs text-[#8E827A]">{description}</p>
      </div>
      {action && <button type="button" onClick={() => goTo('/app/projects')} className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-[#595552] hover:text-[#9A5E3A]">{action}<ArrowUpRight size={15} /></button>}
    </div>
  )
}

function ProgressChart() {
  return (
    <div className="relative mt-5 h-44">
      <div className="absolute inset-0 flex flex-col justify-between text-[10px] text-[#A59A93]">
        {[100, 75, 50, 25, 0].map((value) => <div className="flex items-center gap-2" key={value}><span className="w-6 text-right">{value}%</span><div className="h-px flex-1 bg-[#E8DCD4]" /></div>)}
      </div>
      <svg className="absolute bottom-5 left-8 right-1 h-36 w-[calc(100%-2.25rem)] overflow-visible" viewBox="0 0 500 140" preserveAspectRatio="none" aria-label="Overall project progress chart" role="img">
        <defs><linearGradient id="progressFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#B87A4F" stopOpacity=".25" /><stop offset="100%" stopColor="#B87A4F" stopOpacity="0" /></linearGradient></defs>
        <path d="M0 119 C45 114 55 102 100 104 S155 75 200 82 S255 72 300 57 S355 51 400 37 S460 31 500 22 L500 140 L0 140 Z" fill="url(#progressFill)" />
        <path d="M0 119 C45 114 55 102 100 104 S155 75 200 82 S255 72 300 57 S355 51 400 37 S460 31 500 22" fill="none" stroke="#B87A4F" strokeWidth="3" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="absolute bottom-0 left-8 right-0 flex justify-between text-[10px] text-[#A59A93]"><span>Jan</span><span>Mar</span><span>May</span><span>Jul</span><span>Sep</span><span>Nov</span></div>
    </div>
  )
}

function StatusChart() {
  const items = [
    { label: 'In Progress', value: 2, color: '#B87A4F' },
    { label: 'Completed', value: 1, color: '#71866A' },
    { label: 'Planning', value: 1, color: '#9B8DB5' },
    { label: 'Delayed', value: 1, color: '#C66B5D' },
  ]
  return <div className="mt-6 flex items-center justify-center gap-7">
    <div className="relative h-36 w-36 rounded-full" style={{ background: 'conic-gradient(#B87A4F 0deg 144deg, #71866A 144deg 216deg, #9B8DB5 216deg 288deg, #C66B5D 288deg 360deg)' }}>
      <div className="absolute inset-5 flex flex-col items-center justify-center rounded-full bg-white"><span className="text-2xl font-semibold text-[#323232]">5</span><span className="text-[10px] text-[#8E827A]">projects</span></div>
    </div>
    <div className="space-y-3">{items.map((item) => <div className="flex items-center gap-2.5 text-xs" key={item.label}><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} /><span className="w-20 text-[#595552]">{item.label}</span><strong className="text-[#323232]">{item.value}</strong></div>)}</div>
  </div>
}

export function AdminDashboardPage() {
  const attentionProjects = projects.filter((project) => project.status === 'Delayed' || project.progress < 45)

  return (
    <AppShell currentPath="/app/admin/dashboard">
      <div className="mx-auto max-w-[1600px] space-y-7 p-5 sm:p-7 lg:p-8">
        <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-[#8E827A]">{currentDate}</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#323232] sm:text-3xl">Welcome, Administrator</h1>
            <p className="mt-2 text-sm text-[#8E827A]">Here’s your company-wide construction portfolio overview.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => goTo('/app/projects')} className="inline-flex items-center gap-2 rounded-xl border border-[#C8BCB4] bg-white px-4 py-2.5 text-sm font-medium text-[#595552] hover:border-[#9A5E3A] hover:text-[#9A5E3A]"><Plus size={16} /> Add Project</button>
            <button type="button" onClick={() => goTo('/app/users')} className="inline-flex items-center gap-2 rounded-xl bg-[#323232] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1E1E1E]"><Plus size={16} /> Add Project Manager</button>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <MetricCard label="Total Projects" value="05" note="Across 4 locations" icon={FolderKanban} tone="bg-[#F3E9E1] text-[#9A5E3A]" />
          <MetricCard label="Active Projects" value="02" note="Currently in progress" icon={TrendingUp} tone="bg-[#F5EDE1] text-[#9A7950]" />
          <MetricCard label="Completed Projects" value="01" note="Successfully handed over" icon={CheckCircle2} tone="bg-[#E8EFE5] text-[#617858]" />
          <MetricCard label="Delayed Projects" value="01" note="Requires immediate attention" icon={AlertTriangle} tone="bg-[#F8ECEA] text-[#9B625A]" />
          <MetricCard label="Project Managers" value="04" note="3 active this month" icon={BriefcaseBusiness} tone="bg-[#F1EAF6] text-[#806B96]" />
        </section>

        <section className="overflow-hidden rounded-2xl border border-[#C8BCB4]/70 bg-white">
          <SectionHeading title="Project overview" description="Monitor progress, ownership and delivery dates across your portfolio." action="View all projects" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left">
              <thead className="bg-[#F7F3EE] text-xs text-[#8E827A]"><tr><th className="px-5 py-3.5 font-medium">Project</th><th className="px-5 py-3.5 font-medium">Project Manager</th><th className="px-5 py-3.5 font-medium">Progress</th><th className="px-5 py-3.5 font-medium">Stage</th><th className="px-5 py-3.5 font-medium">Status</th><th className="px-5 py-3.5 font-medium">Expected completion</th></tr></thead>
              <tbody className="divide-y divide-[#E8DCD4]">{projects.map((project) => <tr className="hover:bg-[#F7F3EE]/60" key={project.id}>
                <td className="px-5 py-4"><p className="text-sm font-medium text-[#323232]">{project.name}</p><p className="mt-1 text-xs text-[#8E827A]">{project.id} · {project.location}</p></td>
                <td className="px-5 py-4 text-sm text-[#595552]">{project.manager}</td>
                <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="h-1.5 w-24 overflow-hidden rounded-full bg-[#E8DCD4]"><div className="h-full rounded-full" style={{ width: `${project.progress}%`, backgroundColor: project.color }} /></div><span className="text-xs font-medium text-[#595552]">{project.progress}%</span></div></td>
                <td className="px-5 py-4 text-sm text-[#595552]">{project.stage}</td>
                <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[project.status]}`}>{project.status}</span></td>
                <td className="px-5 py-4 text-sm text-[#595552]">{project.completionDate}</td>
              </tr>)}</tbody>
            </table>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_1fr]">
          <div className="rounded-2xl border border-[#C8BCB4]/70 bg-white p-5"><div className="flex items-center gap-2"><BarChart3 size={18} className="text-[#9A5E3A]" /><div><h2 className="font-semibold text-[#323232]">Overall project progress</h2><p className="mt-1 text-xs text-[#8E827A]">Portfolio progress across the current year</p></div></div><ProgressChart /></div>
          <div className="rounded-2xl border border-[#C8BCB4]/70 bg-white p-5"><div className="flex items-center gap-2"><PackageCheck size={18} className="text-[#9A5E3A]" /><div><h2 className="font-semibold text-[#323232]">Projects by status</h2><p className="mt-1 text-xs text-[#8E827A]">Current portfolio distribution</p></div></div><StatusChart /></div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_1fr]">
          <div className="rounded-2xl border border-[#C8BCB4]/70 bg-white"><SectionHeading title="Projects requiring attention" description="Items that may affect delivery timelines." /><div className="divide-y divide-[#E8DCD4]">{attentionProjects.map((project) => <button type="button" onClick={() => goTo('/app/projects')} className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-[#F7F3EE]/60" key={project.id}><div className="rounded-xl bg-[#F8ECEA] p-2.5 text-[#9B625A]"><AlertTriangle size={17} /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-[#323232]">{project.name}</p><p className="mt-1 text-xs text-[#8E827A]">{project.status === 'Delayed' ? 'No progress update in 8 days' : 'Progress is below the expected baseline'} · {project.progress}% complete</p></div><ChevronRight size={16} className="text-[#A59A93]" /></button>)}</div></div>
          <div className="rounded-2xl border border-[#C8BCB4]/70 bg-white"><SectionHeading title="Recent activities" description="Latest updates from across your organization." /><div className="divide-y divide-[#E8DCD4]">{activities.map(({ title, detail, time, icon: Icon, tone }) => <div className="flex gap-3 px-5 py-4" key={title}><div className={`h-9 w-9 shrink-0 rounded-xl p-2 ${tone}`}><Icon size={17} /></div><div className="min-w-0"><p className="text-sm font-medium text-[#323232]">{title}</p><p className="mt-0.5 truncate text-xs text-[#8E827A]">{detail}</p><p className="mt-1 text-[10px] text-[#A59A93]">{time}</p></div></div>)}</div></div>
        </section>

        <section className="rounded-2xl border border-[#C8BCB4]/70 bg-white"><SectionHeading title="Alerts and notifications" description="Stay ahead of risks and pending administrator actions." /><div className="grid grid-cols-1 divide-y divide-[#E8DCD4] md:grid-cols-3 md:divide-x md:divide-y-0">{[
          { title: 'Delayed project', detail: 'Harbor View Villas is 9 days behind schedule.', icon: Clock3, tone: 'text-[#9B625A] bg-[#F8ECEA]', path: '/app/projects' },
          { title: 'No recent update', detail: 'Urban Square has not received a progress update.', icon: BellRing, tone: 'text-[#9A7950] bg-[#F5EDE1]', path: '/app/daily-logs' },
          { title: 'Pending issue', detail: '2 material approvals need administrator review.', icon: AlertTriangle, tone: 'text-[#806B96] bg-[#F1EAF6]', path: '/app/materials' },
        ].map((alert) => <button type="button" onClick={() => goTo(alert.path)} className="flex items-start gap-3 p-5 text-left hover:bg-[#F7F3EE]/60" key={alert.title}><div className={`rounded-xl p-2.5 ${alert.tone}`}><alert.icon size={17} /></div><div><p className="text-sm font-medium text-[#323232]">{alert.title}</p><p className="mt-1 text-xs leading-5 text-[#8E827A]">{alert.detail}</p><span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#9A5E3A]">Review <ChevronRight size={13} /></span></div></button>)}</div></section>

        <section><div className="mb-4"><h2 className="font-semibold text-[#323232]">Quick navigation</h2><p className="mt-1 text-xs text-[#8E827A]">Jump into the tools your team uses every day.</p></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{[
          ['Projects', FolderKanban, '/app/projects'], ['Project Managers', UsersRound, '/app/users'], ['Daily Logs', ClipboardList, '/app/daily-logs'], ['Materials', PackageCheck, '/app/materials'], ['Vendors', BriefcaseBusiness, '/app/vendors'], ['Bills and Payments', CalendarDays, '/app/bills'],
        ].map(([label, Icon, path]) => <button type="button" onClick={() => goTo(path as string)} className="group rounded-2xl border border-[#C8BCB4]/70 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#B87A4F]" key={label as string}><div className="flex items-center justify-between"><div className="rounded-xl bg-[#F7F3EE] p-2.5 text-[#595552] group-hover:text-[#9A5E3A]"><Icon size={18} /></div><ArrowUpRight size={15} className="text-[#A59A93]" /></div><p className="mt-4 text-sm font-medium text-[#323232]">{label as string}</p></button>)}</div></section>
      </div>
    </AppShell>
  )
}
