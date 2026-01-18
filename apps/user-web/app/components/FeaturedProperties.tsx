'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations, useMessages } from 'next-intl';
import { fetchFeaturedProperties } from '@/lib/featured-api';
import { Property, getImageUrl, getFavoriteImage } from '@/lib/api';
import { PropertyTranslator } from '@/app/utils/propertyTranslator';

interface FeaturedPropertiesProps {
  locale: string;
}

export default function FeaturedProperties({ locale }: FeaturedPropertiesProps) {
  const t = useTranslations('FeaturedProperties');
  const tProps = useTranslations('Properties');
  const messages = useMessages() as any;
  const [properties, setProperties] = useState<Property[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [itemsPerView, setItemsPerView] = useState(3);

  // Helper to safely translate with fallback
  const safeTranslate = (key: string, fallback: string): string => {
    try {
      const propertiesMessages = messages?.Properties || {};
      if (propertiesMessages[key]) {
        return tProps(key);
      }
      return fallback;
    } catch (error) {
      return fallback;
    }
  };

  useEffect(() => {
    const loadProperties = async () => {
      setIsLoading(true);
      const data = await fetchFeaturedProperties(10);
      setProperties(data);
      setIsLoading(false);
    };
    loadProperties();
  }, []);

  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2);
      } else {
        setItemsPerView(3);
      }
    };

    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);

  const maxIndex = Math.max(0, properties.length - itemsPerView);

  const scrollTo = (index: number) => {
    if (scrollRef.current) {
      const itemWidth = scrollRef.current.offsetWidth / itemsPerView;
      scrollRef.current.scrollTo({
        left: index * itemWidth,
        behavior: 'smooth',
      });
    }
    setCurrentIndex(index);
  };

  const next = () => {
    if (currentIndex < maxIndex) {
      scrollTo(currentIndex + 1);
    }
  };

  const prev = () => {
    if (currentIndex > 0) {
      scrollTo(currentIndex - 1);
    }
  };

  const getMainImage = (property: Property) => {
    const favoriteImage = getFavoriteImage(property.images || []);
    if (!favoriteImage) {
      return 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop&auto=format';
    }
    return getImageUrl(favoriteImage.url);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(locale === 'sr' ? 'sr-RS' : 'en-US', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (properties.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            {t('title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Slider Container */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 py-8">
          {/* Navigation Buttons */}
          {properties.length > itemsPerView && (
            <>
              <button
                onClick={prev}
                disabled={currentIndex === 0}
                className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 -translate-x-4 lg:-translate-x-12 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
                  currentIndex === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-brand-600 text-white hover:bg-brand-700 hover:shadow-xl'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={next}
                disabled={currentIndex >= maxIndex}
                className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 translate-x-4 lg:translate-x-12 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
                  currentIndex >= maxIndex
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-brand-600 text-white hover:bg-brand-700 hover:shadow-xl'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Properties Grid/Slider */}
          <div
            ref={scrollRef}
            className="overflow-hidden py-16 px-4"
          >
            <div
              className="flex gap-4 md:gap-6 transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
              }}
            >
              {properties.map((property) => (
                <Link
                  key={property.id}
                  href={`/${locale}/properties/${property.id}`}
                  className="flex-shrink-0 w-[calc(100%-1rem)] sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)] group"
                >
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
                    {/* Image */}
                    <div className="relative h-52 overflow-hidden bg-gray-200">
                      <Image
                        src={getMainImage(property)}
                        alt={property.code}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      {/* ID Badge */}
                      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-gray-700">
                        ID {property.code}
                      </div>
                      {/* Price Badge */}
                      <div className="absolute bottom-4 left-4 bg-brand-600 text-white px-4 py-2 rounded-lg font-bold text-lg shadow-lg">
                        {formatPrice(property.price)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="font-medium">{property.neighborhood || t('location')}</span>
                      </div>

                      <div className="flex items-center gap-4 text-gray-700">
                        {property.area && (
                          <div className="flex items-center gap-1">
                            <svg className="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                            </svg>
                            <span className="font-semibold">{property.area} m²</span>
                          </div>
                        )}
                        {property.roomStructure && (
                          <div className="flex items-center gap-1">
                            <svg className="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <span className="font-semibold">
                              {safeTranslate(
                                PropertyTranslator.getRoomStructureKey(property.roomStructure),
                                property.roomStructure
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Dots Indicator */}
          {properties.length > itemsPerView && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollTo(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentIndex === index
                      ? 'bg-brand-600 w-8'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link
            href={`/${locale}/prodaja`}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-bold px-8 py-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            {t('viewAll')}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
