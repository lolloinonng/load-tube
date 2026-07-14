import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CursorGlow } from '@/components/effects/CursorGlow';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { AuthGate } from '@/components/auth/AuthGate';
import './globals.css';

export const metadata: Metadata = {
  title: 'load.tube - Downloader YouTube',
  description: 'Scarica video e audio da YouTube nel formato e qualità che preferisci.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{
          __html: `
            try {
              var t = localStorage.getItem('theme');
              var d = t ? t === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
              if (d) document.documentElement.classList.add('dark');
            } catch(e) {}
          `
        }} />
      </head>
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <CursorGlow />
          <Header />
          <main className="flex-1 relative z-2">
            <AuthGate>{children}</AuthGate>
          </main>
          <Footer />
          <Toaster
            position="bottom-right"
            toastOptions={{
              className: 'dark:bg-gray-800 dark:text-white',
              duration: 4000,
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
