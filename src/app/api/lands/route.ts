import { db } from '@/lib/db'
import { ok, fail, guardAuth, getClientIp, readJson } from '@/lib/api-helpers'
import { writeAudit } from '@/lib/audit'
import type { LandRow } from '@/lib/forgeos-types'

function toLandRow(
  l: { id: string; name: string; location: string; areaSqft: number | null; khasraNumber: string | null },
  projectCount: number
): LandRow {
  return {
    id: l.id,
    name: l.name,
    location: l.location,
    areaSqft: l.areaSqft,
    khasraNumber: l.khasraNumber,
    projectCount,
  }
}

export async function GET(req: Request) {
  const auth = await guardAuth(req)
  if (!auth.ok) return auth.response

  const lands = await db.land.findMany({
    orderBy: { name: 'asc' },
    include: { projects: { select: { id: true } } },
  })

  return ok({ items: lands.map((l) => toLandRow(l, l.projects.length)) })
}

export async function POST(req: Request) {
  const auth = await guardAuth(req, ['ADMIN'])
  if (!auth.ok) return auth.response

  const body = await readJson<{ name?: unknown; location?: unknown; areaSqft?: unknown; khasraNumber?: unknown }>(req)
  if (!body) return fail('Invalid request body', 400)

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const location = typeof body.location === 'string' ? body.location.trim() : ''
  if (name.length < 2) return fail('Name must be at least 2 characters', 400)
  if (location.length < 2) return fail('Location must be at least 2 characters', 400)

  let areaSqft: number | null = null
  const rawArea = body.areaSqft
  if (rawArea !== undefined && rawArea !== null && !(typeof rawArea === 'string' && !rawArea.trim())) {
    const n = typeof rawArea === 'number' ? rawArea : Number(rawArea)
    if (!Number.isFinite(n) || n <= 0) {
      return fail('Area (sqft) must be a positive number', 400)
    }
    areaSqft = n
  }

  let khasraNumber: string | null = null
  if (body.khasraNumber !== undefined && body.khasraNumber !== null) {
    if (typeof body.khasraNumber !== 'string') {
      return fail('Khasra number must be a string', 400)
    }
    khasraNumber = body.khasraNumber.trim() || null
  }

  const land = await db.land.create({ data: { name, location, areaSqft, khasraNumber } })

  await writeAudit({
    action: 'LAND_CREATE',
    actorId: auth.user.id,
    actorName: auth.user.name,
    entityType: 'land',
    entityId: land.id,
    meta: { name, location },
    ip: getClientIp(req),
  })

  return ok({ land: toLandRow(land, 0) })
}
