import type { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { fail, getClientIp, guardAuth, num, ok, optString, pageMeta, parsePagination, readJson, parseDay } from '@/lib/api-helpers'
import { requirePermission } from '@/lib/rbac'
import { writeAudit } from '@/lib/audit'
import { AREA_UNITS } from '@/lib/forgeos-types'
import type { AreaUnit } from '@/lib/forgeos-types'

type LandWithCount = Prisma.LandGetPayload<{ include: { _count: { select: { projects: true } } } }>

function toLandRow(land: LandWithCount) {
  return {
    id: land.id,
    name: land.name,
    addressLine: land.addressLine,
    city: land.city,
    state: land.state,
    pincode: land.pincode,
    areaValue: land.areaValue,
    areaUnit: land.areaUnit as AreaUnit,
    surveyNumber: land.surveyNumber,
    ownerName: land.ownerName,
    purchaseDate: land.purchaseDate ? land.purchaseDate.toISOString() : null,
    purchaseCost: land.purchaseCost,
    notes: land.notes,
    createdById: land.createdById,
    createdAt: land.createdAt.toISOString(),
    updatedAt: land.updatedAt.toISOString(),
    projects: land._count.projects,
  }
}

export async function GET(req: Request) {
  const auth = await guardAuth(req)
  if (!auth.ok) return auth.response

  const url = new URL(req.url)
  const { page, limit, offset } = parsePagination(url, 20)
  const search = url.searchParams.get('search')?.trim()

  const where: Prisma.LandWhereInput = {}
  if (auth.user.role === 'PM') {
    where.projects = { some: { assignedPmId: auth.user.id } }
  }
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { city: { contains: search } },
      { state: { contains: search } },
    ]
  }

  const [lands, total] = await Promise.all([
    db.land.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
      include: { _count: { select: { projects: true } } },
    }),
    db.land.count({ where }),
  ])

  return ok(lands.map(toLandRow), pageMeta(page, limit, total))
}

export async function POST(req: Request) {
  const auth = await requirePermission(req, 'lands:write')
  if (!auth.ok) return auth.response

  const body = await readJson<Record<string, unknown>>(req)
  if (!body) return fail('Invalid request body', 400)

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const city = typeof body.city === 'string' ? body.city.trim() : ''
  const state = typeof body.state === 'string' ? body.state.trim() : ''
  if (name.length < 2) return fail('Name must be at least 2 characters', 400)
  if (city.length < 2) return fail('City must be at least 2 characters', 400)
  if (state.length < 2) return fail('State must be at least 2 characters', 400)

  const areaUnit = typeof body.areaUnit === 'string' ? body.areaUnit : ''
  if (!AREA_UNITS.includes(areaUnit as AreaUnit)) {
    return fail(`areaUnit must be one of: ${AREA_UNITS.join(', ')}`, 400)
  }
  const areaValue = num(body.areaValue)
  if (!(areaValue > 0)) return fail('Area value must be greater than zero', 400)

  let purchaseCost: number | null = null
  if (body.purchaseCost !== undefined && body.purchaseCost !== null && body.purchaseCost !== '') {
    const cost = num(body.purchaseCost)
    if (!(cost >= 0)) return fail('Purchase cost must be zero or more', 400)
    purchaseCost = cost
  }
  const purchaseDate = parseDay(body.purchaseDate)

  const land = await db.land.create({
    data: {
      name,
      addressLine: optString(body.addressLine),
      city,
      state,
      pincode: optString(body.pincode),
      areaValue,
      areaUnit,
      surveyNumber: optString(body.surveyNumber),
      ownerName: optString(body.ownerName),
      purchaseDate,
      purchaseCost,
      notes: optString(body.notes),
      createdById: auth.user.id,
    },
    include: { _count: { select: { projects: true } } },
  })

  await writeAudit({
    action: 'LAND_CREATE',
    actorId: auth.user.id,
    actorName: auth.user.name,
    entityType: 'land',
    entityId: land.id,
    meta: { name: land.name, city: land.city, state: land.state },
    ip: getClientIp(req),
  })

  return ok(toLandRow(land))
}
