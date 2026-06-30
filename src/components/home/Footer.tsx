import Link from 'next/link';
import { ClubLogo } from '@/components/brand/ClubLogo';
import { BrandWordmark } from '@/components/brand/BrandWordmark';

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-[rgba(255,255,255,0.08)] bg-[linear-gradient(180deg,rgba(20,16,30,0.62),rgba(10,10,15,0.94))] px-4 pb-8 pt-16 sm:px-6 lg:px-8 backdrop-blur-xl">
      <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(167,139,250,0.45),transparent)]" />
      <div className="section-glow right-[6%] top-[-8rem] opacity-70" />
      <div className="mx-auto mb-12 flex max-w-7xl flex-col justify-between gap-10 md:flex-row md:items-start">
        <div>
          <BrandWordmark className="mb-3 text-2xl tracking-[0.28em] text-white" />
          <div className="flex items-center gap-4 rounded-[22px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-4 py-3 shadow-[0_0_24px_rgba(139,92,246,0.08)]">
            <ClubLogo className="h-12 w-12 shrink-0 sm:h-14 sm:w-14" />
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-text-muted sm:text-[11px] sm:tracking-[0.34em]">Organized by</p>
              <p className="text-sm uppercase tracking-[0.18em] text-white sm:text-[13px] sm:tracking-[0.24em]">FISAT Horizon Club</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-12 sm:gap-20">
          <div>
            <h4 className="label-caps mb-4 text-sm text-white">Explore</h4>
            <ul className="space-y-3">
              <li><Link href="/register" className="text-text-muted transition-colors hover:text-accent-secondary">Register</Link></li>
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

      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 border-t border-[rgba(255,255,255,0.06)] pt-8 text-sm text-text-muted/80 sm:flex-row">
        <p>&copy; 2026 GENESIS Buildathon. All rights reserved.</p>
      </div>
    </footer>
  );
}

