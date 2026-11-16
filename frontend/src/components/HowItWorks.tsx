// Imports React from react so this module can reuse that component, helper, or library.
import React from 'react';
// Imports type  LucideIcon from lucide-react so this module can reuse that component, helper, or library.
import type { LucideIcon } from 'lucide-react';
// Continues the component or data expression so its related values and behavior stay grouped together.
import {
  // Continues the component or data expression so its related values and behavior stay grouped together.
  UserPlus,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  FolderOpen,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  TrendingUp,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  ArrowRight,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  ArrowDown,
// Continues the component or data expression so its related values and behavior stay grouped together.
} from 'lucide-react';

// Continues the component or data expression so its related values and behavior stay grouped together.
interface StepItem {
  // Sets the number field so the surrounding object or component receives this setting.
  number: number;
  // Sets the icon field so the surrounding object or component receives this setting.
  icon: LucideIcon;
  // Sets the title field so the surrounding object or component receives this setting.
  title: string;
  // Sets the description field so the surrounding object or component receives this setting.
  description: string;
// Closes the current block or object so the grouped statements or settings end here.
}

// Stores the value in steps so later lines can reuse this data or behavior for the current feature.
const steps: StepItem[] = [
  // Opens a block or object so its related statements or settings can be grouped together.
  {
    // Sets the number field so the surrounding object or component receives this setting.
    number: 1,
    // Sets the icon field so the surrounding object or component receives this setting.
    icon: UserPlus,
    // Sets the title field so the surrounding object or component receives this setting.
    title: 'Create Your Account',
    // Sets the description field so the surrounding object or component receives this setting.
    description:
      // Continues the component or data expression so its related values and behavior stay grouped together.
      'Sign up and add your team. Create project managers and assign them to your sites in seconds.',
  // Closes the current block or object so the grouped statements or settings end here.
  },
  // Opens a block or object so its related statements or settings can be grouped together.
  {
    // Sets the number field so the surrounding object or component receives this setting.
    number: 2,
    // Sets the icon field so the surrounding object or component receives this setting.
    icon: FolderOpen,
    // Sets the title field so the surrounding object or component receives this setting.
    title: 'Set Up Your Projects',
    // Sets the description field so the surrounding object or component receives this setting.
    description:
      // Continues the component or data expression so its related values and behavior stay grouped together.
      'Add your lands, create projects, define budgets, and set up material plans with wastage thresholds.',
  // Closes the current block or object so the grouped statements or settings end here.
  },
  // Opens a block or object so its related statements or settings can be grouped together.
  {
    // Sets the number field so the surrounding object or component receives this setting.
    number: 3,
    // Sets the icon field so the surrounding object or component receives this setting.
    icon: TrendingUp,
    // Sets the title field so the surrounding object or component receives this setting.
    title: 'Track Everything Live',
    // Sets the description field so the surrounding object or component receives this setting.
    description:
      // Continues the component or data expression so its related values and behavior stay grouped together.
      'Your PMs log daily progress from site. You see real-time dashboards, alerts, and reports from anywhere.',
  // Closes the current block or object so the grouped statements or settings end here.
  },
// Continues the component or data expression so its related values and behavior stay grouped together.
];

