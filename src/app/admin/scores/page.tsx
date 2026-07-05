import { ScoresClient } from './ScoresClient';

export const metadata = {
  title: 'Manage Scores | Admin | GENESIS 2.0',
};

export default function AdminScoresPage() {
  return (
    <div className="space-y-8 relative z-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-white tracking-wide uppercase">Score Controller</h1>
        <p className="text-text-muted font-body text-[16px]">Update team points manually and manage the leaderboard.</p>
      </div>
      
      <ScoresClient />
    </div>
  );
}
