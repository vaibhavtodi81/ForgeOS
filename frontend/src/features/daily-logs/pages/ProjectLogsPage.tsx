import { AppShell } from '../../app-shell/components/AppShell'
import { Breadcrumbs } from '../../app-shell/components/Breadcrumbs'
import { getProjectLogs } from '../data/projectLogStore'
import { ProjectLogsListing } from '../components/ProjectLogsListing'

interface ProjectLogsPageProps {
  projectId: string
}

export function ProjectLogsPage({ projectId }: ProjectLogsPageProps) {
  return <AppShell currentPath={`/projects/${projectId}/logs`}><div className="mx-auto max-w-7xl px-5 pt-6 sm:px-6 lg:px-10"><Breadcrumbs current="Daily Site Logs" /></div><ProjectLogsListing initialLogs={getProjectLogs(projectId)} projectId={projectId} /></AppShell>
}
