import { db } from '@/lib/db'
import { fail, getClientIp, guardAuth, num, ok, optString, readJson, parseDay } from '@/lib/api-helpers'
import { writeAudit } from '@/lib/audit'
import { AREA_UNITS } from '@/lib/forgeos-types'
import type { AreaUnit } from '@/lib/forgeos-types'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await guardAuth(req)
  if (!auth.ok) return auth.response

  const { id } = await params
  const land = await db.land.findUnique({
    where: { id },
    include: { _count: { select: { projects: true } } },
  })
  if (!land) return fail('Land not found', 404)

  return ok({
    id: land.id,
    name: land.name,
    addressLine: land.addressLine,
    city: land.city,
    state: land.state,
    pincode: land.pincode,
    areaValue: land.areaValue,
    areaUnit: land.areaUnit,
    surveyNumber: land.surveyNumber,
    ownerName: land.ownerName,
    purchaseDate: land.purchaseDate ? land.purchaseDate.toISOString() : null,
    purchaseCost: land.purchaseCost,
    notes: land.notes,
    createdById: land.createdById,
    createdAt: land.createdAt.toISOString(),
    updatedAt: land.updatedAt.toISOString(),
    projects: land._count.projects,
  })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await guardAuth(req, ['PM'])
  if (!auth.ok) return auth.response

  const { id } = await params
  const body = await readJson<Record<string, unknown>>(req)
  if (!body) return fail('Invalid request body', 400)

  const existing = await db.land.findUnique({ where: { id } })
  if (!existing) return fail('Land not found', 404)

  const data: Record<string, unknown> = {}
  if (body.name !== undefined) {
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    if (name.length < 2) return fail('Name must be at least 2 characters', 400)
    data.name = name
  }
  if (body.city !== undefined) {
    const city = typeof body.city === 'string' ? body.city.trim() : ''
    if (city.length < 2) return fail('City must be at least 2 characters', 400)
    data.city = city
  }
  if (body.state !== undefined) {
    const state = typeof body.state === 'string' ? body.state.trim() : ''
    if (state.length < 2) return fail('State must be at least 2 characters', 400)
    data.state = state
  }
  if (body.addressLine !== undefined) data.addressLine = optString(body.addressLine)
  if (body.pincode !== undefined) data.pincode = optString(body.pincode)
  if (body.surveyNumber !== undefined) data.surveyNumber = optString(body.surveyNumber)
  if (body.ownerName !== undefined) data.ownerName = optString(body.ownerName)
  if (body.notes !== undefined) data.notes = optString(body.notes)
  if (body.areaUnit !== undefined) {
    if (typeof body.areaUnit !== 'string' || !AREA_UNITS.includes(body.areaUnit as AreaUnit)) {
      return fail(`areaUnit must be one of: ${AREA_UNITS.join(', ')}`, 400)
    }
    data.areaUnit = body.areaUnit
  }
  if (body.areaValue !== undefined) {
    const areaValue = num(body.areaValue)
    if (!(areaValue > 0)) return fail('Area value must be greater than zero', 400)
    data.areaValue = areaValue
  }
  if (body.purchaseCost !== undefined) {
    if (body.purchaseCost === null || body.purchaseCost === '') {
      data.purchaseCost = null
    } else {
      const cost = num(body.purchaseCost)
      if (!(cost >= 0)) return fail('Purchase cost must be zero or more', 400)
      data.purchaseCost = cost
    }
  }
  if (body.purchaseDate !== undefined) {
    if (body.purchaseDate === null || body.purchaseDate === '') data.purchaseDate = null
    else {
      const d = parseDay(body.purchaseDate)
      if (!d) return fail('purchaseDate must be a YYYY-MM-DD date', 400)
      data.purchaseDate = d
    }
  }

  const land = await db.land.update({
    where: { id },
    data,
    include: { _count: { select: { projects: true } } },
  })

  await writeAudit({
    action: 'LAND_UPDATE',
    actorId: auth.user.id,
    actorName: auth.user.name,
    entityType: 'land',
    entityId: id,
    meta: { name: land.name, changes: Object.keys(data) },
    ip: getClientIp(req),
  })

  return ok({
    ...land,
    purchaseDate: land.purchaseDate ? land.purchaseDate.toISOString() : null,
    createdAt: land.createdAt.toISOString(),
    updatedAt: land.updatedAt.toISOString(),
    projects: land._count.projects,
  })
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await guardAuth(req, ['PM'])
  if (!auth.ok) return auth.response

  const { id } = await params

  const land = await db.land.findUnique({
    where: { id },
    include: { _count: { select: { projects: true } } },
  })
  if (!land) return fail('Land not found', 404)
  if (land._count.projects > 0) {
    return fail('Land cannot be deleted while projects depend on it', 409)
  }

  await db.land.delete({ where: { id } })
  await writeAudit({
    action: 'LAND_DELETE',
    actorId: auth.user.id,
    actorName: auth.user.name,
    entityType: 'land',
    entityId: id,
    meta: { name: land.name },
    ip: getClientIp(req),
  })

  return ok(null)
}
