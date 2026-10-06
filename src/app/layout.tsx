import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import Layout from '@/components/Layout';
import { AppProvider } from '@/context/AppContext';
import PwaRegistrar from '@/components/PwaRegistrar';

export const metadata: Metadata = {
  title: 'SYCLE',
  description: 'Pahami kondisi lingkungan dan tubuhmu hari ini.',
  applicationName: 'SYCLE',
  manifest: '/manifest.webmanifest',
  icons: { icon: '/sycle-logo.png', apple: '/sycle-logo.png' },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="id">
      <body>
        <AppProvider>
          <PwaRegistrar />
          <Layout>{children}</Layout>
        </AppProvider>
      </body>
    </html>
  );
}
