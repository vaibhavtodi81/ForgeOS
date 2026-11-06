import React from 'react';
import { ArrowRight, Play, Building2, IndianRupee, ShieldCheck, CheckCircle2, TrendingUp } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen w-full flex items-center justify-center pt-28 pb-20 px-4 sm:px-6 lg:px-8 bg-[#DDD0C8] text-[#323232] overflow-hidden">
      {/* Subtle architectural grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(50, 50, 50, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(50, 50, 50, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 45%, black 20%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 45%, black 20%, transparent 80%)',
        }}
      />

      {/* Floating Decorative Preview - Left */}
      <div className="hidden xl:flex absolute left-8 top-1/3 -translate-y-12 z-10 pointer-events-none">
        <div className="bg-[#E8DCD4]/90 backdrop-blur-md border border-[#323232]/15 p-4 rounded-2xl shadow-xl w-64 text-left">
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#323232] bg-[#323232]/10 px-2.5 py-0.5 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Site Log Verified
            </span>
            <span className="text-[10px] text-[#595552]">Today</span>
          </div>
          <p className="text-sm font-bold text-[#323232]">Tower C • 14th Slab Pour</p>
          <div className="mt-2 pt-2 border-t border-[#323232]/10 text-xs flex justify-between items-center text-[#595552]">
            <span>Material Wastage</span>
            <span className="text-[#323232] font-semibold">-1.2% (Under Norm)</span>
          </div>
        </div>
      </div>

      {/* Floating Decorative Preview - Right */}
      <div className="hidden xl:flex absolute right-8 top-1/3 -translate-y-4 z-10 pointer-events-none">
        <div className="bg-[#E8DCD4]/90 backdrop-blur-md border border-[#323232]/15 p-4 rounded-2xl shadow-xl w-64 text-left">
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#323232] bg-[#323232]/10 px-2.5 py-0.5 rounded-full">
              <TrendingUp className="w-3.5 h-3.5" />
              Billing Reconciliation
            </span>
            <span className="text-[10px] text-[#595552]">GST Ready</span>
          </div>
          <p className="text-sm font-bold text-[#323232]">Steel Supplier Invoice</p>
          <div className="mt-2 pt-2 border-t border-[#323232]/10 text-xs flex justify-between items-center text-[#595552]">
            <span>Verified Payout</span>
            <span className="text-[#323232] font-bold">₹18,40,000</span>
          </div>
        </div>
      </div>

      {/* Main Hero Container */}
      <div className="relative z-20 max-w-5xl mx-auto text-center flex flex-col items-center">
        {/* Top Notification Pill - Just like the SaaS template */}
        <aside className="mb-6 inline-flex flex-wrap items-center justify-center gap-2 px-5 py-2 rounded-full border border-[#323232]/15 bg-[#E8DCD4]/80 backdrop-blur-sm shadow-xs">
          <span className="text-xs text-center whitespace-nowrap text-[#595552]">
            ForgeOS 2.0 with progress-adjusted wastage radar is live
          </span>
          <a
            href="#features"
            className="flex items-center gap-1 text-xs font-bold text-[#323232] hover:underline transition-all active:scale-95 whitespace-nowrap"
            aria-label="Read more"
          >
            Explore features
            <ArrowRight size={12} />
          </a>
        </aside>

        {/* Primary Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-medium tracking-tight text-[#323232] leading-[1.1] max-w-4xl">
          Brightening construction with beautiful, durable systems.
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg text-[#595552] max-w-2xl font-light leading-relaxed">
          ForgeOS gives builders and real estate developers a single, reliable view of site progress, material balances, wastage alerts, and vendor payouts.
        </p>

        {/* Action Buttons - Pill style matching reference image */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <a
            href="#get-started"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-xs font-semibold uppercase tracking-widest text-[#DDD0C8] bg-[#323232] hover:bg-[#1E1E1E] transition-all duration-200 shadow-md group"
          >
            <span>Start Free Trial</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>

          <a
            href="#showcase"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-xs font-semibold uppercase tracking-widest text-[#323232] border border-[#323232]/30 hover:border-[#323232] hover:bg-[#323232]/5 transition-all duration-200"
          >
            <Play className="w-3.5 h-3.5 fill-[#323232]" />
            <span>Explore 3D Sites</span>
          </a>
        </div>

        {/* Centerpiece: Layered SaaS Dashboard Showcase Card (just like saa-s-template) */}
        <div className="w-full max-w-5xl mt-14 relative">
          {/* Subtle Ambient Layered Blur Behind */}
          <div
            className="absolute left-1/2 w-[92%] h-48 pointer-events-none z-0 bg-[#323232]/10 blur-xl rounded-full"
            style={{
              top: "-5%",
              transform: "translateX(-50%)"
            }}
            aria-hidden="true"
          />
          
          {/* Main Dashboard Preview Card */}
          <div className="relative z-10 bg-[#E8DCD4] rounded-3xl p-3 sm:p-5 border border-[#323232]/15 shadow-2xl overflow-hidden text-left">
            {/* Window chrome header */}
            <div className="flex items-center justify-between pb-3 px-3 border-b border-[#323232]/10 mb-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#323232]/25" />
                <div className="w-3 h-3 rounded-full bg-[#323232]/25" />
                <div className="w-3 h-3 rounded-full bg-[#323232]/25" />
                <span className="ml-2 font-mono text-[11px] text-[#323232] font-semibold">
                  app.forgeos.build • Portfolio Dashboard
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-[#323232] text-[#DDD0C8]">
                  4 Active Sites
                </span>
                <span className="text-[11px] font-mono text-[#595552] hidden sm:inline">Sonipat • Pune • NCR</span>
              </div>
            </div>

            {/* Quick Metrics Bar inside Dashboard Card */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="p-3.5 rounded-2xl bg-[#DDD0C8]/60 border border-[#323232]/10">
                <span className="text-[10px] text-[#595552] uppercase tracking-wider font-semibold">Total Portfolio</span>
                <p className="text-base sm:text-lg font-bold text-[#323232] mt-0.5">₹38.0 Cr</p>
                <span className="text-[10px] text-[#595552]">Budget Approved</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#DDD0C8]/60 border border-[#323232]/10">
                <span className="text-[10px] text-[#595552] uppercase tracking-wider font-semibold">Committed Spend</span>
                <p className="text-base sm:text-lg font-bold text-[#323232] mt-0.5">₹11.2 Cr</p>
                <span className="text-[10px] text-[#323232] font-semibold">29.4% used</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#DDD0C8]/60 border border-[#323232]/10">
                <span className="text-[10px] text-[#595552] uppercase tracking-wider font-semibold">Paid to Vendors</span>
                <p className="text-base sm:text-lg font-bold text-[#323232] mt-0.5">₹8.4 Cr</p>
                <span className="text-[10px] text-[#595552]">Zero Overdue</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#DDD0C8]/60 border border-[#323232]/10">
                <span className="text-[10px] text-[#595552] uppercase tracking-wider font-semibold">Wastage Alert</span>
                <p className="text-base sm:text-lg font-bold text-[#323232] mt-0.5">1 Material</p>
                <span className="text-[10px] text-[#323232] font-semibold">Cement Overrun</span>
              </div>
            </div>

            {/* High-res Dashboard View */}
            <div className="relative rounded-2xl overflow-hidden border border-[#323232]/10 max-h-[380px]">
              <img
                src="https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?auto=format&fit=crop&w=1600&q=85"
                alt="ForgeOS Centralized Site Construction Dashboard"
                className="w-full h-auto object-cover max-h-[360px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#323232]/90 via-[#323232]/25 to-transparent flex items-end p-6">
                <div className="text-[#DDD0C8]">
                  <div className="text-[10px] uppercase tracking-widest font-mono text-[#DDD0C8]/70">Live Site Sync</div>
                  <div className="text-lg sm:text-xl font-bold">Skyline Heights — Sector 12, Sonipat</div>
                  <p className="text-xs text-[#DDD0C8]/80 mt-1 max-w-xl font-light">
                    Daily progress 42.5% • 32 workers on site • 800 bags cement received with verified delivery challan #CH-4471.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Bottom Stat Badges in Beige & Dark Grey */}
        <div className="mt-14 pt-8 border-t border-[#323232]/15 w-full grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          <div className="flex flex-col items-center p-4 rounded-2xl bg-[#E8DCD4]/50 border border-[#323232]/10">
            <div className="flex items-center gap-2 text-[#323232] font-semibold text-base sm:text-lg">
              <Building2 className="w-4 h-4" />
              <span>500+ Projects</span>
            </div>
            <span className="text-xs text-[#595552] mt-1 font-light">Managed across India</span>
          </div>

          <div className="flex flex-col items-center p-4 rounded-2xl bg-[#E8DCD4]/50 border border-[#323232]/10">
            <div className="flex items-center gap-2 text-[#323232] font-semibold text-base sm:text-lg">
              <IndianRupee className="w-4 h-4" />
              <span>₹200Cr+ Spend</span>
            </div>
            <span className="text-xs text-[#595552] mt-1 font-light">Accurately reconciled</span>
          </div>

          <div className="flex flex-col items-center p-4 rounded-2xl bg-[#E8DCD4]/50 border border-[#323232]/10">
            <div className="flex items-center gap-2 text-[#323232] font-semibold text-base sm:text-lg">
              <ShieldCheck className="w-4 h-4" />
              <span>50+ Developers</span>
            </div>
            <span className="text-xs text-[#595552] mt-1 font-light">Trust ForgeOS daily</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
