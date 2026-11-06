import React from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  ClipboardList,
  Package,
  AlertTriangle,
  Receipt,
  Shield,
} from 'lucide-react';

interface FeatureItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

const features: FeatureItem[] = [
  {
    icon: LayoutDashboard,
    title: 'Multi-Project Dashboard',
    description:
      'See status, spend, and progress of every project from a single screen. No more calling site managers for updates.',
  },
  {
    icon: ClipboardList,
    title: 'Daily Site Logs',
    description:
      'PMs log progress, labour, and machinery in minutes. Track cumulative progress and compare against plan.',
  },
  {
    icon: Package,
    title: 'Smart Stock Management',
    description:
      'Track material IN/OUT with real-time balances. Low-stock alerts ensure you never halt work waiting for materials.',
  },
  {
    icon: AlertTriangle,
    title: 'Wastage Detection',
    description:
      'Progress-adjusted wastage analysis flags overuse while the project is still running — not after it\'s too late.',
  },
  {
    icon: Receipt,
    title: 'Billing & Payments',
    description:
      'Centralized bills with approval workflows, GST computation, payment tracking, and overdue alerts.',
  },
  {
    icon: Shield,
    title: 'Audit Trail',
    description:
      'Every change is logged — who did what, when. Complete accountability across your organization.',
  },
];

export const Features: React.FC = () => {
  return (
    <section id="features" className="py-20 sm:py-28 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-700 border border-amber-500/20 mb-4">
            Platform Capabilities
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
            Everything You Need to Run Your Projects
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            From site logs to billing, ForgeOS brings all your project data into one powerful platform.
          </p>
        </div>

        {/* 6 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group relative bg-white rounded-2xl p-7 sm:p-8 border border-slate-200/90 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60 hover:border-amber-400/60 flex flex-col justify-between"
              >
                <div>
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 mb-6 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300 ring-1 ring-amber-500/20 group-hover:ring-amber-500 shadow-xs">
                    <Icon className="w-6 h-6 stroke-[2]" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight group-hover:text-amber-600 transition-colors duration-200">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span>Learn more</span>
                  <span className="ml-1 transition-transform duration-200 group-hover:translate-x-1">→</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Features;
