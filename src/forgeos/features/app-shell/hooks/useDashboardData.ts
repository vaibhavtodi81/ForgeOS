import { useCallback, useEffect, useState } from 'react'
import { fetchAdminDashboard, fetchPmDashboard, type AdminDashboardData, type PmDashboardData } from '../data/dashboardApi'

interface DashboardLoadState<T> {
  data: T | null
  error: string | null
}

function useDashboardResource<T>(fetcher: (signal: AbortSignal) => Promise<T>) {
  const [retryCount, setRetryCount] = useState(0)
  const [loadState, setLoadState] = useState<DashboardLoadState<T> | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    fetcher(controller.signal)
      .then((data) => setLoadState({ data, error: null }))
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return
        setLoadState({
          data: null,
          error: cause instanceof Error ? cause.message : 'Unable to load dashboard data.',
        })
      })
    return () => controller.abort()
  }, [fetcher, retryCount])

  const retry = useCallback(() => setRetryCount((count) => count + 1), [])

  return {
    data: loadState && loadState.error === null ? loadState.data : null,
    isLoading: loadState === null,
    error: loadState?.error ?? null,
    retry,
  }
}

export function useAdminDashboardData() {
  return useDashboardResource<AdminDashboardData>(fetchAdminDashboard)
}

export function usePmDashboardData() {
  return useDashboardResource<PmDashboardData>(fetchPmDashboard)
}
