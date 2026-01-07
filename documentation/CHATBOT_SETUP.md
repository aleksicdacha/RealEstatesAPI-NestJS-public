# Chatbot Setup Instructions

## 🤖 Google Gemini AI Chatbot

Implementiran chatbot sistem sa Google Gemini API (besplatno!)

### 📋 Setup Koraci

#### 1. Dobij Google Gemini API Key (BESPLATNO)

1. Idi na: https://makersuite.google.com/app/apikey
2. Klikni "Get API Key"
3. Klikni "Create API key in new project"
4. Kopiraj API key

#### 2. Dodaj API Key u Backend

```bash
cd apps/api
```

Dodaj u `.env` fajl:
```bash
GEMINI_API_KEY=your_actual_api_key_here
```

#### 3. Instaliraj Dependency

```bash
cd apps/api
npm install @google/generative-ai
```

#### 4. Dodaj ChatbotModule u app.module.ts

Otvori `apps/api/src/app.module.ts` i dodaj:

```typescript
import { ChatbotModule } from './entities/chatbot/chatbot.module';

// U imports array dodaj:
imports: [
  // ... ostali moduli
  ChatbotModule,
],
```

#### 5. Dodaj Chatbot u Layout (user-web)

Otvori `apps/user-web/app/[locale]/layout.tsx` i dodaj:

```typescript
import { Chatbot } from '@/app/components/Chatbot';

// U return deo, iznad closing </body> taga:
<Chatbot />
```

#### 6. Pokreni Servise

```bash
# Terminal 1 - Backend
cd apps/api
npm run start:dev

# Terminal 2 - Frontend
cd apps/user-web
npm run dev
```

### ✨ Funkcionalnosti

✅ **AI odgovori** - Gemini API za inteligentne odgovore
✅ **Restrikcija tema** - Odgovara SAMO na pitanja o nekretninama
✅ **Chat history** - Čuva se u localStorage
✅ **Live agent** - Mogućnost kontakta sa pravim agentom
✅ **Responsive design** - Radi na svim uređajima
✅ **Predefinisani odgovori** - Fallback ako API ne radi

### 📊 Limitacije (Gemini Free Tier)

- 60 requests/min
- 1500 requests/day
- 1 million tokens/min

**Za production:** Ovi limiti su sasvim dovoljni!

### 🎨 Customization

#### Promeni System Prompt

U `apps/api/src/entities/chatbot/chatbot.service.ts`, promeni `systemPrompt` string prema svojim potrebama.

#### Dodaj Više Fallback Odgovora

U `getFallbackResponse()` metodu dodaj više if uslova za česta pitanja.

#### Promeni Boju

U `apps/user-web/app/components/Chatbot.tsx`, zameni `orange` sa bilo kojom Tailwind bojom:
- `orange-600` → `blue-600`
- `from-orange-500` → `from-blue-500`

### 🔧 Troubleshooting

**Problem:** API Key error
**Rešenje:** Proveri da li je `GEMINI_API_KEY` setovan u `.env` i restartuj backend

**Problem:** CORS error
**Rešenje:** Backend već ima CORS enabled u `main.ts`

**Problem:** Chat se ne prikazuje
**Rešenje:** Proveri da li je `<Chatbot />` dodat u layout.tsx

### 💡 Alternative (ako ne želiš Gemini)

Chatbot već ima **fallback mode** sa predefinisanim odgovorima. Ako ne dodaš API key, koristiće samo predefinisane odgovore što je potpuno funkcionalno za osnovna pitanja!

### 📞 Live Agent Feature

Kada korisnik klikne "Razgovaraj sa agentom", možeš integrisati:
- **Email notifikaciju** (SendGrid, Mailgun)
- **CRM sistem** (Salesforce, HubSpot)
- **Slack/Discord webhook**
- **Database storage** za kasnije praćenje

Trenutno samo loguje u konzolu, lako se nadogradi!

---

**Ukupan trošak:** $0 (BESPLATNO) 🎉
