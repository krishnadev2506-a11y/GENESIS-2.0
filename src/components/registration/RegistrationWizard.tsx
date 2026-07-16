'use client';

import { useState } from 'react';
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

const step1Schema = z.object({
  teamName: z.string().min(2, "Team name must be at least 2 characters").max(50),
});

const memberSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^[0-9]{10}$/, 'Invalid phone number (10 digits)').optional().or(z.literal('')),
  college: z.string().optional().or(z.literal('')),
  semester: z.string().optional().or(z.literal('')),
});


import imageCompression from 'browser-image-compression';

export function RegistrationWizard() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [direction, setDirection] = useState(1);
  const [formError, setFormError] = useState<string | null>(null);
  const { success } = useToast();
  const router = useRouter();
  const [uploadProgress, setUploadProgress] = useState(0);

  // Basic state for the form
  const [formData, setFormData] = useState({
    teamName: '',
    participantCount: 4,
    members: Array.from({ length: 4 }).map((_, i) => ({ 
      name: '', 
      role: i === 0 ? 'Leader' : 'Member', 
      email: '', 
      phone: '',
      college: '',
      semester: '',
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
              college: '', semester: '', isLeader: false
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
        maxWidthOrHeight: 1280,
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
      college: leader.college,
      semester: leader.semester,
      contactNumber: leader.phone,
      email: leader.email,
      foodPreference: leader.foodPreference,
      members: formData.members,
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

      const data = await response.json();

      if (response.ok) {
        success('Registration submitted!', 'Your team is registered. Wait for verification email.');
        setTimeout(() => router.push('/'), 2000);
      } else {
        setFormError(getFriendlyErrorMessage(data.error || 'Unknown error during registration'));
      }
    } catch (err: any) {
      console.error('Submission error:', err);
      setFormError(getFriendlyErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const variants = direction === 1 ? slideLeft : slideRight;

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

      <GlassCard hoverEffect={true} className="overflow-hidden relative min-h-[400px] max-w-2xl mx-auto">
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
              
              <div className="bg-white/5 p-6 rounded-2xl border border-white/10 mb-8">
                <h3 className="font-semibold text-lg mb-4">Fee Summary</h3>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-text-muted">Base Entry (4 Members)</span>
                  <span className="text-white font-mono">₹600</span>
                </div>
                {formData.participantCount > 4 && (
                  <div className="flex justify-between py-2 border-b border-white/10">
                    <span className="text-text-muted">Extra Members ({formData.participantCount - 4} × ₹125)</span>
                    <span className="text-white font-mono">₹{(formData.participantCount - 4) * 125}</span>
                  </div>
                )}
                <div className="flex justify-between py-3 font-bold text-lg">
                  <span className="text-pulse">Total Amount</span>
                  <span className="text-pulse font-mono">₹{600 + (formData.participantCount - 4) * 125}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold mb-2">Scan to Pay</h4>
                  <div className="w-full aspect-square bg-white/10 rounded-xl flex items-center justify-center border-2 border-dashed border-white/20 mb-4">
                    <span className="text-text-muted">QR Code from Settings</span>
                  </div>
                  <p className="text-xs text-text-muted">Or pay via UPI ID: example@upi</p>
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
