import { dailyLogs } from '../data/dailyLogs'
import { DailyLogsShell } from '../components/DailyLogsShell'
import { AppShell } from '../../app-shell/components/AppShell'

export function DailyLogsPage() {
  return <AppShell currentPath="/app/daily-logs"><DailyLogsShell initialLogs={dailyLogs} /></AppShell>
}
