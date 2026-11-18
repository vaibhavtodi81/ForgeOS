import { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { ok, fail, guardAuth, readJson } from '@/lib/api-helpers'
import { writeAudit } from '@/lib/audit'
import { ALLOWED_PROJECT_TRANSITIONS, PROJECT_STATUSES } from '@/lib/forgeos-types'
import type { ProjectRow, ProjectStatus } from '@/lib/forgeos-types'

type ProjectWithRefs = Prisma.ProjectGetPayload<{ include: { land: true; pm: true } }>

async function projectStats(projectId: string) {
  const txns = await db.inventoryTransaction.findMany({
    where: { projectId, txnType: 'IN', voidedAt: null },
    select: { quantity: true, unitRate: true },
  })
  const spend = txns.reduce((sum, t) => sum + t.quantity * t.unitRate, 0)

  const invoices = await db.invoice.findMany({
    where: { projectId, status: { notIn: ['DRAFT', 'VOID'] } },
    select: { id: true, amount: true, gstPct: true },
  })
  const invoiced = invoices.reduce((sum, i) => sum + i.amount * (1 + i.gstPct / 100), 0)

  let collected = 0
  if (invoices.length > 0) {
    const payments = await db.payment.findMany({
      where: { invoiceId: { in: invoices.map((i) => i.id) } },
      select: { amount: true },
    })
    collected = payments.reduce((sum, p) => sum + p.amount, 0)
  }

  return { spend, invoiced, collected }
}

function toProjectRow(
  p: ProjectWithRefs,
  stats: { spend: number; invoiced: number; collected: number }
): ProjectRow {
  return {
    id: p.id,
    code: p.code,
    name: p.name,
    status: p.status as ProjectStatus,
    budget: p.budget,
    startDate: p.startDate.toISOString(),
    plannedEndDate: p.plannedEndDate ? p.plannedEndDate.toISOString() : null,
    actualEndDate: p.actualEndDate ? p.actualEndDate.toISOString() : null,
    landId: p.landId,
    landName: p.land.name,
    pmId: p.pmId,
    pmName: p.pm ? p.pm.name : null,
    spend: stats.spend,
    invoiced: stats.invoiced,
    collected: stats.collected,
    createdAt: p.createdAt.toISOString(),
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await guardAuth(req, ['ADMIN'])
  if (!auth.ok) return auth.response
  const { user } = auth
  const { id } = await params

  const body = await readJson<Record<string, unknown>>(req)
  if (!body) return fail('Invalid request body')

  const status = body.status
  if (typeof status !== 'string' || !PROJECT_STATUSES.includes(status as ProjectStatus)) {
    return fail('Invalid status')
  }

  const project = await db.project.findUnique({ where: { id } })
  if (!project) return fail('Project not found', 404)

  const current = project.status as ProjectStatus
  const allowed = ALLOWED_PROJECT_TRANSITIONS[current]
  if (!allowed.includes(status as ProjectStatus)) {
    const targets = allowed.length > 0 ? allowed.join(', ') : 'none'
    return fail(`Cannot move a ${current} project to ${status} (allowed: ${targets})`)
  }

  const data: Prisma.ProjectUncheckedUpdateInput = { status }
  if (status === 'COMPLETED') data.actualEndDate = new Date()

  const updated = await db.project.update({
    where: { id },
    data,
    include: { land: true, pm: true },
  })

  await writeAudit({
    action: 'PROJECT_STATUS_CHANGE',
    actorId: user.id,
    actorName: user.name,
    entityType: 'PROJECT',
    entityId: id,
    meta: { from: current, to: status },
  })

  return ok({ project: toProjectRow(updated, await projectStats(updated.id)) })
}
