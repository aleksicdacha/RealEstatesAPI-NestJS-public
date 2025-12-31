'use client';

import { Property, getImageUrl } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import dynamic from 'next/dynamic';
const PropertyMap = dynamic(() => import('@/app/components/PropertyMap').then(mod => ({ default: mod.PropertyMap })), {
  ssr: false,
  loading: () => <div className="h-[400px] rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">Učitavanje mape...</div>
});
import { PropertySidebar } from '@/app/components/PropertySidebar';
import { useFavourites } from '@/app/contexts/FavouritesContext';
import { useTranslations } from 'next-intl';

interface PropertyDetailClientProps {
  property: Property;
}

export default function PropertyDetailClient({ property }: PropertyDetailClientProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { toggleFavourite, isFavourite } = useFavourites();
  const t = useTranslations('Favourites');
  const favoriteImage = property.images.find(img => img.isFavorite) || property.images[0];
  const sortedImages = [...property.images].sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    return a.order - b.order;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Image Gallery */}
      <section id="galerija" className="bg-white">
        <div className="px-4 py-8">
          {/* Breadcrumb */}
          <div className="text-sm text-gray-600 mb-4">
            <Link href="/" className="hover:text-orange-600">Početna</Link>
            <span className="mx-2">/</span>
            <Link href="/properties" className="hover:text-orange-600">Nekretnine</Link>
            <span className="mx-2">/</span>
            <span>ID {property.code}</span>
          </div>

          {/* Location and ID */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {property.neighborhood || 'Niš'}
              </h1>
              <p className="text-gray-600">
                Prodaja {property.propertyType} • ID {property.code}
              </p>
            </div>
            
            {/* Favourite Button */}
            <button 
              onClick={() => toggleFavourite(property.id)}
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-100 transition-colors"
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
          </div>

          {/* Image Gallery */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
            {/* Main Image */}
            <div className="lg:col-span-2 relative h-[500px] bg-gray-200 rounded-lg overflow-hidden group">
              {sortedImages[selectedImageIndex] && (
                <Image
                  src={getImageUrl(sortedImages[selectedImageIndex].url)}
                  alt={property.code}
                  fill
                  className="object-cover"
                  priority
                />
              )}
              
              {/* Previous Arrow */}
              {selectedImageIndex > 0 && (
                <button
                  onClick={() => setSelectedImageIndex(selectedImageIndex - 1)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Previous image"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              
              {/* Next Arrow */}
              {selectedImageIndex < sortedImages.length - 1 && (
                <button
                  onClick={() => setSelectedImageIndex(selectedImageIndex + 1)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Next image"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
              
              {/* Image Counter */}
              <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                {selectedImageIndex + 1} / {sortedImages.length}
              </div>
            </div>

            {/* Thumbnail Grid */}
            <div className="grid grid-cols-3 lg:grid-cols-2 gap-2 h-[500px] overflow-y-auto">
              {sortedImages.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative h-32 rounded-lg overflow-hidden ${
                    selectedImageIndex === index ? 'ring-2 ring-orange-600' : ''
                  }`}
                >
                  <Image
                    src={getImageUrl(image.url)}
                    alt={`${property.code} - ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="150px"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Property Info with Sidebar */}
      <section className="bg-white border-t">
        <div className="px-4 py-8">
          <div className="flex gap-4">
            {/* Left Sidebar */}
            <div className="hidden lg:block flex-shrink-0">
              <PropertySidebar />
            </div>

            {/* Main Content */}
            <div className="flex-1 max-w-4xl">
              {/* Price Card */}
              <div id="informacije" className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-lg mb-6">
                <div className="text-4xl font-bold text-orange-600 mb-2">
                  {new Intl.NumberFormat('sr-RS', { 
                    style: 'currency', 
                    currency: 'EUR',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(property.price)}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                    <span className="font-semibold">{property.area} m²</span>
                  </div>
                  {property.floor !== undefined && (
                    <>
                      <span className="text-gray-300">|</span>
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className="font-semibold">{property.floor}. sprat</span>
                      </div>
                    </>
                  )}
                  {property.heating && (
                    <>
                      <span className="text-gray-300">|</span>
                      <span className="font-semibold">{property.heating}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Basic Information */}
              <div className="bg-white rounded-lg border p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Osnovne informacije</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Cena po m²</div>
                    <div className="font-semibold text-gray-900">
                      {new Intl.NumberFormat('sr-RS', { 
                        style: 'currency', 
                        currency: 'EUR',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(Math.round(property.price / property.area))}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Tip nekretnine</div>
                    <div className="font-semibold text-gray-900">{property.propertyType}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Površina</div>
                    <div className="font-semibold text-gray-900">{property.area} m²</div>
                  </div>
                  {property.floor !== undefined && property.floor !== null && (
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Sprat</div>
                      <div className="font-semibold text-gray-900">{property.floor}</div>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Broj kupatila</div>
                      <div className="font-semibold text-gray-900">{property.bathrooms}</div>
                    </div>
                  )}
                  {property.heating && (
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Grejanje</div>
                      <div className="font-semibold text-gray-900">{property.heating}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Status</div>
                    <div className="font-semibold">
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm ${
                        property.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {property.status === 'active' ? 'Aktivno' : property.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              {property.description && (
                <div id="opremljenost" className="bg-white rounded-lg border p-6 mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Opis</h2>
                  <p className="text-gray-700 whitespace-pre-line">{property.description}</p>
                </div>
              )}

              {/* Location Map */}
              <div id="lokacija" className="bg-white rounded-lg border p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Lokacija</h2>
                <div className="h-[400px] rounded-lg overflow-hidden">
                  <PropertyMap properties={[property]} hideInfoWindow={true} />
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Tačna lokacija će biti prosleđena nakon što razgledanje nekretnine bude zakazano.
                </p>
              </div>

              {/* Costs Section - Placeholder */}
              <div id="troskovi" className="bg-white rounded-lg border p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Troškovi</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Komunalije (mesečno)</div>
                    <div className="font-semibold text-gray-900">Informacije dostupne na upit</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Rezije</div>
                    <div className="font-semibold text-gray-900">Informacije dostupne na upit</div>
                  </div>
                </div>
              </div>

              {/* Similar Properties - Placeholder */}
              <div id="slicne" className="bg-white rounded-lg border p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Slične nekretnine</h2>
                <p className="text-gray-500">Slične nekretnine će biti prikazane uskoro.</p>
              </div>

              {/* Calculator - Placeholder */}
              <div id="kalkulator" className="bg-white rounded-lg border p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Kalkulator kredita</h2>
                <p className="text-gray-500">Kalkulator kredita će biti dostupan uskoro.</p>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="hidden lg:block w-80 flex-shrink-0">
              {/* Contact Card */}
              <div className="bg-white rounded-lg border p-6 sticky top-4">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Zakažite razgledanje</h3>
                <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 px-6 rounded-lg font-semibold mb-3 transition-colors">
                  Zakažite gledanje
                </button>
                <button className="w-full border-2 border-orange-600 text-orange-600 hover:bg-orange-50 py-3 px-6 rounded-lg font-semibold transition-colors">
                  Kontaktirajte nas
                </button>
                
                <div className="mt-6 pt-6 border-t">
                  <div className="text-sm text-gray-600 mb-2">Pozovite nas</div>
                  <a href="tel:+381114425000" className="text-lg font-semibold text-orange-600 hover:text-orange-700">
                    +381 18 277 181
                  </a>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <div className="text-sm text-gray-600 mb-2">Podelite oglas</div>
                  <div className="flex gap-2">
                    <button className="flex-1 border rounded-lg p-2 hover:bg-gray-50 transition-colors">
                      <svg className="w-5 h-5 mx-auto text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </button>
                    <button className="flex-1 border rounded-lg p-2 hover:bg-gray-50 transition-colors">
                      <svg className="w-5 h-5 mx-auto text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                    </button>
                    <button className="flex-1 border rounded-lg p-2 hover:bg-gray-50 transition-colors">
                      <svg className="w-5 h-5 mx-auto text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
