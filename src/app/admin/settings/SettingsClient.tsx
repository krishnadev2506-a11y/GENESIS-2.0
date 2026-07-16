'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getFriendlyErrorMessage } from '@/lib/errors';

export function SettingsClient() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  
  const [formData, setFormData] = useState({
    registrationOpen: true,
    entryFee: 600,
    extraMemberFee: 125,
    baseTeamSize: 4,
    maxTeamSize: 6,
    qrCodeImageUrl: '',
    rulebookUrl: '',
    rulebookPublicId: '',
    registrationReceivedEmailTemplate: '',
    registrationConfirmedEmailTemplate: ''
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await fetch('/api/settings');
      if (!res.ok) throw new Error('Failed to fetch settings');
      return res.json();
    }
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        registrationOpen: settings.registrationOpen,
        entryFee: settings.entryFee,
        extraMemberFee: settings.extraMemberFee,
        baseTeamSize: settings.baseTeamSize,
        maxTeamSize: settings.maxTeamSize,
        qrCodeImageUrl: settings.qrCodeImageUrl,
        rulebookUrl: settings.rulebookUrl || '',
        rulebookPublicId: settings.rulebookPublicId || '',
        registrationReceivedEmailTemplate: settings.registrationReceivedEmailTemplate || '',
        registrationConfirmedEmailTemplate: settings.registrationConfirmedEmailTemplate || ''
      });
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: async (newData: any) => {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData)
      });
      if (!res.ok) throw new Error('Failed to update settings');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      success('Success', 'Settings updated successfully!');
    },
    onError: (err: Error) => error('Error', getFriendlyErrorMessage(err))
  });

  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      error('Invalid File', 'Only PDF files are allowed for the rulebook.');
      e.target.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      error('File Too Large', 'Maximum file size is 10MB.');
      e.target.value = '';
      return;
    }

    setIsUploading(true);
    try {
      const sigRes = await fetch('/api/cloudinary/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder: 'genesis2.0/misc' })
      });
      
      if (!sigRes.ok) throw new Error('Failed to get upload signature');
      const { timestamp, signature, api_key, cloud_name, folder } = await sigRes.json();

      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('api_key', api_key);
      uploadData.append('timestamp', timestamp.toString());
      uploadData.append('signature', signature);
      uploadData.append('folder', folder);

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`, {
        method: 'POST',
        body: uploadData,
      });

      if (!uploadRes.ok) throw new Error('Failed to upload PDF');
      const result = await uploadRes.json();

      setFormData(prev => ({
        ...prev,
        rulebookUrl: result.secure_url,
        rulebookPublicId: result.public_id
      }));
      success('Uploaded', 'Rulebook PDF uploaded successfully. Remember to Save Configuration!');
    } catch (err: any) {
      error('Upload Failed', err?.message || 'Something went wrong');
    } finally {
      setIsUploading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return <div className="py-20 flex justify-center"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <GlassCard className="p-8">
        <h2 className="text-2xl font-display font-bold text-white mb-6 uppercase">Event Configuration</h2>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Registration Toggle */}
          <div className="flex items-center justify-between p-4 bg-void/50 border border-glass-border rounded-[14px]">
            <div>
              <h3 className="font-bold text-white text-lg">Registration Status</h3>
              <p className="text-text-muted text-sm">Toggle whether new teams can register for the event.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" name="registrationOpen" className="sr-only peer" checked={formData.registrationOpen} onChange={handleChange} />
              <div className="w-14 h-7 bg-void border border-glass-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-text-muted peer-checked:after:bg-pulse after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:border-pulse"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-text-muted mb-2 uppercase font-mono tracking-wider">Base Entry Fee (₹)</label>
              <input 
                type="number" name="entryFee" required
                className="w-full bg-void border border-glass-border rounded-[14px] px-4 py-3 text-white focus:outline-none focus:border-pulse"
                value={formData.entryFee} onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm text-text-muted mb-2 uppercase font-mono tracking-wider">Extra Member Fee (₹)</label>
              <input 
                type="number" name="extraMemberFee" required
                className="w-full bg-void border border-glass-border rounded-[14px] px-4 py-3 text-white focus:outline-none focus:border-pulse"
                value={formData.extraMemberFee} onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm text-text-muted mb-2 uppercase font-mono tracking-wider">Base Team Size</label>
              <input 
                type="number" name="baseTeamSize" required
                className="w-full bg-void border border-glass-border rounded-[14px] px-4 py-3 text-white focus:outline-none focus:border-pulse"
                value={formData.baseTeamSize} onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm text-text-muted mb-2 uppercase font-mono tracking-wider">Max Team Size</label>
              <input 
                type="number" name="maxTeamSize" required
                className="w-full bg-void border border-glass-border rounded-[14px] px-4 py-3 text-white focus:outline-none focus:border-pulse"
                value={formData.maxTeamSize} onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-text-muted mb-2 uppercase font-mono tracking-wider">QR Code URL (Cloudinary)</label>
            <input 
              type="text" name="qrCodeImageUrl"
              placeholder="https://res.cloudinary.com/..."
              className="w-full bg-void border border-glass-border rounded-[14px] px-4 py-3 text-white focus:outline-none focus:border-pulse font-mono text-sm"
              value={formData.qrCodeImageUrl} onChange={handleChange}
            />

            {formData.qrCodeImageUrl && (
              <div className="mt-4 w-48 h-48 bg-void border border-glass-border rounded-[14px] overflow-hidden relative">
                <Image src={formData.qrCodeImageUrl} alt="QR Code Preview" fill className="object-cover" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-text-muted mb-2 uppercase font-mono tracking-wider">Event Rulebook (PDF)</label>
            <div className="bg-void/50 border border-glass-border rounded-[14px] p-4 flex flex-col gap-4">
              {formData.rulebookUrl ? (
                <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10">
                  <span className="text-sm text-white truncate mr-4">
                    Current Rulebook: <a href={formData.rulebookUrl} target="_blank" rel="noreferrer" className="text-accent-primary hover:underline">View PDF</a>
                  </span>
                  <button 
                    type="button" 
                    className="text-danger text-sm hover:underline"
                    onClick={() => setFormData(prev => ({ ...prev, rulebookUrl: '', rulebookPublicId: '' }))}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <span className="text-sm text-text-muted">No rulebook uploaded yet.</span>
              )}
              
              <div className="flex items-center gap-4">
                <input 
                  type="file" 
                  accept="application/pdf"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="block w-full text-sm text-text-muted
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-accent-primary/20 file:text-accent-primary
                    hover:file:bg-accent-primary/30 disabled:opacity-50"
                />
                {isUploading && <LoadingSpinner size="sm" />}
              </div>
            </div>
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Saving...' : 'Save Configuration'}
          </Button>
        </form>
      </GlassCard>

      {/* Email Templates Section */}
      <GlassCard className="p-8 mt-8">
        <h2 className="text-2xl font-display font-bold text-white mb-6 uppercase">Email Templates</h2>
        <p className="text-text-muted text-sm mb-6">
          Use the following variables to inject dynamic content: <br />
          <code className="text-pulse bg-pulse/10 px-2 py-1 rounded">{'{{teamName}}'}</code> 
          <code className="text-pulse bg-pulse/10 px-2 py-1 rounded ml-2">{'{{username}}'}</code> 
          <code className="text-pulse bg-pulse/10 px-2 py-1 rounded ml-2">{'{{password}}'}</code>
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-sm text-text-muted mb-2 uppercase font-mono tracking-wider">Registration Received (Auto-reply)</label>
            <textarea 
              name="registrationReceivedEmailTemplate" 
              rows={6} required
              className="w-full bg-void border border-glass-border rounded-[14px] px-4 py-3 text-white focus:outline-none focus:border-pulse font-body"
              value={formData.registrationReceivedEmailTemplate} onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm text-text-muted mb-2 uppercase font-mono tracking-wider">Payment Verified (Confirmation)</label>
            <textarea 
              name="registrationConfirmedEmailTemplate" 
              rows={8} required
              className="w-full bg-void border border-glass-border rounded-[14px] px-4 py-3 text-white focus:outline-none focus:border-pulse font-body"
              value={formData.registrationConfirmedEmailTemplate} onChange={handleChange}
            />
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Saving Templates...' : 'Save Templates'}
          </Button>
        </form>
      </GlassCard>
    </div>
  );
}
