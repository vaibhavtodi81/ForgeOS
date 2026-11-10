import {
  ArrowDownToLine,
  ArrowUpFromLine,
  BarChart3,
  Boxes,
  Building2,
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
import { getCurrentRole, getAssignedProject } from '../../authentication/utils/permissions'

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
  const currentRole = getCurrentRole() || 'Admin'
  const isPm = currentRole === 'Project Manager'
  const assigned = getAssignedProject()
  const projectCode = assigned?.code || 'PRJ-001'

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
    { label: 'Vendors & Negotiations', href: '/app/vendors', icon: UsersRound },
    { label: 'Bills & Approvals', href: '/app/bills', icon: CreditCard },
  ]

  const managerItems: NavItem[] = [
    { label: 'Site Dashboard', href: '/app/pm/dashboard', icon: LayoutDashboard },
    { label: 'My Project', href: '/app/projects', icon: FolderKanban },
    { label: 'Daily Site Logs', href: '/app/daily-logs', icon: ClipboardList },
    { label: 'Progress History', href: `/projects/${projectCode}/progress`, icon: BarChart3 },
    { label: 'Site Material Planning', href: '/app/material-planning', icon: ClipboardCheck },
    { label: 'Available Stock', href: '/app/stock', icon: PackageSearch },
    { label: 'Stock IN (Deliveries)', href: '/app/stock-in', icon: ArrowDownToLine },
    { label: 'Stock OUT (Usage)', href: '/app/stock-out', icon: ArrowUpFromLine },
    { label: 'Stock Ledger', href: '/app/stock-ledger', icon: ScrollText },
    { label: 'Wastage', href: '/app/wastage', icon: TrendingUp },
    { label: 'Vendors', href: '/app/vendors', icon: UsersRound },
    { label: 'Bills', href: '/app/bills', icon: CreditCard },
    { label: 'Upload Bills & Challans', href: '/app/bills', icon: CreditCard },
  ]

  const navItems = isPm ? managerItems : adminItems

  return (
    <>
      {mobileOpen && (
        <button
          className="fixed inset-0 z-30 bg-[#323232]/30 lg:hidden"
          onClick={onCloseMobile}
          type="button"
          aria-label="Close navigation"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-[#E8E0DA] bg-[#FBF9F7] transition-all duration-200 lg:static lg:z-auto ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${collapsed ? 'w-[76px]' : 'w-[250px]'}`}
      >
        <div
          className={`flex h-16 shrink-0 items-center border-b border-[#E8E0DA] px-4 ${
            collapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          <a className="flex items-center gap-2" href="/">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#323232] text-xs font-bold text-[#F7F3EE]">
              F
            </span>
            {!collapsed && (
              <span className="text-sm font-bold tracking-[0.18em] text-[#323232]">
                FORGE<span className="font-light text-[#8E827A]">OS</span>
              </span>
            )}
          </a>

          {!collapsed && (
            <button
              className="hidden rounded-lg p-2 text-[#8E827A] hover:bg-[#E8E0DA] lg:block"
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
              <p className="px-3 pt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#A59A93]">
                {isPm ? 'Site Operations' : 'Administration'}
              </p>
              {isPm && assigned && (
                <div className="mx-2 mt-2 rounded-xl border border-[#E8DCD4] bg-[#F3E9E1] p-2.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#9A5E3A]">
                    <Building2 size={12} />
                    <span>Assigned Site</span>
                  </div>
                  <p className="mt-0.5 truncate text-xs font-bold text-[#323232]" title={assigned.name}>
                    {assigned.name}
                  </p>
                  <p className="text-[10px] font-mono text-[#8E827A]">{assigned.code}</p>
                </div>
              )}
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
                    ? 'bg-[#F3E9E1] font-semibold text-[#9A5E3A]'
                    : 'font-medium text-[#595552] hover:bg-[#F3E9E1] hover:text-[#9A5E3A]'
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

        <div className={`border-t border-[#E8E0DA] p-3 ${collapsed ? 'flex justify-center' : ''}`}>
          {!collapsed && (
            <div className="mb-3 rounded-xl bg-[#F3E9E1] p-3">
              <div className="flex items-center gap-2">
                <PackageCheck className="h-4 w-4 text-[#9A5E3A]" />
                <span className="text-xs font-semibold text-[#323232]">
                  {isPm ? 'Site milestone' : 'Portfolio progress'}
                </span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-white">
                <div className="h-full w-[65%] rounded-full bg-[#B87A4F]" />
              </div>
              <p className="mt-1 text-[10px] text-[#8E827A]">
                {isPm ? (assigned ? `${assigned.code} on schedule` : 'On track') : '5 projects active'}
              </p>
            </div>
          )}

          <button
            className="flex items-center gap-2 rounded-lg p-2 text-xs font-medium text-[#8E827A] hover:bg-[#E8E0DA]"
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
