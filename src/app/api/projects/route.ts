import { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { fail, getClientIp, guardAuth, num, ok, optString, pageMeta, parsePagination, parseDay, readJson } from '@/lib/api-helpers'
import { writeAudit } from '@/lib/audit'
import { PROJECT_STATUSES } from '@/lib/forgeos-types'
import type { ProjectStatus } from '@/lib/forgeos-types'

type ProjectWithRefs = Prisma.ProjectGetPayload<{
  include: {
    land: { select: { id: true; name: true; addressLine: true; city: true; state: true; pincode: true } }
    assignedPm: { select: { id: true; name: true; email: true } }
  }
}>

function toProjectJson(p: ProjectWithRefs) {
  return {
    id: p.id,
    code: p.code,
    name: p.name,
    description: p.description,
    location: p.location,
    status: p.status as ProjectStatus,
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
  }
}

export async function GET(req: Request) {
  const auth = await guardAuth(req)
  if (!auth.ok) return auth.response
  const { user } = auth

  const url = new URL(req.url)
  const { page, limit, offset } = parsePagination(url, 20)

  const where: Prisma.ProjectWhereInput = {}
  if (user.role === 'PM') {
    where.assignedPmId = user.id
  } else {
    const pmId = url.searchParams.get('pmId')
    if (pmId) where.assignedPmId = pmId
  }
  const status = url.searchParams.get('status')
  if (status) {
    if (!PROJECT_STATUSES.includes(status as ProjectStatus)) return fail('Invalid status filter', 400)
    where.status = status
  }
  const search = url.searchParams.get('search')?.trim()
  if (search) {
    where.OR = [{ name: { contains: search } }, { code: { contains: search } }]
  }

  const include = {
    land: { select: { id: true, name: true, addressLine: true, city: true, state: true, pincode: true } },
    assignedPm: { select: { id: true, name: true, email: true } },
  }

  const [total, projects] = await Promise.all([
    db.project.count({ where }),
    db.project.findMany({ where, include, orderBy: { createdAt: 'desc' }, skip: offset, take: limit }),
  ])

  return ok(projects.map(toProjectJson), pageMeta(page, limit, total))
}

export async function POST(req: Request) {
  const auth = await guardAuth(req, ['ADMIN'])
  if (!auth.ok) return auth.response
  const { user } = auth

  const body = await readJson<Record<string, unknown>>(req)
  if (!body) return fail('Invalid request body', 400)

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  if (name.length < 3) return fail('Name must be at least 3 characters', 400)

  const landId = typeof body.landId === 'string' ? body.landId : ''
  const land = landId ? await db.land.findUnique({ where: { id: landId } }) : null
  if (!land) return fail('Land not found', 404)

  let assignedPmId: string | null = null
  if (body.assignedPmId !== undefined && body.assignedPmId !== null && body.assignedPmId !== '') {
    if (typeof body.assignedPmId !== 'string') return fail('Invalid assignedPmId', 400)
    const pm = await db.user.findUnique({ where: { id: body.assignedPmId } })
    if (!pm || !pm.isActive || pm.role !== 'PM') {
      return fail('assignedPmId must reference an active PM', 400)
    }
    assignedPmId = pm.id
  }

  const totalBudget = num(body.totalBudget)
  if (!(totalBudget > 0)) return fail('Total budget must be greater than zero', 400)

  const startDate = parseDay(body.startDate)
  if (!startDate) return fail('A valid start date (YYYY-MM-DD) is required', 400)

  let expectedEndDate: Date | null = null
  if (body.expectedEndDate !== undefined && body.expectedEndDate !== null && body.expectedEndDate !== '') {
    expectedEndDate = parseDay(body.expectedEndDate)
    if (!expectedEndDate) return fail('Invalid expected end date', 400)
    if (expectedEndDate.getTime() <= startDate.getTime()) {
      return fail('Expected end date must be after the start date', 400)
    }
  }

  let wastageThresholdPct = 10
  if (body.wastageThresholdPct !== undefined && body.wastageThresholdPct !== null) {
    const pct = num(body.wastageThresholdPct)
    if (!(pct >= 0 && pct <= 100)) return fail('Wastage threshold must be between 0 and 100', 400)
    wastageThresholdPct = pct
  }

  const include = {
    land: { select: { id: true, name: true, addressLine: true, city: true, state: true, pincode: true } },
    assignedPm: { select: { id: true, name: true, email: true } },
  }

  const base = (await db.project.count()) + 1
  let created: ProjectWithRefs | null = null
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = `FOS-${String(base + attempt).padStart(3, '0')}`
    try {
      created = await db.project.create({
        data: {
          code,
          name,
          description: optString(body.description),
          location: optString(body.location),
          landId,
          status: 'PLANNING',
          startDate,
          expectedEndDate,
          totalBudget,
          wastageThresholdPct,
          assignedPmId,
          createdById: user.id,
        },
        include,
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
    entityType: 'project',
    entityId: created.id,
    projectId: created.id,
    meta: { name: created.name, code: created.code, totalBudget: created.totalBudget },
    ip: getClientIp(req),
  })

  return ok({ project: toProjectJson(created) })
}
