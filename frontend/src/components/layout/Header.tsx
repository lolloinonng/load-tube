'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { dark, toggle } = useTheme();

  return (
    <nav className="bg-surface/30 backdrop-blur-xl border-b border-white/20 shadow-[0_8px_32px_0_rgba(74,97,113,0.05)] sticky top-0 z-40 spring-transition">
      <div className="flex justify-between items-center w-full px-6 py-4 max-w-[720px] mx-auto">
        <Link href="/" className="text-display-lg-mobile md:text-display-lg text-primary tracking-tight font-bold" style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>
          load.tube
        </Link>
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-6 mr-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'font-label-caps text-label-caps spring-transition hover:opacity-80',
                  pathname === link.href
                    ? 'text-primary'
                    : 'text-on-surface-variant/70'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <button
            onClick={toggle}
            className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-on-surface-variant hover:opacity-80 spring-transition"
            aria-label="Toggle theme"
          >
            <span className="material-symbols-outlined hand-drawn-icon" style={{ fontSize: '20px' }}>
              {dark ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-10 h-10 rounded-full glass-panel flex items-center justify-center text-on-surface-variant"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div className="border-t border-white/20 md:hidden bg-surface/50 backdrop-blur-xl">
          <div className="space-y-1 px-6 py-3 max-w-[720px] mx-auto">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'block rounded-lg px-3 py-2 text-sm spring-transition',
                  pathname === link.href
                    ? 'text-primary font-semibold'
                    : 'text-on-surface-variant/70 hover:bg-surface-container-low'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
