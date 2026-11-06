import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { Features } from './components/Features'
import { HowItWorks } from './components/HowItWorks'
import { ProductGallery } from './components/ProductGallery'
import PerspectiveTunnelHero from './components/ui/perspective-tunnel-hero'
import { Testimonials } from './components/Testimonials'
import { Footer } from './components/Footer'

export function App() {
  return (
    <div className="min-h-screen bg-[#DDD0C8] text-[#323232] flex flex-col font-sans selection:bg-[#323232] selection:text-[#DDD0C8]">
      <Navbar />
      <main className="flex-grow">
        <Hero />
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
