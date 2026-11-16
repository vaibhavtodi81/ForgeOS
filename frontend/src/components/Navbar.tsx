// Imports React,  useState, useEffect from react so this module can reuse that component, helper, or library.
import React, { useState, useEffect } from 'react';
// Imports Building2, Menu, X, LayoutDashboard, ClipboardList, Package, Layers, Star from lucide-react so this module can reuse that component, helper, or library.
import { Building2, Menu, X, LayoutDashboard, ClipboardList, Package, Layers, Star } from 'lucide-react';
// Imports LiquidNavbar, type LiquidNavItem from @/components/ui/liquid-glass-navbar so this module can reuse that component, helper, or library.
import { LiquidNavbar, type LiquidNavItem } from '@/components/ui/liquid-glass-navbar';

// Stores the value in Navbar so later lines can reuse this data or behavior for the current feature.
export const Navbar: React.FC = () => {
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [isScrolled, setIsScrolled] = useState(false);
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  useEffect(() => {
    // Stores the value in handleScroll so later lines can reuse this data or behavior for the current feature.
    const handleScroll = () => {
      // Checks this condition before continuing so the code can choose the correct path for the current state.
      if (window.scrollY > 20) {
        // Calls this helper or component so the feature can perform the operation or render the control represented here.
        setIsScrolled(true);
      // Continues the component or data expression so its related values and behavior stay grouped together.
      } else {
        // Calls this helper or component so the feature can perform the operation or render the control represented here.
        setIsScrolled(false);
      // Closes the current block or object so the grouped statements or settings end here.
      }
    // Closes the current block or object so the grouped statements or settings end here.
    };

    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    window.addEventListener('scroll', handleScroll, { passive: true });
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    handleScroll();

    // Returns the result so the caller or React receives the value or interface this function provides.
    return () => {
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      window.removeEventListener('scroll', handleScroll);
    // Closes the current block or object so the grouped statements or settings end here.
    };
  // Continues the component or data expression so its related values and behavior stay grouped together.
  }, []);

  // Stores the value in liquidNavItems so later lines can reuse this data or behavior for the current feature.
  const liquidNavItems: LiquidNavItem[] = [
    // Opens a block or object so its related statements or settings can be grouped together.
    {
      // Sets the label field so the surrounding object or component receives this setting.
      label: 'Features',
      // Sets the href field so the surrounding object or component receives this setting.
      href: '#features',
      // Sets the icon field so the surrounding object or component receives this setting.
      icon: <LayoutDashboard className="w-4 h-4 text-[#F2A65A]" />,
      // Sets the fx field so the surrounding object or component receives this setting.
      fx: 'glow',
    // Closes the current block or object so the grouped statements or settings end here.
    },
    // Opens a block or object so its related statements or settings can be grouped together.
    {
      // Sets the label field so the surrounding object or component receives this setting.
      label: 'How It Works',
      // Sets the href field so the surrounding object or component receives this setting.
      href: '#how-it-works',
      // Sets the icon field so the surrounding object or component receives this setting.
      icon: <ClipboardList className="w-4 h-4 text-[#F2A65A]" />,
      // Sets the fx field so the surrounding object or component receives this setting.
      fx: 'spin',
    // Closes the current block or object so the grouped statements or settings end here.
    },
    // Opens a block or object so its related statements or settings can be grouped together.
    {
      // Sets the label field so the surrounding object or component receives this setting.
      label: 'Gallery',
      // Sets the href field so the surrounding object or component receives this setting.
      href: '#gallery',
      // Sets the icon field so the surrounding object or component receives this setting.
      icon: <Package className="w-4 h-4 text-[#F2A65A]" />,
      // Sets the fx field so the surrounding object or component receives this setting.
      fx: 'pop',
    // Closes the current block or object so the grouped statements or settings end here.
    },
    // Opens a block or object so its related statements or settings can be grouped together.
    {
      // Sets the label field so the surrounding object or component receives this setting.
      label: 'Showcase',
      // Sets the href field so the surrounding object or component receives this setting.
      href: '#showcase',
      // Sets the icon field so the surrounding object or component receives this setting.
      icon: <Layers className="w-4 h-4 text-[#F2A65A]" />,
      // Sets the fx field so the surrounding object or component receives this setting.
      fx: 'wave',
    // Closes the current block or object so the grouped statements or settings end here.
    },
    // Opens a block or object so its related statements or settings can be grouped together.
    {
      // Sets the label field so the surrounding object or component receives this setting.
      label: 'Testimonials',
      // Sets the href field so the surrounding object or component receives this setting.
      href: '#testimonials',
      // Sets the icon field so the surrounding object or component receives this setting.
      icon: <Star className="w-4 h-4 text-[#F2A65A]" />,
      // Sets the fx field so the surrounding object or component receives this setting.
      fx: 'drop',
    // Closes the current block or object so the grouped statements or settings end here.
    },
  // Continues the component or data expression so its related values and behavior stay grouped together.
  ];

  // Returns the result so the caller or React receives the value or interface this function provides.
  return (
    // Continues the component or data expression so its related values and behavior stay grouped together.
    <header
      /* Applies utility classes so the element’s layout, spacing, and appearance match the design. */
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        /* Continues the component or data expression so its related values and behavior stay grouped together. */
        /* Continues the component or data expression so its related values and behavior stay grouped together. */
        isScrolled
          /* Continues the component or data expression so its related values and behavior stay grouped together. */
          /* Continues the component or data expression so its related values and behavior stay grouped together. */
          ? 'bg-[#DDD0C8]/90 backdrop-blur-md shadow-sm border-b border-[#323232]/10 py-3'
          /* Continues the component or data expression so its related values and behavior stay grouped together. */
          /* Continues the component or data expression so its related values and behavior stay grouped together. */
          : 'bg-transparent border-b border-transparent py-5'
      /* Continues the component or data expression so its related values and behavior stay grouped together. */
      /* Continues the component or data expression so its related values and behavior stay grouped together. */
      }`}
    /* Continues the component or data expression so its related values and behavior stay grouped together. */
    /* Continues the component or data expression so its related values and behavior stay grouped together. */
    >
      {/* Starts the <div> element to organize this part of the interface. */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Starts the <div> element to organize this part of the interface. */}
        <div className="flex items-center justify-between h-12">
          {/* Logo / Brand - Editorial style */}
          {/* Starts the <a> element to provide navigation to another location. */}
          <a
            /* Sets the destination so activating this link or route control opens the intended screen. */
            href="#"
            /* Applies utility classes so the element’s layout, spacing, and appearance match the design. */
            className="flex items-center gap-2.5 group focus:outline-none rounded-lg"
          /* Continues the component or data expression so its related values and behavior stay grouped together. */
          /* Continues the component or data expression so its related values and behavior stay grouped together. */
          >
            {/* Starts the <div> element to organize this part of the interface. */}
            <div className="w-8 h-8 rounded-full bg-[#F2A65A] text-[#171717] flex items-center justify-center transition-transform group-hover:scale-105">
              {/* Starts the <Building2> element to organize this part of the interface. */}
              <Building2 className="w-4 h-4" />
            {/* Closes the <div> element so later content is no longer part of this region. */}
            </div>
            {/* Starts the <span> element to organize this part of the interface. */}
            <span className="text-lg font-bold tracking-[0.2em] uppercase text-white">
              {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
              FORGE<span className="font-light text-white/45">OS</span>
            {/* Closes the <span> element so later content is no longer part of this region. */}
            </span>
          {/* Closes the <a> element so later content is no longer part of this region. */}
          </a>

          {/* Liquid Glass Navbar in Center (Desktop) */}
          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="hidden lg:flex items-center justify-center">
            {/* Starts the <LiquidNavbar> element to organize this part of the interface. */}
            <LiquidNavbar
              /* Sets the items property so this element receives the data or behavior required by this screen. */
              /* Sets the items property so this element receives the data or behavior required by this screen. */
              items={liquidNavItems}
              /* Sets the tone property so this element receives the data or behavior required by this screen. */
              /* Sets the tone property so this element receives the data or behavior required by this screen. */
              tone="dark"
              /* Sets the defaultActive property so this element receives the data or behavior required by this screen. */
              /* Sets the defaultActive property so this element receives the data or behavior required by this screen. */
              defaultActive={0}
              /* Sets the sound property so this element receives the data or behavior required by this screen. */
              /* Sets the sound property so this element receives the data or behavior required by this screen. */
              sound={false}
              /* Applies utility classes so the element’s layout, spacing, and appearance match the design. */
              className="scale-95 shadow-sm"
            /* Continues the component or data expression so its related values and behavior stay grouped together. */
            /* Continues the component or data expression so its related values and behavior stay grouped together. */
            />
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>

          {/* Right Action Buttons */}
          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="hidden md:flex items-center gap-4">
            {/* Starts the <a> element to provide navigation to another location. */}
            <a
              /* Sets the destination so activating this link or route control opens the intended screen. */
              href="#login"
              /* Applies utility classes so the element’s layout, spacing, and appearance match the design. */
              className="text-xs font-semibold uppercase tracking-wider text-white/65 hover:text-white px-3 py-2 transition-colors"
            /* Continues the component or data expression so its related values and behavior stay grouped together. */
            /* Continues the component or data expression so its related values and behavior stay grouped together. */
            >
              {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
              Log In
            {/* Closes the <a> element so later content is no longer part of this region. */}
            </a>
            {/* Starts the <a> element to provide navigation to another location. */}
            <a
              /* Sets the destination so activating this link or route control opens the intended screen. */
              href="/login"
              /* Applies utility classes so the element’s layout, spacing, and appearance match the design. */
              className="text-xs font-semibold uppercase tracking-wider text-[#171717] bg-[#F2A65A] hover:bg-[#FFC078] px-6 py-2.5 rounded-full shadow-sm transition-all duration-200 transform hover:-translate-y-0.5"
            /* Continues the component or data expression so its related values and behavior stay grouped together. */
            /* Continues the component or data expression so its related values and behavior stay grouped together. */
            >
              {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
              Get Started
            {/* Closes the <a> element so later content is no longer part of this region. */}
            </a>
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>

          {/* Mobile Hamburger Button */}
          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="flex lg:hidden items-center">
            {/* Starts the <button> element to provide an action the user can activate. */}
            <button
              /* Chooses the element’s browser behavior, such as a button action or input format. */
              type="button"
              /* Connects the Click event to its handler so the interface can respond to interaction. */
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              /* Applies utility classes so the element’s layout, spacing, and appearance match the design. */
              className="p-2 rounded-lg text-white/70 hover:bg-white/10 transition-colors"
              /* Provides aria-label accessibility information so assistive technology can describe the element. */
              aria-label="Toggle mobile menu"
            /* Continues the component or data expression so its related values and behavior stay grouped together. */
            /* Continues the component or data expression so its related values and behavior stay grouped together. */
            >
              {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
              {isMobileMenuOpen ? (
                // Continues the component or data expression so its related values and behavior stay grouped together.
                <X className="w-6 h-6" />
              // Continues the component or data expression so its related values and behavior stay grouped together.
              ) : (
                // Continues the component or data expression so its related values and behavior stay grouped together.
                <Menu className="w-6 h-6" />
              // Continues the component or data expression so its related values and behavior stay grouped together.
              )}
            {/* Closes the <button> element so later content is no longer part of this region. */}
            </button>
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>
        {/* Closes the <div> element so later content is no longer part of this region. */}
        </div>
      {/* Closes the <div> element so later content is no longer part of this region. */}
      </div>

      {/* Mobile Dropdown Menu */}
      {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
      {isMobileMenuOpen && (
        // Continues the component or data expression so its related values and behavior stay grouped together.
        <div className="lg:hidden bg-[#111417]/95 backdrop-blur-xl border-b border-white/10 px-4 pt-4 pb-6 space-y-2 mt-2 shadow-lg">
          {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
          {liquidNavItems.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/75 hover:bg-white/10 transition-colors"
            >
              {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
              {link.icon}
              {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
              {link.label}
            {/* Closes the <a> element so later content is no longer part of this region. */}
            </a>
          ))}
          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="pt-4 border-t border-[#323232]/15 flex flex-col gap-2">
            <a
              href="#login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-center py-2 text-sm font-medium text-white/70"
            >
              {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
              Log In
            {/* Closes the <a> element so later content is no longer part of this region. */}
            </a>
            <a
              href="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-center py-2.5 text-xs font-semibold uppercase tracking-wider text-[#171717] bg-[#F2A65A] rounded-full shadow-sm"
            >
              {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
              Get Started
            {/* Closes the <a> element so later content is no longer part of this region. */}
            </a>
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>
        {/* Closes the <div> element so later content is no longer part of this region. */}
        </div>
      )}
    {/* Closes the <header> element so later content is no longer part of this region. */}
    </header>
  // Closes this function call or grouped expression so the surrounding code can continue.
  );
// Closes the current block or object so the grouped statements or settings end here.
};

// Exports Navbar as this file’s default value so other modules can load the main feature.
export default Navbar;
// File purpose: Renders the reusable Navbar interface component.
