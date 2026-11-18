import { db } from '@/lib/db'
import { ok, fail, guardAuth, getClientIp, readJson, optString } from '@/lib/api-helpers'
import { writeAudit } from '@/lib/audit'
import type { SupplierRow } from '@/lib/forgeos-types'

export async function GET(req: Request) {
  const auth = await guardAuth(req)
  if (!auth.ok) return auth.response

  const suppliers = await db.supplier.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { transactions: true } } },
  })

  const items: SupplierRow[] = suppliers.map((s) => ({
    id: s.id,
    name: s.name,
    phone: s.phone,
    email: s.email,
    address: s.address,
    supplyTxnCount: s._count.transactions,
  }))

  return ok({ items })
}

export async function POST(req: Request) {
  const auth = await guardAuth(req, ['ADMIN'])
  if (!auth.ok) return auth.response

  const body = await readJson<Record<string, unknown>>(req)
  if (!body) return fail('Invalid request body', 400)

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const phone = typeof body.phone === 'string' ? body.phone.trim() : ''
  if (name.length < 2) return fail('Name must be at least 2 characters', 400)
  if (phone.length < 6) return fail('Phone must be at least 6 characters', 400)

  const existing = await db.supplier.findFirst({ where: { name } })
  if (existing) return fail('A supplier with this name already exists', 409)

  const supplier = await db.supplier.create({
    data: { name, phone, email: optString(body.email), address: optString(body.address) },
  })

  await writeAudit({
    action: 'SUPPLIER_CREATE',
    actorId: auth.user.id,
    actorName: auth.user.name,
    entityType: 'supplier',
    entityId: supplier.id,
    meta: { name, phone },
    ip: getClientIp(req),
  })

  const row: SupplierRow = {
    id: supplier.id,
    name: supplier.name,
    phone: supplier.phone,
    email: supplier.email,
    address: supplier.address,
    supplyTxnCount: 0,
  }
  return ok({ supplier: row })
}
