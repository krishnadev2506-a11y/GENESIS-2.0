'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import { getFriendlyErrorMessage } from '@/lib/errors';

export function ScheduleClient() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  
  const [day, setDay] = useState(1);
  const [time, setTime] = useState('');
  const [eventName, setEventName] = useState('');
  const [speaker, setSpeaker] = useState('');
  const [order, setOrder] = useState('');

  const { data: schedule, isLoading } = useQuery({
    queryKey: ['schedule'],
    queryFn: async () => {
      const res = await fetch('/api/schedule');
      if (!res.ok) throw new Error('Failed to fetch schedule');
      return res.json();
    }
  });

  const createMutation = useMutation({
    mutationFn: async (newItem: any) => {
      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });
      if (!res.ok) throw new Error('Failed to add schedule item');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
      success('Success', 'Event added to schedule!');
      setTime(''); setEventName(''); setSpeaker(''); setOrder('');
    },
    onError: (err: Error) => error('Error', getFriendlyErrorMessage(err))
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/schedule/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete schedule item');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
      success('Success', 'Event deleted.');
    },
    onError: (err: Error) => error('Error', getFriendlyErrorMessage(err))
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      day: Number(day),
      time,
      eventName,
      speaker: speaker || null,
      order: Number(order)
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Add Form */}
      <GlassCard className="p-6 lg:col-span-1 h-fit">
        <h2 className="text-xl font-display font-bold text-white mb-6 uppercase">Add Event</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-text-muted mb-1">Day</label>
            <select 
              className="w-full bg-void border border-glass-border rounded-[10px] px-4 py-2 text-white"
              value={day} onChange={(e) => setDay(Number(e.target.value))}
            >
              <option value={1}>Day 1 (July 10)</option>
              <option value={2}>Day 2 (July 11)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-text-muted mb-1">Time</label>
            <input 
              type="text" placeholder="e.g. 10:00 AM" required
              className="w-full bg-void border border-glass-border rounded-[10px] px-4 py-2 text-white"
              value={time} onChange={(e) => setTime(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-text-muted mb-1">Event Name</label>
            <input 
              type="text" placeholder="e.g. Opening Ceremony" required
              className="w-full bg-void border border-glass-border rounded-[10px] px-4 py-2 text-white"
              value={eventName} onChange={(e) => setEventName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-text-muted mb-1">Speaker (Optional)</label>
            <input 
              type="text" placeholder="e.g. John Doe"
              className="w-full bg-void border border-glass-border rounded-[10px] px-4 py-2 text-white"
              value={speaker} onChange={(e) => setSpeaker(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-text-muted mb-1">Sort Order</label>
            <input 
              type="number" placeholder="e.g. 1" required
              className="w-full bg-void border border-glass-border rounded-[10px] px-4 py-2 text-white"
              value={order} onChange={(e) => setOrder(e.target.value)}
            />
          </div>
          <Button type="submit" variant="primary" className="w-full mt-4" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Adding...' : 'Add Event'}
          </Button>
        </form>
      </GlassCard>

      {/* Schedule List */}
      <GlassCard className="p-0 overflow-hidden lg:col-span-2">
        <div className="p-6 border-b border-glass-border bg-glass/30 flex justify-between items-center">
          <h2 className="text-xl font-display font-bold text-white uppercase">Current Schedule</h2>
        </div>
        
        {isLoading ? (
          <div className="py-20 flex justify-center"><LoadingSpinner size="lg" /></div>
        ) : (
          <div className="divide-y divide-glass-border">
            {schedule?.map((item: any) => (
              <div key={item._id} className="p-6 flex items-center justify-between hover:bg-glass/10 transition-colors">
                <div className="flex items-center gap-6">
                  <div className="text-center w-20">
                    <div className="text-xs text-pulse font-mono font-bold">DAY {item.day}</div>
                    <div className="text-xl font-display text-white">{item.time}</div>
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">{item.eventName}</h3>
                    {item.speaker && <p className="text-text-muted text-sm">{item.speaker}</p>}
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  className="text-danger hover:bg-danger/10"
                  onClick={() => deleteMutation.mutate(item._id)}
                  disabled={deleteMutation.isPending}
                >
                  Delete
                </Button>
              </div>
            ))}
            {schedule?.length === 0 && (
              <div className="p-12 text-center text-text-muted">No schedule items found.</div>
            )}
          </div>
        )}
      </GlassCard>

    </div>
  );
}
