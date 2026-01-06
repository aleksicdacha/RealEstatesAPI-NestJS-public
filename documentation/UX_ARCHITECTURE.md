# User-Web UX Architecture

## Component Hierarchy

```
prodaja/page.tsx
│
├── PropertyFilters
│   ├── Language Switcher Bar (NEW)
│   │   ├── Label: "Select Language" / "Izaberite jezik"
│   │   ├── Button: 🇷🇸 Srpski
│   │   └── Button: 🇬🇧 English
│   │
│   └── Filters Bar
│       ├── City Dropdown
│       ├── Location Dropdown
│       ├── Property Type Dropdown
│       ├── Price Range
│       ├── Area Range
│       ├── Rooms Dropdown
│       └── More Filters
│
├── Property Grid
│   └── PropertyCard (multiple)
│       ├── onMouseEnter → setSelectedPropertyId(property.id)
│       └── onMouseLeave → setSelectedPropertyId(null)
│
└── PropertyMap
    ├── Receives: properties (filtered)
    ├── Receives: selectedPropertyId
    ├── Effect: Watch selectedPropertyId changes
    │   ├── Pan to property location
    │   ├── Zoom to level 15-16
    │   └── Bounce marker animation
    └── Renders: Google Map with custom markers
```

---

## Data Flow Diagram

```
User Actions → State Changes → UI Updates

1. Language Switch
   User clicks "English"
   → router.push('/en/prodaja')
   → Page reloads with English locale
   → All t() calls use en.json
   → UI displays English text

2. Property Hover
   User hovers PropertyCard
   → onHover(property.id) called
   → setSelectedPropertyId(property.id)
   → PropertyMap receives new selectedPropertyId prop
   → useEffect triggers
   → Map pans to location
   → Marker bounces

3. Filter Change
   User selects "Niš" city
   → handleFilterChange({ city: 'Niš' })
   → loadProperties(newFilters) called
   → API fetches filtered properties
   → setProperties(filteredData)
   → PropertyMap receives new properties array
   → Old markers removed, new markers created
   → Map auto-fits to new marker bounds
```

---

## Translation System Flow

```
Component Render
│
├── useTranslations('namespace')
│   └── Returns t() function
│
├── t('key')
│   ├── Reads current locale from URL
│   ├── Loads messages/{locale}.json
│   └── Returns translated string
│
└── Fallback on missing key
    ├── Development: Shows warning in console
    └── Production: Returns key name
```

### Example
```tsx
const t = useTranslations('Properties');
const tCommon = useTranslations('Common');

<span>{tCommon('selectLanguage')}</span>
// Serbian: "Izaberite jezik"
// English: "Select Language"

<span>{t('apartment')}</span>
// Serbian: "Stan"
// English: "Apartment"
```

---

## Map Synchronization Logic

```javascript
// PropertyMap.tsx - useEffect for selectedPropertyId

useEffect(() => {
  if (!selectedPropertyId) {
    // No selection → Fit all markers
    const bounds = new LatLngBounds();
    markers.forEach(m => bounds.extend(m.position));
    map.fitBounds(bounds);
    return;
  }

  // Find selected property
  const property = properties.find(p => p.id === selectedPropertyId);
  
  if (property) {
    // Pan to location
    map.panTo({ lat: property.lat, lng: property.lon });
    
    // Zoom if needed
    if (map.getZoom() < 15) {
      map.setZoom(16);
    }
    
    // Animate marker
    const marker = markersRef.current[property.id];
    marker.classList.add('animate-bounce');
    
    setTimeout(() => {
      marker.classList.remove('animate-bounce');
    }, 1500);
  }
}, [selectedPropertyId, properties]);
```

---

## CSS Class Patterns

### Language Switcher
```tsx
// Active button (current language)
className="bg-orange-600 text-white shadow-md"

// Inactive button
className="bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
```

### Filter Dropdowns
```tsx
// Dropdown item - default
className="text-gray-700 hover:bg-gray-50"

// Dropdown item - active
className="bg-primary-50 text-primary-600 font-medium"
```

### Property Cards
```tsx
// Card container
className="hover:shadow-2xl transition-all hover:-translate-y-1"

// On hover → triggers map animation
onMouseEnter={() => onHover(property.id)}
```

