# Property & Client Entity Extension - Implementation Plan

## 📋 Overview
Proširenje Property i Client entiteta sa novim poljima, uključujući Representative (Zastupnik) kao novi entitet.

---

## 1️⃣ DATABASE CHANGES

### A. Property Entity - Nova Polja

| Srpski Naziv | English Name | Type | Validation | Notes |
|--------------|--------------|------|------------|-------|
| Broj ugovora | contractNumber | VARCHAR(100) | nullable | Contract number |
| KP (katastarska parcela) | cadastralParcel | VARCHAR(100) | nullable | Cadastral parcel |
| KO (katastarska opština) | cadastralMunicipality | VARCHAR(100) | nullable | Cadastral municipality |
| Orijentacija | orientation | ENUM | nullable | North, South, East, West, NorthEast, NorthWest, SouthEast, SouthWest |
| YouTube URL | youtubeUrl | VARCHAR(500) | nullable, URL format | YouTube video link |
| Specijalna ponuda | specialOffer | INT | nullable, 1-20 | Display order on homepage (1=highest priority) |

**Migration:**
```typescript
ALTER TABLE properties 
  ADD COLUMN contractNumber VARCHAR(100),
  ADD COLUMN cadastralParcel VARCHAR(100),
  ADD COLUMN cadastralMunicipality VARCHAR(100),
  ADD COLUMN orientation VARCHAR(20),
  ADD COLUMN youtubeUrl VARCHAR(500),
  ADD COLUMN specialOffer INT CHECK (specialOffer BETWEEN 1 AND 20);
```

---

### B. Client Entity - Proširenje Postojećih Polja

| Srpski Naziv | English Name | Type | Validation | Notes |
|--------------|--------------|------|------------|-------|
| Ime vlasnika | ownerName | TEXT | nullable | Owner's full name |
| Adresa | ownerAddress | TEXT | nullable | Owner's address |
| Telefon | ownerPhone | TEXT | nullable | Owner's phone |
| JMBG | ownerJmbg | VARCHAR(13) | nullable, digits only, length=13 | Unique national ID |
| Mesto rođenja | ownerBirthplace | TEXT | nullable | Place of birth |
| Broj lične karte | ownerIdCardNumber | VARCHAR(50) | nullable | ID card number |
| Mesto izdavanja LK | ownerIdCardIssuePlace | TEXT | nullable | ID card issue location |

**Migration:**
```typescript
ALTER TABLE clients
  ADD COLUMN ownerName TEXT,
  ADD COLUMN ownerAddress TEXT,
  ADD COLUMN ownerPhone TEXT,
  ADD COLUMN ownerJmbg VARCHAR(13),
  ADD COLUMN ownerBirthplace TEXT,
  ADD COLUMN ownerIdCardNumber VARCHAR(50),
  ADD COLUMN ownerIdCardIssuePlace TEXT;
```

---

### C. Representative Entity - NOVI ENTITET (Zastupnik)

**Relationship:** `Client 1:1 Representative` (optional)

| Srpski Naziv | English Name | Type | Validation | Notes |
|--------------|--------------|------|------------|-------|
| Ime zastupnika | representativeName | TEXT | nullable | Representative's full name |
| Adresa | representativeAddress | TEXT | nullable | Representative's address |
| Telefon | representativePhone | TEXT | nullable | Representative's phone |
| JMBG | representativeJmbg | VARCHAR(13) | nullable, digits only, length=13 | Unique national ID |
| Mesto rođenja | representativeBirthplace | TEXT | nullable | Place of birth |
| Broj lične karte | representativeIdCardNumber | VARCHAR(50) | nullable | ID card number |
| Mesto izdavanja LK | representativeIdCardIssuePlace | TEXT | nullable | ID card issue location |

