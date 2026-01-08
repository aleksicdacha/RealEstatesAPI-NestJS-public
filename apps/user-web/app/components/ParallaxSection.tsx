'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';

interface ParallaxSectionProps {
  locale: string;
  type: 'buyers' | 'sellers';
}

export default function ParallaxSection({ locale, type }: ParallaxSectionProps) {
  const t = useTranslations('Parallax');

  const content = {
    buyers: {
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1973&auto=format&fit=crop',
      title: t('buyersTitle'),
      description: t('buyersDesc'),
      features: [
        t('buyersFeature1'),
        t('buyersFeature2'),
        t('buyersFeature3'),
      ],
      buttons: [
        { text: t('viewProperties'), href: `/${locale}/prodaja`, primary: true },
        { text: t('rentProperties'), href: `/${locale}/izdavanje`, primary: false },
      ],
    },
    sellers: {
      image: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=1996&auto=format&fit=crop',
      title: t('sellersTitle'),
      description: t('sellersDesc'),
      features: [
        t('sellersFeature1'),
        t('sellersFeature2'),
        t('sellersFeature3'),
      ],
      buttons: [
        { text: t('offerProperty'), href: `/${locale}/kontakt`, primary: true },
        { text: t('learnMore'), href: `/${locale}/o-nama`, primary: false },
      ],
    },
  };

  const section = content[type];

  return (
    <section className="relative min-h-[600px] flex items-center overflow-hidden">
      {/* Parallax Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: `url('${section.image}')`,
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40"></div>
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 py-20">
        <div className="max-w-2xl">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            {section.title}
          </h2>
          <p className="text-xl md:text-2xl text-gray-200 mb-10 leading-relaxed">
            {section.description}
          </p>

          {/* Features */}
          <div className="space-y-4 mb-10">
            {section.features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3 text-white">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center mt-1">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-lg">{feature}</span>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            {section.buttons.map((button, index) => (
              <Link
                key={index}
                href={button.href}
                className={`inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-xl ${
                  button.primary
                    ? 'bg-orange-600 hover:bg-orange-700 text-white'
                    : 'bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border-2 border-white/50'
                }`}
              >
                {button.text}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
