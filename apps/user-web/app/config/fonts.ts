/**
 * Font Configuration
 * 
 * NAPOMENA: Font se učitava direktno preko CSS @import u globals.css
 * Ovaj fajl služi za Next.js layout integraciju.
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
 * (može imati probleme sa TypeScript):
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
