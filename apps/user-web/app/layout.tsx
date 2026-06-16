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
      </head>
      <body>{children}</body>
    </html>
  );
}
