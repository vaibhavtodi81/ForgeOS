import { Building2, Mail, Phone, MapPin, ArrowRight } from 'lucide-react'

export const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 text-sm">
      {/* Top CTA banner */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to take full control of your construction sites?
            </h3>
            <p className="text-slate-950/80 mt-1 font-medium text-sm sm:text-base">
              Start your 14-day free trial. Setup takes less than 15 minutes.
            </p>
          </div>
          <button className="px-6 py-3.5 bg-slate-950 text-white font-bold rounded-xl hover:bg-slate-900 transition-all shadow-lg flex items-center gap-2 group whitespace-nowrap">
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
              <div className="p-2 rounded-xl bg-amber-500 text-slate-950">
                <Building2 className="w-6 h-6" />
              </div>
              <span className="text-xl font-extrabold tracking-wider text-white">
                Forge<span className="text-amber-500">OS</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              The centralized project & financial operating system for Indian builders and real estate developers.
            </p>
            <div className="pt-2 text-xs text-slate-500">
              GST-Compliant • INR Standard • Multi-Site
            </div>
          </div>

          {/* Links 1: Platform */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5 text-xs">
              <li><a href="#features" className="hover:text-amber-400 transition-colors">Multi-Project Dashboard</a></li>
              <li><a href="#features" className="hover:text-amber-400 transition-colors">Daily Site Logs</a></li>
              <li><a href="#features" className="hover:text-amber-400 transition-colors">Stock & Material Ledger</a></li>
              <li><a href="#features" className="hover:text-amber-400 transition-colors">Progress Wastage Radar</a></li>
              <li><a href="#features" className="hover:text-amber-400 transition-colors">Billing & Payments</a></li>
            </ul>
          </div>

          {/* Links 2: Solutions */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Solutions</h4>
            <ul className="space-y-2.5 text-xs">
              <li><a href="#how-it-works" className="hover:text-amber-400 transition-colors">For Managing Directors</a></li>
              <li><a href="#how-it-works" className="hover:text-amber-400 transition-colors">For Project Managers</a></li>
              <li><a href="#how-it-works" className="hover:text-amber-400 transition-colors">For Land Portfolio Owners</a></li>
              <li><a href="#gallery" className="hover:text-amber-400 transition-colors">Interactive Demo</a></li>
            </ul>
          </div>

          {/* Links 3: Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Contact & Support</h4>
            <div className="flex items-center gap-2.5 text-xs text-slate-400">
              <Mail className="w-4 h-4 text-amber-500 shrink-0" />
              <span>contact@forgeos.build</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-400">
              <Phone className="w-4 h-4 text-amber-500 shrink-0" />
              <span>+91 98765 43210</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-slate-400">
              <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>Tech Zone 4, Greater Noida / Pune, India</span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} ForgeOS Technologies. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-400">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400">Terms of Service</a>
            <a href="#" className="hover:text-slate-400">Security Standards</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
