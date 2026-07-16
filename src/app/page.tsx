import { Hero } from '@/components/home/Hero';
import { SpaceDust } from '@/components/home/SpaceDust';
import dynamic from 'next/dynamic';
import { LazyLoadSection } from '@/components/ui/LazyLoadSection';

const Tracks = dynamic(() => import('@/components/home/Tracks').then(mod => mod.Tracks), { ssr: true });
const BuildathonTimeline = dynamic(() => import('@/components/home/BuildathonTimeline').then(mod => mod.BuildathonTimeline), { ssr: true });
const WhatToBuild = dynamic(() => import('@/components/home/WhatToBuild').then(mod => mod.WhatToBuild), { ssr: true });
const EvaluationCriteria = dynamic(() => import('@/components/home/EvaluationCriteria').then(mod => mod.EvaluationCriteria), { ssr: true });
const BuildIntegrity = dynamic(() => import('@/components/home/BuildIntegrity').then(mod => mod.BuildIntegrity), { ssr: true });
const SubmissionRequirements = dynamic(() => import('@/components/home/SubmissionRequirements').then(mod => mod.SubmissionRequirements), { ssr: true });
const RegistrationCTA = dynamic(() => import('@/components/home/RegistrationCTA').then(mod => mod.RegistrationCTA), { ssr: true });
const Footer = dynamic(() => import('@/components/home/Footer').then(mod => mod.Footer), { ssr: true });

export default function Home() {
  return (
    <main className="cosmic-page flex-grow flex flex-col pb-16 overflow-x-hidden relative">
      <SpaceDust />
      <Hero />
      <LazyLoadSection minHeight="900px">
        <Tracks />
      </LazyLoadSection>
      <LazyLoadSection minHeight="700px">
        <BuildathonTimeline />
      </LazyLoadSection>
      <LazyLoadSection minHeight="600px">
        <WhatToBuild />
      </LazyLoadSection>
      <LazyLoadSection minHeight="700px">
        <EvaluationCriteria />
      </LazyLoadSection>
      <LazyLoadSection minHeight="600px">
        <BuildIntegrity />
      </LazyLoadSection>
      <LazyLoadSection minHeight="600px">
        <SubmissionRequirements />
      </LazyLoadSection>
      <LazyLoadSection minHeight="400px">
        <RegistrationCTA />
      </LazyLoadSection>
      <Footer />
    </main>
  );
}
