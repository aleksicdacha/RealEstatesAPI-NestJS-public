# Public API Security Implementation

## Pregled

Implementirana je separacija između admin i public API-ja kako bi se zaštitili osetljivi podaci od potencijalnih kupaca koji pregledaju nekretnine na user-web aplikaciji.

## Arhitektura

### 1. **Public DTO** (`PublicPropertyDto`)
Definiše koje podatke kupci mogu da vide:
- ✅ **Javni podaci**: cena, površina, adresa, tip, status, slike, itd.
- ❌ **Skriveni podaci**: `salePrice`, `comment`, `client`, `createdAt`, `updatedAt`

### 2. **Endpointi**

#### Admin Endpointi (sa svim podacima)
- `GET /v1/properties` - Lista svih nekretnina
- `GET /v1/properties/:guid` - Pojedinačna nekretnina

#### Public Endpointi (sanitizovani podaci)
- `GET /v1/properties/public` - Lista nekretnina za kupce
- `GET /v1/properties/public/:guid` - Detalji nekretnine za kupce

### 3. **Implementacija**

**Backend (NestJS)**:
```typescript
// Service
async findAllPublic(options: FilterPropertyDto): Promise<Pagination<PublicPropertyDto>> {
  const [items, totalItems] = await this.propertyRepository.findFilteredProperties(options);
  const publicItems = items.map(property => this.transformToPublicDto(property));
  return new Pagination<PublicPropertyDto>(publicItems, meta);
}

private transformToPublicDto(property: Property): PublicPropertyDto {
  // Eksplicitno vraća samo dozvoljene podatke
  // Automatski isključuje: salePrice, comment, client, timestamps
}
```

**Frontend (user-web)**:
```typescript
// Koristi /properties/public endpoint
const url = `${API_BASE_URL}/properties/public?${queryParams}`;
```

## Skriveni Podaci

### 1. **salePrice** (Prodajna cena za agenciju)
- **Razlog**: Interna cena za vlasnika, ne treba da bude vidljiva kupcima
- **Alternativa**: Pokazuje se samo `price` (javna tražena cena)

### 2. **comment** (Interni komentari)
- **Razlog**: Privatne beleške agenta ili admin korisnika
- **Primer**: "Vlasnik spreman na popust", "Hitno prodaje", itd.

### 3. **client** (Informacije o vlasniku)
- **Razlog**: Zaštita privatnosti vlasnika
- **Podaci**: ime, telefon, email, adresa vlasnika
- **Alternativa**: Kupci kontaktiraju agenciju, ne vlasnika direktno

### 4. **createdAt / updatedAt** (Metapodaci)
- **Razlog**: Interni podaci za administraciju
- **Upotreba**: Praćenje kada je nekretnina dodata/ažurirana

## Testiranje

```bash
# Lista nekretnina - uporedi admin vs public
curl "http://localhost:3000/v1/properties?limit=1" | jq '.items[0] | keys'
curl "http://localhost:3000/v1/properties/public?limit=1" | jq '.items[0] | keys'

# Pojedinačna nekretnina
curl "http://localhost:3000/v1/properties/:guid" | jq 'keys'
curl "http://localhost:3000/v1/properties/public/:guid" | jq 'keys'
```

## Benefiti

1. **Security by Design**: Podrazumevano sakrivanje osetljivih podataka
2. **Type Safety**: TypeScript validacija kroz DTO
3. **Maintainability**: Jasna separacija admin vs public logike
4. **Compliance**: Zaštita privatnosti vlasnika i internih podataka
5. **Developer Tools**: Kupci ne mogu videti osetljive podatke čak ni u dev tools

## Files Modified

- `apps/api/src/entities/property/dto/public-property.dto.ts` (new)
- `apps/api/src/entities/property/property.service.ts`
- `apps/api/src/entities/property/property.controller.ts`
- `apps/user-web/lib/api.ts`

## Deployment Notes

- **Backend**: Samo backend (API, Postgres, Redis) ide kroz Docker
- **Frontends**: Admin-web i user-web direktno kroz npm (hot reload za razvoj)
- **Production**: Razmotriti CORS i rate limiting za public endpointe
