// Imports React from react so this module can reuse that component, helper, or library.
import React from 'react';
// Imports ArrowRight, Play, Building2, IndianRupee, ShieldCheck, CheckCircle2, TrendingUp from lucide-react so this module can reuse that component, helper, or library.
import { ArrowRight, Play, Building2, IndianRupee, ShieldCheck, CheckCircle2, TrendingUp } from 'lucide-react';

// Stores the value in Hero so later lines can reuse this data or behavior for the current feature.
export const Hero: React.FC = () => {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return (
    // Continues the component or data expression so its related values and behavior stay grouped together.
    <section className="relative min-h-screen w-full flex items-center justify-center pt-28 pb-20 px-4 sm:px-6 lg:px-8 bg-[#DDD0C8] text-[#323232] overflow-hidden">
      {/* Subtle architectural grid pattern */}
      {/* Starts the <div> element to organize this part of the interface. */}
      <div
        /* Applies utility classes so the element’s layout, spacing, and appearance match the design. */
        className="absolute inset-0 pointer-events-none opacity-20"
        /* Sets the style property so this element receives the data or behavior required by this screen. */
        /* Sets the style property so this element receives the data or behavior required by this screen. */
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(50, 50, 50, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(50, 50, 50, 0.08) 1px, transparent 1px)
          `,
          /* Sets the backgroundSize field so the surrounding object or component receives this setting. */
          /* Sets the backgroundSize field so the surrounding object or component receives this setting. */
          backgroundSize: '40px 40px',
          /* Sets the maskImage field so the surrounding object or component receives this setting. */
          /* Sets the maskImage field so the surrounding object or component receives this setting. */
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 45%, black 20%, transparent 80%)',
          /* Sets the WebkitMaskImage field so the surrounding object or component receives this setting. */
          /* Sets the WebkitMaskImage field so the surrounding object or component receives this setting. */
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 45%, black 20%, transparent 80%)',
        /* Continues the component or data expression so its related values and behavior stay grouped together. */
        /* Continues the component or data expression so its related values and behavior stay grouped together. */
        }}
      /* Continues the component or data expression so its related values and behavior stay grouped together. */
      /* Continues the component or data expression so its related values and behavior stay grouped together. */
      />

      {/* Floating Decorative Preview - Left */}
      {/* Starts the <div> element to organize this part of the interface. */}
      <div className="hidden xl:flex absolute left-8 top-1/3 -translate-y-12 z-10 pointer-events-none">
        {/* Starts the <div> element to organize this part of the interface. */}
        <div className="bg-[#E8DCD4]/90 backdrop-blur-md border border-[#323232]/15 p-4 rounded-2xl shadow-xl w-64 text-left">
          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="flex items-center justify-between mb-2">
            {/* Starts the <span> element to organize this part of the interface. */}
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#323232] bg-[#323232]/10 px-2.5 py-0.5 rounded-full">
              {/* Starts the <CheckCircle2> element to organize this part of the interface. */}
              <CheckCircle2 className="w-3.5 h-3.5" />
              {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
              Site Log Verified
            {/* Closes the <span> element so later content is no longer part of this region. */}
            </span>
            {/* Starts the <span> element to organize this part of the interface. */}
            <span className="text-[10px] text-[#595552]">Today</span>
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>
          {/* Starts the <p> element to organize this part of the interface. */}
          <p className="text-sm font-bold text-[#323232]">Tower C • 14th Slab Pour</p>
          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="mt-2 pt-2 border-t border-[#323232]/10 text-xs flex justify-between items-center text-[#595552]">
            {/* Starts the <span> element to organize this part of the interface. */}
            <span>Material Wastage</span>
            {/* Starts the <span> element to organize this part of the interface. */}
            <span className="text-[#323232] font-semibold">-1.2% (Under Norm)</span>
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>
        {/* Closes the <div> element so later content is no longer part of this region. */}
        </div>
      {/* Closes the <div> element so later content is no longer part of this region. */}
      </div>

      {/* Floating Decorative Preview - Right */}
      {/* Starts the <div> element to organize this part of the interface. */}
      <div className="hidden xl:flex absolute right-8 top-1/3 -translate-y-4 z-10 pointer-events-none">
        {/* Starts the <div> element to organize this part of the interface. */}
        <div className="bg-[#E8DCD4]/90 backdrop-blur-md border border-[#323232]/15 p-4 rounded-2xl shadow-xl w-64 text-left">
          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="flex items-center justify-between mb-2">
            {/* Starts the <span> element to organize this part of the interface. */}
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#323232] bg-[#323232]/10 px-2.5 py-0.5 rounded-full">
              {/* Starts the <TrendingUp> element to organize this part of the interface. */}
              <TrendingUp className="w-3.5 h-3.5" />
              {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
              Billing Reconciliation
            {/* Closes the <span> element so later content is no longer part of this region. */}
            </span>
            {/* Starts the <span> element to organize this part of the interface. */}
            <span className="text-[10px] text-[#595552]">GST Ready</span>
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>
          {/* Starts the <p> element to organize this part of the interface. */}
          <p className="text-sm font-bold text-[#323232]">Steel Supplier Invoice</p>
          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="mt-2 pt-2 border-t border-[#323232]/10 text-xs flex justify-between items-center text-[#595552]">
            {/* Starts the <span> element to organize this part of the interface. */}
            <span>Verified Payout</span>
            {/* Starts the <span> element to organize this part of the interface. */}
            <span className="text-[#323232] font-bold">₹18,40,000</span>
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>
        {/* Closes the <div> element so later content is no longer part of this region. */}
        </div>
      {/* Closes the <div> element so later content is no longer part of this region. */}
      </div>

      {/* Main Hero Container */}
      {/* Starts the <div> element to organize this part of the interface. */}
      <div className="relative z-20 max-w-5xl mx-auto text-center flex flex-col items-center">
        {/* Top Notification Pill - Just like the SaaS template */}
        {/* Starts the <aside> element to organize this part of the interface. */}
        <aside className="mb-6 inline-flex flex-wrap items-center justify-center gap-2 px-5 py-2 rounded-full border border-[#323232]/15 bg-[#E8DCD4]/80 backdrop-blur-sm shadow-xs">
          {/* Starts the <span> element to organize this part of the interface. */}
          <span className="text-xs text-center whitespace-nowrap text-[#595552]">
            {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
            ForgeOS 2.0 with progress-adjusted wastage radar is live
          {/* Closes the <span> element so later content is no longer part of this region. */}
          </span>
          {/* Starts the <a> element to provide navigation to another location. */}
          <a
            /* Sets the destination so activating this link or route control opens the intended screen. */
            href="#features"
            /* Applies utility classes so the element’s layout, spacing, and appearance match the design. */
            className="flex items-center gap-1 text-xs font-bold text-[#323232] hover:underline transition-all active:scale-95 whitespace-nowrap"
            /* Provides aria-label accessibility information so assistive technology can describe the element. */
            aria-label="Read more"
          /* Continues the component or data expression so its related values and behavior stay grouped together. */
          /* Continues the component or data expression so its related values and behavior stay grouped together. */
          >
            {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
            Explore features
            {/* Starts the <ArrowRight> element to organize this part of the interface. */}
            <ArrowRight size={12} />
          {/* Closes the <a> element so later content is no longer part of this region. */}
          </a>
        {/* Closes the <aside> element so later content is no longer part of this region. */}
        </aside>

        {/* Primary Headline */}
        {/* Starts the <h1> element to organize this part of the interface. */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-medium tracking-tight text-[#323232] leading-[1.1] max-w-4xl">
          {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
          Brightening construction with beautiful, durable systems.
        {/* Closes the <h1> element so later content is no longer part of this region. */}
        </h1>

        {/* Subtitle */}
        {/* Starts the <p> element to organize this part of the interface. */}
        <p className="mt-6 text-base sm:text-lg text-[#595552] max-w-2xl font-light leading-relaxed">
          {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
          ForgeOS gives builders and real estate developers a single, reliable view of site progress, material balances, wastage alerts, and vendor payouts.
        {/* Closes the <p> element so later content is no longer part of this region. */}
        </p>

        {/* Action Buttons - Pill style matching reference image */}
        {/* Starts the <div> element to organize this part of the interface. */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          {/* Starts the <a> element to provide navigation to another location. */}
          <a
            /* Sets the destination so activating this link or route control opens the intended screen. */
            href="/login"
            /* Applies utility classes so the element’s layout, spacing, and appearance match the design. */
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-xs font-semibold uppercase tracking-widest text-[#DDD0C8] bg-[#323232] hover:bg-[#1E1E1E] transition-all duration-200 shadow-md group"
          /* Continues the component or data expression so its related values and behavior stay grouped together. */
          /* Continues the component or data expression so its related values and behavior stay grouped together. */
          >
            {/* Starts the <span> element to organize this part of the interface. */}
            <span>Start Free Trial</span>
            {/* Starts the <ArrowRight> element to organize this part of the interface. */}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          {/* Closes the <a> element so later content is no longer part of this region. */}
          </a>

          {/* Starts the <a> element to provide navigation to another location. */}
          <a
            /* Sets the destination so activating this link or route control opens the intended screen. */
            href="#showcase"
            /* Applies utility classes so the element’s layout, spacing, and appearance match the design. */
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-xs font-semibold uppercase tracking-widest text-[#323232] border border-[#323232]/30 hover:border-[#323232] hover:bg-[#323232]/5 transition-all duration-200"
          /* Continues the component or data expression so its related values and behavior stay grouped together. */
          /* Continues the component or data expression so its related values and behavior stay grouped together. */
          >
            {/* Starts the <Play> element to organize this part of the interface. */}
            <Play className="w-3.5 h-3.5 fill-[#323232]" />
            {/* Starts the <span> element to organize this part of the interface. */}
            <span>Explore 3D Sites</span>
          {/* Closes the <a> element so later content is no longer part of this region. */}
          </a>
        {/* Closes the <div> element so later content is no longer part of this region. */}
        </div>

        {/* Centerpiece: Layered SaaS Dashboard Showcase Card (just like saa-s-template) */}
        {/* Starts the <div> element to organize this part of the interface. */}
        <div className="w-full max-w-5xl mt-14 relative">
          {/* Subtle Ambient Layered Blur Behind */}
          {/* Starts the <div> element to organize this part of the interface. */}
          <div
            /* Applies utility classes so the element’s layout, spacing, and appearance match the design. */
            className="absolute left-1/2 w-[92%] h-48 pointer-events-none z-0 bg-[#323232]/10 blur-xl rounded-full"
            /* Sets the style property so this element receives the data or behavior required by this screen. */
            /* Sets the style property so this element receives the data or behavior required by this screen. */
            style={{
              /* Sets the top field so the surrounding object or component receives this setting. */
              /* Sets the top field so the surrounding object or component receives this setting. */
              top: "-5%",
              /* Sets the transform field so the surrounding object or component receives this setting. */
              /* Sets the transform field so the surrounding object or component receives this setting. */
              transform: "translateX(-50%)"
            /* Continues the component or data expression so its related values and behavior stay grouped together. */
            /* Continues the component or data expression so its related values and behavior stay grouped together. */
            }}
            /* Provides aria-hidden accessibility information so assistive technology can describe the element. */
            aria-hidden="true"
          /* Continues the component or data expression so its related values and behavior stay grouped together. */
          /* Continues the component or data expression so its related values and behavior stay grouped together. */
          />
          
          {/* Main Dashboard Preview Card */}
          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="relative z-10 bg-[#E8DCD4] rounded-3xl p-3 sm:p-5 border border-[#323232]/15 shadow-2xl overflow-hidden text-left">
            {/* Starts the <div> element to organize this part of the interface. */}
            <div className="forgeos-hero-scene" aria-hidden="true">
              {/* Starts the <div> element to organize this part of the interface. */}
              <div className="forgeos-hero-building forgeos-hero-building-back" />
              {/* Starts the <div> element to organize this part of the interface. */}
              <div className="forgeos-hero-building forgeos-hero-building-front" />
              {/* Starts the <div> element to organize this part of the interface. */}
              <div className="forgeos-hero-crane" />
            {/* Closes the <div> element so later content is no longer part of this region. */}
            </div>
            {/* Window chrome header */}
            {/* Starts the <div> element to organize this part of the interface. */}
            <div className="flex items-center justify-between pb-3 px-3 border-b border-[#323232]/10 mb-4 text-xs">
              {/* Starts the <div> element to organize this part of the interface. */}
              <div className="flex items-center gap-2">
                {/* Starts the <div> element to organize this part of the interface. */}
                <div className="w-3 h-3 rounded-full bg-[#323232]/25" />
                {/* Starts the <div> element to organize this part of the interface. */}
                <div className="w-3 h-3 rounded-full bg-[#323232]/25" />
                {/* Starts the <div> element to organize this part of the interface. */}
                <div className="w-3 h-3 rounded-full bg-[#323232]/25" />
                {/* Starts the <span> element to organize this part of the interface. */}
                <span className="ml-2 font-mono text-[11px] text-[#323232] font-semibold">
                  {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                  app.forgeos.build • Portfolio Dashboard
                {/* Closes the <span> element so later content is no longer part of this region. */}
                </span>
              {/* Closes the <div> element so later content is no longer part of this region. */}
              </div>
              {/* Starts the <div> element to organize this part of the interface. */}
              <div className="flex items-center gap-3">
                {/* Starts the <span> element to organize this part of the interface. */}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-[#323232] text-[#DDD0C8]">
                  {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                  4 Active Sites
                {/* Closes the <span> element so later content is no longer part of this region. */}
                </span>
                {/* Starts the <span> element to organize this part of the interface. */}
                <span className="text-[11px] font-mono text-[#595552] hidden sm:inline">Sonipat • Pune • NCR</span>
              {/* Closes the <div> element so later content is no longer part of this region. */}
              </div>
            {/* Closes the <div> element so later content is no longer part of this region. */}
            </div>

            {/* Quick Metrics Bar inside Dashboard Card */}
            {/* Starts the <div> element to organize this part of the interface. */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {/* Starts the <div> element to organize this part of the interface. */}
              <div className="p-3.5 rounded-2xl bg-[#DDD0C8]/60 border border-[#323232]/10">
                {/* Starts the <span> element to organize this part of the interface. */}
                <span className="text-[10px] text-[#595552] uppercase tracking-wider font-semibold">Total Portfolio</span>
                {/* Starts the <p> element to organize this part of the interface. */}
                <p className="text-base sm:text-lg font-bold text-[#323232] mt-0.5">₹38.0 Cr</p>
                {/* Starts the <span> element to organize this part of the interface. */}
                <span className="text-[10px] text-[#595552]">Budget Approved</span>
              {/* Closes the <div> element so later content is no longer part of this region. */}
              </div>
              {/* Starts the <div> element to organize this part of the interface. */}
              <div className="p-3.5 rounded-2xl bg-[#DDD0C8]/60 border border-[#323232]/10">
                {/* Starts the <span> element to organize this part of the interface. */}
                <span className="text-[10px] text-[#595552] uppercase tracking-wider font-semibold">Committed Spend</span>
                {/* Starts the <p> element to organize this part of the interface. */}
                <p className="text-base sm:text-lg font-bold text-[#323232] mt-0.5">₹11.2 Cr</p>
                {/* Starts the <span> element to organize this part of the interface. */}
                <span className="text-[10px] text-[#323232] font-semibold">29.4% used</span>
              {/* Closes the <div> element so later content is no longer part of this region. */}
              </div>
              {/* Starts the <div> element to organize this part of the interface. */}
              <div className="p-3.5 rounded-2xl bg-[#DDD0C8]/60 border border-[#323232]/10">
                {/* Starts the <span> element to organize this part of the interface. */}
                <span className="text-[10px] text-[#595552] uppercase tracking-wider font-semibold">Paid to Vendors</span>
                {/* Starts the <p> element to organize this part of the interface. */}
                <p className="text-base sm:text-lg font-bold text-[#323232] mt-0.5">₹8.4 Cr</p>
                {/* Starts the <span> element to organize this part of the interface. */}
                <span className="text-[10px] text-[#595552]">Zero Overdue</span>
              {/* Closes the <div> element so later content is no longer part of this region. */}
              </div>
              {/* Starts the <div> element to organize this part of the interface. */}
              <div className="p-3.5 rounded-2xl bg-[#DDD0C8]/60 border border-[#323232]/10">
                {/* Starts the <span> element to organize this part of the interface. */}
                <span className="text-[10px] text-[#595552] uppercase tracking-wider font-semibold">Wastage Alert</span>
                {/* Starts the <p> element to organize this part of the interface. */}
                <p className="text-base sm:text-lg font-bold text-[#323232] mt-0.5">1 Material</p>
                {/* Starts the <span> element to organize this part of the interface. */}
                <span className="text-[10px] text-[#323232] font-semibold">Cement Overrun</span>
              {/* Closes the <div> element so later content is no longer part of this region. */}
              </div>
            {/* Closes the <div> element so later content is no longer part of this region. */}
            </div>

            {/* High-res Dashboard View */}
            {/* Starts the <div> element to organize this part of the interface. */}
            <div className="relative rounded-2xl overflow-hidden border border-[#323232]/10 max-h-[380px]">
              {/* Starts the <img> element to display visual content. */}
              <img
                /* Selects the image or other resource displayed by this element. */
                src="https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?auto=format&fit=crop&w=1600&q=85"
                /* Sets the alt property so this element receives the data or behavior required by this screen. */
                /* Sets the alt property so this element receives the data or behavior required by this screen. */
                alt="ForgeOS Centralized Site Construction Dashboard"
                /* Applies utility classes so the element’s layout, spacing, and appearance match the design. */
                className="w-full h-auto object-cover max-h-[360px]"
              /* Continues the component or data expression so its related values and behavior stay grouped together. */
              /* Continues the component or data expression so its related values and behavior stay grouped together. */
              />
              {/* Starts the <div> element to organize this part of the interface. */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#323232]/90 via-[#323232]/25 to-transparent flex items-end p-6">
                {/* Starts the <div> element to organize this part of the interface. */}
                <div className="text-[#DDD0C8]">
                  {/* Starts the <div> element to organize this part of the interface. */}
                  <div className="text-[10px] uppercase tracking-widest font-mono text-[#DDD0C8]/70">Live Site Sync</div>
                  {/* Starts the <div> element to organize this part of the interface. */}
                  <div className="text-lg sm:text-xl font-bold">Skyline Heights — Sector 12, Sonipat</div>
                  {/* Starts the <p> element to organize this part of the interface. */}
                  <p className="text-xs text-[#DDD0C8]/80 mt-1 max-w-xl font-light">
                    {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                    Daily progress 42.5% • 32 workers on site • 800 bags cement received with verified delivery challan #CH-4471.
                  {/* Closes the <p> element so later content is no longer part of this region. */}
                  </p>
                {/* Closes the <div> element so later content is no longer part of this region. */}
                </div>
              {/* Closes the <div> element so later content is no longer part of this region. */}
              </div>
            {/* Closes the <div> element so later content is no longer part of this region. */}
            </div>
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>
        {/* Closes the <div> element so later content is no longer part of this region. */}
        </div>

        {/* 3 Bottom Stat Badges in Beige & Dark Grey */}
        {/* Starts the <div> element to organize this part of the interface. */}
        <div className="mt-14 pt-8 border-t border-[#323232]/15 w-full grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="flex flex-col items-center p-4 rounded-2xl bg-[#E8DCD4]/50 border border-[#323232]/10">
            {/* Starts the <div> element to organize this part of the interface. */}
            <div className="flex items-center gap-2 text-[#323232] font-semibold text-base sm:text-lg">
              {/* Starts the <Building2> element to organize this part of the interface. */}
              <Building2 className="w-4 h-4" />
              {/* Starts the <span> element to organize this part of the interface. */}
              <span>500+ Projects</span>
            {/* Closes the <div> element so later content is no longer part of this region. */}
            </div>
            {/* Starts the <span> element to organize this part of the interface. */}
            <span className="text-xs text-[#595552] mt-1 font-light">Managed across India</span>
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>

          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="flex flex-col items-center p-4 rounded-2xl bg-[#E8DCD4]/50 border border-[#323232]/10">
            {/* Starts the <div> element to organize this part of the interface. */}
            <div className="flex items-center gap-2 text-[#323232] font-semibold text-base sm:text-lg">
              {/* Starts the <IndianRupee> element to organize this part of the interface. */}
              <IndianRupee className="w-4 h-4" />
              {/* Starts the <span> element to organize this part of the interface. */}
              <span>₹200Cr+ Spend</span>
            {/* Closes the <div> element so later content is no longer part of this region. */}
            </div>
            {/* Starts the <span> element to organize this part of the interface. */}
            <span className="text-xs text-[#595552] mt-1 font-light">Accurately reconciled</span>
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>

          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="flex flex-col items-center p-4 rounded-2xl bg-[#E8DCD4]/50 border border-[#323232]/10">
            {/* Starts the <div> element to organize this part of the interface. */}
            <div className="flex items-center gap-2 text-[#323232] font-semibold text-base sm:text-lg">
              {/* Starts the <ShieldCheck> element to organize this part of the interface. */}
              <ShieldCheck className="w-4 h-4" />
              {/* Starts the <span> element to organize this part of the interface. */}
              <span>50+ Developers</span>
            {/* Closes the <div> element so later content is no longer part of this region. */}
            </div>
            {/* Starts the <span> element to organize this part of the interface. */}
            <span className="text-xs text-[#595552] mt-1 font-light">Trust ForgeOS daily</span>
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

// Exports Hero as this file’s default value so other modules can load the main feature.
export default Hero;
// File purpose: Renders the reusable Hero interface component.
