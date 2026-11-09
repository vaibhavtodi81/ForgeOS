import { useState } from 'react'
import { Bell, ChevronDown, Menu, Search, UserCircle, LogOut, Check } from 'lucide-react'
import { ProjectSelector } from './ProjectSelector'

interface TopbarProps {
  collapsed: boolean
  onOpenMobileNav: () => void
}

export function Topbar({ collapsed, onOpenMobileNav }: TopbarProps) {
  const savedUser = localStorage.getItem('forgeos_demo_user')

  let role = 'Administrator'
  let email = 'admin@forgeos.com'

  try {
    if (savedUser) {
      const user = JSON.parse(savedUser)
      role = user.role === 'pm' ? 'Project Manager' : 'Administrator'
      email = user.email || email
    }
  } catch {
    // Use default demo profile if stored data is invalid.
  }

  const initials = role === 'Administrator' ? 'AD' : 'PM'
  const [profileOpen, setProfileOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('forgeos_demo_user')
    window.location.href = '/'
  }

  const switchDemoRole = (nextRole: 'admin' | 'pm') => {
    localStorage.setItem('forgeos_demo_user', JSON.stringify({
      role: nextRole,
      email: nextRole === 'admin' ? 'admin@forgeos.com' : 'pm@forgeos.com',
    }))
    window.location.href = nextRole === 'admin' ? '/app/admin/dashboard' : '/app/pm/dashboard'
  }

  return (
    <header className={`fixed inset-x-0 top-0 z-20 h-16 border-b border-[#E8E0DA] bg-[#F7F3EE]/95 backdrop-blur-md transition-[left] duration-200 ${collapsed ? 'lg:left-[76px]' : 'lg:left-[250px]'}`}>
      <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            className="rounded-lg p-2 text-[#595552] hover:bg-[#E8E0DA] lg:hidden"
            onClick={onOpenMobileNav}
            type="button"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
          <ProjectSelector />
          <span className="hidden rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold tracking-wide text-emerald-700 sm:inline-flex">
            ACTIVE
          </span>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            className="rounded-lg p-2 text-[#8E827A] hover:bg-[#E8E0DA]"
            type="button"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>

          <button
            className="relative rounded-lg p-2 text-[#8E827A] hover:bg-[#E8E0DA]"
            type="button"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#B87A4F]" />
          </button>

          <div className="relative ml-1 border-l border-[#E8E0DA] pl-3">
            <button
              type="button"
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 rounded-xl p-1.5 text-left hover:bg-[#E8E0DA]"
              aria-expanded={profileOpen}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D9BBA7] text-xs font-bold text-[#6D4330]">
                {initials}
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-semibold text-[#323232]">{role}</p>
                <p className="max-w-40 truncate text-[10px] text-[#8E827A]">{email}</p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-[#8E827A]" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-12 z-50 w-60 rounded-xl border border-[#C8BCB4] bg-white p-2 shadow-xl">
                <div className="border-b border-[#E8DCD4] px-3 py-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#323232]">
                    <UserCircle size={17} />
                    {role}
                  </div>
                  <p className="mt-1 truncate text-xs text-[#8E827A]">{email}</p>
                </div>
                <div className="border-b border-[#E8DCD4] px-2 py-2">
                  <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#A59A93]">
                    Demo role switcher
                  </p>
                  <button
                    type="button"
                    onClick={() => switchDemoRole('admin')}
                    className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm text-[#595552] hover:bg-[#F7F3EE]"
                  >
                    Administrator
                    {role === 'Administrator' && <Check size={15} className="text-[#9A5E3A]" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => switchDemoRole('pm')}
                    className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm text-[#595552] hover:bg-[#F7F3EE]"
                  >
                    Project Manager
                    {role === 'Project Manager' && <Check size={15} className="text-[#9A5E3A]" />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
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
    </header>
  )
}
