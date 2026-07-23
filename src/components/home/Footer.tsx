import Link from 'next/link';
import Image from 'next/image';
import { BrandWordmark } from '@/components/brand/BrandWordmark';

export function Footer() {
  return (
    <footer className="relative z-10 mt-24 border-t border-[rgba(255,255,255,0.08)] bg-[linear-gradient(180deg,rgba(20,16,30,0.62),rgba(10,10,15,0.94))] px-4 pb-8 pt-16 sm:px-6 lg:px-8 backdrop-blur-xl">
      <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(167,139,250,0.45),transparent)]" />
      <div className="section-glow right-[6%] top-[-8rem] opacity-70" />
      <div className="relative z-10 mx-auto mb-12 flex max-w-7xl flex-col justify-between gap-10 md:flex-row md:items-start">
        <div className="max-w-xs">
          <BrandWordmark className="mb-3 text-2xl tracking-[0.28em] text-white" />
          <p className="mb-5 text-sm text-text-muted leading-relaxed">
            A Buildathon focused on software engineering &amp; implementation quality — not just ideas.
          </p>
          <div className="rounded-[22px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-4 py-3 shadow-[0_0_24px_rgba(139,92,246,0.08)]">
            <p className="mb-2 text-[10px] uppercase tracking-[0.28em] text-text-muted sm:text-[11px] sm:tracking-[0.34em]">Organized by</p>
            <Image
              src="/fisat-horizon-club-footer.jpg"
              alt="FISAT Horizon Club"
              width={320}
              height={120}
              sizes="(max-width: 640px) 48px, 56px"
              className="h-auto w-full max-w-[56px] rounded-lg bg-white object-contain"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-12 sm:gap-16">
          <div>
            <h4 className="label-caps mb-4 text-sm text-white">Participate</h4>
            <ul className="space-y-3">
              <li><Link href="/register" className="text-text-muted transition-colors hover:text-accent-secondary">Register Now</Link></li>
              <li><Link href="/schedule" className="text-text-muted transition-colors hover:text-accent-secondary">Schedule</Link></li>
              <li><Link href="/login" className="text-text-muted transition-colors hover:text-accent-secondary">Participant Login</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="label-caps mb-4 text-sm text-white">Connect</h4>
            <ul className="space-y-3">
              <li><a href="https://www.instagram.com/fisathorizon/" target="_blank" rel="noopener noreferrer" className="text-text-muted transition-colors hover:text-accent-secondary">Instagram</a></li>
              <li className="text-text-muted">KRISHNADEV L: <a href="tel:+918129474212" className="transition-colors hover:text-accent-secondary">8129474212</a></li>
              <li className="text-text-muted">LEEN JERRY: <a href="tel:+916238209422" className="transition-colors hover:text-accent-secondary">6238209422</a></li>
              <li className="text-text-muted">RACHEL ELSA: <a href="tel:+919497208148" className="transition-colors hover:text-accent-secondary">9497208148</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 border-t border-[rgba(255,255,255,0.06)] pt-8 text-sm text-text-muted/80 sm:flex-row">
        <p>&copy; 2026 GENESIS 2.0 Buildathon. All rights reserved.</p>
      </div>
    </footer>
  );
}
