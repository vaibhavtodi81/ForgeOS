import { useEffect, useState } from 'react'
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  BarChart3,
  Boxes,
  ClipboardCheck,
  ClipboardList,
  CreditCard,
  FolderKanban,
  LayoutDashboard,
  Map,
  Menu,
  PackageCheck,
  PackageSearch,
  PanelLeftClose,
  PanelLeftOpen,
  ScrollText,
  TrendingUp,
  UserCircle,
  UsersRound,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { apiGet } from '../../../lib/api'
import { routeLink } from '../../../lib/router'
import { useAuth } from '../../authentication/auth/useAuth'

interface SidebarProps {
  currentPath: string
  collapsed: boolean
  mobileOpen: boolean
  onCloseMobile: () => void
  onToggleCollapsed: () => void
}

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

interface ProgressSnapshot {
  key: string
  percent: number
  note: string
}

let progressCache: { key: string; at: number; value: ProgressSnapshot | null } | null = null
const PROGRESS_TTL_MS = 60_000

async function loadSidebarProgress(role: string, userId: string): Promise<ProgressSnapshot | null> {
  const key = `${role}:${userId}`
  if (progressCache && progressCache.key === key && Date.now() - progressCache.at < PROGRESS_TTL_MS) {
    return progressCache.value
  }
  try {
    if (role === 'PM') {
      const { data } = await apiGet<{ projects: Array<{ latestProgressPercent: number | null; totalDailyLogs: number }>; kpis: { myProjects: number } }>('/dashboard/pm')
      const withProgress = data.projects.filter((p) => p.totalDailyLogs > 0)
      const percent = withProgress.length
        ? Math.round(withProgress.reduce((sum, p) => sum + Number(p.latestProgressPercent), 0) / withProgress.length)
        : null
      const value: ProgressSnapshot | null = percent === null ? null : { key, percent, note: `${data.kpis.myProjects} assigned project${data.kpis.myProjects === 1 ? '' : 's'}` }
      progressCache = { key, at: Date.now(), value }
      return value
    }
    const { data } = await apiGet<{ projects: Array<{ latestProgressPercent: number | null; totalDailyLogs: number }> }>('/dashboard/admin')
    const withProgress = data.projects.filter((p) => p.totalDailyLogs > 0)
    const percent = withProgress.length
      ? Math.round(withProgress.reduce((sum, p) => sum + Number(p.latestProgressPercent), 0) / withProgress.length)
      : null
    const value: ProgressSnapshot | null = percent === null ? null : { key, percent, note: 'Portfolio average progress' }
    progressCache = { key, at: Date.now(), value }
    return value
  } catch {
    return null
  }
}

