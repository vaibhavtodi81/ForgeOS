import { CalendarDays, ChevronRight, CloudSun, FileText, Plus } from 'lucide-react'
import type { DailyLog } from '../types/dailyLog'

interface DailyLogsListProps {
  logs: DailyLog[]
  selectedId: string
  onSelect: (id: string) => void
  onCreate: () => void
}

const statusStyles = {
  Draft: 'bg-slate-100 text-slate-600',
  Submitted: 'bg-amber-50 text-amber-700',
  Approved: 'bg-emerald-50 text-emerald-700',
}

export function DailyLogsList({ logs, selectedId, onSelect, onCreate }: DailyLogsListProps) {
  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-[#E8E0DA] bg-[#FBF9F7] lg:w-[330px] lg:border-b-0 lg:border-r">
      <div className="border-b border-[#E8E0DA] p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9A5E3A]">Site records</p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-[#323232]">Daily logs</h2>
          </div>
          <button onClick={onCreate} className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#323232] text-[#F7F3EE] transition hover:bg-[#9A5E3A]" type="button" aria-label="Create daily log">
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-[#E8E0DA] bg-white px-3 py-2.5 text-xs text-[#8E827A]">
          <CalendarDays className="h-3.5 w-3.5" />
          Jun 2024 · Riverside Residences
        </div>
      </div>
      <div className="flex-1 overflow-auto p-3">
        {logs.map((log) => (
          <button className={`mb-2 w-full rounded-xl border p-4 text-left transition ${selectedId === log.id ? 'border-[#CBA78F] bg-[#F3E9E1]' : 'border-transparent bg-transparent hover:border-[#E8E0DA] hover:bg-white'}`} key={log.id} onClick={() => onSelect(log.id)} type="button">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-[#323232]">{new Date(`${log.date}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                <p className="mt-1 text-xs text-[#8E827A]">{log.project}</p>
              </div>
              <ChevronRight className={`h-4 w-4 ${selectedId === log.id ? 'text-[#9A5E3A]' : 'text-[#B6AAA2]'}`} />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${statusStyles[log.status]}`}>{log.status}</span>
              <span className="text-xs font-medium text-[#595552]">{log.progress}% complete</span>
            </div>
          </button>
        ))}
        <button className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#C8BCB4] px-4 py-3 text-xs font-semibold text-[#9A5E3A] hover:bg-white" onClick={onCreate} type="button">
          <FileText className="h-3.5 w-3.5" /> Start a new log
        </button>
      </div>
      <div className="border-t border-[#E8E0DA] p-4">
        <div className="flex items-center gap-3 rounded-xl bg-[#F3E9E1] p-3">
          <CloudSun className="h-5 w-5 text-[#9A5E3A]" />
          <div>
            <p className="text-xs font-semibold text-[#323232]">Today on site</p>
            <p className="text-[11px] text-[#8E827A]">Clear · 28°C · Good conditions</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
