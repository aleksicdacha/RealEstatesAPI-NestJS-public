import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { mainFont } from '@/app/config/fonts';
import { Header } from '@/app/components/Header';
import { Footer } from '@/app/components/Footer';
import { Chatbot } from '@/app/components/Chatbot';
import CookieConsent from '@/app/components/CookieConsent';
import { FavouritesProvider } from '@/app/contexts/FavouritesContext';
import { GoogleMapsProvider } from '@/app/components/GoogleMapsProvider';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  return {
    title: t('title'),
    description: t('description'),
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client side is the easiest way to get started
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <GoogleMapsProvider>
        <FavouritesProvider>
          <Header />
          {children}
          <Footer />
          <Chatbot />
          <CookieConsent />
        </FavouritesProvider>
      </GoogleMapsProvider>
    </NextIntlClientProvider>
  );
}
