import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function AdminLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-text-muted text-sm font-mono uppercase tracking-wider animate-pulse">Loading...</p>
      </div>
    </div>
  );
}