**Table Structure:**
```typescript
CREATE TABLE representatives (
  id UUID PRIMARY KEY,
  clientId UUID REFERENCES clients(id) ON DELETE CASCADE,
  representativeName TEXT,
  representativeAddress TEXT,
  representativePhone TEXT,
  representativeJmbg VARCHAR(13),
  representativeBirthplace TEXT,
  representativeIdCardNumber VARCHAR(50),
  representativeIdCardIssuePlace TEXT,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

---

## 2️⃣ BACKEND CHANGES

### Files to Modify/Create:

#### A. Entities
- [ ] `apps/api/src/entities/property/property.entity.ts` - Add new fields
- [ ] `apps/api/src/entities/property/enums/orientation.enum.ts` - NEW FILE
- [ ] `apps/api/src/entities/client/client.entity.ts` - Add owner fields + representative relation
- [ ] `apps/api/src/entities/representative/representative.entity.ts` - NEW ENTITY
- [ ] `apps/api/src/entities/representative/representative.module.ts` - NEW MODULE

#### B. DTOs
- [ ] `apps/api/src/entities/property/dto/create-property.dto.ts` - Add new fields
- [ ] `apps/api/src/entities/property/dto/update-property.dto.ts` - Add new fields
- [ ] `apps/api/src/entities/property/dto/public-property.dto.ts` - Add youtubeUrl, specialOffer
- [ ] `apps/api/src/entities/client/dto/create-client.dto.ts` - Add owner + representative fields
- [ ] `apps/api/src/entities/client/dto/update-client.dto.ts` - Add owner + representative fields
- [ ] `apps/api/src/entities/representative/dto/` - NEW DTOs

#### C. Services & Controllers
- [ ] `apps/api/src/entities/property/property.service.ts` - Handle new fields
- [ ] `apps/api/src/entities/client/client.service.ts` - Handle representative creation/update
- [ ] `apps/api/src/entities/representative/representative.service.ts` - NEW SERVICE

#### D. Migrations
- [ ] `apps/api/src/migrations/TIMESTAMP-AddPropertyExtendedFields.ts` - NEW MIGRATION
- [ ] `apps/api/src/migrations/TIMESTAMP-AddClientOwnerFields.ts` - NEW MIGRATION
- [ ] `apps/api/src/migrations/TIMESTAMP-CreateRepresentativeEntity.ts` - NEW MIGRATION

---

## 3️⃣ ADMIN-WEB CHANGES

### A. PropertyForm (Wizard Step 1)
**File:** `apps/admin-web/src/app/components/wizard-steps/PropertyForm.tsx`

Add fields:
```typescript
- contractNumber: InputText
- cadastralParcel: InputText
- cadastralMunicipality: InputText
- orientation: Dropdown (8 options)
- youtubeUrl: InputText with URL validation
- specialOffer: InputNumber (1-20)
```

### B. ClientForm (Wizard Step 2)
**File:** `apps/admin-web/src/app/components/wizard-steps/ClientForm.tsx`

Add sections:
1. **Owner Information (Vlasnik):**
   - ownerName, ownerAddress, ownerPhone
   - ownerJmbg (13 digits max, numeric only)
   - ownerBirthplace, ownerIdCardNumber, ownerIdCardIssuePlace

2. **Representative Section (Zastupnik) - TOGGLE:**
   - Button: "Dodaj Zastupnika" / "Add Representative"
   - When clicked, shows form with same fields as owner
   - representativeName, representativeAddress, representativePhone
   - representativeJmbg (13 digits max, numeric only)
   - representativeBirthplace, representativeIdCardNumber, representativeIdCardIssuePlace

### C. Property Preview/Edit Pages
- [ ] `apps/admin-web/src/app/[locale]/properties/page.tsx` - Show new fields in table
- [ ] Property detail view - Display all new fields

---

## 4️⃣ USER-WEB CHANGES

### A. PropertyDetailClient
**File:** `apps/user-web/app/[locale]/properties/[...slug]/PropertyDetailClient.tsx`

Add display sections:
- Orientation (with icon)
- YouTube embed (if youtubeUrl exists)
- Cadastral info (KP, KO) - maybe in "Details" accordion

### B. Home Page - Special Offers
**File:** `apps/user-web/app/[locale]/page.tsx`

- Query properties with `specialOffer IS NOT NULL`
- Order by `specialOffer ASC`
- Display in featured section
- Limit to top 6-8 properties

---

## 5️⃣ TRANSLATIONS

### Files to Update:
- `apps/admin-web/messages/sr.json`
- `apps/admin-web/messages/en.json`
- `apps/user-web/messages/sr.json`
- `apps/user-web/messages/en.json`

### New Keys Needed:

**Property Fields:**
```json
{
  "contractNumber": "Contract Number / Broj ugovora",
  "cadastralParcel": "Cadastral Parcel / KP",
  "cadastralMunicipality": "Cadastral Municipality / KO",
  "orientation": "Orientation / Orijentacija",
  "youtubeUrl": "YouTube URL",
  "specialOffer": "Special Offer / Specijalna ponuda",
  "specialOfferOrder": "Display Order (1-20) / Redosled prikaza (1-20)"
}
```

**Orientation Values:**
```json
{
  "orientationNorth": "North / Sever",
  "orientationSouth": "South / Jug",
  "orientationEast": "East / Istok",
  "orientationWest": "West / Zapad",
  "orientationNorthEast": "NorthEast / Severoistok",
  "orientationNorthWest": "NorthWest / Severozapad",
  "orientationSouthEast": "SouthEast / Jugoistok",
  "orientationSouthWest": "SouthWest / Jugozapad"
}
```

**Client/Owner Fields:**
```json
{
  "ownerInformation": "Owner Information / Informacije o vlasniku",
  "ownerName": "Owner Name / Ime vlasnika",
  "ownerAddress": "Owner Address / Adresa vlasnika",
  "ownerPhone": "Owner Phone / Telefon vlasnika",
  "ownerJmbg": "JMBG (National ID) / JMBG",
  "ownerBirthplace": "Place of Birth / Mesto rođenja",
  "ownerIdCardNumber": "ID Card Number / Broj lične karte",
  "ownerIdCardIssuePlace": "ID Card Issue Place / Mesto izdavanja LK",
  
  "representative": "Representative / Zastupnik",
  "addRepresentative": "Add Representative / Dodaj Zastupnika",
  "removeRepresentative": "Remove Representative / Ukloni Zastupnika",
  "representativeName": "Representative Name / Ime zastupnika",
  "representativeAddress": "Representative Address / Adresa zastupnika",
  "representativePhone": "Representative Phone / Telefon zastupnika",
  "representativeJmbg": "Representative JMBG / JMBG zastupnika",
  "representativeBirthplace": "Representative Birthplace / Mesto rođenja zastupnika",
  "representativeIdCardNumber": "Representative ID Card / Broj LK zastupnika",
  "representativeIdCardIssuePlace": "ID Card Issue Place / Mesto izdavanja LK zastupnika"
}
```

---

## 6️⃣ VALIDATION RULES

### JMBG Validation (Frontend & Backend):
```typescript
// Max 13 characters, digits only
const jmbgPattern = /^\d{0,13}$/;
const jmbgValidation = (value: string) => {
  if (!value) return true; // Optional field
  if (!/^\d{13}$/.test(value)) {
    return 'JMBG must be exactly 13 digits';
  }
  return true;
};
```

### Special Offer Validation:
```typescript
// Between 1 and 20
const specialOfferValidation = (value: number) => {
  if (!value) return true; // Optional
  if (value < 1 || value > 20) {
    return 'Special offer must be between 1 and 20';
  }
  return true;
};
```

### YouTube URL Validation:
```typescript
// Must be valid YouTube URL
const youtubeUrlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
```

---

## 7️⃣ IMPLEMENTATION ORDER

1. ✅ Backend: Create migrations
2. ✅ Backend: Update entities (Property, Client, Representative)
3. ✅ Backend: Update DTOs
4. ✅ Backend: Update services
5. ✅ Backend: Run migrations
6. ✅ Admin-web: Update PropertyForm
7. ✅ Admin-web: Update ClientForm with Representative section
8. ✅ Admin-web: Update preview/list pages
9. ✅ User-web: Update PropertyDetail
10. ✅ User-web: Add Special Offers to homepage
11. ✅ Add translations
12. ✅ Test complete flow

---

## 8️⃣ API SECURITY NOTE

**Public API should NOT expose:**
- contractNumber
- cadastralParcel, cadastralMunicipality (debatable - might be okay)
- owner personal info (JMBG, ID card, birthplace)
- representative info

**Public API CAN expose:**
- orientation
- youtubeUrl
- specialOffer (for sorting, not necessarily display)

Update `PublicPropertyDto` accordingly.

---

## 🚀 Ready to Start?

This is a comprehensive plan. Let me know when to proceed with implementation!
