import type { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { fail, getClientIp, guardAuth, ok, readJson } from '@/lib/api-helpers'
import { writeAudit } from '@/lib/audit'

const INCLUDE = {
  land: { select: { id: true, name: true, addressLine: true, city: true, state: true, pincode: true } },
  assignedPm: { select: { id: true, name: true, email: true } },
  _count: { select: { logs: true, transactions: true, plans: true, milestones: true, invoices: true } },
} satisfies Prisma.ProjectInclude

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await guardAuth(req, ['ADMIN'])
  if (!auth.ok) return auth.response
  const { user } = auth
  const { id } = await params

  const body = await readJson<Record<string, unknown>>(req)
  if (!body) return fail('Invalid request body', 400)

  const project = await db.project.findUnique({ where: { id } })
  if (!project) return fail('Project not found', 404)

  let assignedPmId: string | null = null
  if (body.pmId !== null && body.pmId !== undefined && body.pmId !== '') {
    if (typeof body.pmId !== 'string') return fail('Invalid pmId', 400)
    const pm = await db.user.findUnique({ where: { id: body.pmId } })
    if (!pm || !pm.isActive || pm.role !== 'PM') {
      return fail('pmId must reference an active PM', 400)
    }
    assignedPmId = pm.id
  }
  if (assignedPmId === project.assignedPmId) {
    const unchanged = await db.project.findUnique({ where: { id }, include: INCLUDE })
    return ok({ project: unchanged })
  }

  const updated = await db.project.update({ where: { id }, data: { assignedPmId }, include: INCLUDE })

  await writeAudit({
    action: 'ASSIGN',
    actorId: user.id,
    actorName: user.name,
    entityType: 'project',
    entityId: id,
    projectId: id,
    meta: { from: project.assignedPmId, to: assignedPmId },
    ip: getClientIp(req),
  })

  return ok({ project: updated })
}
