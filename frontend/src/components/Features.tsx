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
    <section id="features" className="py-24 sm:py-32 bg-[#DDD0C8] relative border-t border-[#323232]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest bg-[#323232] text-[#DDD0C8] mb-4">
            Platform Capabilities
          </div>
          <h2 className="text-3xl sm:text-5xl font-medium text-[#323232] tracking-tight">
            Everything You Need to Run Your Projects
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#595552] leading-relaxed font-light">
            From site logs to billing, ForgeOS brings all your project data into one reliable system.
          </p>
        </div>

        {/* 6 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group relative bg-[#E8DCD4] rounded-3xl p-8 border border-[#323232]/10 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-[#323232]/25 flex flex-col justify-between"
              >
                <div>
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#323232] text-[#DDD0C8] mb-6 transition-transform duration-300 group-hover:scale-105">
                    <Icon className="w-5 h-5 stroke-[2]" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-bold text-[#323232] tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-[#595552] text-sm sm:text-base leading-relaxed font-light">
                    {feature.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#323232]/10 flex items-center text-xs font-bold uppercase tracking-wider text-[#323232]">
                  <span>Explore module</span>
                  <span className="ml-1 transition-transform duration-200 group-hover:translate-x-1">→</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
