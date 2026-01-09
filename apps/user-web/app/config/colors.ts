/**
 * Color Configuration
 * 
 * Ovde možete promeniti glavne boje za celu aplikaciju.
 * Sve boje se koriste kroz Tailwind klase (brand-50, brand-600, itd.)
 * 
 * Za promenu boje:
 * 1. Promenite HEX vrednosti ispod
 * 2. Restart dev server (npm run dev:user)
 * 
 * Generator paleta: https://uicolors.app/create
 */

// GLAVNA BOJA BRENDA (trenutno narandžasta)
export const brandColors = {
  50: '#fff7ed',   // Najsvetlija nijansa (backgrounds, hover states)
  100: '#ffedd5',  // Vrlo svetla
  200: '#fed7aa',  // Svetla
  300: '#fdba74',  // Srednje svetla
  400: '#fb923c',  // Srednja svetla
  500: '#f97316',  // Srednja (base)
  600: '#ea580c',  // Glavna boja buttona, ikonica (PRIMARY)
  700: '#c2410c',  // Tamnija (hover states za buttone)
  800: '#9a3412',  // Tamna
  900: '#7c2d12',  // Najtamnija
  950: '#431407',  // Ekstra tamna
};

// ALTERNATIVNO - Plava boja (zakomentarisano)
/*
export const brandColors = {
  50: '#eff6ff',
  100: '#dbeafe',
  200: '#bfdbfe',
  300: '#93c5fd',
  400: '#60a5fa',
  500: '#3b82f6',
  600: '#2563eb',  // PRIMARY
  700: '#1d4ed8',
  800: '#1e40af',
  900: '#1e3a8a',
  950: '#172554',
};
*/

// ALTERNATIVNO - Zelena boja
/*
export const brandColors = {
  50: '#f0fdf4',
  100: '#dcfce7',
  200: '#bbf7d0',
  300: '#86efac',
  400: '#4ade80',
  500: '#22c55e',
  600: '#16a34a',  // PRIMARY
  700: '#15803d',
  800: '#166534',
  900: '#14532d',
  950: '#052e16',
};
*/

// ALTERNATIVNO - Ljubičasta boja
/*
export const brandColors = {
  50: '#faf5ff',
  100: '#f3e8ff',
  200: '#e9d5ff',
  300: '#d8b4fe',
  400: '#c084fc',
  500: '#a855f7',
  600: '#9333ea',  // PRIMARY
  700: '#7e22ce',
  800: '#6b21a8',
  900: '#581c87',
  950: '#3b0764',
};
*/

// Izvoz za Tailwind config
export default brandColors;
