# Color Configuration Guide

## Current Setup

Brand colors are centralized in `tailwind.config.ts` using **Tailwind CSS v3**.

### File Structure
```
apps/user-web/
├── tailwind.config.ts       # Brand color definitions (HEX values)
├── postcss.config.js         # Tailwind v3 PostCSS plugin
├── app/
│   ├── globals.css           # @tailwind directives
│   └── config/
│       └── fonts.ts          # Font configuration (Inter)
```

## How to Change Brand Colors

### 1. Edit `tailwind.config.ts`
```typescript
colors: {
  brand: {
    50: '#fff7ed',   // Lightest - backgrounds, hover states
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',
    600: '#ea580c',  // PRIMARY - buttons, icons, links
    700: '#c2410c',  // Hover states for buttons
    800: '#9a3412',
    900: '#7c2d12',
    950: '#431407',  // Darkest
  }
}
```

### 2. Restart Dev Server
```bash
# Changes apply automatically after restart
npm run dev
```

### 3. Usage in Components
```tsx
// Buttons
<button className="bg-brand-600 hover:bg-brand-700">

// Text
<p className="text-brand-600">

// Borders
<div className="border-brand-600">

// With opacity
<div className="bg-brand-600/50">
```

## Color Palette Generators

- **UIColors**: https://uicolors.app/create (paste your base color, generates full palette)
- **Tailwind Shades**: https://www.tailwindshades.com/
- **Coolors**: https://coolors.co/

## Example: Change to Blue

Replace the `brand` object in `tailwind.config.ts`:

```typescript
brand: {
  50: '#eff6ff',
  100: '#dbeafe',
  200: '#bfdbfe',
  300: '#93c5fd',
  400: '#60a5fa',
  500: '#3b82f6',
  600: '#2563eb',  // Primary blue
  700: '#1d4ed8',
  800: '#1e40af',
  900: '#1e3a8a',
  950: '#172554',
}
```

## Migration Notes

**Previous setup (removed):**
- ❌ `app/config/colors.ts` - **DELETED** (no longer needed)
- ❌ Tailwind CSS v4 with `@import "tailwindcss"` - **Replaced with v3**
- ❌ CSS variables approach - **Replaced with direct HEX values**

**Current setup:**
- ✅ Tailwind CSS v3.4.0
- ✅ Direct HEX values in `tailwind.config.ts`
- ✅ Standard `@tailwind` directives in `globals.css`
- ✅ PostCSS with `tailwindcss` and `autoprefixer` plugins

## Technical Details

### Dependencies
```json
{
  "devDependencies": {
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

### PostCSS Config
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### globals.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## Troubleshooting

**Colors not showing?**
1. Check `tailwind.config.ts` has `brand` colors defined
2. Verify `globals.css` has `@tailwind` directives (not `@import`)
3. Clear cache: `rm -rf .next` and restart server
4. Check PostCSS config uses `tailwindcss` plugin (not `@tailwindcss/postcss`)

**Build errors?**
- Ensure Tailwind v3 is installed, not v4
- Check `package.json` has correct versions
- Run `npm install` to sync dependencies
