import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbsProps {
  current: string
}

export function Breadcrumbs({ current }: BreadcrumbsProps) {
  return (
    <div className="mb-5 flex items-center gap-2 text-xs text-[#8E827A]">
      <a className="inline-flex items-center gap-1 hover:text-[#9A5E3A]" href="/app"> <Home className="h-3.5 w-3.5" /> Operations</a>
      <ChevronRight className="h-3 w-3 text-[#C8BCB4]" />
      <span className="font-medium text-[#595552]">{current}</span>
    </div>
  )
}
