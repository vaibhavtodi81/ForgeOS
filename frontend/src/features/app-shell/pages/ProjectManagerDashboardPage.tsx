import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Construction,
  HardHat,
  MapPin,
  Plus,
  ShieldAlert,
  Truck,
  Users,
  Wrench,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { AppShell } from '../components/AppShell'
import { DashboardCard, ProgressBar, SectionTitle, StatCard, StatusPill } from '../components/dashboard-ui'

type ProjectStatus = 'In Progress' | 'Delayed'
type MilestoneStatus = 'Complete' | 'In progress' | 'Upcoming'

type Milestone = {
  name: string
  date: string
  progress: number
  status: MilestoneStatus
}

type SiteProject = {
  id: string
  code: string
  name: string
  location: string
  stage: string
  startDate: string
  completionDate: string
  progress: number
  status: ProjectStatus
  health: 'On track' | 'Watch'
  workers: number
  machinery: number
  logs: number
  issues: number
  lastUpdate: string
  milestones: Milestone[]
}

const assignedProjects: SiteProject[] = [
  {
    id: '1',
    code: 'PRJ-001',
    name: 'Green Valley Residency',
    location: 'Gurugram, Haryana',
    stage: 'Finishing',
    startDate: '10 Jan 2026',
    completionDate: '20 Dec 2026',
    progress: 76,
    status: 'In Progress',
    health: 'On track',
    workers: 42,
    machinery: 7,
    logs: 18,
    issues: 2,
    lastUpdate: 'Today, 4:30 PM',
    milestones: [
      { name: 'Land preparation', date: 'Completed · Jan 18', progress: 100, status: 'Complete' },
      { name: 'Excavation', date: 'Completed · Feb 12', progress: 100, status: 'Complete' },
      { name: 'Foundation', date: 'Completed · Mar 28', progress: 100, status: 'Complete' },
      { name: 'Structure', date: 'Target · Jul 12', progress: 86, status: 'In progress' },
      { name: 'Finishing', date: 'Target · Nov 30', progress: 52, status: 'In progress' },
      { name: 'Handover', date: 'Target · Dec 20', progress: 0, status: 'Upcoming' },
    ],
  },
  {
    id: '2',
    code: 'PRJ-002',
    name: 'Skyline Commercial Hub',
    location: 'Delhi, India',
    stage: 'Structure',
    startDate: '01 Feb 2026',
    completionDate: '15 Mar 2027',
    progress: 52,
    status: 'In Progress',
    health: 'Watch',
    workers: 31,
    machinery: 5,
    logs: 12,
    issues: 4,
    lastUpdate: 'Today, 2:15 PM',
    milestones: [
      { name: 'Land preparation', date: 'Completed · Feb 08', progress: 100, status: 'Complete' },
      { name: 'Excavation', date: 'Completed · Mar 02', progress: 100, status: 'Complete' },
      { name: 'Foundation', date: 'Completed · Apr 18', progress: 100, status: 'Complete' },
      { name: 'Structure', date: 'Target · Sep 22', progress: 62, status: 'In progress' },
      { name: 'Finishing', date: 'Target · Jan 18', progress: 8, status: 'Upcoming' },
      { name: 'Handover', date: 'Target · Mar 15', progress: 0, status: 'Upcoming' },
    ],
  },
]

const activity = [
  { title: 'Daily progress submitted', detail: 'Structure level 04 slab poured', time: 'Today, 4:30 PM', icon: ClipboardList, tone: 'amber' },
  { title: 'Labour attendance updated', detail: 'Masonry crew added 4 workers to site', time: 'Today, 9:15 AM', icon: Users, tone: 'green' },
  { title: 'Machinery usage recorded', detail: 'Concrete mixer · 6.5 hours · Foundation zone', time: 'Yesterday, 5:45 PM', icon: Truck, tone: 'violet' },
  { title: 'Material update received', detail: 'Steel delivery checked against challan', time: 'Yesterday, 3:20 PM', icon: Construction, tone: 'amber' },
  { title: 'Site issue reported', detail: 'Material delivery delayed by one day', time: 'Yesterday, 2:10 PM', icon: AlertTriangle, tone: 'red' },
]

