import { ArrowUpRight, TrendingUp } from 'lucide-react'
import type { ProgressEntry } from '../types/dailyLog'

interface ProgressHistoryProps {
  entries: ProgressEntry[]
}

export function ProgressHistory({ entries }: ProgressHistoryProps) {
  return (
    <section className="rounded-2xl border border-[#E8E0DA] bg-white p-5 shadow-[0_8px_24px_rgba(50,50,50,0.04)]">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-[#323232]">
            <TrendingUp className="h-4 w-4" />
            <h2 className="font-semibold">Progress history</h2>
          </div>
          <p className="mt-1 text-xs text-[#8E827A]">Latest activity completion updates</p>
        </div>
        <button className="text-xs font-semibold text-[#9A5E3A] hover:text-[#323232]" type="button">Open report</button>
      </div>
      <div className="space-y-4">
        {entries.map((entry) => (
          <div key={entry.id}>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-[#323232]">{entry.activity}</p>
                <p className="text-xs text-[#8E827A]">{entry.date} · {entry.note}</p>
              </div>
              <span className="text-sm font-bold text-[#323232]">{entry.completion}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[#F0E9E4]">
              <div className="h-full rounded-full bg-[#9A5E3A]" style={{ width: `${entry.completion}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 flex items-center gap-2 rounded-xl bg-[#F7F3EE] px-3 py-2.5 text-xs text-[#595552]">
        <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" />
        <span>Overall project progress is up 4.2% this week.</span>
      </div>
    </section>
  )
}