---

## API Integration

### Filter to API Mapping
```javascript
// Frontend Filter → Backend Query Parameter
{
  city: 'Niš'              → ?city=Niš
  propertyType: 'Apartment' → ?propertyType=Apartment
  numberOfRooms: '2'       → ?roomStructure=2
  priceFrom: '50000'       → ?minPrice=50000
  elevator: true           → ?elevator=true
  floor: '2-4'             → ?floors=2-4
}
```

### Response Handling
```javascript
fetchProperties(params)
  → GET /v1/properties/public?city=Niš&roomStructure=2
  → Returns { items: Property[], total: number }
  → setProperties(items)
  → PropertyMap renders markers for items
  → PropertyGrid displays items as cards
```

---

## Performance Optimizations

### 1. Marker Clustering
- **Threshold**: 10+ properties
- **Library**: @googlemaps/markerclusterer
- **Effect**: Groups nearby markers at low zoom levels

### 2. Lazy Rendering
- **Property Cards**: priority={index < 6} for above-fold images
- **Map**: Renders only after Google Maps API loads
- **Dropdowns**: Render on click, not on mount

### 3. Animation Throttling
```javascript
const [isAnimating, setIsAnimating] = useState(false);

// Prevent overlapping animations
if (isAnimating) {
  clearTimeout(animationTimeout);
}
setIsAnimating(true);
setTimeout(() => setIsAnimating(false), 1500);
```

### 4. Re-render Prevention
- **Map ref**: Stored in useRef to avoid recreating map instance
- **Marker refs**: Stored in useRef(Map<string, Marker>)
- **useEffect deps**: Only triggers on actual property/selection changes

---

## Browser DevTools Tips

### Check Translations
```javascript
// Console: Find all translation keys used
document.body.innerHTML.match(/data-key="([^"]+)"/g)

// Check for missing translations
localStorage.getItem('next-intl-debug')
```

### Inspect Map State
```javascript
// Get map instance (if exposed)
window.googleMapInstance = mapRef.current;

// Check current zoom
window.googleMapInstance.getZoom();

// Check current center
window.googleMapInstance.getCenter().toJSON();
```

### Monitor Property Selection
```javascript
// React DevTools: Watch component state
// prodaja/page.tsx → selectedPropertyId
```

---

## File Structure Summary

```
apps/user-web/
├── app/
│   ├── [locale]/
│   │   ├── prodaja/page.tsx         ← Main sale page
│   │   ├── izdavanje/page.tsx       ← Main rent page
│   │   └── layout.tsx               ← Locale wrapper
│   └── components/
│       ├── PropertyFilters.tsx      ← 🆕 Language switcher added
│       ├── PropertyMap.tsx          ← 🆕 Animation sync added
│       ├── PropertyCard.tsx         ← Hover handler
│       └── Header.tsx               ← Original language switcher
├── messages/
│   ├── en.json                      ← 🆕 New keys added
│   └── sr.json                      ← 🆕 New keys added
└── lib/
    └── api.ts                       ← Fetch functions
```

---

## Testing Matrix

| Feature | Serbian | English | Mobile | Desktop |
|---------|---------|---------|--------|---------|
| Language Switcher Visible | ✅ | ✅ | ✅ | ✅ |
| Translations Complete | ✅ | ✅ | ✅ | ✅ |
| Text Visibility | ✅ | ✅ | ✅ | ✅ |
| Map Hover Animation | ✅ | ✅ | N/A | ✅ |
| Map Filter Sync | ✅ | ✅ | ✅ | ✅ |
| Property Cards Display | ✅ | ✅ | ✅ | ✅ |
| Dropdown Functionality | ✅ | ✅ | ✅ | ✅ |

---

**Legend**:
- ✅ Implemented and tested
- 🆕 New feature added
- N/A Not applicable (map hidden on mobile)

---

**Documentation Links**:
- [Full Implementation Guide](UX_IMPROVEMENTS_IMPLEMENTATION.md)
- [Quick Reference](QUICK_REFERENCE_UX.md)
- [Filter System](FILTER_SYSTEM_COMPLETE.md)
- [Monorepo Structure](MONOREPO_README.md)
