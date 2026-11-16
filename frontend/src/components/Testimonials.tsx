// Imports Star, Building, Quote from lucide-react so this module can reuse that component, helper, or library.
import { Star, Building, Quote } from 'lucide-react'

// Stores the value in Testimonials so later lines can reuse this data or behavior for the current feature.
export const Testimonials = () => {
  // Stores the value in testimonials so later lines can reuse this data or behavior for the current feature.
  const testimonials = [
    // Opens a block or object so its related statements or settings can be grouped together.
    {
      // Sets the name field so the surrounding object or component receives this setting.
      name: 'Rakesh Verma',
      // Sets the role field so the surrounding object or component receives this setting.
      role: 'Managing Director',
      // Sets the company field so the surrounding object or component receives this setting.
      company: 'Verma Infra & Developers, Pune',
      // Sets the quote field so the surrounding object or component receives this setting.
      quote:
        // Continues the component or data expression so its related values and behavior stay grouped together.
        'Before ForgeOS, our monthly cement and steel reconciliations took 4 full days across 5 sites. Now our site PMs update the daily logs by 7 PM, and I have complete clarity on wastage before breakfast next morning.',
      // Sets the highlight field so the surrounding object or component receives this setting.
      highlight: 'Cut material leakage by 18%'
    // Closes the current block or object so the grouped statements or settings end here.
    },
    // Opens a block or object so its related statements or settings can be grouped together.
    {
      // Sets the name field so the surrounding object or component receives this setting.
      name: 'Sunil Shenoy',
      // Sets the role field so the surrounding object or component receives this setting.
      role: 'Head of Construction',
      // Sets the company field so the surrounding object or component receives this setting.
      company: 'Apex Heights, Bangalore',
      // Sets the quote field so the surrounding object or component receives this setting.
      quote:
        // Continues the component or data expression so its related values and behavior stay grouped together.
        'The progress-adjusted wastage detection is a game changer. We flagged an over-consumption of TMT steel on our 8th floor slab cast in real-time, saving us nearly ₹7 Lakhs on a single project.',
      // Sets the highlight field so the surrounding object or component receives this setting.
      highlight: 'Real-time overrun alerts'
    // Closes the current block or object so the grouped statements or settings end here.
    },
    // Opens a block or object so its related statements or settings can be grouped together.
    {
      // Sets the name field so the surrounding object or component receives this setting.
      name: 'Anand Kulkarni',
      // Sets the role field so the surrounding object or component receives this setting.
      role: 'Senior Project Manager',
      // Sets the company field so the surrounding object or component receives this setting.
      company: 'Kulkarni Builders, NCR',
      // Sets the quote field so the surrounding object or component receives this setting.
      quote:
        // Continues the component or data expression so its related values and behavior stay grouped together.
        'My site supervisors love how fast the mobile logging is. Entering machinery fuel, labour headcounts, and stock IN takes just 3 minutes. It completely replaced messy WhatsApp photo updates.',
      // Sets the highlight field so the surrounding object or component receives this setting.
      highlight: '3-minute site logging'
    // Closes the current block or object so the grouped statements or settings end here.
    }
  // Continues the component or data expression so its related values and behavior stay grouped together.
  ]

  // Returns the result so the caller or React receives the value or interface this function provides.
  return (
    // Continues the component or data expression so its related values and behavior stay grouped together.
    <section id="testimonials" className="py-24 sm:py-32 bg-[#DDD0C8] text-[#323232] relative border-t border-[#323232]/10">
      {/* Starts the <div> element to organize this part of the interface. */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Starts the <div> element to organize this part of the interface. */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest bg-[#323232] text-[#DDD0C8] mb-4">
            {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
            Trusted by Builders
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>
          {/* Starts the <h2> element to organize this part of the interface. */}
          <h2 className="text-3xl sm:text-5xl font-medium tracking-tight text-[#323232]">
            {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
            Built for Real Construction Sites in India
          {/* Closes the <h2> element so later content is no longer part of this region. */}
          </h2>
          {/* Starts the <p> element to organize this part of the interface. */}
          <p className="mt-4 text-base sm:text-lg text-[#595552] font-light">
            {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
            Hear from developers and engineers who simplified project execution and clamped down on site costs.
          {/* Closes the <p> element so later content is no longer part of this region. */}
          </p>
        {/* Closes the <div> element so later content is no longer part of this region. */}
        </div>

        {/* Starts the <div> element to organize this part of the interface. */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
          {testimonials.map((t, idx) => (
            // Continues the component or data expression so its related values and behavior stay grouped together.
            <div
              /* Gives this rendered item a stable identity so React can update lists efficiently. */
              key={idx}
              /* Applies utility classes so the element’s layout, spacing, and appearance match the design. */
              className="bg-[#E8DCD4] border border-[#323232]/10 rounded-3xl p-8 flex flex-col justify-between hover:border-[#323232]/30 transition-all shadow-sm group"
            /* Continues the component or data expression so its related values and behavior stay grouped together. */
            /* Continues the component or data expression so its related values and behavior stay grouped together. */
            >
              {/* Starts the <div> element to organize this part of the interface. */}
              <div>
                {/* Starts the <div> element to organize this part of the interface. */}
                <div className="flex items-center gap-1 text-[#323232] mb-6">
                  {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#323232]" />
                  ))}
                {/* Closes the <div> element so later content is no longer part of this region. */}
                </div>

                {/* Starts the <div> element to organize this part of the interface. */}
                <div className="relative mb-6">
                  {/* Starts the <Quote> element to organize this part of the interface. */}
                  <Quote className="w-8 h-8 text-[#323232]/15 absolute -top-4 -left-2 -z-0" />
                  {/* Starts the <p> element to organize this part of the interface. */}
                  <p className="text-[#323232] text-sm leading-relaxed relative z-10 font-light">
                    {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                    "{t.quote}"
                  {/* Closes the <p> element so later content is no longer part of this region. */}
                  </p>
                {/* Closes the <div> element so later content is no longer part of this region. */}
                </div>
              {/* Closes the <div> element so later content is no longer part of this region. */}
              </div>

              {/* Starts the <div> element to organize this part of the interface. */}
              <div className="pt-6 border-t border-[#323232]/10">
                {/* Starts the <div> element to organize this part of the interface. */}
                <div className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#DDD0C8] bg-[#323232] px-2.5 py-1 rounded-full mb-3">
                  {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                  {t.highlight}
                {/* Closes the <div> element so later content is no longer part of this region. */}
                </div>
                {/* Starts the <h4> element to organize this part of the interface. */}
                <h4 className="font-bold text-[#323232] text-base">{t.name}</h4>
                {/* Starts the <p> element to organize this part of the interface. */}
                <p className="text-xs text-[#595552] font-light">{t.role}</p>
                {/* Starts the <div> element to organize this part of the interface. */}
                <div className="flex items-center gap-1.5 text-xs text-[#595552] mt-1">
                  {/* Starts the <Building> element to organize this part of the interface. */}
                  <Building className="w-3.5 h-3.5" />
                  {/* Starts the <span> element to organize this part of the interface. */}
                  <span>{t.company}</span>
                {/* Closes the <div> element so later content is no longer part of this region. */}
                </div>
              {/* Closes the <div> element so later content is no longer part of this region. */}
              </div>
            {/* Closes the <div> element so later content is no longer part of this region. */}
            </div>
          // Continues the component or data expression so its related values and behavior stay grouped together.
          ))}
        {/* Closes the <div> element so later content is no longer part of this region. */}
        </div>
      {/* Closes the <div> element so later content is no longer part of this region. */}
      </div>
    {/* Closes the <section> element so later content is no longer part of this region. */}
    </section>
  // Closes this function call or grouped expression so the surrounding code can continue.
  )
// Closes the current block or object so the grouped statements or settings end here.
}
// File purpose: Renders the reusable Testimonials interface component.
