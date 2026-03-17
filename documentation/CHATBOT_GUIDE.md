# Chatbot Feature - Quick Start Guide

## 🎉 Šta je implementirano?

Potpuno funkcionalan AI chatbot sa sledećim mogućnostima:

### ✨ Glavne Funkcionalnosti

1. **AI Odgovori (Google Gemini)**
   - Koristi najnoviji Gemini Pro model
   - Odgovara SAMO na pitanja o nekretninama
   - Automatski odbija off-topic pitanja
   - **MULTILINGUAL**: Automatski prepoznaje i koristi srpski ili engleski jezik

2. **Fallback Sistem**
   - Predefinisani odgovori za česta pitanja
   - Radi I BEZ API key-a!
   - Pokriva osnovne scenarije
   - Dostupno na oba jezika (sr/en)

3. **Live Agent Kontak**
   - Dugme "Razgovaraj sa agentom" / "Talk to agent"
   - Forma za direktan kontakt
   - Spremno za integraciju sa email/CRM

4. **Chat Perzistencija**
   - Čuva se u localStorage
   - Dugme za brisanje istorije
   - Prikazuje vreme svake poruke

5. **UI/UX**
   - Moderan dizajn sa animacijama
   - Responsive (radi na mobile/desktop)
   - Orange branding koji prati sajt
   - Typing indicator dok čeka odgovor
   - **Potpune translacije** - sve prilagođeno odabranom jeziku

6. **Automatska Detekcija Jezika**
   - Bot automatski koristi jezik koji je korisnik odabrao na sajtu
   - Svi odgovori prilagođeni trenutnom jeziku
   - System prompt prilagođen jeziku
   - Fallback odgovori na pravom jeziku

---

## 🚀 Kako Pokrenuti?

### Opcija 1: Sa Google Gemini AI (Preporučeno)

```bash
# 1. Dobij besplatan API key
# https://makersuite.google.com/app/apikey

# 2. Dodaj u apps/api/.env
echo "GEMINI_API_KEY=your_key_here" >> apps/api/.env

# 3. Pokreni backend
cd apps/api
npm run start:dev

# 4. Pokreni frontend
cd apps/user-web
npm run dev

# 5. Otvori http://localhost:3002
# Videćeš orange button u donjem desnom uglu! 🎉
```

### Opcija 2: Bez AI (Samo Fallback Odgovori)

Ako ne želiš da koristiš Gemini API, **chatbot će automatski raditi** sa predefinisanim odgovorima. Ništa ne treba da dodaješ - samo pokreni aplikaciju!

```bash
# Pokreni kao i obično
npm run dev
```

---

## 📋 Testiranje

### Test Pitanja (sa AI)

Probaj ova pitanja u chatbot-u:

**Srpski:**
1. ✅ "Kako mogu da prodam stan?"
2. ✅ "Pomažete li sa stambenim kreditom?"
3. ✅ "Kolika je vaša provizija?"
4. ✅ "Želim da kupim stan u Beogradu"
5. ❌ "Koji je najjači Pokemon?" → Odbija odgovor

**English:**
1. ✅ "How can I sell my apartment?"
2. ✅ "Do you help with housing loans?"
3. ✅ "What is your commission?"
4. ✅ "I want to buy an apartment in Belgrade"
5. ❌ "What is the strongest Pokemon?" → Rejects answer

### Test Pitanja (bez AI - fallback mode)

**Srpski:**
1. "prodajem stan"
2. "kupujem kuću"
3. "kredit"
4. "provizija"
5. "kontakt"

**English:**
1. "selling apartment"
2. "buying house"
3. "loan"
4. "commission"
5. "contact"

---

## 🎨 Customization

### Promeni Boju Chatbot-a

U `apps/user-web/app/components/Chatbot.tsx`:

```tsx
// Zameni sve `orange` sa tvojom bojom
orange-500 → blue-500
orange-600 → blue-600
from-orange-500 → from-blue-500
```

### Dodaj Više Predefinisanih Odgovora

U `apps/api/src/entities/chatbot/chatbot.service.ts`, dodaj u `getFallbackResponse()`:

```typescript
if (lowerMessage.includes('novogradnja')) {
  return {
    reply: 'Imamo odličan izbor novogradnji! Pogledajte našu ponudu...',
    timestamp: new Date().toISOString(),
  };
}
```

### Promeni System Prompt (AI ponašanje)

U `chatbot.service.ts`, edituj `systemPrompt` string:

```typescript
const systemPrompt = `Ti si asistent za XYZ agenciju...
// Ovde definiši kako AI treba da se ponaša
`;
```

---

