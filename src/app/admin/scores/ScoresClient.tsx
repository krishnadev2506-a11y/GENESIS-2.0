'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GlassCard } from '@/components/ui/GlassCard';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useDebounce } from '@/hooks/useDebounce';
import { Search, Save } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { getFriendlyErrorMessage } from '@/lib/errors';
type RouteType = 'foundation' | 'professional';

const FOUNDATION_STATIONS = [
  { key: 'debugArena', label: 'Debug Arena' },
  { key: 'systemDesignSprint', label: 'System Design' },
  { key: 'codeReviewChallenge', label: 'Code Review' },
  { key: 'aiEngineeringChallenge', label: 'AI Eng.' },
  { key: 'deploymentSprint', label: 'Deployment' },
];

const PROFESSIONAL_STATIONS = [
  ...FOUNDATION_STATIONS,
  { key: 'mockTechnicalInterview', label: 'Mock Interview' },
];

export function ScoresClient() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [route, setRoute] = useState<RouteType>('foundation');
  const debouncedSearch = useDebounce(search, 500);
  
  const [pendingScores, setPendingScores] = useState<Record<string, Record<string, string>>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const { error, success } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['teams', 'scores', page, debouncedSearch, route],
    queryFn: async () => {
      const params = new URLSearchParams({ 
        page: page.toString(), 
        limit: '20',
        route,
      });
      if (debouncedSearch) params.append('search', debouncedSearch);
      
      const res = await fetch(`/api/teams?${params}`);
      if (!res.ok) throw new Error('Failed to fetch teams');
      return res.json();
    }
  });

  const updateScoreMutation = useMutation({
    mutationFn: async ({ id, stationScores }: { id: string, stationScores: Record<string, number> }) => {
      const res = await fetch(`/api/teams/${id}/points`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stationScores }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update score');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', 'scores'] });
      setSavingId(null);
      success('Scores updated successfully');
    },
    onError: (err: Error) => {
      setSavingId(null);
      error('Failed to save score', getFriendlyErrorMessage(err));
    }
  });

  const handleManualInput = (teamId: string, stationKey: string, value: string) => {
    setPendingScores(prev => ({ 
      ...prev, 
      [teamId]: {
        ...(prev[teamId] || {}),
        [stationKey]: value
      }
    }));
  };

  const saveScore = (teamId: string) => {
    const stringScores = pendingScores[teamId] || {};
    if (Object.keys(stringScores).length === 0) return;
    
    // Parse strings to numbers for API
    const parsedScores: Record<string, number> = {};
    for (const [k, v] of Object.entries(stringScores)) {
      const num = parseInt(v, 10);
      parsedScores[k] = isNaN(num) ? 0 : Math.max(0, num);
    }
    
    setSavingId(teamId);
    updateScoreMutation.mutate({ id: teamId, stationScores: parsedScores });
    
    const newPending = { ...pendingScores };
    delete newPending[teamId];
    setPendingScores(newPending);
  };

  const stations = route === 'foundation' ? FOUNDATION_STATIONS : PROFESSIONAL_STATIONS;

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

          <div className="flex bg-void/50 p-1 rounded-lg border border-glass-border">
            <button
              onClick={() => { setRoute('foundation'); setPage(1); }}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                route === 'foundation' ? "bg-pulse text-white shadow-sm" : "text-text-muted hover:text-white hover:bg-white/5"
              }`}
            >
              Foundation
            </button>
            <button
              onClick={() => { setRoute('professional'); setPage(1); }}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                route === 'professional' ? "bg-pulse text-white shadow-sm" : "text-text-muted hover:text-white hover:bg-white/5"
              }`}
            >
              Professional
            </button>
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
            No teams found for this route.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-text-primary whitespace-nowrap">
              <thead className="bg-void/40 border-b border-glass-border uppercase font-mono text-[10px] tracking-wider text-text-muted">
                <tr>
                  <th className="px-4 py-4 sticky left-0 bg-[#0a0a0a] z-10 border-r border-glass-border w-[200px]">Team Name</th>
                  {stations.map(s => (
                    <th key={s.key} className="px-2 py-4 text-center">{s.label}</th>
                  ))}
                  <th className="px-4 py-4 text-center">Total</th>
                  <th className="px-4 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {data?.teams.map((team: any) => {
                  const teamPendingScores = pendingScores[team._id] || {};
                  const isModified = Object.keys(teamPendingScores).length > 0;
                  
                  // Calculate live total
                  let liveTotal = 0;
                  stations.forEach(s => {
                    const rawVal = teamPendingScores[s.key] !== undefined 
                      ? teamPendingScores[s.key] 
                      : (team.stationScores?.[s.key] !== undefined ? team.stationScores[s.key] : 0);
                      
                    const num = parseInt(rawVal as string, 10);
                    if (!isNaN(num)) {
                      liveTotal += num;
                    }
                  });

                  return (
                    <tr key={team._id} className="border-b border-glass-border/50 hover:bg-glass/10 transition-colors">
                      <td className="px-4 py-4 sticky left-0 bg-[#0a0a0a] z-10 border-r border-glass-border">
                        <div className="font-bold text-white truncate max-w-[180px]" title={team.teamName}>{team.teamName}</div>
                        <div className="text-xs text-text-muted truncate max-w-[180px]" title={team.college}>{team.college}</div>
                      </td>
                      
                      {stations.map(s => {
                        const currentVal = teamPendingScores[s.key] !== undefined 
                          ? teamPendingScores[s.key] 
                          : (team.stationScores?.[s.key] || 0);
                          
                        return (
                          <td key={s.key} className="px-2 py-4">
                            <div className="flex justify-center">
                              <input 
                                type="number" 
                                min="0"
                                className="w-16 bg-void/50 border border-glass-border rounded-md text-center font-display font-medium text-lg py-1 focus:outline-none focus:border-pulse text-white transition-colors"
                                value={currentVal}
                                onChange={(e) => handleManualInput(team._id, s.key, e.target.value)}
                              />
                            </div>
                          </td>
                        );
                      })}
                      
                      <td className="px-4 py-4 text-center font-bold text-pulse-bright text-lg">
                        {liveTotal}
                      </td>
                      
                      <td className="px-4 py-4 text-right">
                        <Button 
                          variant={isModified ? 'primary' : 'ghost'}
                          size="sm"
                          disabled={!isModified || savingId === team._id}
                          isLoading={savingId === team._id}
                          onClick={() => saveScore(team._id)}
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
