import { useTranslations } from 'next-intl';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Politika Privatnosti | Olymp Nekretnine',
  description: 'Politika privatnosti Olymp Nekretnine - saznajte kako štitimo vaše podatke i privatnost.',
};

export default function PrivacyPolicyPage() {
  const t = useTranslations('PrivacyPolicy');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('title')}</h1>
          <p className="text-gray-600">
            {t('lastUpdated')}: {new Date().toLocaleDateString('sr-RS')}
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Introduction */}
          <section className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t('introduction.title')}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t('introduction.content')}
            </p>
          </section>

          {/* Data Collection */}
          <section className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t('dataCollection.title')}
            </h2>
            <p className="text-gray-700 mb-4">{t('dataCollection.content')}</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>{t('dataCollection.personalData')}</li>
              <li>{t('dataCollection.usageData')}</li>
              <li>{t('dataCollection.propertyData')}</li>
            </ul>
          </section>

          {/* Data Usage */}
          <section className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t('dataUsage.title')}
            </h2>
            <p className="text-gray-700 mb-4">{t('dataUsage.content')}</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>{t('dataUsage.services')}</li>
              <li>{t('dataUsage.communication')}</li>
              <li>{t('dataUsage.improvement')}</li>
              <li>{t('dataUsage.marketing')}</li>
            </ul>
          </section>

          {/* Cookies */}
          <section className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t('cookies.title')}
            </h2>
            <p className="text-gray-700 mb-6">{t('cookies.content')}</p>

            <div className="space-y-6">
              <div className="border-l-4 border-brand-600 pl-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('cookies.basic.title')}
                </h3>
                <p className="text-gray-700">{t('cookies.basic.content')}</p>
              </div>

              <div className="border-l-4 border-blue-600 pl-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('cookies.analytics.title')}
                </h3>
                <p className="text-gray-700">{t('cookies.analytics.content')}</p>
              </div>

              <div className="border-l-4 border-green-600 pl-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('cookies.advertising.title')}
                </h3>
                <p className="text-gray-700">{t('cookies.advertising.content')}</p>
              </div>
            </div>
          </section>

          {/* Data Sharing */}
          <section className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t('dataSharing.title')}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t('dataSharing.content')}
            </p>
          </section>

          {/* User Rights */}
          <section className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t('userRights.title')}
            </h2>
            <p className="text-gray-700 mb-4">{t('userRights.content')}</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>{t('userRights.access')}</li>
              <li>{t('userRights.correction')}</li>
              <li>{t('userRights.deletion')}</li>
              <li>{t('userRights.portability')}</li>
              <li>{t('userRights.objection')}</li>
            </ul>
          </section>

          {/* Data Security */}
          <section className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t('dataSecurity.title')}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t('dataSecurity.content')}
            </p>
          </section>

          {/* Contact */}
          <section className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t('contact.title')}
            </h2>
            <p className="text-gray-700 mb-4">{t('contact.content')}</p>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 font-medium">{t('contact.email')}</p>
              <p className="text-gray-700 font-medium">{t('contact.phone')}</p>
              <p className="text-gray-700 font-medium">{t('contact.address')}</p>
            </div>
          </section>

          {/* Changes */}
          <section className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t('changes.title')}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t('changes.content')}
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-600">
          <p>&copy; 2024 Olymp Nekretnine. Sva prava zadržana.</p>
        </div>
      </div>
    </div>
  );
}