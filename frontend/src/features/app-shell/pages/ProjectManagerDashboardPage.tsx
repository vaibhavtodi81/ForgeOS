import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Clock3,
  Construction,
  HardHat,
  MapPin,
  Plus,
  Truck,
  Users,
  Wrench,
} from 'lucide-react'
import { useState } from 'react'
import { AppShell } from '../components/AppShell'

type AssignedProject = {
  id: string
  name: string
  location: string
  stage: string
  startDate: string
  completionDate: string
  progress: number
  status: 'In Progress' | 'Delayed'
}

const assignedProjects: AssignedProject[] = [
  { id: 'GVR-001', name: 'Green Valley Residency', location: 'Gurugram, Haryana', stage: 'Finishing', startDate: '10 Jan 2026', completionDate: '20 Dec 2026', progress: 76, status: 'In Progress' },
  { id: 'SHV-002', name: 'Skyline Commercial Hub', location: 'Delhi, India', stage: 'Structure', startDate: '01 Feb 2026', completionDate: '15 Mar 2027', progress: 52, status: 'In Progress' },
]

const milestones = [
  { name: 'Land Preparation', date: 'Completed · Jan 18', progress: 100, status: 'Complete' },
  { name: 'Excavation', date: 'Completed · Feb 12', progress: 100, status: 'Complete' },
  { name: 'Foundation', date: 'Completed · Mar 28', progress: 100, status: 'Complete' },
  { name: 'Structure', date: 'Target · Jul 12', progress: 68, status: 'In progress' },
  { name: 'Finishing', date: 'Target · Nov 30', progress: 22, status: 'Upcoming' },
  { name: 'Handover', date: 'Target · Dec 20', progress: 0, status: 'Upcoming' },
]

const activity = [
  { title: 'Daily site log submitted', detail: '12 workers · Clear weather · 8 hours logged', time: 'Today, 4:30 PM', icon: ClipboardList, tone: 'bg-[#F3E9E1] text-[#9A5E3A]' },
  { title: 'Labour attendance updated', detail: 'Masonry crew added 4 workers to site', time: 'Today, 9:15 AM', icon: Users, tone: 'bg-[#E8EFE5] text-[#617858]' },
  { title: 'Concrete mixer in use', detail: 'Mixer truck · 6.5 hours · Foundation zone', time: 'Yesterday, 5:45 PM', icon: Truck, tone: 'bg-[#F5EDE1] text-[#9A7950]' },
  { title: 'Site issue reported', detail: 'Material delivery delayed by one day', time: 'Yesterday, 2:10 PM', icon: AlertTriangle, tone: 'bg-[#F8ECEA] text-[#9B625A]' },
]

function goTo(path: string) {
  window.location.href = path
}

function Stat({ label, value, note, icon: Icon, tone }: { label: string; value: string; note: string; icon: typeof Users; tone: string }) {
  return <div className="rounded-2xl border border-[#C8BCB4]/70 bg-white p-5 shadow-sm"><div className="flex items-start justify-between"><div><p className="text-sm text-[#8E827A]">{label}</p><p className="mt-3 text-3xl font-semibold text-[#323232]">{value}</p></div><div className={`rounded-xl p-3 ${tone}`}><Icon size={20} /></div></div><p className="mt-4 text-xs text-[#8E827A]">{note}</p></div>
}

