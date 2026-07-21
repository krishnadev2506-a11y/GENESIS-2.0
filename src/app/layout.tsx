import type { Metadata } from 'next';
import './globals.css';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { MotionProvider } from '@/components/providers/MotionProvider';
import { ToastProvider } from '@/components/ui/Toast';
import { PublicNav } from '@/components/layout/PublicNav';
import { fontBody, fontVariables } from '@/lib/fonts';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://genesis2026.dev'),
  title: 'GENESIS 2.0 | Code The Future, Code The Impossible',
  description: 'A 2-day team competition where participants build a project together, attend workshops, and experience corporate-style role-based teamwork at FISAT College.',
  keywords: ['hackathon', 'FISAT', 'buildathon', 'coding competition', 'Genesis'],
  openGraph: {
    title: 'GENESIS 2.0 | Code The Future',
    description: 'A 2-day buildathon at FISAT College',
    images: ['/genesis-logo.png'],
    type: 'website',
    url: 'https://genesis2026.dev',
    siteName: 'GENESIS 2.0',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GENESIS 2.0',
    description: 'A 2-day buildathon at FISAT College',
    images: ['/genesis-logo.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={fontVariables}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <meta name="theme-color" content="#0A0118" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className={`${fontBody.className} min-h-screen flex flex-col font-body bg-void text-text-primary antialiased`}>
        <QueryProvider>
          <MotionProvider>
            <ToastProvider>
              <PublicNav />
              {children}
            </ToastProvider>
          </MotionProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
