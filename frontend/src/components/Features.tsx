// Imports React from react so this module can reuse that component, helper, or library.
import React from 'react';
// Imports type  LucideIcon from lucide-react so this module can reuse that component, helper, or library.
import type { LucideIcon } from 'lucide-react';
// Continues the component or data expression so its related values and behavior stay grouped together.
import {
  // Continues the component or data expression so its related values and behavior stay grouped together.
  LayoutDashboard,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  ClipboardList,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  Package,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  AlertTriangle,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  Receipt,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  Shield,
// Continues the component or data expression so its related values and behavior stay grouped together.
} from 'lucide-react';

// Continues the component or data expression so its related values and behavior stay grouped together.
interface FeatureItem {
  // Sets the icon field so the surrounding object or component receives this setting.
  icon: LucideIcon;
  // Sets the title field so the surrounding object or component receives this setting.
  title: string;
  // Sets the description field so the surrounding object or component receives this setting.
  description: string;
// Closes the current block or object so the grouped statements or settings end here.
}

// Stores the value in features so later lines can reuse this data or behavior for the current feature.
const features: FeatureItem[] = [
  // Opens a block or object so its related statements or settings can be grouped together.
  {
    // Sets the icon field so the surrounding object or component receives this setting.
    icon: LayoutDashboard,
    // Sets the title field so the surrounding object or component receives this setting.
    title: 'Multi-Project Dashboard',
    // Sets the description field so the surrounding object or component receives this setting.
    description:
      // Continues the component or data expression so its related values and behavior stay grouped together.
      'See status, spend, and progress of every project from a single screen. No more calling site managers for updates.',
  // Closes the current block or object so the grouped statements or settings end here.
  },
  // Opens a block or object so its related statements or settings can be grouped together.
  {
    // Sets the icon field so the surrounding object or component receives this setting.
    icon: ClipboardList,
    // Sets the title field so the surrounding object or component receives this setting.
    title: 'Daily Site Logs',
    // Sets the description field so the surrounding object or component receives this setting.
    description:
      // Continues the component or data expression so its related values and behavior stay grouped together.
      'PMs log progress, labour, and machinery in minutes. Track cumulative progress and compare against plan.',
  // Closes the current block or object so the grouped statements or settings end here.
  },
  // Opens a block or object so its related statements or settings can be grouped together.
  {
    // Sets the icon field so the surrounding object or component receives this setting.
    icon: Package,
    // Sets the title field so the surrounding object or component receives this setting.
    title: 'Smart Stock Management',
    // Sets the description field so the surrounding object or component receives this setting.
    description:
      // Continues the component or data expression so its related values and behavior stay grouped together.
      'Track material IN/OUT with real-time balances. Low-stock alerts ensure you never halt work waiting for materials.',
  // Closes the current block or object so the grouped statements or settings end here.
  },
  // Opens a block or object so its related statements or settings can be grouped together.
  {
    // Sets the icon field so the surrounding object or component receives this setting.
    icon: AlertTriangle,
    // Sets the title field so the surrounding object or component receives this setting.
    title: 'Wastage Detection',
    // Sets the description field so the surrounding object or component receives this setting.
    description:
      // Continues the component or data expression so its related values and behavior stay grouped together.
      'Progress-adjusted wastage analysis flags overuse while the project is still running — not after it\'s too late.',
  // Closes the current block or object so the grouped statements or settings end here.
  },
  // Opens a block or object so its related statements or settings can be grouped together.
  {
    // Sets the icon field so the surrounding object or component receives this setting.
    icon: Receipt,
    // Sets the title field so the surrounding object or component receives this setting.
    title: 'Billing & Payments',
    // Sets the description field so the surrounding object or component receives this setting.
    description:
      // Continues the component or data expression so its related values and behavior stay grouped together.
      'Centralized bills with approval workflows, GST computation, payment tracking, and overdue alerts.',
  // Closes the current block or object so the grouped statements or settings end here.
  },
  // Opens a block or object so its related statements or settings can be grouped together.
  {
    // Sets the icon field so the surrounding object or component receives this setting.
    icon: Shield,
    // Sets the title field so the surrounding object or component receives this setting.
    title: 'Audit Trail',
    // Sets the description field so the surrounding object or component receives this setting.
    description:
      // Continues the component or data expression so its related values and behavior stay grouped together.
      'Every change is logged — who did what, when. Complete accountability across your organization.',
  // Closes the current block or object so the grouped statements or settings end here.
  },
// Continues the component or data expression so its related values and behavior stay grouped together.
];

