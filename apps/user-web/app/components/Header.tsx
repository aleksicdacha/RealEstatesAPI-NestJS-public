'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export function Header() {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'sr';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">O</span>
            </div>
            <span className="text-xl font-bold text-gray-800">Olymp Nekretnine</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href={`/${locale}/izdavanje`} className="text-gray-700 hover:text-orange-600 transition-colors">
              Izdavanje
            </Link>
            <Link href={`/${locale}/prodaja`} className="text-gray-700 hover:text-orange-600 transition-colors">
              Prodaja
            </Link>
            <Link href={`/${locale}/novogradnja`} className="text-gray-700 hover:text-orange-600 transition-colors">
              Novogradnja
            </Link>
            <Link href={`/${locale}/kreditni-savetnik`} className="text-gray-700 hover:text-orange-600 transition-colors">
              Kreditni savetnik
            </Link>
            <Link href={`/${locale}/info`} className="text-gray-700 hover:text-orange-600 transition-colors">
              Info
            </Link>
          </nav>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href={`/${locale}/ponudite-nekretninu`}
              className="border-2 border-orange-600 text-orange-600 hover:bg-orange-50 px-4 py-2 rounded-full font-semibold transition-colors"
            >
              Ponudite nekretninu
            </Link>
            <button className="text-gray-600 hover:text-orange-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <button className="text-sm text-gray-600">SRB</button>
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-600"
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
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col gap-4">
              <Link href={`/${locale}/izdavanje`} className="text-gray-700 hover:text-orange-600">
                Izdavanje
              </Link>
              <Link href={`/${locale}/prodaja`} className="text-gray-700 hover:text-orange-600">
                Prodaja
              </Link>
              <Link href={`/${locale}/novogradnja`} className="text-gray-700 hover:text-orange-600">
                Novogradnja
              </Link>
              <Link href={`/${locale}/kreditni-savetnik`} className="text-gray-700 hover:text-orange-600">
                Kreditni savetnik
              </Link>
              <Link href={`/${locale}/info`} className="text-gray-700 hover:text-orange-600">
                Info
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
