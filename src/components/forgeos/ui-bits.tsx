'use client'

import type { LucideIcon } from 'lucide-react'
import { AlertTriangle, ChevronLeft, ChevronRight, Inbox, RefreshCw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { BADGE_CLASSES } from '@/lib/forgeos-types'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Page header
// ---------------------------------------------------------------------------

export function PageHeader({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------------------

type StatTone = 'default' | 'warning' | 'danger' | 'success'

const toneClasses: Record<StatTone, string> = {
  default: 'text-foreground',
  warning: 'text-amber-600 dark:text-amber-400',
  danger: 'text-red-600 dark:text-red-400',
  success: 'text-emerald-600 dark:text-emerald-400',
}

const toneIconBg: Record<StatTone, string> = {
  default: 'bg-primary/10 text-primary',
  warning: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  danger: 'bg-red-500/15 text-red-600 dark:text-red-400',
  success: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
}

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  tone = 'default',
}: {
  label: string
  value: React.ReactNode
  sub?: React.ReactNode
  icon?: LucideIcon
  tone?: StatTone
}) {
  return (
    <Card>
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className={cn('mt-1.5 text-xl font-semibold tabular-nums sm:text-2xl', toneClasses[tone])}>{value}</p>
            {sub ? <p className="mt-1 truncate text-xs text-muted-foreground">{sub}</p> : null}
          </div>
          {Icon ? (
            <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', toneIconBg[tone])}>
              <Icon className="h-4.5 w-4.5" aria-hidden />
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Section card
// ---------------------------------------------------------------------------

export function SectionCard({
  title,
  description,
  actions,
  children,
  className,
  contentClassName,
}: {
  title?: string
  description?: string
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
  contentClassName?: string
}) {
  return (
    <Card className={className}>
      {title ? (
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base">{title}</CardTitle>
              {description ? <p className="mt-1 text-xs text-muted-foreground">{description}</p> : null}
            </div>
            {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
          </div>
        </CardHeader>
      ) : null}
      <CardContent className={cn(title ? 'pt-0' : 'p-4 sm:p-6', contentClassName)}>{children}</CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Loading / empty / error
// ---------------------------------------------------------------------------

export function LoadingRows({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  )
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
}: {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted">
        <Icon className="h-5 w-5 text-muted-foreground" aria-hidden />
      </div>
      <p className="text-sm font-medium">{title}</p>
      {description ? <p className="max-w-sm text-xs text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-500/10">
        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" aria-hidden />
      </div>
      <div>
        <p className="text-sm font-medium">Something went wrong</p>
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">{message}</p>
      </div>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw aria-hidden /> Retry
        </Button>
      ) : null}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Status badge (works for any enum value with a BADGE_CLASSES entry)
// ---------------------------------------------------------------------------

export function StatusBadge({ value, label }: { value: string; label?: string }) {
  const cls = BADGE_CLASSES[value]
  return (
    <Badge variant="outline" className={cn('whitespace-nowrap', cls)}>
      {label ?? value.replaceAll('_', ' ')}
    </Badge>
  )
}

// ---------------------------------------------------------------------------
// Table pagination
// ---------------------------------------------------------------------------

export function TablePagination({
  page,
  limit,
  total,
  onPageChange,
}: {
  page: number
  limit: number
  total: number
  onPageChange: (page: number) => void
}) {
  const totalPages = Math.max(1, Math.ceil(total / limit))
  if (total === 0) return null
  const from = (page - 1) * limit + 1
  const to = Math.min(total, page * limit)
  return (
    <div className="flex flex-col-reverse items-center justify-between gap-2 pt-3 sm:flex-row">
      <p className="text-xs text-muted-foreground">
        Showing <span className="font-medium text-foreground">{from}–{to}</span> of{' '}
        <span className="font-medium text-foreground">{total}</span>
      </p>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => onPageChange(page - 1)} aria-label="Previous page">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="px-2 text-xs tabular-nums text-muted-foreground">
          {page} / {totalPages}
        </span>
        <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} aria-label="Next page">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
