'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { LayoutDashboard, Users, ShieldCheck, CheckSquare, Calendar, Mail, Settings, LogOut } from 'lucide-react';
import { m } from 'framer-motion';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pendingCount, setPendingCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const res = await fetch('/api/teams?paymentStatus=pending_verification&limit=1');
        if (res.ok) {
          const data = await res.json();
          setPendingCount(data.total);
        }
      } catch (err) {
        console.error('Failed to fetch pending verifications', err);
      }
    };
    
    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 30000); // Poll every 30s for real-time updates
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const navItems = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Teams', href: '/admin/teams', icon: Users },
    { name: 'Verification', href: '/admin/verification', icon: ShieldCheck, badge: pendingCount && pendingCount > 0 ? pendingCount : null },
    { name: 'Check-In', href: '/admin/checkin', icon: CheckSquare },
    { name: 'Schedule', href: '/admin/schedule', icon: Calendar },
    { name: 'Messages', href: '/admin/messages', icon: Mail },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-void flex flex-col md:flex-row">
      {/* Desktop Sidebar (280px) */}
      <aside className="hidden md:flex flex-col w-[280px] fixed inset-y-0 left-0 bg-glass border-r border-glass-border backdrop-blur-xl z-20">
        <div className="p-6 h-[72px] flex items-center border-b border-[rgba(255,255,255,0.08)]">
          <Link href="/admin">
            <div className="font-brand font-bold text-xl text-white uppercase opacity-70 whitespace-nowrap tracking-[0.18em]">
              Genesis <span className="font-display text-pulse">Admin</span>
            </div>
          </Link>
        </div>
        
        {/* Admin Avatar Block */}
        <div className="p-6 border-b border-[rgba(255,255,255,0.08)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-pulse/20 text-pulse border border-pulse/30 flex items-center justify-center font-display font-bold text-xl shadow-[0_0_15px_rgba(147,51,234,0.3)]">
              A
            </div>
            <div>
              <p className="text-sm text-text-muted">Administrator</p>
              <p className="font-bold text-white truncate">System Account</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center justify-between px-4 py-3 rounded-[14px] transition-all duration-300 ${
                  isActive 
                    ? 'bg-pulse/20 text-white border border-pulse/30 shadow-[0_0_15px_rgba(147,51,234,0.2)]' 
                    : 'text-text-muted border border-transparent hover:bg-glass hover:text-white hover:border-glass-border'
                }`}
              >
                <div className="flex items-center gap-4">
                  <Icon size={20} className={isActive ? 'text-pulse' : ''} />
                  <span className="font-medium text-sm">{item.name}</span>
                </div>
                {item.badge && (
                  <span className="bg-pending text-void text-[10px] font-bold px-2 py-0.5 rounded-full">
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
            className="flex items-center gap-4 px-4 py-3 rounded-[14px] text-text-muted hover:bg-danger/10 hover:text-danger w-full transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium text-sm">Secure Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile/Tablet Top Tab Strip */}
      <div className="md:hidden sticky top-0 z-20 bg-void/80 backdrop-blur-xl border-b border-glass-border">
        <div className="h-[64px] px-4 flex items-center justify-between border-b border-[rgba(255,255,255,0.08)]">
          <div className="font-brand font-bold text-lg text-white uppercase opacity-70 whitespace-nowrap tracking-[0.16em]">
            Genesis <span className="font-display text-pulse">Admin</span>
          </div>
          <button onClick={handleLogout} className="text-pulse text-sm font-medium hover:text-pulse/80 transition-colors">Logout</button>
        </div>
        <nav className="flex overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name}
                href={item.href}
                className={`flex-shrink-0 px-6 py-4 text-sm font-medium relative whitespace-nowrap transition-colors ${
                  isActive ? 'text-pulse' : 'text-text-muted'
                }`}
              >
                {item.name}
                {isActive && (
                  <m.div layoutId="adminMobileTab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-pulse" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-grow md:pl-[280px] w-full relative z-10">
        <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-pulse/5 to-transparent pointer-events-none z-[-1]" />
        
        {/* Fluid width minus sidebar, generous padding per spec */}
        <div className="p-6 sm:p-8 lg:p-12 w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}


