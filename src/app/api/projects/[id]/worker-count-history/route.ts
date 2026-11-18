import { db } from '@/lib/db'
import { fail, guardAuth, ok, parseDay, pmOwns } from '@/lib/api-helpers'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await guardAuth(req)
  if (!auth.ok) return auth.response
  const { id } = await params

  const project = await db.project.findUnique({ where: { id } })
  if (!project) return fail('Project not found', 404)
  if (!pmOwns(auth.user, project.assignedPmId)) {
    return fail('You are not assigned to this project', 403)
  }

  const url = new URL(req.url)
  const from = parseDay(url.searchParams.get('from'))
  const to = parseDay(url.searchParams.get('to'))

  const logs = await db.dailyLog.findMany({
    where: {
      projectId: id,
      ...(from || to ? { logDate: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}),
    },
    orderBy: { logDate: 'asc' },
    select: {
      id: true,
      logDate: true,
      labourEntries: { select: { trade: true, headCount: true, hoursWorked: true } },
    },
  })

  return ok(
    logs.map((log) => {
      const byTrade = new Map<string, { workerCount: number; labourHours: number; entries: number }>()
      let totalWorkerCount = 0
      let labourHours = 0
      for (const entry of log.labourEntries) {
        totalWorkerCount += entry.headCount
        labourHours += entry.hoursWorked
        const current = byTrade.get(entry.trade) ?? { workerCount: 0, labourHours: 0, entries: 0 }
        current.workerCount += entry.headCount
        current.labourHours += entry.hoursWorked
        current.entries += 1
        byTrade.set(entry.trade, current)
      }
      return {
        dailyLogId: log.id,
        logDate: log.logDate.toISOString(),
        totalWorkerCount,
        labourHours,
        byTrade: [...byTrade.entries()].map(([trade, totals]) => ({ trade, ...totals })),
      }
    })
  )
}
