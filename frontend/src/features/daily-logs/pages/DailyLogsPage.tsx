import { dailyLogs } from '../data/dailyLogs'
import { DailyLogsShell } from '../components/DailyLogsShell'

export function DailyLogsPage() {
  return <DailyLogsShell initialLogs={dailyLogs} />
}
