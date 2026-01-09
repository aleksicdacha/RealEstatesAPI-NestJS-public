import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-main)', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Glavna boja brenda - za promenu boja edituj hex vrednosti ovde
        brand: {
          '50': '#fdf4f3',
          '100': '#fbeae8',
          '200': '#f6d8d5',
          '300': '#efb7b2',
          '400': '#e58e87',
          '500': '#d7625c',
          '600': '#c74d4d',
          '700': '#a22e31',
          '800': '#88292e',
          '900': '#75262d',
          '950': '#401114',
        },
        // Legacy primary (može se obrisati kasnije)
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
