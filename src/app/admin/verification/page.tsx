import { VerificationClient } from './VerificationClient';

export const metadata = {
  title: 'Payment Verification | Admin',
};

export default function VerificationPage() {
  return (
    <div className="space-y-8 relative z-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-white tracking-wide uppercase">Payment Verification</h1>
        <p className="text-text-muted font-body text-[16px]">Review and verify team payment screenshots.</p>
      </div>
      
      <VerificationClient />
    </div>
  );
}
