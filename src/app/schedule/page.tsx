import { SchedulePreview } from '@/components/home/SchedulePreview';
import { Footer } from '@/components/home/Footer';

export const metadata = {
  title: 'Schedule | GENESIS 2.0',
  description: 'Event schedule for GENESIS 2.0 Buildathon',
};

export default function SchedulePage() {
  return (
    <main className="cosmic-page flex-grow min-h-screen pt-28 sm:pt-32">
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="section-glow right-[-8rem] top-[-4rem] opacity-80" />
        <div className="glass-surface mb-12 rounded-[28px] px-5 py-8 text-center sm:mb-16 sm:rounded-[32px] sm:px-10 sm:py-10">
          <h1 className="mb-5 text-3xl font-display font-bold text-white uppercase tracking-[0.1em] sm:text-4xl md:text-5xl md:tracking-[0.14em]">
            Full Schedule
          </h1>
          <p className="mx-auto max-w-2xl text-base text-text-muted sm:text-lg md:text-xl">
            Two days of building, learning, and competing inside the same cosmic visual system. Here is the full GENESIS 2.0 agenda.
          </p>
        </div>

        <SchedulePreview />
      </div>
      <Footer />
    </main>
  );
}

