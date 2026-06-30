import { Hero } from '@/components/home/Hero';
import { About } from '@/components/home/About';
import { SkillUpSessions } from '@/components/home/SkillUpSessions';
import { CompetitionsGames } from '@/components/home/CompetitionsGames';
import { SchedulePreview } from '@/components/home/SchedulePreview';
import { RegistrationCTA } from '@/components/home/RegistrationCTA';
import { Footer } from '@/components/home/Footer';
import { SpaceDust } from '@/components/home/SpaceDust';

export default function Home() {
  return (
    <main className="cosmic-page flex-grow flex flex-col gap-y-12 md:gap-y-20 pb-16 overflow-hidden relative">
      <SpaceDust />
      <Hero />
      <About />
      <SkillUpSessions />
      <CompetitionsGames />
      <SchedulePreview />
      <RegistrationCTA />
      <Footer />
    </main>
  );
}

