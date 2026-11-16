// Imports React from react so this module can reuse that component, helper, or library.
import React from "react";
// Imports ArrowRight, Menu, X from lucide-react so this module can reuse that component, helper, or library.
import { ArrowRight, Menu, X } from "lucide-react";

// Inline Button Component
// Continues the component or data expression so its related values and behavior stay grouped together.
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  // Continues the component or data expression so its related values and behavior stay grouped together.
  variant?: "default" | "secondary" | "ghost" | "gradient";
  // Continues the component or data expression so its related values and behavior stay grouped together.
  size?: "default" | "sm" | "lg";
  // Sets the children field so the surrounding object or component receives this setting.
  children: React.ReactNode;
// Closes the current block or object so the grouped statements or settings end here.
}

// Stores the value in Button so later lines can reuse this data or behavior for the current feature.
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  // Continues the component or data expression so its related values and behavior stay grouped together.
  ({ variant = "default", size = "default", className = "", children, ...props }, ref) => {
    // Stores the value in baseStyles so later lines can reuse this data or behavior for the current feature.
    const baseStyles = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
    
    // Stores the value in variants so later lines can reuse this data or behavior for the current feature.
    const variants = {
      // Sets the default field so the surrounding object or component receives this setting.
      default: "bg-[#323232] text-[#DDD0C8] hover:bg-[#1E1E1E]",
      // Sets the secondary field so the surrounding object or component receives this setting.
      secondary: "bg-[#E8DCD4] text-[#323232] hover:bg-[#DDD0C8]",
      // Sets the ghost field so the surrounding object or component receives this setting.
      ghost: "hover:bg-[#323232]/10 text-[#323232]",
      // Sets the gradient field so the surrounding object or component receives this setting.
      gradient: "bg-[#323232] text-[#DDD0C8] hover:scale-105 active:scale-95 shadow-md"
    // Closes the current block or object so the grouped statements or settings end here.
    };
    
    // Stores the value in sizes so later lines can reuse this data or behavior for the current feature.
    const sizes = {
      // Sets the default field so the surrounding object or component receives this setting.
      default: "h-10 px-4 py-2 text-sm",
      // Sets the sm field so the surrounding object or component receives this setting.
      sm: "h-10 px-5 text-sm",
      // Sets the lg field so the surrounding object or component receives this setting.
      lg: "h-12 px-8 text-base"
    // Closes the current block or object so the grouped statements or settings end here.
    };
    
    // Returns the result so the caller or React receives the value or interface this function provides.
    return (
      // Continues the component or data expression so its related values and behavior stay grouped together.
      <button
        /* Sets the ref property so this element receives the data or behavior required by this screen. */
        /* Sets the ref property so this element receives the data or behavior required by this screen. */
        ref={ref}
        /* Applies utility classes so the element’s layout, spacing, and appearance match the design. */
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        /* Continues the component or data expression so its related values and behavior stay grouped together. */
        /* Continues the component or data expression so its related values and behavior stay grouped together. */
        {...props}
      /* Continues the component or data expression so its related values and behavior stay grouped together. */
      /* Continues the component or data expression so its related values and behavior stay grouped together. */
      >
        {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
        {children}
      {/* Closes the <button> element so later content is no longer part of this region. */}
      </button>
    // Closes this function call or grouped expression so the surrounding code can continue.
    );
  // Closes the current block or object so the grouped statements or settings end here.
  }
// Closes this function call or grouped expression so the surrounding code can continue.
);

// Continues the component or data expression so its related values and behavior stay grouped together.
Button.displayName = "Button";

