import { Bell, ChevronDown, Menu, Search } from 'lucide-react'
import { ProjectSelector } from './ProjectSelector'

interface TopbarProps {
  collapsed: boolean
  onOpenMobileNav: () => void
}

export function Topbar({ collapsed, onOpenMobileNav }: TopbarProps) {
  return <header className={`fixed inset-x-0 top-0 z-20 h-16 border-b border-[#E8E0DA] bg-[#F7F3EE]/95 backdrop-blur-md transition-[left] duration-200 ${collapsed ? 'lg:left-[76px]' : 'lg:left-[250px]'}`}>
    <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button className="rounded-lg p-2 text-[#595552] hover:bg-[#E8E0DA] lg:hidden" onClick={onOpenMobileNav} type="button" aria-label="Open navigation"><Menu className="h-5 w-5" /></button>
        <ProjectSelector />
        <span className="hidden rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold tracking-wide text-emerald-700 sm:inline-flex">ACTIVE</span>
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <button className="rounded-lg p-2 text-[#8E827A] hover:bg-[#E8E0DA]" type="button" aria-label="Search"><Search className="h-4 w-4" /></button>
        <button className="relative rounded-lg p-2 text-[#8E827A] hover:bg-[#E8E0DA]" type="button" aria-label="Notifications"><Bell className="h-4 w-4" /><span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#B87A4F]" /></button>
        <div className="ml-1 hidden items-center gap-2 border-l border-[#E8E0DA] pl-3 sm:flex"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D9BBA7] text-xs font-bold text-[#6D4330]">PM</div><div className="hidden text-left md:block"><p className="text-xs font-semibold text-[#323232]">Project Manager</p><p className="text-[10px] text-[#8E827A]">Green Valley Residency</p></div><ChevronDown className="h-3.5 w-3.5 text-[#8E827A]" /></div>
      </div>
    </div>
  </header>
}
