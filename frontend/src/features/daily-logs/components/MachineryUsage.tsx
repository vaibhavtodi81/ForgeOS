import { Cog, MoreHorizontal } from 'lucide-react'
import type { MachineryEntry } from '../types/dailyLog'

interface MachineryUsageProps {
  entries: MachineryEntry[]
}

const statusStyles = {
  'In use': 'bg-emerald-50 text-emerald-700',
  Idle: 'bg-slate-100 text-slate-600',
  Maintenance: 'bg-amber-50 text-amber-700',
}

export function MachineryUsage({ entries }: MachineryUsageProps) {
  return (
    <section className="rounded-2xl border border-[#E8E0DA] bg-white p-5 shadow-[0_8px_24px_rgba(50,50,50,0.04)]">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-[#323232]">
            <Cog className="h-4 w-4" />
            <h2 className="font-semibold">Machinery usage</h2>
          </div>
          <p className="mt-1 text-xs text-[#8E827A]">{entries.filter((entry) => entry.status === 'In use').length} machines active · {entries.reduce((total, entry) => total + entry.hours, 0)} hours logged</p>
        </div>
        <button className="text-xs font-semibold text-[#9A5E3A] hover:text-[#323232]" type="button">View all</button>
      </div>
      <div className="divide-y divide-[#F1EBE6]">
        {entries.map((entry) => (
          <div className="flex items-center gap-3 py-3 first:pt-0 last:pb-0" key={entry.id}>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F7F3EE] text-[#9A5E3A]">
              <Cog className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[#323232]">{entry.name}</p>
              <p className="text-xs text-[#8E827A]">{entry.type} · {entry.operator}</p>
            </div>
            <div className="text-right">
              <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${statusStyles[entry.status]}`}>{entry.status}</span>
              <p className="mt-1 text-[11px] text-[#8E827A]">{entry.hours}h</p>
            </div>
            <MoreHorizontal className="h-4 w-4 text-[#B6AAA2]" />
          </div>
        ))}
      </div>
    </section>
  )
}
