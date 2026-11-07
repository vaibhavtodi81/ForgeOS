import { ChevronDown, MapPin } from 'lucide-react'

export function ProjectSelector() {
  return (
    <button className="flex min-w-0 items-center gap-2 rounded-xl border border-[#E8E0DA] bg-white px-3 py-2 text-left shadow-[0_2px_8px_rgba(50,50,50,0.03)] hover:border-[#C8BCB4]" type="button">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F3E9E1] text-[#9A5E3A]"><MapPin className="h-4 w-4" /></span>
      <span className="min-w-0">
        <span className="block truncate text-xs font-semibold text-[#323232]">Green Valley Residency</span>
        <span className="block text-[10px] font-medium tracking-wide text-[#8E827A]">GVR-001</span>
      </span>
      <ChevronDown className="ml-auto h-4 w-4 shrink-0 text-[#8E827A]" />
    </button>
  )
}
