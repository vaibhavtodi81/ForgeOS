import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { Features } from './components/Features'
import { HowItWorks } from './components/HowItWorks'
import { ProductGallery } from './components/ProductGallery'
import { Testimonials } from './components/Testimonials'
import PerspectiveTunnelHero from './components/ui/perspective-tunnel-hero'
import { Footer } from './components/Footer'

export function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <Features />
        <HowItWorks />
        <ProductGallery />
        <section id="showcase" className="relative border-t border-slate-800">
          <PerspectiveTunnelHero />
        </section>
        <Testimonials />
      </main>
      <Footer />
    </div>
  )
}

export default App
