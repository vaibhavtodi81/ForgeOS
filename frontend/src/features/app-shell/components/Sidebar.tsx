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
  UsersRound,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
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

export function Sidebar({
  currentPath,
  collapsed,
  mobileOpen,
  onCloseMobile,
  onToggleCollapsed,
}: SidebarProps) {
  const { user } = useAuth()
  const isPm = user?.role === 'PM'

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
    { label: 'Bills & Approvals', href: '/app/bills', icon: CreditCard },
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
    { label: 'Bills', href: '/app/bills', icon: CreditCard },
    { label: 'Create Bill', href: '/app/bills/upload', icon: CreditCard },
  ]

  const navItems = isPm ? managerItems : adminItems

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
          <a className="flex items-center gap-2" href="/">
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
              (label.includes('Progress') && currentPath.endsWith('/progress'))

            return (
              <a
                className={`mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                  active
                    ? 'bg-[#F2A65A]/15 font-semibold text-[#F2A65A]'
                    : 'font-medium text-white/55 hover:bg-white/[0.07] hover:text-white'
                } ${collapsed ? 'justify-center' : ''}`}
                href={href}
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
                <div className="h-full w-[65%] rounded-full bg-[#F2A65A]" />
              </div>
              <p className="mt-1 text-[10px] text-white/35">
                {isPm ? 'Project-scoped progress' : 'Portfolio overview'}
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
