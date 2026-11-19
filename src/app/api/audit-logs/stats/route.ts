import { db } from '@/lib/db'
import { guardAuth, ok } from '@/lib/api-helpers'
import { requirePermission } from '@/lib/rbac'
import type { AuditStatsResponse } from '@/lib/forgeos-types'

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export async function GET(req: Request) {
  const auth = await requirePermission(req, 'audit:read')
  if (!auth.ok) return auth.response

  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6)

  const [logs, recent] = await Promise.all([
    db.auditLog.findMany({ select: { action: true, actorName: true } }),
    db.auditLog.findMany({ where: { createdAt: { gte: start } }, select: { createdAt: true } }),
  ])

  const total = logs.length

  const actionCounts = new Map<string, number>()
  const actorCounts = new Map<string, number>()
  for (const log of logs) {
    actionCounts.set(log.action, (actionCounts.get(log.action) ?? 0) + 1)
    if (log.actorName) {
      actorCounts.set(log.actorName, (actorCounts.get(log.actorName) ?? 0) + 1)
    }
  }
  const byAction = [...actionCounts.entries()]
    .map(([action, count]) => ({ action, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
  const byActor = [...actorCounts.entries()]
    .map(([actorName, count]) => ({ actorName, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)

  const countByDay = new Map<string, number>()
  const days: { date: string; label: string }[] = []
  const cursor = new Date(start)
  for (let i = 0; i < 7; i++) {
    const date = dayKey(cursor)
    days.push({ date, label: `${WEEKDAY_LABELS[cursor.getDay()]} ${cursor.getDate()}` })
    countByDay.set(date, 0)
    cursor.setDate(cursor.getDate() + 1)
  }
  for (const log of recent) {
    const key = dayKey(log.createdAt)
    const current = countByDay.get(key)
    if (current !== undefined) countByDay.set(key, current + 1)
  }
  const last7Days = days.map((d) => ({ ...d, count: countByDay.get(d.date) ?? 0 }))

  const response: AuditStatsResponse = { total, byAction, byActor, last7Days }
  return ok(response)
}
