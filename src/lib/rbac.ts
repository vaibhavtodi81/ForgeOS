// ForgeOS RBAC — the single source of truth for role-based access control.
//
// Every guarded write/admin endpoint resolves its access rule through this
// matrix instead of ad-hoc role arrays scattered across route handlers.
// The matrix is intentionally explicit (ADMIN is listed on every permission
// it holds, rather than being an implicit bypass) so the full access surface
// can be audited by reading one file.
//
// Semantics preserved from the previous inline guards:
//   - guardAuth(req)                    -> any authenticated user (read paths)
//   - requirePermission(req, '<perm>')  -> the roles listed on that permission
//
// Roles: ADMIN (full control), PM (site operations on assigned projects),
// VIEWER (read-only).

import { guardAuth } from '@/lib/api-helpers'
import type { Role } from '@/lib/forgeos-types'

export const PERMISSIONS = {
  // User administration — invite, edit, activate/deactivate, role changes.
  'users:write': ['ADMIN'],

  // Land registry — create, update, delete (PMs manage site land records).
  'lands:write': ['ADMIN', 'PM'],

  // Project master data — create, update, delete.
  'projects:write': ['ADMIN'],

  // Assign / reassign a project manager.
  'projects:assign': ['ADMIN'],

  // Project status machine (PLANNING -> ACTIVE -> ON_HOLD <-> ... -> COMPLETED).
  'projects:status': ['ADMIN'],

  // Materials master — create, update.
  'materials:write': ['ADMIN'],

  // Suppliers / vendors — create, update.
  'suppliers:write': ['ADMIN'],

  // Material plans — create, update, delete, status transitions.
  'plans:write': ['ADMIN', 'PM'],

  // Daily site logs — create, update, delete.
  'logs:write': ['ADMIN', 'PM'],

  // Milestones — create, update, delete.
  'milestones:write': ['ADMIN', 'PM'],

  // Inventory transactions — stock IN / OUT / ADJUSTMENT.
  'stock:write': ['ADMIN', 'PM'],

  // Void an inventory transaction (corrections).
  'stock:void': ['ADMIN'],

  // Invoices — create, status transitions.
  'invoices:write': ['ADMIN'],

  // Payments against invoices.
  'payments:write': ['ADMIN'],

  // Audit log viewer (list + stats).
  'audit:read': ['ADMIN'],

  // PM cockpit dashboard (GET /api/dashboard/pm).
  'pm-dashboard:read': ['ADMIN', 'PM'],
} as const satisfies Record<string, readonly Role[]>

export type Permission = keyof typeof PERMISSIONS

/** All permission keys, in declaration order. */
export const PERMISSION_KEYS = Object.keys(PERMISSIONS) as Permission[]

/** True when `role` holds `permission` (exact matrix lookup — no implicit bypass). */
export function can(role: Role, permission: Permission): boolean {
  return (PERMISSIONS[permission] as readonly Role[]).includes(role)
}

/** Roles allowed by a permission (defensive copy). */
export function rolesFor(permission: Permission): Role[] {
  return [...PERMISSIONS[permission]]
}

/**
 * Route guard — authenticates the request and enforces the named permission.
 * Returns the same discriminated result as `guardAuth`, so routes can switch
 * from `guardAuth(req, ['ADMIN'])` to `requirePermission(req, 'users:write')`
 * with no other change.
 */
export function requirePermission(req: Request, permission: Permission) {
  return guardAuth(req, rolesFor(permission))
}
