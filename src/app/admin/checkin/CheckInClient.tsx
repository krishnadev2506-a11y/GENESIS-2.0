'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';

export function CheckInClient() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['teams', 'checkin', debouncedSearch],
    queryFn: async () => {
      const url = debouncedSearch ? `/api/teams?search=${debouncedSearch}&limit=1000` : `/api/teams?limit=1000`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch teams');
      return res.json();
    }
  });

  const checkInMutation = useMutation({
    mutationFn: async (teamId: string) => {
      const res = await fetch(`/api/teams/${teamId}/checkin`, { method: 'PATCH' });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to check in team');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', 'checkin'] });
      success('Success', 'Team successfully checked in!');
    },
    onError: (err: Error) => error('Error', err.message)
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <GlassCard className="p-8">
        <h2 className="text-2xl font-display font-bold text-white mb-6 uppercase">Find Team</h2>
        <input 
          type="text" 
          placeholder="Search by Team Name, Email, or College..." 
          className="w-full bg-void border border-pulse/30 rounded-[14px] px-6 py-4 text-white text-lg focus:outline-none focus:border-pulse shadow-[0_0_15px_rgba(147,51,234,0.1)] transition-all"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />
      </GlassCard>

      {isLoading && (
        <div className="flex justify-center py-8"><LoadingSpinner size="lg" /></div>
      )}

      {data?.teams && data.teams.length > 0 && (
        <div className="space-y-4">
          {data.teams.map((team: any) => (
            <GlassCard key={team._id} className="p-6 flex flex-col md:flex-row items-center justify-between gap-6 hoverEffect={true}">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <h3 className="text-2xl font-bold text-white">{team.teamName}</h3>
                  <Badge variant={team.paymentStatus === 'verified' ? 'success' : 'danger'}>
                    {team.paymentStatus.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-text-muted">{team.email} &bull; {team.college}</p>
                <p className="text-text-muted mt-1 text-sm">{team.members?.length || 0} Members Registered</p>
              </div>

              <div className="w-full md:w-auto">
                {team.checkedIn ? (
                  <div className="bg-success/10 border border-success/30 text-success px-6 py-4 rounded-[14px] font-bold text-center flex items-center justify-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-success animate-pulse"></div>
                    ALREADY CHECKED IN
                  </div>
                ) : (
                  <Button 
                    variant="primary" 
                    size="lg"
                    className={`w-full md:w-48 ${team.paymentStatus !== 'verified' ? 'opacity-50 cursor-not-allowed' : 'bg-pulse text-white'}`}
                    onClick={() => team.paymentStatus === 'verified' && checkInMutation.mutate(team._id)}
                    disabled={team.paymentStatus !== 'verified' || checkInMutation.isPending}
                  >
                    {checkInMutation.isPending ? 'Processing...' : 'CHECK IN'}
                  </Button>
                )}
                {team.paymentStatus !== 'verified' && !team.checkedIn && (
                  <p className="text-danger text-xs text-center mt-2 font-bold">Cannot check in: Payment not verified</p>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
