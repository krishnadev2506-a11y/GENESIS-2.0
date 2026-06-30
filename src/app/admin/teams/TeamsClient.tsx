'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GlassCard } from '@/components/ui/GlassCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export function TeamsClient() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['teams', page, search, paymentStatus],
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), limit: '20' });
      if (search) params.append('search', search);
      if (paymentStatus) params.append('paymentStatus', paymentStatus);
      
      const res = await fetch(`/api/teams?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch teams');
      return res.json();
    }
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <GlassCard className="p-4 flex flex-col md:flex-row gap-4">
        <input 
          type="text" 
          placeholder="Search teams, colleges, emails..." 
          className="flex-1 bg-void border border-glass-border rounded-[14px] px-4 py-2 text-white focus:outline-none focus:border-pulse"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <select 
          className="bg-void border border-glass-border rounded-[14px] px-4 py-2 text-white focus:outline-none focus:border-pulse"
          value={paymentStatus}
          onChange={(e) => { setPaymentStatus(e.target.value); setPage(1); }}
        >
          <option value="">All Statuses</option>
          <option value="pending_verification">Pending</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
        </select>
      </GlassCard>

      {/* Data Table */}
      <GlassCard className="p-0 overflow-hidden">
        <div className="p-6 border-b border-glass-border flex justify-between items-center bg-glass/30">
          <h2 className="text-xl font-display font-bold text-white uppercase">All Teams</h2>
          {data?.total !== undefined && (
            <Badge variant="default">{data.total} Teams Found</Badge>
          )}
        </div>
        
        {isLoading ? (
          <div className="py-20 flex justify-center"><LoadingSpinner size="lg" /></div>
        ) : error ? (
          <EmptyState title="Error Loading Teams" description={(error as Error).message} />
        ) : data?.teams?.length === 0 ? (
          <EmptyState title="No Teams Found" description="Try adjusting your search or filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-text-primary">
              <thead className="bg-void/40 border-b border-glass-border uppercase font-mono text-[10px] tracking-wider text-text-muted">
                <tr>
                  <th className="px-6 py-4">Team Name</th>
                  <th className="px-6 py-4">College</th>
                  <th className="px-6 py-4">Members</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Check-In</th>
                </tr>
              </thead>
              <tbody>
                {data.teams.map((team: any) => (
                  <tr key={team._id} className="border-b border-glass-border/50 hover:bg-glass/20 transition-colors">
                    <td className="px-6 py-4 font-bold text-white">{team.teamName}</td>
                    <td className="px-6 py-4 text-text-muted">{team.college}</td>
                    <td className="px-6 py-4">{team.members?.length || 0} Members</td>
                    <td className="px-6 py-4">
                      <Badge variant={team.paymentStatus === 'verified' ? 'success' : team.paymentStatus === 'pending_verification' ? 'pending' : 'danger'}>
                        {team.paymentStatus.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {team.checkedIn ? (
                        <span className="text-success flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-success"></div> Yes</span>
                      ) : (
                        <span className="text-text-muted flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-glass-border"></div> No</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {data?.totalPages > 1 && (
          <div className="p-4 border-t border-glass-border flex justify-between items-center bg-glass/10">
            <Button variant="ghost" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Previous</Button>
            <span className="text-sm text-text-muted">Page {page} of {data.totalPages}</span>
            <Button variant="ghost" disabled={page === data.totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
