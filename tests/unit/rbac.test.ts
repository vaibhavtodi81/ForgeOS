import { describe, test, expect, vi } from 'vitest'
import { can, PERMISSIONS, PERMISSION_KEYS, requirePermission, rolesFor } from '@/lib/rbac'
import type { Permission } from '@/lib/rbac'
import type { Role } from '@/lib/forgeos-types'

// requirePermission delegates to guardAuth, which revalidates sessions against
// the database. Unit-level stub: any signed-in user exists and is active with
// the role baked into their token.
vi.mock('@/lib/db', () => ({
  db: {
    user: {
      findUnique: vi.fn(async ({ where }: { where: { id: string } }) =>
        where.id === 'u-x'
          ? { id: 'u-x', name: 'V', email: 'v@x.local', role: 'VIEWER', isActive: true }
          : null,
      ),
    },
  },
}))

describe('RBAC permission matrix', () => {
  test('every permission declares at least the ADMIN role', () => {
    for (const permission of PERMISSION_KEYS) {
      expect(PERMISSIONS[permission], `${permission} must include ADMIN`).toContain('ADMIN')
    }
  })

  test('no permission grants VIEWER write access', () => {
    const writePermissions = PERMISSION_KEYS.filter((p) => !p.endsWith(':read'))
    for (const permission of writePermissions) {
      expect(PERMISSIONS[permission], `${permission} must not include VIEWER`).not.toContain('VIEWER')
    }
  })

  test('site-operation permissions are shared by ADMIN and PM', () => {
    const shared: Permission[] = ['lands:write', 'plans:write', 'logs:write', 'milestones:write', 'stock:write', 'pm-dashboard:read']
    for (const permission of shared) {
      expect(rolesFor(permission)).toEqual(['ADMIN', 'PM'])
    }
  })

  test('administration permissions are ADMIN-only', () => {
    const adminOnly: Permission[] = [
      'users:write',
      'projects:write',
      'projects:assign',
      'projects:status',
      'materials:write',
      'suppliers:write',
      'stock:void',
      'invoices:write',
      'payments:write',
      'audit:read',
    ]
    for (const permission of adminOnly) {
      expect(rolesFor(permission)).toEqual(['ADMIN'])
    }
  })
})

describe('can()', () => {
  test('ADMIN holds every permission', () => {
    for (const permission of PERMISSION_KEYS) {
      expect(can('ADMIN', permission), `ADMIN should hold ${permission}`).toBe(true)
    }
  })

  test('PM holds exactly the site-operation permissions', () => {
    const pmHolds: Permission[] = ['lands:write', 'plans:write', 'logs:write', 'milestones:write', 'stock:write', 'pm-dashboard:read']
    for (const permission of PERMISSION_KEYS) {
      expect(can('PM', permission), `PM x ${permission}`).toBe(pmHolds.includes(permission))
    }
  })

  test('VIEWER holds no permissions', () => {
    for (const permission of PERMISSION_KEYS) {
      expect(can('VIEWER', permission), `VIEWER should not hold ${permission}`).toBe(false)
    }
  })

  test('unknown roles are rejected (no implicit bypass)', () => {
    // The matrix lookup is exact — a fabricated role string grants nothing.
    expect(can('SUPERADMIN' as Role, 'users:write')).toBe(false)
    expect(can('' as Role, 'stock:write')).toBe(false)
  })
})

describe('requirePermission()', () => {
  test('rejects unauthenticated requests with 401 before role checks', async () => {
    const result = await requirePermission(new Request('http://localhost/api/users'), 'users:write')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.response.status).toBe(401)
      const body = (await result.response.json()) as { error: { code: string } }
      expect(body.error.code).toBe('UNAUTHORIZED')
    }
  })

  test('rejects a VIEWER bearer token for a write permission with 403', async () => {
    const { signSession } = await import('@/lib/auth')
    const { token } = await signSession({ id: 'u-x', name: 'V', email: 'v@x.local', role: 'VIEWER' })
    const req = new Request('http://localhost/api/materials', {
      headers: { authorization: `Bearer ${token}` },
    })
    const result = await requirePermission(req, 'materials:write')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.response.status).toBe(403)
      const body = (await result.response.json()) as { error: { code: string } }
      expect(body.error.code).toBe('FORBIDDEN')
    }
  })
})
