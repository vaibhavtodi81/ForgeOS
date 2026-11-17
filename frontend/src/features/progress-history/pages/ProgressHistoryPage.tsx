import { AppShell } from '../../app-shell/components/AppShell'
import { useProjects } from '../../projects/useProjects'
import { ProjectProgressPage } from './ProjectProgressPage'

export function ProgressHistoryPage() {
  const { selectedProject, isLoading, error, retry } = useProjects()

  if (isLoading) {
    return <AppShell currentPath="/app/progress-history"><div aria-live="polite" className="mx-auto max-w-5xl p-8 text-sm text-[#8E827A]">Loading your selected project…</div></AppShell>
  }
  if (error) {
    return <AppShell currentPath="/app/progress-history"><div role="alert" className="mx-auto max-w-5xl p-8"><p className="text-sm text-rose-700">{error}</p><button type="button" onClick={retry} className="mt-4 rounded-lg bg-[#323232] px-4 py-2 text-sm text-white">Retry</button></div></AppShell>
  }
  if (!selectedProject) {
    return <AppShell currentPath="/app/progress-history"><div className="mx-auto max-w-5xl p-8"><h1 className="text-xl font-semibold">No accessible project selected</h1><p className="mt-2 text-sm text-[#8E827A]">Select a project to view its progress history.</p></div></AppShell>
  }
  return <ProjectProgressPage projectId={String(selectedProject.id)} />
}
