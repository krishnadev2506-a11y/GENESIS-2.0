'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, Mail, Users, CheckSquare, LogOut, Menu, X, Award, FileText } from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';
import { BrandWordmark } from '@/components/brand/BrandWordmark';

export function DashboardShell({
  children,
  teamName
}: {
  children: React.ReactNode;
  teamName: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isResetPassword = pathname === '/dashboard/reset-password';

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const navItems = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Guidelines', href: '/dashboard/guidelines', icon: FileText },
    { name: 'Inbox', href: '/dashboard/inbox', icon: Mail, badge: 2 }, // Mock unread count
    { name: 'Team Details', href: '/dashboard/team', icon: Users },
    { name: 'Certificates', href: '/dashboard/certificates', icon: Award },
    { name: 'Check-In', href: '/dashboard/checkin', icon: CheckSquare, disabled: true },
  ];

  if (isResetPassword) {
    return (
      <div className="min-h-screen bg-void flex flex-col">
        <header className="border-b border-[rgba(255,255,255,0.08)] bg-nebula/50 backdrop-blur-md h-16 flex items-center px-8">
          <BrandWordmark className="text-xl tracking-[0.2em] text-white" />
        </header>
        <main className="flex-grow p-4">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void flex flex-col md:flex-row">
      {/* Desktop Sidebar (260px) */}
      <aside className="hidden md:flex flex-col w-[260px] fixed inset-y-0 left-0 bg-glass border-r border-glass-border backdrop-blur-xl z-20">
        <div className="p-6 h-[72px] flex items-center border-b border-[rgba(255,255,255,0.08)]">
          <Link href="/dashboard">
            <BrandWordmark className="text-xl tracking-[0.2em] text-white" />
          </Link>
        </div>
        
        {/* Team Avatar Block */}
        <div className="p-6 border-b border-[rgba(255,255,255,0.08)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-pulse flex items-center justify-center font-display font-bold text-xl uppercase">
              {teamName ? teamName[0] : 'T'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm text-text-muted">Welcome back,</p>
              <p className="font-bold text-white truncate" title={teamName}>{teamName}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link 
                key={item.name} 
                href={item.disabled ? '#' : item.href}
                prefetch={item.disabled ? false : true}
                className={`flex items-center justify-between px-4 py-3 rounded-[14px] transition-colors ${
                  item.disabled 
                    ? 'opacity-50 cursor-not-allowed text-text-muted' 
                    : isActive 
                      ? 'bg-pulse/20 text-white' 
                      : 'text-text-muted hover:bg-glass hover:text-white'
                }`}
              >
                <div className="flex items-center gap-4">
                  <Icon size={20} className={isActive ? 'text-pulse' : ''} />
                  <span className="font-medium">{item.name}</span>
                </div>
                {item.badge && (
                  <span className="bg-ion text-void text-xs font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-[rgba(255,255,255,0.08)]">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-4 px-4 py-3 rounded-[14px] text-text-muted hover:bg-[rgba(248,113,113,0.1)] hover:text-danger w-full transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Log Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden h-[72px] bg-glass backdrop-blur-md border-b border-glass-border flex items-center justify-between px-4 sticky top-0 z-20">
        <BrandWordmark className="text-lg tracking-[0.2em] text-white" />
        <button className="p-2 text-text-muted" onClick={() => setMobileMenuOpen(true)}>
          <Menu size={24} />
        </button>
      </header>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <m.div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />
            <m.aside 
              className="fixed inset-y-0 right-0 w-[280px] bg-nebula border-l border-glass-border z-50 flex flex-col md:hidden"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="p-6 border-b border-[rgba(255,255,255,0.08)] flex justify-between items-center">
                <span className="font-bold text-white">Menu</span>
                <button onClick={() => setMobileMenuOpen(false)} className="text-text-muted">
                  <X size={24} />
                </button>
              </div>
              <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link 
                      key={item.name} 
                      href={item.disabled ? '#' : item.href}
                      prefetch={item.disabled ? false : true}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-4 py-3 rounded-[14px] transition-colors ${
                        item.disabled 
                          ? 'opacity-50 cursor-not-allowed text-text-muted' 
                          : isActive 
                            ? 'bg-pulse/20 text-white' 
                            : 'text-text-muted hover:bg-glass hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <Icon size={20} className={isActive ? 'text-pulse' : ''} />
                        <span className="font-medium">{item.name}</span>
                      </div>
                    </Link>
                  );
                })}
              </nav>
              <div className="p-4 border-t border-[rgba(255,255,255,0.08)]">
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-4 px-4 py-3 rounded-[14px] text-text-muted hover:bg-[rgba(248,113,113,0.1)] hover:text-danger w-full transition-colors"
                >
                  <LogOut size={20} />
                  <span className="font-medium">Log Out</span>
                </button>
              </div>
            </m.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-grow md:pl-[260px] pb-[80px] md:pb-0 w-full relative z-10">
        {/* Background Aurora for Dashboard */}
        <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-pulse/10 to-transparent pointer-events-none z-[-1]" />
        
        <div className="p-4 sm:p-6 lg:p-8 max-w-[960px] mx-auto w-full">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Tab Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-[64px] bg-void/90 backdrop-blur-xl border-t border-glass-border flex justify-around items-center z-30 pb-safe px-2">
        {navItems.slice(0, 4).map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link 
              key={item.name}
              href={item.disabled ? '#' : item.href}
              prefetch={item.disabled ? false : true}
              className={`flex flex-col items-center justify-center w-16 h-full relative ${
                item.disabled ? 'opacity-50' : isActive ? 'text-pulse' : 'text-text-muted'
              }`}
            >
              <Icon size={24} />
              {isActive && (
                <m.div layoutId="mobileTab" className="absolute bottom-1 w-1 h-1 rounded-full bg-ion" />
              )}
              {item.badge && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-ion" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