// Stores the value in Features so later lines can reuse this data or behavior for the current feature.
export const Features: React.FC = () => {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return (
    // Continues the component or data expression so its related values and behavior stay grouped together.
    <section id="features" className="py-24 sm:py-32 bg-[#DDD0C8] relative border-t border-[#323232]/10">
      {/* Starts the <div> element to organize this part of the interface. */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        {/* Starts the <div> element to organize this part of the interface. */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest bg-[#323232] text-[#DDD0C8] mb-4">
            {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
            Platform Capabilities
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>
          {/* Starts the <h2> element to organize this part of the interface. */}
          <h2 className="text-3xl sm:text-5xl font-medium text-[#323232] tracking-tight">
            {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
            Everything You Need to Run Your Projects
          {/* Closes the <h2> element so later content is no longer part of this region. */}
          </h2>
          {/* Starts the <p> element to organize this part of the interface. */}
          <p className="mt-4 text-base sm:text-lg text-[#595552] leading-relaxed font-light">
            {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
            From site logs to billing, ForgeOS brings all your project data into one reliable system.
          {/* Closes the <p> element so later content is no longer part of this region. */}
          </p>
        {/* Closes the <div> element so later content is no longer part of this region. */}
        </div>

        {/* 6 Feature Cards Grid */}
        {/* Starts the <div> element to organize this part of the interface. */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
          {features.map((feature) => {
            // Stores the value in Icon so later lines can reuse this data or behavior for the current feature.
            const Icon = feature.icon;
            // Returns the result so the caller or React receives the value or interface this function provides.
            return (
              // Continues the component or data expression so its related values and behavior stay grouped together.
              <div
                /* Gives this rendered item a stable identity so React can update lists efficiently. */
                key={feature.title}
                /* Applies utility classes so the element’s layout, spacing, and appearance match the design. */
                className="group relative bg-[#E8DCD4] rounded-3xl p-8 border border-[#323232]/10 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-[#323232]/25 flex flex-col justify-between"
              /* Continues the component or data expression so its related values and behavior stay grouped together. */
              /* Continues the component or data expression so its related values and behavior stay grouped together. */
              >
                {/* Starts the <div> element to organize this part of the interface. */}
                <div>
                  {/* Starts the <div> element to organize this part of the interface. */}
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#323232] text-[#DDD0C8] mb-6 transition-transform duration-300 group-hover:scale-105">
                    {/* Starts the <Icon> element to organize this part of the interface. */}
                    <Icon className="w-5 h-5 stroke-[2]" aria-hidden="true" />
                  {/* Closes the <div> element so later content is no longer part of this region. */}
                  </div>
                  {/* Starts the <h3> element to organize this part of the interface. */}
                  <h3 className="text-xl font-bold text-[#323232] tracking-tight">
                    {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                    {feature.title}
                  {/* Closes the <h3> element so later content is no longer part of this region. */}
                  </h3>
                  {/* Starts the <p> element to organize this part of the interface. */}
                  <p className="mt-3 text-[#595552] text-sm sm:text-base leading-relaxed font-light">
                    {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                    {feature.description}
                  {/* Closes the <p> element so later content is no longer part of this region. */}
                  </p>
                {/* Closes the <div> element so later content is no longer part of this region. */}
                </div>

                {/* Starts the <div> element to organize this part of the interface. */}
                <div className="mt-6 pt-4 border-t border-[#323232]/10 flex items-center text-xs font-bold uppercase tracking-wider text-[#323232]">
                  {/* Starts the <span> element to organize this part of the interface. */}
                  <span>Explore module</span>
                  {/* Starts the <span> element to organize this part of the interface. */}
                  <span className="ml-1 transition-transform duration-200 group-hover:translate-x-1">→</span>
                {/* Closes the <div> element so later content is no longer part of this region. */}
                </div>
              {/* Closes the <div> element so later content is no longer part of this region. */}
              </div>
            // Closes this function call or grouped expression so the surrounding code can continue.
            );
          // Continues the component or data expression so its related values and behavior stay grouped together.
          })}
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

// Exports Features as this file’s default value so other modules can load the main feature.
export default Features;
// File purpose: Renders the reusable Features interface component.
