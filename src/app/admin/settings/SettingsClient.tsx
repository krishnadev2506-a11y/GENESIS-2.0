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
    qrCodeImageUrl: '',
    rulebookUrl: '',
    rulebookPublicId: '',
    registrationReceivedEmailTemplate: '',
    registrationConfirmedEmailTemplate: '',
    
    earlyBirdEnabled: false,
    pricing: {
      team4: { standardPrice: 0, earlyBirdDiscountPercent: 0 },
      team5: { standardPrice: 0, earlyBirdDiscountPercent: 0 },
      team6: { standardPrice: 0, earlyBirdDiscountPercent: 0 },
    },
    
    foodEnabled: true,
    
    themeFoundation: {
      title: '',
      tagline: '',
      description: '',
      releaseDate: '',
      published: false
    },
    themeProfessional: {
      title: '',
      tagline: '',
      description: '',
      releaseDate: '',
      published: false
    }
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await fetch('/api/settings');
      if (!res.ok) throw new Error('Failed to fetch settings');
      return res.json();
    }
  });

  const formatLocalDate = (isoString?: string | null) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '';
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  useEffect(() => {
    if (settings) {
      setFormData({
        registrationOpen: settings.registrationOpen ?? true,
        qrCodeImageUrl: settings.qrCodeImageUrl ?? '',
        rulebookUrl: settings.rulebookUrl ?? '',
        rulebookPublicId: settings.rulebookPublicId ?? '',
        registrationReceivedEmailTemplate: settings.registrationReceivedEmailTemplate ?? '',
        registrationConfirmedEmailTemplate: settings.registrationConfirmedEmailTemplate ?? '',
        
        earlyBirdEnabled: settings.earlyBirdEnabled ?? false,
        pricing: {
          team4: {
            standardPrice: settings.pricing?.team4?.standardPrice ?? 600,
            earlyBirdDiscountPercent: settings.pricing?.team4?.earlyBirdDiscountPercent ?? 20,
          },
          team5: {
            standardPrice: settings.pricing?.team5?.standardPrice ?? 725,
            earlyBirdDiscountPercent: settings.pricing?.team5?.earlyBirdDiscountPercent ?? 20,
          },
          team6: {
            standardPrice: settings.pricing?.team6?.standardPrice ?? 850,
            earlyBirdDiscountPercent: settings.pricing?.team6?.earlyBirdDiscountPercent ?? 20,
          },
        },
        
        foodEnabled: settings.foodEnabled ?? true,
        
        themeFoundation: {
          title: settings.themeFoundation?.title ?? '',
          tagline: settings.themeFoundation?.tagline ?? '',
          description: settings.themeFoundation?.description ?? '',
          releaseDate: formatLocalDate(settings.themeFoundation?.releaseDate),
          published: settings.themeFoundation?.published ?? false,
        },
        themeProfessional: {
          title: settings.themeProfessional?.title ?? '',
          tagline: settings.themeProfessional?.tagline ?? '',
          description: settings.themeProfessional?.description ?? '',
          releaseDate: formatLocalDate(settings.themeProfessional?.releaseDate),
          published: settings.themeProfessional?.published ?? false,
        }
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

  const handleDeepChange = (path: string, value: any) => {
    setFormData(prev => {
      const keys = path.split('.');
      const newState = { ...prev };
      let current: any = newState;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newState;
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const parsedValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : type === 'number' ? Number(value) : value;
    
    if (name.includes('.')) {
      handleDeepChange(name, parsedValue);
    } else {
      setFormData(prev => ({ ...prev, [name]: parsedValue }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      themeFoundation: {
        ...formData.themeFoundation,
        releaseDate: formData.themeFoundation.releaseDate ? new Date(formData.themeFoundation.releaseDate).toISOString() : null
      },
      themeProfessional: {
        ...formData.themeProfessional,
        releaseDate: formData.themeProfessional.releaseDate ? new Date(formData.themeProfessional.releaseDate).toISOString() : null
      }
    };
    updateMutation.mutate(payload);
  };

  const renderPricingRow = (teamSize: 'team4' | 'team5' | 'team6', label: string) => {
    const p = formData.pricing[teamSize];
    const ebPrice = p.standardPrice - (p.standardPrice * (p.earlyBirdDiscountPercent / 100));
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-end bg-void/30 p-4 border border-glass-border rounded-[14px]">
        <div>
          <label className="block text-sm text-text-muted mb-2 uppercase font-mono tracking-wider">{label} - Standard Price (₹)</label>
          <input 
            type="number" name={`pricing.${teamSize}.standardPrice`} required min="0"
            className="w-full bg-void border border-glass-border rounded-[14px] px-4 py-3 text-white focus:outline-none focus:border-pulse"
            value={p.standardPrice} onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-sm text-text-muted mb-2 uppercase font-mono tracking-wider">Early Bird Discount (%)</label>
          <input 
            type="number" name={`pricing.${teamSize}.earlyBirdDiscountPercent`} required min="0" max="100" step="any"
            className="w-full bg-void border border-glass-border rounded-[14px] px-4 py-3 text-white focus:outline-none focus:border-pulse"
            value={p.earlyBirdDiscountPercent} onChange={handleChange}
          />
        </div>
        <div className="pb-3 text-pulse font-bold text-lg h-full flex items-center">
          Early Bird Price: ₹{Math.round(ebPrice)}
        </div>
      </div>
    );
  };

  const renderThemeSection = (trackKey: 'themeFoundation' | 'themeProfessional', titlePrefix: string) => {
    const t = formData[trackKey];
    return (
      <GlassCard className="p-8">
        <h2 className="text-2xl font-display font-bold text-white mb-6 uppercase">Theme Release — {titlePrefix}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm text-text-muted mb-2 uppercase font-mono tracking-wider">Title</label>
            <input 
              type="text" name={`${trackKey}.title`} required
              className="w-full bg-void border border-glass-border rounded-[14px] px-4 py-3 text-white focus:outline-none focus:border-pulse"
              value={t.title} onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm text-text-muted mb-2 uppercase font-mono tracking-wider">Tagline</label>
            <input 
              type="text" name={`${trackKey}.tagline`} required
              className="w-full bg-void border border-glass-border rounded-[14px] px-4 py-3 text-white focus:outline-none focus:border-pulse"
              value={t.tagline} onChange={handleChange}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-text-muted mb-2 uppercase font-mono tracking-wider">Description</label>
            <textarea 
              name={`${trackKey}.description`} rows={4} required
              className="w-full bg-void border border-glass-border rounded-[14px] px-4 py-3 text-white focus:outline-none focus:border-pulse font-body"
              value={t.description} onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm text-text-muted mb-2 uppercase font-mono tracking-wider">Release Date</label>
            <input 
              type="datetime-local" name={`${trackKey}.releaseDate`}
              className="w-full bg-void border border-glass-border rounded-[14px] px-4 py-3 text-white focus:outline-none focus:border-pulse [color-scheme:dark]"
              value={t.releaseDate} onChange={handleChange}
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-void/50 border border-glass-border rounded-[14px]">
          <div>
            <h3 className="font-bold text-white text-lg">Published Status</h3>
            <p className="text-text-muted text-sm">Toggle whether this theme is publicly visible.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" name={`${trackKey}.published`} className="sr-only peer" checked={t.published} onChange={handleChange} />
            <div className="w-14 h-7 bg-void border border-glass-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-text-muted peer-checked:after:bg-pulse after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:border-pulse"></div>
          </label>
        </div>

        <div className="mt-6 border border-glass-border p-6 rounded-[14px] bg-void/50">
          <h4 className="text-sm text-text-muted uppercase font-mono mb-4">Live Preview</h4>
          <div className="text-center space-y-3">
            <h3 className="text-3xl font-display font-bold text-white">{t.title || 'Untitled Theme'}</h3>
            <p className="text-pulse text-lg font-mono">{t.tagline || 'No Tagline'}</p>
            <p className="text-text-muted max-w-2xl mx-auto">{t.description || 'No description provided.'}</p>
            {t.releaseDate && <p className="text-sm text-text-muted mt-2">Releasing: {new Date(t.releaseDate).toLocaleString()}</p>}
            {!t.published && <span className="inline-block mt-2 px-3 py-1 bg-void border border-glass-border rounded-full text-xs text-text-muted">Draft (Unpublished)</span>}
            {t.published && <span className="inline-block mt-2 px-3 py-1 bg-pulse/20 border border-pulse rounded-full text-xs text-pulse-bright">Published</span>}
          </div>
        </div>
      </GlassCard>
    );
  };

  if (isLoading) {
    return <div className="py-20 flex justify-center"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Event Configuration */}
        <GlassCard className="p-8">
          <h2 className="text-2xl font-display font-bold text-white mb-6 uppercase">Event Configuration</h2>
          
          <div className="space-y-8">
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
                      Current Rulebook: <a href={formData.rulebookUrl} target="_blank" rel="noreferrer" className="text-pulse hover:underline">View PDF</a>
                    </span>
                    <button 
                      type="button" 
                      className="text-red-400 text-sm hover:underline"
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
                      file:bg-pulse/20 file:text-pulse
                      hover:file:bg-pulse/30 disabled:opacity-50"
                  />
                  {isUploading && <LoadingSpinner size="sm" />}
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Pricing */}
        <GlassCard className="p-8">
          <h2 className="text-2xl font-display font-bold text-white mb-6 uppercase">Pricing</h2>
          
          <div className="flex items-center justify-between p-4 bg-void/50 border border-glass-border rounded-[14px] mb-8">
            <div>
              <h3 className="font-bold text-white text-lg">Early Bird Pricing</h3>
              <p className="text-text-muted text-sm">Enable early bird discounts for registrations.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" name="earlyBirdEnabled" className="sr-only peer" checked={formData.earlyBirdEnabled} onChange={handleChange} />
              <div className="w-14 h-7 bg-void border border-glass-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-text-muted peer-checked:after:bg-pulse after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:border-pulse"></div>
            </label>
          </div>

          <div className="space-y-6">
            {renderPricingRow('team4', 'Team of 4')}
            {renderPricingRow('team5', 'Team of 5')}
            {renderPricingRow('team6', 'Team of 6')}
          </div>
        </GlassCard>

        {/* Food Settings */}
        <GlassCard className="p-8">
          <h2 className="text-2xl font-display font-bold text-white mb-6 uppercase">Food Settings</h2>
          
          <div className="flex items-center justify-between p-4 bg-void/50 border border-glass-border rounded-[14px]">
            <div>
              <h3 className="font-bold text-white text-lg">Food Available for Event</h3>
              <p className="text-text-muted text-sm">Toggle whether food passes can be purchased by participants.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" name="foodEnabled" className="sr-only peer" checked={formData.foodEnabled} onChange={handleChange} />
              <div className="w-14 h-7 bg-void border border-glass-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-text-muted peer-checked:after:bg-pulse after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:border-pulse"></div>
            </label>
          </div>
        </GlassCard>

        {/* Theme Releases */}
        {renderThemeSection('themeFoundation', 'Foundation Track')}
        {renderThemeSection('themeProfessional', 'Professional Track')}

        {/* Email Templates Section */}
        <GlassCard className="p-8">
          <h2 className="text-2xl font-display font-bold text-white mb-6 uppercase">Email Templates</h2>
          <p className="text-text-muted text-sm mb-6">
            Use the following variables to inject dynamic content: <br />
            <code className="text-pulse bg-pulse/10 px-2 py-1 rounded">{'{{teamName}}'}</code> 
            <code className="text-pulse bg-pulse/10 px-2 py-1 rounded ml-2">{'{{username}}'}</code> 
            <code className="text-pulse bg-pulse/10 px-2 py-1 rounded ml-2">{'{{password}}'}</code>
          </p>

          <div className="space-y-8">
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
          </div>
        </GlassCard>
        
        {/* Sticky Save Button */}
        <div className="sticky bottom-6 z-10 flex justify-end">
          <Button 
            type="submit" 
            variant="primary" 
            size="lg" 
            disabled={updateMutation.isPending}
            className="w-full md:w-auto shadow-2xl shadow-pulse/20 px-10 py-4 text-lg"
          >
            {updateMutation.isPending ? 'Saving All Changes...' : 'Save All Settings'}
          </Button>
        </div>

      </form>
    </div>
  );
}
