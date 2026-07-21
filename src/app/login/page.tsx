'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { m } from 'framer-motion';
import { fadeUp } from '@/lib/motion-variants';
import { BrandWordmark } from '@/components/brand/BrandWordmark';
import { AlertError } from '@/components/ui/AlertError';
import { getFriendlyErrorMessage } from '@/lib/errors';

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
      setIdentifierError('Please enter your username or email address.');
      hasError = true;
    }
    if (!password) {
      setPasswordError('Please enter your password.');
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
        const errorString = typeof data.error === 'string' ? data.error : String(data.error || '');
        if (errorString && errorString.toLowerCase().includes('password')) {
          setPasswordError(getFriendlyErrorMessage(errorString));
        } else if (errorString && (errorString.toLowerCase().includes('identifier') || errorString.toLowerCase().includes('user') || errorString.toLowerCase().includes('credentials'))) {
          const friendly = getFriendlyErrorMessage(errorString);
          setIdentifierError(friendly);
          setPasswordError(friendly);
        } else {
          setGeneralError(getFriendlyErrorMessage(data.error || 'Login failed'));
        }
        setIsLoading(false); // Only stop loading if there is an error
      }
    } catch (err) {
      setGeneralError(getFriendlyErrorMessage(err));
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
            
            <AlertError error={generalError} title="Login Error" />
            
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




