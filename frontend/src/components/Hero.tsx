import React from 'react';
import { ArrowRight, Play, Building2, IndianRupee, ShieldCheck, CheckCircle2, TrendingUp } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="relative min-h-[90vh] w-full flex items-center justify-center pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-[#DDD0C8] text-[#323232] overflow-hidden">
      {/* Subtle architectural grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
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
      <div className="hidden xl:flex absolute left-8 top-1/2 -translate-y-24 z-10 pointer-events-none">
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
      <div className="hidden xl:flex absolute right-8 top-1/2 -translate-y-12 z-10 pointer-events-none">
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
      <div className="relative z-20 max-w-4xl mx-auto text-center flex flex-col items-center">
        {/* Eyebrow - Exactly like the reference image */}
        <p className="text-sm sm:text-base font-normal text-[#595552] mb-6 tracking-wide">
          Your projects are as demanding as your ambition
        </p>

        {/* Primary Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-medium tracking-tight text-[#323232] leading-[1.1] max-w-3xl">
          Brightening construction with beautiful, durable systems.
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg text-[#595552] max-w-2xl font-light leading-relaxed">
          ForgeOS gives builders and real estate developers a single, reliable view of progress, stock balances, wastage, and contractor bills.
        </p>

        {/* Action Buttons - Pill style matching reference image */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
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

        {/* Stat Badges in Beige & Dark Grey */}
        <div className="mt-16 pt-10 border-t border-[#323232]/15 w-full grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          <div className="flex flex-col items-center p-4 rounded-2xl bg-[#E8DCD4]/50 border border-[#323232]/10">
            <div className="flex items-center gap-2 text-[#323232] font-semibold text-lg">
              <Building2 className="w-4 h-4" />
              <span>500+ Projects</span>
            </div>
            <span className="text-xs text-[#595552] mt-1 font-light">Managed across India</span>
          </div>

          <div className="flex flex-col items-center p-4 rounded-2xl bg-[#E8DCD4]/50 border border-[#323232]/10">
            <div className="flex items-center gap-2 text-[#323232] font-semibold text-lg">
              <IndianRupee className="w-4 h-4" />
              <span>₹200Cr+ Spend</span>
            </div>
            <span className="text-xs text-[#595552] mt-1 font-light">Accurately reconciled</span>
          </div>

          <div className="flex flex-col items-center p-4 rounded-2xl bg-[#E8DCD4]/50 border border-[#323232]/10">
            <div className="flex items-center gap-2 text-[#323232] font-semibold text-lg">
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
