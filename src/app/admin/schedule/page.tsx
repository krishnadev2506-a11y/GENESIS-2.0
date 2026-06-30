import { ScheduleClient } from './ScheduleClient';

export const metadata = {
  title: 'Schedule Management | Admin',
};

export default function SchedulePage() {
  return (
    <div className="space-y-8 relative z-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-white tracking-wide uppercase">Schedule Manager</h1>
        <p className="text-text-muted font-body text-[16px]">Update and organize the event timeline.</p>
      </div>
      
      <ScheduleClient />
    </div>
  );
}
