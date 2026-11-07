import { useState } from 'react'
import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

interface AppShellProps {
  currentPath: string
  children: ReactNode
}

export function AppShell({ currentPath, children }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  return <div className="min-h-screen bg-[#F7F3EE] text-[#323232]">
    <div className="flex min-h-screen">
      <Sidebar collapsed={collapsed} currentPath={currentPath} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} onToggleCollapsed={() => setCollapsed((value) => !value)} />
      <div className="min-w-0 flex-1">
        <Topbar collapsed={collapsed} onOpenMobileNav={() => setMobileOpen(true)} />
        <main className="min-h-screen pt-16">{children}</main>
      </div>
    </div>
  </div>
}
