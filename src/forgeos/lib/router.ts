import { useEffect, useState } from 'react'

/**
 * Client-side hash router. The whole ForgeOS app lives on the single Next.js
 * `/` route, so every internal navigation is a hash change:
 * `#/app/projects/123` -> route `/app/projects/123`, `''` -> landing page.
 */

export function parseHashRoute(): string {
  if (typeof window === 'undefined') return '/'
  const hash = window.location.hash
  if (!hash || hash === '#' || hash === '#/' || hash === '#login' || hash.startsWith('#/login')) {
    return hash === '#login' || hash.startsWith('#/login') ? '/login' : '/'
  }
  return hash.slice(1)
}

export function navigate(path: string): void {
  const target = path.startsWith('/') ? path : `/${path}`
  if (target === '/') {
    window.history.replaceState(null, '', window.location.pathname)
    window.dispatchEvent(new HashChangeEvent('hashchange'))
    return
  }
  window.location.hash = `#${target}`
}

export function routeLink(path: string): string {
  return `#${path.startsWith('/') ? path : `/${path}`}`
}

export function useHashRoute(): string {
  const [route, setRoute] = useState<string>(parseHashRoute)

  useEffect(() => {
    const onChange = () => setRoute(parseHashRoute())
    window.addEventListener('hashchange', onChange)
    window.addEventListener('popstate', onChange)
    return () => {
      window.removeEventListener('hashchange', onChange)
      window.removeEventListener('popstate', onChange)
    }
  }, [])

  return route
}
