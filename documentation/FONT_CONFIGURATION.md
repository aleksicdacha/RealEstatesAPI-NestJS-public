# Font Konfiguracija

## Kako promeniti font u celoj aplikaciji

Font za celu user-web aplikaciju se konfiguriše na **jednom mestu**: `apps/user-web/app/config/fonts.ts`

### Trenutni font
Aplikacija trenutno koristi **Inter** font od Google Fonts.

### Kako promeniti font

1. **Otvorite fajl**: `apps/user-web/app/config/fonts.ts`

2. **Promenite import i konfiguraciju**:

```typescript
// PRIMER 1: Poppins font
import { Poppins } from 'next/font/google';

export const mainFont = Poppins({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-main',
  display: 'swap',
});

// PRIMER 2: Montserrat font
import { Montserrat } from 'next/font/google';

export const mainFont = Montserrat({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-main',
  display: 'swap',
});

// PRIMER 3: Roboto font
import { Roboto } from 'next/font/google';

export const mainFont = Roboto({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '700', '900'],
  variable: '--font-main',
  display: 'swap',
});
```

3. **Restart dev server**:
```bash
npm run dev:user
```

### Dostupni Google Fonts

Možete koristiti bilo koji font sa [Google Fonts](https://fonts.google.com/). Popularne opcije:
- `Inter` - trenutni font
- `Poppins` - moderan, čitljiv
- `Montserrat` - elegantna geometrija
- `Roboto` - Google Material Design
- `Open_Sans` - klasičan humanistički
- `Lato` - profesionalan, čist
- `Raleway` - elegantan, tanak
- `Ubuntu` - savremeni humanistički

### Struktura konfiguracije

- **`app/config/fonts.ts`** - Definicija fonta (JEDINO MESTO ZA PROMENU)
- **`app/layout.tsx`** - Primena fonta na `<html>` i `<body>`
- **`tailwind.config.ts`** - CSS varijabla za Tailwind (`font-sans`)

### Napomene

- Font se automatski primenjuje na celu aplikaciju
- Next.js optimizuje font (self-hosting, preload)
- `display: 'swap'` sprečava FOIT (Flash of Invisible Text)
- Weight opcije određuju koje debljine su dostupne (300=Light, 400=Regular, 700=Bold, itd.)
