'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

export function Header() {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'sr';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = useTranslations('Navigation');

  return (
    <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
      <div className="flex items-center h-16 px-4">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-2 mr-8">
          <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">O</span>
          </div>
          <span className="text-xl font-bold text-gray-800">Olymp Nekretnine</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href={`/${locale}/prodaja`} className="text-gray-700 hover:text-orange-600 transition-colors font-medium">
            {t('forSale')}
          </Link>
          <Link href={`/${locale}/izdavanje`} className="text-gray-700 hover:text-orange-600 transition-colors font-medium">
            {t('forRent')}
          </Link>
          <Link href={`/${locale}/kontakt`} className="text-gray-700 hover:text-orange-600 transition-colors font-medium">
            {t('contact')}
          </Link>
          <Link href={`/${locale}/o-nama`} className="text-gray-700 hover:text-orange-600 transition-colors font-medium">
            {t('about')}
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden ml-auto text-gray-600"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b shadow-lg py-4 px-4">
            <nav className="flex flex-col gap-4">
              <Link href={`/${locale}/prodaja`} className="text-gray-700 hover:text-orange-600" onClick={() => setMobileMenuOpen(false)}>
                {t('forSale')}
              </Link>
              <Link href={`/${locale}/izdavanje`} className="text-gray-700 hover:text-orange-600" onClick={() => setMobileMenuOpen(false)}>
                {t('forRent')}
              </Link>
              <Link href={`/${locale}/kontakt`} className="text-gray-700 hover:text-orange-600" onClick={() => setMobileMenuOpen(false)}>
                {t('contact')}
              </Link>
              <Link href={`/${locale}/o-nama`} className="text-gray-700 hover:text-orange-600" onClick={() => setMobileMenuOpen(false)}>
                {t('about')}
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
