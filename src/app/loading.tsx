import { BrandWordmark } from '@/components/brand/BrandWordmark';

export default function Loading() {
  return (
    <div className="min-h-screen bg-void flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[520px] sm:h-[520px] bg-[radial-gradient(circle,rgba(139,92,246,0.24)_0%,rgba(167,139,250,0.12)_35%,transparent_70%)] rounded-full blur-[80px] sm:blur-[120px] -z-10 animate-pulse"></div>
      
      <BrandWordmark className="text-2xl tracking-[0.18em] text-white sm:text-3xl sm:tracking-[0.24em] mb-8 animate-pulse" />
      
      <div className="flex gap-2">
        <div className="w-2 h-2 rounded-full bg-pulse animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 rounded-full bg-pulse animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 rounded-full bg-pulse animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
}
