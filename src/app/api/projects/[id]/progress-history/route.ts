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
      ...(from || to
        ? {
            logDate: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {}),
    },
    orderBy: { logDate: 'asc' },
    select: { id: true, logDate: true, progressPercent: true, workSummary: true },
  })

  return ok(
    logs.map((log) => ({
      id: log.id,
      logDate: log.logDate.toISOString(),
      progressPercent: log.progressPercent,
      workSummary: log.workSummary,
    }))
  )
}
