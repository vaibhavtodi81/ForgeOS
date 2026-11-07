import { AlertTriangle, CheckCircle2, ClipboardCheck, Truck } from 'lucide-react'
import type { ActivityEntry } from '../types/dailyLog'

interface ActivityTimelineProps {
  entries: ActivityEntry[]
}

const activityIcons = {
  update: <TrendingIcon />,
  delivery: <Truck className="h-4 w-4" />,
  issue: <AlertTriangle className="h-4 w-4" />,
  approval: <ClipboardCheck className="h-4 w-4" />,
}

function TrendingIcon() {
  return <span className="text-sm font-bold">↗</span>
}

export function ActivityTimeline({ entries }: ActivityTimelineProps) {
  return (
    <section className="rounded-2xl border border-[#E8E0DA] bg-white p-5 shadow-[0_8px_24px_rgba(50,50,50,0.04)]">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-[#323232]">
            <CheckCircle2 className="h-4 w-4" />
            <h2 className="font-semibold">Activity timeline</h2>
          </div>
          <p className="mt-1 text-xs text-[#8E827A]">What happened on site today</p>
        </div>
        <button className="text-xs font-semibold text-[#9A5E3A] hover:text-[#323232]" type="button">See all</button>
      </div>
      <div className="space-y-4">
        {entries.map((entry) => (
          <div className="flex gap-3" key={entry.id}>
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F3E9E1] text-[#9A5E3A]">
              {activityIcons[entry.type]}
            </div>
            <div className="min-w-0 flex-1 border-b border-[#F1EBE6] pb-4 last:border-0 last:pb-0">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-[#323232]">{entry.title}</p>
                <time className="shrink-0 text-[11px] text-[#A59A93]">{entry.time}</time>
              </div>
              <p className="mt-1 text-xs leading-5 text-[#8E827A]">{entry.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
