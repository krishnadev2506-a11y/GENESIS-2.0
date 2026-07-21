import { RegistrationWizard } from '@/components/registration/RegistrationWizard';
import { Footer } from '@/components/home/Footer';

export const metadata = {
  title: 'Register | GENESIS 2.0',
  description: 'Register your team for GENESIS 2.0 Buildathon',
};

export default function RegisterPage() {
  return (
    <main className="cosmic-page flex-grow min-h-screen pt-28 sm:pt-32">
      <div className="relative max-w-5xl mx-auto mb-12 px-4 sm:px-6 lg:px-8">
        <div className="section-glow left-[-8rem] top-[4rem] opacity-70" />
        <div className="glass-surface mb-10 rounded-[28px] px-5 py-8 text-center sm:mb-12 sm:rounded-[32px] sm:px-10 sm:py-10">
          <h1 className="mb-4 text-3xl font-display font-bold text-white uppercase tracking-[0.1em] sm:text-4xl md:text-5xl md:tracking-[0.14em]">
            Register Your Team
          </h1>
        </div>

        <RegistrationWizard />
      </div>
      <Footer />
    </main>
  );
}

