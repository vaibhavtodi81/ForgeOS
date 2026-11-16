// Imports AppShell from ../../app-shell/components/AppShell so this module can reuse that component, helper, or library.
import { AppShell } from '../../app-shell/components/AppShell'
// Imports useProjects from ../../projects/useProjects so this module can reuse that component, helper, or library.
import { useProjects } from '../../projects/useProjects'
// Imports ProjectProgressPage from ./ProjectProgressPage so this module can reuse that component, helper, or library.
import { ProjectProgressPage } from './ProjectProgressPage'

// Defines ProgressHistoryPage so this module can perform its named task when needed.
export function ProgressHistoryPage() {
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const { selectedProject, isLoading, error, retry } = useProjects()

  // Checks this condition before continuing so the code can choose the correct path for the current state.
  if (isLoading) {
    // Returns the result so the caller or React receives the value or interface this function provides.
    return <AppShell currentPath="/app/progress-history"><div aria-live="polite" className="mx-auto max-w-5xl p-8 text-sm text-[#8E827A]">Loading your selected project…</div></AppShell>
  // Closes the current block or object so the grouped statements or settings end here.
  }
  // Checks this condition before continuing so the code can choose the correct path for the current state.
  if (error) {
    // Returns the result so the caller or React receives the value or interface this function provides.
    return <AppShell currentPath="/app/progress-history"><div role="alert" className="mx-auto max-w-5xl p-8"><p className="text-sm text-rose-700">{error}</p><button type="button" onClick={retry} className="mt-4 rounded-lg bg-[#323232] px-4 py-2 text-sm text-white">Retry</button></div></AppShell>
  // Closes the current block or object so the grouped statements or settings end here.
  }
  // Checks this condition before continuing so the code can choose the correct path for the current state.
  if (!selectedProject) {
    // Returns the result so the caller or React receives the value or interface this function provides.
    return <AppShell currentPath="/app/progress-history"><div className="mx-auto max-w-5xl p-8"><h1 className="text-xl font-semibold">No accessible project selected</h1><p className="mt-2 text-sm text-[#8E827A]">Select a project to view its progress history.</p></div></AppShell>
  // Closes the current block or object so the grouped statements or settings end here.
  }
  // Returns the result so the caller or React receives the value or interface this function provides.
  return <ProjectProgressPage projectId={String(selectedProject.id)} />
// Closes the current block or object so the grouped statements or settings end here.
}
// File purpose: Renders the progress history screen and coordinates its page-level interactions.
