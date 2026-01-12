'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

export function Footer() {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'sr';
  const t = useTranslations('Navigation');

  return (
    <footer className="bg-black text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Logo and Social */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <img 
                src="/assets/images/olymp_logo.png" 
                alt="Olymp Nekretnine" 
                className="h-10 w-auto"
              />
            </div>
            <div className="flex gap-4 mb-6">
              <button className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>
              <button className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </button>
              <button className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </button>
              <button className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </button>
              <button className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                <span className="text-xs font-bold">TT</span>
              </button>
            </div>
            <div className="text-sm text-gray-400">
              <p className="mb-2">Imate pitanja?</p>
              <p className="font-semibold text-white">Kontaktirajte nas</p>
            </div>
          </div>

          {/* Informacije */}
          <div>
            <h3 className="font-bold mb-4">Informacije</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href={`/${locale}/kontakt`} className="hover:text-white">Kontakt</Link></li>
              <li><Link href={`/${locale}/o-nama`} className="hover:text-white">O nama</Link></li>
              <li><Link href={`/${locale}/politika-privatnosti`} className="hover:text-white">{t('privacyPolicy')}</Link></li>
              <li><Link href={`/${locale}/uslove-koriscenja`} className="hover:text-white">{t('termsOfUse')}</Link></li>
              <li><Link href={`/${locale}/cenovnik`} className="hover:text-white">Cenovnik</Link></li>
              <li><Link href={`/${locale}/karijera`} className="hover:text-white">Karijera</Link></li>
              <li><Link href={`/${locale}/cesto-postavljana-pitanja`} className="hover:text-white">Često postavljana pitanja</Link></li>
              <li><Link href={`/${locale}/blog`} className="hover:text-white">Blog</Link></li>
            </ul>
          </div>

          {/* Prodaja */}
          <div>
            <h3 className="font-bold mb-4">Prodaja stanova</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href={`/${locale}/prodaja-nekretnina/nis`} className="hover:text-white">Prodaja stanova Niš</Link></li>
              <li><Link href={`/${locale}/izdavanje-stanova/nis`} className="hover:text-white">Izdavanje stanova Niš</Link></li>
            </ul>
          </div>

          {/* Novogradnja */}
          <div>
            <h3 className="font-bold mb-4">Novogradnja</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href={`/${locale}/novogradnja`} className="hover:text-white">Novogradnja</Link></li>
              <li><Link href={`/${locale}/luksuzni-stanovi-za-izdavanje`} className="hover:text-white">Luksuzni stanovi za izdavanje</Link></li>
              <li><Link href={`/${locale}/luksuzni-stanovi-za-prodaju`} className="hover:text-white">Luksuzni stanovi za prodaju</Link></li>
              <li><Link href={`/${locale}/trazite-nekretninu`} className="hover:text-white">Tražite nekretninu</Link></li>
              <li><Link href={`/${locale}/stambeni-krediti`} className="hover:text-white">Stambeni krediti</Link></li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <div className="max-w-2xl">
            <h3 className="font-bold text-xl mb-2">Newsletter</h3>
            <p className="text-gray-400 text-sm mb-4">
              Prijavite se besplatno za newsletter i budite u toku sa najnovijim dešavanjima.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Unesite vašu email adresu"
                className="flex-1 px-4 py-3 rounded-lg bg-white text-gray-900"
              />
              <button className="bg-brand-600 hover:bg-brand-700 px-6 py-3 rounded-full font-semibold transition-colors">
                →
              </button>
            </div>
            <div className="mt-3 text-xs text-gray-400">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span>Prihvatam <Link href={`/${locale}/uslove-koriscenja`} className="text-brand-600 hover:underline">uslove korišćenja i politiku privatnosti</Link></span>
              </label>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 pt-6 text-sm text-gray-400">
          <p>©copyright Olymp Nekretnine. Sva prava zadržana.</p>
        </div>
      </div>
    </footer>
  );
}
