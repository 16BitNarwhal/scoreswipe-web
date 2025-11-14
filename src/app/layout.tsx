import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import Providers from '@/components/providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'ScoreSwipe Web',
  description: 'Hands-free sheet music navigation in your browser.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
  },
};

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="en" className={`${inter.variable}`}>
    <body className="min-h-screen bg-brand-50 text-brand-500">
      <Providers>
        <div className="flex min-h-screen flex-col">
          {children}
        </div>
      </Providers>
    </body>
  </html>
);

export default RootLayout;
