import { hasPermission, isAdmin } from './features/authentication/utils/permissions'
import { useAuth } from './features/authentication/auth/useAuth'
import { LandsPage } from './features/lands/pages/LandsPage'
import { ProjectsPage } from './features/projects/pages/ProjectsPage'
import { ProjectDetailsPage } from './features/projects/pages/ProjectDetailsPage'
import { UsersPage } from './features/users/pages/UsersPage'
import { BillsPage } from './features/bills/pages/BillsPage'
import { VendorsPage } from './features/vendors/pages/VendorsPage'
import { useEffect, useState } from 'react'
import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { Features } from './components/Features'
import { HowItWorks } from './components/HowItWorks'
import { ProductGallery } from './components/ProductGallery'
import PerspectiveTunnelHero from './components/ui/perspective-tunnel-hero'
import { Testimonials } from './components/Testimonials'
import { Footer } from './components/Footer'
import SiteStoryReveal from './components/SiteStoryReveal'
import { DailyLogsPage } from './features/daily-logs/pages/DailyLogsPage'
import { ProgressHistoryPage } from './features/progress-history/pages/ProgressHistoryPage'
import { ComingSoonPage } from './features/app-shell/pages/ComingSoonPage'
import { ProjectLogsPage } from './features/daily-logs/pages/ProjectLogsPage'
import { ProjectLogFormPage } from './features/daily-logs/pages/ProjectLogFormPage'
import { ProjectLogDetailPage } from './features/daily-logs/pages/ProjectLogDetailPage'
import { ProjectProgressPage } from './features/progress-history/pages/ProjectProgressPage'
import { LoginPage } from './features/authentication/pages/LoginPage'
import { MaterialsPage } from './features/materials/pages/MaterialsPage'
import { MaterialPlanningPage } from './features/materials/pages/MaterialPlanningPage'
import { StockInPage } from './features/stock/pages/StockInPage'
import { StockOutPage } from './features/stock/pages/StockOutPage'
import { StockLedgerPage } from './features/stock/pages/StockLedgerPage'
import { StockDashboardPage } from './features/stock/pages/StockDashboardPage'
import { WastageAnalysisPage } from './features/wastage/pages/WastageAnalysisPage'
import { AdminDashboardPage } from './features/app-shell/pages/AdminDashboardPage'
import { ProjectManagerDashboardPage } from './features/app-shell/pages/ProjectManagerDashboardPage'

