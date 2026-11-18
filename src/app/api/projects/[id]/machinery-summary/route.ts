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
      machineryEntries: { select: { machineName: true, hoursUsed: true, fuelLitres: true } },
    },
  })

  const byMachine = new Map<string, { hoursUsed: number; fuelConsumption: number; entries: number }>()
  let totalMachineryHours = 0
  let totalFuelConsumption = 0
  let totalMachineryEntries = 0
  for (const log of logs) {
    for (const entry of log.machineryEntries) {
      const fuel = entry.fuelLitres ?? 0
      totalMachineryHours += entry.hoursUsed
      totalFuelConsumption += fuel
      totalMachineryEntries += 1
      const current = byMachine.get(entry.machineName) ?? { hoursUsed: 0, fuelConsumption: 0, entries: 0 }
      current.hoursUsed += entry.hoursUsed
      current.fuelConsumption += fuel
      current.entries += 1
      byMachine.set(entry.machineName, current)
    }
  }

  return ok({
    totalMachineryHours,
    totalFuelConsumption,
    totalMachineryEntries,
    byMachine: [...byMachine.entries()]
      .map(([machineName, totals]) => ({ machineName, ...totals }))
      .sort((a, b) => b.hoursUsed - a.hoursUsed),
  })
}
