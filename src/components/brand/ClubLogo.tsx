'use client';

import Image from 'next/image';

type ClubLogoProps = {
  className?: string;
};

export function ClubLogo({ className = 'h-14 w-14' }: ClubLogoProps) {
  return (
    <div className={`relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-white p-1.5 shadow-[0_0_24px_rgba(0,0,0,0.22)] ${className}`}>
      <Image
        src="/fisat-horizon-club-logo.png"
        alt="FISAT Horizon Club logo"
        fill
        sizes="(max-width: 640px) 56px, 72px"
        className="object-contain object-center"
        priority={false}
      />
    </div>
  );
}
