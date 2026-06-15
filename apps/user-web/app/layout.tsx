import './globals.css';
// Font is loaded via CSS @import in globals.css
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Olymp Nekretnine',
  description:
    'Pronađite savršenu nekretninu - kuće, stanovi, lokali i zemljišta',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sr">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        {/* Preload hero background images so they load before CSS renders */}
        <link
          rel="preload"
          as="image"
          href="/assets/images/cities/nis.jpg"
          fetchPriority="high"
        />
        <link
          rel="preload"
          as="image"
          href="/assets/images/cities/belgrade.jpg"
          fetchPriority="high"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
