'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Property, getFavoriteImage, getImageUrl } from '@/lib/api';
import { useFavourites } from '@/app/contexts/FavouritesContext';
import { usePathname } from 'next/navigation';
import type { ReactElement } from 'react';
import { PropertyTranslator } from '@/app/utils/propertyTranslator';
import { useTranslations, useMessages } from 'next-intl';

interface PropertyCardProps {
  property: Property;
  onHover?: (propertyId: string | null) => void;  priority?: boolean;}

function getPropertyTypeIcon(type: string): ReactElement {
  const icons: { [key: string]: ReactElement } = {
    'Apartment': (
      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    'House': (
      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    'Office': (
      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    'Land': (
      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
      </svg>
    ),
  };
  
  return icons[type] || icons['Apartment'];
}

export function PropertyCard({ property, onHover, priority = false }: PropertyCardProps) {
  const { toggleFavourite, isFavourite } = useFavourites();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'sr';
  const t = useTranslations('Favourites');
  const tProps = useTranslations('Properties');
  const messages = useMessages() as any; // Get all messages to check existence

  const favoriteImage = getFavoriteImage(property.images);
  const imageUrl = favoriteImage ? getImageUrl(favoriteImage.url) : null;

  // Helper to safely translate with fallback
  // Checks if translation key exists in messages before calling tProps
  const safeTranslate = (key: string, fallback: string): string => {
    try {
      // Check if key exists in Properties namespace
      const propertiesMessages = messages?.Properties || {};

      if (propertiesMessages[key]) {
        return tProps(key);
      }

      // Key doesn't exist, use fallback
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[Translation] Missing key: Properties.${key}, using fallback: "${fallback}"`);
      }
      return fallback;
    } catch (error) {
      // Catch any unexpected errors
      return fallback;
    }
  };

  // Use centralized translation utility with safe fallback
  const translatedPropertyType = safeTranslate(
    PropertyTranslator.getPropertyTypeKey(property.propertyType),
    property.propertyType
  );
  const translatedHeating = property.heating
    ? safeTranslate(PropertyTranslator.getHeatingTypeKey(property.heating), property.heating)
    : null;
  const translatedRoomStructure = property.roomStructure
    ? safeTranslate(PropertyTranslator.getRoomStructureKey(property.roomStructure), property.roomStructure)
    : null;

  // Create URL-friendly slug from property data (use neighborhood instead of address)
  const locationSlug = property.neighborhood ? property.neighborhood.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'nis';
  const slug = `${property.propertyType.toLowerCase()}-${locationSlug}`
    .replace(/^-+|-+$/g, '')
    .substring(0, 80);
  const propertyUrl = `/${locale}/properties/${property.id}/${slug}`;

  return (
    <div 
      className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
      onMouseEnter={() => onHover?.(property.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      {/* Image with favorite badge */}
      <div className="aspect-[4/3] bg-gray-300 overflow-hidden relative">
        <Link href={propertyUrl} className="block w-full h-full relative">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={property.code}
              fill
              className="object-cover w-full h-full"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={priority}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <span className="text-gray-400 text-4xl">🏠</span>
            </div>
          )}
        </Link>
        
        {/* Favorite button */}
        <button 
          className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-100 transition-colors z-10"
          onClick={(e) => {
            e.preventDefault();
            toggleFavourite(property.id);
          }}
          title={isFavourite(property.id) ? t('removeFromFavourites') : t('addToFavourites')}
          aria-label={isFavourite(property.id) ? t('removeFromFavourites') : t('addToFavourites')}
        >
          <svg 
            className={`w-6 h-6 ${isFavourite(property.id) ? 'text-red-500 fill-current' : 'text-gray-600'}`} 
            fill={isFavourite(property.id) ? 'currentColor' : 'none'} 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
        
        {/* Property ID badge */}
        <div className="absolute top-3 left-3 bg-brand-600 text-white px-3 py-1 rounded-md text-sm font-semibold">
          ID {property.code}
        </div>
      </div>

      {/* Content */}
      <Link href={propertyUrl} className="block p-4">
        {/* Price */}
        <div className="mb-2">
          <p className="text-xl font-bold text-brand-600">
            {new Intl.NumberFormat('sr-RS', { 
              style: 'currency', 
              currency: 'EUR',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(property.price)}
          </p>
        </div>

        {/* Transaction type and property type */}
        <div className="mb-3 flex items-center gap-2 text-sm text-gray-600">
          {getPropertyTypeIcon(property.propertyType)}
          <span>{translatedPropertyType}</span>
          <span className="text-gray-400">·</span>
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="line-clamp-1">{property.neighborhood || 'Niš'}</span>
        </div>

        {/* Property details */}
        <div className="flex items-center gap-3 pt-2 border-t border-gray-200">
          {/* Area */}
          <div className="flex items-center gap-1 text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            <span className="text-xs font-medium">{property.area} m²</span>
          </div>

          {/* Floor */}
          {property.floor !== undefined && property.floor !== null && (
            <>
              <span className="text-gray-300">|</span>
              <div className="flex items-center gap-1 text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="text-xs font-medium">{property.floor}. {tProps('floorLabel')}</span>
              </div>
            </>
          )}

          {/* Room Structure */}
          {translatedRoomStructure && (
            <>
              <span className="text-gray-300">|</span>
              <div className="flex items-center gap-1 text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="text-xs font-medium">{translatedRoomStructure}</span>
              </div>
            </>
          )}
        </div>

        {/* Additional info - Heating */}
        {translatedHeating && (
          <div className="mt-1 pt-2 border-t border-gray-100 flex items-center gap-2 text-sm text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
            </svg>
            <span className="truncate">{translatedHeating}</span>
          </div>
        )}
      </Link>
    </div>
  );
}
