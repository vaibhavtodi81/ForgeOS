import type { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { fail, getClientIp, guardAuth, num, ok, optString, parseDay, pmOwns, readJson } from '@/lib/api-helpers'
import { writeAudit } from '@/lib/audit'

type ProjectWithRefs = Prisma.ProjectGetPayload<{
  include: {
    land: { select: { id: true; name: true; addressLine: true; city: true; state: true; pincode: true } }
    assignedPm: { select: { id: true; name: true; email: true } }
    _count: { select: { logs: true; transactions: true; plans: true; milestones: true; invoices: true } }
  }
}>

const INCLUDE = {
  land: { select: { id: true, name: true, addressLine: true, city: true, state: true, pincode: true } },
  assignedPm: { select: { id: true, name: true, email: true } },
  _count: { select: { logs: true, transactions: true, plans: true, milestones: true, invoices: true } },
} satisfies Prisma.ProjectInclude

function toProjectJson(p: ProjectWithRefs) {
  return {
    id: p.id,
    code: p.code,
    name: p.name,
    description: p.description,
    location: p.location,
    status: p.status,
    startDate: p.startDate ? p.startDate.toISOString() : null,
    expectedEndDate: p.expectedEndDate ? p.expectedEndDate.toISOString() : null,
    actualEndDate: p.actualEndDate ? p.actualEndDate.toISOString() : null,
    totalBudget: p.totalBudget,
    wastageThresholdPct: p.wastageThresholdPct,
    landId: p.landId,
    assignedPmId: p.assignedPmId,
    assignedPm: p.assignedPm,
    land: p.land,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    _count: {
      logs: p._count.logs,
      transactions: p._count.transactions,
      plans: p._count.plans,
      milestones: p._count.milestones,
      invoices: p._count.invoices,
    },
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await guardAuth(req)
  if (!auth.ok) return auth.response
  const { id } = await params

  const project = await db.project.findUnique({ where: { id }, include: INCLUDE })
  if (!project) return fail('Project not found', 404)
  if (!pmOwns(auth.user, project.assignedPmId)) {
    return fail('You are not assigned to this project', 403)
  }

  return ok(toProjectJson(project))
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await guardAuth(req, ['ADMIN'])
  if (!auth.ok) return auth.response
  const { user } = auth
  const { id } = await params

  const body = await readJson<Record<string, unknown>>(req)
  if (!body) return fail('Invalid request body', 400)

  const project = await db.project.findUnique({ where: { id } })
  if (!project) return fail('Project not found', 404)

  const data: Prisma.ProjectUncheckedUpdateInput = {}
  const changes: Record<string, unknown> = {}

  if (body.name !== undefined) {
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    if (name.length < 3) return fail('Name must be at least 3 characters', 400)
    if (name !== project.name) {
      data.name = name
      changes.name = name
    }
  }
  if (body.description !== undefined) {
    const description = optString(body.description)
    if (description !== project.description) {
      data.description = description
      changes.description = description
    }
  }
  if (body.location !== undefined) {
    const location = optString(body.location)
    if (location !== project.location) {
      data.location = location
      changes.location = location
    }
  }
  if (body.landId !== undefined) {
    const landId = typeof body.landId === 'string' ? body.landId : ''
    const land = landId ? await db.land.findUnique({ where: { id: landId } }) : null
    if (!land) return fail('Land not found', 404)
    if (landId !== project.landId) {
      data.landId = landId
      changes.landId = landId
    }
  }
  if (body.totalBudget !== undefined) {
    const totalBudget = num(body.totalBudget)
    if (!(totalBudget > 0)) return fail('Total budget must be greater than zero', 400)
    if (totalBudget !== project.totalBudget) {
      data.totalBudget = totalBudget
      changes.totalBudget = totalBudget
    }
  }
  if (body.wastageThresholdPct !== undefined) {
    const pct = num(body.wastageThresholdPct)
    if (!(pct >= 0 && pct <= 100)) return fail('Wastage threshold must be between 0 and 100', 400)
    if (pct !== project.wastageThresholdPct) {
      data.wastageThresholdPct = pct
      changes.wastageThresholdPct = pct
    }
  }

  let newStart: Date | null = project.startDate
  if (body.startDate !== undefined) {
    if (body.startDate === null || body.startDate === '') {
      newStart = null
    } else {
      const d = parseDay(body.startDate)
      if (!d) return fail('A valid start date (YYYY-MM-DD) is required', 400)
      newStart = d
    }
  }
  if (!newStart) return fail('Start date cannot be removed', 400)

  let newEnd: Date | null = project.expectedEndDate
  if (body.expectedEndDate !== undefined) {
    if (body.expectedEndDate === null || body.expectedEndDate === '') {
      newEnd = null
    } else {
      const d = parseDay(body.expectedEndDate)
      if (!d) return fail('Invalid expected end date', 400)
      newEnd = d
    }
  }
  if (newEnd && newEnd.getTime() <= newStart.getTime()) {
    return fail('Expected end date must be after the start date', 400)
  }
  if (newStart.getTime() !== project.startDate.getTime()) {
    data.startDate = newStart
    changes.startDate = newStart.toISOString()
  }
  if ((newEnd?.getTime() ?? null) !== (project.expectedEndDate?.getTime() ?? null)) {
    data.expectedEndDate = newEnd
    changes.expectedEndDate = newEnd ? newEnd.toISOString() : null
  }

  const updated = await db.project.update({ where: { id }, data, include: INCLUDE })

  if (Object.keys(changes).length > 0) {
    await writeAudit({
      action: 'PROJECT_UPDATE',
      actorId: user.id,
      actorName: user.name,
      entityType: 'project',
      entityId: id,
      projectId: id,
      meta: changes,
      ip: getClientIp(req),
    })
  }

  return ok({ project: toProjectJson(updated) })
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await guardAuth(req, ['ADMIN'])
  if (!auth.ok) return auth.response
  const { user } = auth
  const { id } = await params

  const project = await db.project.findUnique({
    where: { id },
    include: { _count: { select: { plans: true, transactions: true, logs: true, milestones: true, invoices: true } } },
  })
  if (!project) return fail('Project not found', 404)

  const counts = [
    project._count.plans,
    project._count.transactions,
    project._count.logs,
    project._count.milestones,
    project._count.invoices,
  ]
  if (counts.some((c) => c > 0)) {
    return fail('Project cannot be deleted while dependent records exist', 409)
  }

  await db.project.delete({ where: { id } })
  await writeAudit({
    action: 'PROJECT_DELETE',
    actorId: user.id,
    actorName: user.name,
    entityType: 'project',
    entityId: id,
    meta: { name: project.name, code: project.code },
    ip: getClientIp(req),
  })

  return ok(null)
}