## 🔌 Integracije

### Email Notifikacije (kada korisnik traži agenta)

U `chatbot.service.ts` → `connectToAgent()`:

```typescript
// Umesto console.log, dodaj:
await this.emailService.send({
  to: 'agent@olymp.rs',
  subject: 'Novi zahtev sa chata',
  body: `${data.name} (${data.email}) želi razgovor`
});
```

### CRM Integracija

```typescript
// Dodaj u connectToAgent():
await this.crmService.createLead({
  name: data.name,
  email: data.email,
  source: 'chatbot',
  message: data.message
});
```

---

## 📊 Statistika i Analitika

Možeš dodati tracking:

```typescript
// U chatbot.service.ts
async processMessage() {
  // Log pitanje za analitiku
  await this.analytics.trackChatMessage({
    question: userMessage,
    timestamp: new Date(),
    answered: true
  });
  
  // Vraća odgovor...
}
```

---

## ⚙️ Konfiguracija

### Environment Variables

```bash
# apps/api/.env

# Required za AI mode
GEMINI_API_KEY=your_key

# Optional
GEMINI_MODEL=gemini-pro  # ili gemini-pro-vision
CHATBOT_MAX_HISTORY=20   # max poruka u historiji
```

### Gemini API Limitacije (Free Tier)

- **60 requests/minute** - Više nego dovoljno!
- **1500 requests/day** - Za mali/srednji sajt savršeno
- **1 million tokens/minute** - Ogromno

Za većinu sajtova, **free tier je sasvim dovoljan**!

---

## 🐛 Troubleshooting

### Chatbot se ne prikazuje

**Problem:** Ne vidim button  
**Rešenje:**
```bash
# Proveri da li je <Chatbot /> dodat u layout.tsx
grep -r "Chatbot" apps/user-web/app/[locale]/layout.tsx
```

### API Greška

**Problem:** "Gemini API Error"  
**Rešenje:**
1. Proveri API key u .env
2. Restart backend: `npm run start:dev`
3. Proveri konzolu za detalje

### CORS Error

**Problem:** "CORS policy"  
**Rešenje:** Backend već ima CORS enabled. Proveri da backend radi na port 3000.

### Fallback Mode Uvek Aktivan

**Problem:** Chatbot koristi samo predefinisane odgovore  
**Rešenje:** Verovatno API key nije setovan ili nije validan.

---

## 💡 Alternativni LLM Servisi (ako ne želiš Gemini)

### 1. OpenAI GPT-3.5 Turbo
- **Cena:** $5 free credits
- **Prednost:** Najbolji kvalitet
- **Mana:** Treba kreditna kartica

### 2. Hugging Face (Open Source)
- **Cena:** Besplatno
- **Prednost:** Potpuno open source
- **Mana:** Sporiji odgovori

### 3. Ollama (Lokalno)
- **Cena:** Besplatno
- **Prednost:** Potpuna kontrola, privatnost
- **Mana:** Zahteva snažan server

### 4. Together.ai
- **Cena:** $25 free credits
- **Prednost:** Brz, dobar kvalitet
- **Mana:** Ograničeno besplatno

**Moja preporuka:** Ostani na **Gemini** - najbolji odnos cene i kvaliteta! 🏆

---

## 📈 Metrics & Analytics

Možeš pratiti:

- **Broj razgovora dnevno**
- **Najčešća pitanja**
- **Stopa konverzije (chatbot → agent kontakt)**
- **Average response time**

Implementacija:

```typescript
// Dodaj middleware u chatbot.controller.ts
@Post('message')
@UseInterceptors(AnalyticsInterceptor)
async sendMessage() { ... }
```

---

## ✅ Checklist Pre Production

- [ ] Dodao Gemini API key
- [ ] Testirao sve tipove pitanja
- [ ] Proverio fallback mode
- [ ] Podesio system prompt
- [ ] Dodao email notifikacije za agent requests
- [ ] Testirao na mobile uređajima
- [ ] Dodao analytics tracking
- [ ] Podesio rate limiting (već je enabled)

---

## 🎯 Sledeći Koraci (Opciono)

1. **Voice Input** - Dodaj govorno prepoznavanje
2. **Multilingual** - Automatska detekcija jezika
3. **Rich Responses** - Slika, video, property cards direktno u chat
4. **Chatbot Analytics Dashboard** - Vidi statistiku razgovora
5. **A/B Testing** - Testiraj različite system prompts

---

**Trošak:** 0 RSD 🎉  
**Setup vreme:** 5 minuta ⏱️  
**Rezultat:** Profesionalan AI chatbot! 🚀

Prijatno korišćenje!
