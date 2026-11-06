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
    <section id="testimonials" className="py-24 sm:py-32 bg-[#DDD0C8] text-[#323232] relative border-t border-[#323232]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest bg-[#323232] text-[#DDD0C8] mb-4">
            Trusted by Builders
          </div>
          <h2 className="text-3xl sm:text-5xl font-medium tracking-tight text-[#323232]">
            Built for Real Construction Sites in India
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#595552] font-light">
            Hear from developers and engineers who simplified project execution and clamped down on site costs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="bg-[#E8DCD4] border border-[#323232]/10 rounded-3xl p-8 flex flex-col justify-between hover:border-[#323232]/30 transition-all shadow-sm group"
            >
              <div>
                <div className="flex items-center gap-1 text-[#323232] mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#323232]" />
                  ))}
                </div>

                <div className="relative mb-6">
                  <Quote className="w-8 h-8 text-[#323232]/15 absolute -top-4 -left-2 -z-0" />
                  <p className="text-[#323232] text-sm leading-relaxed relative z-10 font-light">
                    "{t.quote}"
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-[#323232]/10">
                <div className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#DDD0C8] bg-[#323232] px-2.5 py-1 rounded-full mb-3">
                  {t.highlight}
                </div>
                <h4 className="font-bold text-[#323232] text-base">{t.name}</h4>
                <p className="text-xs text-[#595552] font-light">{t.role}</p>
                <div className="flex items-center gap-1.5 text-xs text-[#595552] mt-1">
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
