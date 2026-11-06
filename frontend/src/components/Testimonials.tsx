import { Star, Building, Quote } from 'lucide-react'

export const Testimonials = () => {
  const testimonials = [
    {
      name: 'Rakesh Verma',
      role: 'Managing Director',
      company: 'Verma Infra & Developers, Pune',
      quote:
        'Before ForgeOS, our monthly cement and steel reconciliations took 4 full days across 5 sites. Now our site PMs update the daily logs by 7 PM, and I have complete clarity on wastage before breakfast next morning.',
      highlight: 'Cut material leakage by 18%'
    },
    {
      name: 'Sunil Shenoy',
      role: 'Head of Construction',
      company: 'Apex Heights, Bangalore',
      quote:
        'The progress-adjusted wastage detection is a game changer. We flagged an over-consumption of TMT steel on our 8th floor slab cast in real-time, saving us nearly ₹7 Lakhs on a single project.',
      highlight: 'Real-time overrun alerts'
    },
    {
      name: 'Anand Kulkarni',
      role: 'Senior Project Manager',
      company: 'Kulkarni Builders, NCR',
      quote:
        'My site supervisors love how fast the mobile logging is. Entering machinery fuel, labour headcounts, and stock IN takes just 3 minutes. It completely replaced messy WhatsApp photo updates.',
      highlight: '3-minute site logging'
    }
  ]

  return (
    <section id="testimonials" className="py-24 bg-slate-950 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-4">
            Trusted by Builders
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Built for Real Construction Sites in India
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400">
            Hear from developers and engineers who simplified project execution and clamped down on site costs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between hover:border-amber-500/40 transition-all hover:shadow-xl hover:shadow-amber-500/5 group"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>

                <div className="relative mb-6">
                  <Quote className="w-8 h-8 text-slate-700/50 absolute -top-4 -left-2 -z-0" />
                  <p className="text-slate-300 text-sm leading-relaxed relative z-10 italic">
                    "{t.quote}"
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800/80">
                <div className="inline-block text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full mb-3">
                  {t.highlight}
                </div>
                <h4 className="font-bold text-white text-base">{t.name}</h4>
                <p className="text-xs text-slate-400">{t.role}</p>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                  <Building className="w-3.5 h-3.5" />
                  <span>{t.company}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
