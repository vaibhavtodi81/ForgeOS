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
      icon: <LayoutDashboard className="w-4 h-4 text-[#323232]" />,
      fx: 'glow',
    },
    {
      label: 'How It Works',
      href: '#how-it-works',
      icon: <ClipboardList className="w-4 h-4 text-[#323232]" />,
      fx: 'spin',
    },
    {
      label: 'Gallery',
      href: '#gallery',
      icon: <Package className="w-4 h-4 text-[#323232]" />,
      fx: 'pop',
    },
    {
      label: 'Showcase',
      href: '#showcase',
      icon: <Layers className="w-4 h-4 text-[#323232]" />,
      fx: 'wave',
    },
    {
      label: 'Testimonials',
      href: '#testimonials',
      icon: <Star className="w-4 h-4 text-[#323232]" />,
      fx: 'drop',
    },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#DDD0C8]/90 backdrop-blur-md shadow-sm border-b border-[#323232]/10 py-3'
          : 'bg-transparent border-b border-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Logo / Brand - Editorial style */}
          <a
            href="#"
            className="flex items-center gap-2.5 group focus:outline-none rounded-lg"
          >
            <div className="w-8 h-8 rounded-full bg-[#323232] text-[#DDD0C8] flex items-center justify-center transition-transform group-hover:scale-105">
              <Building2 className="w-4 h-4" />
            </div>
            <span className="text-lg font-bold tracking-[0.2em] uppercase text-[#323232]">
              FORGE<span className="font-light text-[#595552]">OS</span>
            </span>
          </a>

          {/* Liquid Glass Navbar in Center (Desktop) */}
          <div className="hidden lg:flex items-center justify-center">
            <LiquidNavbar
              items={liquidNavItems}
              tone="light"
              defaultActive={0}
              sound={false}
              className="scale-95 shadow-sm"
            />
          </div>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href="#login"
              className="text-xs font-semibold uppercase tracking-wider text-[#323232] hover:text-black px-3 py-2 transition-colors"
            >
              Log In
            </a>
            <a
              href="#get-started"
              className="text-xs font-semibold uppercase tracking-wider text-[#DDD0C8] bg-[#323232] hover:bg-[#1E1E1E] px-6 py-2.5 rounded-full shadow-sm transition-all duration-200 transform hover:-translate-y-0.5"
            >
              Get Started
            </a>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex lg:hidden items-center">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-[#323232] hover:bg-[#323232]/10 transition-colors"
              aria-label="Toggle mobile menu"
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
        <div className="lg:hidden bg-[#DDD0C8]/95 backdrop-blur-xl border-b border-[#323232]/15 px-4 pt-4 pb-6 space-y-2 mt-2 shadow-lg">
          {liquidNavItems.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#323232] hover:bg-[#323232]/10 transition-colors"
            >
              {link.icon}
              {link.label}
            </a>
          ))}
          <div className="pt-4 border-t border-[#323232]/15 flex flex-col gap-2">
            <a
              href="#login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-center py-2 text-sm font-medium text-[#323232]"
            >
              Log In
            </a>
            <a
              href="#get-started"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-center py-2.5 text-xs font-semibold uppercase tracking-wider text-[#DDD0C8] bg-[#323232] rounded-full shadow-sm"
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
