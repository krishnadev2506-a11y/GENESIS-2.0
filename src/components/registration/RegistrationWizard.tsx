'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { m, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SegmentedToggle } from '@/components/ui/SegmentedToggle';
import { useToast } from '@/components/ui/Toast';
import { slideLeft, slideRight } from '@/lib/motion-variants';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { AlertError } from '@/components/ui/AlertError';
import { getFriendlyErrorMessage } from '@/lib/errors';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const step1Schema = z.object({
  teamName: z.string().min(2, "Team name must be at least 2 characters").max(50),
});

const memberSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^[0-9]{10}$/, 'Invalid phone number (10 digits)').optional().or(z.literal('')),
  college: z.string().optional().or(z.literal('')),
  semester: z.string().optional().or(z.literal('')),
  foodPreference: z.enum(['veg', 'non-veg']).optional(),
});


import imageCompression from 'browser-image-compression';

export function RegistrationWizard() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [direction, setDirection] = useState(1);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const { success } = useToast();
  const router = useRouter();
  const [uploadProgress, setUploadProgress] = useState(0);

  const [settings, setSettings] = useState<any>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [qrCodeLoaded, setQrCodeLoaded] = useState(true);
  const [qrCodeFailed, setQrCodeFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadSettings() {
      try {
        const response = await fetch('/api/settings/public', { signal: controller.signal });
        const contentType = response.headers.get('content-type') || '';

        if (!response.ok || !contentType.includes('application/json')) {
          throw new Error('Registration details are temporarily unavailable.');
        }

        setSettings(await response.json());
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setSettingsError('We could not load the registration details. Please refresh the page and try again.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setSettingsLoading(false);
        }
      }
    }

    loadSettings();
    return () => controller.abort();
  }, []);

  // Basic state for the form
  const [formData, setFormData] = useState({
    teamName: '',
    route: 'foundation',
    participantCount: 4,
    foodRequired: true,
    members: Array.from({ length: 4 }).map((_, i) => ({ 
      name: '', 
      role: i === 0 ? 'Leader' : 'Member', 
      email: '', 
      phone: '',
      college: '',
      semester: '',
      foodPreference: 'veg',
      isLeader: i === 0
    })),
    paymentScreenshotUrl: '',
    paymentScreenshotPublicId: '',
    transactionId: '',
  });

  const nextStep = () => {
    setFormError(null);
    // Validate current step before proceeding
    if (step === 1) {
      try {
        step1Schema.parse({ teamName: formData.teamName });
      } catch (err: any) {
        setFormError(getFriendlyErrorMessage(err.errors?.[0]?.message || err.message || 'Invalid input'));
        return;
      }
      
      // Resize members array if participantCount changed
      setFormData(prev => {
        let newMembers = [...prev.members];
        if (newMembers.length < prev.participantCount) {
          const toAdd = prev.participantCount - newMembers.length;
          for (let i = 0; i < toAdd; i++) {
            newMembers.push({
              name: '', role: 'Member', email: '', phone: '',
              college: '', semester: '', foodPreference: 'veg', isLeader: false
            });
          }
        } else if (newMembers.length > prev.participantCount) {
          newMembers = newMembers.slice(0, prev.participantCount);
          // ensure there's still a leader if the leader was removed
          if (!newMembers.some(m => m.isLeader)) {
            newMembers[0].isLeader = true;
            newMembers[0].role = 'Leader';
          }
        }
        return { ...prev, members: newMembers };
      });
    }

    if (step === 2) {
      const leaderCount = formData.members.filter(m => m.isLeader).length;
      if (leaderCount !== 1) {
        setFormError('Every team needs exactly one designated Team Leader. Please select one.');
        return;
      }

      for (let i = 0; i < formData.members.length; i++) {
        try {
          const member = formData.members[i];
          if (member.isLeader) {
            if (!member.phone || !member.phone.match(/^[0-9]{10}$/)) throw new Error("Leader must provide a valid 10-digit phone number");
            if (!member.college) throw new Error("Leader must provide a college name");
          }
          memberSchema.parse(formData.members[i]);
        } catch (err: any) {
          setFormError(`Participant ${i + 1}: ${getFriendlyErrorMessage(err.errors?.[0]?.message || err.message)}`);
          return;
        }
      }
    }
    
    setDirection(1);
    setStep((prev) => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setFormError(null);
    setDirection(-1);
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const updateMember = (index: number, field: string, value: any) => {
    const newMembers = [...formData.members];
    newMembers[index] = { ...newMembers[index], [field]: value };
    setFormData({ ...formData, members: newMembers });
  };

  const setLeader = (index: number) => {
    const newMembers = formData.members.map((m, i) => ({
      ...m,
      isLeader: i === index,
      role: i === index ? 'Leader' : 'Member'
    }));
    setFormData({ ...formData, members: newMembers });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // --- Client-side validation before hitting the server ---
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB raw limit

    if (!ALLOWED_TYPES.includes(file.type)) {
      setFormError('Only JPG, PNG, WebP or GIF images are accepted as payment screenshots.');
      e.target.value = ''; // Reset the input
      return;
    }

    if (file.size > MAX_FILE_BYTES) {
      setFormError('The image is too large (max 10 MB). Please compress it and try again.');
      e.target.value = '';
      return;
    }

    setIsLoading(true);
    setFormError(null);
    try {
      // Compress aggressively — 300 KB is plenty for a payment screenshot
      const options = {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 800,
        initialQuality: 0.7,
        useWebWorker: true,
        fileType: 'image/jpeg' as const,
      };
      const compressedFile = await imageCompression(file, options);

      const sigRes = await fetch('/api/cloudinary/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder: 'genesis2.0/payments' })
      });
      
      if (!sigRes.ok) {
        if (sigRes.status === 401) throw new Error('Your session has expired. Please refresh the page and try again.');
        throw new Error('Failed to get upload signature');
      }
      const { timestamp, signature, api_key, cloud_name, folder } = await sigRes.json();

      const uploadData = new FormData();
      uploadData.append('file', compressedFile);
      uploadData.append('api_key', api_key);
      uploadData.append('timestamp', timestamp.toString());
      uploadData.append('signature', signature);
      uploadData.append('folder', folder);

      setUploadProgress(1); // Start progress

      const result = await new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`);
        
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percentComplete);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error('Failed to upload image'));
          }
        };

        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.send(uploadData);
      });

      setUploadProgress(0);

      setFormData(prev => ({
        ...prev,
        paymentScreenshotUrl: result.secure_url,
        paymentScreenshotPublicId: result.public_id
      }));
      setFormError(null);
      success('Uploaded', 'Payment screenshot uploaded successfully.');
    } catch (err: any) {
      setFormError(err?.message || getFriendlyErrorMessage('Failed to upload'));
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!formData.transactionId || !formData.paymentScreenshotUrl) {
      setFormError('Please upload a payment screenshot and enter the transaction ID.');
      return;
    }

    // Extract leader details to satisfy global team properties
    const leader = formData.members.find(m => m.isLeader) || formData.members[0];

    const submissionPayload = {
      teamName: formData.teamName,
      route: formData.route,
      foodRequired: formData.foodRequired,
      college: leader.college,
      semester: leader.semester,
      contactNumber: leader.phone,
      email: leader.email,
      members: formData.members.map(m => {
        const { foodPreference, ...rest } = m;
        return (formData.foodRequired && settings?.foodEnabled) 
          ? { ...rest, foodPreference } 
          : rest;
      }),
      paymentScreenshotUrl: formData.paymentScreenshotUrl,
      paymentScreenshotPublicId: formData.paymentScreenshotPublicId,
      transactionId: formData.transactionId,
    };

    setIsLoading(true);
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionPayload),
      });

      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json')
        ? await response.json()
        : null;

      if (response.ok) {
        setSubmitted(true);
      } else {
        setFormError(getFriendlyErrorMessage(data?.error || 'The server returned an unexpected response. Please try again.'));
      }
    } catch (err: any) {
      console.error('Submission error:', err);
      setFormError(getFriendlyErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const getPricingDetails = () => {
    if (!settings?.pricing) return { originalPrice: 0, finalPrice: 0, discount: 0 };
    const teamKey = `team${formData.participantCount}`;
    const pricing = settings.pricing[teamKey];
    if (!pricing) return { originalPrice: 0, finalPrice: 0, discount: 0 };
    
    // Choose base price depending on whether food is required and enabled
    const isFoodSelected = formData.foodRequired && settings?.foodEnabled;
    const basePrice = isFoodSelected ? pricing.withFoodPrice : pricing.withoutFoodPrice;

    let finalPrice = basePrice;
    if (settings.earlyBirdEnabled) {
      finalPrice = Math.round(basePrice * (1 - pricing.earlyBirdDiscountPercent / 100));
    }
    
    return {
      originalPrice: basePrice,
      finalPrice,
      discount: basePrice - finalPrice
    };
  };

  const pricingInfo = getPricingDetails();

  const variants = direction === 1 ? slideLeft : slideRight;

  if (settingsLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto flex justify-center mt-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (settingsError) {
    return (
      <div className="w-full max-w-4xl mx-auto mt-12">
        <GlassCard className="max-w-md mx-auto p-8 text-center">
          <h2 className="mb-4 text-2xl font-display font-bold text-white">Unable to Load Registration</h2>
          <p className="text-text-muted">{settingsError}</p>
        </GlassCard>
      </div>
    );
  }

  if (settings && settings.registrationOpen === false) {
    return (
      <div className="w-full max-w-4xl mx-auto text-center mt-12">
        <GlassCard className="p-8 max-w-md mx-auto">
          <h2 className="text-2xl font-display font-bold text-white mb-4">Registration Closed</h2>
          <p className="text-text-muted">We are currently not accepting new registrations. Please check back later.</p>
        </GlassCard>
      </div>
    );
  }

  if (submitted) {
    return (
      <m.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl mx-auto"
      >
        <div className="rounded-[28px] border border-success/30 bg-success/5 p-10 text-center space-y-6">
          {/* Checkmark icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-success/15 border border-success/30 flex items-center justify-center">
              <svg className="w-10 h-10 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-display font-bold text-white mb-2">Thank you for registering!</h2>
            <p className="text-text-muted text-lg">Your team has been successfully registered for GENESIS 2.0.</p>
          </div>

          {/* Spam warning banner */}
          <div className="rounded-2xl border border-[#F59E0B]/30 bg-[#F59E0B]/10 p-5 text-left flex gap-4 items-start">
            <div className="mt-0.5 shrink-0">
              <svg className="w-6 h-6 text-[#F59E0B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-[#F59E0B] mb-1">Please check your email</p>
              <p className="text-sm text-[#FCD34D]/80 leading-relaxed">
                We have sent a confirmation email to the Team Leader. If you don&apos;t see it in your inbox within a few minutes, please check your <strong>Spam</strong> or <strong>Junk</strong> folder and mark it as &quot;Not Spam&quot; for future updates!
              </p>
            </div>
          </div>

          <div className="space-y-3 text-sm text-text-muted">
            <p>📋 Your registration is under review by the organizing team.</p>
            <p>✅ Once your payment is verified, you&apos;ll receive login credentials via email.</p>
            <p>📅 The event is on <strong className="text-white">7,8 AUGUST</strong>.</p>
          </div>

          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-pulse/20 border border-pulse/40 text-white hover:bg-pulse/30 transition-colors font-medium"
          >
            Back to Home
          </button>
        </div>
      </m.div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8 relative">
        <div className="flex justify-between mb-2">
          {['Team Name', 'Members', 'Payment'].map((label, i) => (
            <span key={i} className={`text-sm font-medium ${step >= i + 1 ? 'text-accent-primary' : 'text-text-muted'}`}>
              {label}
            </span>
          ))}
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <m.div 
            className="h-full bg-accent-primary"
            initial={{ width: `${((step - 1) / 3) * 100}%` }}
            animate={{ width: `${(step / 3) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <GlassCard hoverEffect={true} className="relative min-h-[auto] md:min-h-[400px] max-w-2xl mx-auto min-w-0 overflow-hidden">
        <AlertError error={formError} title="Registration Error" />
        
        <AnimatePresence mode="wait" custom={direction}>
          {step === 1 && (
            <m.div
              key="step1"
              custom={direction}
              variants={variants as any}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              <h2 className="text-2xl font-display font-bold text-white mb-6 text-center">Create Your Team</h2>
              <div className="space-y-6 max-w-sm mx-auto">
                <Input
                  label="Team Name"
                  required
                  value={formData.teamName}
                  onChange={(e) => setFormData({...formData, teamName: e.target.value})}
                  placeholder="e.g. Byte Benders"
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary block">Track</label>
                  <SegmentedToggle
                    options={[
                      { label: 'Foundation (2nd/3rd Yr)', value: 'foundation' },
                      { label: 'Professional (4th Yr)', value: 'professional' }
                    ]}
                    value={formData.route}
                    onChange={(val) => setFormData({ ...formData, route: val as 'foundation' | 'professional' })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-text-primary block mb-2">Number of Participants</label>
                  <select 
                    className="w-full bg-void border border-glass-border rounded-[14px] px-4 py-3 text-white focus:outline-none focus:border-pulse transition-colors"
                    value={formData.participantCount}
                    onChange={(e) => setFormData({...formData, participantCount: Number(e.target.value)})}
                  >
                    <option value={4}>4 Members</option>
                    <option value={5}>5 Members</option>
                    <option value={6}>6 Members</option>
                  </select>
                </div>

                {settings?.foodEnabled && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-primary block">Food required for your team?</label>
                    <SegmentedToggle
                      options={[
                        { label: 'Yes', value: 'yes' },
                        { label: 'No', value: 'no' }
                      ]}
                      value={formData.foodRequired ? 'yes' : 'no'}
                      onChange={(val) => setFormData({ ...formData, foodRequired: val === 'yes' })}
                    />
                  </div>
                )}
              </div>
            </m.div>
          )}

          {step === 2 && (
            <m.div
              key="step2"
              custom={direction}
              variants={variants as any}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-display font-bold text-white">Team Members ({formData.participantCount})</h2>
              </div>
              <p className="text-text-muted text-sm mb-6">Please designate one person as the Team Leader. Login credentials will be sent to their email.</p>
              
              <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-2">
                {formData.members.map((member, index) => (
                  <div key={index} className={`p-6 rounded-2xl border ${member.isLeader ? 'border-pulse bg-pulse/10' : 'border-white/10 bg-white/[0.02]'}`}>
                    <div className="flex justify-between items-center mb-6">
                      <h4 className={`font-bold ${member.isLeader ? 'text-pulse' : 'text-white'}`}>
                        Participant {index + 1}
                      </h4>
                      <label className="flex items-center gap-2 cursor-pointer text-sm">
                        <input 
                          type="radio" 
                          name="teamLeader" 
                          checked={member.isLeader}
                          onChange={() => setLeader(index)}
                          className="accent-pulse w-4 h-4"
                        />
                        <span className={member.isLeader ? 'text-white font-bold' : 'text-text-muted'}>Team Leader</span>
                      </label>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        placeholder="Full Name"
                        value={member.name}
                        onChange={(e) => updateMember(index, 'name', e.target.value)}
                        required
                        autoComplete="name"
                      />
                      <Input
                        placeholder="Email Address"
                        type="email"
                        value={member.email}
                        onChange={(e) => updateMember(index, 'email', e.target.value)}
                        required
                        autoComplete="email"
                      />
                      {member.isLeader && (
                        <>
                          <Input
                            placeholder="Phone Number"
                            type="tel"
                            value={member.phone}
                            onChange={(e) => updateMember(index, 'phone', e.target.value)}
                            required
                            autoComplete="tel"
                          />
                          <Input
                            placeholder="College"
                            value={member.college}
                            onChange={(e) => updateMember(index, 'college', e.target.value)}
                            required
                          />
                        </>
                      )}
                    </div>
                    
                    {formData.foodRequired && settings?.foodEnabled && (
                      <div className="mt-4 max-w-[200px]">
                        <label className="text-sm font-medium text-text-primary block mb-2">Food Preference</label>
                        <SegmentedToggle
                          options={[
                            { label: 'Veg', value: 'veg' },
                            { label: 'Non-Veg', value: 'non-veg' }
                          ]}
                          value={member.foodPreference || 'veg'}
                          onChange={(val) => updateMember(index, 'foodPreference', val)}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </m.div>
          )}

          {step === 3 && (
            <m.div
              key="step3"
              custom={direction}
              variants={variants as any}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              <h2 className="text-2xl font-display font-bold text-white mb-6">Payment Details</h2>
              
              <div className="bg-white/5 p-6 rounded-2xl border border-white/10 mb-8 relative">
                {settings?.earlyBirdEnabled && (
                  <div className="absolute -top-3 -right-3 bg-pulse text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg border border-pulse-bright/50">
                    Early Bird Active!
                  </div>
                )}
                <h3 className="font-semibold text-lg mb-4">Fee Summary</h3>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-text-muted">Registration ({formData.participantCount} Members)</span>
                  <span className="text-white font-mono">
                    {settings?.earlyBirdEnabled && (
                      <span className="line-through text-text-muted mr-3">₹{pricingInfo.originalPrice}</span>
                    )}
                    ₹{pricingInfo.finalPrice}
                  </span>
                </div>
                <div className="flex justify-between py-3 font-bold text-lg">
                  <span className="text-pulse">Total Amount</span>
                  <span className="text-pulse font-mono">₹{pricingInfo.finalPrice}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold mb-2">Scan to Pay</h4>
                  <div className="relative mb-4 flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-white/20 bg-white/10 p-4">
                    {settings?.qrCodeImageUrl && !qrCodeFailed ? (
                      <Image
                        src={settings.qrCodeImageUrl}
                        alt="Payment QR Code"
                        fill
                        priority
                        sizes="(max-width: 767px) calc(100vw - 3rem), 384px"
                        className="object-contain p-4"
                        unoptimized
                        onLoadingComplete={() => setQrCodeLoaded(true)}
                        onError={() => {
                          console.error('QR Code image failed to load:', settings.qrCodeImageUrl);
                          setQrCodeFailed(true);
                        }}
                      />
                    ) : qrCodeFailed ? (
                      <div className="flex flex-col items-center justify-center h-full gap-2">
                        <svg className="w-12 h-12 text-text-muted opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4v2m0 4v2M4 12a8 8 0 1116 0 8 8 0 01-16 0z" />
                        </svg>
                        <span className="text-center text-text-muted text-sm">QR Code unavailable</span>
                      </div>
                    ) : (
                      <span className="text-text-muted">No QR Code configured</span>
                    )}
                  </div>
                  {settings?.upiId && (
                    <p className="text-sm font-mono text-center text-accent-secondary mb-2 bg-void/50 py-2 rounded-lg border border-glass-border">
                      UPI ID: <span className="font-bold text-white">{settings.upiId}</span>
                    </p>
                  )}
                  {settings?.adminContactNumber && (
                    <p className="text-xs text-text-muted text-center">
                      Facing issues? Contact Admin: {settings.adminContactNumber}
                    </p>
                  )}
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-text-primary block mb-2">Upload Payment Screenshot *</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="block w-full text-sm text-text-muted
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-accent-primary/20 file:text-accent-primary
                        hover:file:bg-accent-primary/30"
                    />
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="w-full h-2 bg-white/10 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-accent-primary transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                      </div>
                    )}
                    {formData.paymentScreenshotUrl && <p className="text-success text-xs mt-2">File uploaded successfully.</p>}
                  </div>
                  
                  <Input
                    label="Transaction / Reference ID"
                    required
                    value={formData.transactionId}
                    onChange={(e) => setFormData({...formData, transactionId: e.target.value})}
                    placeholder="Enter 12-digit UTR"
                  />
                </div>
              </div>
            </m.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="mt-10 flex justify-between pt-6 border-t border-white/10">
          {step > 1 ? (
            <Button variant="ghost" onClick={prevStep}>
              Back
            </Button>
          ) : (
            <div></div> // empty spacer
          )}
          
          {step < 3 ? (
            <Button variant="primary" onClick={nextStep}>
              Next Step
            </Button>
          ) : (
            <Button variant="primary" onClick={handleSubmit} isLoading={isLoading}>
              Submit Registration
            </Button>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
