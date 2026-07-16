'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { m, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { ClubLogo } from '@/components/brand/ClubLogo';
import { BrandWordmark } from '@/components/brand/BrandWordmark';
import { Menu, X } from 'lucide-react';

export function PublicNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentHash, setCurrentHash] = useState('');
  const pathname = usePathname();

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash);
    };
    
    // Set initial hash
    handleHashChange();
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    return null;
  }

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Schedule', href: '/schedule' },
    { name: 'Leaderboard', href: '/leaderboard' },
    { name: 'About', href: '/#about' },
    { name: 'Register', href: '/register' },
  ];

  return (
    <>
      <header className="fixed left-0 right-0 top-4 z-50 px-3 sm:top-4 sm:px-6 lg:px-8">
        <div className="glass-surface mx-auto flex h-[64px] max-w-7xl items-center justify-between rounded-full border border-[rgba(255,255,255,0.12)] px-3 sm:h-[72px] sm:px-6 shadow-[0_4px_20px_rgba(0,0,0,0.35),0_0_30px_rgba(139,92,246,0.12)]">
          <Link href="/" className="flex items-center gap-2 sm:gap-4" onClick={() => setMobileMenuOpen(false)}>
            <ClubLogo className="h-10 w-10 shrink-0 sm:h-11 sm:w-11" />
            <div className="min-w-0 leading-none">
              <BrandWordmark className="text-[11px] tracking-[0.22em] text-white sm:text-base sm:tracking-[0.35em]" />
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <div className="mr-4 flex gap-6">
              {navLinks.map((link) => {
                let isActive = false;
                if (link.href.includes('#')) {
                  const hash = link.href.split('#')[1];
                  isActive = pathname === '/' && currentHash === `#${hash}`;
                } else {
                  isActive = pathname === link.href && currentHash === '';
                }
                
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    prefetch={true}
                    className={`relative group label-caps text-[13px] tracking-[0.24em] transition-all ${isActive ? 'text-white violet-text-glow' : 'text-text-muted hover:text-white'}`}
                  >
                    {link.name}
                    <span className={`absolute -bottom-1 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-[rgba(167,139,250,0.8)] to-transparent transition-all duration-300 ${isActive ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-50'} group-hover:opacity-100 group-hover:scale-x-100`}></span>
                  </Link>
                );
              })}
            </div>

            <m.div 
              className="hidden lg:flex items-center rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-[11px] uppercase tracking-[0.25em] text-text-muted"
              animate={{ 
                boxShadow: [
                  '0 0 0 rgba(52, 211, 153, 0)',
                  '0 0 20px rgba(52, 211, 153, 0.5)',
                  '0 0 0 rgba(52, 211, 153, 0)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <m.span 
                className="mr-2 h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.85)]"
                animate={{ 
                  scale: [1, 1.4, 1],
                  opacity: [1, 0.6, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              ></m.span>
              Live 2026
            </m.div>

            <div className="flex items-center gap-4">
              <Link href="/login" tabIndex={-1} prefetch={true}>
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link href="/register" tabIndex={-1} prefetch={true}>
                <Button variant="primary" size="sm">Join The Event</Button>
              </Link>
            </div>
          </nav>

          <button
            className="flex items-center justify-center h-11 w-11 text-text-muted hover:text-white focus:outline-none md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <m.div
            className="fixed inset-0 z-40 flex flex-col bg-[rgba(8,8,14,0.92)] pt-[84px] backdrop-blur-xl md:hidden sm:pt-[92px]"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <nav className="flex flex-1 flex-col gap-6 overflow-y-auto p-6 sm:gap-6 sm:p-6">
              {navLinks.map((link) => {
                let isActive = false;
                if (link.href.includes('#')) {
                  const hash = link.href.split('#')[1];
                  isActive = pathname === '/' && currentHash === `#${hash}`;
                } else {
                  isActive = pathname === link.href && currentHash === '';
                }
                
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    prefetch={true}
                    className={`text-xl font-display font-bold uppercase tracking-[0.14em] sm:text-2xl sm:tracking-[0.18em] ${isActive ? 'text-white' : 'text-text-muted'}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                );
              })}
              <div className="mt-6 glass-surface rounded-[22px] p-4 text-xs uppercase tracking-[0.18em] text-text-muted sm:text-sm sm:tracking-[0.22em]">
                <div className="mb-2 flex items-center gap-2 text-white">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.85)]"></span>
                  Live registrations open
                </div>
                Team buildathon experience with workshops and challenges.
              </div>
              <div className="mt-2 flex flex-col gap-4 border-t border-[rgba(255,255,255,0.08)] pt-5 sm:pt-6">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} tabIndex={-1} prefetch={true}>
                  <Button variant="ghost" size="lg" className="w-full justify-start text-lg font-display sm:text-xl">Login</Button>
                </Link>
              </div>
            </nav>
            <div className="p-6 sm:p-6">
              <Link href="/register" onClick={() => setMobileMenuOpen(false)} tabIndex={-1} prefetch={true}>
                <Button variant="primary" size="lg" className="w-full">Join The Event</Button>
              </Link>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}


