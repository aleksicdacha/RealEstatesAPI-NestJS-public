'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import HeroSearch from './HeroSearch';

interface HeroSectionProps {
  locale: string;
}

// City background images mapping
const cityBackgrounds: Record<string, string> = {
  'Beograd': 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=1920&h=1080&fit=crop&auto=format',
  'Novi Sad': 'https://images.unsplash.com/photo-1555117636-bca6f54314f7?w=1920&h=1080&fit=crop&auto=format',
  'Niš': 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1920&h=1080&fit=crop&auto=format',
  'Kragujevac': 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1920&h=1080&fit=crop&auto=format',
};

const defaultBackground = 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1920&h=1080&fit=crop&auto=format';

export default function HeroSection({ locale }: HeroSectionProps) {
  const t = useTranslations('Landing');
  const [selectedCity, setSelectedCity] = useState('');
  const backgroundImage = selectedCity && cityBackgrounds[selectedCity] 
    ? cityBackgrounds[selectedCity] 
    : defaultBackground;

  return (
    <section className="relative text-white overflow-hidden min-h-[85vh] flex items-center">
      {/* Dynamic Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-in-out"
        style={{
          backgroundImage: `url('${backgroundImage}')`,
        }}
      >
        {/* Dark Gradient Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-orange-900/70" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 py-16 lg:py-24 z-10">
        <div className="text-center max-w-5xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold mb-6 leading-tight drop-shadow-2xl">
            {t('heroTitle')} <br />
            <span className="text-yellow-400 drop-shadow-lg">{t('heroHighlight')}</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-100 max-w-3xl mx-auto drop-shadow-lg">
            {t('heroSubtitle')}
          </p>
        </div>

        {/* Search Component */}
        <HeroSearch locale={locale} onCityChange={setSelectedCity} />

        {/* Quick Links */}
        <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm">
          <div className="flex items-center gap-2 text-gray-200 drop-shadow-md">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {t('noCosts')}
          </div>
          <div className="flex items-center gap-2 text-gray-200 drop-shadow-md">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {t('verification')}
          </div>
          <div className="flex items-center gap-2 text-gray-200 drop-shadow-md">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {t('support')}
          </div>
        </div>
      </div>
    </section>
  );
}
