'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GlassCard } from '@/components/ui/GlassCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';

export function VerificationClient() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  
  const { data, isLoading } = useQuery({
    queryKey: ['teams', 'pending'],
    queryFn: async () => {
      const res = await fetch(`/api/teams?paymentStatus=pending_verification&limit=50`);
      if (!res.ok) throw new Error('Failed to fetch teams');
      return res.json();
    }
  });

  const verifyMutation = useMutation({
    mutationFn: async (teamId: string) => {
      const res = await fetch(`/api/teams/${teamId}/verify`, { method: 'PATCH' });
      if (!res.ok) throw new Error('Failed to verify team');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', 'pending'] });
      success('Success', 'Team successfully verified!');
    },
    onError: (err: Error) => error('Error', err.message)
  });

  const rejectMutation = useMutation({
    mutationFn: async (teamId: string) => {
      const res = await fetch(`/api/teams/${teamId}/reject`, { method: 'PATCH' });
      if (!res.ok) throw new Error('Failed to reject team');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', 'pending'] });
      success('Success', 'Team payment rejected.');
    },
    onError: (err: Error) => error('Error', err.message)
  });

  if (isLoading) {
    return <div className="py-20 flex justify-center"><LoadingSpinner size="lg" /></div>;
  }

  if (!data?.teams || data.teams.length === 0) {
    return (
      <GlassCard className="p-0 overflow-hidden" hoverEffect={false}>
        <EmptyState 
          title="All caught up!"
          description="There are no teams pending verification."
          className="bg-transparent border-none shadow-none py-16"
        />
      </GlassCard>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {data.teams.map((team: any) => (
        <GlassCard key={team._id} className="p-6 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">{team.teamName}</h3>
              <p className="text-sm text-text-muted">{team.email}</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-text-muted uppercase">Transaction ID</span>
              <p className="font-mono text-pulse font-bold">{team.transactionId}</p>
            </div>
          </div>
          
          {team.paymentScreenshotUrl ? (
            <div className="w-full h-48 bg-void border border-glass-border rounded-[14px] overflow-hidden flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={team.paymentScreenshotUrl} alt="Payment Receipt" className="max-h-full object-contain" />
            </div>
          ) : (
            <div className="w-full h-48 bg-void border border-glass-border rounded-[14px] flex items-center justify-center text-text-muted text-sm">
              No screenshot uploaded
            </div>
          )}

          <div className="flex gap-4 mt-2">
            <Button 
              variant="secondary" 
              className="flex-1 border-danger text-danger hover:bg-danger/10"
              onClick={() => rejectMutation.mutate(team._id)}
              disabled={rejectMutation.isPending || verifyMutation.isPending}
            >
              {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
            </Button>
            <Button 
              variant="primary" 
              className="flex-1 bg-success text-void hover:bg-success/90"
              onClick={() => verifyMutation.mutate(team._id)}
              disabled={verifyMutation.isPending || rejectMutation.isPending}
            >
              {verifyMutation.isPending ? 'Verifying...' : 'Verify Payment'}
            </Button>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
