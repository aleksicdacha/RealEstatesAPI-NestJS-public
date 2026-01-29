"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatbotService = void 0;
const common_1 = require("@nestjs/common");
const generative_ai_1 = require("@google/generative-ai");
const property_service_1 = require("../property/property.service");
const agent_chat_service_1 = require("../agent-chat/agent-chat.service");
const agent_chat_gateway_1 = require("../agent-chat/agent-chat.gateway");
let ChatbotService = class ChatbotService {
    propertyService;
    agentChatService;
    agentChatGateway;
    genAI;
    model;
    constructor(propertyService, agentChatService, agentChatGateway) {
        this.propertyService = propertyService;
        this.agentChatService = agentChatService;
        this.agentChatGateway = agentChatGateway;
        const apiKey = process.env.GEMINI_API_KEY || 'YOUR_API_KEY_HERE';
        if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
            console.warn('⚠️ GEMINI_API_KEY not set. Chatbot will use fallback responses.');
        }
        this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({
            model: 'gemini-pro',
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            },
        });
    }
    async processMessage(userMessage, locale = 'sr', conversationHistory) {
        try {
            const lowerMessage = userMessage.toLowerCase();
            const searchKeywords = [
                'koje', 'kakve', 'ima', 'imate', 'ponuda', 'ponudi', 'prodajete',
                'izdajete', 'pronaci', 'pronaći', 'pronađi', 'pronadi', 'trazim', 'tražim', 'treba mi', 'zelim', 'želim', 'zelio',
                'prikazi', 'prikaži', 'pretraga', 'lista', 'listu',
                'which', 'what', 'have', 'offer', 'available', 'looking for', 'need', 'show', 'list'
            ];
            const propertyTypeMentions = [
                'stan', 'stanovi', 'stanove', 'kuća', 'kuca', 'kuce', 'kuće', 'kućama',
                'nekretnina', 'nekretnine', 'nekretninu',
                'apartment', 'apartments', 'house', 'houses', 'property', 'properties'
            ];
            const hasPropertyType = propertyTypeMentions.some(keyword => lowerMessage.includes(keyword));
            const hasSearchIntent = searchKeywords.some(keyword => lowerMessage.includes(keyword)) || hasPropertyType;
            if (hasSearchIntent) {
                const searchResult = await this.searchPropertiesFromQuery(userMessage, locale);
                return {
                    reply: searchResult,
                    timestamp: new Date().toISOString(),
                };
            }
            const systemPrompts = {
                sr: `Ti si AI asistent za Olymp Nekretnine, agenciju za prodaju i izdavanje nekretnina u Srbiji.

VAŽNO - PRAVILA ODGOVARANJA:
- Odgovaraj SAMO na pitanja vezana za nekretnine, kupovinu, prodaju, izdavanje, zakup, hipoteke, kredite i sličnu tematiku
- Ako korisnik pita bilo šta što NIJE vezano za nekretnine, ljubazno odgovori: "Ja sam asistent za nekretnine i mogu odgovoriti samo na pitanja vezana za kupovinu, prodaju ili izdavanje nekretnina. Za ostala pitanja, molim vas da se obratite našem timu."
- Uvek budi ljubazan, profesionalan i koristi srpski jezik
- Ako ne znaš tačan odgovor, preporuči korisniku da klikne na "Razgovaraj sa agentom" dugme

INFORMACIJE O OLYMP NEKRETNINAMA:
- Specijalizovani smo za stanove, kuće, poslovne prostore, zemljište, vikendice
- Pokrivamo celu Srbiju, fokus na Niš, Beograd, Novi Sad
- Nudimo besplatnu procenu nekretnina
- Imamo veliki izbor novih i starih gradnji
- Pomažemo sa dokumentacijom, pravnim pitanjima, i stambenim kreditima
- Kontakt: info@olymp-nekretnine.rs, +381 18 123 456
- Adresa: Nikole Pašića 1, Niš

Odgovaraj kratko, jasno i prijateljski.`,
                en: `You are an AI assistant for Olymp Real Estate, a Serbian real estate agency specializing in buying, selling, and renting properties.

IMPORTANT - RESPONSE RULES:
- Answer ONLY questions related to real estate, buying, selling, renting, mortgages, loans, and similar topics
- If the user asks anything NOT related to real estate, politely respond: "I am a real estate assistant and can only answer questions about buying, selling, or renting properties. For other inquiries, please contact our team."
- Always be kind, professional, and use English language
- If you don't know the exact answer, recommend the user to click the "Talk to agent" button

ABOUT OLYMP REAL ESTATE:
- We specialize in apartments, houses, commercial spaces, land, cottages
- We cover all of Serbia, with focus on Niš, Belgrade, Novi Sad
- We offer free property valuation
- We have a wide selection of new and old constructions
- We assist with documentation, legal matters, and housing loans
- Contact: info@olymp-nekretnine.rs, +381 18 123 456
- Address: Nikole Pašića 1, Niš

Answer briefly, clearly, and friendly.`,
            };
            const systemPrompt = systemPrompts[locale] || systemPrompts.sr;
            if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_API_KEY_HERE') {
                return await this.getFallbackResponse(userMessage, locale);
            }
            const chat = this.model.startChat({
                history: [
                    {
                        role: 'user',
                        parts: [{ text: systemPrompt }],
                    },
                    {
                        role: 'model',
                        parts: [{ text: locale === 'en' ? 'Understood. I am ready to help only with real estate related questions.' : 'Razumem. Spreman sam da pomognem samo sa pitanjima vezanim za nekretnine.' }],
                    },
                    ...conversationHistory.map(msg => ({
                        role: msg.role === 'user' ? 'user' : 'model',
                        parts: [{ text: msg.content }],
                    })),
                ],
            });
            const result = await chat.sendMessage(userMessage);
            const response = await result.response;
            const botReply = response.text();
            return {
                reply: botReply,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            console.error('Gemini API Error:', error);
            return await this.getFallbackResponse(userMessage, locale);
        }
    }
    async getFallbackResponse(message, locale = 'sr') {
        const lowerMessage = message.toLowerCase();
        const realEstateKeywords = [
            'stan', 'stanovi', 'stanove', 'kuća', 'kuca', 'kuce', 'kućа', 'nekretnina', 'nekretnine', 'nekretninu',
            'prodaja', 'kupovina', 'izdavanje', 'zakup', 'kirija', 'kredit', 'hipoteka', 'agencija', 'agent',
            'cena', 'kvadrat', 'soba', 'lokacija', 'novogradnja', 'vikendica', 'procena', 'vrednost', 'vrednosti',
            'plac', 'zemljište', 'zemljiste', 'poslovni', 'lokal', 'kancelarija',
            'apartment', 'apartments', 'house', 'houses', 'property', 'properties', 'sale', 'buy', 'rent',
            'lease', 'mortgage', 'agency', 'price', 'location', 'real estate', 'valuation', 'estimate'
        ];
        const isRealEstateRelated = realEstateKeywords.some(keyword => lowerMessage.includes(keyword));
        if (!isRealEstateRelated) {
            const offTopicResponses = {
                sr: 'Ja sam asistent za nekretnine i mogu odgovoriti samo na pitanja vezana za kupovinu, prodaju ili izdavanje nekretnina. Za ostala pitanja, molim vas da se obratite našem timu klikom na "Razgovaraj sa agentom".',
                en: 'I am a real estate assistant and can only answer questions about buying, selling, or renting properties. For other inquiries, please contact our team by clicking "Talk to agent".',
            };
            return {
                reply: offTopicResponses[locale] || offTopicResponses.sr,
                timestamp: new Date().toISOString(),
            };
        }
        const searchKeywords = [
            'koje', 'kakve', 'ima', 'imate', 'ponuda', 'ponudi', 'prodajete',
            'izdajete', 'pronaci', 'pronaći', 'pronađi', 'pronadi', 'trazim', 'tražim', 'treba mi', 'zelim', 'želim', 'zelio',
            'prikazi', 'prikaži', 'pretraga', 'lista', 'listu',
            'which', 'what', 'have', 'offer', 'available', 'looking for', 'need', 'show', 'list'
        ];
        const hasSearchIntent = searchKeywords.some(keyword => lowerMessage.includes(keyword));
        if (hasSearchIntent) {
            const searchResult = await this.searchPropertiesFromQuery(message, locale);
            return {
                reply: searchResult,
                timestamp: new Date().toISOString(),
            };
        }
        if (locale === 'en') {
            if (lowerMessage.includes('sell') || lowerMessage.includes('selling')) {
                return {
                    reply: 'To sell your property with us:\n\n1. Contact us via email (info@olymp-nekretnine.rs) or phone (+381 18 123 456)\n2. We will schedule a free visit and valuation\n3. We will take professional photos\n4. We will post the listing\n5. We will guide you through the entire process\n\nCommission is 2%. Would you like to schedule a visit?',
                    timestamp: new Date().toISOString(),
                };
            }
            if (lowerMessage.includes('buy') || lowerMessage.includes('buying') || lowerMessage.includes('purchase')) {
                return {
                    reply: 'Great! To find your perfect property:\n\n1. Use filters on the page (location, price, rooms)\n2. Click on the card you like\n3. View all details and photos\n4. Contact us to schedule a viewing\n\nWe have apartments, houses, commercial spaces, and land throughout Serbia. What are you looking for?',
                    timestamp: new Date().toISOString(),
                };
            }
            if (lowerMessage.includes('loan') || lowerMessage.includes('mortgage') || lowerMessage.includes('credit')) {
                return {
                    reply: 'Yes, we help with housing loans! 💰\n\nWe work with:\n- Erste Bank\n- Raiffeisen Bank\n- Intesa Sanpaolo\n- UniCredit\n- and others\n\nWe assist you with:\n✓ Document preparation\n✓ Finding the best offer\n✓ Submitting applications\n✓ Following the entire process\n\nContact our agent for more details.',
                    timestamp: new Date().toISOString(),
                };
            }
            if (lowerMessage.includes('commission') || lowerMessage.includes('fee')) {
                return {
                    reply: 'Our commissions are:\n\n📍 Buying/Selling: 2% of value\n📍 Renting: One monthly rent\n📍 Valuation: FREE\n\nCommission is paid after successful transaction. No hidden costs!\n\nAny other questions?',
                    timestamp: new Date().toISOString(),
                };
            }
            if (lowerMessage.includes('contact')) {
                return {
                    reply: 'You can contact us at:\n\n📧 Email: info@olymp-nekretnine.rs\n📞 Phone: +381 18 123 456\n📍 Address: Nikole Pašića 1, Niš\n\nWorking hours: Mon-Fri 09:00-17:00, Sat 09:00-14:00\n\nYou can also click the "Talk to agent" button below for direct contact!',
                    timestamp: new Date().toISOString(),
                };
            }
            return {
                reply: 'Thank you for your question! I am an AI assistant for Olymp Real Estate.\n\nI can help you with:\n• Selling properties\n• Buying apartments, houses, land\n• Renting properties\n• Housing loans\n• Property valuation\n\nWhat would you like to discuss? Or click "Talk to agent" for direct contact with our team.',
                timestamp: new Date().toISOString(),
            };
        }
        if (lowerMessage.includes('prodaj') || lowerMessage.includes('prodajem')) {
            return {
                reply: 'Da biste prodali nekretninu sa nama:\n\n1. Kontaktirajte nas preko emaila (info@olymp-nekretnine.rs) ili telefona (+381 18 123 456)\n2. Zakazaćemo besplatan obilazak i procenu\n3. Napravićemo profesionalne fotografije\n4. Postavićemo oglas\n5. Vodićemo vas kroz ceo proces do prodaje\n\nProvizija je 2%. Da li želite da zakazete obilazak?',
                timestamp: new Date().toISOString(),
            };
        }
        if (lowerMessage.includes('kupi') || lowerMessage.includes('kupujem')) {
            return {
                reply: 'Super! Da pronađete savršenu nekretninu:\n\n1. Koristite filtere na stranici (lokacija, cena, broj soba)\n2. Kliknite na karticu koja vam se dopada\n3. Pogledajte sve detalje i fotografije\n4. Kontaktirajte nas za zakazivanje obilaska\n\nImamo stanove, kuće, poslovne prostore i zemljišta širom Srbije. Šta tražite?',
                timestamp: new Date().toISOString(),
            };
        }
        if (lowerMessage.includes('kredit') || lowerMessage.includes('hipoteka')) {
            return {
                reply: 'Da, pomažemo sa stambenim kreditima! 💰\n\nImamo saradnju sa:\n- Erste Bank\n- Raiffeisen Bank\n- Intesa Sanpaolo\n- UniCredit\n- i drugima\n\nPomažemo vam sa:\n✓ Pripremom dokumentacije\n✓ Pronalaženjem najbolje ponude\n✓ Podnošenjem zahteva\n✓ Praćenjem celog procesa\n\nKontaktirajte našeg agenta za detaljnije informacije.',
                timestamp: new Date().toISOString(),
            };
        }
        if (lowerMessage.includes('provizija') || lowerMessage.includes('cena usluge')) {
            return {
                reply: 'Naše provizije su:\n\n📍 Kupovina/Prodaja: 2% od vrednosti\n📍 Izdavanje: Jedna kirija\n📍 Procena: BESPLATNO\n\nProvizija se plaća nakon uspešno završene transakcije. Bez skrivenih troškova!\n\nJoš neko pitanje?',
                timestamp: new Date().toISOString(),
            };
        }
        if (lowerMessage.includes('kontakt') || lowerMessage.includes('kako da vas kontaktiram')) {
            return {
                reply: 'Možete nas kontaktirati na:\n\n📧 Email: info@olymp-nekretnine.rs\n📞 Telefon: +381 18 123 456\n📍 Adresa: Nikole Pašića 1, Niš\n\nRadimo: Pon-Pet 09:00-17:00, Sub 09:00-14:00\n\nMožete i kliknuti na "Razgovaraj sa agentom" dugme ispod za direktan kontakt!',
                timestamp: new Date().toISOString(),
            };
        }
        return {
            reply: 'Hvala na pitanju! Ja sam AI asistent za Olymp Nekretnine.\n\nMogu vam pomoći sa:\n• Prodajom nekretnina\n• Kupovinom stanova, kuća, zemljišta\n• Izdavanjem nekretnina\n• Stambenim kreditima\n• Procenom vrednosti\n\nO čemu biste želeli da razgovaramo? Ili kliknite "Razgovaraj sa agentom" za direktan kontakt sa našim timom.',
            timestamp: new Date().toISOString(),
        };
    }
    async searchPropertiesFromQuery(message, locale = 'sr') {
        const lowerMessage = message.toLowerCase();
        const cities = {
            'niš': 'Niš',
            'nis': 'Niš',
            'beograd': 'Beograd',
            'belgrade': 'Beograd',
            'novi sad': 'Novi Sad',
            'kragujevac': 'Kragujevac',
            'subotica': 'Subotica',
        };
        let city = null;
        for (const [key, value] of Object.entries(cities)) {
            if (lowerMessage.includes(key)) {
                city = value;
                break;
            }
        }
        const locationKeywords = [
            'centar', 'center', 'centru', 'medijana', 'palilula', 'panteli', 'pantelej',
            'crveni krst', 'niška banja', 'niska banja', 'čair', 'cair',
            'periferija', 'periferiji', 'predgrađe', 'predgradje', 'outskirts', 'suburb'
        ];
        let neighborhood = null;
        for (const keyword of locationKeywords) {
            if (lowerMessage.includes(keyword)) {
                neighborhood = keyword;
                break;
            }
        }
        const propertyTypes = {
            'stan': 'Apartment',
            'stanovi': 'Apartment',
            'apartment': 'Apartment',
            'kuća': 'House',
            'kuca': 'House',
            'house': 'House',
            'zemljište': 'Land',
            'zemljiste': 'Land',
            'land': 'Land',
            'lokal': 'CommercialSpace',
            'poslovni': 'CommercialSpace',
            'office': 'Office',
            'kancelarija': 'Office',
            'vikendica': 'VacationHome',
            'duplex': 'Duplex',
        };
        let propertyType = null;
        for (const [key, value] of Object.entries(propertyTypes)) {
            if (lowerMessage.includes(key)) {
                propertyType = value;
                break;
            }
        }
        const isRent = lowerMessage.includes('iznajm') || lowerMessage.includes('kirija') ||
            lowerMessage.includes('zakup') || lowerMessage.includes('rent');
        let minPrice = null;
        let maxPrice = null;
        const rangePricePatterns = [
            /od\s+(\d+)k?\s+do\s+(\d+)k?/i,
            /from\s+(\d+)k?\s+to\s+(\d+)k?/i,
            /(\d+)k?\s*-\s*(\d+)k?/i,
        ];
        let rangeFound = false;
        for (const pattern of rangePricePatterns) {
            const match = message.match(pattern);
            if (match) {
                let min = parseInt(match[1]);
                let max = parseInt(match[2]);
                if (match[0].toLowerCase().includes('k')) {
                    min *= 1000;
                    max *= 1000;
                }
                minPrice = min;
                maxPrice = max;
                rangeFound = true;
                break;
            }
        }
        if (!rangeFound) {
            const maxPricePatterns = [
                /do\s+(\d+)k?/i,
                /max\s+(\d+)k?/i,
                /ispod\s+(\d+)k?/i,
                /under\s+(\d+)k?/i,
                /до\s+(\d+)k?/i,
            ];
            for (const pattern of maxPricePatterns) {
                const match = message.match(pattern);
                if (match) {
                    let value = parseInt(match[1]);
                    if (match[0].toLowerCase().includes('k')) {
                        value *= 1000;
                    }
                    maxPrice = value;
                    break;
                }
            }
            const minPricePatterns = [
                /(?:^|[^\d])od\s+(\d+)k?(?!\s+do)/i,
                /from\s+(\d+)k?(?!\s+to)/i,
                /iznad\s+(\d+)k?/i,
                /above\s+(\d+)k?/i,
                /од\s+(\d+)k?/i,
            ];
            for (const pattern of minPricePatterns) {
                const match = message.match(pattern);
                if (match) {
                    let value = parseInt(match[1]);
                    if (match[0].toLowerCase().includes('k')) {
                        value *= 1000;
                    }
                    minPrice = value;
                    break;
                }
            }
        }
        try {
            const filters = {
                page: 1,
                limit: 5,
                transactionType: isRent ? 'Izdavanje' : 'Prodaja',
            };
            if (city)
                filters.city = city;
            if (neighborhood)
                filters.neighborhood = neighborhood;
            if (propertyType)
                filters.propertyType = propertyType;
            if (minPrice)
                filters.minPrice = minPrice;
            if (maxPrice)
                filters.maxPrice = maxPrice;
            const result = await this.propertyService.findAllPublic(filters);
            if (!result.items || result.items.length === 0) {
                const noResultsMessages = {
                    sr: `Trenutno nemamo nekretnine koje odgovaraju vašim kriterijumima${city ? ` u gradu ${city}` : ''}${neighborhood ? ` u lokaciji ${neighborhood}` : ''}. Pokušajte da promenite kriterijume ili kliknite "Razgovaraj sa agentom" da biste direktno kontaktirali naš tim.`,
                    en: `We currently don't have properties matching your criteria${city ? ` in ${city}` : ''}${neighborhood ? ` in ${neighborhood}` : ''}. Try changing your criteria or click "Talk to agent" to contact our team directly.`,
                };
                return noResultsMessages[locale] || noResultsMessages.sr;
            }
            const propertiesText = result.items.map(p => {
                const typeSlug = (p.propertyType || 'property').toLowerCase().replace(/\s+/g, '-');
                const neighborhoodSlug = (p.neighborhood || 'location').toLowerCase().replace(/\s+/g, '-');
                const slug = `${typeSlug}-${neighborhoodSlug}`;
                const url = `${process.env.FRONTEND_URL || 'http://localhost:3002'}/${locale}/properties/${p.id}/${slug}`;
                return `🏠 ${p.code} - ${p.propertyType || 'N/A'}, ${p.area}m²${p.neighborhood ? ', ' + p.neighborhood : ''}\n   💰 ${p.price ? p.price.toLocaleString() + ' €' : 'N/A'}\n   📍 ${url}`;
            }).join('\n\n');
            let contextSr = '';
            let contextEn = '';
            const propertyTypeTextSr = propertyType
                ? (result.items.length === 1
                    ? (propertyType === 'Apartment' ? 'stan' : propertyType === 'House' ? 'kuću' : 'nekretninu')
                    : (propertyType === 'Apartment' ? 'stana' : propertyType === 'House' ? 'kuće' : 'nekretnine'))
                : (result.items.length === 1 ? 'nekretninu' : result.items.length < 5 ? 'nekretnine' : 'nekretnina');
            const propertyTypeTextEn = propertyType
                ? (propertyType.toLowerCase() + (result.items.length !== 1 ? 's' : ''))
                : (result.items.length === 1 ? 'property' : 'properties');
            if (neighborhood && city) {
                contextSr = `${neighborhood === 'centar' ? 'U centru' : 'Na periferiji'} ${city}a`;
                contextEn = `In ${neighborhood} of ${city}`;
            }
            else if (city) {
                contextSr = `U ${city}u`;
                contextEn = `In ${city}`;
            }
            else if (neighborhood) {
                contextSr = `${neighborhood === 'centar' ? 'U centru' : 'Na periferiji'}`;
                contextEn = `In ${neighborhood}`;
            }
            let pricePartSr = '';
            let pricePartEn = '';
            if (minPrice && maxPrice) {
                pricePartSr = ` od ${minPrice.toLocaleString()}€ do ${maxPrice.toLocaleString()}€`;
                pricePartEn = ` from €${minPrice.toLocaleString()} to €${maxPrice.toLocaleString()}`;
            }
            else if (maxPrice) {
                pricePartSr = ` do ${maxPrice.toLocaleString()}€`;
                pricePartEn = ` up to €${maxPrice.toLocaleString()}`;
            }
            else if (minPrice) {
                pricePartSr = ` od ${minPrice.toLocaleString()}€`;
                pricePartEn = ` from €${minPrice.toLocaleString()}`;
            }
            const fullContextSr = `${contextSr}${pricePartSr}`;
            const fullContextEn = `${contextEn}${pricePartEn}`;
            const responseTexts = {
                sr: `${fullContextSr ? `${fullContextSr} imam ${result.items.length} ${propertyTypeTextSr}` : `Pronašao sam ${result.items.length} ${propertyTypeTextSr}`}:\n\n${propertiesText}\n\n✨ Za više detalja kliknite na link ili kontaktirajte agenta!`,
                en: `${fullContextEn ? `${fullContextEn} I have ${result.items.length} ${propertyTypeTextEn}` : `I found ${result.items.length} ${propertyTypeTextEn}`}:\n\n${propertiesText}\n\n✨ Click the link for more details or contact our agent!`,
            };
            return responseTexts[locale] || responseTexts.sr;
        }
        catch (error) {
            console.error('Error searching properties:', error);
            const errorMessages = {
                sr: 'Došlo je do greške pri pretrazi nekretnina. Molim vas pokušajte ponovo ili kontaktirajte agenta.',
                en: 'An error occurred while searching properties. Please try again or contact our agent.',
            };
            return errorMessages[locale] || errorMessages.sr;
        }
    }
    async connectToAgent(data) {
        const conversation = await this.agentChatService.createConversation({
            guestName: data.name,
            guestEmail: data.email,
            guestPhone: data.phone,
            initialMessage: data.message,
            locale: data.locale || 'sr',
        });
        this.agentChatGateway.notifyNewConversation(conversation.id);
        const successMessages = {
            sr: `Vaš zahtev je prosleđen našem timu. Kontaktiraćemo vas uskoro! (ID razgovora: ${conversation.id})`,
            en: `Your request has been forwarded to our team. We will contact you soon! (Conversation ID: ${conversation.id})`,
        };
        return {
            success: true,
            conversationId: conversation.id,
            message: successMessages[data.locale || 'sr'] || successMessages.sr,
        };
    }
};
exports.ChatbotService = ChatbotService;
exports.ChatbotService = ChatbotService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [property_service_1.PropertyService,
        agent_chat_service_1.AgentChatService,
        agent_chat_gateway_1.AgentChatGateway])
], ChatbotService);
//# sourceMappingURL=chatbot.service.js.map