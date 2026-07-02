import type { Metadata } from 'next';
import { Comfortaa, Raleway } from 'next/font/google';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import './globals.css';

const comfortaa = Comfortaa({
  subsets: ['latin'],
  variable: '--font-comfortaa',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

const raleway = Raleway({
  subsets: ['latin'],
  variable: '--font-raleway',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Hero Explorer — Discover World Experiences',
    template: '%s | Hero Explorer',
  },
  description:
    'Discover and book extraordinary tours, activities, and experiences around the world. Powered by Viator.',
  keywords: ['travel', 'tours', 'experiences', 'activities', 'booking', 'viator'],
  icons: {
    icon: '/tab_logo.png',
    shortcut: '/tab_logo.png',
    apple: '/tab_logo.png',
  },
  openGraph: {
    type: 'website',
    siteName: 'Hero Explorer',
    title: 'Hero Explorer — Discover World Experiences',
    description: 'Discover and book extraordinary travel experiences.',
    images: [{ url: '/logo-color.png', width: 509, height: 118, alt: 'Hero Explorer' }],
  },
  twitter: { card: 'summary_large_image' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${comfortaa.variable} ${raleway.variable}`}
    >
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