export function ProjectManagerDashboardPage() {
  const [selectedId, setSelectedId] = useState(assignedProjects[0].id)
  const project = assignedProjects.find((item) => item.id === selectedId) ?? assignedProjects[0]
  const today = new Intl.DateTimeFormat('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date())

  return <AppShell
    currentPath="/app/pm/dashboard"
    projectSelector={{
      value: selectedId,
      options: assignedProjects,
      onChange: setSelectedId,
    }}
  >
    <div className="mx-auto max-w-[1500px] space-y-7 p-5 sm:p-7 lg:p-8">
      <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div><p className="text-sm font-medium text-[#8E827A]">{today}</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#323232] sm:text-3xl">Welcome, Project Manager</h1><p className="mt-2 text-sm text-[#8E827A]">Keep today’s site operations moving and your project milestones on track.</p></div>
        <div className="flex flex-wrap gap-3">
          <label className="relative flex items-center rounded-xl border border-[#C8BCB4] bg-white px-3 text-sm text-[#595552]"><Construction size={16} className="mr-2 text-[#9A5E3A]" /><select aria-label="Assigned project" value={selectedId} onChange={(event) => setSelectedId(event.target.value)} className="appearance-none bg-transparent py-2.5 pr-7 outline-none">{assignedProjects.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select><ChevronDown size={15} className="pointer-events-none absolute right-3 text-[#8E827A]" /></label>
          <button type="button" onClick={() => goTo(`/projects/${project.id}/logs/new`)} className="inline-flex items-center gap-2 rounded-xl bg-[#323232] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1E1E1E]"><Plus size={16} /> Add Daily Site Log</button>
        </div>
      </section>

      <section className="rounded-2xl border border-[#C8BCB4]/70 bg-[#E8DCD4] p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9A5E3A]">Assigned project · {project.id}</p><h2 className="mt-2 text-2xl font-semibold text-[#323232]">{project.name}</h2><p className="mt-2 flex items-center gap-1.5 text-sm text-[#595552]"><MapPin size={15} />{project.location}</p></div><span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#F5EDE1] px-3 py-1.5 text-xs font-semibold text-[#9A7950]"><span className="h-1.5 w-1.5 rounded-full bg-[#B87A4F]" />{project.status}</span></div>
        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-[#C8BCB4]/70 pt-5 sm:grid-cols-4"><div><p className="text-xs text-[#8E827A]">Current stage</p><p className="mt-1 text-sm font-semibold text-[#323232]">{project.stage}</p></div><div><p className="text-xs text-[#8E827A]">Project start date</p><p className="mt-1 text-sm font-semibold text-[#323232]">{project.startDate}</p></div><div><p className="text-xs text-[#8E827A]">Expected completion</p><p className="mt-1 text-sm font-semibold text-[#323232]">{project.completionDate}</p></div><div><p className="text-xs text-[#8E827A]">Overall completion</p><p className="mt-1 text-sm font-semibold text-[#9A5E3A]">{project.progress}%</p></div></div>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/70"><div className="h-full rounded-full bg-[#B87A4F]" style={{ width: `${project.progress}%` }} /></div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"><Stat label="Today's labour" value="42" note="Workers checked in" icon={HardHat} tone="bg-[#F3E9E1] text-[#9A5E3A]" /><Stat label="Machinery in use" value="07" note="Across 3 active zones" icon={Wrench} tone="bg-[#F5EDE1] text-[#9A7950]" /><Stat label="Daily logs submitted" value="18" note="This project to date" icon={ClipboardList} tone="bg-[#E8EFE5] text-[#617858]" /><Stat label="Latest site activity" value="4:30 PM" note="Log submitted today" icon={Clock3} tone="bg-[#F1EAF6] text-[#806B96]" /></section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-2xl border border-[#C8BCB4]/70 bg-white p-5"><div className="flex items-start justify-between"><div><div className="flex items-center gap-2"><BarChart3 size={18} className="text-[#9A5E3A]" /><h2 className="font-semibold text-[#323232]">Progress tracking</h2></div><p className="mt-1 text-xs text-[#8E827A]">Previous progress versus current progress</p></div><span className="rounded-full bg-[#E8EFE5] px-2.5 py-1 text-[10px] font-semibold text-[#617858]">+4.2% this month</span></div><div className="mt-6 flex items-end gap-5"><p className="text-4xl font-semibold text-[#323232]">{project.progress}%</p><p className="pb-1 text-xs text-[#8E827A]">current completion<br /><span className="font-semibold text-[#617858]">71.8%</span> previous update</p></div><div className="relative mt-5 h-36"><div className="absolute inset-0 flex flex-col justify-between">{[100, 75, 50, 25, 0].map((value) => <div className="flex items-center gap-2" key={value}><span className="w-6 text-right text-[10px] text-[#A59A93]">{value}</span><div className="h-px flex-1 bg-[#E8DCD4]" /></div>)}</div><svg className="absolute bottom-3 left-8 right-1 h-32 w-[calc(100%-2.25rem)]" viewBox="0 0 500 130" preserveAspectRatio="none" role="img" aria-label="Progress history chart"><path d="M0 112 C55 108 70 98 115 100 S170 76 220 82 S270 66 320 55 S375 49 420 32 S470 28 500 18" fill="none" stroke="#B87A4F" strokeWidth="3" vectorEffect="non-scaling-stroke" /><circle cx="500" cy="18" r="5" fill="#B87A4F" /></svg><div className="absolute bottom-0 left-8 right-0 flex justify-between text-[10px] text-[#A59A93]"><span>Jan</span><span>Mar</span><span>May</span><span>Jul</span><span>Sep</span><span>Nov</span></div></div><div className="mt-5 space-y-3 border-t border-[#E8DCD4] pt-4">{['Structure level 04 slab poured', 'Foundation inspection approved', 'Masonry work started in Tower A'].map((item, index) => <div className="flex items-center gap-3 text-sm" key={item}><CheckCircle2 size={16} className="text-[#71866A]" /><span className="flex-1 text-[#595552]">{item}</span><span className="text-[10px] text-[#A59A93]">{index === 0 ? 'Today' : `${index + 1} days ago`}</span></div>)}</div></div>
        <div className="rounded-2xl border border-[#C8BCB4]/70 bg-white p-5"><h2 className="font-semibold text-[#323232]">Project milestones</h2><p className="mt-1 text-xs text-[#8E827A]">Sample schedule data · update via progress history</p><div className="mt-6 space-y-5">{milestones.map((milestone) => <div key={milestone.name}><div className="flex items-center gap-3"><div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${milestone.status === 'Complete' ? 'bg-[#E8EFE5] text-[#617858]' : milestone.status === 'In progress' ? 'bg-[#F5EDE1] text-[#9A7950]' : 'bg-[#F7F3EE] text-[#A59A93]'}`}>{milestone.status === 'Complete' ? <CheckCircle2 size={15} /> : <span className="h-2 w-2 rounded-full bg-current" />}</div><div className="min-w-0 flex-1"><div className="flex justify-between gap-2"><p className="text-sm font-medium text-[#323232]">{milestone.name}</p><span className="text-xs text-[#8E827A]">{milestone.progress}%</span></div><p className="mt-0.5 text-[10px] text-[#A59A93]">{milestone.date}</p></div></div><div className="ml-10 mt-2 h-1 overflow-hidden rounded-full bg-[#E8DCD4]"><div className="h-full rounded-full bg-[#B87A4F]" style={{ width: `${milestone.progress}%` }} /></div></div>)}</div></div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-2xl border border-[#C8BCB4]/70 bg-white"><div className="border-b border-[#E8DCD4] px-5 py-5"><h2 className="font-semibold text-[#323232]">Recent site activity</h2><p className="mt-1 text-xs text-[#8E827A]">Daily logs, attendance, machinery and issues from site</p></div><div className="divide-y divide-[#E8DCD4]">{activity.map(({ title, detail, time, icon: Icon, tone }) => <div className="flex gap-3 px-5 py-4" key={title}><div className={`h-9 w-9 shrink-0 rounded-xl p-2 ${tone}`}><Icon size={17} /></div><div className="min-w-0 flex-1"><p className="text-sm font-medium text-[#323232]">{title}</p><p className="mt-1 text-xs text-[#8E827A]">{detail}</p><p className="mt-1 text-[10px] text-[#A59A93]">{time}</p></div></div>)}</div></div>
        <div className="rounded-2xl border border-[#C8BCB4]/70 bg-white"><div className="border-b border-[#E8DCD4] px-5 py-5"><h2 className="font-semibold text-[#323232]">Site alerts</h2><p className="mt-1 text-xs text-[#8E827A]">Items needing action from the field team</p></div><div className="divide-y divide-[#E8DCD4]">{[['Missing daily site log', 'Tomorrow’s log is not yet scheduled', ClipboardList, '/projects/GVR-001/logs/new'], ['Delayed activity', 'Material delivery is one day behind', Clock3, '/app/progress-history'], ['Reported site issue', 'Review the material access issue', AlertTriangle, '/app/daily-logs'], ['Upcoming deadline', 'Structure milestone due in 12 days', CalendarDays, '/app/progress-history']].map(([title, detail, Icon, path]) => <button type="button" onClick={() => goTo(path as string)} className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-[#F7F3EE]/60" key={title as string}><div className="rounded-xl bg-[#F8ECEA] p-2.5 text-[#9B625A]"><Icon size={16} /></div><div className="min-w-0 flex-1"><p className="text-sm font-medium text-[#323232]">{title as string}</p><p className="mt-1 text-xs text-[#8E827A]">{detail as string}</p></div><ChevronRight size={16} className="text-[#A59A93]" /></button>)}</div></div>
      </section>

      <section><div className="mb-4"><h2 className="font-semibold text-[#323232]">Quick actions</h2><p className="mt-1 text-xs text-[#8E827A]">Common tools for today’s site coordination.</p></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{[['Add Daily Log', Plus, `/projects/${project.id}/logs/new`], ['View Daily Logs', ClipboardList, `/projects/${project.id}/logs`], ['View Progress History', BarChart3, `/projects/${project.id}/progress`], ['View Labour Records', Users, '/app/labour'], ['View Machinery Records', Wrench, '/app/machinery']].map(([label, Icon, path]) => <button type="button" onClick={() => goTo(path as string)} className="group rounded-2xl border border-[#C8BCB4]/70 bg-white p-4 text-left shadow-sm hover:-translate-y-0.5 hover:border-[#B87A4F]" key={label as string}><div className="flex items-center justify-between"><div className="rounded-xl bg-[#F7F3EE] p-2.5 text-[#595552] group-hover:text-[#9A5E3A]"><Icon size={18} /></div><ArrowUpRight size={15} className="text-[#A59A93]" /></div><p className="mt-4 text-sm font-medium text-[#323232]">{label as string}</p></button>)}</div></section>
    </div>
  </AppShell>
}
