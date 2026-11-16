// Imports ChevronDown, MapPin from lucide-react so this module can reuse that component, helper, or library.
import { ChevronDown, MapPin } from 'lucide-react'
// Imports useProjects from ../../projects/useProjects so this module can reuse that component, helper, or library.
import { useProjects } from '../../projects/useProjects'

// Defines ProjectSelector so this module can perform its named task when needed.
export function ProjectSelector() {
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const { projects, selectedProjectId, selectedProject, isLoading, error, selectProject, retry } = useProjects()

  // Returns the result so the caller or React receives the value or interface this function provides.
  return (
    // Continues the component or data expression so its related values and behavior stay grouped together.
    <div className="flex min-w-0 items-center gap-2">
      {/* Starts the <label> element to name a form control for users and assistive technology. */}
      <label className="relative flex min-w-0 items-center gap-2 rounded-xl border border-[#E8E0DA] bg-white px-3 py-1.5 text-left shadow-[0_2px_8px_rgba(50,50,50,0.03)] hover:border-[#C8BCB4]">
        {/* Starts the <span> element to organize this part of the interface. */}
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F3E9E1] text-[#9A5E3A]"><MapPin className="h-4 w-4" /></span>
        {/* Starts the <span> element to organize this part of the interface. */}
        <span className="min-w-0">
          {/* Starts the <span> element to organize this part of the interface. */}
          <span className="block truncate text-xs font-semibold text-[#323232]">
            {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
            {isLoading ? 'Loading projects…' : error ? 'Projects unavailable' : selectedProject?.name ?? 'No accessible projects'}
          {/* Closes the <span> element so later content is no longer part of this region. */}
          </span>
          {/* Starts the <span> element to organize this part of the interface. */}
          <span className="block text-[10px] font-medium tracking-wide text-[#8E827A]">
            {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
            {selectedProject?.code ?? (error ? 'Unable to load projects' : 'Select an accessible project')}
          {/* Closes the <span> element so later content is no longer part of this region. */}
          </span>
        {/* Closes the <span> element so later content is no longer part of this region. */}
        </span>
        {/* Starts the <select> element to collect or display a value. */}
        <select
          /* Provides aria-label accessibility information so assistive technology can describe the element. */
          aria-label="Select project"
          /* Applies utility classes so the element’s layout, spacing, and appearance match the design. */
          className="absolute inset-0 h-full w-full cursor-pointer appearance-none opacity-0"
          /* Supplies the value shown by this form control so the user sees the current data. */
          value={selectedProjectId}
          /* Connects the Change event to its handler so the interface can respond to interaction. */
          onChange={(event) => selectProject(event.target.value)}
          /* Controls whether the element can be used, preventing actions that are not currently available. */
          disabled={isLoading || Boolean(error) || projects.length === 0}
        /* Continues the component or data expression so its related values and behavior stay grouped together. */
        /* Continues the component or data expression so its related values and behavior stay grouped together. */
        >
          {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
          {projects.map((project) => <option value={String(project.id)} key={project.id}>{project.name}</option>)}
        {/* Closes the <select> element so later content is no longer part of this region. */}
        </select>
        {/* Starts the <ChevronDown> element to organize this part of the interface. */}
        <ChevronDown className="ml-auto h-4 w-4 shrink-0 text-[#8E827A]" aria-hidden="true" />
      {/* Closes the <label> element so later content is no longer part of this region. */}
      </label>
      {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
      {error && <button type="button" onClick={retry} className="text-xs font-medium text-[#F2A65A] hover:text-white">Retry</button>}
    {/* Closes the <div> element so later content is no longer part of this region. */}
    </div>
  // Closes this function call or grouped expression so the surrounding code can continue.
  )
// Closes the current block or object so the grouped statements or settings end here.
}
// File purpose: Renders the reusable ProjectSelector interface component.
