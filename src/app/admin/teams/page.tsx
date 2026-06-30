import { ExportParticipantsButtons } from '@/components/admin/ExportParticipantsButtons';
import { TeamsClient } from './TeamsClient';

export const metadata = {
  title: 'Teams Management | Admin',
};

export default function TeamsPage() {
  return (
    <div className="space-y-8 relative z-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white tracking-wide uppercase">Teams Management</h1>
          <p className="text-text-muted font-body text-[16px]">View and manage all registered teams.</p>
        </div>
        <ExportParticipantsButtons />
      </div>
      
      <TeamsClient />
    </div>
  );
}
