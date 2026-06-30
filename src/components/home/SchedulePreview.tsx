import { connectDB } from '@/lib/db';
import ScheduleItem from '@/models/ScheduleItem';
import Link from 'next/link';
import { unstable_noStore as noStore } from 'next/cache';

interface ScheduleItemRecord {
  _id: string;
  day: 1 | 2;
  time: string;
  eventName: string;
  speaker: string | null;
  order: number;
}

export async function SchedulePreview() {
  noStore();

  let items: ScheduleItemRecord[] = [];
  let loadError = false;

  try {
    await connectDB();
    items = (await ScheduleItem.find().sort({ day: 1, order: 1 }).lean()) as ScheduleItemRecord[];
  } catch (error) {
    loadError = true;
    console.error('Schedule preview failed:', error);
  }

  return (
    <section className="relative z-10 mx-auto max-w-5xl overflow-hidden px-4 py-24 sm:px-6 lg:px-8">
      <div className="section-glow left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-65" />

      <div className="relative z-10 mb-10 flex flex-col items-center justify-between gap-6 text-center sm:mb-16 sm:flex-row sm:text-left">
        <div>
          <p className="mb-3 text-sm uppercase tracking-[0.28em] text-accent-secondary">Live Agenda</p>
          <h2 className="mb-2 text-3xl font-display font-bold text-white tracking-[0.14em] uppercase md:text-4xl">
            Event Schedule
          </h2>
          <p className="text-text-muted">A cosmic preview of what is happening across the event.</p>
        </div>
        <Link
          href="/schedule"
          className="inline-flex items-center justify-center rounded-full border border-[rgba(167,139,250,0.22)] bg-[rgba(255,255,255,0.04)] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[rgba(255,255,255,0.08)]"
        >
          View Full Schedule
        </Link>
      </div>

      <div className="glass-surface overflow-hidden rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)]">
        {loadError ? (
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center sm:px-10">
            <div className="mb-4 rounded-full bg-accent-primary/10 p-4 text-accent-secondary opacity-80">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-display font-semibold text-white">Schedule temporarily unavailable</h3>
            <p className="mb-6 max-w-sm text-text-muted">Please refresh in a moment or visit the full schedule page.</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center sm:px-10">
            <div className="mb-4 rounded-full bg-accent-primary/10 p-4 text-accent-secondary opacity-80">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-display font-semibold text-white">No schedule planned yet</h3>
            <p className="mb-6 max-w-sm text-text-muted">We are still working on the event agenda. Please check back soon.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {items.slice(0, 5).map((item) => (
              <div
                key={item._id}
                className="flex flex-col p-6 transition-colors hover:bg-white/[0.03] sm:flex-row sm:items-center sm:p-8"
              >
                <div className="mb-4 w-48 flex-shrink-0 sm:mb-0">
                  <div className="mb-1 text-sm font-medium uppercase tracking-[0.24em] text-accent-secondary">
                    Day {item.day}
                  </div>
                  <div className="text-xl font-display text-white">{item.time}</div>
                </div>
                <div className="flex-grow">
                  <h3 className="mb-1 text-lg font-bold text-white">{item.eventName}</h3>
                  {item.speaker && (
                    <p className="flex items-center text-sm text-text-muted">
                      <svg className="mr-1 h-4 w-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {item.speaker}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
