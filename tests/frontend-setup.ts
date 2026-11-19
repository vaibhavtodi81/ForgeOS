// Front-end test setup — runs inside every vitest worker before any test
// module is imported. Provides jsdom polyfills, jest-dom matchers, automatic
// DOM cleanup, and safe default mocks for Next.js client APIs.
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// ---------------------------------------------------------------------------
// Automatic DOM cleanup after every test
// ---------------------------------------------------------------------------
afterEach(() => {
  cleanup()
  // Reset any per-test fetch/network stubs so tests never leak into each other.
  vi.unstubAllGlobals()
})

// ---------------------------------------------------------------------------
// jsdom polyfills expected by Radix UI / Recharts / framer-motion
// ---------------------------------------------------------------------------

if (typeof window.matchMedia !== 'function') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }),
  })
}

if (typeof window.ResizeObserver !== 'function') {
  class ResizeObserverStub implements ResizeObserver {
    observe(): void { /* noop */ }
    unobserve(): void { /* noop */ }
    disconnect(): void { /* noop */ }
  }
  ;(window as unknown as { ResizeObserver: typeof ResizeObserverStub }).ResizeObserver = ResizeObserverStub
}

if (typeof window.IntersectionObserver !== 'function') {
  class IntersectionObserverStub implements IntersectionObserver {
    root: Element | null = null
    rootMargin: string = ''
    thresholds: ReadonlyArray<number> = []
    observe(): void { /* noop */ }
    unobserve(): void { /* noop */ }
    disconnect(): void { /* noop */ }
    takeRecords(): IntersectionObserverEntry[] { return [] }
  }
  ;(window as unknown as { IntersectionObserver: typeof IntersectionObserverStub }).IntersectionObserver = IntersectionObserverStub
}

if (typeof window.PointerEvent === 'undefined') {
  // Radix UI + user-event rely on PointerEvent, which jsdom does not provide.
  class PointerEventStub extends MouseEvent {
    pointerId: number
    pointerType: string
    isPrimary: boolean
    constructor(type: string, params: MouseEventInit & PointerEventInit = {}) {
      super(type, params)
      this.pointerId = params.pointerId ?? 1
      this.pointerType = params.pointerType ?? 'mouse'
      this.isPrimary = params.isPrimary ?? true
    }
  }
  ;(window as unknown as { PointerEvent: typeof PointerEventStub }).PointerEvent = PointerEventStub
  ;(globalThis as unknown as { PointerEvent: typeof PointerEventStub }).PointerEvent = PointerEventStub
}

if (!window.scrollTo) {
  window.scrollTo = () => undefined
}
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => undefined
}

// getComputedStyle().computedStyleFor? Recharts reads clientWidth/Height —
// jsdom returns 0 which is fine for render-smoke assertions.
Object.defineProperty(window.HTMLElement.prototype, 'clientWidth', {
  configurable: true,
  value: 1024,
})
Object.defineProperty(window.HTMLElement.prototype, 'clientHeight', {
  configurable: true,
  value: 768,
})

// ---------------------------------------------------------------------------
// Default mocks for Next.js client APIs (individual tests may override them
// with their own vi.mock / vi.stubGlobal calls).
// ---------------------------------------------------------------------------

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
  redirect: (url: string) => {
    throw new Error(`next/navigation redirect called: ${url}`)
  },
}))

vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    resolvedTheme: 'light',
    setTheme: vi.fn(),
    themes: ['light', 'dark', 'system'],
  }),
  ThemeProvider: ({ children }: { children?: React.ReactNode }) => children,
  useSelectedLayoutSegments: () => [],
}))
