import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

import { SettingsProvider } from '@/context/SettingsContext';
import ThemeWrapper from '@/components/ThemeWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Zentrixa | AI Data Analyst',
  description: 'AI-powered data analysis and predictive insights with Zentrixa.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <SettingsProvider>
          <ThemeWrapper>
            {children}
          </ThemeWrapper>
        </SettingsProvider>
      </body>
    </html>
  );
}
