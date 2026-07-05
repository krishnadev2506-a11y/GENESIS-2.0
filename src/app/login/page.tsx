'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { m, AnimatePresence } from 'framer-motion';
import { fadeUp } from '@/lib/motion-variants';
import { BrandWordmark } from '@/components/brand/BrandWordmark';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [identifierError, setIdentifierError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setIdentifierError('');
    setPasswordError('');
    setGeneralError('');
    
    let hasError = false;
    if (!identifier) {
      setIdentifierError('Username or Email is required');
      hasError = true;
    }
    if (!password) {
      setPasswordError('Password is required');
      hasError = true;
    }
    
    if (hasError) return;
    
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
        // Do not set isLoading to false on success, so the spinner stays while navigating
      } else {
        if (data.error.toLowerCase().includes('password')) {
          setPasswordError(data.error);
        } else if (data.error.toLowerCase().includes('identifier') || data.error.toLowerCase().includes('user') || data.error.toLowerCase().includes('credentials')) {
          setIdentifierError(data.error);
          setPasswordError(data.error);
        } else {
          setGeneralError(data.error || 'Login failed');
        }
        setIsLoading(false); // Only stop loading if there is an error
      }
    } catch {
      setGeneralError('An error occurred during login. Please try again.');
      setIsLoading(false); // Only stop loading if there is an error
    }
  };

  return (
    <main className="cosmic-page relative flex min-h-screen items-center justify-center overflow-hidden p-4 pt-16 sm:pt-28">
      {/* Background elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[520px] sm:h-[520px] bg-[radial-gradient(circle,rgba(139,92,246,0.24)_0%,rgba(167,139,250,0.12)_35%,transparent_70%)] rounded-full blur-[80px] sm:blur-[120px] -z-10"></div>
      
      <div className="w-full max-w-md relative z-10 mx-auto">
        <Link href="/" className="block text-center mb-8 sm:mb-10">
          <BrandWordmark className="text-2xl tracking-[0.18em] text-white sm:text-3xl sm:tracking-[0.24em]" />
        </Link>
        
        <m.div variants={fadeUp} initial="hidden" animate="visible">
          <GlassCard className="border-[rgba(167,139,250,0.14)] p-6 sm:p-8 mx-2 sm:mx-0">
            <h1 className="mb-2 text-center text-xl font-display font-bold uppercase tracking-[0.08em] text-white sm:text-2xl sm:tracking-[0.12em]">Login</h1>
            <p className="mb-6 text-center text-sm text-text-muted sm:mb-8">Access your dashboard</p>
            
            <AnimatePresence>
              {generalError && (
                <m.div 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0 }}
                  className="mb-6 p-4 rounded-xl bg-danger/10 border border-danger/20 flex items-start gap-3"
                >
                  <div className="mt-0.5 text-danger">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-danger">Login Error</h4>
                    <p className="text-sm text-danger/80">{generalError}</p>
                  </div>
                </m.div>
              )}
            </AnimatePresence>
            
            <form onSubmit={handleLogin} className="space-y-5 sm:space-y-6">
              <Input
                label="Username or Email"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (identifierError) setIdentifierError('');
                }}
                error={identifierError}
                placeholder="Enter your username or email"
              />
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError('');
                }}
                error={passwordError}
                placeholder="Enter your password"
              />
              
              <div className="pt-2">
                <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
                  Login
                </Button>
              </div>
            </form>
            
            <div className="mt-6 sm:mt-8 text-center text-sm text-text-muted">
              Don't have an account? <Link href="/register" className="text-accent-secondary hover:text-accent-primary transition-colors font-medium">Register your team</Link>
            </div>
          </GlassCard>
        </m.div>
      </div>
    </main>
  );
}




