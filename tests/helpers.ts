import { expect } from 'vitest'
import { POST as loginPOST } from '@/app/api/auth/login/route'
import { db } from '@/lib/db'

/** Shared helpers for the ForgeOS backend test suite (runs against db/test.db). */

export const DEMO_PASSWORD = 'ForgeOS2026'
export const RUN_TAG = 't8' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)

export const ADMIN_EMAIL = 'admin@forgeos.local'
export const RIYA_EMAIL = 'riya@forgeos.local'
export const YASHMEEN_EMAIL = 'yashmeen@forgeos.local'
export const VINAYAK_EMAIL = 'vinayak@forgeos.local'
export const AISHA_EMAIL = 'aisha@forgeos.local' // VIEWER
export const ROHIT_EMAIL = 'rohit@forgeos.local' // inactive PM

export function randIp(): string {
  return `198.51.${Math.floor(Math.random() * 256)}.${1 + Math.floor(Math.random() * 254)}`
}

interface ReqInit {
  method?: string
  body?: unknown
  headers?: Record<string, string>
}

export function req(path: string, init: ReqInit = {}): Request {
  return new Request(`http://localhost:3000${path}`, {
    method: init.method ?? (init.body === undefined ? 'GET' : 'POST'),
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    headers: { 'content-type': 'application/json', ...(init.headers ?? {}) },
  })
}

export function auth(path: string, token: string, init: ReqInit = {}): Request {
  return req(path, { ...init, headers: { authorization: `Bearer ${token}`, ...(init.headers ?? {}) } })
}

export async function loginAs(email: string, password = DEMO_PASSWORD): Promise<string> {
  const res = await loginPOST(
    req('/api/auth/login', { body: { email, password }, headers: { 'x-forwarded-for': randIp() } })
  )
  const body = (await res.json()) as { success?: boolean; data?: { token?: string }; message?: string }
  if (!res.ok || !body.success || !body.data?.token) {
    throw new Error(`loginAs(${email}) failed: ${res.status} ${body.message ?? ''}`)
  }
  return body.data.token
}

export interface OkEnvelope<T, M = unknown> {
  success: true
  message: string
  data: T
  meta: M | null
}

export async function okBody<T = unknown, M = unknown>(res: Response): Promise<OkEnvelope<T, M>> {
  const body = (await res.json()) as Partial<OkEnvelope<T, M>> & { error?: unknown }
  expect(
    body.success === true,
    `expected success envelope but got ${res.status}: ${JSON.stringify(body)}`
  ).toBe(true)
  expect(res.status).toBe(200)
  expect(typeof body.message).toBe('string')
  return body as OkEnvelope<T, M>
}

export interface ErrEnvelope {
  success: false
  message: string
  error: { code: string; message: string }
}

export async function errBody(res: Response, status?: number): Promise<ErrEnvelope> {
  const body = (await res.json()) as Partial<ErrEnvelope>
  expect(body.success).toBe(false)
  expect(body.error && typeof body.error.message === 'string').toBe(true)
  if (status !== undefined) expect(res.status).toBe(status)
  return body as ErrEnvelope
}

/** Route-handler context for a single dynamic segment, e.g. /api/projects/:id */
export const P = (id: string) => ({ params: Promise.resolve({ id }) })
/** Route-handler context for /api/projects/:id/inventory/transactions/:txnId */
export const PT = (id: string, txnId: string) => ({ params: Promise.resolve({ id, txnId }) })

// ---------------------------------------------------------------------------
// DB fixtures — created directly via Prisma (routes under test are exercised
// by the actual assertions, not by the fixtures). Everything is namespaced
// with RUN_TAG and removed in afterAll.
// ---------------------------------------------------------------------------

export async function getAdminId(): Promise<string> {
  const admin = await db.user.findUniqueOrThrow({ where: { email: ADMIN_EMAIL } })
  return admin.id
}

export async function getUserId(email: string): Promise<string> {
  const user = await db.user.findUniqueOrThrow({ where: { email } })
  return user.id
}

export interface ProjectFixture {
  projectId: string
  landId: string
  pmId: string | null
  dispose: () => Promise<void>
}

export async function createProjectFixture(
  name: string,
  opts: { pmEmail?: string | null; status?: string } = {}
): Promise<ProjectFixture> {
  const adminId = await getAdminId()
  const pmId = opts.pmEmail ? await getUserId(opts.pmEmail) : null
  const land = await db.land.create({
    data: {
      name: `T8 Land ${name}`,
      city: 'Testville',
      state: 'Teststate',
      areaValue: 1200,
      areaUnit: 'SQFT',
      createdById: adminId,
    },
  })
  const project = await db.project.create({
    data: {
      code: `T8-${RUN_TAG}-${name}`,
      name: `T8 Project ${name}`,
      landId: land.id,
      status: opts.status ?? 'ACTIVE',
      startDate: new Date('2030-01-10T00:00:00.000Z'),
      expectedEndDate: new Date('2031-06-30T00:00:00.000Z'),
      totalBudget: 10_000_000,
      assignedPmId: pmId,
      createdById: adminId,
    },
  })
  return {
    projectId: project.id,
    landId: land.id,
    pmId,
    dispose: async () => {
      // cascades: plans, transactions, logs (+entries), milestones, invoices (+payments)
      await db.project.delete({ where: { id: project.id } }).catch(() => undefined)
      await db.land.delete({ where: { id: land.id } }).catch(() => undefined)
    },
  }
}

export async function createMaterialFixture(name: string, isActive = true): Promise<string> {
  const material = await db.material.create({
    data: { name: `T8 ${name}`, unit: 'bag', category: 'OTHER', isActive },
  })
  return material.id
}

export async function disposeMaterials(): Promise<void> {
  await db.material.deleteMany({ where: { name: { startsWith: 'T8 ' } } })
}
