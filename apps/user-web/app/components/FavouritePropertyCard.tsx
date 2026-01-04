'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Property, getFavoriteImage, getImageUrl } from '@/lib/api';
import { usePathname } from 'next/navigation';
import type { ReactElement } from 'react';

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

function getPropertyTypeName(type: string): string {
  const names: { [key: string]: string } = {
    'Apartment': 'Stan',
    'House': 'Kuća',
    'ApartmentInHouse': 'Stan u kući',
    'Office': 'Poslovni prostor',
    'CommercialSpace': 'Lokal',
    'Land': 'Plac',
    'VacationHome': 'Vikendica',
    'Duplex': 'Duplex',
  };

  return names[type] || type;
}

interface FavouritePropertyCardProps {
  property: Property;
  priority?: boolean;
}

export function FavouritePropertyCard({ property, priority = false }: FavouritePropertyCardProps) {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'sr';
  const favoriteImage = getFavoriteImage(property.images);
  const imageUrl = favoriteImage ? getImageUrl(favoriteImage.url) : null;

  const locationSlug = property.neighborhood ? property.neighborhood.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'nis';
  const slug = `${property.propertyType.toLowerCase()}-${locationSlug}`
    .replace(/^-+|-+$/g, '')
    .substring(0, 80);
  const propertyUrl = `/${locale}/properties/${property.id}/${slug}`;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Image */}
      <div className="aspect-[16/9] bg-gray-300 overflow-hidden relative">
        <Link href={propertyUrl} className="block w-full h-full relative">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={property.code}
              fill
              className="object-cover w-full h-full"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority={priority}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <span className="text-gray-400 text-2xl">🏠</span>
            </div>
          )}
        </Link>

        {/* Property ID badge */}
        <div className="absolute top-2 left-2 bg-orange-600 text-white px-2 py-1 rounded text-xs font-semibold">
          ID {property.code}
        </div>
      </div>

      {/* Content */}
      <Link href={propertyUrl} className="block p-3">
        {/* Price */}
        <div className="mb-1">
          <p className="text-lg font-bold text-orange-600">
            {new Intl.NumberFormat('sr-RS', {
              style: 'currency',
              currency: 'EUR',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(property.price)}
          </p>
        </div>

        {/* Type and location */}
        <div className="mb-2 flex items-center gap-1 text-xs text-gray-600">
          {getPropertyTypeIcon(property.propertyType)}
          <span>{getPropertyTypeName(property.propertyType)}</span>
          <span className="text-gray-400">·</span>
          <span className="line-clamp-1">{property.neighborhood || 'Niš'}</span>
        </div>

        {/* Area and rooms */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>{property.area} m²</span>
          <span>·</span>
          <span>{property.roomStructure}</span>
        </div>
      </Link>
    </div>
  );
}