import {useMemo, useState, useEffect} from 'react'
import {
  FolderKanban, Plus, Search, Pencil, Trash2, X,
  MapPin, CalendarDays, Users, Wallet
} from 'lucide-react'
import { AppShell } from '../../app-shell/components/AppShell'
import { getCurrentRole, getCurrentUser } from '../../authentication/utils/permissions'

type Project = {
  id: number
  code: string
  name: string
  location: string
  manager: string
  budget: string
  startDate: string
  endDate: string
  status: 'Planning' | 'In Progress' | 'Completed' | 'On Hold'
}

const initialProjects: Project[] = [
  { id: 1, code: 'PRJ-001', name: 'Green Valley Residency', location: 'Gurugram, Haryana', manager: 'Aarav Sharma', budget: '₹2.5 Cr', startDate: '2026-01-10', endDate: '2026-12-20', status: 'In Progress' },
  { id: 2, code: 'PRJ-002', name: 'Skyline Commercial Hub', location: 'Delhi, India', manager: 'Priya Mehta', budget: '₹4.2 Cr', startDate: '2026-02-01', endDate: '2027-03-15', status: 'In Progress' },
  { id: 3, code: 'PRJ-003', name: 'Riverside Heights', location: 'Noida, UP', manager: 'Rohan Verma', budget: '₹1.8 Cr', startDate: '2025-06-01', endDate: '2026-08-30', status: 'Completed' },
  { id: 4, code: 'PRJ-004', name: 'Urban Square', location: 'Jaipur, Rajasthan', manager: 'Neha Kapoor', budget: '₹3.1 Cr', startDate: '2026-09-01', endDate: '2027-10-30', status: 'Planning' },
]

const emptyForm = {
  name: '', location: '', manager: '', budget: '',
  startDate: '', endDate: '', status: 'Planning' as Project['status'],
}