export function App() {
  const { user, status, error, retrySessionRestore, logout } = useAuth()
  const [pathname, setPathname] = useState(
    window.location.hash === '#login' ? '#login' : window.location.pathname
  )

  useEffect(() => {
    const handleLocationChange = () => {
      setPathname(
        window.location.hash === '#login'
          ? '#login'
          : window.location.pathname
      )
    }

    window.addEventListener('popstate', handleLocationChange)
    window.addEventListener('hashchange', handleLocationChange)

    return () => {
      window.removeEventListener('popstate', handleLocationChange)
      window.removeEventListener('hashchange', handleLocationChange)
    }
  }, [])

  const pathParts = pathname.split('/').filter(Boolean)

  const isProtectedRoute =
    pathname === '/app' ||
    pathname.startsWith('/app/') ||
    pathParts[0] === 'projects' ||
    pathname === '/daily-logs'

  useEffect(() => {
    if (status === 'unauthenticated' && isProtectedRoute) {
      window.history.replaceState({}, '', '/login')
    }
  }, [status, isProtectedRoute])

  if (status === 'loading') {
    return <AuthStatusPage title="Checking your session…" />
  }
  if (status === 'error') {
    return <AuthStatusPage
      title="Unable to verify your session"
      message={error ?? 'Check your connection and try again.'}
      onRetry={retrySessionRestore}
      onLogout={logout}
    />
  }
  if (isProtectedRoute && !user) {
    return <LoginPage />
  }
  if ((pathname === '#login' || pathname === '/login') && user) {
    return isAdmin() ? <AdminDashboardPage /> : <ProjectManagerDashboardPage />
  }

  if (pathname === '#login' || pathname === '/login') {
    return <LoginPage />
  }
  if (pathname === '/login') {
    return <LoginPage />
  }
  if (pathParts.length === 4 && pathParts[0] === 'projects' && pathParts[2] === 'logs' && pathParts[3] === 'new') {
    return <ProjectLogFormPage projectId={pathParts[1]} />
  }
  if (pathParts.length === 5 && pathParts[0] === 'projects' && pathParts[2] === 'logs' && pathParts[4] === 'edit') {
    return <ProjectLogFormPage logId={pathParts[3]} projectId={pathParts[1]} />
  }
  if (pathParts.length === 4 && pathParts[0] === 'projects' && pathParts[2] === 'logs') {
    return <ProjectLogDetailPage logId={pathParts[3]} projectId={pathParts[1]} />
  }
  if (pathParts.length === 3 && pathParts[0] === 'projects' && pathParts[2] === 'progress') {
    return <ProjectProgressPage projectId={pathParts[1]} />
  }
  if (pathParts.length === 3 && pathParts[0] === 'projects' && pathParts[2] === 'logs') {
    return <ProjectLogsPage projectId={pathParts[1]} />
  }
  if (pathname === '/daily-logs' || pathname === '/app/daily-logs') {
    return <DailyLogsPage />
  }
  if (pathname === '/app/progress-history') {
    return <ProgressHistoryPage />
  }
  if (pathname === '/app') {
    return isAdmin() ? <AdminDashboardPage /> : <ProjectManagerDashboardPage />
  }
  if (pathname === '/app/pm/dashboard') {
    return hasPermission(['Project Manager', 'Admin'])
      ? <ProjectManagerDashboardPage />
      : <ComingSoonPage title="Access Denied - Project Manager Only" />
  }
  if (pathname === '/app/admin/dashboard') {
    return hasPermission(['Admin'])
      ? <AdminDashboardPage />
      : <ComingSoonPage title="Access Denied - Admin Only" />
  }
  if (pathname === '/app/users') {
    return hasPermission(['Admin'])
      ? <UsersPage />
      : <ComingSoonPage title="Access Denied - Admin Only" />
  }
  if (pathParts.length === 3 && pathParts[0] === 'app' && pathParts[1] === 'projects') {
    return <ProjectDetailsPage />
  }
  if (pathname === '/app/projects') {
    return <ProjectsPage />
  }
  if (pathname === '/app/lands') {
    return <LandsPage />
  }
  if (pathname === '/app/bills/upload') {
    return <BillsPage openUpload />
  }
  if (pathname === '/app/bills') {
    return <BillsPage />
  }
  if (pathname === '/app/vendors') {
    return <VendorsPage />
  }
  if (pathname === '/app/materials') {
    return <MaterialsPage />
  }
  if (pathname === '/app/material-planning') {
    return <MaterialPlanningPage />
  }
  if (pathname === '/app/stock') {
    return <StockDashboardPage />
  }
  if (pathname === '/app/stock-in') {
    return <StockInPage />
  }
  if (pathname === '/app/stock-out') {
    return <StockOutPage />
  }
  if (pathname === '/app/stock-ledger') {
    return <StockLedgerPage />
  }
  if (pathname === '/app/wastage') {
    return <WastageAnalysisPage />
  }
  if (pathname.startsWith('/app/')) {
    const section = pathname.split('/')[2] ?? 'Workspace'
    const title = section.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    return <ComingSoonPage title={title} />
  }

  return (
    <div className="forgeos-landing min-h-screen flex flex-col font-sans selection:bg-[#F2A65A] selection:text-[#171717]">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <SiteStoryReveal />
        <Features />
        <HowItWorks />
        <ProductGallery />
        <section id="showcase" className="relative border-t border-[#323232]/15">
          <PerspectiveTunnelHero />
        </section>
        <Testimonials />
      </main>
      <Footer />
    </div>
  )
}

function AuthStatusPage({
  title,
  message,
  onRetry,
  onLogout,
}: {
  title: string
  message?: string
  onRetry?: () => void
  onLogout?: () => void
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F3EE] p-6 text-[#323232]">
      <section className="w-full max-w-md rounded-2xl border border-[#E8E0DA] bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold">{title}</h1>
        {message && <p role="alert" className="mt-3 text-sm text-[#8E5143]">{message}</p>}
        {!message && <p className="mt-3 text-sm text-[#8E827A]">Please wait while ForgeOS validates your credentials.</p>}
        {onRetry && <button className="mt-5 rounded-xl bg-[#323232] px-4 py-2.5 text-sm font-semibold text-white" onClick={onRetry} type="button">Retry</button>}
        {onLogout && <button className="ml-2 mt-5 rounded-xl border border-[#E8E0DA] px-4 py-2.5 text-sm font-semibold" onClick={onLogout} type="button">Sign in again</button>}
      </section>
    </main>
  )
}

export default App
