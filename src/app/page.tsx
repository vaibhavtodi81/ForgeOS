'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Flame, Loader2 } from 'lucide-react'
import { api } from '@/lib/client-api'
import type { SessionUser } from '@/lib/forgeos-types'
import { useAppStore } from '@/lib/store'
import { Providers } from '@/components/forgeos/providers'
import { AppShell } from '@/components/forgeos/app-shell'
import { LoginView } from '@/components/forgeos/login-view'
import DashboardView from '@/components/forgeos/views/dashboard-view'
import ProjectsView from '@/components/forgeos/views/projects-view'
import PlansView from '@/components/forgeos/views/plans-view'
import InventoryView from '@/components/forgeos/views/inventory-view'
import LogsView from '@/components/forgeos/views/logs-view'
import BillingView from '@/components/forgeos/views/billing-view'
import WastageView from '@/components/forgeos/views/wastage-view'
import AuditView from '@/components/forgeos/views/audit-view'
import UsersView from '@/components/forgeos/views/users-view'
import MaterialsView from '@/components/forgeos/views/materials-view'
import LandsView from '@/components/forgeos/views/lands-view'
import SuppliersView from '@/components/forgeos/views/suppliers-view'
import ProfileView from '@/components/forgeos/views/profile-view'

function Splash() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-muted/40">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <Flame className="h-6 w-6" aria-hidden />
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        Loading ForgeOS…
      </div>
    </div>
  )
}

function SessionGate() {
  const queryClient = useQueryClient()
  const [user, setUser] = useState<SessionUser | null>(null)
  const view = useAppStore((s) => s.view)

  const meQuery = useQuery({
    queryKey: ['me'],
    queryFn: () => api<{ user: SessionUser }>('/api/auth/me'),
    retry: false,
    staleTime: Infinity,
  })

  // Prefer the locally-known session (set right after login) while the /me
  // bootstrap query resolves; once resolved it becomes the source of truth.
  const sessionUser = user ?? meQuery.data?.user ?? null

  if (meQuery.isPending) return <Splash />

  if (!sessionUser) {
    return (
      <LoginView
        onAuthenticated={(authenticated) => {
          setUser(authenticated)
        }}
      />
    )
  }

  async function handleLogout() {
    try {
      await api('/api/auth/logout', { method: 'POST' })
    } catch {
      // Session cookie is cleared client-side regardless
    }
    setUser(null)
    queryClient.clear()
    useAppStore.getState().setView('dashboard')
  }

  return (
    <AppShell user={sessionUser} onLogout={handleLogout}>
      {view === 'dashboard' ? <DashboardView user={sessionUser} /> : null}
      {view === 'projects' ? <ProjectsView user={sessionUser} /> : null}
      {view === 'plans' ? <PlansView user={sessionUser} /> : null}
      {view === 'inventory' ? <InventoryView user={sessionUser} /> : null}
      {view === 'logs' ? <LogsView user={sessionUser} /> : null}
      {view === 'billing' ? <BillingView user={sessionUser} /> : null}
      {view === 'wastage' ? <WastageView user={sessionUser} /> : null}
      {view === 'audit' ? <AuditView user={sessionUser} /> : null}
      {view === 'users' ? <UsersView user={sessionUser} /> : null}
      {view === 'materials' ? <MaterialsView user={sessionUser} /> : null}
      {view === 'lands' ? <LandsView user={sessionUser} /> : null}
      {view === 'suppliers' ? <SuppliersView user={sessionUser} /> : null}
      {view === 'profile' ? <ProfileView user={sessionUser} /> : null}
    </AppShell>
  )
}

export default function Home() {
  return (
    <Providers>
      <SessionGate />
    </Providers>
  )
}
