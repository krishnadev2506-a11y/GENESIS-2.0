'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export function MessagesClient() {
  const { success, error } = useToast();
  
  const [scope, setScope] = useState('broadcast');
  const [targetParticipantEmail, setTargetParticipantEmail] = useState('');
  const [targetTeamId, setTargetTeamId] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sendEmail, setSendEmail] = useState(false);

  const { data: teamsData, isLoading: isLoadingTeams } = useQuery({
    queryKey: ['teams', 'all'],
    queryFn: async () => {
      const res = await fetch('/api/teams?limit=1000');
      if (!res.ok) throw new Error('Failed to fetch teams');
      return res.json();
    }
  });

  const sendMutation = useMutation({
    mutationFn: async (messageData: any) => {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData)
      });
      if (!res.ok) throw new Error('Failed to send message');
      return res.json();
    },
    onSuccess: () => {
      success('Success', sendEmail ? 'Message sent and email delivered!' : 'Message sent successfully!');
      setSubject(''); setBody(''); setTargetParticipantEmail(''); setTargetTeamId('');
      setSendEmail(false);
    },
    onError: (err: Error) => error('Error', err.message)
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = { scope, subject, body, sendEmail };
    if (scope === 'participant') {
      payload.targetParticipantEmail = targetParticipantEmail;
    } else if (scope === 'team') {
      payload.targetTeamId = targetTeamId;
    }
    sendMutation.mutate(payload);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <GlassCard className="p-8">
        <h2 className="text-2xl font-display font-bold text-white mb-6 uppercase">Compose Message</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm text-text-muted mb-2 uppercase font-mono tracking-wider">Audience</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-white cursor-pointer">
                <input type="radio" name="scope" value="broadcast" checked={scope === 'broadcast'} onChange={() => setScope('broadcast')} className="accent-pulse" />
                Broadcast to All
              </label>
              <label className="flex items-center gap-2 text-white cursor-pointer">
                <input type="radio" name="scope" value="team" checked={scope === 'team'} onChange={() => setScope('team')} className="accent-pulse" />
                Specific Team
              </label>
              <label className="flex items-center gap-2 text-white cursor-pointer">
                <input type="radio" name="scope" value="participant" checked={scope === 'participant'} onChange={() => setScope('participant')} className="accent-pulse" />
                Single Participant
              </label>
            </div>
          </div>

          {scope === 'team' && (
            <div>
              <label className="block text-sm text-text-muted mb-2 uppercase font-mono tracking-wider">Select Team</label>
              {isLoadingTeams ? (
                <div className="text-text-muted text-sm">Loading teams...</div>
              ) : (
                <select 
                  required
                  className="w-full bg-void border border-glass-border rounded-[14px] px-4 py-3 text-white focus:outline-none focus:border-pulse transition-colors"
                  value={targetTeamId} onChange={(e) => setTargetTeamId(e.target.value)}
                >
                  <option value="">-- Choose a Team --</option>
                  {teamsData?.teams?.map((team: any) => (
                    <option key={team._id} value={team._id}>{team.teamName} ({team.email})</option>
                  ))}
                </select>
              )}
            </div>
          )}

          {scope === 'participant' && (
            <div>
              <label className="block text-sm text-text-muted mb-2 uppercase font-mono tracking-wider">Participant Email</label>
              <input 
                type="email" required
                placeholder="participant@example.com"
                className="w-full bg-void border border-glass-border rounded-[14px] px-4 py-3 text-white focus:outline-none focus:border-pulse transition-colors"
                value={targetParticipantEmail} onChange={(e) => setTargetParticipantEmail(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-text-muted mb-2 uppercase font-mono tracking-wider">Subject</label>
            <input 
              type="text" required
              placeholder="Important Update regarding GENESIS 2.0"
              className="w-full bg-void border border-glass-border rounded-[14px] px-4 py-3 text-white focus:outline-none focus:border-pulse transition-colors text-lg font-bold"
              value={subject} onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm text-text-muted mb-2 uppercase font-mono tracking-wider">Message Body</label>
            <textarea 
              required
              rows={8}
              placeholder="Type your message here..."
              className="w-full bg-void border border-glass-border rounded-[14px] px-4 py-3 text-white focus:outline-none focus:border-pulse transition-colors font-body"
              value={body} onChange={(e) => setBody(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 p-4 rounded-[14px] bg-glass border border-glass-border">
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={sendEmail} 
                onChange={(e) => setSendEmail(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-void rounded-full peer peer-checked:bg-pulse transition-colors border border-glass-border peer-checked:border-pulse/50 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-text-muted after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:bg-white"></div>
            </label>
            <div>
              <span className="text-white text-sm font-medium">Also send via Email</span>
              <p className="text-xs text-text-muted mt-0.5">
                {scope === 'broadcast' ? 'Email will be sent to all confirmed teams' : scope === 'team' ? 'Email will be sent to the team\'s primary contact' : 'Email will be sent to the participant'}
              </p>
            </div>
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full text-lg" disabled={sendMutation.isPending}>
            {sendMutation.isPending ? 'Sending...' : 'Send Message'}
          </Button>
        </form>
      </GlassCard>
    </div>
  );
}
