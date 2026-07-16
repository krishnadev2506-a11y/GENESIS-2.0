import { Hero } from '@/components/home/Hero';
import { SpaceDust } from '@/components/home/SpaceDust';
import dynamic from 'next/dynamic';
import { LazyLoadSection } from '@/components/ui/LazyLoadSection';

const About = dynamic(() => import('@/components/home/About').then(mod => mod.About), { ssr: true });
const SkillUpSessions = dynamic(() => import('@/components/home/SkillUpSessions').then(mod => mod.SkillUpSessions), { ssr: true });
const CompetitionsGames = dynamic(() => import('@/components/home/CompetitionsGames').then(mod => mod.CompetitionsGames), { ssr: true });
const SchedulePreview = dynamic(() => import('@/components/home/SchedulePreview').then(mod => mod.SchedulePreview), { ssr: true });
const RegistrationCTA = dynamic(() => import('@/components/home/RegistrationCTA').then(mod => mod.RegistrationCTA), { ssr: true });
const Footer = dynamic(() => import('@/components/home/Footer').then(mod => mod.Footer), { ssr: true });

export default function Home() {
  return (
    <main className="cosmic-page flex-grow flex flex-col pb-16 overflow-hidden relative">
      <SpaceDust />
      <Hero />
      <LazyLoadSection minHeight="800px">
        <About />
      </LazyLoadSection>
      <LazyLoadSection minHeight="600px">
        <SkillUpSessions />
      </LazyLoadSection>
      <LazyLoadSection minHeight="500px">
        <CompetitionsGames />
      </LazyLoadSection>
      <LazyLoadSection minHeight="400px">
        <SchedulePreview />
      </LazyLoadSection>
      <LazyLoadSection minHeight="400px">
        <RegistrationCTA />
      </LazyLoadSection>
      <Footer />
    </main>
  );
}
