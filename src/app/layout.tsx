import type { Metadata } from 'next';
import './globals.css';
import { JetBrains_Mono, Inter } from 'next/font/google';
import DemoBanner from '@/components/DemoBanner';

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Mission Control',
  description: 'AI Agent Orchestration Dashboard',
  icons: {
    icon: '/favicon.svg',
  },
};

import { ThemeProvider } from '@/components/ThemeProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable} ${inter.variable}`}>
      <ThemeProvider>
        <body className={`${inter.className} min-h-screen bg-mc-bg text-mc-text antialiased`}>
          <DemoBanner />
          {children}
        </body>
      </ThemeProvider>
    </html>
  );
}