// Stores the value in HowItWorks so later lines can reuse this data or behavior for the current feature.
export const HowItWorks: React.FC = () => {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return (
    // Continues the component or data expression so its related values and behavior stay grouped together.
    <section
      /* Gives the element a stable identifier for linking, lookup, or styling. */
      id="how-it-works"
      /* Applies utility classes so the element’s layout, spacing, and appearance match the design. */
      className="py-24 sm:py-32 bg-[#E8DCD4]/50 relative border-t border-[#323232]/10"
    /* Continues the component or data expression so its related values and behavior stay grouped together. */
    /* Continues the component or data expression so its related values and behavior stay grouped together. */
    >
      {/* Starts the <div> element to organize this part of the interface. */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        {/* Starts the <div> element to organize this part of the interface. */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest bg-[#323232] text-[#DDD0C8] mb-4">
            {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
            How It Works
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>
          {/* Starts the <h2> element to organize this part of the interface. */}
          <h2 className="text-3xl sm:text-5xl font-medium text-[#323232] tracking-tight">
            {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
            Get Started in Minutes
          {/* Closes the <h2> element so later content is no longer part of this region. */}
          </h2>
          {/* Starts the <p> element to organize this part of the interface. */}
          <p className="mt-4 text-base sm:text-lg text-[#595552] leading-relaxed font-light">
            {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
            ForgeOS is designed for real builders. Set up and start tracking in three simple steps.
          {/* Closes the <p> element so later content is no longer part of this region. */}
          </p>
        {/* Closes the <div> element so later content is no longer part of this region. */}
        </div>

        {/* 3 Steps Display */}
        {/* Starts the <div> element to organize this part of the interface. */}
        <div className="relative">
          {/* Desktop Connecting Line behind cards */}
          {/* Starts the <div> element to organize this part of the interface. */}
          <div
            /* Applies utility classes so the element’s layout, spacing, and appearance match the design. */
            className="hidden lg:block absolute top-1/2 left-[16%] right-[16%] -translate-y-12 h-0.5 border-t-2 border-dashed border-[#323232]/20 z-0"
            /* Provides aria-hidden accessibility information so assistive technology can describe the element. */
            aria-hidden="true"
          /* Continues the component or data expression so its related values and behavior stay grouped together. */
          /* Continues the component or data expression so its related values and behavior stay grouped together. */
          />

          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10 relative z-10">
            {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
            {steps.map((step, index) => {
              // Stores the value in Icon so later lines can reuse this data or behavior for the current feature.
              const Icon = step.icon;
              // Stores the value in isLast so later lines can reuse this data or behavior for the current feature.
              const isLast = index === steps.length - 1;

              // Returns the result so the caller or React receives the value or interface this function provides.
              return (
                // Continues the component or data expression so its related values and behavior stay grouped together.
                <div key={step.number} className="relative flex flex-col">
                  {/* Step Card */}
                  {/* Starts the <div> element to organize this part of the interface. */}
                  <div className="group relative bg-[#E8DCD4] rounded-3xl p-8 border border-[#323232]/10 shadow-sm hover:shadow-md hover:border-[#323232]/30 transition-all duration-300 flex-1 flex flex-col justify-between">
                    {/* Starts the <div> element to organize this part of the interface. */}
                    <div>
                      {/* Badge & Icon Top Row */}
                      {/* Starts the <div> element to organize this part of the interface. */}
                      <div className="flex items-center justify-between mb-6">
                        {/* Number Badge with Dark Grey & Beige Text */}
                        {/* Starts the <div> element to organize this part of the interface. */}
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#323232] text-[#DDD0C8] font-bold text-xs shadow-sm">
                          {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                          0{step.number}
                        {/* Closes the <div> element so later content is no longer part of this region. */}
                        </div>

                        {/* Step Icon */}
                        {/* Starts the <div> element to organize this part of the interface. */}
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#DDD0C8] text-[#323232] border border-[#323232]/10 transition-transform group-hover:scale-105">
                          {/* Starts the <Icon> element to organize this part of the interface. */}
                          <Icon className="w-5 h-5 stroke-[2]" aria-hidden="true" />
                        {/* Closes the <div> element so later content is no longer part of this region. */}
                        </div>
                      {/* Closes the <div> element so later content is no longer part of this region. */}
                      </div>

                      {/* Content */}
                      {/* Starts the <h3> element to organize this part of the interface. */}
                      <h3 className="text-xl font-bold text-[#323232] tracking-tight">
                        {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                        {step.title}
                      {/* Closes the <h3> element so later content is no longer part of this region. */}
                      </h3>
                      {/* Starts the <p> element to organize this part of the interface. */}
                      <p className="mt-3 text-[#595552] text-sm sm:text-base leading-relaxed font-light">
                        {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                        {step.description}
                      {/* Closes the <p> element so later content is no longer part of this region. */}
                      </p>
                    {/* Closes the <div> element so later content is no longer part of this region. */}
                    </div>

                    {/* Step Indicator Footer */}
                    {/* Starts the <div> element to organize this part of the interface. */}
                    <div className="mt-6 pt-4 border-t border-[#323232]/10 flex items-center justify-between text-xs font-semibold text-[#595552]">
                      {/* Starts the <span> element to organize this part of the interface. */}
                      <span className="uppercase tracking-wider">Phase 0{step.number}</span>
                      {/* Starts the <span> element to organize this part of the interface. */}
                      <span className="text-[#323232] font-bold">Fast Setup</span>
                    {/* Closes the <div> element so later content is no longer part of this region. */}
                    </div>
                  {/* Closes the <div> element so later content is no longer part of this region. */}
                  </div>

                  {/* Desktop Connecting Arrow between steps */}
                  {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                  {!isLast && (
                    <div
                      className="hidden lg:flex absolute -right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#323232] text-[#DDD0C8] shadow-md items-center justify-center ring-4 ring-[#DDD0C8]"
                      aria-hidden="true"
                    >
                      {/* Starts the <ArrowRight> element to organize this part of the interface. */}
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    {/* Closes the <div> element so later content is no longer part of this region. */}
                    </div>
                  )}

                  {/* Mobile Connecting Arrow between steps */}
                  {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                  {!isLast && (
                    <div
                      className="flex lg:hidden justify-center items-center py-4 text-[#323232]"
                      aria-hidden="true"
                    >
                      {/* Starts the <div> element to organize this part of the interface. */}
                      <div className="w-8 h-8 rounded-full bg-[#323232] text-[#DDD0C8] flex items-center justify-center">
                        {/* Starts the <ArrowDown> element to organize this part of the interface. */}
                        <ArrowDown className="w-4 h-4 stroke-[2.5]" />
                      {/* Closes the <div> element so later content is no longer part of this region. */}
                      </div>
                    {/* Closes the <div> element so later content is no longer part of this region. */}
                    </div>
                  )}
                {/* Closes the <div> element so later content is no longer part of this region. */}
                </div>
              );
            // Continues the component or data expression so its related values and behavior stay grouped together.
            })}
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>
        {/* Closes the <div> element so later content is no longer part of this region. */}
        </div>
      {/* Closes the <div> element so later content is no longer part of this region. */}
      </div>
    {/* Closes the <section> element so later content is no longer part of this region. */}
    </section>
  // Closes this function call or grouped expression so the surrounding code can continue.
  );
// Closes the current block or object so the grouped statements or settings end here.
};

// Exports HowItWorks as this file’s default value so other modules can load the main feature.
export default HowItWorks;
// File purpose: Renders the reusable HowItWorks interface component.
