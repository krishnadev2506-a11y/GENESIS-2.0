import { MessagesClient } from './MessagesClient';

export const metadata = {
  title: 'Communications | Admin',
};

export default function MessagesPage() {
  return (
    <div className="space-y-8 relative z-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-white tracking-wide uppercase">Communications</h1>
        <p className="text-text-muted font-body text-[16px]">Broadcast messages to teams and participants.</p>
      </div>
      
      <MessagesClient />
    </div>
  );
}
