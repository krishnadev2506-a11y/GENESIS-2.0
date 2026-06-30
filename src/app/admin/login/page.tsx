'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { m } from 'framer-motion';
import { fadeUp } from '@/lib/motion-variants';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { error } = useToast();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        router.push('/admin');
      } else {
        error('Login failed', data.error);
      }
    } catch {
      error('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-bg-base">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-danger/10 rounded-full blur-[100px] -z-10"></div>
      
      <div className="w-full max-w-md relative z-10">
        <Link href="/" className="block text-center mb-8">
          <div className="font-brand font-bold text-3xl tracking-[0.2em] text-white uppercase opacity-50">
            Genesis <span className="font-display text-danger/70">Admin</span>
          </div>
        </Link>
        
        <m.div variants={fadeUp as any} initial="hidden" animate="visible">
          <GlassCard className="p-8 border-danger/20 shadow-[0_8px_32px_0_rgba(248,113,113,0.1)]">
            <h1 className="text-2xl font-display font-bold text-white mb-6 text-center">Admin Access</h1>
            
            <form onSubmit={handleLogin} className="space-y-6">
              <Input
                label="Admin Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              
              <Button type="submit" variant="primary" className="w-full bg-gradient-to-r from-danger/80 to-danger/60 border-danger/50 shadow-[0_0_20px_rgba(248,113,113,0.2)]" isLoading={isLoading}>
                Authorize Access
              </Button>
            </form>
          </GlassCard>
        </m.div>
      </div>
    </main>
  );
}


