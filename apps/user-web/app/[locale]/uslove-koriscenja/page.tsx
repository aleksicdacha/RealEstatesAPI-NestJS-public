import { useTranslations } from 'next-intl';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Uslovi Korišćenja | Olymp Nekretnine',
  description: 'Uslovi korišćenja Olymp Nekretnine - pravila i uslovi za korišćenje naše platforme za nekretnine.',
};

export default function TermsOfUsePage() {
  const t = useTranslations('TermsOfUse');

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

          {/* Acceptance */}
          <section className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t('acceptance.title')}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t('acceptance.content')}
            </p>
          </section>

          {/* Services */}
          <section className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t('services.title')}
            </h2>
            <p className="text-gray-700 mb-4">{t('services.content')}</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>{t('services.advertising')}</li>
              <li>{t('services.search')}</li>
              <li>{t('services.communication')}</li>
              <li>{t('services.consulting')}</li>
            </ul>
          </section>

          {/* User Obligations */}
          <section className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t('userObligations.title')}
            </h2>
            <p className="text-gray-700 mb-4">{t('userObligations.content')}</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>{t('userObligations.accuracy')}</li>
              <li>{t('userObligations.legality')}</li>
              <li>{t('userObligations.respect')}</li>
              <li>{t('userObligations.security')}</li>
            </ul>
          </section>

          {/* Prohibited Activities */}
          <section className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t('prohibitedActivities.title')}
            </h2>
            <p className="text-gray-700 mb-4">{t('prohibitedActivities.content')}</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>{t('prohibitedActivities.fraud')}</li>
              <li>{t('prohibitedActivities.spam')}</li>
              <li>{t('prohibitedActivities.harassment')}</li>
              <li>{t('prohibitedActivities.illegal')}</li>
              <li>{t('prohibitedActivities.copyright')}</li>
            </ul>
          </section>

          {/* Intellectual Property */}
          <section className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t('intellectualProperty.title')}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t('intellectualProperty.content')}
            </p>
          </section>

          {/* Liability */}
          <section className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t('liability.title')}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t('liability.content')}
            </p>
          </section>

          {/* Termination */}
          <section className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t('termination.title')}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t('termination.content')}
            </p>
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

          {/* Contact */}
          <section className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t('contact.title')}
            </h2>
            <p className="text-gray-700 mb-4">{t('contact.content')}</p>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 font-medium">{t('contact.email')}</p>
              <p className="text-gray-700 font-medium">{t('contact.phone')}</p>
            </div>
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