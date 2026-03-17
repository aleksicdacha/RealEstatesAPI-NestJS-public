# Color Configuration Guide

## Kako promeniti glavnu boju aplikacije

Boja za celu user-web aplikaciju se konfiguriše na **jednom mestu**: `apps/user-web/app/config/colors.ts`

### Trenutna boja
Aplikacija trenutno koristi **narandžastu** (#ea580c) kao glavnu brand boju.

## Kako promeniti boju

### Metod 1: Koristi gotove palete (najlakše)

1. **Otvorite fajl**: `apps/user-web/app/config/colors.ts`

2. **Zakomentarišite trenutnu paletu i odkomentarišite drugu**:

```typescript
// Plava boja
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
```

3. **Restart dev server**:
```bash
npm run dev:user
```

### Metod 2: Kreira custom boju (naprednije)

1. **Idi na**: https://uicolors.app/create
2. **Izaberi bazu boju** (npr. #e91e63 za roze)
3. **Kopiraj generisanu paletu**
4. **Zameni vrednosti** u `brandColors` objektu
5. **Restart dev server**

### Primer custom boje (roze):

```typescript
export const brandColors = {
  50: '#fdf2f8',
  100: '#fce7f3',
  200: '#fbcfe8',
  300: '#f9a8d4',
  400: '#f472b6',
  500: '#ec4899',
  600: '#db2777',  // PRIMARY - glavna boja
  700: '#be185d',
  800: '#9f1239',
  900: '#831843',
  950: '#500724',
};
```

## Korišćenje boja u kodu

### Trenutno (orange-* klase):
```tsx
// Staro - koristi Tailwind default orange boju
<button className="bg-orange-600 hover:bg-orange-700">
```

### Novo (brand-* klase):
```tsx
// Novo - koristi konfigurabilnu brand boju
<button className="bg-brand-600 hover:bg-brand-700">
```

## Nijanse boja

- **50-200**: Svetle nijanse (backgrounds, borders)
- **300-500**: Srednje nijanse (akcentni elementi)
- **600**: **GLAVNA BOJA** (buttoni, ikonice, linkovi)
- **700**: Hover states za buttone
- **800-950**: Tamne nijanse (tekst, shadows)

## Migracija postojećeg koda

Potrebno je zameniti `orange-*` sa `brand-*` kroz aplikaciju:

```bash
# Find all orange-* references
grep -r "orange-" apps/user-web/app/components/

# Replace manually or use:
# orange-50 → brand-50
# orange-600 → brand-600
# orange-700 → brand-700
```

### Najčešće zamene:

| Staro | Novo |
|-------|------|
| `bg-orange-600` | `bg-brand-600` |
| `text-orange-600` | `text-brand-600` |
| `border-orange-600` | `border-brand-600` |
| `hover:bg-orange-700` | `hover:bg-brand-700` |
| `from-orange-600` | `from-brand-600` |
| `to-orange-700` | `to-brand-700` |

## Testiranje

1. Promeni boju u `colors.ts`
2. Restart dev server
3. Proveri ove komponente:
   - Buttoni na hero sekciji
   - Navigacija (hover states)
   - Property cards (cena, badges)
   - Footer newsletter button
   - Search button
   - Filter highlights

## Napomene

- **Brand paleta je dodatna** - Tailwind default boje (blue, red, green) i dalje rade
- **Primary paleta ostaje** - za legacy kompatibilnost
- Možeš koristiti **obe palete** paralelno dok migriraš kod
- Generator paleta automatski pravi harmonične nijanse od 50 do 950

## Struktura fajlova

- **`app/config/colors.ts`** - Definicija brand palete (JEDINO MESTO ZA PROMENU)
- **`tailwind.config.ts`** - Import i registracija palete
- **Komponente** - Koriste `brand-*` klase umesto `orange-*`

## Dodatne opcije

### Dodavanje sekundarne boje:

```typescript
// U colors.ts
export const secondaryColors = {
  50: '#f0f9ff',
  // ... paleta
};

// U tailwind.config.ts
colors: {
  brand: brandColors,
  secondary: secondaryColors,
}

// U komponentama
<button className="bg-secondary-600">
```

### Dodavanje custom nijansi:

```typescript
export const brandColors = {
  // ... standardne nijanse
  light: '#fef3c7',  // custom svetla
  DEFAULT: '#ea580c', // default (koristi se sa samo 'brand')
  dark: '#7c2d12',   // custom tamna
};

// Korišćenje
<div className="bg-brand">       // koristi DEFAULT
<div className="bg-brand-light"> // koristi light
```
