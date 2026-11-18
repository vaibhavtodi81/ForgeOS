import { db } from '@/lib/db'
import { ok, guardAuth } from '@/lib/api-helpers'
import type { MetaResponse, ProjectStatus } from '@/lib/forgeos-types'

export async function GET(req: Request) {
  const auth = await guardAuth(req)
  if (!auth.ok) return auth.response

  const isPm = auth.user.role === 'PM'
  const [materials, suppliers, lands, projects, managers] = await Promise.all([
    db.material.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, unit: true, category: true },
    }),
    db.supplier.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, phone: true },
    }),
    db.land.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, city: true, state: true },
    }),
    db.project.findMany({
      where: isPm ? { assignedPmId: auth.user.id } : undefined,
      orderBy: { code: 'asc' },
      include: { assignedPm: { select: { name: true } } },
    }),
    db.user.findMany({
      where: { role: 'PM', isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
  ])

  const meta: MetaResponse = {
    materials,
    suppliers,
    lands,
    projects: projects.map((p) => ({
      id: p.id,
      name: p.name,
      code: p.code,
      status: p.status as ProjectStatus,
      pmId: p.assignedPmId,
      pmName: p.assignedPm?.name ?? null,
    })),
    managers,
  }
  return ok(meta)
}
