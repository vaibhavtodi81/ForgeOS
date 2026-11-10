import { ChevronDown, MapPin } from 'lucide-react'

const defaultProjects = [
  { id: 'GVR-001', name: 'Green Valley Residency' },
  { id: 'SHV-002', name: 'Skyline Commercial Hub' },
]

interface ProjectSelectorProps {
  value?: string
  options?: Array<{ id: string; name: string }>
  onChange?: (value: string) => void
}

export function ProjectSelector({ value = defaultProjects[0].id, options = defaultProjects, onChange }: ProjectSelectorProps) {
  const selectedProject = options.find((project) => project.id === value) ?? options[0]

  return (
    <label className="relative flex min-w-0 items-center gap-2 rounded-xl border border-[#E8E0DA] bg-white px-3 py-1.5 text-left shadow-[0_2px_8px_rgba(50,50,50,0.03)] hover:border-[#C8BCB4]">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F3E9E1] text-[#9A5E3A]"><MapPin className="h-4 w-4" /></span>
      <span className="min-w-0">
        <span className="block truncate text-xs font-semibold text-[#323232]">{selectedProject.name}</span>
        <span className="block text-[10px] font-medium tracking-wide text-[#8E827A]">{selectedProject.id}</span>
      </span>
      <select
        aria-label="Select project"
        className="absolute inset-0 h-full w-full cursor-pointer appearance-none opacity-0"
        value={selectedProject.id}
        onChange={(event) => onChange?.(event.target.value)}
      >
        {options.map((project) => <option value={project.id} key={project.id}>{project.name}</option>)}
      </select>
      <ChevronDown className="ml-auto h-4 w-4 shrink-0 text-[#8E827A]" aria-hidden="true" />
    </label>
  )
}
