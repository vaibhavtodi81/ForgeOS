'use client'

import type { SessionUser } from '@/lib/forgeos-types'
import { SidebarNav } from '@/components/forgeos/sidebar'
import { Topbar } from '@/components/forgeos/topbar'

/**
 * Application shell: fixed sidebar (desktop), sheet drawer (mobile),
 * sticky topbar and a footer pinned to the bottom of the viewport.
 */
export function AppShell({
  user,
  onLogout,
  children,
}: {
  user: SessionUser
  onLogout: () => void
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <div className="flex flex-1">
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 bg-sidebar text-sidebar-foreground lg:block">
          <SidebarNav user={user} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar user={user} onLogout={onLogout} />
          <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-5 sm:px-6 sm:py-6">{children}</main>
          <footer className="mt-auto border-t bg-card px-4 py-3 sm:px-6">
            <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-1 text-[11px] text-muted-foreground sm:flex-row">
              <p>ForgeOS — Project &amp; financial management for Indian builders</p>
              <p>All amounts in INR (₹) · GST as applicable</p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}
