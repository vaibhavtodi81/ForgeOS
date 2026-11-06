import React from 'react';
import { ArrowRight, Play, Building2, IndianRupee, ShieldCheck, CheckCircle2, TrendingUp, HardHat } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen w-full flex items-center justify-center pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 text-white overflow-hidden">
      {/* Inline styles for subtle custom floating keyframe animations */}
      <style>{`
        @keyframes hero-float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(0.8deg); }
        }
        @keyframes hero-float-reverse {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(10px) rotate(-0.8deg); }
        }
        @keyframes hero-pulse-glow {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.25; transform: scale(1.05); }
        }
        .animate-float-slow {
          animation: hero-float-slow 6s ease-in-out infinite;
        }
        .animate-float-reverse {
          animation: hero-float-reverse 7s ease-in-out infinite;
        }
        .animate-pulse-glow {
          animation: hero-pulse-glow 5s ease-in-out infinite;
        }
      `}</style>

      {/* Subtle Construction-Themed Blueprint Grid Background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black 20%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black 20%, transparent 80%)',
        }}
      />

      {/* Ambient Lighting Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[320px] bg-amber-500/15 blur-[120px] rounded-full pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-600/10 blur-[130px] rounded-full pointer-events-none" />

      {/* Subtle CAD / Construction Blueprint Geometric Crosshair Accents */}
      <div className="absolute top-28 left-8 sm:left-16 text-slate-700/60 font-mono text-xs select-none pointer-events-none hidden md:block">
        + [GRID: SEC-01]
      </div>
      <div className="absolute top-28 right-8 sm:right-16 text-slate-700/60 font-mono text-xs select-none pointer-events-none hidden md:block">
        + [ELEV: +42.50M]
      </div>

      {/* Floating Decorative Element - Left Side (Desktop Site Log Preview) */}
      <div className="hidden xl:flex absolute left-8 top-1/2 -translate-y-28 animate-float-slow z-10 pointer-events-none">
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/70 p-4 rounded-2xl shadow-2xl shadow-black/40 w-64 text-left">
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Log Verified
            </span>
            <span className="text-[11px] text-slate-400">10m ago</span>
          </div>
          <p className="text-sm font-semibold text-white">Tower C • 14th Slab Pour</p>
          <div className="mt-2 pt-2 border-t border-slate-800 text-xs flex justify-between items-center text-slate-300">
            <span>Cement Wastage</span>
            <span className="text-emerald-400 font-semibold">-1.2% (Under Norm)</span>
          </div>
        </div>
      </div>

      {/* Floating Decorative Element - Right Side (Desktop Financial Badge) */}
      <div className="hidden xl:flex absolute right-8 top-1/2 -translate-y-16 animate-float-reverse z-10 pointer-events-none">
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/70 p-4 rounded-2xl shadow-2xl shadow-black/40 w-64 text-left">
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              <TrendingUp className="w-3.5 h-3.5" />
              Billing Audit
            </span>
            <span className="text-[11px] text-slate-400">GST Matched</span>
          </div>
          <p className="text-sm font-semibold text-white">Steel Supplier Invoice</p>
          <div className="mt-2 pt-2 border-t border-slate-800 text-xs flex justify-between items-center text-slate-300">
            <span>Verified Payout</span>
            <span className="text-amber-400 font-bold">₹18,40,000</span>
          </div>
        </div>
      </div>

      {/* Main Hero Container */}
      <div className="relative z-20 max-w-5xl mx-auto text-center flex flex-col items-center">
        {/* Industry Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs sm:text-sm font-medium text-slate-300 shadow-inner mb-6 sm:mb-8 backdrop-blur-sm">
          <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-ping" />
          <span className="h-2 w-2 rounded-full bg-amber-500 -ml-4" />
          <HardHat className="w-4 h-4 text-amber-400" />
          <span>The Operating System for Indian Real Estate & Builders</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.15] max-w-4xl">
          Manage Every Project.{' '}
          <span className="block mt-1 sm:mt-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500">
            Control Every Rupee.
          </span>
        </h1>

        {/* Subheading */}
        <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-300 font-normal leading-relaxed max-w-3xl">
          ForgeOS gives builders and developers a single, real-time view of all projects — progress, resources, wastage, and payments — so nothing slips through the cracks.
        </p>

        {/* Two CTA Buttons */}
        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <a
            href="#trial"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 text-base font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all duration-200 transform hover:-translate-y-0.5 group"
          >
            Start Free Trial
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </a>

          <a
            href="#demo"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 text-base font-medium text-white border border-slate-600/80 hover:border-slate-400 bg-slate-800/40 hover:bg-slate-800/80 rounded-xl transition-all duration-200 backdrop-blur-sm"
          >
            <Play className="w-4 h-4 text-amber-400 fill-amber-400" />
            Watch Demo
          </a>
        </div>

        {/* 3 Small Stat Badges in a Row */}
        <div className="mt-14 sm:mt-16 w-full max-w-3xl pt-8 border-t border-slate-800/90">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
            {/* Stat Badge 1 */}
            <div className="flex items-center gap-3.5 px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm shadow-md transition-all hover:border-slate-700">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-xl font-bold text-white tracking-tight leading-none">500+</p>
                <p className="text-xs text-slate-400 font-medium mt-1">Projects Managed</p>
              </div>
            </div>

            {/* Stat Badge 2 */}
            <div className="flex items-center gap-3.5 px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm shadow-md transition-all hover:border-slate-700">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <IndianRupee className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-xl font-bold text-white tracking-tight leading-none">₹200Cr+</p>
                <p className="text-xs text-slate-400 font-medium mt-1">Tracked</p>
              </div>
            </div>

            {/* Stat Badge 3 */}
            <div className="flex items-center gap-3.5 px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm shadow-md transition-all hover:border-slate-700">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-xl font-bold text-white tracking-tight leading-none">50+</p>
                <p className="text-xs text-slate-400 font-medium mt-1">Builders Trust Us</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
