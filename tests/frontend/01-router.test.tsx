import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { navigate, parseHashRoute, routeLink, useHashRoute } from '@/forgeos/lib/router'
import { resetForgeOsState } from './test-utils'

beforeEach(() => {
  resetForgeOsState()
})

afterEach(() => {
  resetForgeOsState()
})

describe('parseHashRoute', () => {
  test('empty hash, "#", and "#/" all resolve to the landing route "/"', () => {
    expect(window.location.hash).toBe('')
    expect(parseHashRoute()).toBe('/')

    window.location.hash = '#'
    expect(parseHashRoute()).toBe('/')

    window.location.hash = '#/'
    expect(parseHashRoute()).toBe('/')
  })

  test('"#login" and "#/login" map to the /login route', () => {
    window.location.hash = '#login'
    expect(parseHashRoute()).toBe('/login')

    window.location.hash = '#/login'
    expect(parseHashRoute()).toBe('/login')
  })

  test('hash prefix is stripped: "#/app/projects" -> "/app/projects"', () => {
    window.location.hash = '#/app'
    expect(parseHashRoute()).toBe('/app')

    window.location.hash = '#/app/projects/123'
    expect(parseHashRoute()).toBe('/app/projects/123')
  })

  test('trailing slashes are preserved verbatim (no normalization in the parser)', () => {
    window.location.hash = '#/app/'
    expect(parseHashRoute()).toBe('/app/')
  })

  test('query strings inside the hash are preserved', () => {
    window.location.hash = '#/app/projects?tab=logs'
    expect(parseHashRoute()).toBe('/app/projects?tab=logs')
  })
})

describe('navigate', () => {
  test('writes "#/app/projects" into window.location.hash', () => {
    navigate('/app/projects')
    expect(window.location.hash).toBe('#/app/projects')
  })

  test('prefixes a leading slash when the caller omits it', () => {
    navigate('app/projects')
    expect(window.location.hash).toBe('#/app/projects')
  })

  test('navigating to "/" clears the hash and fires a hashchange event', () => {
    window.location.hash = '#/app/projects'

    const listener = vi.fn()
    window.addEventListener('hashchange', listener)

    navigate('/')

    expect(window.location.hash).toBe('')
    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener.mock.calls[0][0]).toBeInstanceOf(HashChangeEvent)

    window.removeEventListener('hashchange', listener)
  })

  test('setting a hash via navigate triggers a (real) hashchange event', async () => {
    const listener = vi.fn()
    window.addEventListener('hashchange', listener)

    navigate('/app/daily-logs')
    await waitFor(() => expect(listener).toHaveBeenCalled())

    window.removeEventListener('hashchange', listener)
  })
})

describe('routeLink', () => {
  test('returns an "#…" href for absolute paths', () => {
    expect(routeLink('/app/projects')).toBe('#/app/projects')
  })

  test('normalises relative paths by prefixing "/"', () => {
    expect(routeLink('app/projects')).toBe('#/app/projects')
  })

  test('routeLink targets round-trip through parseHashRoute', () => {
    window.location.hash = routeLink('/app/lands')
    expect(parseHashRoute()).toBe('/app/lands')
  })
})

describe('useHashRoute', () => {
  test('initial route reflects the current hash', () => {
    window.location.hash = '#/app/projects'
    const { result } = renderHook(() => useHashRoute())
    expect(result.current).toBe('/app/projects')
  })

  test('updates when navigate() changes the hash', async () => {
    const { result } = renderHook(() => useHashRoute())
    expect(result.current).toBe('/')

    navigate('/app/projects')
    await waitFor(() => expect(result.current).toBe('/app/projects'))
  })

  test('updates on hashchange events fired directly on the window', async () => {
    const { result } = renderHook(() => useHashRoute())

    window.location.hash = '#/app/wastage'
    await waitFor(() => expect(result.current).toBe('/app/wastage'))
  })

  test('updates on popstate (e.g. browser back) without a hashchange event', async () => {
    const { result } = renderHook(() => useHashRoute())

    // history.replaceState changes the hash WITHOUT firing hashchange,
    // so only the router's popstate listener can observe it.
    window.history.replaceState(null, '', '#/app/stock')
    window.dispatchEvent(new PopStateEvent('popstate'))

    await waitFor(() => expect(result.current).toBe('/app/stock'))
  })

  test('navigate("/") returns the hook to the landing route', async () => {
    window.location.hash = '#/app/projects'
    const { result } = renderHook(() => useHashRoute())
    expect(result.current).toBe('/app/projects')

    navigate('/')
    await waitFor(() => expect(result.current).toBe('/'))
  })

  test('stops listening after unmount', async () => {
    const { result, unmount } = renderHook(() => useHashRoute())
    unmount()

    navigate('/app/projects')
    // Give jsdom a tick to dispatch the async hashchange; the hook must
    // not have updated since it unmounted.
    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(result.current).toBe('/')
  })
})
