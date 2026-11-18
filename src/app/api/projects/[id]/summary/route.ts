import { db } from '@/lib/db'
import { fail, guardAuth, ok, pmOwns } from '@/lib/api-helpers'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await guardAuth(req)
  if (!auth.ok) return auth.response
  const { id } = await params

  const project = await db.project.findUnique({ where: { id } })
  if (!project) return fail('Project not found', 404)
  if (!pmOwns(auth.user, project.assignedPmId)) {
    return fail('You are not assigned to this project', 403)
  }

  const logs = await db.dailyLog.findMany({
    where: { projectId: id },
    orderBy: { logDate: 'desc' },
    select: {
      id: true,
      logDate: true,
      progressPercent: true,
      labourEntries: { select: { headCount: true, hoursWorked: true } },
      machineryEntries: { select: { hoursUsed: true, fuelLitres: true } },
    },
  })

  const latest = logs[0]
  return ok({
    latestProgressPercent: latest?.progressPercent ?? 0,
    latestLogDate: latest ? latest.logDate.toISOString() : null,
    totalDailyLogs: logs.length,
    totalLabourHeadCount: logs.reduce(
      (total, log) => total + log.labourEntries.reduce((sum, e) => sum + e.headCount, 0),
      0
    ),
    totalLabourHours: logs.reduce(
      (total, log) => total + log.labourEntries.reduce((sum, e) => sum + e.hoursWorked, 0),
      0
    ),
    totalMachineryHours: logs.reduce(
      (total, log) => total + log.machineryEntries.reduce((sum, e) => sum + e.hoursUsed, 0),
      0
    ),
    totalMachineryFuel: logs.reduce(
      (total, log) => total + log.machineryEntries.reduce((sum, e) => sum + (e.fuelLitres ?? 0), 0),
      0
    ),
  })
}
