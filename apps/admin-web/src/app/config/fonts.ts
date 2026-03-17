/**
 * Font Configuration - Admin Web Application
 *
 * NAPOMENA: Font se učitava direktno preko CSS @import u globals.css
 * Ovaj fajl služi za integraciju sa Next.js layout-om.
 *
 * Za promenu fonta:
 * 1. Promenite @import URL u globals.css
 * 2. Promenite font-family vrednosti u globals.css
 * 3. Opciono: Promenite fontName ispod
 *
 * Trenutni font: Quicksand
 */

// Font configuration object (CSS-based, not next/font)
// Font se učitava preko @import u globals.css
export const mainFont = {
  // CSS variable name
  variable: '--font-main',
  // Class to apply to body (empty since CSS handles it)
  className: '',
  // Font name for reference
  fontName: 'Quicksand',
};

/*
 * ALTERNATIVA: Ako želite da koristite next/font/google
 * (zahteva ispravnu Next.js konfiguraciju):
 *
 * import { Quicksand } from 'next/font/google';
 *
 * export const mainFont = Quicksand({
 *   subsets: ['latin', 'latin-ext'],
 *   weight: ['300', '400', '500', '600', '700'],
 *   variable: '--font-main',
 *   display: 'swap',
 * });
 */

// Alternativno: Poppins (zaobljeni, savremeni)
/*
import { Poppins } from 'next/font/google';

export const mainFont = Poppins({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-main',
  display: 'swap',
});
*/

// Alternativno: Roboto (klasičan Google Material Design)
/*
import { Roboto } from 'next/font/google';

export const mainFont = Roboto({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '700', '900'],
  variable: '--font-main',
  display: 'swap',
});
*/

// Alternativno: Montserrat (elegantan, poslovni)
/*
import { Montserrat } from 'next/font/google';

export const mainFont = Montserrat({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-main',
  display: 'swap',
});
*/

// Opciono: Sekundarni font za naslove ili specijalne elemente
/*
import { Playfair_Display } from 'next/font/google';

export const headingFont = Playfair_Display({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-heading',
  display: 'swap',
});
*/
