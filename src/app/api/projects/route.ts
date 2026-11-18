import { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { ok, fail, guardAuth, parsePagination, readJson, parseDate } from '@/lib/api-helpers'
import { writeAudit } from '@/lib/audit'
import { PROJECT_STATUSES } from '@/lib/forgeos-types'
import type { ProjectRow, ProjectStatus } from '@/lib/forgeos-types'

type ProjectWithRefs = Prisma.ProjectGetPayload<{ include: { land: true; pm: true } }>

function num(value: unknown): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    if (!Number.isNaN(parsed)) return parsed
  }
  return NaN
}

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

export async function GET(req: Request) {
  const auth = await guardAuth(req)
  if (!auth.ok) return auth.response
  const { user } = auth

  const url = new URL(req.url)
  const { page, limit, offset } = parsePagination(url, 20)

  const where: Prisma.ProjectWhereInput = {}
  if (user.role === 'PROJECT_MANAGER') {
    where.pmId = user.id
  } else {
    const pmId = url.searchParams.get('pmId')
    if (pmId) where.pmId = pmId
  }
  const status = url.searchParams.get('status')
  if (status) {
    if (!PROJECT_STATUSES.includes(status as ProjectStatus)) return fail('Invalid status filter')
    where.status = status
  }
  const search = url.searchParams.get('search')
  if (search) {
    where.OR = [{ name: { contains: search } }, { code: { contains: search } }]
  }

  const [total, projects] = await Promise.all([
    db.project.count({ where }),
    db.project.findMany({
      where,
      include: { land: true, pm: true },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    }),
  ])

  const items = await Promise.all(
    projects.map(async (p) => toProjectRow(p, await projectStats(p.id)))
  )

  return ok({ items, total, page, limit })
}

export async function POST(req: Request) {
  const auth = await guardAuth(req, ['ADMIN'])
  if (!auth.ok) return auth.response
  const { user } = auth

  const body = await readJson<Record<string, unknown>>(req)
  if (!body) return fail('Invalid request body')

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  if (name.length < 3) return fail('Name must be at least 3 characters')

  const landId = typeof body.landId === 'string' ? body.landId : ''
  const land = landId ? await db.land.findUnique({ where: { id: landId } }) : null
  if (!land) return fail('Land not found')

  let pmId: string | null = null
  if (typeof body.pmId === 'string' && body.pmId) {
    const pm = await db.user.findUnique({ where: { id: body.pmId } })
    if (!pm || !pm.isActive || pm.role !== 'PROJECT_MANAGER') {
      return fail('Assigned manager must be an active Project Manager')
    }
    pmId = pm.id
  }

  const budget = num(body.budget)
  if (!(budget > 0)) return fail('Budget must be greater than zero')

  const startDate = parseDate(body.startDate)
  if (!startDate) return fail('Valid start date is required')

  let plannedEndDate: Date | null = null
  const hasEnd = body.plannedEndDate !== undefined && body.plannedEndDate !== null && body.plannedEndDate !== ''
  if (hasEnd) {
    plannedEndDate = parseDate(body.plannedEndDate)
    if (!plannedEndDate) return fail('Invalid planned end date')
    if (plannedEndDate.getTime() < startDate.getTime()) {
      return fail('Planned end date must be after the start date')
    }
  }

  const base = (await db.project.count()) + 1
  let created: ProjectWithRefs | null = null
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = `FOS-${String(base + attempt).padStart(3, '0')}`
    try {
      created = await db.project.create({
        data: { code, name, landId, pmId, budget, startDate, plannedEndDate, status: 'PLANNING' },
        include: { land: true, pm: true },
      })
      break
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') continue
      throw err
    }
  }
  if (!created) return fail('Could not generate a unique project code', 500)

  await writeAudit({
    action: 'PROJECT_CREATE',
    actorId: user.id,
    actorName: user.name,
    entityType: 'PROJECT',
    entityId: created.id,
    meta: { name: created.name, code: created.code, budget: created.budget },
  })

  return ok({ project: toProjectRow(created, { spend: 0, invoiced: 0, collected: 0 }) })
}
