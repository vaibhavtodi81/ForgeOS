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
    <section id="gallery" className="py-24 sm:py-32 bg-[#DDD0C8] text-[#323232] relative overflow-hidden border-t border-[#323232]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest bg-[#323232] text-[#DDD0C8] mb-4">
            Interactive Product Demo
          </div>
          <h2 className="text-3xl sm:text-5xl font-medium tracking-tight text-[#323232]">
            Designed for Both Site Engineers & Project Owners
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#595552] font-light">
            See how ForgeOS transforms day-to-day operations for on-site supervisors and boardroom decision makers.
          </p>
        </div>

        {/* Role Selector Tabs - Minimalist pill */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex p-1.5 rounded-full bg-[#E8DCD4] border border-[#323232]/15 shadow-inner">
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === 'admin'
                  ? 'bg-[#323232] text-[#DDD0C8] shadow-md'
                  : 'text-[#595552] hover:text-[#323232]'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Builder Overview
            </button>
            <button
              onClick={() => setActiveTab('pm')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === 'pm'
                  ? 'bg-[#323232] text-[#DDD0C8] shadow-md'
                  : 'text-[#595552] hover:text-[#323232]'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              Site PM Logger
            </button>
            <button
              onClick={() => setActiveTab('wastage')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === 'wastage'
                  ? 'bg-[#323232] text-[#DDD0C8] shadow-md'
                  : 'text-[#595552] hover:text-[#323232]'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Wastage & Bills
            </button>
          </div>
        </div>

        {/* Tab 1: Builder/Admin View */}
        {activeTab === 'admin' && (
          <div className="bg-[#E8DCD4] border border-[#323232]/10 rounded-3xl p-6 sm:p-10 shadow-sm">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <div className="flex-1 w-full space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#323232]/10">
                  <div>
                    <span className="text-xs text-[#595552] font-semibold uppercase tracking-wider">Multi-Project Portfolio</span>
                    <h3 className="text-xl font-bold text-[#323232] mt-1">Skyline Heights & Grand Palms</h3>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#323232] text-[#DDD0C8]">
                    Live Data
                  </span>
                </div>

                {/* 4 Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-[#DDD0C8]/60 border border-[#323232]/10">
                    <span className="text-xs text-[#595552] font-light">Total Portfolio</span>
                    <p className="text-lg font-bold text-[#323232] mt-1">₹38.0 Cr</p>
                    <span className="text-[11px] text-[#595552]">4 Active Sites</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#DDD0C8]/60 border border-[#323232]/10">
                    <span className="text-xs text-[#595552] font-light">Committed Spend</span>
                    <p className="text-lg font-bold text-[#323232] mt-1">₹11.2 Cr</p>
                    <span className="text-[11px] text-[#595552]">29.4% budget</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#DDD0C8]/60 border border-[#323232]/10">
                    <span className="text-xs text-[#595552] font-light">Paid Out</span>
                    <p className="text-lg font-bold text-[#323232] mt-1">₹8.4 Cr</p>
                    <span className="text-[11px] text-[#595552]">Zero disputes</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#DDD0C8]/60 border border-[#323232]/10">
                    <span className="text-xs text-[#595552] font-light">Pending Bills</span>
                    <p className="text-lg font-bold text-[#323232] mt-1">5 Invoices</p>
                    <span className="text-[11px] text-[#595552]">₹31.5 L waiting</span>
                  </div>
                </div>

                {/* Active Project breakdown */}
                <div className="p-5 rounded-2xl bg-[#DDD0C8]/40 border border-[#323232]/10 space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-[#323232]">Tower A (Sector 12, Sonipat)</span>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#323232]">42.5% Complete</span>
                  </div>
                  {/* Progress bar in dark grey */}
                  <div className="w-full bg-[#DDD0C8] rounded-full h-2.5 overflow-hidden border border-[#323232]/10">
                    <div className="bg-[#323232] h-full rounded-full transition-all" style={{ width: '42.5%' }} />
                  </div>
                  <div className="flex justify-between text-xs text-[#595552] font-light">
                    <span>PM: Anil Kumar</span>
                    <span>Last Log: Today, 08:30 AM</span>
                    <span>Stage: 5th Floor Slab</span>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="w-full lg:w-80 space-y-4 border-t lg:border-t-0 lg:border-l border-[#323232]/10 pt-6 lg:pt-0 lg:pl-8">
                <h4 className="font-bold text-[#323232] text-sm uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  What Builders Gain:
                </h4>
                <ul className="space-y-3 text-sm text-[#595552] font-light">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#323232] mt-0.5 shrink-0" />
                    <span><strong>100% Portfolio Visibility</strong> without endless phone calls to site engineers.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#323232] mt-0.5 shrink-0" />
                    <span><strong>Cash Flow Control</strong> by approving contractor bills directly from mobile.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#323232] mt-0.5 shrink-0" />
                    <span><strong>Multi-Land Tracking</strong> connecting land acquisition to project phases.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: PM / Site View */}
        {activeTab === 'pm' && (
          <div className="bg-[#E8DCD4] border border-[#323232]/10 rounded-3xl p-6 sm:p-10 shadow-sm">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <div className="flex-1 w-full space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#323232]/10">
                  <div>
                    <span className="text-xs text-[#595552] font-semibold uppercase tracking-wider">Mobile-Friendly Site Logger</span>
                    <h3 className="text-xl font-bold text-[#323232] mt-1">Daily Work Log — 06 Nov 2026</h3>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#323232] text-[#DDD0C8]">
                    Draft Saved
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-[#DDD0C8]/60 border border-[#323232]/10 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-[#323232]">
                      <Users className="w-4 h-4" />
                      Labour Headcount
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between text-[#595552] bg-[#E8DCD4] p-2 rounded-lg">
                        <span>Masons (R. Singh & Co)</span>
                        <span className="font-bold text-[#323232]">12 workers (8h)</span>
                      </div>
                      <div className="flex justify-between text-[#595552] bg-[#E8DCD4] p-2 rounded-lg">
                        <span>Helpers & Unskilled</span>
                        <span className="font-bold text-[#323232]">20 workers (8h)</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#DDD0C8]/60 border border-[#323232]/10 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-[#323232]">
                      <Clock className="w-4 h-4" />
                      Machinery & Fuel
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between text-[#595552] bg-[#E8DCD4] p-2 rounded-lg">
                        <span>Tower Crane (Operator: Ramesh)</span>
                        <span className="font-bold text-[#323232]">7.5 hrs (35L)</span>
                      </div>
                      <div className="flex justify-between text-[#595552] bg-[#E8DCD4] p-2 rounded-lg">
                        <span>Concrete Mixer</span>
                        <span className="font-bold text-[#323232]">6.0 hrs (22L)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#DDD0C8]/40 border border-[#323232]/10 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-[#323232]" />
                    <div>
                      <p className="font-bold text-[#323232]">Stock IN Received: 800 Bags Cement</p>
                      <p className="text-xs text-[#595552]">Vendor: Shree Cement Traders • Challan #CH-4471</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#323232] text-[#DDD0C8]">
                    Balance: 1,250 Bags
                  </span>
                </div>
              </div>

              <div className="w-full lg:w-80 space-y-4 border-t lg:border-t-0 lg:border-l border-[#323232]/10 pt-6 lg:pt-0 lg:pl-8">
                <h4 className="font-bold text-[#323232] text-sm uppercase tracking-wider flex items-center gap-2">
                  <ClipboardList className="w-4 h-4" />
                  What Site PMs Love:
                </h4>
                <ul className="space-y-3 text-sm text-[#595552] font-light">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#323232] mt-0.5 shrink-0" />
                    <span><strong>Under 3-Minute Site Logs</strong> right from their phone at the casting site.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#323232] mt-0.5 shrink-0" />
                    <span><strong>Prevents Negative Stock</strong> with automated inventory locks.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#323232] mt-0.5 shrink-0" />
                    <span><strong>Zero Paper Registers</strong> or lost WhatsApp group photos.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Wastage & Billing */}
        {activeTab === 'wastage' && (
          <div className="bg-[#E8DCD4] border border-[#323232]/10 rounded-3xl p-6 sm:p-10 shadow-sm">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <div className="flex-1 w-full space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#323232]/10">
                  <div>
                    <span className="text-xs text-[#595552] font-semibold uppercase tracking-wider">Progress-Adjusted Formula</span>
                    <h3 className="text-xl font-bold text-[#323232] mt-1">Live Material Wastage & Bill Auditing</h3>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#323232] text-[#DDD0C8]">
                    1 Alert Active
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#DDD0C8]/60 border border-[#323232]/10 space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold text-[#323232]">OPC 53 Cement</span>
                      <p className="text-xs text-[#595552]">Planned: 12,000 Bags @ ₹395/bag • Project Progress: 42.5%</p>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-[#323232] text-[#DDD0C8]">
                      +25.5% Overrun
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs text-center pt-2">
                    <div className="bg-[#E8DCD4] p-2 rounded-lg">
                      <span className="text-[#595552] block">Expected to Date</span>
                      <span className="font-bold text-[#323232]">5,100 Bags</span>
                    </div>
                    <div className="bg-[#E8DCD4] p-2 rounded-lg">
                      <span className="text-[#595552] block">Actual Consumed</span>
                      <span className="font-bold text-[#323232]">6,400 Bags</span>
                    </div>
                    <div className="bg-[#E8DCD4] p-2 rounded-lg">
                      <span className="text-[#595552] block">Estimated Loss</span>
                      <span className="font-bold text-[#323232]">₹5,13,500</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#DDD0C8]/40 border border-[#323232]/10 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <Receipt className="w-5 h-5 text-[#323232]" />
                    <div>
                      <p className="font-bold text-[#323232]">Bill #INV-2026-0451 — Shree Cement Traders</p>
                      <p className="text-xs text-[#595552]">Base: ₹3,18,400 + 18% GST (₹57,312) = Total ₹3,75,712</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#323232] text-[#DDD0C8]">
                    Awaiting Approval
                  </span>
                </div>
              </div>

              <div className="w-full lg:w-80 space-y-4 border-t lg:border-t-0 lg:border-l border-[#323232]/10 pt-6 lg:pt-0 lg:pl-8">
                <h4 className="font-bold text-[#323232] text-sm uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Why This Saves Money:
                </h4>
                <ul className="space-y-3 text-sm text-[#595552] font-light">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#323232] mt-0.5 shrink-0" />
                    <span><strong>Real-time Detection</strong>: Catch material theft mid-project, not after completion.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#323232] mt-0.5 shrink-0" />
                    <span><strong>GST & Challan Linked</strong>: Verify delivery proofs before releasing payments.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#323232] mt-0.5 shrink-0" />
                    <span><strong>Overdue Prevention</strong>: Track due dates to keep supplier terms intact.</span>
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
