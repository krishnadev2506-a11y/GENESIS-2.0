import { CheckInClient } from './CheckInClient';

export const metadata = {
  title: 'Check-In | Admin',
};

export default function CheckInPage() {
  return (
    <div className="space-y-8 relative z-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-white tracking-wide uppercase">Check-In Desk</h1>
        <p className="text-text-muted font-body text-[16px]">Manage team arrivals and physical check-ins.</p>
      </div>
      
      <CheckInClient />
    </div>
  );
}
