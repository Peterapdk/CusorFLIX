import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import ErrorBoundary from '@/components/ErrorBoundary';
import { ThemeProvider } from '@/components/theme-provider';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
  fallback: ['system-ui', 'arial'],
});

export const metadata: Metadata = {
  title: 'CinemaRebel - Your Premium Movie & TV Experience',
  description: 'Discover trending movies and TV shows. Stream with CinemaOS integration. Your ultimate entertainment destination.',
  keywords: 'movies, tv shows, streaming, cinema, entertainment, tmdb',
  openGraph: {
    title: 'CinemaRebel - Premium Movie & TV Experience',
    description: 'Discover trending movies and TV shows with CinemaOS streaming integration',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log('RootLayout rendering');
  return (
    <html lang="en" className={`scroll-smooth ${inter.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-cinema-orange focus:text-white focus:rounded"
          >
            Skip to main content
          </a>
          <ErrorBoundary>
            <Navbar />
            <main id="main-content" className="relative">
              {children}
            </main>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}


