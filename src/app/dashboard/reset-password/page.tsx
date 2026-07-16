'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useRouter } from 'next/navigation';
import { AlertError } from '@/components/ui/AlertError';
import { getFriendlyErrorMessage } from '@/lib/errors';

export default function ResetPasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { success } = useToast();
  const router = useRouter();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    setPasswordError('');
    
    if (newPassword !== confirmPassword) {
      setPasswordError('The passwords you entered don\'t match. Please type them carefully.');
      return;
    }
    
    if (newPassword.length < 8) {
      setPasswordError('Your password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/user/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        success('Password updated successfully');
        router.push('/dashboard');
      } else {
        setGeneralError(getFriendlyErrorMessage(data.error || 'Failed to reset password'));
      }
    } catch (err) {
      setGeneralError(getFriendlyErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <GlassCard className="p-8">
        <h1 className="text-2xl font-display font-bold text-white mb-2">Change Password</h1>
        <p className="text-text-muted mb-8 text-sm">Please change your temporary password to continue.</p>
        
        <AlertError error={generalError} title="Password Reset Error" />
        
        <form onSubmit={handleReset} className="space-y-6">
          <Input
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              if (passwordError) setPasswordError('');
            }}
            required
            helperText="Minimum 8 characters"
            error={passwordError}
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (passwordError) setPasswordError('');
            }}
            required
            error={passwordError}
          />
          
          <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
            Update Password
          </Button>
        </form>
      </GlassCard>
    </div>
  );
}


