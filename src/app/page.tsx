import { Hero } from '@/components/home/Hero';
import { EventIntro } from '@/components/home/EventIntro';
import { SpaceDust } from '@/components/home/SpaceDust';
import { PrizePoolBanner } from '@/components/home/PrizePoolBanner';
import dynamic from 'next/dynamic';
import { LazyLoadSection } from '@/components/ui/LazyLoadSection';

const Tracks = dynamic(() => import('@/components/home/Tracks').then(mod => mod.Tracks), { ssr: true });
const RegistrationCTA = dynamic(() => import('@/components/home/RegistrationCTA').then(mod => mod.RegistrationCTA), { ssr: true });
const Footer = dynamic(() => import('@/components/home/Footer').then(mod => mod.Footer), { ssr: true });

export default function Home() {
  return (
    <main className="cosmic-page flex-grow flex flex-col pb-16 overflow-x-hidden relative">
      <SpaceDust />
      <Hero />
      {/**<PrizePoolBanner />*/} 
      <EventIntro />
      <LazyLoadSection minHeight="600px">
        <Tracks />
      </LazyLoadSection>
      <LazyLoadSection minHeight="300px">
        <RegistrationCTA />
      </LazyLoadSection>
      <Footer />
    </main>
  );
}
