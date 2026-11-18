import { db } from '@/lib/db'
import { fail, getClientIp, guardAuth, ok, optString, readJson } from '@/lib/api-helpers'
import { writeAudit } from '@/lib/audit'
import type { SupplierRow } from '@/lib/forgeos-types'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await guardAuth(req, ['ADMIN'])
  if (!auth.ok) return auth.response

  const { id } = await params
  const body = await readJson<Record<string, unknown>>(req)
  if (!body) return fail('Invalid request body', 400)

  const existing = await db.supplier.findUnique({ where: { id } })
  if (!existing) return fail('Supplier not found', 404)

  const data: { name?: string; phone?: string; email?: string | null; address?: string | null } = {}
  if (body.name !== undefined) {
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    if (name.length < 2) return fail('Name must be at least 2 characters', 400)
    if (name !== existing.name) {
      const duplicate = await db.supplier.findFirst({ where: { name } })
      if (duplicate) return fail('A supplier with this name already exists', 409)
      data.name = name
    }
  }
  if (body.phone !== undefined) {
    const phone = typeof body.phone === 'string' ? body.phone.trim() : ''
    if (phone.length < 6) return fail('Phone must be at least 6 characters', 400)
    if (phone !== existing.phone) data.phone = phone
  }
  if (body.email !== undefined) data.email = optString(body.email)
  if (body.address !== undefined) data.address = optString(body.address)

  if (Object.keys(data).length === 0) {
    const count = await db.inventoryTransaction.count({ where: { vendorId: id } })
    const row: SupplierRow = { ...existing, supplyTxnCount: count }
    return ok({ supplier: row })
  }

  const updated = await db.supplier.update({
    where: { id },
    data,
    include: { _count: { select: { transactions: true } } },
  })

  await writeAudit({
    action: 'SUPPLIER_UPDATE',
    actorId: auth.user.id,
    actorName: auth.user.name,
    entityType: 'supplier',
    entityId: id,
    meta: data,
    ip: getClientIp(req),
  })

  const row: SupplierRow = {
    id: updated.id,
    name: updated.name,
    phone: updated.phone,
    email: updated.email,
    address: updated.address,
    supplyTxnCount: updated._count.transactions,
  }
  return ok({ supplier: row })
}
