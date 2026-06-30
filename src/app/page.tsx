import { Hero } from '@/components/home/Hero';
import { About } from '@/components/home/About';
import { SkillUpSessions } from '@/components/home/SkillUpSessions';
import { CompetitionsGames } from '@/components/home/CompetitionsGames';
import { SchedulePreview } from '@/components/home/SchedulePreview';
import { RegistrationCTA } from '@/components/home/RegistrationCTA';
import { Footer } from '@/components/home/Footer';

export default function Home() {
  return (
    <main className="cosmic-page flex-grow">
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

