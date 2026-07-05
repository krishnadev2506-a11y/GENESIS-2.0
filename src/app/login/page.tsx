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
import { BrandWordmark } from '@/components/brand/BrandWordmark';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { error } = useToast();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) return;
    
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        if (data.redirect) {
          router.push(data.redirect);
        } else {
          router.push('/dashboard'); // fallback
        }
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
    <main className="cosmic-page relative flex min-h-screen items-center justify-center overflow-hidden p-4 pt-24 sm:pt-28">
      {/* Background elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-[radial-gradient(circle,rgba(139,92,246,0.24)_0%,rgba(167,139,250,0.12)_35%,transparent_70%)] rounded-full blur-[120px] -z-10"></div>
      
      <div className="w-full max-w-md relative z-10">
        <Link href="/" className="block text-center mb-8">
          <BrandWordmark className="text-2xl tracking-[0.18em] text-white sm:text-3xl sm:tracking-[0.24em]" />
        </Link>
        
        <m.div variants={fadeUp as any} initial="hidden" animate="visible">
          <GlassCard className="border-[rgba(167,139,250,0.14)] p-6 sm:p-8">
            <h1 className="mb-2 text-center text-xl font-display font-bold uppercase tracking-[0.08em] text-white sm:text-2xl sm:tracking-[0.12em]">Login</h1>
            <p className="mb-6 text-center text-sm text-text-muted sm:mb-8">Access your dashboard</p>
            
            <form onSubmit={handleLogin} className="space-y-6">
              <Input
                label="Username or Email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                placeholder="Enter your username or email"
              />
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
              
              <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
                Login
              </Button>
            </form>
            
            <div className="mt-6 text-center text-sm text-text-muted">
              Don't have an account? <Link href="/register" className="text-accent-secondary hover:underline">Register your team</Link>
            </div>
          </GlassCard>
        </m.div>
      </div>
    </main>
  );
}




