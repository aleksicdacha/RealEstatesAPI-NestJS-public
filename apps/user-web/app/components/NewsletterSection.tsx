'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface NewsletterSectionProps {
  locale: string;
  variant?: 'landing' | 'footer';
}

export default function NewsletterSection({ locale, variant = 'landing' }: NewsletterSectionProps) {
  const t = useTranslations('Newsletter');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const isDisabled = isSubmitting || !email || !acceptTerms;
  const sectionClasses = variant === 'footer'
    ? 'py-10 bg-transparent'
    : 'py-20 bg-gradient-to-r from-brand-600 to-brand-700';
  const titleClasses = variant === 'footer'
    ? 'text-3xl md:text-4xl font-bold text-white mb-3'
    : 'text-4xl md:text-5xl font-bold text-white mb-6';
  const subtitleClasses = variant === 'footer'
    ? 'text-lg text-white/85 mb-6 max-w-2xl mx-auto'
    : 'text-xl text-white/90 mb-12 max-w-2xl mx-auto';

  console.log('NewsletterSection component mounted/rendered');
  console.log('NewsletterSection rendered, API URL:', process.env.NEXT_PUBLIC_API_URL);
  console.log('NewsletterSection translations:', {
    title: t('title'),
    subtitle: t('subtitle'),
    emailPlaceholder: t('emailPlaceholder'),
    subscribe: t('subscribe'),
    acceptTerms: t('acceptTerms')
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleSubmit called with email:', email, 'acceptTerms:', acceptTerms);
    
    if (!email || !acceptTerms) {
      console.log('Validation failed: email empty or terms not accepted');
      return;
    }

    console.log('Submitting newsletter subscription:', { email });

    setIsSubmitting(true);
    setMessage(null);

    try {
      console.log('About to make fetch request to:', `${process.env.NEXT_PUBLIC_API_URL}/newsletter/subscribe`);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/newsletter/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      console.log('Fetch completed, response received');
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
        setEmail('');
        setAcceptTerms(false);
      } else {
        setMessage({ type: 'error', text: data.message || 'Došlo je do greške.' });
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setMessage({ type: 'error', text: 'Došlo je do greške prilikom slanja.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={sectionClasses}>
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className={titleClasses}>
            {t('title')}
          </h2>
          <p className={subtitleClasses}>
            {t('subtitle')}
          </p>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto relative z-10 pointer-events-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  console.log('email input change:', e.target.value);
                  setEmail(e.target.value);
                }}
                placeholder={t('emailPlaceholder')}
                className="flex-1 px-6 py-4 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
                required
                disabled={isSubmitting}
              />
              <button
                type="submit"
                disabled={isDisabled}
                onClick={(e) => {
                  console.log('subscribe button clicked', { email, acceptTerms });
                }}
                aria-disabled={isDisabled}
                title={!acceptTerms ? t('acceptTerms') : ''}
                className="px-8 py-4 bg-white text-brand-600 rounded-full font-bold hover:bg-gray-100 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? t('submitting') : t('subscribe')}
              </button>
            </div>

            {!acceptTerms && (
              <p className="text-sm text-white/80 mt-2">
                {t('acceptTerms')}
              </p>
            )}

            <div className="mt-4 text-left">
              <label className="flex items-center text-white/90 text-sm">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => {
                    console.log('acceptTerms changed:', e.target.checked);
                    setAcceptTerms(e.target.checked);
                  }}
                  className="mr-2 w-4 h-4 text-brand-600 bg-white border-white/30 rounded focus:ring-white/50"
                  disabled={isSubmitting}
                />
                {t('acceptTerms')}
              </label>
            </div>
          </form>

          {message && (
            <div className={`mt-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-100 text-green-800 border border-green-200'
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          <p className="text-white/70 text-sm mt-6">
            {t('privacyNote')}
          </p>
        </div>
      </div>
    </section>
  );
}