# 🎨 Font Configuration

Centralizovana konfiguracija fontova za Admin Web aplikaciju.

---

## 🚀 Quick Start

### **Promena Fonta**

1. **Otvori**: `fonts.ts`
2. **Promeni import**: 
   ```typescript
   import { Poppins } from 'next/font/google';
   ```
3. **Promeni konfiguraciju**:
   ```typescript
   export const mainFont = Poppins({
     subsets: ['latin', 'latin-ext'],
     weight: ['300', '400', '500', '600', '700', '800'],
     variable: '--font-main',
     display: 'swap',
   });
   ```
4. **Restartuj server**: `npm run dev:admin`

---

## 📚 Trenutno Korišćen Font

**Inter** - Moderan, clean, profesionalan (savršen za admin interfejse)

---

## 💡 Preporuke za Admin Panele

- **Inter** ✅ (trenutno) - Moderni, odličan za UI
- **Roboto** - Google Material Design standard
- **Poppins** - Zaobljeni, savremeni
- **Montserrat** - Elegantan, poslovni

---

## 📖 Puna Dokumentacija

Vidi: `/documentation/ADMIN_FONT_CONFIGURATION.md`

---

**Promena fonta = 3 minuta!** 🚀
