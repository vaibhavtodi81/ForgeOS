import { Check, Clock3, Users, X } from 'lucide-react'
import type { LabourEntry } from '../types/dailyLog'

interface LabourAttendanceProps {
  entries: LabourEntry[]
}

const statusStyles = {
  Present: 'bg-emerald-50 text-emerald-700',
  'Half day': 'bg-amber-50 text-amber-700',
  Absent: 'bg-rose-50 text-rose-700',
}

export function LabourAttendance({ entries }: LabourAttendanceProps) {
  const presentCount = entries.filter((entry) => entry.status === 'Present').length

  return (
    <section className="rounded-2xl border border-[#E8E0DA] bg-white p-5 shadow-[0_8px_24px_rgba(50,50,50,0.04)]">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-[#323232]">
            <Users className="h-4 w-4" />
            <h2 className="font-semibold">Labour attendance</h2>
          </div>
          <p className="mt-1 text-xs text-[#8E827A]">{presentCount} of {entries.length} workers present today</p>
        </div>
        <button className="text-xs font-semibold text-[#9A5E3A] hover:text-[#323232]" type="button">View all</button>
      </div>
      <div className="space-y-3">
        {entries.map((entry) => (
          <div className="flex items-center gap-3" key={entry.id}>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F3E9E1] text-xs font-bold text-[#9A5E3A]">
              {entry.name.split(' ').map((part) => part[0]).join('')}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[#323232]">{entry.name}</p>
              <p className="truncate text-xs text-[#8E827A]">{entry.trade} · {entry.company}</p>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold ${statusStyles[entry.status]}`}>
                {entry.status === 'Present' ? <Check className="h-3 w-3" /> : entry.status === 'Absent' ? <X className="h-3 w-3" /> : <Clock3 className="h-3 w-3" />}
                {entry.status}
              </span>
              <p className="mt-1 text-[11px] text-[#8E827A]">{entry.hours}h logged</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
