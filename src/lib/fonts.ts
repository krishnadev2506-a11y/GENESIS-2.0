import { Orbitron, Outfit, Space_Grotesk } from 'next/font/google';

export const fontBrand = Orbitron({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-brand-family',
  display: 'swap',
});

export const fontDisplay = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display-family',
  display: 'swap',
});

export const fontBody = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body-family',
  display: 'swap',
});

export const fontVariables = `${fontBrand.variable} ${fontDisplay.variable} ${fontBody.variable}`;
