import { useMemo } from 'react'
import { ArrowLeft, CalendarDays, MapPin, UserRound, Wallet } from 'lucide-react'
import { AppShell } from '../../app-shell/components/AppShell'
import { getCurrentRole, getCurrentUser } from '../../authentication/utils/permissions'

interface Project {
  id: string
  code: string
  name: string
  location: string
  manager: string
  budget: number | string
  startDate: string
  endDate: string
  status: string
}

export function ProjectDetailsPage() {
  const projectId = window.location.pathname.split('/').filter(Boolean)[2]

  const project = useMemo(() => {
    try {
      const saved = localStorage.getItem('forgeos_projects')
      const projects: Project[] = saved ? JSON.parse(saved) : []
      const found = projects.find((item) => String(item.id) === String(projectId))
      const role = getCurrentRole()
      const user = getCurrentUser()
      if (role === 'Admin') return found
      return found && String(found.manager).trim().toLowerCase() ===
        String(user?.name ?? '').trim().toLowerCase() ? found : undefined
    } catch {
      return undefined
    }
  }, [projectId])

  return (
    <AppShell currentPath="/app/projects">
      <div className="mx-auto max-w-5xl space-y-6 p-5 sm:p-7 lg:p-8">
        <button
          type="button"
          onClick={() => { window.location.href = '/app/projects' }}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#595552] hover:text-[#323232]"
        >
          <ArrowLeft size={17} /> Back to Projects
        </button>

        {!project ? (
          <section className="rounded-2xl border border-[#C8BCB4] bg-white p-8">
            <h1 className="text-xl font-semibold text-[#323232]">Project not found</h1>
            <p className="mt-2 text-sm text-[#8E827A]">
              This project is unavailable in the saved project list.
            </p>
          </section>
        ) : (
          <>
            <section className="rounded-2xl border border-[#C8BCB4]/70 bg-white p-6">
              <p className="text-sm font-medium text-[#8E827A]">{project.code}</p>
              <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-semibold text-[#323232]">{project.name}</h1>
                  <p className="mt-2 flex items-center gap-2 text-sm text-[#8E827A]">
                    <MapPin size={16} /> {project.location}
                  </p>
                </div>
                <span className="rounded-full bg-[#F7F3EE] px-3 py-1.5 text-sm font-medium text-[#595552]">
                  {project.status}
                </span>
              </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2">
              {[
                { label: 'Project Manager', value: project.manager, icon: UserRound },
                { label: 'Budget', value: String(project.budget), icon: Wallet },
                { label: 'Start Date', value: project.startDate, icon: CalendarDays },
                { label: 'End Date', value: project.endDate, icon: CalendarDays },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="rounded-2xl border border-[#C8BCB4]/70 bg-white p-5">
                  <div className="flex items-center gap-2 text-sm text-[#8E827A]">
                    <Icon size={17} /> {label}
                  </div>
                  <p className="mt-3 font-semibold text-[#323232]">{value || 'Not specified'}</p>
                </div>
              ))}
            </section>
          </>
        )}
      </div>
    </AppShell>
  )
}
