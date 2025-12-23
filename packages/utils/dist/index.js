"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatPrice = formatPrice;
exports.formatArea = formatArea;
exports.formatDate = formatDate;
exports.formatRelativeTime = formatRelativeTime;
exports.truncate = truncate;
exports.getPropertyTypeLabel = getPropertyTypeLabel;
exports.getTransactionTypeLabel = getTransactionTypeLabel;
exports.getHeatingTypeLabel = getHeatingTypeLabel;
exports.generatePropertySlug = generatePropertySlug;
exports.parsePropertySlug = parsePropertySlug;
exports.isValidEmail = isValidEmail;
exports.isValidPhone = isValidPhone;
exports.formatPhoneNumber = formatPhoneNumber;
exports.calculateMortgage = calculateMortgage;
exports.debounce = debounce;
exports.cn = cn;
exports.pricePerSquareMeter = pricePerSquareMeter;
exports.getImageUrl = getImageUrl;
exports.generateMetaDescription = generateMetaDescription;
// Format price with currency
function formatPrice(price, currency = '€') {
    return new Intl.NumberFormat('sr-RS', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price).replace('EUR', currency);
}
// Format area
function formatArea(area) {
    return `${area} m²`;
}
// Format date
function formatDate(date, locale = 'sr-RS') {
    return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(new Date(date));
}
// Format relative time (e.g., "2 days ago")
function formatRelativeTime(date, locale = 'sr-RS') {
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
            return rtf.format(count, interval.label);
        }
    }
    return rtf.format(diffInSeconds, 'second');
}
// Truncate text
function truncate(text, maxLength = 100) {
    if (text.length <= maxLength)
        return text;
    return text.slice(0, maxLength).trim() + '...';
}
// Property type labels
function getPropertyTypeLabel(type, locale = 'sr') {
    const labels = {
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
    return labels[type]?.[locale] || type;
}
// Transaction type labels
function getTransactionTypeLabel(type, locale = 'sr') {
    const labels = {
        SALE: { sr: 'Prodaja', en: 'Sale' },
        RENT: { sr: 'Izdavanje', en: 'Rent' },
    };
    return labels[type]?.[locale] || type;
}
// Heating type labels
function getHeatingTypeLabel(type, locale = 'sr') {
    const labels = {
        CENTRAL: { sr: 'Centralno', en: 'Central' },
        GAS: { sr: 'Gas', en: 'Gas' },
        ELECTRIC: { sr: 'Električno', en: 'Electric' },
        DISTRICT: { sr: 'Gradsko', en: 'District' },
        WOOD: { sr: 'Drvo', en: 'Wood' },
        HEAT_PUMP: { sr: 'Toplotna pumpa', en: 'Heat Pump' },
        OTHER: { sr: 'Ostalo', en: 'Other' },
    };
    return labels[type]?.[locale] || type;
}
// Generate property URL slug
function generatePropertySlug(property) {
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
function parsePropertySlug(slug) {
    const parts = slug.split('-');
    const code = parts[0];
    const title = parts.slice(1).join('-');
    return { code, title };
}
// Validate email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
// Validate phone number (Serbian format)
function isValidPhone(phone) {
    const phoneRegex = /^(\+381|0)?6[0-9]{7,8}$/;
    return phoneRegex.test(phone.replace(/[\s-]/g, ''));
}
// Format phone number
function formatPhoneNumber(phone) {
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
function calculateMortgage(principal, annualRate, years) {
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
function debounce(func, wait) {
    let timeout = null;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            func(...args);
        };
        if (timeout)
            clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
// Class names utility
function cn(...classes) {
    return classes.filter(Boolean).join(' ');
}
// Calculate price per square meter
function pricePerSquareMeter(price, area) {
    if (area === 0)
        return 0;
    return Math.round(price / area);
}
// Get image URL with fallback
function getImageUrl(url, fallback = '/images/placeholder.jpg') {
    return url || fallback;
}
// Generate meta description
function generateMetaDescription(property, locale = 'sr') {
    const type = getPropertyTypeLabel(property.type, locale);
    const transaction = getTransactionTypeLabel(property.transactionType, locale);
    if (locale === 'sr') {
        return `${type} za ${transaction.toLowerCase()} - ${property.area}m², ${property.rooms} soba, ${property.neighborhood}, ${property.city}. Cena: ${formatPrice(property.price)}`;
    }
    else {
        return `${type} for ${transaction.toLowerCase()} - ${property.area}m², ${property.rooms} rooms, ${property.neighborhood}, ${property.city}. Price: ${formatPrice(property.price)}`;
    }
}
exports.default = {
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
