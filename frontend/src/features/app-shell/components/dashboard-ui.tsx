import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface DashboardCardProps {
  children: ReactNode
  className?: string
  tone?: 'default' | 'featured'
}

export function DashboardCard({ children, className = '', tone = 'default' }: DashboardCardProps) {
  return (
    <div className={`dashboard-card ${tone === 'featured' ? 'dashboard-card-featured' : ''} ${className}`}>
      {children}
    </div>
  )
}

interface StatCardProps {
  label: string
  value: string
  note: string
  icon: LucideIcon
  accent?: 'amber' | 'green' | 'red' | 'violet'
}

export function StatCard({ label, value, note, icon: Icon, accent = 'amber' }: StatCardProps) {
  return (
    <DashboardCard className="dashboard-stat-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="dashboard-eyebrow">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[var(--dashboard-ink)]">{value}</p>
        </div>
        <span className={`dashboard-icon dashboard-icon-${accent}`}>
          <Icon size={18} strokeWidth={1.8} />
        </span>
      </div>
      <p className="mt-4 text-xs text-[var(--dashboard-muted)]">{note}</p>
    </DashboardCard>
  )
}

interface SectionTitleProps {
  title: string
  description?: string
  action?: ReactNode
}

export function SectionTitle({ title, description, action }: SectionTitleProps) {
  return (
    <div className="dashboard-section-title">
      <div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function StatusPill({ children, tone = 'amber' }: { children: ReactNode; tone?: 'amber' | 'green' | 'red' | 'violet' }) {
  return <span className={`dashboard-pill dashboard-pill-${tone}`}>{children}</span>
}

export function ProgressBar({ value, color = 'amber' }: { value: number; color?: 'amber' | 'green' | 'red' }) {
  return (
    <div className="dashboard-progress-track" aria-label={`${value}% complete`}>
      <div className={`dashboard-progress-fill dashboard-progress-${color}`} style={{ width: `${value}%` }} />
    </div>
  )
}

export function Sparkline({ points, label }: { points: string; label: string }) {
  return (
    <svg className="dashboard-sparkline" viewBox="0 0 240 72" preserveAspectRatio="none" role="img" aria-label={label}>
      <path d={`${points} L240 72 L0 72 Z`} className="dashboard-sparkline-fill" />
      <path d={points} className="dashboard-sparkline-line" />
    </svg>
  )
}
