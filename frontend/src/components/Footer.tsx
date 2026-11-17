import { Building2, Mail, Phone, MapPin, ArrowRight } from 'lucide-react'

export const Footer = () => {
  return (
    <footer className="bg-[#323232] text-[#DDD0C8] text-sm">
      {/* Top CTA banner in Beige */}
      <div className="bg-[#E8DCD4] text-[#323232] py-16 border-t border-[#323232]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <h3 className="text-2xl sm:text-4xl font-medium tracking-tight">
              Ready to take full control of your construction sites?
            </h3>
            <p className="text-[#595552] mt-2 font-light text-base">
              Start your 14-day free trial. Setup takes less than 15 minutes.
            </p>
          </div>
          <button className="px-8 py-3.5 bg-[#323232] text-[#DDD0C8] font-semibold text-xs uppercase tracking-widest rounded-full hover:bg-[#1E1E1E] transition-all shadow-md flex items-center gap-2 group whitespace-nowrap">
            <span>Get Started with ForgeOS</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#DDD0C8] text-[#323232] flex items-center justify-center font-bold">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold tracking-[0.2em] uppercase text-[#DDD0C8]">
                FORGE<span className="text-[#DDD0C8]/60 font-light">OS</span>
              </span>
            </div>
            <p className="text-xs text-[#DDD0C8]/70 leading-relaxed font-light">
              The centralized project & financial operating system for Indian builders and real estate developers.
            </p>
            <div className="pt-2 text-xs text-[#DDD0C8]/50 font-mono">
              GST-Compliant • INR Standard • Multi-Site
            </div>
          </div>

          {/* Links 1: Platform */}
          <div>
            <h4 className="text-xs font-bold text-[#DDD0C8] uppercase tracking-widest mb-4">Platform</h4>
            <ul className="space-y-2.5 text-xs text-[#DDD0C8]/70 font-light">
              <li><a href="#features" className="hover:text-white transition-colors">Multi-Project Dashboard</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Daily Site Logs</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Stock & Material Ledger</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Progress Wastage Radar</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Billing & Payments</a></li>
            </ul>
          </div>

          {/* Links 2: Solutions */}
          <div>
            <h4 className="text-xs font-bold text-[#DDD0C8] uppercase tracking-widest mb-4">Solutions</h4>
            <ul className="space-y-2.5 text-xs text-[#DDD0C8]/70 font-light">
              <li><a href="#how-it-works" className="hover:text-white transition-colors">For Managing Directors</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">For Project Managers</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">For Land Portfolio Owners</a></li>
              <li><a href="#gallery" className="hover:text-white transition-colors">Interactive Demo</a></li>
            </ul>
          </div>

          {/* Links 3: Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#DDD0C8] uppercase tracking-widest mb-4">Contact</h4>
            <div className="flex items-center gap-2.5 text-xs text-[#DDD0C8]/70 font-light">
              <Mail className="w-4 h-4 text-[#DDD0C8] shrink-0" />
              <span>contact@forgeos.build</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-[#DDD0C8]/70 font-light">
              <Phone className="w-4 h-4 text-[#DDD0C8] shrink-0" />
              <span>+91 98765 43210</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-[#DDD0C8]/70 font-light">
              <MapPin className="w-4 h-4 text-[#DDD0C8] shrink-0 mt-0.5" />
              <span>Greater Noida / Pune, India</span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#DDD0C8]/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#DDD0C8]/50 font-light">
          <p>© {new Date().getFullYear()} ForgeOS Technologies. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-[#DDD0C8]">Privacy Policy</a>
            <a href="#" className="hover:text-[#DDD0C8]">Terms of Service</a>
            <a href="#" className="hover:text-[#DDD0C8]">Security Standards</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
