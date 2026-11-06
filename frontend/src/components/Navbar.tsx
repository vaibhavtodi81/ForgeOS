import React, { useState, useEffect } from 'react';
import { Building2, Menu, X, LayoutDashboard, ClipboardList, Package, Layers, Star } from 'lucide-react';
import { LiquidNavbar, type LiquidNavItem } from '@/components/ui/liquid-glass-navbar';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const liquidNavItems: LiquidNavItem[] = [
    {
      label: 'Features',
      href: '#features',
      icon: <LayoutDashboard className="w-4 h-4 text-amber-400" />,
      fx: 'glow',
    },
    {
      label: 'How It Works',
      href: '#how-it-works',
      icon: <ClipboardList className="w-4 h-4 text-amber-400" />,
      fx: 'spin',
    },
    {
      label: 'Gallery',
      href: '#gallery',
      icon: <Package className="w-4 h-4 text-amber-400" />,
      fx: 'pop',
    },
    {
      label: 'Showcase',
      href: '#showcase',
      icon: <Layers className="w-4 h-4 text-amber-400" />,
      fx: 'wave',
    },
    {
      label: 'Testimonials',
      href: '#testimonials',
      icon: <Star className="w-4 h-4 text-amber-400" />,
      fx: 'drop',
    },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-slate-950/90 backdrop-blur-md shadow-lg shadow-black/40 border-b border-slate-800/80 py-2'
          : 'bg-transparent border-b border-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo / Brand */}
          <a
            href="#"
            className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 group-hover:bg-amber-500/20 group-hover:border-amber-500/60 transition-all duration-200 shadow-sm shadow-amber-500/10">
              <Building2 className="w-5 h-5 transition-transform group-hover:scale-105" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white flex items-center">
                Forge<span className="text-amber-500">OS</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold -mt-1 hidden sm:block">
                Builder Platform
              </span>
            </div>
          </a>

          {/* Liquid Glass Navbar in Center (Desktop) */}
          <div className="hidden lg:flex items-center justify-center">
            <LiquidNavbar
              items={liquidNavItems}
              tone="dark"
              defaultActive={0}
              sound={false}
              className="scale-95"
            />
          </div>

          {/* Right Action Buttons (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="#login"
              className="text-sm font-medium text-slate-300 hover:text-white px-3 py-2 rounded-lg transition-colors duration-150"
            >
              Log In
            </a>
            <a
              href="#get-started"
              className="text-sm font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 px-4 py-2 rounded-xl shadow-sm shadow-amber-500/20 hover:shadow-amber-500/40 transition-all duration-150 transform hover:-translate-y-0.5"
            >
              Get Started
            </a>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex lg:hidden items-center">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 transition-colors"
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-slate-950/95 backdrop-blur-xl border-b border-slate-800 px-4 pt-3 pb-6 space-y-2 mt-2">
          {liquidNavItems.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              {link.icon}
              {link.label}
            </a>
          ))}
          <div className="pt-4 border-t border-slate-800/80 flex flex-col gap-2">
            <a
              href="#login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-center py-2 text-sm font-medium text-slate-300 hover:text-white"
            >
              Log In
            </a>
            <a
              href="#get-started"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-center py-2.5 text-sm font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl shadow-md"
            >
              Get Started
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
