import React from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  UserPlus,
  FolderOpen,
  TrendingUp,
  ArrowRight,
  ArrowDown,
} from 'lucide-react';

interface StepItem {
  number: number;
  icon: LucideIcon;
  title: string;
  description: string;
}

const steps: StepItem[] = [
  {
    number: 1,
    icon: UserPlus,
    title: 'Create Your Account',
    description:
      'Sign up and add your team. Create project managers and assign them to your sites in seconds.',
  },
  {
    number: 2,
    icon: FolderOpen,
    title: 'Set Up Your Projects',
    description:
      'Add your lands, create projects, define budgets, and set up material plans with wastage thresholds.',
  },
  {
    number: 3,
    icon: TrendingUp,
    title: 'Track Everything Live',
    description:
      'Your PMs log daily progress from site. You see real-time dashboards, alerts, and reports from anywhere.',
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section
      id="how-it-works"
      className="py-24 sm:py-32 bg-[#E8DCD4]/50 relative border-t border-[#323232]/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest bg-[#323232] text-[#DDD0C8] mb-4">
            How It Works
          </div>
          <h2 className="text-3xl sm:text-5xl font-medium text-[#323232] tracking-tight">
            Get Started in Minutes
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#595552] leading-relaxed font-light">
            ForgeOS is designed for real builders. Set up and start tracking in three simple steps.
          </p>
        </div>

        {/* 3 Steps Display */}
        <div className="relative">
          {/* Desktop Connecting Line behind cards */}
          <div
            className="hidden lg:block absolute top-1/2 left-[16%] right-[16%] -translate-y-12 h-0.5 border-t-2 border-dashed border-[#323232]/20 z-0"
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10 relative z-10">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isLast = index === steps.length - 1;

              return (
                <div key={step.number} className="relative flex flex-col">
                  {/* Step Card */}
                  <div className="group relative bg-[#E8DCD4] rounded-3xl p-8 border border-[#323232]/10 shadow-sm hover:shadow-md hover:border-[#323232]/30 transition-all duration-300 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Badge & Icon Top Row */}
                      <div className="flex items-center justify-between mb-6">
                        {/* Number Badge with Dark Grey & Beige Text */}
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#323232] text-[#DDD0C8] font-bold text-xs shadow-sm">
                          0{step.number}
                        </div>

                        {/* Step Icon */}
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#DDD0C8] text-[#323232] border border-[#323232]/10 transition-transform group-hover:scale-105">
                          <Icon className="w-5 h-5 stroke-[2]" aria-hidden="true" />
                        </div>
                      </div>

                      {/* Content */}
                      <h3 className="text-xl font-bold text-[#323232] tracking-tight">
                        {step.title}
                      </h3>
                      <p className="mt-3 text-[#595552] text-sm sm:text-base leading-relaxed font-light">
                        {step.description}
                      </p>
                    </div>

                    {/* Step Indicator Footer */}
                    <div className="mt-6 pt-4 border-t border-[#323232]/10 flex items-center justify-between text-xs font-semibold text-[#595552]">
                      <span className="uppercase tracking-wider">Phase 0{step.number}</span>
                      <span className="text-[#323232] font-bold">Fast Setup</span>
                    </div>
                  </div>

                  {/* Desktop Connecting Arrow between steps */}
                  {!isLast && (
                    <div
                      className="hidden lg:flex absolute -right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#323232] text-[#DDD0C8] shadow-md items-center justify-center ring-4 ring-[#DDD0C8]"
                      aria-hidden="true"
                    >
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </div>
                  )}

                  {/* Mobile Connecting Arrow between steps */}
                  {!isLast && (
                    <div
                      className="flex lg:hidden justify-center items-center py-4 text-[#323232]"
                      aria-hidden="true"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#323232] text-[#DDD0C8] flex items-center justify-center">
                        <ArrowDown className="w-4 h-4 stroke-[2.5]" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
