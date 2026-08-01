import { connectDB } from '@/lib/db';
import Settings from '@/models/Settings';
import { EventJourney } from '@/components/event/EventJourney';
import { Footer } from '@/components/home/Footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Foundation Track | Genesis 2.0',
  description: 'The Foundation track journey for Genesis 2.0',
};

export default async function FoundationPage() {
  await connectDB();
  const settings = await Settings.getSettings();

  const theme = {
    title: settings.themeFoundation.title,
    tagline: settings.themeFoundation.tagline,
    description: settings.themeFoundation.description,
    releaseDate: settings.themeFoundation.releaseDate,
    published: settings.themeFoundation.published,
  };

  return (
    <main className="min-h-screen bg-void pt-20">
      <EventJourney theme={theme} />
      <Footer />
    </main>
  );
}
