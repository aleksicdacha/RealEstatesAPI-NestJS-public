'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface CookieSettings {
  basic: boolean;
  analytics: boolean;
  advertising: boolean;
}

export default function CookieConsent() {
  const t = useTranslations('CookieConsent');
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'sr';
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [settings, setSettings] = useState<CookieSettings>({
    basic: true, // Always true, essential cookies
    analytics: false,
    advertising: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    } else {
      // Load existing settings
      try {
        const parsedSettings = JSON.parse(consent);
        if (typeof parsedSettings === 'object' && parsedSettings !== null) {
          setSettings({
            basic: true, // Always true
            analytics: parsedSettings.analytics || false,
            advertising: parsedSettings.advertising || false,
          });
        }
      } catch (e) {
        // If parsing fails, treat as old format
        if (consent === 'accepted') {
          setSettings({ basic: true, analytics: true, advertising: true });
        }
      }
    }
  }, []);

  const handleAcceptAll = () => {
    const newSettings = { basic: true, analytics: true, advertising: true };
    localStorage.setItem('cookie-consent', JSON.stringify(newSettings));
    setSettings(newSettings);
    setShowBanner(false);
    setShowModal(false);
    // Enable all cookies
  };

  const handleDecline = () => {
    const newSettings = { basic: true, analytics: false, advertising: false };
    localStorage.setItem('cookie-consent', JSON.stringify(newSettings));
    setSettings(newSettings);
    setShowBanner(false);
    setShowModal(false);
    // Disable non-essential cookies
  };

  const handleSaveSettings = () => {
    localStorage.setItem('cookie-consent', JSON.stringify(settings));
    setShowBanner(false);
    setShowModal(false);
    // Apply settings
  };

  const handleCustomize = () => {
    setShowModal(true);
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Main Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-gray-700 text-sm md:text-base">
                {t('message')}{' '}
                <Link
                  href={`/${locale}/politika-privatnosti`}
                  className="text-brand-600 hover:text-brand-700 underline font-medium"
                >
                  {t('privacyPolicy')}
                </Link>
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCustomize}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                {t('customize')}
              </button>
              <button
                onClick={handleDecline}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                {t('decline')}
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                {t('acceptAll')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Customization Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('customize')} {t('privacyPolicy').toLowerCase()}
              </h3>

              <div className="space-y-4">
                {/* Basic Cookies */}
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.basic}
                    disabled
                    className="mt-1 h-4 w-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
                  />
                  <div>
                    <label className="text-sm font-medium text-gray-900">
                      {t('basicCookies')}
                    </label>
                    <p className="text-sm text-gray-600">{t('basicCookiesDesc')}</p>
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.analytics}
                    onChange={(e) => setSettings(prev => ({ ...prev, analytics: e.target.checked }))}
                    className="mt-1 h-4 w-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
                  />
                  <div>
                    <label className="text-sm font-medium text-gray-900">
                      {t('analyticsCookies')}
                    </label>
                    <p className="text-sm text-gray-600">{t('analyticsCookiesDesc')}</p>
                  </div>
                </div>

                {/* Advertising Cookies */}
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.advertising}
                    onChange={(e) => setSettings(prev => ({ ...prev, advertising: e.target.checked }))}
                    className="mt-1 h-4 w-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
                  />
                  <div>
                    <label className="text-sm font-medium text-gray-900">
                      {t('advertisingCookies')}
                    </label>
                    <p className="text-sm text-gray-600">{t('advertisingCookiesDesc')}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  {t('decline')}
                </button>
                <button
                  onClick={handleSaveSettings}
                  className="flex-1 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  {t('saveSettings')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}