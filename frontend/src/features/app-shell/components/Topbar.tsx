import { useEffect, useState } from 'react'
import { Bell, ChevronDown, Command, FolderKanban, LogOut, Menu, Search, UserCircle, X } from 'lucide-react'
import { ProjectSelector } from './ProjectSelector'
import { useAuth } from '../../authentication/auth/useAuth'

interface TopbarProps {
  collapsed: boolean
  onOpenMobileNav: () => void
}

export function Topbar({ collapsed, onOpenMobileNav }: TopbarProps) {
  const { user, logout } = useAuth()
  const isPm = user?.role === 'PM'

  const roleTitle = isPm ? 'Project Manager' : 'Administrator'
  const email = user?.email ?? ''
  const initials = user?.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() ?? ''

  const [profileOpen, setProfileOpen] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [commandQuery, setCommandQuery] = useState('')

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setCommandOpen((value) => !value)
      }
      if (event.key === 'Escape') {
        setCommandOpen(false)
        setNotificationsOpen(false)
        setProfileOpen(false)
      }
    }
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [])

  const commands = [
    { label: 'Open dashboard', detail: isPm ? 'Project Manager cockpit' : 'Portfolio command center', icon: FolderKanban, path: isPm ? '/app/pm/dashboard' : '/app/admin/dashboard' },
    { label: 'View projects', detail: 'Browse the project workspace', icon: FolderKanban, path: '/app/projects' },
    { label: 'Open daily logs', detail: 'Review site activity and logs', icon: FolderKanban, path: '/app/daily-logs' },
  ].filter((item) => `${item.label} ${item.detail}`.toLowerCase().includes(commandQuery.toLowerCase()))

  const openCommand = () => {
    setProfileOpen(false)
    setNotificationsOpen(false)
    setCommandOpen(true)
    setCommandQuery('')
  }

  return (
    <header className={`dashboard-topbar fixed inset-x-0 top-0 z-20 h-16 border-b backdrop-blur-xl transition-[left] duration-200 ${collapsed ? 'lg:left-[76px]' : 'lg:left-[250px]'}`}>
      <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            className="rounded-lg p-2 text-white/55 hover:bg-white/10 hover:text-white lg:hidden"
            onClick={onOpenMobileNav}
            type="button"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
          <ProjectSelector />
          <span className="dashboard-live-pill hidden rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide sm:inline-flex">
            {isPm ? 'ACTIVE SITE' : 'ORGANIZATION VIEW'}
          </span>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            className="rounded-lg p-2 text-white/45 hover:bg-white/10 hover:text-white"
            type="button"
            aria-label="Search"
            onClick={openCommand}
          >
            <Search className="h-4 w-4" />
          </button>
          <button type="button" onClick={openCommand} className="hidden items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[10px] text-white/35 md:flex" aria-label="Open command menu">
            <Command size={12} /> <span>Search</span><kbd className="rounded border border-white/10 px-1 text-[9px]">⌘K</kbd>
          </button>

          <button
            className="relative rounded-lg p-2 text-white/45 hover:bg-white/10 hover:text-white"
            type="button"
            aria-label="Notifications"
            onClick={() => { setNotificationsOpen((value) => !value); setCommandOpen(false); setProfileOpen(false) }}
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#F2A65A]" />
          </button>

          <div className="relative ml-1 border-l border-white/10 pl-3">
            <button
              type="button"
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 rounded-xl p-1.5 text-left hover:bg-white/10"
              aria-expanded={profileOpen}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F2A65A] text-xs font-bold text-[#171717]">
                {initials}
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-semibold text-white">{user?.name ?? roleTitle}</p>
                <p className="max-w-40 truncate text-[10px] text-white/40">{roleTitle} · {email}</p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-[#8E827A]" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-12 z-50 w-64 rounded-xl border border-[#C8BCB4] bg-white p-2 shadow-xl">
                <div className="border-b border-[#E8DCD4] px-3 py-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#323232]">
                    <UserCircle size={17} />
                    {user?.name ?? roleTitle}
                  </div>
                  <p className="mt-1 truncate text-xs text-[#8E827A]">{email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => { logout(); window.history.replaceState({}, '', '/login'); window.dispatchEvent(new PopStateEvent('popstate')) }}
                  className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-[#8A5143] hover:bg-[#F7F3EE]"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {notificationsOpen && (
        <div className="dashboard-popover absolute right-4 top-[4.25rem] w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/10 bg-[#151a1d] shadow-2xl sm:right-8">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3"><div><p className="text-sm font-semibold text-white">Notifications</p><p className="mt-0.5 text-[10px] text-white/40">Latest workspace signals</p></div><button type="button" onClick={() => setNotificationsOpen(false)} aria-label="Close notifications" className="text-white/35 hover:text-white"><X size={15} /></button></div>
          <div className="divide-y divide-white/[0.08]">
            {[['Material delivery update', 'Steel delivery checked at Green Valley Residency', '8 min ago'], ['Progress review due', 'Skyline Commercial Hub milestone review is due Friday', '1 hr ago'], ['Daily log submitted', 'Aarav Sharma submitted today’s site log', '2 hr ago']].map(([title, detail, time]) => <button type="button" key={title} onClick={() => setNotificationsOpen(false)} className="flex w-full gap-3 px-4 py-3 text-left hover:bg-white/[0.04]"><span className="dashboard-icon dashboard-icon-amber h-8 w-8 shrink-0 p-2"><Bell size={14} /></span><span className="min-w-0 flex-1"><span className="block text-xs font-semibold text-white">{title}</span><span className="mt-1 block text-[11px] leading-4 text-white/45">{detail}</span><span className="mt-1 block text-[10px] text-white/25">{time}</span></span></button>)}
          </div>
        </div>
      )}
      {commandOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/70 px-4 pt-[12vh] backdrop-blur-sm" onClick={() => setCommandOpen(false)}>
          <div className="dashboard-popover w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-[#151a1d] shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center gap-3 border-b border-white/10 px-4"><Search size={17} className="text-white/35" /><input autoFocus value={commandQuery} onChange={(event) => setCommandQuery(event.target.value)} placeholder="Search pages, projects, and tools..." className="h-14 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30" /><kbd className="rounded border border-white/10 px-1.5 py-1 text-[10px] text-white/35">ESC</kbd></div>
            <div className="p-2">{commands.length ? commands.map(({ label, detail, icon: Icon, path }) => <button type="button" key={label} onClick={() => { setCommandOpen(false); window.location.href = path }} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-white/[0.05]"><span className="dashboard-icon dashboard-icon-amber p-2"><Icon size={15} /></span><span><span className="block text-sm font-medium text-white">{label}</span><span className="mt-0.5 block text-xs text-white/40">{detail}</span></span></button>) : <div className="px-3 py-8 text-center text-sm text-white/40">No matching workspace actions.</div>}</div>
          </div>
        </div>
      )}
    </header>
  )
}
export default Topbar