function goTo(path: string) {
  window.location.href = path
}

function SiteBlueprint({ project }: { project: SiteProject }) {
  return (
    <div className="relative min-h-[245px] overflow-hidden rounded-2xl border border-white/10 bg-[#151a1d]">
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(rgba(242,166,90,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(242,166,90,.5) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_15%,rgba(242,166,90,.28),transparent_35%)]" />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 640 300" preserveAspectRatio="none" aria-hidden="true">
        <path d="M75 270V142l92-74 90 74v128M290 270V83l103-53 102 53v187M525 270V125l61-42 61 42v145M40 270h575" fill="none" stroke="#F2A65A" strokeWidth="2" opacity=".8" />
        <path d="M116 270V174h103v96M337 270V115h107v155M548 270v-98h53v98" fill="none" stroke="#FFC078" strokeWidth="1.5" opacity=".7" />
        <path d="M25 270h590" stroke="rgba(255,255,255,.35)" strokeWidth="1" />
      </svg>
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/85 via-black/25 to-transparent p-5 pt-20">
        <div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#F2A65A]">Live site view · {project.code}</p><p className="mt-1 text-sm font-medium text-white/80">{project.stage} operations</p></div>
        <span className="rounded-full border border-white/15 bg-black/25 px-2.5 py-1 text-[10px] text-white/60">Sample visualization</span>
      </div>
    </div>
  )
}

function ProgressTrend({ project }: { project: SiteProject }) {
  const end = project.progress
  const points = `M0 124 C45 119 58 110 105 112 S160 ${project.progress > 60 ? 80 : 95} 215 ${project.progress > 60 ? 85 : 103} S270 74 320 ${project.progress > 60 ? 62 : 78} S375 52 420 ${project.progress > 60 ? 42 : 61} S468 35 500 ${Math.max(18, 140 - end)}`
  return (
    <div className="relative h-48">
      <div className="absolute inset-0 flex flex-col justify-between text-[10px] text-[var(--dashboard-subtle)]">{[100, 75, 50, 25, 0].map((value) => <div className="flex items-center gap-3" key={value}><span className="w-7 text-right">{value}</span><div className="h-px flex-1 bg-white/[0.07]" /></div>)}</div>
      <svg className="absolute bottom-5 left-10 right-0 h-40 w-[calc(100%-2.5rem)]" viewBox="0 0 500 150" preserveAspectRatio="none" role="img" aria-label={`${project.name} progress trend`}>
        <defs><linearGradient id={`pmProgress-${project.id}`} x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#F2A65A" stopOpacity=".3" /><stop offset="100%" stopColor="#F2A65A" stopOpacity="0" /></linearGradient></defs>
        <path d={`${points} L500 150 L0 150 Z`} fill={`url(#pmProgress-${project.id})`} />
        <path d={points} fill="none" stroke="#F2A65A" strokeWidth="3" vectorEffect="non-scaling-stroke" />
        <circle cx="500" cy={Math.max(18, 140 - end)} r="5" fill="#FFC078" />
      </svg>
      <div className="absolute bottom-0 left-10 right-0 flex justify-between text-[10px] text-[var(--dashboard-subtle)]"><span>Week 1</span><span>Week 2</span><span>Week 3</span><span>Week 4</span><span>Now</span></div>
    </div>
  )
}

