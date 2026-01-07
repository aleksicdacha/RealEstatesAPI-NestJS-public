# 🌍 Chatbot Multilingual Support

## Implementovano

Chatbot sada **potpuno podržava srpski i engleski jezik**!

### Kako Radi?

1. **Automatska Detekcija Jezika**
   - Bot automatski detektuje koji jezik korisnik koristi na sajtu (sr/en)
   - Locale se šalje iz frontend-a u svaki API poziv
   - Backend prilagođava odgovore prema locale-u

2. **Šta je Prevedeno?**

   ✅ **Frontend UI (Chatbot.tsx)**:
   - Naslov i subtitle chata
   - Placeholder za input
   - Dugmići (Pošalji, Obriši istoriju, Razgovaraj sa agentom)
   - Agent forma (ime, email, telefon, poruka)
   - Success/error poruke
   - Svi tooltips i aria labels

   ✅ **Backend AI (chatbot.service.ts)**:
   - System prompt (instrukcije za AI)
   - Welcome message
   - Fallback odgovori za česta pitanja
   - Error messages
   - Success poruke za agent kontakt

3. **Translation Files**
   
   **sr.json:**
   ```json
   "Chatbot": {
     "title": "Pomoć",
     "subtitle": "Postavite nam pitanje",
     "placeholder": "Unesite poruku...",
     "send": "Pošalji",
     "clearHistory": "Obriši istoriju",
     "talkToAgent": "Razgovaraj sa agentom",
     "agentFormTitle": "Kontakt sa agentom",
     "name": "Ime i prezime",
     "email": "Email",
     "phone": "Telefon",
     "message": "Poruka",
     "submit": "Pošalji",
     "cancel": "Otkaži",
     "successMessage": "Uspešno poslato! Agent će vas kontaktirati uskoro.",
     "errorMessage": "Greška. Pokušajte ponovo.",
     "typing": "Piše...",
     "closeChat": "Zatvori chat",
     "openChat": "Otvori chat"
   }
   ```

   **en.json:**
   ```json
   "Chatbot": {
     "title": "Help",
     "subtitle": "Ask us a question",
     "placeholder": "Type your message...",
     "send": "Send",
     "clearHistory": "Clear history",
     "talkToAgent": "Talk to agent",
     "agentFormTitle": "Contact Agent",
     "name": "Full name",
     "email": "Email",
     "phone": "Phone",
     "message": "Message",
     "submit": "Submit",
     "cancel": "Cancel",
     "successMessage": "Successfully sent! Agent will contact you soon.",
     "errorMessage": "Error. Please try again.",
     "typing": "Typing...",
     "closeChat": "Close chat",
     "openChat": "Open chat"
   }
   ```

---

## Testiranje

### Srpski Jezik

1. Idi na: `http://localhost:3002/sr`
2. Klikni na chatbot (donji desni ugao)
3. Naslov treba da bude: **"Pomoć"**
4. Probaj pitanja:
   - "Kako da prodam stan?"
   - "Kolika je provizija?"
   - "Pomažete li sa kreditom?"

### Engleski Jezik

1. Idi na: `http://localhost:3002/en`
2. Klikni na chatbot
3. Naslov treba da bude: **"Help"**
4. Probaj pitanja:
   - "How to sell my apartment?"
   - "What is the commission?"
   - "Do you help with loans?"

---

## Tehnički Detalji

### Frontend

**Chatbot.tsx** koristi:
```tsx
import { useTranslations, useLocale } from 'next-intl';

const t = useTranslations('Chatbot');
const locale = useLocale(); // 'sr' ili 'en'

// Primer korišćenja
<h3>{t('title')}</h3>
<input placeholder={t('placeholder')} />
```

Locale se šalje u API poziv:
```tsx
body: JSON.stringify({
  message: inputValue,
  locale: locale, // 'sr' ili 'en'
  conversationHistory: messages,
})
```

### Backend

**chatbot.controller.ts** prima locale:
```typescript
export class SendMessageDto {
  message: string;
  locale?: string; // 'sr' ili 'en'
  conversationHistory?: Array<{ role: string; content: string }>;
}
```

**chatbot.service.ts** koristi locale za:

1. **System Prompt:**
```typescript
const systemPrompts = {
  sr: `Ti si AI asistent za Olymp Nekretnine...`,
  en: `You are an AI assistant for Olymp Real Estate...`,
};
const systemPrompt = systemPrompts[locale] || systemPrompts.sr;
```

2. **Fallback Odgovori:**
```typescript
private getFallbackResponse(message: string, locale: string = 'sr') {
  if (locale === 'en') {
    // English responses
    if (message.includes('sell')) {
      return { reply: 'To sell your property...' };
    }
  } else {
    // Serbian responses
    if (message.includes('prodaj')) {
      return { reply: 'Da biste prodali nekretninu...' };
    }
  }
}
```

3. **Agent Success Messages:**
```typescript
const successMessages = {
  sr: 'Vaš zahtev je prosleđen našem timu...',
  en: 'Your request has been forwarded...',
};
return { message: successMessages[locale] };
```

---

## Dodavanje Novih Prevoda

### Korak 1: Dodaj u Translation Files

**apps/user-web/messages/sr.json:**
```json
"Chatbot": {
  "newKey": "Nova poruka"
}
```

**apps/user-web/messages/en.json:**
```json
"Chatbot": {
  "newKey": "New message"
}
```

### Korak 2: Koristi u Frontend-u

```tsx
<div>{t('newKey')}</div>
```

### Korak 3: Ažuriraj Backend (ako je potrebno)

U `chatbot.service.ts`, dodaj novi fallback response:

```typescript
if (lowerMessage.includes('novi keyword')) {
  if (locale === 'en') {
    return { reply: 'English response...' };
  }
  return { reply: 'Srpski odgovor...' };
}
```

---

## Česta Pitanja

**Q: Kako bot zna koji jezik da koristi?**  
A: Frontend automatski detektuje locale iz URL-a (`/sr` ili `/en`) i šalje ga u svakom API pozivu.

**Q: Šta ako korisnik pita na engleskom dok je na srpskoj verziji sajta?**  
A: Gemini AI može razumeti oba jezika i pokušaće odgovoriti na jeziku pitanja, ali će preferirati jezik setovan u system prompt-u (koji zavisi od locale-a).

**Q: Da li fallback odgovori rade bez AI?**  
A: Da! Ako nema Gemini API key-a, bot koristi predefinisane odgovore na pravom jeziku.

**Q: Mogu li dodati treći jezik (npr. nemački)?**  
A: Da! Dodaj:
1. `de.json` u `messages/`
2. `de` case u `systemPrompts` objektu (backend)
3. `de` case u svim fallback responses (backend)
4. Dodaj `de` u `welcomeMessages` (frontend)

---

## Summary

✅ **Potpuna multilingual podrška** (srpski + engleski)  
✅ **Frontend** - svi UI elementi prevedeni  
✅ **Backend** - AI odgovori prilagođeni jeziku  
✅ **Fallback** - radi i bez API key-a na oba jezika  
✅ **Automatska detekcija** - koristi locale iz URL-a  

**Rezultat:** Profesionalan, potpuno lokalizovan chatbot! 🎉
