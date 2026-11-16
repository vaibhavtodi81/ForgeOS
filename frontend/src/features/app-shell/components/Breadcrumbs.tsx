// Imports ChevronRight, Home from lucide-react so this module can reuse that component, helper, or library.
import { ChevronRight, Home } from 'lucide-react'

// Continues the component or data expression so its related values and behavior stay grouped together.
interface BreadcrumbsProps {
  // Sets the current field so the surrounding object or component receives this setting.
  current: string
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines Breadcrumbs so this module can perform its named task when needed.
export function Breadcrumbs({ current }: BreadcrumbsProps) {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return (
    // Continues the component or data expression so its related values and behavior stay grouped together.
    <div className="mb-5 flex items-center gap-2 text-xs text-[#8E827A]">
      {/* Starts the <a> element to provide navigation to another location. */}
      <a className="inline-flex items-center gap-1 hover:text-[#9A5E3A]" href="/app"> <Home className="h-3.5 w-3.5" /> Operations</a>
      {/* Starts the <ChevronRight> element to organize this part of the interface. */}
      <ChevronRight className="h-3 w-3 text-[#C8BCB4]" />
      {/* Starts the <span> element to organize this part of the interface. */}
      <span className="font-medium text-[#595552]">{current}</span>
    {/* Closes the <div> element so later content is no longer part of this region. */}
    </div>
  // Closes this function call or grouped expression so the surrounding code can continue.
  )
// Closes the current block or object so the grouped statements or settings end here.
}
// File purpose: Renders the reusable Breadcrumbs interface component.
