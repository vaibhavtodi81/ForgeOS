'use client'

import { useTheme } from 'next-themes'
import { LogOut, Menu, Moon, Sun, UserCircle } from 'lucide-react'
import type { SessionUser } from '@/lib/forgeos-types'
import { ROLE_LABELS } from '@/lib/forgeos-types'
import { useAppStore, VIEW_TITLES } from '@/lib/store'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { SidebarNav } from '@/components/forgeos/sidebar'

function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function Topbar({ user, onLogout }: { user: SessionUser; onLogout: () => void }) {
  const view = useAppStore((s) => s.view)
  const setView = useAppStore((s) => s.setView)
  const sidebarOpen = useAppStore((s) => s.sidebarOpen)
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen)
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
      <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 lg:hidden"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <h2 className="truncate text-sm font-semibold sm:text-base">{VIEW_TITLES[view]}</h2>

        <div className="ml-auto flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Account menu"
              >
                <Avatar className="h-8 w-8 border">
                  <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                    {initials(user.name)}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <p className="truncate text-sm font-medium">{user.name}</p>
                <p className="truncate text-xs font-normal text-muted-foreground">{user.email}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{ROLE_LABELS[user.role]}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setView('profile')}>
                <UserCircle aria-hidden /> Profile &amp; password
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={onLogout}>
                <LogOut aria-hidden /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 bg-sidebar p-0 text-sidebar-foreground">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarNav user={user} />
        </SheetContent>
      </Sheet>
    </header>
  )
}
