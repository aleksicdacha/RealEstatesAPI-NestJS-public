import type { PropertyType, TransactionType, HeatingType } from '@repo/types';

// Format price with currency
export function formatPrice(price: number, currency: string = '€'): string {
  return new Intl.NumberFormat('sr-RS', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price).replace('EUR', currency);
}

// Format area
export function formatArea(area: number): string {
  return `${area} m²`;
}

// Format date
export function formatDate(date: string | Date, locale: string = 'sr-RS'): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

// Format relative time (e.g., "2 days ago")
export function formatRelativeTime(date: string | Date, locale: string = 'sr-RS'): string {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((past.getTime() - now.getTime()) / 1000);
  
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (Math.abs(count) >= 1) {
      return rtf.format(count, interval.label as any);
    }
  }
  
  return rtf.format(diffInSeconds, 'second');
}

// Truncate text
export function truncate(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

// Property type labels
export function getPropertyTypeLabel(type: PropertyType, locale: string = 'sr'): string {
  const labels: Record<PropertyType, { sr: string; en: string }> = {
    APARTMENT: { sr: 'Stan', en: 'Apartment' },
    HOUSE: { sr: 'Kuća', en: 'House' },
    LAND: { sr: 'Plac', en: 'Land' },
    OFFICE: { sr: 'Kancelarija', en: 'Office' },
    COMMERCIAL: { sr: 'Poslovni prostor', en: 'Commercial' },
    GARAGE: { sr: 'Garaža', en: 'Garage' },
    STUDIO: { sr: 'Garsonjera', en: 'Studio' },
    PENTHOUSE: { sr: 'Penthouse', en: 'Penthouse' },
    VILLA: { sr: 'Vila', en: 'Villa' },
    COTTAGE: { sr: 'Vikendica', en: 'Cottage' },
  };
  return labels[type]?.[locale as 'sr' | 'en'] || type;
}

// Transaction type labels
export function getTransactionTypeLabel(type: TransactionType, locale: string = 'sr'): string {
  const labels: Record<TransactionType, { sr: string; en: string }> = {
    SALE: { sr: 'Prodaja', en: 'Sale' },
    RENT: { sr: 'Izdavanje', en: 'Rent' },
  };
  return labels[type]?.[locale as 'sr' | 'en'] || type;
}

// Heating type labels
export function getHeatingTypeLabel(type: HeatingType, locale: string = 'sr'): string {
  const labels: Record<HeatingType, { sr: string; en: string }> = {
    CENTRAL: { sr: 'Centralno', en: 'Central' },
    GAS: { sr: 'Gas', en: 'Gas' },
    ELECTRIC: { sr: 'Električno', en: 'Electric' },
    DISTRICT: { sr: 'Gradsko', en: 'District' },
    WOOD: { sr: 'Drvo', en: 'Wood' },
    HEAT_PUMP: { sr: 'Toplotna pumpa', en: 'Heat Pump' },
    OTHER: { sr: 'Ostalo', en: 'Other' },
  };
  return labels[type]?.[locale as 'sr' | 'en'] || type;
}

// Generate property URL slug
export function generatePropertySlug(property: { code: string; title: string }): string {
  const titleSlug = property.title
    .toLowerCase()
    .replace(/[čć]/g, 'c')
    .replace(/[šđž]/g, 's')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `${property.code}-${titleSlug}`;
}

// Parse property slug
export function parsePropertySlug(slug: string): { code: string; title: string } {
  const parts = slug.split('-');
  const code = parts[0];
  const title = parts.slice(1).join('-');
  return { code, title };
}

// Validate email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate phone number (Serbian format)
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+381|0)?6[0-9]{7,8}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ''));
}

// Format phone number
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/[\s-]/g, '');
  if (cleaned.startsWith('+381')) {
    return cleaned.replace(/(\+381)(\d{2})(\d{3})(\d{3,4})/, '$1 $2 $3 $4');
  }
  if (cleaned.startsWith('0')) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{3,4})/, '$1 $2 $3');
  }
  return phone;
}

// Calculate mortgage payment
export function calculateMortgage(
  principal: number,
  annualRate: number,
  years: number
): { monthlyPayment: number; totalPayment: number; totalInterest: number } {
  const monthlyRate = annualRate / 100 / 12;
  const numberOfPayments = years * 12;
  
  const monthlyPayment = principal * 
    (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  
  const totalPayment = monthlyPayment * numberOfPayments;
  const totalInterest = totalPayment - principal;
  
  return {
    monthlyPayment: Math.round(monthlyPayment),
    totalPayment: Math.round(totalPayment),
    totalInterest: Math.round(totalInterest),
  };
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Class names utility
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Calculate price per square meter
export function pricePerSquareMeter(price: number, area: number): number {
  if (area === 0) return 0;
  return Math.round(price / area);
}

// Get image URL with fallback
export function getImageUrl(url: string | undefined, fallback: string = '/images/placeholder.jpg'): string {
  return url || fallback;
}

// Generate meta description
export function generateMetaDescription(property: any, locale: string = 'sr'): string {
  const type = getPropertyTypeLabel(property.type, locale);
  const transaction = getTransactionTypeLabel(property.transactionType, locale);
  
  if (locale === 'sr') {
    return `${type} za ${transaction.toLowerCase()} - ${property.area}m², ${property.rooms} soba, ${property.neighborhood}, ${property.city}. Cena: ${formatPrice(property.price)}`;
  } else {
    return `${type} for ${transaction.toLowerCase()} - ${property.area}m², ${property.rooms} rooms, ${property.neighborhood}, ${property.city}. Price: ${formatPrice(property.price)}`;
  }
}

export default {
  formatPrice,
  formatArea,
  formatDate,
  formatRelativeTime,
  truncate,
  getPropertyTypeLabel,
  getTransactionTypeLabel,
  getHeatingTypeLabel,
  generatePropertySlug,
  parsePropertySlug,
  isValidEmail,
  isValidPhone,
  formatPhoneNumber,
  calculateMortgage,
  debounce,
  cn,
  pricePerSquareMeter,
  getImageUrl,
  generateMetaDescription,
};
