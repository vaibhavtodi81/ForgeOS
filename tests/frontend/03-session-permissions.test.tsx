import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import {
  clearAccessToken,
  getAccessToken,
  getAuthUserSnapshot,
  saveAccessToken,
  setAuthUser,
  type AuthUser,
} from '@/forgeos/features/authentication/auth/session'
import {
  getCurrentRole,
  getCurrentUser,
  hasPermission,
  isAdmin,
  isProjectManager,
  type UserRole,
} from '@/forgeos/features/authentication/utils/permissions'
import { makeUser, resetForgeOsState } from './test-utils'

const TOKEN_KEY = 'forgeos_access_token'

beforeEach(() => {
  resetForgeOsState()
})

afterEach(() => {
  resetForgeOsState()
})

// ---------------------------------------------------------------------------
// session.ts — token storage
// ---------------------------------------------------------------------------

describe('session token storage', () => {
  test('getAccessToken returns null when nothing is stored', () => {
    expect(getAccessToken()).toBeNull()
  })

  test('saveAccessToken(rememberMe: false) keeps the token in sessionStorage only', () => {
    saveAccessToken('tok-session', false)

    expect(getAccessToken()).toBe('tok-session')
    expect(sessionStorage.getItem(TOKEN_KEY)).toBe('tok-session')
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull()
  })

  test('saveAccessToken(rememberMe: true) keeps the token in localStorage only', () => {
    saveAccessToken('tok-local', true)

    expect(getAccessToken()).toBe('tok-local')
    expect(localStorage.getItem(TOKEN_KEY)).toBe('tok-local')
    expect(sessionStorage.getItem(TOKEN_KEY)).toBeNull()
  })

  test('saving a new token clears the previous one from both stores', () => {
    saveAccessToken('tok-old', true)
    saveAccessToken('tok-new', false)

    expect(getAccessToken()).toBe('tok-new')
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull()
    expect(sessionStorage.getItem(TOKEN_KEY)).toBe('tok-new')
  })

  test('a sessionStorage token wins over a localStorage token', () => {
    saveAccessToken('tok-a', true)
    saveAccessToken('tok-b', false)

    expect(getAccessToken()).toBe('tok-b')
  })

  test('clearAccessToken removes the token from both stores', () => {
    saveAccessToken('tok-1', true)
    saveAccessToken('tok-2', false)

    clearAccessToken()

    expect(getAccessToken()).toBeNull()
    expect(sessionStorage.getItem(TOKEN_KEY)).toBeNull()
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// session.ts — in-memory user snapshot
// ---------------------------------------------------------------------------

describe('session user snapshot', () => {
  test('defaults to null and round-trips a user', () => {
    expect(getAuthUserSnapshot()).toBeNull()

    const user = makeUser('ADMIN', { id: 'u-snap' })
    setAuthUser(user)
    expect(getAuthUserSnapshot()).toEqual(user)

    setAuthUser(null)
    expect(getAuthUserSnapshot()).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// permissions.ts — full RBAC matrix
// ---------------------------------------------------------------------------

const BOTH_ROLES: UserRole[] = ['Admin', 'Project Manager']

describe('permissions RBAC matrix', () => {
  describe('ADMIN', () => {
    const user = makeUser('ADMIN')

    beforeEach(() => setAuthUser(user))

    test('getCurrentUser returns the admin user', () => {
      expect(getCurrentUser()).toEqual(user)
    })

    test('getCurrentRole maps ADMIN to "Admin"', () => {
      expect(getCurrentRole()).toBe('Admin')
    })

    test('isAdmin / isProjectManager', () => {
      expect(isAdmin()).toBe(true)
      expect(isProjectManager()).toBe(false)
    })

    test('hasPermission matrix', () => {
      expect(hasPermission(['Admin'])).toBe(true)
      expect(hasPermission(['Project Manager'])).toBe(false)
      expect(hasPermission(BOTH_ROLES)).toBe(true)
      expect(hasPermission([])).toBe(false)
    })
  })

  describe('PM', () => {
    beforeEach(() => setAuthUser(makeUser('PM')))

    test('getCurrentUser returns the PM user', () => {
      expect(getCurrentUser()?.role).toBe('PM')
    })

    test('getCurrentRole maps PM to "Project Manager"', () => {
      expect(getCurrentRole()).toBe('Project Manager')
    })

    test('isAdmin / isProjectManager', () => {
      expect(isAdmin()).toBe(false)
      expect(isProjectManager()).toBe(true)
    })

    test('hasPermission matrix', () => {
      expect(hasPermission(['Admin'])).toBe(false)
      expect(hasPermission(['Project Manager'])).toBe(true)
      expect(hasPermission(BOTH_ROLES)).toBe(true)
      expect(hasPermission([])).toBe(false)
    })
  })

  describe('VIEWER', () => {
    beforeEach(() => setAuthUser(makeUser('VIEWER')))

    test('getCurrentUser still returns the viewer user', () => {
      expect(getCurrentUser()?.role).toBe('VIEWER')
    })

    test('VIEWER has no mapped role — getCurrentRole returns null', () => {
      expect(getCurrentRole()).toBeNull()
    })

    test('isAdmin / isProjectManager are both false', () => {
      expect(isAdmin()).toBe(false)
      expect(isProjectManager()).toBe(false)
    })

    test('VIEWER fails every permission list (read-only role)', () => {
      expect(hasPermission(['Admin'])).toBe(false)
      expect(hasPermission(['Project Manager'])).toBe(false)
      expect(hasPermission(BOTH_ROLES)).toBe(false)
      expect(hasPermission([])).toBe(false)
    })
  })

  describe('no user (signed out)', () => {
    beforeEach(() => setAuthUser(null))

    test('getCurrentUser and getCurrentRole are null', () => {
      expect(getCurrentUser()).toBeNull()
      expect(getCurrentRole()).toBeNull()
    })

    test('all guards deny', () => {
      expect(hasPermission(['Admin'])).toBe(false)
      expect(hasPermission(['Project Manager'])).toBe(false)
      expect(hasPermission(BOTH_ROLES)).toBe(false)
      expect(hasPermission([])).toBe(false)
      expect(isAdmin()).toBe(false)
      expect(isProjectManager()).toBe(false)
    })
  })

  describe('unknown role (stale token / future role value)', () => {
    // Simulates a token minted with a role this client build does not know.
    // The runtime helpers must degrade to "no access" rather than crash.
    beforeEach(() => {
      setAuthUser({ ...makeUser('ADMIN'), role: 'SUPERUSER' as AuthUser['role'] })
    })

    test('getCurrentRole is null and every guard denies', () => {
      expect(getCurrentRole()).toBeNull()
      expect(hasPermission(['Admin'])).toBe(false)
      expect(hasPermission(BOTH_ROLES)).toBe(false)
      expect(isAdmin()).toBe(false)
      expect(isProjectManager()).toBe(false)
    })

    test('getCurrentUser still exposes the raw user object', () => {
      expect(getCurrentUser()?.role).toBe('SUPERUSER')
    })
  })
})
