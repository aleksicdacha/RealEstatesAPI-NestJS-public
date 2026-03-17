'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface HeroSearchProps {
  locale: string;
  onCityChange?: (city: string) => void;
}

export default function HeroSearch({ locale, onCityChange }: HeroSearchProps) {
  const t = useTranslations('HeroSearch');
  const router = useRouter();
  const [transactionType, setTransactionType] = useState<'prodaja' | 'izdavanje'>('prodaja');
  const [city, setCity] = useState('');

  const cities = [
    { value: 'Beograd', labelSr: 'Beograd', labelEn: 'Belgrade' },
    { value: 'Niš', labelSr: 'Niš', labelEn: 'Niš' },
  ];

  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    if (onCityChange) {
      onCityChange(newCity);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) {
      params.append('city', city);
    }
    // Map transaction type to clientTransactionType enum values
    // prodaja -> seller, izdavanje -> rents-out
    const clientTransactionType = transactionType === 'prodaja' ? 'seller' : 'rents-out';
    params.append('clientTransactionType', clientTransactionType);
    
    router.push(`/${locale}/${transactionType}?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 max-w-4xl mx-auto">
      <form onSubmit={handleSearch} className="space-y-6">
        {/* Transaction Type Toggle */}
        <div className="relative bg-gray-100 p-2 rounded-full">
          <div
            className={`absolute top-2 bottom-2 bg-brand-600 rounded-full transition-all duration-300 ease-in-out shadow-lg ${
              transactionType === 'prodaja' ? 'left-2 right-[calc(50%+4px)]' : 'left-[calc(50%+4px)] right-2'
            }`}
          />
          <div className="relative flex gap-2">
            <button
              type="button"
              onClick={() => setTransactionType('prodaja')}
              className={`flex-1 py-3 px-6 rounded-full font-semibold transition-all duration-300 flex items-center justify-center gap-2 relative z-10 ${
                transactionType === 'prodaja'
                  ? 'text-white'
                  : 'text-gray-700'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              {t('sale')}
            </button>
            <button
              type="button"
              onClick={() => setTransactionType('izdavanje')}
              className={`flex-1 py-3 px-6 rounded-full font-semibold transition-all duration-300 flex items-center justify-center gap-2 relative z-10 ${
                transactionType === 'izdavanje'
                  ? 'text-white'
                  : 'text-gray-700'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              {t('rent')}
            </button>
          </div>
        </div>

        {/* City Selection */}
        <div className="relative">
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {t('city')}
            </div>
          </label>
          <select
            id="city"
            value={city}
            onChange={(e) => handleCityChange(e.target.value)}
            className="w-full px-4 py-4 pr-12 text-lg text-gray-900 font-medium border-2 border-gray-300 rounded-full focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all bg-white cursor-pointer hover:border-brand-400 appearance-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23374151' d='M10.293 3.293L6 7.586 1.707 3.293A1 1 0 00.293 4.707l5 5a1 1 0 001.414 0l5-5a1 1 0 10-1.414-1.414z'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 1rem center'
            }}
          >
            <option value="" className="text-gray-900 font-medium">{t('selectCity')}</option>
            {cities.map((c) => (
              <option key={c.value} value={c.value} className="text-gray-900 font-medium">
                {locale === 'sr' ? c.labelSr : c.labelEn}
              </option>
            ))}
          </select>
        </div>

        {/* Search Button */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-bold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center gap-3 text-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {t('search')}
        </button>
      </form>
    </div>
  );
}
