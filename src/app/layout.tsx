import type { Metadata } from 'next';
import './globals.css';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { MotionProvider } from '@/components/providers/MotionProvider';
import { ToastProvider } from '@/components/ui/Toast';
import { PublicNav } from '@/components/layout/PublicNav';
import { fontBody, fontVariables } from '@/lib/fonts';

export const metadata: Metadata = {
  title: 'GENESIS 2.0 | Code The Future',
  description: 'A 2-day team competition where participants build a project together, attend short workshops, and experience corporate-style role-based teamwork.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={fontVariables}>
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <meta name="theme-color" content="#0A0118" />
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