function MilestoneRail({ milestones }: { milestones: Milestone[] }) {
  return (
    <div className="relative mt-7 space-y-5">
      <div className="absolute bottom-5 left-[13px] top-5 w-px bg-white/10" />
      {milestones.map((milestone) => (
        <div className="relative flex gap-3" key={milestone.name}>
          <div className={`z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${milestone.status === 'Complete' ? 'border-[#84C59A]/40 bg-[#84C59A]/15 text-[#84C59A]' : milestone.status === 'In progress' ? 'border-[#F2A65A]/50 bg-[#F2A65A]/15 text-[#F2A65A]' : 'border-white/10 bg-[#171b1f] text-white/30'}`}>
            {milestone.status === 'Complete' ? <CheckCircle2 size={14} /> : <span className="h-2 w-2 rounded-full bg-current" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3"><p className="text-sm font-medium text-[var(--dashboard-ink)]">{milestone.name}</p><span className="text-xs text-[var(--dashboard-muted)]">{milestone.progress}%</span></div>
            <p className="mt-1 text-[10px] text-[var(--dashboard-subtle)]">{milestone.date} · {milestone.status}</p>
            <div className="mt-2"><ProgressBar value={milestone.progress} color={milestone.status === 'Complete' ? 'green' : 'amber'} /></div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function ProjectManagerDashboardPage() {
  const [selectedId, setSelectedId] = useState(assignedProjects[0].id)
  const [notice, setNotice] = useState('')
  const project = useMemo(() => assignedProjects.find((item) => item.id === selectedId) ?? assignedProjects[0], [selectedId])
  const today = new Intl.DateTimeFormat('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date())

  const quickAction = (label: string, path: string) => {
    setNotice(`${label} ready with sample data`)
    window.setTimeout(() => goTo(path), 350)
  }

  return (
    <AppShell
      currentPath="/app/pm/dashboard"
      projectSelector={{
        value: project.code,
        options: assignedProjects.map(({ code: id, name }) => ({ id, name })),
        onChange: (code) => {
          const next = assignedProjects.find((item) => item.code === code)
          if (next) setSelectedId(next.id)
        },
      }}
    >
      <div className="mx-auto max-w-[1680px] space-y-7 p-5 sm:p-7 lg:p-8">
        <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--dashboard-amber)]">{today}</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[var(--dashboard-ink)] sm:text-5xl">Good morning, <span className="text-white/45">Project Manager.</span></h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--dashboard-muted)]">Your site operations cockpit for keeping crews coordinated, milestones visible, and every day moving forward.</p>
          </div>
          <button type="button" onClick={() => quickAction('Daily site log', `/projects/${project.code}/logs/new`)} className="dashboard-button dashboard-button-primary"><Plus size={16} /> Add daily site log</button>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
          <DashboardCard tone="featured" className="p-5 sm:p-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
              <div className="flex flex-col justify-between">
                <div><div className="flex flex-wrap items-center gap-2"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--dashboard-amber)]">Assigned project · {project.code}</p><StatusPill tone={project.health === 'On track' ? 'green' : 'amber'}>{project.health}</StatusPill></div><h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[var(--dashboard-ink)]">{project.name}</h2><p className="mt-2 flex items-center gap-1.5 text-sm text-[var(--dashboard-muted)]"><MapPin size={15} />{project.location}</p></div>
                <div className="mt-8"><div className="flex items-end justify-between"><div><p className="text-5xl font-semibold tracking-[-0.06em] text-[var(--dashboard-ink)]">{project.progress}%</p><p className="mt-1 text-xs text-[var(--dashboard-muted)]">overall project completion</p></div><StatusPill tone={project.status === 'Delayed' ? 'red' : 'amber'}>{project.status}</StatusPill></div><div className="mt-5"><ProgressBar value={project.progress} /><div className="mt-2 flex justify-between text-[10px] text-[var(--dashboard-muted)]"><span>Current stage · {project.stage}</span><span>Target · {project.completionDate}</span></div></div></div>
              </div>
              <SiteBlueprint project={project} />
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/10 pt-5 sm:grid-cols-4"><div><p className="dashboard-eyebrow">Current stage</p><p className="mt-1 text-sm font-semibold text-[var(--dashboard-ink)]">{project.stage}</p></div><div><p className="dashboard-eyebrow">Project started</p><p className="mt-1 text-sm font-semibold text-[var(--dashboard-ink)]">{project.startDate}</p></div><div><p className="dashboard-eyebrow">Expected completion</p><p className="mt-1 text-sm font-semibold text-[var(--dashboard-ink)]">{project.completionDate}</p></div><div><p className="dashboard-eyebrow">Last site update</p><p className="mt-1 text-sm font-semibold text-[var(--dashboard-ink)]">{project.lastUpdate}</p></div></div>
          </DashboardCard>
          <DashboardCard className="p-5 sm:p-6"><SectionTitle title="Project pulse" description="Operational health for the selected site." /><div className="mt-6 space-y-5"><div><div className="flex justify-between text-xs"><span className="text-[var(--dashboard-muted)]">Weekly progress</span><span className="font-semibold text-[#84C59A]">+4.2%</span></div><div className="mt-2 h-2 rounded-full bg-white/[0.07]"><div className="h-full w-[68%] rounded-full bg-[#84C59A]" /></div></div><div><div className="flex justify-between text-xs"><span className="text-[var(--dashboard-muted)]">Schedule confidence</span><span className="font-semibold text-[var(--dashboard-amber)]">{project.health === 'On track' ? '88%' : '64%'}</span></div><div className="mt-2 h-2 rounded-full bg-white/[0.07]"><div className="h-full rounded-full bg-[#F2A65A]" style={{ width: project.health === 'On track' ? '88%' : '64%' }} /></div></div><div className="rounded-xl border border-white/10 bg-white/[0.03] p-4"><div className="flex items-start gap-3"><ShieldAlert size={18} className="mt-0.5 text-[#F2A65A]" /><div><p className="text-sm font-semibold text-[var(--dashboard-ink)]">Field note</p><p className="mt-1 text-xs leading-5 text-[var(--dashboard-muted)]">{project.health === 'On track' ? 'Crew output is ahead of the weekly baseline.' : 'Review material deliveries before the next structure pour.'}</p></div></div></div><button type="button" onClick={() => quickAction('Progress history', `/projects/${project.code}/progress`)} className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--dashboard-amber)]">Open progress history <ArrowUpRight size={13} /></button></div></DashboardCard>
        </section>

        <section><div className="mb-4"><p className="dashboard-eyebrow">Today at site</p><h2 className="mt-1 text-xl font-semibold text-[var(--dashboard-ink)]">The field, at a glance</h2></div><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"><StatCard label="Workers present today" value={String(project.workers)} note="Checked in across active zones" icon={HardHat} /><StatCard label="Machinery in use" value={String(project.machinery).padStart(2, '0')} note="Active across site zones" icon={Wrench} accent="violet" /><StatCard label="Daily logs submitted" value={String(project.logs)} note="Submitted for this project" icon={ClipboardList} accent="green" /><StatCard label="Open site issues" value={String(project.issues).padStart(2, '0')} note="Require field follow-up" icon={AlertTriangle} accent="red" /></div></section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.25fr_0.75fr]">
          <DashboardCard className="p-5 sm:p-6"><SectionTitle title="Project progress" description="Weekly completion trend from sample site updates." action={<StatusPill tone="green">+4.2% this week</StatusPill>} /><div className="mt-4 flex items-end gap-4"><p className="text-4xl font-semibold tracking-[-0.05em] text-[var(--dashboard-ink)]">{project.progress}%</p><p className="pb-1 text-xs text-[var(--dashboard-muted)]">current completion<br /><span className="font-semibold text-[#84C59A]">{Math.max(0, project.progress - 4)}%</span> previous update</p></div><div className="mt-5"><ProgressTrend project={project} /></div><div className="mt-5 grid gap-3 border-t border-white/10 pt-4 sm:grid-cols-3">{['Structure level 04 slab poured', 'Foundation inspection approved', 'Masonry work started in Tower A'].map((item, index) => <div className="flex gap-2 text-xs" key={item}><CheckCircle2 size={15} className="shrink-0 text-[#84C59A]" /><span className="text-[var(--dashboard-muted)]">{item}<span className="mt-1 block text-[10px] text-[var(--dashboard-subtle)]">{index === 0 ? 'Today' : `${index + 1} days ago`}</span></span></div>)}</div></DashboardCard>
          <DashboardCard className="p-5 sm:p-6"><SectionTitle title="Construction milestones" description="Sample schedule · not saved backend data." /><MilestoneRail milestones={project.milestones} /></DashboardCard>
        </section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_0.85fr]">
          <DashboardCard><SectionTitle title="Site activity timeline" description={`Latest field signals from ${project.name}.`} action={<Clock3 size={17} className="text-[var(--dashboard-amber)]" />} /><div className="divide-y divide-white/[0.08]">{activity.map(({ title, detail, time, icon: Icon, tone }) => <div className="flex gap-3 px-5 py-4" key={title}><span className={`dashboard-icon dashboard-icon-${tone}`}><Icon size={16} /></span><div className="min-w-0 flex-1"><p className="text-sm font-medium text-[var(--dashboard-ink)]">{title}</p><p className="mt-1 text-xs text-[var(--dashboard-muted)]">{detail}</p><p className="mt-1 text-[10px] text-[var(--dashboard-subtle)]">{time}</p></div></div>)}</div></DashboardCard>
          <DashboardCard><SectionTitle title="Priority panel" description="Items needing attention from the field team." action={<AlertTriangle size={17} className="text-[#ED8B78]" />} /><div className="divide-y divide-white/[0.08]">{[['Missing daily log', 'Tomorrow’s log is not yet submitted', ClipboardList, `/projects/${project.code}/logs/new`], ['Upcoming deadline', `${project.stage} review due in 12 days`, CalendarClock, `/projects/${project.code}/progress`], ['Open site issue', `${project.issues} material and safety items need review`, ShieldAlert, '/app/daily-logs'], ['Delayed activity', 'Material delivery is one day behind', Truck, '/app/stock-in']].map(([title, detail, Icon, path]) => <button type="button" onClick={() => goTo(path as string)} className="flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-white/[0.03]" key={title as string}><span className="dashboard-icon dashboard-icon-red"><Icon size={16} /></span><span className="min-w-0 flex-1"><span className="block text-sm font-medium text-[var(--dashboard-ink)]">{title as string}</span><span className="mt-1 block text-xs text-[var(--dashboard-muted)]">{detail as string}</span></span><ArrowUpRight size={15} className="text-[var(--dashboard-subtle)]" /></button>)}</div></DashboardCard>
        </section>

        <section><div className="mb-4"><p className="dashboard-eyebrow">Site shortcuts</p><h2 className="mt-1 text-xl font-semibold text-[var(--dashboard-ink)]">Coordinate the next move</h2></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{[['Add daily log', Plus, `/projects/${project.code}/logs/new`], ['View daily logs', ClipboardList, `/projects/${project.code}/logs`], ['Update progress', BarChart3, `/projects/${project.code}/progress`], ['View labour', Users, '/app/daily-logs'], ['View machinery', Wrench, '/app/daily-logs']].map(([label, Icon, path]) => <button type="button" onClick={() => quickAction(label as string, path as string)} className="dashboard-card group p-4 text-left transition hover:-translate-y-0.5 hover:border-[#F2A65A]/40" key={label as string}><div className="flex items-center justify-between"><span className="dashboard-icon dashboard-icon-amber"><Icon size={17} /></span><ArrowUpRight size={15} className="text-[var(--dashboard-subtle)] group-hover:text-[var(--dashboard-amber)]" /></div><p className="mt-4 text-sm font-medium text-[var(--dashboard-ink)]">{label as string}</p></button>)}</div></section>
      </div>
      {notice && <button type="button" onClick={() => setNotice('')} className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-[#F2A65A]/30 bg-[#171b1f] px-4 py-3 text-xs text-white shadow-2xl"><CheckCircle2 size={15} className="text-[#84C59A]" />{notice}</button>}
    </AppShell>
  )
}
