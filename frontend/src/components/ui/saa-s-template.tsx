import React from "react";
import { ArrowRight, Menu, X } from "lucide-react";

// Inline Button Component
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "ghost" | "gradient";
  size?: "default" | "sm" | "lg";
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "default", size = "default", className = "", children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
    
    const variants = {
      default: "bg-[#323232] text-[#DDD0C8] hover:bg-[#1E1E1E]",
      secondary: "bg-[#E8DCD4] text-[#323232] hover:bg-[#DDD0C8]",
      ghost: "hover:bg-[#323232]/10 text-[#323232]",
      gradient: "bg-[#323232] text-[#DDD0C8] hover:scale-105 active:scale-95 shadow-md"
    };
    
    const sizes = {
      default: "h-10 px-4 py-2 text-sm",
      sm: "h-10 px-5 text-sm",
      lg: "h-12 px-8 text-base"
    };
    
    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

// Navigation Component
export const SaaSTemplateNavigation = React.memo(() => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="fixed top-0 w-full z-50 border-b border-[#323232]/10 bg-[#DDD0C8]/90 backdrop-blur-md">
      <nav className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold tracking-wider text-[#323232]">FORGEOS</div>
          
          <div className="hidden md:flex items-center justify-center gap-8 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <a href="#getting-started" className="text-sm text-[#595552] hover:text-[#323232] transition-colors">
              Getting started
            </a>
            <a href="#components" className="text-sm text-[#595552] hover:text-[#323232] transition-colors">
              Components
            </a>
            <a href="#documentation" className="text-sm text-[#595552] hover:text-[#323232] transition-colors">
              Documentation
            </a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Button type="button" variant="ghost" size="sm">
              Sign in
            </Button>
            <Button type="button" variant="default" size="sm" className="rounded-full">
              Sign Up
            </Button>
          </div>

          <button
            type="button"
            className="md:hidden text-[#323232]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="md:hidden bg-[#DDD0C8]/95 backdrop-blur-md border-t border-[#323232]/10">
          <div className="px-6 py-4 flex flex-col gap-4">
            <a
              href="#getting-started"
              className="text-sm text-[#595552] hover:text-[#323232] transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Getting started
            </a>
            <a
              href="#components"
              className="text-sm text-[#595552] hover:text-[#323232] transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Components
            </a>
            <a
              href="#documentation"
              className="text-sm text-[#595552] hover:text-[#323232] transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Documentation
            </a>
            <div className="flex flex-col gap-2 pt-4 border-t border-[#323232]/10">
              <Button type="button" variant="ghost" size="sm">
                Sign in
              </Button>
              <Button type="button" variant="default" size="sm" className="rounded-full">
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
});

SaaSTemplateNavigation.displayName = "SaaSTemplateNavigation";

// Hero Component with centered title & layered dashboard preview
export const SaaSTemplateHero = React.memo(() => {
  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-start px-6 pt-28 pb-20 md:pt-32 bg-[#DDD0C8] text-[#323232]"
    >
      <aside className="mb-8 inline-flex flex-wrap items-center justify-center gap-2 px-5 py-2 rounded-full border border-[#323232]/15 bg-[#E8DCD4]/70 backdrop-blur-sm max-w-full shadow-xs">
        <span className="text-xs text-center whitespace-nowrap text-[#595552]">
          New version of ForgeOS Builder Platform is live
        </span>
        <a
          href="#features"
          className="flex items-center gap-1 text-xs font-semibold text-[#323232] hover:underline transition-all active:scale-95 whitespace-nowrap"
          aria-label="Read more about the new version"
        >
          Explore features
          <ArrowRight size={12} />
        </a>
      </aside>

      <h1
        className="text-4xl md:text-5xl lg:text-6xl font-medium text-center max-w-3xl px-6 leading-tight mb-6 text-[#323232] tracking-tight"
      >
        Give your construction projects <br />the platform they deserve
      </h1>

      <p className="text-sm md:text-base text-center max-w-2xl px-6 mb-10 text-[#595552] font-light leading-relaxed">
        Centralized multi-site portfolio tracking, daily supervisor logs, automated stock balances, and progress-adjusted wastage detection.
      </p>

      <div className="flex items-center gap-4 relative z-10 mb-16">
        <Button
          type="button"
          variant="gradient"
          size="lg"
          className="rounded-full flex items-center justify-center px-8 text-xs font-semibold uppercase tracking-wider"
          aria-label="Get started with the platform"
        >
          Get started free
        </Button>
      </div>

      {/* Layered Showcase Image Container */}
      <div className="w-full max-w-5xl relative pb-12">
        <div
          className="absolute left-1/2 w-[90%] pointer-events-none z-0 opacity-40 blur-sm"
          style={{
            top: "-15%",
            transform: "translateX(-50%)"
          }}
          aria-hidden="true"
        >
          <img
            src="https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?auto=format&fit=crop&w=1600&q=80"
            alt=""
            className="w-full h-auto rounded-3xl"
            loading="eager"
          />
        </div>
        
        {/* Main Dashboard Preview Card */}
        <div className="relative z-10 bg-[#E8DCD4] rounded-2xl p-3 sm:p-4 border border-[#323232]/15 shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between pb-3 px-3 border-b border-[#323232]/10 mb-3 text-xs text-[#595552]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#323232]/20" />
              <div className="w-3 h-3 rounded-full bg-[#323232]/20" />
              <div className="w-3 h-3 rounded-full bg-[#323232]/20" />
              <span className="ml-2 font-mono text-[11px] text-[#323232]">ForgeOS Cloud • Portfolio Overview</span>
            </div>
            <span className="font-semibold text-[#323232]">Sector 12, Sonipat • 42.5%</span>
          </div>
          <img
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80"
            alt="Dashboard preview showing analytics and metrics interface"
            className="w-full h-auto rounded-xl object-cover max-h-[500px]"
            loading="eager"
          />
        </div>
      </div>
    </section>
  );
});

SaaSTemplateHero.displayName = "SaaSTemplateHero";

// Main Component
export default function Component() {
  return (
    <main className="min-h-screen bg-[#DDD0C8] text-[#323232]">
      <SaaSTemplateNavigation />
      <SaaSTemplateHero />
    </main>
  );
}
