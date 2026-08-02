'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { m, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { Award, Upload, Send, RefreshCw, X, AlertTriangle, CheckCircle } from 'lucide-react';

const EVENT_ID = 'GENESIS_2.0';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MemberStatus {
  memberIndex: number;
  memberName: string;
  status: 'pending' | 'ready' | 'dispatched' | 'missing';
  dispatchedAt: string | null;
  fileUrl: string | null;
}

interface TeamStatus {
  teamId: string;
  teamName: string;
  members: MemberStatus[];
}

// ─── Per-row state ─────────────────────────────────────────────────────────

interface RowState {
  uploading: boolean;
  uploadResult: {
    newlyUploaded: number;
    alreadyUploaded: number;
    missing: { memberIndex: number; memberName: string }[];
  } | null;
  uploadError: string | null;
  dispatching: boolean;
  dispatchDone: boolean;
  dispatchError: string | null;
  confirmDispatch: boolean;
}

const defaultRowState = (): RowState => ({
  uploading: false,
  uploadResult: null,
  uploadError: null,
  dispatching: false,
  dispatchDone: false,
  dispatchError: null,
  confirmDispatch: false,
});

// ─── Sync New Teams Modal ──────────────────────────────────────────────────

function SyncModal({ onClose }: { onClose: () => void }) {
  const { success, error } = useToast();
  const [creating, setCreating] = useState(false);
  const [createResults, setCreateResults] = useState<any[] | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['certs', 'missing-teams'],
    queryFn: async () => {
      const res = await fetch(
        `/api/admin/certificates/missing-teams?eventId=${EVENT_ID}`
      );
      if (!res.ok) throw new Error('Failed to fetch team status');
      return res.json();
    },
  });

  const handleCreateFolders = async () => {
    const teamIds = data?.teamsWithoutCertificates?.map((t: any) => t.teamId) || [];
    if (teamIds.length === 0) return;

    setCreating(true);
    try {
      const res = await fetch('/api/admin/certificates/create-folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamIds, eventId: EVENT_ID }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      setCreateResults(json.results);
      success('Cloudinary folders created', `${json.results.length} folders ready.`);
    } catch (err: any) {
      error('Error', err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <m.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <m.div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Panel */}
      <m.div
        className="relative z-10 w-full max-w-2xl glass-surface glass-shadow rounded-[24px] p-6 overflow-y-auto max-h-[85vh]"
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display font-bold text-white uppercase tracking-wide">
            Sync New Teams
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-text-muted hover:text-white hover:bg-glass transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {isLoading ? (
          <div className="py-12 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="rounded-[14px] bg-success/10 border border-success/20 p-4 text-center">
                <div className="text-2xl font-display font-bold text-success">
                  {data?.teamsWithCertificates?.length ?? 0}
                </div>
                <div className="text-xs font-mono text-text-muted uppercase tracking-wider mt-1">
                  Have Certificates
                </div>
              </div>
              <div className="rounded-[14px] bg-pending/10 border border-pending/20 p-4 text-center">
                <div className="text-2xl font-display font-bold text-pending">
                  {data?.teamsWithoutCertificates?.length ?? 0}
                </div>
                <div className="text-xs font-mono text-text-muted uppercase tracking-wider mt-1">
                  Need Folders
                </div>
              </div>
            </div>

            {/* Teams without certs */}
            {data?.teamsWithoutCertificates?.length > 0 ? (
              <>
                <div className="mb-3">
                  <div className="text-xs font-mono text-text-muted uppercase tracking-wider mb-2">
                    Teams that need Cloudinary folders
                  </div>
                  <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                    {data.teamsWithoutCertificates.map((team: any) => (
                      <div
                        key={team.teamId}
                        className="flex items-center justify-between px-4 py-3 rounded-[12px] bg-void/60 border border-glass-border"
                      >
                        <span className="font-medium text-white text-sm">{team.teamName}</span>
                        <span className="text-xs text-text-muted font-mono">
                          {team.memberCount} members
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Create results */}
                {createResults && (
                  <div className="mb-4 space-y-1">
                    <div className="text-xs font-mono text-text-muted uppercase tracking-wider mb-2">
                      Results
                    </div>
                    {createResults.map((r: any) => (
                      <div
                        key={r.teamId}
                        className={`flex items-center justify-between px-4 py-2 rounded-[10px] text-sm ${
                          r.status === 'error'
                            ? 'bg-danger/10 border border-danger/20 text-danger'
                            : 'bg-success/10 border border-success/20 text-success'
                        }`}
                      >
                        <span>{r.teamName}</span>
                        <span className="font-mono text-xs">
                          {r.status === 'created'
                            ? '✅ Created'
                            : r.status === 'already_existed'
                            ? '⚙️ Already existed'
                            : `❌ ${r.error}`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  variant="primary"
                  className="w-full mt-2"
                  isLoading={creating}
                  disabled={creating || !!createResults}
                  onClick={handleCreateFolders}
                >
                  <RefreshCw size={16} className="mr-2" />
                  Create Cloudinary Folders for {data.teamsWithoutCertificates.length} Teams
                </Button>
              </>
            ) : (
              <div className="py-8 text-center text-text-muted">
                <CheckCircle className="mx-auto mb-3 text-success" size={32} />
                <p className="font-medium text-white">All teams already have certificates.</p>
                <p className="text-sm mt-1">Nothing to sync.</p>
              </div>
            )}
          </>
        )}
      </m.div>
    </m.div>
  );
}

// ─── Dispatch Confirmation Modal ───────────────────────────────────────────

function DispatchConfirmModal({
  teamName,
  onConfirm,
  onCancel,
}: {
  teamName: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <m.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <m.div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />
      <m.div
        className="relative z-10 w-full max-w-md glass-surface glass-shadow rounded-[24px] p-6"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
            <Send size={18} className="text-success" />
          </div>
          <h2 className="text-lg font-display font-bold text-white">Confirm Dispatch</h2>
        </div>
        <p className="text-text-muted text-sm mb-6">
          Dispatch certificates to{' '}
          <span className="text-white font-bold">{teamName}</span>?{' '}
          They will see their certificates immediately after this action.
        </p>
        <div className="flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" className="flex-1 bg-success border-success/50 shadow-[0_0_20px_rgba(52,211,153,0.3)]" onClick={onConfirm}>
            Dispatch Now
          </Button>
        </div>
      </m.div>
    </m.div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

export function CertificatesClient() {
  const { success, error } = useToast();
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [rowStates, setRowStates] = useState<Record<string, RowState>>({});

  // Load all team certificate status
  const { data: teams, isLoading, refetch } = useQuery<TeamStatus[]>({
    queryKey: ['certs', 'status'],
    queryFn: async () => {
      const res = await fetch(`/api/admin/certificates/status?eventId=${EVENT_ID}`);
      if (!res.ok) throw new Error('Failed to load certificate status');
      return res.json();
    },
  });

  const getRowState = (teamId: string): RowState =>
    rowStates[teamId] ?? defaultRowState();

  const setRowState = useCallback(
    (teamId: string, patch: Partial<RowState>) => {
      setRowStates((prev) => ({
        ...prev,
        [teamId]: { ...(prev[teamId] ?? defaultRowState()), ...patch },
      }));
    },
    []
  );

  // ── Upload handler ──
  const handleUpload = async (team: TeamStatus) => {
    setRowState(team.teamId, {
      uploading: true,
      uploadResult: null,
      uploadError: null,
    });
    try {
      const res = await fetch('/api/admin/certificates/upload-team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: team.teamId,
          teamName: team.teamName,
          eventId: EVENT_ID,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Upload failed');

      setRowState(team.teamId, { uploading: false, uploadResult: json });
      refetch();
    } catch (err: any) {
      setRowState(team.teamId, { uploading: false, uploadError: err.message });
    }
  };

  // ── Dispatch handler ──
  const handleDispatch = async (team: TeamStatus) => {
    setRowState(team.teamId, {
      confirmDispatch: false,
      dispatching: true,
      dispatchError: null,
    });
    try {
      const res = await fetch('/api/admin/certificates/dispatch-team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId: team.teamId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Dispatch failed');

      setRowState(team.teamId, { dispatching: false, dispatchDone: true });
      success('Dispatched', `${json.dispatched} certificates sent to ${team.teamName}`);
      refetch();
    } catch (err: any) {
      setRowState(team.teamId, { dispatching: false, dispatchError: err.message });
    }
  };

  // ── Summary stats ──
  const stats = (teams ?? []).reduce(
    (acc, team) => {
      acc.totalTeams++;
      acc.totalMembers += team.members.length;
      for (const m of team.members) {
        if (m.status === 'ready') acc.ready++;
        else if (m.status === 'dispatched') acc.dispatched++;
        else if (m.status === 'missing') acc.missing++;
        else acc.pending++;
      }
      return acc;
    },
    { totalTeams: 0, totalMembers: 0, ready: 0, dispatched: 0, missing: 0, pending: 0 }
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!teams || teams.length === 0) {
    return (
      <EmptyState
        icon={<Award size={28} />}
        title="No teams found"
        description="Register some teams first, then come back to manage certificates."
      />
    );
  }

  return (
    <>
      {/* ── Sync Modal ── */}
      <AnimatePresence>
        {showSyncModal && (
          <SyncModal onClose={() => setShowSyncModal(false)} />
        )}
      </AnimatePresence>

      {/* ── Dispatch Confirm Modals ── */}
      <AnimatePresence>
        {teams.map((team) => {
          const rs = getRowState(team.teamId);
          return rs.confirmDispatch ? (
            <DispatchConfirmModal
              key={`confirm-${team.teamId}`}
              teamName={team.teamName}
              onConfirm={() => handleDispatch(team)}
              onCancel={() => setRowState(team.teamId, { confirmDispatch: false })}
            />
          ) : null;
        })}
      </AnimatePresence>

      {/* ── Status Summary Bar ── */}
      <GlassCard className="p-0 overflow-hidden" hoverEffect={false}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-x divide-glass-border">
          {[
            { label: 'Total Teams', value: stats.totalTeams, color: 'text-white' },
            { label: 'Total Members', value: stats.totalMembers, color: 'text-white' },
            { label: 'Ready', value: stats.ready, color: 'text-pending' },
            { label: 'Dispatched', value: stats.dispatched, color: 'text-success' },
            { label: 'Pending', value: stats.pending, color: 'text-text-muted' },
            { label: 'Missing', value: stats.missing, color: 'text-danger' },
          ].map((s) => (
            <div key={s.label} className="px-6 py-4 text-center">
              <div className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</div>
              <div className="text-[10px] font-mono text-text-muted uppercase tracking-widest mt-1">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* ── Top Action Bar ── */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">
          <span className="text-pending font-semibold mr-1">⚠</span>
          Upload button requires running the dev server locally.
          Use scripts for production uploads.
        </p>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowSyncModal(true)}
        >
          <RefreshCw size={14} className="mr-2" />
          Sync New Teams
        </Button>
      </div>

      {/* ── Teams Table ── */}
      <GlassCard className="p-0 overflow-hidden" hoverEffect={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-text-primary whitespace-nowrap">
            <thead className="bg-void/40 border-b border-glass-border uppercase font-mono text-[10px] tracking-wider text-text-muted">
              <tr>
                <th className="px-6 py-4">Team Name</th>
                <th className="px-4 py-4 text-center">Members</th>
                <th className="px-4 py-4 text-center">Uploaded</th>
                <th className="px-4 py-4 text-center">Dispatched</th>
                <th className="px-4 py-4 text-center">Missing</th>
                <th className="px-4 py-4 text-center">Upload</th>
                <th className="px-4 py-4 text-center">Dispatch</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => {
                const rs = getRowState(team.teamId);

                const uploaded = team.members.filter(
                  (m) => m.status === 'ready' || m.status === 'dispatched'
                ).length;
                const dispatched = team.members.filter(
                  (m) => m.status === 'dispatched'
                ).length;
                const ready = team.members.filter((m) => m.status === 'ready').length;
                const missing = team.members.filter(
                  (m) => m.status === 'missing' || m.status === 'pending'
                ).length;

                const allDispatched = dispatched === team.members.length && team.members.length > 0;
                const hasReady = ready > 0;

                return (
                  <tr
                    key={team.teamId}
                    className="border-b border-glass-border/50 hover:bg-glass/10 transition-colors"
                  >
                    {/* Team Name */}
                    <td className="px-6 py-4">
                      <div className="font-bold text-white max-w-[200px] truncate" title={team.teamName}>
                        {team.teamName}
                      </div>
                    </td>

                    {/* Members */}
                    <td className="px-4 py-4 text-center font-mono text-text-muted">
                      {team.members.length}
                    </td>

                    {/* Uploaded */}
                    <td className="px-4 py-4 text-center">
                      <span className={uploaded > 0 ? 'text-success font-bold' : 'text-text-muted'}>
                        {uploaded}
                      </span>
                      <span className="text-text-muted">/{team.members.length}</span>
                    </td>

                    {/* Dispatched */}
                    <td className="px-4 py-4 text-center">
                      {dispatched > 0 ? (
                        <Badge variant="success">{dispatched}/{team.members.length}</Badge>
                      ) : (
                        <span className="text-text-muted font-mono">—</span>
                      )}
                    </td>

                    {/* Missing */}
                    <td className="px-4 py-4 text-center">
                      {missing > 0 ? (
                        <Badge variant="danger">{missing}</Badge>
                      ) : (
                        <span className="text-success">✓</span>
                      )}
                    </td>

                    {/* Upload Button */}
                    <td className="px-4 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={rs.uploading}
                          isLoading={rs.uploading}
                          onClick={() => handleUpload(team)}
                        >
                          <Upload size={12} className="mr-1" />
                          Upload
                        </Button>

                        {/* Upload result inline */}
                        {rs.uploadResult && (
                          <div className="text-[11px] font-mono text-center leading-tight mt-1">
                            {rs.uploadResult.newlyUploaded > 0 && (
                              <span className="text-success">↑{rs.uploadResult.newlyUploaded} </span>
                            )}
                            {rs.uploadResult.alreadyUploaded > 0 && (
                              <span className="text-text-muted">·{rs.uploadResult.alreadyUploaded} done </span>
                            )}
                            {rs.uploadResult.missing.length > 0 && (
                              <div>
                                <span className="text-pending">⚠ {rs.uploadResult.missing.length} missing</span>
                                <div className="mt-1 space-y-0.5">
                                  {rs.uploadResult.missing.map((m) => (
                                    <div key={m.memberIndex} className="text-pending/80">
                                      [{m.memberIndex}] {m.memberName}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {rs.uploadError && (
                          <div className="text-[11px] text-danger font-mono max-w-[150px] break-words text-center">
                            <AlertTriangle size={10} className="inline mr-1" />
                            {rs.uploadError}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Dispatch Button */}
                    <td className="px-4 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        {allDispatched || rs.dispatchDone ? (
                          <span className="text-success text-sm font-bold flex items-center gap-1">
                            <CheckCircle size={14} />
                            Done ✓
                          </span>
                        ) : (
                          <Button
                            variant={hasReady ? 'primary' : 'ghost'}
                            size="sm"
                            disabled={!hasReady || rs.dispatching}
                            isLoading={rs.dispatching}
                            title={!hasReady ? 'Upload certificates first' : undefined}
                            onClick={() =>
                              setRowState(team.teamId, { confirmDispatch: true })
                            }
                            className={
                              hasReady
                                ? 'bg-success border-success/50 shadow-[0_0_15px_rgba(52,211,153,0.25)] hover:shadow-[0_0_25px_rgba(52,211,153,0.45)]'
                                : 'opacity-40 cursor-not-allowed'
                            }
                          >
                            <Send size={12} className="mr-1" />
                            Dispatch
                          </Button>
                        )}

                        {rs.dispatchError && (
                          <div className="text-[11px] text-danger font-mono max-w-[150px] break-words text-center">
                            <AlertTriangle size={10} className="inline mr-1" />
                            {rs.dispatchError}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </>
  );
}
