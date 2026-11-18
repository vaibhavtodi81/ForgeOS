import { db } from '@/lib/db'
import { ok, fail, guardAuth, getClientIp, readJson } from '@/lib/api-helpers'
import { writeAudit } from '@/lib/audit'
import type { SupplierRow } from '@/lib/forgeos-types'

function toSupplierRow(
  s: { id: string; name: string; phone: string; email: string | null; address: string | null },
  txnCount: number
): SupplierRow {
  return { id: s.id, name: s.name, phone: s.phone, email: s.email, address: s.address, txnCount }
}

function optionalString(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed || null
}

export async function GET(req: Request) {
  const auth = await guardAuth(req)
  if (!auth.ok) return auth.response

  const suppliers = await db.supplier.findMany({
    orderBy: { name: 'asc' },
    include: { transactions: { where: { voidedAt: null }, select: { id: true } } },
  })

  return ok({ items: suppliers.map((s) => toSupplierRow(s, s.transactions.length)) })
}

export async function POST(req: Request) {
  const auth = await guardAuth(req, ['ADMIN'])
  if (!auth.ok) return auth.response

  const body = await readJson<{ name?: unknown; phone?: unknown; email?: unknown; address?: unknown }>(req)
  if (!body) return fail('Invalid request body', 400)

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const phone = typeof body.phone === 'string' ? body.phone.trim() : ''
  if (name.length < 2) return fail('Name must be at least 2 characters', 400)
  if (phone.length < 6) return fail('Phone must be at least 6 characters', 400)

  const email = optionalString(body.email)
  const address = optionalString(body.address)

  const supplier = await db.supplier.create({ data: { name, phone, email, address } })

  await writeAudit({
    action: 'SUPPLIER_CREATE',
    actorId: auth.user.id,
    actorName: auth.user.name,
    entityType: 'supplier',
    entityId: supplier.id,
    meta: { name },
    ip: getClientIp(req),
  })

  return ok({ supplier: toSupplierRow(supplier, 0) })
}
