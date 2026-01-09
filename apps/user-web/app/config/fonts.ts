/**
 * Font Configuration
 * 
 * Ovde možete promeniti font za celu aplikaciju.
 * Podržani fontovi iz next/font/google: Inter, Poppins, Roboto, Open_Sans, Montserrat, itd.
 * 
 * Za promenu fonta:
 * 1. Promenite import (npr. import { Poppins } from 'next/font/google')
 * 2. Promenite konfiguraciju ispod
 */

import { Quicksand } from 'next/font/google';

// Glavni font za aplikaciju
export const mainFont = Quicksand({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-main',
  display: 'swap',
});

// Alternativno, možete koristiti drugi font (npr. Poppins):
/*
import { Poppins } from 'next/font/google';

export const mainFont = Poppins({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-main',
  display: 'swap',
});
*/

// Ili Montserrat:
/*
import { Montserrat } from 'next/font/google';

export const mainFont = Montserrat({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-main',
  display: 'swap',
});
*/
