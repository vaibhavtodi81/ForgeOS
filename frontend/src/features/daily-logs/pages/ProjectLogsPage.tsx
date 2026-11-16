// Imports AppShell from ../../app-shell/components/AppShell so this module can reuse that component, helper, or library.
import { AppShell } from '../../app-shell/components/AppShell'
// Imports useProjects from ../../projects/useProjects so this module can reuse that component, helper, or library.
import { useProjects } from '../../projects/useProjects'
// Imports ProjectLogsListing from ../components/ProjectLogsListing so this module can reuse that component, helper, or library.
import { ProjectLogsListing } from '../components/ProjectLogsListing'

// Continues the component or data expression so its related values and behavior stay grouped together.
interface ProjectLogsPageProps {
  // Sets the projectId field so the surrounding object or component receives this setting.
  projectId: string
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines ProjectLogsPage so this module can perform its named task when needed.
export function ProjectLogsPage({ projectId }: ProjectLogsPageProps) {
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const { projects, isLoading, error, retry } = useProjects()
  // Stores the value in projectIsAccessible so later lines can reuse this data or behavior for the current feature.
  const projectIsAccessible = projects.some((project) => String(project.id) === projectId)

  // Returns the result so the caller or React receives the value or interface this function provides.
  return <AppShell currentPath={`/projects/${projectId}/logs`}>
    {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
    {isLoading ? <div aria-live="polite" className="mx-auto max-w-5xl p-8 text-sm text-[#8E827A]">Loading accessible projects…</div>
      // Continues the component or data expression so its related values and behavior stay grouped together.
      : error ? <div role="alert" className="mx-auto max-w-5xl p-8"><p className="text-sm text-rose-700">{error}</p><button type="button" onClick={retry} className="mt-4 rounded-lg bg-[#323232] px-4 py-2 text-sm text-white">Retry</button></div>
        // Continues the component or data expression so its related values and behavior stay grouped together.
        : projectIsAccessible ? <ProjectLogsListing projectId={projectId} />
          // Continues the component or data expression so its related values and behavior stay grouped together.
          : <div role="alert" className="mx-auto max-w-5xl p-8"><h1 className="text-xl font-semibold">Project unavailable</h1><p className="mt-2 text-sm text-[#8E827A]">This project is not in your accessible project list.</p></div>}
  {/* Closes the <AppShell> element so later content is no longer part of this region. */}
  </AppShell>
// Closes the current block or object so the grouped statements or settings end here.
}
// File purpose: Renders the daily logs screen and coordinates its page-level interactions.
