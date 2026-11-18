import { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { ok, fail, guardAuth, readJson } from '@/lib/api-helpers'
import { writeAudit } from '@/lib/audit'
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

  const project = await db.project.findUnique({ where: { id } })
  if (!project) return fail('Project not found', 404)

  let pmId: string | null = null
  let pmName = 'Unassigned'
  if (body.pmId !== null && body.pmId !== undefined && body.pmId !== '') {
    if (typeof body.pmId !== 'string') return fail('Invalid manager id')
    const pm = await db.user.findUnique({ where: { id: body.pmId } })
    if (!pm || !pm.isActive || pm.role !== 'PROJECT_MANAGER') {
      return fail('Assigned manager must be an active Project Manager')
    }
    pmId = pm.id
    pmName = pm.name
  }

  const updated = await db.project.update({
    where: { id },
    data: { pmId },
    include: { land: true, pm: true },
  })

  await writeAudit({
    action: 'PM_ASSIGN',
    actorId: user.id,
    actorName: user.name,
    entityType: 'PROJECT',
    entityId: id,
    meta: { pmName, projectName: project.name },
  })

  return ok({ project: toProjectRow(updated, await projectStats(updated.id)) })
}
