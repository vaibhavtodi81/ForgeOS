import { ChevronDown, MapPin } from 'lucide-react'
import { useProjects } from '../../projects/useProjects'

export function ProjectSelector() {
  const { projects, selectedProjectId, selectedProject, isLoading, error, selectProject, retry } = useProjects()

  return (
    <div className="flex min-w-0 items-center gap-2">
      <label className="relative flex min-w-0 items-center gap-2 rounded-xl border border-[#E8E0DA] bg-white px-3 py-1.5 text-left shadow-[0_2px_8px_rgba(50,50,50,0.03)] hover:border-[#C8BCB4]">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F3E9E1] text-[#9A5E3A]"><MapPin className="h-4 w-4" /></span>
        <span className="min-w-0">
          <span className="block truncate text-xs font-semibold text-[#323232]">
            {isLoading ? 'Loading projects…' : error ? 'Projects unavailable' : selectedProject?.name ?? 'No accessible projects'}
          </span>
          <span className="block text-[10px] font-medium tracking-wide text-[#8E827A]">
            {selectedProject?.code ?? (error ? 'Unable to load projects' : 'Select an accessible project')}
          </span>
        </span>
        <select
          aria-label="Select project"
          className="absolute inset-0 h-full w-full cursor-pointer appearance-none opacity-0"
          value={selectedProjectId}
          onChange={(event) => selectProject(event.target.value)}
          disabled={isLoading || Boolean(error) || projects.length === 0}
        >
          {projects.map((project) => <option value={String(project.id)} key={project.id}>{project.name}</option>)}
        </select>
        <ChevronDown className="ml-auto h-4 w-4 shrink-0 text-[#8E827A]" aria-hidden="true" />
      </label>
      {error && <button type="button" onClick={retry} className="text-xs font-medium text-[#F2A65A] hover:text-white">Retry</button>}
    </div>
  )
}
