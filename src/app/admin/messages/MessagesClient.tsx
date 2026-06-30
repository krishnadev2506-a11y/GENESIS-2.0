'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export function MessagesClient() {
  const { success, error } = useToast();
  
  const [scope, setScope] = useState('broadcast');
  const [targetParticipantEmail, setTargetParticipantEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

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
      success('Success', 'Message sent successfully!');
      setSubject(''); setBody(''); setTargetParticipantEmail('');
    },
    onError: (err: Error) => error('Error', err.message)
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = { scope, subject, body };
    if (scope === 'participant') {
      payload.targetParticipantEmail = targetParticipantEmail;
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
                <input type="radio" name="scope" value="participant" checked={scope === 'participant'} onChange={() => setScope('participant')} className="accent-pulse" />
                Single Participant
              </label>
            </div>
          </div>

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

          <Button type="submit" variant="primary" size="lg" className="w-full text-lg" disabled={sendMutation.isPending}>
            {sendMutation.isPending ? 'Sending...' : 'Send Message'}
          </Button>
        </form>
      </GlassCard>
    </div>
  );
}
