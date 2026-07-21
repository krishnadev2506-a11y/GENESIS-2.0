'use client';

import Image from 'next/image';

type ClubLogoProps = {
  className?: string;
};

export function ClubLogo({ className = 'h-14 w-14' }: ClubLogoProps) {
  return (
    <div className={`relative aspect-square overflow-hidden rounded-xl shadow-[0_0_24px_rgba(139,92,246,0.3)] ${className}`}>
      <Image
        src="/genesis-nav-image.jpg"
        alt="Genesis logo"
        fill
        sizes="(max-width: 640px) 56px, 72px"
        className="object-cover object-center"
        priority={true}
      />
    </div>
  );
}
