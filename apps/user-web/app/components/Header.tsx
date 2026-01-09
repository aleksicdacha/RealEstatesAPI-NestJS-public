'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = pathname.split('/')[1] || 'sr';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('Navigation');

  // Close language dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setLangMenuOpen(false);
      }
    };

    if (langMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [langMenuOpen]);

  return (
    <header className="bg-white border-b sticky top-0 z-[10001] shadow-sm">
      <div className="flex items-center h-16 px-4">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-2 mr-8">
          <img 
            src="/assets/images/olymp_logo.png" 
            alt="Olymp Nekretnine" 
            className="h-10 w-auto"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link 
            href={`/${locale}/prodaja`} 
            className={`relative text-gray-700 hover:text-brand-600 transition-colors font-medium py-2 ${
              pathname.includes('/prodaja') 
                ? 'text-brand-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-brand-600 after:animate-pulse' 
                : ''
            }`}
          >
            {t('forSale')}
          </Link>
          <Link 
            href={`/${locale}/izdavanje`} 
            className={`relative text-gray-700 hover:text-brand-600 transition-colors font-medium py-2 ${
              pathname.includes('/izdavanje') 
                ? 'text-brand-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-brand-600 after:animate-pulse' 
                : ''
            }`}
          >
            {t('forRent')}
          </Link>
          <Link 
            href={`/${locale}/kontakt`} 
            className={`relative text-gray-700 hover:text-brand-600 transition-colors font-medium py-2 ${
              pathname.includes('/kontakt') 
                ? 'text-brand-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-brand-600 after:animate-pulse' 
                : ''
            }`}
          >
            {t('contact')}
          </Link>
          <Link 
            href={`/${locale}/o-nama`} 
            className={`relative text-gray-700 hover:text-brand-600 transition-colors font-medium py-2 ${
              pathname.includes('/o-nama') 
                ? 'text-brand-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-brand-600 after:animate-pulse' 
                : ''
            }`}
          >
            {t('about')}
          </Link>
        </nav>

        {/* Language Selector */}
        <div className="hidden md:block ml-auto relative" ref={langMenuRef}>
          <button
            onClick={() => setLangMenuOpen(!langMenuOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200"
          >
            <span className="font-semibold text-gray-700 text-sm uppercase">{locale}</span>
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <svg className={`w-4 h-4 text-gray-600 transition-transform ${langMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {langMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <button
                onClick={() => {
                  const newPath = pathname.replace(`/${locale}`, '/sr');
                  router.push(newPath);
                  setLangMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${
                  locale === 'sr' ? 'bg-brand-50 text-brand-600 font-semibold' : 'text-gray-700'
                }`}
              >
                Srpski
              </button>
              <button
                onClick={() => {
                  const newPath = pathname.replace(`/${locale}`, '/en');
                  router.push(newPath);
                  setLangMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${
                  locale === 'en' ? 'bg-brand-50 text-brand-600 font-semibold' : 'text-gray-700'
                }`}
              >
                English
              </button>
            </div>
          )}
        </div>

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
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b shadow-lg py-4 px-4 z-50">
            <nav className="flex flex-col gap-4">
              <Link 
                href={`/${locale}/prodaja`} 
                className={`text-gray-700 hover:text-brand-600 py-2 ${pathname.includes('/prodaja') ? 'text-brand-600 font-semibold border-l-4 border-brand-600 pl-2' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('forSale')}
              </Link>
              <Link 
                href={`/${locale}/izdavanje`} 
                className={`text-gray-700 hover:text-brand-600 py-2 ${pathname.includes('/izdavanje') ? 'text-brand-600 font-semibold border-l-4 border-brand-600 pl-2' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('forRent')}
              </Link>
              <Link 
                href={`/${locale}/kontakt`} 
                className={`text-gray-700 hover:text-brand-600 py-2 ${pathname.includes('/kontakt') ? 'text-brand-600 font-semibold border-l-4 border-brand-600 pl-2' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('contact')}
              </Link>
              <Link 
                href={`/${locale}/o-nama`} 
                className={`text-gray-700 hover:text-brand-600 py-2 ${pathname.includes('/o-nama') ? 'text-brand-600 font-semibold border-l-4 border-brand-600 pl-2' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('about')}
              </Link>
              <div className="border-t pt-4 mt-4">
                <div className="text-xs text-gray-500 mb-2">{t('language')}</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const newPath = pathname.replace(`/${locale}`, '/sr');
                      router.push(newPath);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex-1 py-2 px-4 rounded-full transition-colors ${
                      locale === 'sr' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Srpski
                  </button>
                  <button
                    onClick={() => {
                      const newPath = pathname.replace(`/${locale}`, '/en');
                      router.push(newPath);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex-1 py-2 px-4 rounded-full transition-colors ${
                      locale === 'en' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
