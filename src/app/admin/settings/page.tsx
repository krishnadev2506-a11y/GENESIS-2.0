import { SettingsClient } from './SettingsClient';

export const metadata = {
  title: 'Global Settings | Admin',
};

export default function SettingsPage() {
  return (
    <div className="space-y-8 relative z-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-white tracking-wide uppercase">Global Settings</h1>
        <p className="text-text-muted font-body text-[16px]">Configure event parameters and payment details.</p>
      </div>
      
      <SettingsClient />
    </div>
  );
}