export function Sidebar({
  currentPath,
  collapsed,
  mobileOpen,
  onCloseMobile,
  onToggleCollapsed,
}: SidebarProps) {
  const { user } = useAuth()
  const isPm = user?.role === 'PM'
  const [progress, setProgress] = useState<ProgressSnapshot | null>(null)

  useEffect(() => {
    if (!user) return
    let active = true
    void loadSidebarProgress(user.role, user.id).then((snapshot) => {
      if (active) setProgress(snapshot)
    })
    return () => { active = false }
  }, [user])

  const adminItems: NavItem[] = [
    { label: 'Dashboard', href: '/app/admin/dashboard', icon: LayoutDashboard },
    { label: 'All Projects', href: '/app/projects', icon: FolderKanban },
    { label: 'Project Managers', href: '/app/users', icon: UsersRound },
    { label: 'Lands Portfolio', href: '/app/lands', icon: Map },
    { label: 'Daily Logs', href: '/app/daily-logs', icon: ClipboardList },
    { label: 'Materials Master', href: '/app/materials', icon: Boxes },
    { label: 'Material Planning', href: '/app/material-planning', icon: ClipboardCheck },
    { label: 'Available Stock', href: '/app/stock', icon: PackageSearch },
    { label: 'Stock IN (Deliveries)', href: '/app/stock-in', icon: ArrowDownToLine },
    { label: 'Stock OUT (Consumption)', href: '/app/stock-out', icon: ArrowUpFromLine },
    { label: 'Stock Ledger', href: '/app/stock-ledger', icon: ScrollText },
    { label: 'Wastage Analysis', href: '/app/wastage', icon: TrendingUp },
    { label: 'Vendors & Assignments', href: '/app/vendors', icon: UsersRound },
    { label: 'Invoices & Payments', href: '/app/bills', icon: CreditCard },
    { label: 'Audit Logs', href: '/app/audit', icon: ScrollText },
  ]

  const managerItems: NavItem[] = [
    { label: 'Site Dashboard', href: '/app/pm/dashboard', icon: LayoutDashboard },
    { label: 'My Project', href: '/app/projects', icon: FolderKanban },
    { label: 'Project Land', href: '/app/lands', icon: Map },
    { label: 'Daily Site Logs', href: '/app/daily-logs', icon: ClipboardList },
    { label: 'Progress History', href: '/app/progress-history', icon: BarChart3 },
    { label: 'Site Material Planning', href: '/app/material-planning', icon: ClipboardCheck },
    { label: 'Available Stock', href: '/app/stock', icon: PackageSearch },
    { label: 'Stock IN (Deliveries)', href: '/app/stock-in', icon: ArrowDownToLine },
    { label: 'Stock OUT (Usage)', href: '/app/stock-out', icon: ArrowUpFromLine },
    { label: 'Stock Ledger', href: '/app/stock-ledger', icon: ScrollText },
    { label: 'Wastage', href: '/app/wastage', icon: TrendingUp },
    { label: 'Vendors', href: '/app/vendors', icon: UsersRound },
    { label: 'Invoices & Payments', href: '/app/bills', icon: CreditCard },
  ]

  const isViewer = user?.role === 'VIEWER'
  const navItems = isPm
    ? managerItems
    : isViewer
      ? adminItems.filter((item) => item.href !== '/app/users' && item.href !== '/app/audit')
      : [...adminItems, { label: 'Profile', href: '/app/profile', icon: UserCircle }]

  return (
    <>
      {mobileOpen && (
        <button
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
          type="button"
          aria-label="Close navigation"
        />
      )}

      <aside
        className={`dashboard-sidebar fixed inset-y-0 left-0 z-40 flex flex-col border-r transition-all duration-200 lg:static lg:z-auto ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${collapsed ? 'w-[76px]' : 'w-[250px]'}`}
      >
        <div
          className={`flex h-16 shrink-0 items-center border-b border-[#E8E0DA] px-4 ${
            collapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          <a className="flex items-center gap-2" href={routeLink('/')}>
            <span className="dashboard-logo flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold">
              F
            </span>
            {!collapsed && (
              <span className="text-sm font-bold tracking-[0.18em] text-white">
                FORGE<span className="font-light text-white/40">OS</span>
              </span>
            )}
          </a>

          {!collapsed && (
            <button
              className="hidden rounded-lg p-2 text-white/40 hover:bg-white/10 hover:text-white lg:block"
              onClick={onToggleCollapsed}
              type="button"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {!collapsed && (
            <div className="mb-2">
              <p className="px-3 pt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
                {isPm ? 'Site Operations' : 'Administration'}
              </p>
            </div>
          )}

          {navItems.map(({ label, href, icon: Icon }) => {
            const active =
              currentPath === href ||
              (href === '/app' && currentPath === '/app/') ||
              (href === '/app/admin/dashboard' && (currentPath === '/app/admin/dashboard' || currentPath === '/app')) ||
              (href === '/app/pm/dashboard' && (currentPath === '/app/pm/dashboard' || (isPm && currentPath === '/app'))) ||
              (label.includes('Daily') && (currentPath === '/app/daily-logs' || currentPath.endsWith('/logs'))) ||
              (label.includes('Progress') && (currentPath.endsWith('/progress') && currentPath !== '/app/progress-history')) ||
              (label === 'Progress History' && currentPath === '/app/progress-history')

            return (
              <a
                className={`mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                  active
                    ? 'bg-[#F2A65A]/15 font-semibold text-[#F2A65A]'
                    : 'font-medium text-white/55 hover:bg-white/[0.07] hover:text-white'
                } ${collapsed ? 'justify-center' : ''}`}
                href={routeLink(href)}
                key={label}
                onClick={onCloseMobile}
                title={collapsed ? label : undefined}
              >
                <Icon className="h-[17px] w-[17px] shrink-0" />
                {!collapsed && <span className="truncate">{label}</span>}
              </a>
            )
          })}
        </div>

        <div className={`border-t border-white/10 p-3 ${collapsed ? 'flex justify-center' : ''}`}>
          {!collapsed && (
            <div className="mb-3 rounded-xl border border-white/10 bg-white/[0.05] p-3">
              <div className="flex items-center gap-2">
                <PackageCheck className="h-4 w-4 text-[#F2A65A]" />
                <span className="text-xs font-semibold text-white/80">
                  {isPm ? 'Site milestone' : 'Portfolio progress'}
                </span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-[#F2A65A] transition-all"
                  style={{ width: progress ? `${Math.min(100, Math.max(0, progress.percent))}%` : '0%' }}
                />
              </div>
              <p className="mt-1 text-[10px] text-white/35">
                {progress ? `${progress.percent}% · ${progress.note}` : isPm ? 'Project-scoped progress' : 'Portfolio overview'}
              </p>
            </div>
          )}

          <button
            className="flex items-center gap-2 rounded-lg p-2 text-xs font-medium text-white/40 hover:bg-white/10 hover:text-white"
            onClick={onToggleCollapsed}
            type="button"
            aria-label="Toggle sidebar width"
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
            {!collapsed && 'Collapse menu'}
          </button>
        </div>
      </aside>
    </>
  )
}
export default Sidebar
