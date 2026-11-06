import { useState } from 'react'
import {
  TrendingUp,
  AlertTriangle,
  Receipt,
  ClipboardList,
  CheckCircle2,
  Package,
  Layers,
  Users,
  Clock
} from 'lucide-react'

export const ProductGallery = () => {
  const [activeTab, setActiveTab] = useState<'admin' | 'pm' | 'wastage'>('admin')

  return (
    <section id="gallery" className="py-24 bg-slate-900 text-white relative overflow-hidden">
      {/* Decorative background grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-4">
            Interactive Product Demo
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Designed for Both Site Engineers & Project Owners
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400">
            See how ForgeOS transforms day-to-day operations for on-site supervisors and boardroom decision makers.
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-800/80 border border-slate-700/60 backdrop-blur-md">
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'admin'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-lg shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Builder / Owner Dashboard
            </button>
            <button
              onClick={() => setActiveTab('pm')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'pm'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-lg shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              Site Manager Quick Entry
            </button>
            <button
              onClick={() => setActiveTab('wastage')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'wastage'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-lg shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              Wastage & Finance Radar
            </button>
          </div>
        </div>

        {/* Tab 1: Builder/Admin View */}
        {activeTab === 'admin' && (
          <div className="bg-slate-950/70 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* Infographic card */}
              <div className="flex-1 w-full space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div>
                    <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider">Multi-Project Overview</span>
                    <h3 className="text-xl font-bold text-white mt-1">Skyline Heights & Grand Palms</h3>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Live Data
                  </span>
                </div>

                {/* 4 Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                    <span className="text-xs text-slate-400">Total Portfolio</span>
                    <p className="text-lg font-bold text-white mt-1">₹38.0 Cr</p>
                    <span className="text-[11px] text-slate-500">4 Active Sites</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                    <span className="text-xs text-slate-400">Committed Spend</span>
                    <p className="text-lg font-bold text-amber-400 mt-1">₹11.2 Cr</p>
                    <span className="text-[11px] text-amber-500/80">29.4% budget</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                    <span className="text-xs text-slate-400">Paid Out</span>
                    <p className="text-lg font-bold text-emerald-400 mt-1">₹8.4 Cr</p>
                    <span className="text-[11px] text-slate-500">Zero disputes</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                    <span className="text-xs text-slate-400">Pending Bills</span>
                    <p className="text-lg font-bold text-rose-400 mt-1">5 Approvals</p>
                    <span className="text-[11px] text-rose-400/80">₹31.5 L waiting</span>
                  </div>
                </div>

                {/* Active Project breakdown row */}
                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      <span className="font-semibold text-white">Tower A (Sector 12, Sonipat)</span>
                    </div>
                    <span className="text-amber-400 font-bold">42.5% Complete</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                    <div className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full transition-all" style={{ width: '42.5%' }} />
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>PM: Anil Kumar</span>
                    <span>Last Log: Today, 08:30 AM</span>
                    <span>Next Milestone: 5th Floor Slab</span>
                  </div>
                </div>
              </div>

              {/* Sidebar explanation */}
              <div className="w-full lg:w-80 space-y-4 border-t lg:border-t-0 lg:border-l border-slate-800 pt-6 lg:pt-0 lg:pl-8">
                <h4 className="font-bold text-white text-base flex items-center gap-2">
                  <Layers className="w-5 h-5 text-amber-400" />
                  What Builders Gain:
                </h4>
                <ul className="space-y-3 text-sm text-slate-300">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                    <span><strong>100% Portfolio Visibility</strong> without endless phone calls to site engineers.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                    <span><strong>Cash Flow Control</strong> by approving vendor invoices directly from your phone.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                    <span><strong>Multi-Land Tracking</strong> tying purchased land parcels directly to construction milestones.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: PM / Site View */}
        {activeTab === 'pm' && (
          <div className="bg-slate-950/70 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <div className="flex-1 w-full space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div>
                    <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider">Mobile-Friendly Site Logger</span>
                    <h3 className="text-xl font-bold text-white mt-1">Daily Work Log — 06 Nov 2026</h3>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Draft Saved
                  </span>
                </div>

                {/* Daily log card representation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-white">
                      <Users className="w-4 h-4 text-amber-400" />
                      Labour Headcount
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between text-slate-300 bg-slate-950/60 p-2 rounded-lg">
                        <span>Masons (R. Singh & Co)</span>
                        <span className="font-bold text-white">12 workers (8h)</span>
                      </div>
                      <div className="flex justify-between text-slate-300 bg-slate-950/60 p-2 rounded-lg">
                        <span>Helpers & Unskilled</span>
                        <span className="font-bold text-white">20 workers (8h)</span>
                      </div>
                      <div className="flex justify-between text-slate-300 bg-slate-950/60 p-2 rounded-lg">
                        <span>Bar Benders</span>
                        <span className="font-bold text-white">8 workers (8h)</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-white">
                      <Clock className="w-4 h-4 text-amber-400" />
                      Machinery & Fuel
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between text-slate-300 bg-slate-950/60 p-2 rounded-lg">
                        <span>Tower Crane (Operator: Ramesh)</span>
                        <span className="font-bold text-white">7.5 hrs (35L diesel)</span>
                      </div>
                      <div className="flex justify-between text-slate-300 bg-slate-950/60 p-2 rounded-lg">
                        <span>Concrete Mixer</span>
                        <span className="font-bold text-white">6.0 hrs (22L diesel)</span>
                      </div>
                      <div className="flex justify-between text-slate-300 bg-slate-950/60 p-2 rounded-lg">
                        <span>JCB Excavator</span>
                        <span className="font-bold text-white">4.0 hrs (28L diesel)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-amber-400" />
                    <div>
                      <p className="font-semibold text-white">Stock IN Received: 800 Bags Cement</p>
                      <p className="text-xs text-slate-400">Vendor: Shree Cement Traders • Challan #CH-4471</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-md bg-emerald-500/20 text-emerald-400">
                    Balance: 1,250 Bags
                  </span>
                </div>
              </div>

              <div className="w-full lg:w-80 space-y-4 border-t lg:border-t-0 lg:border-l border-slate-800 pt-6 lg:pt-0 lg:pl-8">
                <h4 className="font-bold text-white text-base flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-amber-400" />
                  What Site PMs Love:
                </h4>
                <ul className="space-y-3 text-sm text-slate-300">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                    <span><strong>Under 3-Minute Daily Logs</strong> from their phone browser right at the casting site.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                    <span><strong>Prevents Negative Stock</strong> with automated locks before issuing materials.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                    <span><strong>Zero Paper Registers</strong> or chaotic WhatsApp message reports lost in chat groups.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Wastage & Billing */}
        {activeTab === 'wastage' && (
          <div className="bg-slate-950/70 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <div className="flex-1 w-full space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div>
                    <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider">Progress-Adjusted Formula</span>
                    <h3 className="text-xl font-bold text-white mt-1">Live Material Wastage & Bill Auditing</h3>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    1 Overrun Detected
                  </span>
                </div>

                {/* Wastage row sample */}
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-white">OPC 53 Cement</span>
                      <p className="text-xs text-slate-400">Planned: 12,000 Bags @ ₹395/bag • Project Progress: 42.5%</p>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      +25.5% Overrun
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs text-center pt-2">
                    <div className="bg-slate-950/60 p-2 rounded-lg">
                      <span className="text-slate-400 block">Expected to Date</span>
                      <span className="font-bold text-white">5,100 Bags</span>
                    </div>
                    <div className="bg-slate-950/60 p-2 rounded-lg">
                      <span className="text-slate-400 block">Actual Consumed</span>
                      <span className="font-bold text-amber-400">6,400 Bags</span>
                    </div>
                    <div className="bg-slate-950/60 p-2 rounded-lg">
                      <span className="text-slate-400 block">Estimated Loss</span>
                      <span className="font-bold text-rose-400">₹5,13,500</span>
                    </div>
                  </div>
                </div>

                {/* GST Bill sample */}
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <Receipt className="w-5 h-5 text-amber-400" />
                    <div>
                      <p className="font-semibold text-white">Bill #INV-2026-0451 — Shree Cement Traders</p>
                      <p className="text-xs text-slate-400">Base: ₹3,18,400 + 18% GST (₹57,312) = Total ₹3,75,712</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-md bg-amber-500/20 text-amber-400">
                    Awaiting Approval
                  </span>
                </div>
              </div>

              <div className="w-full lg:w-80 space-y-4 border-t lg:border-t-0 lg:border-l border-slate-800 pt-6 lg:pt-0 lg:pl-8">
                <h4 className="font-bold text-white text-base flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  Why This Saves Millions:
                </h4>
                <ul className="space-y-3 text-sm text-slate-300">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                    <span><strong>Real-time Detection</strong>: Catch material theft and breakage mid-project, not after completion.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                    <span><strong>GST & Challan Matched</strong>: Link delivery challans directly to invoices before releasing payments.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                    <span><strong>Overdue Prevention</strong>: Automatic due date alerts keep vendor relationships strong.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
