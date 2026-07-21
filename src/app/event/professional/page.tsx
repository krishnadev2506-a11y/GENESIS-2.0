import { connectDB } from '@/lib/db';
import Settings from '@/models/Settings';
import { EventJourney } from '@/components/event/EventJourney';
import { Footer } from '@/components/home/Footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Professional Track | Genesis 2.0',
  description: 'The Professional track journey for Genesis 2.0',
};

export default async function ProfessionalPage() {
  await connectDB();
  const settings = await Settings.getSettings();

  const theme = {
    title: settings.themeProfessional.title,
    tagline: settings.themeProfessional.tagline,
    description: settings.themeProfessional.description,
    releaseDate: settings.themeProfessional.releaseDate,
    published: settings.themeProfessional.published,
  };

  return (
    <main className="min-h-screen bg-void pt-20">
      <EventJourney route="professional" theme={theme} />
      <Footer />
    </main>
  );
}
