'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GlassCard } from '@/components/ui/GlassCard';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useDebounce } from '@/hooks/useDebounce';
import { Search, Plus, Minus, Save } from 'lucide-react';

export function ScoresClient() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 500);
  
  // Local state to track point modifications before saving
  const [pendingScores, setPendingScores] = useState<Record<string, number>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['teams', 'scores', page, debouncedSearch],
    queryFn: async () => {
      const params = new URLSearchParams({ 
        page: page.toString(), 
        limit: '20',
        paymentStatus: 'verified', // Only show verified teams on leaderboard
      });
      if (debouncedSearch) params.append('search', debouncedSearch);
      
      const res = await fetch(`/api/teams?${params}`);
      if (!res.ok) throw new Error('Failed to fetch teams');
      return res.json();
    }
  });

  const updateScoreMutation = useMutation({
    mutationFn: async ({ id, points }: { id: string, points: number }) => {
      const res = await fetch(`/api/teams/${id}/points`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points }),
      });
      if (!res.ok) throw new Error('Failed to update score');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', 'scores'] });
      setSavingId(null);
    },
    onError: () => {
      setSavingId(null);
      alert('Failed to save score. Please try again.');
    }
  });

  const handleScoreChange = (teamId: string, currentPoints: number, delta: number) => {
    setPendingScores(prev => ({
      ...prev,
      [teamId]: (prev[teamId] !== undefined ? prev[teamId] : currentPoints) + delta
    }));
  };

  const handleManualInput = (teamId: string, value: string) => {
    const points = parseInt(value, 10);
    if (!isNaN(points)) {
      setPendingScores(prev => ({ ...prev, [teamId]: points }));
    }
  };

  const saveScore = (teamId: string, currentPoints: number) => {
    const pointsToSave = pendingScores[teamId] !== undefined ? pendingScores[teamId] : currentPoints;
    setSavingId(teamId);
    updateScoreMutation.mutate({ id: teamId, points: pointsToSave });
    
    // Clear from pending
    const newPending = { ...pendingScores };
    delete newPending[teamId];
    setPendingScores(newPending);
  };

  return (
    <div className="space-y-6">
      <GlassCard className="p-4 sm:p-6" hoverEffect={false}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end justify-between">
          <div className="w-full sm:w-96 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <Input 
              placeholder="Search teams..." 
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-12"
            />
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-0 overflow-hidden" hoverEffect={false}>
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : data?.teams?.length === 0 ? (
          <div className="py-16 text-center text-text-muted">
            No verified teams found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-text-primary">
              <thead className="bg-void/40 border-b border-glass-border uppercase font-mono text-[10px] tracking-wider text-text-muted">
                <tr>
                  <th className="px-6 py-4">Team Name</th>
                  <th className="px-6 py-4 hidden sm:table-cell">College</th>
                  <th className="px-6 py-4 text-center">Score Control</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {data?.teams.map((team: any) => {
                  const currentScore = pendingScores[team._id] !== undefined 
                    ? pendingScores[team._id] 
                    : (team.scoreboardPoints || 0);
                    
                  const isModified = pendingScores[team._id] !== undefined && pendingScores[team._id] !== team.scoreboardPoints;

                  return (
                    <tr key={team._id} className="border-b border-glass-border/50 hover:bg-glass/10 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-white">{team.teamName}</div>
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell text-text-muted">
                        {team.college}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-3">
                          <button 
                            onClick={() => handleScoreChange(team._id, team.scoreboardPoints || 0, -10)}
                            className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-white transition-colors"
                            title="-10 Points"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          
                          <input 
                            type="number" 
                            className="w-20 bg-void/50 border border-glass-border rounded-lg text-center font-display font-bold text-xl py-1 focus:outline-none focus:border-pulse text-white"
                            value={currentScore}
                            onChange={(e) => handleManualInput(team._id, e.target.value)}
                          />
                          
                          <button 
                            onClick={() => handleScoreChange(team._id, team.scoreboardPoints || 0, 10)}
                            className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-white transition-colors"
                            title="+10 Points"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button 
                          variant={isModified ? 'primary' : 'ghost'}
                          size="sm"
                          disabled={!isModified || savingId === team._id}
                          isLoading={savingId === team._id}
                          onClick={() => saveScore(team._id, team.scoreboardPoints || 0)}
                          className={isModified ? 'animate-pulse shadow-[0_0_15px_rgba(139,92,246,0.5)]' : ''}
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {data?.totalPages > 1 && (
          <div className="p-4 border-t border-glass-border flex justify-between items-center bg-glass/30">
            <Button 
              variant="ghost" 
              size="sm" 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-text-muted">
              Page {page} of {data.totalPages}
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              disabled={page === data.totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
