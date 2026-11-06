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
      'Sign up and add your team. Create project managers and assign them to your sites.',
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
      className="py-20 sm:py-28 bg-slate-50 relative border-t border-slate-200/70"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-700 border border-amber-500/20 mb-4">
            How It Works
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
            Get Started in Minutes
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            ForgeOS is designed for builders, not tech experts. Set up and start tracking in three simple steps.
          </p>
        </div>

        {/* 3 Steps Display */}
        <div className="relative">
          {/* Desktop Connecting Line behind cards */}
          <div
            className="hidden lg:block absolute top-1/2 left-[16%] right-[16%] -translate-y-12 h-0.5 border-t-2 border-dashed border-amber-300/80 z-0"
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10 relative z-10">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isLast = index === steps.length - 1;

              return (
                <div key={step.number} className="relative flex flex-col">
                  {/* Step Card */}
                  <div className="group relative bg-white rounded-2xl p-7 sm:p-8 border border-slate-200/90 shadow-sm hover:shadow-xl hover:shadow-slate-200/60 hover:border-amber-400/60 transition-all duration-300 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Badge & Icon Top Row */}
                      <div className="flex items-center justify-between mb-6">
                        {/* Number Badge with Primary/Amber Color */}
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-500 text-white font-bold text-sm shadow-md shadow-amber-500/30">
                          {step.number}
                        </div>

                        {/* Step Icon */}
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300 ring-1 ring-amber-500/20 group-hover:ring-amber-500">
                          <Icon className="w-6 h-6 stroke-[2]" aria-hidden="true" />
                        </div>
                      </div>

                      {/* Content */}
                      <h3 className="text-xl font-bold text-slate-900 tracking-tight group-hover:text-amber-600 transition-colors duration-200">
                        {step.title}
                      </h3>
                      <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
                        {step.description}
                      </p>
                    </div>

                    {/* Step Indicator Footer */}
                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-400">
                      <span>Step 0{step.number}</span>
                      <span className="text-amber-600 font-medium">Ready in minutes</span>
                    </div>
                  </div>

                  {/* Desktop Connecting Arrow between steps */}
                  {!isLast && (
                    <div
                      className="hidden lg:flex absolute -right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white border border-amber-200 shadow-md items-center justify-center text-amber-600 ring-4 ring-slate-50"
                      aria-hidden="true"
                    >
                      <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                    </div>
                  )}

                  {/* Mobile Connecting Arrow between steps */}
                  {!isLast && (
                    <div
                      className="flex lg:hidden justify-center items-center py-4 text-amber-500"
                      aria-hidden="true"
                    >
                      <div className="w-8 h-8 rounded-full bg-white border border-amber-200 shadow-xs flex items-center justify-center">
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
}

export default HowItWorks;
