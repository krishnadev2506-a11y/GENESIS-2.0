'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { X, Eye, Pencil, Save, Trash2, Plus } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/components/ui/Toast';
import { getFriendlyErrorMessage } from '@/lib/errors';

export function TeamsClient() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [isDeleted, setIsDeleted] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<any | null>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedTeam, setEditedTeam] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();
  const { error: toastError, success } = useToast();
  
  const debouncedSearch = useDebounce(search, 500);

  const { data, isLoading, error } = useQuery({
    queryKey: ['teams', page, debouncedSearch, paymentStatus, isDeleted],
    staleTime: 30000,
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), limit: '20' });
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (paymentStatus) params.append('paymentStatus', paymentStatus);
      if (isDeleted) params.append('deleted', 'true');
      
      const res = await fetch(`/api/teams?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch teams');
      return res.json();
    }
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/teams/${selectedTeam._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedTeam),
      });
      if (!res.ok) throw new Error('Failed to update team');
      const data = await res.json();
      setSelectedTeam(data.team);
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      success('Team Updated', 'The team details have been updated.');
    } catch (error) {
      console.error(error);
      toastError('Update Failed', getFriendlyErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleTeamChange = (field: string, value: any) => {
    setEditedTeam({ ...editedTeam, [field]: value });
  };

  const handleMemberChange = (index: number, field: string, value: any) => {
    const newMembers = [...editedTeam.members];
    newMembers[index] = { ...newMembers[index], [field]: value };
    setEditedTeam({ ...editedTeam, members: newMembers });
  };

  const handleAddMember = () => {
    const newMember = { name: '', role: 'Member', email: '', phone: '', college: '', semester: '', isLeader: false };
    setEditedTeam({ ...editedTeam, members: [...editedTeam.members, newMember] });
  };

  const handleRemoveMember = (index: number) => {
    const newMembers = [...editedTeam.members];
    newMembers.splice(index, 1);
    setEditedTeam({ ...editedTeam, members: newMembers });
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/teams/${teamId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete team');
      
      setSelectedTeam(null);
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      success('Team Deleted', 'The team has been successfully deleted.');
    } catch (error) {
      console.error(error);
      toastError('Delete Failed', getFriendlyErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex bg-void border border-glass-border rounded-lg p-1 w-fit">
        <button 
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${!isDeleted ? 'bg-glass-strong text-white' : 'text-text-muted hover:text-white hover:bg-glass'}`}
          onClick={() => { setIsDeleted(false); setPage(1); }}
        >
          Active Teams
        </button>
        <button 
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${isDeleted ? 'bg-danger/20 text-danger border border-danger/30' : 'text-text-muted hover:text-white hover:bg-glass'}`}
          onClick={() => { setIsDeleted(true); setPage(1); }}
        >
          Deleted Teams
        </button>
      </div>

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
        <div className={`p-6 border-b border-glass-border flex justify-between items-center ${isDeleted ? 'bg-danger/5' : 'bg-glass/30'}`}>
          <h2 className={`text-xl font-display font-bold uppercase ${isDeleted ? 'text-danger' : 'text-white'}`}>{isDeleted ? 'Deleted Teams' : 'All Teams'}</h2>
          {data?.total !== undefined && (
            <Badge variant="default">{data.total} Teams Found</Badge>
          )}
        </div>
        
        {isLoading ? (
          <div className="py-20 flex justify-center"><LoadingSpinner size="lg" /></div>
        ) : error ? (
          <EmptyState title="Error Loading Teams" description={getFriendlyErrorMessage(error)} />
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
                  <th className="px-6 py-4 text-right">Actions</th>
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
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedTeam(team)}>
                        <Eye className="w-4 h-4 mr-2" /> View
                      </Button>
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

      {/* Team Details Modal */}
      {selectedTeam && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-void/80 backdrop-blur-md">
          <div className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-bg-elevated/95 border border-glass-border shadow-2xl rounded-[24px] overflow-hidden">
            {/* Header */}
            <div className="bg-void/60 backdrop-blur-xl p-6 border-b border-glass-border flex justify-between items-start sm:items-center z-20 shrink-0">
              <div>
                {isEditing ? (
                  <div className="space-y-2">
                    <input 
                      className="bg-void/50 border border-glass-border rounded px-2 py-1 text-2xl font-display font-bold text-white uppercase w-full"
                      value={editedTeam.teamName}
                      onChange={e => handleTeamChange('teamName', e.target.value)}
                    />
                    <input 
                      className="bg-void/50 border border-glass-border rounded px-2 py-1 text-text-muted w-full"
                      value={editedTeam.college}
                      onChange={e => handleTeamChange('college', e.target.value)}
                    />
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-display font-bold text-white uppercase">{selectedTeam.teamName}</h2>
                    <p className="text-text-muted mt-1">{selectedTeam.college}</p>
                  </>
                )}
              </div>
              <div className="flex gap-2 items-center">
                {!isEditing ? (
                  <>
                    {!isDeleted && (
                      <>
                        <Button variant="secondary" size="sm" onClick={() => { setIsEditing(true); setEditedTeam(JSON.parse(JSON.stringify(selectedTeam))); }}>
                          <Pencil className="w-4 h-4 mr-2" /> Edit
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleDeleteTeam(selectedTeam._id)} disabled={isDeleting}>
                          {isDeleting ? <LoadingSpinner size="sm" className="mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />} Delete
                        </Button>
                      </>
                    )}
                  </>
                ) : (
                  <Button variant="primary" size="sm" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <LoadingSpinner size="sm" className="mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    Save
                  </Button>
                )}
                <button 
                  onClick={() => {
                    if (isEditing) {
                      setIsEditing(false);
                      setEditedTeam(null);
                    } else {
                      setSelectedTeam(null);
                    }
                  }}
                  className="p-2 bg-glass border border-glass-border hover:bg-glass-strong rounded-full transition-all text-text-muted hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Scrollable Content */}
            <div className="p-6 space-y-8 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white border-b border-glass-border pb-2">Team Details</h3>
                  <div className="space-y-3 text-sm">
                    {isEditing ? (
                      <>
                        <div className="flex flex-col gap-1">
                          <label className="text-text-muted uppercase text-[10px] tracking-wider">Email</label>
                          <input className="bg-void/50 border border-glass-border rounded px-2 py-1 text-white" value={editedTeam.email} onChange={e => handleTeamChange('email', e.target.value)} />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-text-muted uppercase text-[10px] tracking-wider">Contact</label>
                          <input className="bg-void/50 border border-glass-border rounded px-2 py-1 text-white" value={editedTeam.contactNumber} onChange={e => handleTeamChange('contactNumber', e.target.value)} />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-text-muted uppercase text-[10px] tracking-wider">Semester</label>
                          <input className="bg-void/50 border border-glass-border rounded px-2 py-1 text-white" value={editedTeam.semester} onChange={e => handleTeamChange('semester', e.target.value)} />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-text-muted uppercase text-[10px] tracking-wider">Points</label>
                          <input type="number" className="bg-void/50 border border-glass-border rounded px-2 py-1 text-white" value={editedTeam.scoreboardPoints} onChange={e => handleTeamChange('scoreboardPoints', parseInt(e.target.value) || 0)} />
                        </div>
                        <div className="flex flex-col gap-1 mt-4">
                          <label className="text-text-muted uppercase text-[10px] tracking-wider">Route</label>
                          <select className="bg-void/50 border border-glass-border rounded px-2 py-1 text-white" value={editedTeam.route || 'foundation'} onChange={e => handleTeamChange('route', e.target.value)}>
                            <option value="foundation">Foundation</option>
                            <option value="professional">Professional</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-1 mt-2">
                          <label className="text-text-muted uppercase text-[10px] tracking-wider">Payment Status</label>
                          <select className="bg-void/50 border border-glass-border rounded px-2 py-1 text-white" value={editedTeam.paymentStatus} onChange={e => handleTeamChange('paymentStatus', e.target.value)}>
                            <option value="pending_verification">Pending</option>
                            <option value="verified">Verified</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-1 mt-2">
                          <label className="text-text-muted uppercase text-[10px] tracking-wider">Transaction ID</label>
                          <input className="bg-void/50 border border-glass-border rounded px-2 py-1 text-white" value={editedTeam.transactionId || ''} onChange={e => handleTeamChange('transactionId', e.target.value)} />
                        </div>
                        <div className="flex flex-col gap-1 mt-2">
                          <label className="text-text-muted uppercase text-[10px] tracking-wider">Screenshot URL</label>
                          <input className="bg-void/50 border border-glass-border rounded px-2 py-1 text-white" value={editedTeam.paymentScreenshotUrl || ''} onChange={e => handleTeamChange('paymentScreenshotUrl', e.target.value)} />
                        </div>
                        <div className="flex flex-col gap-1 mt-4">
                          <label className="flex items-center gap-2 text-white cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={editedTeam.checkedIn} 
                              onChange={e => handleTeamChange('checkedIn', e.target.checked)}
                              className="w-4 h-4 rounded border-glass-border bg-void text-pulse focus:ring-pulse"
                            />
                            Checked In
                          </label>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4"><span className="text-text-muted uppercase text-[10px] tracking-wider w-32 shrink-0">Email</span> <span className="text-white font-medium">{selectedTeam.email}</span></p>
                        <p className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4"><span className="text-text-muted uppercase text-[10px] tracking-wider w-32 shrink-0">Contact</span> <span className="text-white font-medium">{selectedTeam.contactNumber}</span></p>
                        <p className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4"><span className="text-text-muted uppercase text-[10px] tracking-wider w-32 shrink-0">Semester</span> <span className="text-white font-medium">{selectedTeam.semester}</span></p>
                        <p className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4"><span className="text-text-muted uppercase text-[10px] tracking-wider w-32 shrink-0">Points</span> <span className="text-white font-medium">{selectedTeam.scoreboardPoints}</span></p>
                        
                        {/* Credentials Section */}
                        {selectedTeam.paymentStatus === 'verified' && (
                          <div className="mt-6 p-4 rounded-xl bg-glass-strong border border-glass-border">
                            <h4 className="text-sm font-bold text-white mb-3">Team Credentials</h4>
                            <div className="space-y-2">
                              <p className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                                <span className="text-text-muted uppercase text-[10px] tracking-wider w-24 shrink-0">Username</span> 
                                <span className="text-white font-mono bg-void/50 px-2 py-0.5 rounded text-sm">{selectedTeam.credentials?.username || 'N/A'}</span>
                              </p>
                              <p className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                                <span className="text-text-muted uppercase text-[10px] tracking-wider w-24 shrink-0">Password</span> 
                                <span className="text-white font-mono bg-void/50 px-2 py-0.5 rounded text-sm">
                                  {selectedTeam.credentials?.temporaryPassword ? selectedTeam.credentials.temporaryPassword : <span className="text-success text-xs">Set by participant (Private)</span>}
                                </span>
                              </p>
                            </div>
                            <div className="mt-4 pt-3 border-t border-glass-border">
                              <Button 
                                variant="secondary" 
                                size="sm" 
                                className="w-full text-xs py-1.5"
                                onClick={async (e) => {
                                  const btn = e.currentTarget;
                                  const originalText = btn.innerText;
                                  if (!window.confirm("Are you sure? This will invalidate their current password, generate a new one, and email it to the team.")) return;
                                  
                                  btn.disabled = true;
                                  btn.innerText = "Processing...";
                                  try {
                                    const res = await fetch(`/api/teams/${selectedTeam._id}/reset-credentials`, { method: 'POST' });
                                    if (!res.ok) throw new Error('Failed to reset credentials');
                                    const data = await res.json();
                                    success("Credentials Reset", "New credentials have been generated and emailed successfully.");
                                    if (data.team) {
                                      setSelectedTeam(data.team);
                                    }
                                  } catch (err) {
                                    toastError("Reset Failed", getFriendlyErrorMessage(err));
                                  } finally {
                                    btn.disabled = false;
                                    btn.innerText = originalText;
                                  }
                                }}
                              >
                                Reset & Resend Credentials
                              </Button>
                            </div>
                          </div>
                        )}

                        <div className="flex gap-6 pt-4">
                          <div>
                            <p className="text-text-muted mb-2 text-[10px] uppercase tracking-wider">Payment Status</p>
                            <Badge variant={selectedTeam.paymentStatus === 'verified' ? 'success' : selectedTeam.paymentStatus === 'pending_verification' ? 'pending' : 'danger'}>
                              {selectedTeam.paymentStatus.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-text-muted mb-2 text-[10px] uppercase tracking-wider">Check-in Status</p>
                            <Badge variant={selectedTeam.checkedIn ? 'success' : 'default'}>
                              {selectedTeam.checkedIn ? 'Checked In' : 'Not Checked In'}
                            </Badge>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white border-b border-glass-border pb-2">Payment Details</h3>
                  <div className="space-y-3 text-sm">
                    <p className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4"><span className="text-text-muted uppercase text-[10px] tracking-wider w-32 shrink-0">Transaction ID</span> <span className="text-white font-mono bg-glass px-2 py-1 rounded">{selectedTeam.transactionId || 'N/A'}</span></p>

                    {selectedTeam.paymentScreenshotUrl && (
                      <div className="mt-4">
                        <p className="text-text-muted mb-2 uppercase text-[10px] tracking-wider">Screenshot</p>
                        <a href={selectedTeam.paymentScreenshotUrl} target="_blank" rel="noreferrer" className="block w-full h-40 relative rounded-lg overflow-hidden border border-glass-border hover:border-pulse transition-all group">
                          <Image 
                            src={selectedTeam.paymentScreenshotUrl} 
                            alt="Payment Screenshot" 
                            width={600} height={400}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-void/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white font-medium flex items-center gap-2 bg-glass-strong border border-glass-border px-4 py-2 rounded-full backdrop-blur-md"><Eye className="w-4 h-4" /> View Full Image</span>
                          </div>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white border-b border-glass-border pb-2 flex items-center gap-2">
                  Participants
                  <span className="bg-glass-strong px-2 py-0.5 rounded-full text-xs font-mono text-pulse-bright">{selectedTeam.members?.length || 0}</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(isEditing ? editedTeam : selectedTeam).members?.map((member: any, idx: number) => (
                    <div key={idx} className={`bg-glass-strong/50 border border-glass-border rounded-[14px] p-5 flex flex-col gap-2 relative ${isEditing ? 'border-pulse/30' : 'hover:border-pulse/50 transition-colors'}`}>
                      <div className="absolute top-4 right-4 z-10 flex gap-2">
                        {member.isLeader && <Badge variant="default">Leader</Badge>}
                        {isEditing && (
                          <button onClick={() => handleRemoveMember(idx)} className="text-danger hover:text-danger/80 bg-danger/10 p-1 rounded-full transition-colors" title="Remove Member">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      
                      {isEditing ? (
                        <div className="space-y-3 mt-4">
                          <div className="flex flex-col gap-1">
                            <label className="text-text-muted text-[10px] uppercase tracking-wider">Name</label>
                            <input className="bg-void/50 border border-glass-border rounded px-2 py-1 text-white text-sm" value={member.name} onChange={e => handleMemberChange(idx, 'name', e.target.value)} />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-text-muted text-[10px] uppercase tracking-wider">Role</label>
                            <input className="bg-void/50 border border-glass-border rounded px-2 py-1 text-white text-sm" value={member.role} onChange={e => handleMemberChange(idx, 'role', e.target.value)} />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-text-muted text-[10px] uppercase tracking-wider">Email</label>
                            <input className="bg-void/50 border border-glass-border rounded px-2 py-1 text-white text-sm" value={member.email} onChange={e => handleMemberChange(idx, 'email', e.target.value)} />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-text-muted text-[10px] uppercase tracking-wider">Phone</label>
                            <input className="bg-void/50 border border-glass-border rounded px-2 py-1 text-white text-sm" value={member.phone} onChange={e => handleMemberChange(idx, 'phone', e.target.value)} />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col gap-1">
                              <label className="text-text-muted text-[10px] uppercase tracking-wider">College</label>
                              <input className="bg-void/50 border border-glass-border rounded px-2 py-1 text-white text-sm" value={member.college} onChange={e => handleMemberChange(idx, 'college', e.target.value)} />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-text-muted text-[10px] uppercase tracking-wider">Sem</label>
                              <input className="bg-void/50 border border-glass-border rounded px-2 py-1 text-white text-sm" value={member.semester} onChange={e => handleMemberChange(idx, 'semester', e.target.value)} />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div className="flex flex-col justify-end pb-1">
                              <label className="flex items-center gap-2 text-white cursor-pointer text-sm">
                                <input 
                                  type="checkbox" 
                                  checked={member.isLeader} 
                                  onChange={e => handleMemberChange(idx, 'isLeader', e.target.checked)}
                                  className="w-4 h-4 rounded border-glass-border bg-void text-pulse focus:ring-pulse"
                                />
                                Leader
                              </label>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="font-bold text-white text-lg pr-16">{member.name}</p>
                          <div className="grid grid-cols-1 gap-y-3 text-sm mt-3">
                            <div>
                              <p className="text-text-muted text-[10px] uppercase tracking-wider mb-0.5">Role</p>
                              <p className="text-text-primary">{member.role}</p>
                            </div>
                            <div>
                              <p className="text-text-muted text-[10px] uppercase tracking-wider mb-0.5">Contact</p>
                              <p className="text-text-primary">{member.phone}</p>
                              <p className="text-text-primary truncate" title={member.email}>{member.email}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <p className="text-text-muted text-[10px] uppercase tracking-wider mb-0.5">College</p>
                                <p className="text-text-primary truncate" title={member.college}>{member.college} (S{member.semester})</p>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
                {isEditing && (
                  <Button variant="secondary" onClick={handleAddMember} className="w-full mt-4 border-dashed border-glass-border hover:border-pulse text-text-muted hover:text-white">
                    <Plus className="w-4 h-4 mr-2" /> Add Participant
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