// Navigation Component
// Stores the value in SaaSTemplateNavigation so later lines can reuse this data or behavior for the current feature.
export const SaaSTemplateNavigation = React.memo(() => {
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Returns the result so the caller or React receives the value or interface this function provides.
  return (
    // Continues the component or data expression so its related values and behavior stay grouped together.
    <header className="fixed top-0 w-full z-50 border-b border-[#323232]/10 bg-[#DDD0C8]/90 backdrop-blur-md">
      {/* Starts the <nav> element to organize this part of the interface. */}
      <nav className="max-w-7xl mx-auto px-6 py-4">
        {/* Starts the <div> element to organize this part of the interface. */}
        <div className="flex items-center justify-between">
          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="text-xl font-bold tracking-wider text-[#323232]">FORGEOS</div>
          
          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="hidden md:flex items-center justify-center gap-8 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {/* Starts the <a> element to provide navigation to another location. */}
            <a href="#getting-started" className="text-sm text-[#595552] hover:text-[#323232] transition-colors">
              {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
              Getting started
            {/* Closes the <a> element so later content is no longer part of this region. */}
            </a>
            {/* Starts the <a> element to provide navigation to another location. */}
            <a href="#components" className="text-sm text-[#595552] hover:text-[#323232] transition-colors">
              {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
              Components
            {/* Closes the <a> element so later content is no longer part of this region. */}
            </a>
            {/* Starts the <a> element to provide navigation to another location. */}
            <a href="#documentation" className="text-sm text-[#595552] hover:text-[#323232] transition-colors">
              {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
              Documentation
            {/* Closes the <a> element so later content is no longer part of this region. */}
            </a>
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>

          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="hidden md:flex items-center gap-4">
            {/* Starts the <Button> element to organize this part of the interface. */}
            <Button type="button" variant="ghost" size="sm">
              {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
              Sign in
            {/* Closes the <Button> element so later content is no longer part of this region. */}
            </Button>
            {/* Starts the <Button> element to organize this part of the interface. */}
            <Button type="button" variant="default" size="sm" className="rounded-full">
              {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
              Sign Up
            {/* Closes the <Button> element so later content is no longer part of this region. */}
            </Button>
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>

          {/* Starts the <button> element to provide an action the user can activate. */}
          <button
            /* Chooses the element’s browser behavior, such as a button action or input format. */
            type="button"
            /* Applies utility classes so the element’s layout, spacing, and appearance match the design. */
            className="md:hidden text-[#323232]"
            /* Connects the Click event to its handler so the interface can respond to interaction. */
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            /* Provides aria-label accessibility information so assistive technology can describe the element. */
            aria-label="Toggle menu"
          /* Continues the component or data expression so its related values and behavior stay grouped together. */
          /* Continues the component or data expression so its related values and behavior stay grouped together. */
          >
            {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          {/* Closes the <button> element so later content is no longer part of this region. */}
          </button>
        {/* Closes the <div> element so later content is no longer part of this region. */}
        </div>
      {/* Closes the <nav> element so later content is no longer part of this region. */}
      </nav>

      {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
      {mobileMenuOpen && (
        // Continues the component or data expression so its related values and behavior stay grouped together.
        <div className="md:hidden bg-[#DDD0C8]/95 backdrop-blur-md border-t border-[#323232]/10">
          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="px-6 py-4 flex flex-col gap-4">
            {/* Starts the <a> element to provide navigation to another location. */}
            <a
              /* Sets the destination so activating this link or route control opens the intended screen. */
              href="#getting-started"
              /* Applies utility classes so the element’s layout, spacing, and appearance match the design. */
              className="text-sm text-[#595552] hover:text-[#323232] transition-colors py-2"
              /* Connects the Click event to its handler so the interface can respond to interaction. */
              onClick={() => setMobileMenuOpen(false)}
            /* Continues the component or data expression so its related values and behavior stay grouped together. */
            /* Continues the component or data expression so its related values and behavior stay grouped together. */
            >
              {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
              Getting started
            {/* Closes the <a> element so later content is no longer part of this region. */}
            </a>
            {/* Starts the <a> element to provide navigation to another location. */}
            <a
              /* Sets the destination so activating this link or route control opens the intended screen. */
              href="#components"
              /* Applies utility classes so the element’s layout, spacing, and appearance match the design. */
              className="text-sm text-[#595552] hover:text-[#323232] transition-colors py-2"
              /* Connects the Click event to its handler so the interface can respond to interaction. */
              onClick={() => setMobileMenuOpen(false)}
            /* Continues the component or data expression so its related values and behavior stay grouped together. */
            /* Continues the component or data expression so its related values and behavior stay grouped together. */
            >
              {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
              Components
            {/* Closes the <a> element so later content is no longer part of this region. */}
            </a>
            {/* Starts the <a> element to provide navigation to another location. */}
            <a
              /* Sets the destination so activating this link or route control opens the intended screen. */
              href="#documentation"
              /* Applies utility classes so the element’s layout, spacing, and appearance match the design. */
              className="text-sm text-[#595552] hover:text-[#323232] transition-colors py-2"
              /* Connects the Click event to its handler so the interface can respond to interaction. */
              onClick={() => setMobileMenuOpen(false)}
            /* Continues the component or data expression so its related values and behavior stay grouped together. */
            /* Continues the component or data expression so its related values and behavior stay grouped together. */
            >
              {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
              Documentation
            {/* Closes the <a> element so later content is no longer part of this region. */}
            </a>
            {/* Starts the <div> element to organize this part of the interface. */}
            <div className="flex flex-col gap-2 pt-4 border-t border-[#323232]/10">
              {/* Starts the <Button> element to organize this part of the interface. */}
              <Button type="button" variant="ghost" size="sm">
                {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                Sign in
              {/* Closes the <Button> element so later content is no longer part of this region. */}
              </Button>
              {/* Starts the <Button> element to organize this part of the interface. */}
              <Button type="button" variant="default" size="sm" className="rounded-full">
                {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                Sign Up
              {/* Closes the <Button> element so later content is no longer part of this region. */}
              </Button>
            {/* Closes the <div> element so later content is no longer part of this region. */}
            </div>
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>
        {/* Closes the <div> element so later content is no longer part of this region. */}
        </div>
      // Continues the component or data expression so its related values and behavior stay grouped together.
      )}
    {/* Closes the <header> element so later content is no longer part of this region. */}
    </header>
  // Closes this function call or grouped expression so the surrounding code can continue.
  );
// Continues the component or data expression so its related values and behavior stay grouped together.
});

// Continues the component or data expression so its related values and behavior stay grouped together.
SaaSTemplateNavigation.displayName = "SaaSTemplateNavigation";

// Hero Component with centered title & layered dashboard preview
// Stores the value in SaaSTemplateHero so later lines can reuse this data or behavior for the current feature.
export const SaaSTemplateHero = React.memo(() => {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return (
    // Continues the component or data expression so its related values and behavior stay grouped together.
    <section
      /* Applies utility classes so the element’s layout, spacing, and appearance match the design. */
      className="relative min-h-screen flex flex-col items-center justify-start px-6 pt-28 pb-20 md:pt-32 bg-[#DDD0C8] text-[#323232]"
    /* Continues the component or data expression so its related values and behavior stay grouped together. */
    /* Continues the component or data expression so its related values and behavior stay grouped together. */
    >
      {/* Starts the <aside> element to organize this part of the interface. */}
      <aside className="mb-8 inline-flex flex-wrap items-center justify-center gap-2 px-5 py-2 rounded-full border border-[#323232]/15 bg-[#E8DCD4]/70 backdrop-blur-sm max-w-full shadow-xs">
        {/* Starts the <span> element to organize this part of the interface. */}
        <span className="text-xs text-center whitespace-nowrap text-[#595552]">
          {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
          New version of ForgeOS Builder Platform is live
        {/* Closes the <span> element so later content is no longer part of this region. */}
        </span>
        {/* Starts the <a> element to provide navigation to another location. */}
        <a
          /* Sets the destination so activating this link or route control opens the intended screen. */
          href="#features"
          /* Applies utility classes so the element’s layout, spacing, and appearance match the design. */
          className="flex items-center gap-1 text-xs font-semibold text-[#323232] hover:underline transition-all active:scale-95 whitespace-nowrap"
          /* Provides aria-label accessibility information so assistive technology can describe the element. */
          aria-label="Read more about the new version"
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

      {/* Starts the <h1> element to organize this part of the interface. */}
      <h1
        /* Applies utility classes so the element’s layout, spacing, and appearance match the design. */
        className="text-4xl md:text-5xl lg:text-6xl font-medium text-center max-w-3xl px-6 leading-tight mb-6 text-[#323232] tracking-tight"
      /* Continues the component or data expression so its related values and behavior stay grouped together. */
      /* Continues the component or data expression so its related values and behavior stay grouped together. */
      >
        {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
        Give your construction projects <br />the platform they deserve
      {/* Closes the <h1> element so later content is no longer part of this region. */}
      </h1>

      {/* Starts the <p> element to organize this part of the interface. */}
      <p className="text-sm md:text-base text-center max-w-2xl px-6 mb-10 text-[#595552] font-light leading-relaxed">
        {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
        Centralized multi-site portfolio tracking, daily supervisor logs, automated stock balances, and progress-adjusted wastage detection.
      {/* Closes the <p> element so later content is no longer part of this region. */}
      </p>

      {/* Starts the <div> element to organize this part of the interface. */}
      <div className="flex items-center gap-4 relative z-10 mb-16">
        {/* Starts the <Button> element to organize this part of the interface. */}
        <Button
          /* Chooses the element’s browser behavior, such as a button action or input format. */
          type="button"
          /* Sets the variant property so this element receives the data or behavior required by this screen. */
          /* Sets the variant property so this element receives the data or behavior required by this screen. */
          variant="gradient"
          /* Sets the size property so this element receives the data or behavior required by this screen. */
          /* Sets the size property so this element receives the data or behavior required by this screen. */
          size="lg"
          /* Applies utility classes so the element’s layout, spacing, and appearance match the design. */
          className="rounded-full flex items-center justify-center px-8 text-xs font-semibold uppercase tracking-wider"
          /* Provides aria-label accessibility information so assistive technology can describe the element. */
          aria-label="Get started with the platform"
        /* Continues the component or data expression so its related values and behavior stay grouped together. */
        /* Continues the component or data expression so its related values and behavior stay grouped together. */
        >
          {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
          Get started free
        {/* Closes the <Button> element so later content is no longer part of this region. */}
        </Button>
      {/* Closes the <div> element so later content is no longer part of this region. */}
      </div>

      {/* Layered Showcase Image Container */}
      {/* Starts the <div> element to organize this part of the interface. */}
      <div className="w-full max-w-5xl relative pb-12">
        {/* Starts the <div> element to organize this part of the interface. */}
        <div
          /* Applies utility classes so the element’s layout, spacing, and appearance match the design. */
          className="absolute left-1/2 w-[90%] pointer-events-none z-0 opacity-40 blur-sm"
          /* Sets the style property so this element receives the data or behavior required by this screen. */
          /* Sets the style property so this element receives the data or behavior required by this screen. */
          style={{
            /* Sets the top field so the surrounding object or component receives this setting. */
            /* Sets the top field so the surrounding object or component receives this setting. */
            top: "-15%",
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
        >
          {/* Starts the <img> element to display visual content. */}
          <img
            /* Selects the image or other resource displayed by this element. */
            src="https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?auto=format&fit=crop&w=1600&q=80"
            /* Sets the alt property so this element receives the data or behavior required by this screen. */
            /* Sets the alt property so this element receives the data or behavior required by this screen. */
            alt=""
            /* Applies utility classes so the element’s layout, spacing, and appearance match the design. */
            className="w-full h-auto rounded-3xl"
            /* Sets the loading property so this element receives the data or behavior required by this screen. */
            /* Sets the loading property so this element receives the data or behavior required by this screen. */
            loading="eager"
          /* Continues the component or data expression so its related values and behavior stay grouped together. */
          /* Continues the component or data expression so its related values and behavior stay grouped together. */
          />
        {/* Closes the <div> element so later content is no longer part of this region. */}
        </div>
        
        {/* Main Dashboard Preview Card */}
        {/* Starts the <div> element to organize this part of the interface. */}
        <div className="relative z-10 bg-[#E8DCD4] rounded-2xl p-3 sm:p-4 border border-[#323232]/15 shadow-2xl overflow-hidden">
          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="flex items-center justify-between pb-3 px-3 border-b border-[#323232]/10 mb-3 text-xs text-[#595552]">
            {/* Starts the <div> element to organize this part of the interface. */}
            <div className="flex items-center gap-2">
              {/* Starts the <div> element to organize this part of the interface. */}
              <div className="w-3 h-3 rounded-full bg-[#323232]/20" />
              {/* Starts the <div> element to organize this part of the interface. */}
              <div className="w-3 h-3 rounded-full bg-[#323232]/20" />
              {/* Starts the <div> element to organize this part of the interface. */}
              <div className="w-3 h-3 rounded-full bg-[#323232]/20" />
              {/* Starts the <span> element to organize this part of the interface. */}
              <span className="ml-2 font-mono text-[11px] text-[#323232]">ForgeOS Cloud • Portfolio Overview</span>
            {/* Closes the <div> element so later content is no longer part of this region. */}
            </div>
            {/* Starts the <span> element to organize this part of the interface. */}
            <span className="font-semibold text-[#323232]">Sector 12, Sonipat • 42.5%</span>
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>
          {/* Starts the <img> element to display visual content. */}
          <img
            /* Selects the image or other resource displayed by this element. */
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80"
            /* Sets the alt property so this element receives the data or behavior required by this screen. */
            /* Sets the alt property so this element receives the data or behavior required by this screen. */
            alt="Dashboard preview showing analytics and metrics interface"
            /* Applies utility classes so the element’s layout, spacing, and appearance match the design. */
            className="w-full h-auto rounded-xl object-cover max-h-[500px]"
            /* Sets the loading property so this element receives the data or behavior required by this screen. */
            /* Sets the loading property so this element receives the data or behavior required by this screen. */
            loading="eager"
          /* Continues the component or data expression so its related values and behavior stay grouped together. */
          /* Continues the component or data expression so its related values and behavior stay grouped together. */
          />
        {/* Closes the <div> element so later content is no longer part of this region. */}
        </div>
      {/* Closes the <div> element so later content is no longer part of this region. */}
      </div>
    {/* Closes the <section> element so later content is no longer part of this region. */}
    </section>
  // Closes this function call or grouped expression so the surrounding code can continue.
  );
// Continues the component or data expression so its related values and behavior stay grouped together.
});

// Continues the component or data expression so its related values and behavior stay grouped together.
SaaSTemplateHero.displayName = "SaaSTemplateHero";

// Main Component
// Exports function as this file’s default value so other modules can load the main feature.
export default function Component() {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return (
    // Continues the component or data expression so its related values and behavior stay grouped together.
    <main className="min-h-screen bg-[#DDD0C8] text-[#323232]">
      {/* Starts the <SaaSTemplateNavigation> element to organize this part of the interface. */}
      <SaaSTemplateNavigation />
      {/* Starts the <SaaSTemplateHero> element to organize this part of the interface. */}
      <SaaSTemplateHero />
    {/* Closes the <main> element so later content is no longer part of this region. */}
    </main>
  // Closes this function call or grouped expression so the surrounding code can continue.
  );
// Closes the current block or object so the grouped statements or settings end here.
}
// File purpose: Renders the reusable saa s template interface component.
