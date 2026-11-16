// Imports AppShell from ../../app-shell/components/AppShell so this module can reuse that component, helper, or library.
import { AppShell } from '../../app-shell/components/AppShell'
// Imports useProjects from ../../projects/useProjects so this module can reuse that component, helper, or library.
import { useProjects } from '../../projects/useProjects'
// Imports ProjectLogsListing from ../components/ProjectLogsListing so this module can reuse that component, helper, or library.
import { ProjectLogsListing } from '../components/ProjectLogsListing'

// Defines DailyLogsPage so this module can perform its named task when needed.
export function DailyLogsPage() {
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const { selectedProject, isLoading, error, retry } = useProjects()

  // Returns the result so the caller or React receives the value or interface this function provides.
  return <AppShell currentPath="/app/daily-logs">
    {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
    {isLoading ? <div aria-live="polite" className="mx-auto max-w-5xl p-8 text-sm text-[#8E827A]">Loading your selected project…</div>
      // Continues the component or data expression so its related values and behavior stay grouped together.
      : error ? <div role="alert" className="mx-auto max-w-5xl p-8"><p className="text-sm text-rose-700">{error}</p><button type="button" onClick={retry} className="mt-4 rounded-lg bg-[#323232] px-4 py-2 text-sm text-white">Retry</button></div>
        // Continues the component or data expression so its related values and behavior stay grouped together.
        : selectedProject ? <ProjectLogsListing projectId={String(selectedProject.id)} />
          // Continues the component or data expression so its related values and behavior stay grouped together.
          : <div className="mx-auto max-w-5xl p-8"><h1 className="text-xl font-semibold">No accessible project selected</h1><p className="mt-2 text-sm text-[#8E827A]">Select a project from the project selector to view its daily logs.</p></div>}
  {/* Closes the <AppShell> element so later content is no longer part of this region. */}
  </AppShell>
// Closes the current block or object so the grouped statements or settings end here.
}
// File purpose: Renders the daily logs screen and coordinates its page-level interactions.