const statusStyles: Record<Project['status'], string> = {
  'Planning': 'bg-[#F1EAF6] text-[#806B96]',
  'In Progress': 'bg-[#F5EDE1] text-[#9A7950]',
  'Completed': 'bg-[#E8EFE5] text-[#617858]',
  'On Hold': 'bg-[#F8ECEA] text-[#9B625A]',
}

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem('forgeos_projects')
      return saved ? JSON.parse(saved) as Project[] : initialProjects
    } catch {
      return initialProjects
    }
  })

  useEffect(() => {
    localStorage.setItem('forgeos_projects', JSON.stringify(projects))
  }, [projects])

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Project | null>(null)
  const [form, setForm] = useState(emptyForm)

  const currentUser = getCurrentUser()
  const currentRole = getCurrentRole()
  const visibleProjects = currentRole === 'Admin'
    ? projects
    : projects.filter((project) =>
        String(project.manager).trim().toLowerCase() ===
        String(currentUser?.name ?? '').trim().toLowerCase()
      )

  const filtered = useMemo(() => visibleProjects.filter((project) => {
    const query = search.toLowerCase()
    const matchesSearch = `${project.name} ${project.code} ${project.location} ${project.manager}`.toLowerCase().includes(query)
    return matchesSearch && (filter === 'All' || project.status === filter)
  }), [projects, search, filter])

  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  const openEdit = (project: Project) => {
    setEditing(project)
    setForm({
      name: project.name,
      location: project.location,
      manager: project.manager,
      budget: project.budget,
      startDate: project.startDate,
      endDate: project.endDate,
      status: project.status,
    })
    setShowForm(true)
  }

  const saveProject = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      window.alert('Project end date cannot be earlier than its start date.')
      return
    }

    const duplicateName = projects.some((project) =>
      project.name.trim().toLowerCase() === form.name.trim().toLowerCase() &&
      project.id !== editing?.id
    )
    if (duplicateName) {
      window.alert('A project with this name already exists.')
      return
    }

    if (!form.name.trim() || !form.location.trim() || !form.manager.trim()) {
      window.alert('Please complete all required project details.')
      return
    }
    if (editing) {
      setProjects((current) => current.map((p) =>
        p.id === editing.id ? { ...p, ...form } : p
      ))
    } else {
      setProjects((current) => [...current, {
        id: Date.now(),
        code: `PRJ-${String(current.length + 1).padStart(3, '0')}`,
        ...form,
      }])
    }
    setShowForm(false)
  }

  const deleteProject = (id: number) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      setProjects((current) => current.filter((p) => p.id !== id))
    }
  }

  const stats = [
    { label: 'Total Projects', value: visibleProjects.length, icon: FolderKanban },
    { label: 'In Progress', value: visibleProjects.filter((p) => p.status === 'In Progress').length, icon: CalendarDays },
    { label: 'Completed', value: visibleProjects.filter((p) => p.status === 'Completed').length, icon: Users },
    { label: 'On Hold', value: visibleProjects.filter((p) => p.status === 'On Hold').length, icon: Wallet },
  ]

  return (
    <AppShell currentPath="/app/projects">
      <div className="mx-auto max-w-[1600px] space-y-7 p-5 sm:p-7 lg:p-8">
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm text-[#8E827A]">Workspace / Projects</p>
            <h1 className="mt-1 text-2xl font-semibold text-[#323232] sm:text-3xl">Project Management</h1>
            <p className="mt-2 text-sm text-[#8E827A]">Create, organize and monitor your construction projects.</p>
          </div>
          {currentRole === 'Admin' && <button onClick={openAdd} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#323232] px-5 py-3 text-sm font-medium text-white hover:bg-[#1E1E1E]">
            <Plus size={17} /> Create Project
          </button>}
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="rounded-2xl border border-[#C8BCB4]/70 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#8E827A]">{stat.label}</p>
                    <h2 className="mt-3 text-3xl font-semibold text-[#323232]">{stat.value}</h2>
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
              <h2 className="font-semibold text-[#323232]">All Projects</h2>
              <p className="mt-1 text-xs text-[#8E827A]">{filtered.length} projects found</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex items-center gap-2 rounded-xl border border-[#C8BCB4] px-3 py-2">
                <Search size={17} className="text-[#8E827A]" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search projects..." className="w-full bg-transparent text-sm outline-none sm:w-48" />
              </div>
              <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-xl border border-[#C8BCB4] bg-white px-3 py-2 text-sm text-[#595552] outline-none">
                <option>All</option>
                <option>Planning</option>
                <option>In Progress</option>
                <option>Completed</option>
                <option>On Hold</option>
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
                {filtered.map((project) => (
                  <tr key={project.id} className="hover:bg-[#F7F3EE]/60">
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-[#323232]">{project.name}</p>
                      <p className="mt-1 text-xs text-[#8E827A]">{project.code}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-[#595552]"><span className="flex items-center gap-1"><MapPin size={14} />{project.location}</span></td>
                    <td className="px-5 py-4">
                      {currentRole === 'Admin' ? (
<select
                        value={project.manager}
                        onChange={(e) => setProjects(current => current.map(p =>
                          p.id === project.id ? { ...p, manager: e.target.value } : p
                        ))}
                        className="max-w-[170px] rounded-lg border border-[#C8BCB4] bg-white px-2 py-2 text-sm text-[#595552] outline-none"
                        aria-label={`Reassign manager for ${project.name}`}
                      >
                        <option value="Aarav Sharma">Aarav Sharma</option>
                        <option value="Priya Mehta">Priya Mehta</option>
                        <option value="Rohan Verma">Rohan Verma</option>
                        <option value="Neha Kapoor">Neha Kapoor</option>
                      </select>

                      ) : (

                        <span className="text-sm text-[#595552]">{project.manager}</span>

                      )}
                    </td>
                    <td className="px-5 py-4 text-xs text-[#595552]">{project.startDate} – {project.endDate}</td>
                    <td className="px-5 py-4 text-sm text-[#595552]">{project.budget}</td>
                    <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[project.status]}`}>{project.status}</span></td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { window.location.href = `/app/projects/${project.id}` }} title="View project details" className="rounded-lg p-2 text-[#595552] hover:bg-[#F7F3EE]"><span className="text-xs font-semibold">View</span></button>
                        {currentRole === 'Admin' && <button onClick={() => openEdit(project)} title="Edit project" className="rounded-lg p-2 text-[#595552] hover:bg-[#F7F3EE]"><Pencil size={16} /></button>}
                        {currentRole === 'Admin' && <button onClick={() => deleteProject(project.id)} title="Delete project" className="rounded-lg p-2 text-[#9B625A] hover:bg-[#F8ECEA]"><Trash2 size={16} /></button>}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-[#8E827A]">No projects found.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
          <form onSubmit={saveProject} className="my-6 w-full max-w-2xl space-y-5 rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[#323232]">{editing ? 'Edit Project' : 'Create New Project'}</h2>
                <p className="mt-1 text-sm text-[#8E827A]">Enter the project details below.</p>
              </div>
              <button type="button" onClick={() => setShowForm(false)} className="rounded-lg p-2 text-[#8E827A] hover:bg-[#F7F3EE]"><X size={19} /></button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-[#595552]">Project Name
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Enter project name" className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal outline-none" />
              </label>
              <label className="text-sm font-medium text-[#595552]">Location
                <input required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="City, State" className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal outline-none" />
              </label>
              <label className="text-sm font-medium text-[#595552]">Assign Project Manager
                <select required value={form.manager} onChange={(e) => setForm({ ...form, manager: e.target.value })} className="mt-2 w-full rounded-xl border border-[#C8BCB4] bg-white px-4 py-3 font-normal outline-none">
                  <option value="">Select a Project Manager</option>
                  <option value="Aarav Sharma">Aarav Sharma</option>
                  <option value="Priya Mehta">Priya Mehta</option>
                  <option value="Rohan Verma">Rohan Verma</option>
                  <option value="Neha Kapoor">Neha Kapoor</option>
                </select>
              </label>
              <label className="text-sm font-medium text-[#595552]">Estimated Budget
                <input required value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder="e.g. ₹2.5 Cr" className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal outline-none" />
              </label>
              <label className="text-sm font-medium text-[#595552]">Start Date
                <input required type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal outline-none" />
              </label>
              <label className="text-sm font-medium text-[#595552]">End Date
                <input required type="date" min={form.startDate || undefined} value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal outline-none" />
              </label>
              <label className="text-sm font-medium text-[#595552] sm:col-span-2">Project Status
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Project['status'] })} className="mt-2 w-full rounded-xl border border-[#C8BCB4] bg-white px-4 py-3 font-normal outline-none">
                  <option>Planning</option><option>In Progress</option><option>Completed</option><option>On Hold</option>
                </select>
              </label>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-[#C8BCB4] px-4 py-2.5 text-sm text-[#595552]">Cancel</button>
              <button type="submit" className="rounded-xl bg-[#323232] px-5 py-2.5 text-sm font-medium text-white">{editing ? 'Save Changes' : 'Create Project'}</button>
            </div>
          </form>
        </div>
      )}
    </AppShell>
  )
}
