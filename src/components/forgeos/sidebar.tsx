'use client'

import {
  Boxes,
  Building2,
  CalendarDays,
  ClipboardList,
  Flame,
  LayoutDashboard,
  MapPin,
  Package,
  Percent,
  ReceiptIndianRupee,
  ScrollText,
  Truck,
  UserCircle,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Role, SessionUser } from '@/lib/forgeos-types'
import { ROLE_LABELS } from '@/lib/forgeos-types'
import { useAppStore, type ViewId } from '@/lib/store'
import { cn } from '@/lib/utils'

interface NavItem {
  id: ViewId
  label: string
  icon: LucideIcon
  roles?: Role[] // omit = all roles
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    items: [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Delivery',
    items: [
      { id: 'projects', label: 'Projects', icon: Building2 },
      { id: 'plans', label: 'Material Plans', icon: ClipboardList, roles: ['ADMIN', 'PROJECT_MANAGER'] },
      { id: 'inventory', label: 'Inventory', icon: Package, roles: ['ADMIN', 'PROJECT_MANAGER'] },
      { id: 'logs', label: 'Daily Logs', icon: CalendarDays, roles: ['ADMIN', 'PROJECT_MANAGER'] },
    ],
  },
  {
    label: 'Finance',
    items: [
      { id: 'billing', label: 'Billing & Payments', icon: ReceiptIndianRupee, roles: ['ADMIN', 'ACCOUNTANT', 'VIEWER'] },
      { id: 'wastage', label: 'Wastage', icon: Percent },
    ],
  },
  {
    label: 'Governance',
    items: [{ id: 'audit', label: 'Audit Logs', icon: ScrollText, roles: ['ADMIN'] }],
  },
  {
    label: 'Masters',
    items: [
      { id: 'materials', label: 'Materials', icon: Boxes },
      { id: 'lands', label: 'Lands', icon: MapPin },
      { id: 'suppliers', label: 'Suppliers', icon: Truck },
    ],
  },
  {
    label: 'Administration',
    items: [
      { id: 'users', label: 'Users', icon: Users, roles: ['ADMIN'] },
      { id: 'profile', label: 'Profile', icon: UserCircle },
    ],
  },
]

function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function SidebarNav({ user }: { user: SessionUser }) {
  const view = useAppStore((s) => s.view)
  const setView = useAppStore((s) => s.setView)

  return (
    <nav className="flex h-full flex-col" aria-label="Main navigation">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Flame className="h-4.5 w-4.5" aria-hidden />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold tracking-tight">ForgeOS</p>
          <p className="text-[10px] uppercase tracking-wider text-sidebar-foreground/50">Builder OS</p>
        </div>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        {NAV_GROUPS.map((group) => {
          const items = group.items.filter((item) => !item.roles || item.roles.includes(user.role))
          if (items.length === 0) return null
          return (
            <div key={group.label}>
              <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {items.map((item) => {
                  const active = view === item.id
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => setView(item.id)}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors',
                          active
                            ? 'bg-primary/15 font-medium text-white'
                            : 'text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                        )}
                      >
                        <item.icon className={cn('h-4 w-4 shrink-0', active && 'text-primary')} aria-hidden />
                        {item.label}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </div>

      <div className="border-t border-sidebar-border px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
            {initials(user.name)}
          </div>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-xs font-medium">{user.name}</p>
            <p className="truncate text-[10px] text-sidebar-foreground/50">{ROLE_LABELS[user.role]}</p>
          </div>
        </div>
      </div>
    </nav>
  )
}
