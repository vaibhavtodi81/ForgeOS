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

export function App() {
  if (window.location.pathname === '/daily-logs' || window.location.pathname === '/app/daily-logs') {
    return <DailyLogsPage />
  }
  if (window.location.pathname === '/app/progress-history') {
    return <ProgressHistoryPage />
  }
  if (window.location.pathname === '/app') {
    return <ComingSoonPage title="Dashboard" />
  }
  if (window.location.pathname.startsWith('/app/')) {
    const section = window.location.pathname.split('/')[2] ?? 'Workspace'
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
