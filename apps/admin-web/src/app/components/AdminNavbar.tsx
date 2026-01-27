'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect, useRef } from 'react';

interface AdminNavbarProps {
  unreadCount: number;
}

export function AdminNavbar({ unreadCount }: AdminNavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const { logout, user } = useAuth();
  const t = useTranslations('navigation');
  const tAuth = useTranslations('auth');
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

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

  const switchLanguage = (newLocale: string) => {
    const currentPath = pathname.replace(`/${locale}`, '');
    router.push(`/${newLocale}${currentPath}`);
    setLangMenuOpen(false);
  };

  const isActive = (path: string) => {
    if (path === `/${locale}`) {
      return pathname === `/${locale}` || pathname === `/${locale}/`;
    }
    return pathname.includes(path);
  };

  return (
    <header className="bg-white border-b sticky top-0 z-[10001] shadow-sm">
      <div className="flex items-center h-16 px-4">
        {/* Logo */}
        <div
          onClick={() => router.push(`/${locale}`)}
          className="flex items-center gap-2 mr-8 cursor-pointer"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-600 rounded-lg flex items-center justify-center">
            <i className="pi pi-chart-bar text-white text-xl"></i>
          </div>
          <span className="text-xl font-bold text-gray-800">Admin</span>
        </div>

        {/* Desktop Navigation - EXACT user-web style */}
        <nav className="hidden md:flex items-center gap-6 relative">
          <button
            onClick={() => router.push(`/${locale}`)}
            className={`relative text-gray-700 hover:text-white transition-colors font-medium py-2 px-3 rounded-md overflow-hidden group ${
              isActive(`/${locale}`) && !pathname.includes('/properties') && !pathname.includes('/clients') && !pathname.includes('/users') && !pathname.includes('/agent-chat') && !pathname.includes('/newsletter')
                ? 'text-white bg-brand-600' 
                : ''
            }`}
          >
            <span className="relative z-10">{t('dashboard')}</span>
            <div className={`absolute inset-0 bg-brand-600 transform transition-transform duration-300 ease-out ${
              isActive(`/${locale}`) && !pathname.includes('/properties') && !pathname.includes('/clients') && !pathname.includes('/users') && !pathname.includes('/agent-chat') && !pathname.includes('/newsletter')
                ? 'translate-x-0' 
                : 'translate-x-[-100%] group-hover:translate-x-0'
            }`}></div>
          </button>

          <button
            onClick={() => router.push(`/${locale}/properties`)}
            className={`relative text-gray-700 hover:text-white transition-colors font-medium py-2 px-3 rounded-md overflow-hidden group ${
              pathname.includes('/properties') 
                ? 'text-white bg-brand-600' 
                : ''
            }`}
          >
            <span className="relative z-10">{t('properties')}</span>
            <div className={`absolute inset-0 bg-brand-600 transform transition-transform duration-300 ease-out ${
              pathname.includes('/properties') 
                ? 'translate-x-0' 
                : 'translate-x-[-100%] group-hover:translate-x-0'
            }`}></div>
          </button>

          <button
            onClick={() => router.push(`/${locale}/clients`)}
            className={`relative text-gray-700 hover:text-white transition-colors font-medium py-2 px-3 rounded-md overflow-hidden group ${
              pathname.includes('/clients') 
                ? 'text-white bg-brand-600' 
                : ''
            }`}
          >
            <span className="relative z-10">{t('clients')}</span>
            <div className={`absolute inset-0 bg-brand-600 transform transition-transform duration-300 ease-out ${
              pathname.includes('/clients') 
                ? 'translate-x-0' 
                : 'translate-x-[-100%] group-hover:translate-x-0'
            }`}></div>
          </button>

          <button
            onClick={() => router.push(`/${locale}/users`)}
            className={`relative text-gray-700 hover:text-white transition-colors font-medium py-2 px-3 rounded-md overflow-hidden group ${
              pathname.includes('/users') 
                ? 'text-white bg-brand-600' 
                : ''
            }`}
          >
            <span className="relative z-10">{t('users')}</span>
            <div className={`absolute inset-0 bg-brand-600 transform transition-transform duration-300 ease-out ${
              pathname.includes('/users') 
                ? 'translate-x-0' 
                : 'translate-x-[-100%] group-hover:translate-x-0'
            }`}></div>
          </button>

          <button
            onClick={() => router.push(`/${locale}/agent-chat`)}
            className={`relative text-gray-700 hover:text-white transition-colors font-medium py-2 px-3 rounded-md overflow-hidden group ${
              pathname.includes('/agent-chat') 
                ? 'text-white bg-brand-600' 
                : ''
            }`}
          >
            <span className="relative z-10 flex items-center gap-2">
              {t('agentChat')}
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </span>
            <div className={`absolute inset-0 bg-brand-600 transform transition-transform duration-300 ease-out ${
              pathname.includes('/agent-chat') 
                ? 'translate-x-0' 
                : 'translate-x-[-100%] group-hover:translate-x-0'
            }`}></div>
          </button>

          <button
            onClick={() => router.push(`/${locale}/newsletter`)}
            className={`relative text-gray-700 hover:text-white transition-colors font-medium py-2 px-3 rounded-md overflow-hidden group ${
              pathname.includes('/newsletter') 
                ? 'text-white bg-brand-600' 
                : ''
            }`}
          >
            <span className="relative z-10">{t('newsletter')}</span>
            <div className={`absolute inset-0 bg-brand-600 transform transition-transform duration-300 ease-out ${
              pathname.includes('/newsletter') 
                ? 'translate-x-0' 
                : 'translate-x-[-100%] group-hover:translate-x-0'
            }`}></div>
          </button>
        </nav>

        {/* Language Selector - EXACT user-web style */}
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
                onClick={() => switchLanguage('sr')}
                className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${
                  locale === 'sr' ? 'bg-brand-50 text-brand-600 font-semibold' : 'text-gray-700'
                }`}
              >
                Srpski
              </button>
              <button
                onClick={() => switchLanguage('en')}
                className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${
                  locale === 'en' ? 'bg-brand-50 text-brand-600 font-semibold' : 'text-gray-700'
                }`}
              >
                English
              </button>
            </div>
          )}
        </div>

        {/* User Info & Logout - Admin specific but with user-web spacing */}
        <div className="flex items-center gap-3 ml-4">
          {user && (
            <div className="hidden lg:flex items-center gap-2 text-sm text-gray-700">
              <span className="font-semibold">{user.username}</span>
            </div>
          )}
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors font-medium text-sm"
            title={tAuth('logout')}
          >
            <i className="pi pi-sign-out"></i>
            <span className="hidden sm:inline">{tAuth('logout')}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
