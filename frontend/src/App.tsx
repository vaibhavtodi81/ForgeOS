import { hasPermission } from './features/authentication/utils/permissions'
import { LandsPage } from './features/lands/pages/LandsPage'
import { ProjectsPage } from './features/projects/pages/ProjectsPage'
import { ProjectDetailsPage } from './features/projects/pages/ProjectDetailsPage'
import { UsersPage } from './features/users/pages/UsersPage'
import { BillsPage } from './features/bills/pages/BillsPage'
import { VendorsPage } from './features/vendors/pages/VendorsPage'
import { DashboardPage } from './features/app-shell/pages/DashboardPage'
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

export function App() {
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


  if (isProtectedRoute && !hasPermission(['Admin', 'Project Manager'])) {
    return <LoginPage />
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
    return <DashboardPage />
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
    return hasPermission(['Admin'])
      ? <LandsPage />
      : <ComingSoonPage title="Access Denied - Admin Only" />
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
    <div className="min-h-screen bg-[#DDD0C8] text-[#323232] flex flex-col font-sans selection:bg-[#323232] selection:text-[#DDD0C8]">
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

export default App
