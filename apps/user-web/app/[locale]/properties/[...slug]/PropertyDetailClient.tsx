'use client';
import { Property, getImageUrl, fetchSimilarProperties } from '@/lib/api';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import ReCAPTCHA from 'react-google-recaptcha';
import { PropertySidebar } from '@/app/components/PropertySidebar';
import { PropertyCard } from '@/app/components/PropertyCard';
import { useFavourites } from '@/app/contexts/FavouritesContext';

const PropertyMap = dynamic(
  () =>
    import('@/app/components/PropertyMap').then((mod) => ({
      default: mod.PropertyMap,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
        {/* loading */}
      </div>
    ),
  },
);

interface PropertyDetailClientProps {
  property: Property;
}

export default function PropertyDetailClient({
  property,
}: PropertyDetailClientProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { toggleFavourite, isFavourite } = useFavourites();
  const t = useTranslations('Favourites');
  const tDetail = useTranslations('PropertyDetail');
  const sortedImages = [...property.images].sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    return a.order - b.order;
  });
  const hasCoords = property.lat && property.lon;

  const [similarProperties, setSimilarProperties] = useState<Property[]>([]);
  const [similarLoading, setSimilarLoading] = useState(true);

  const pathname = usePathname();
  const router = useRouter();
  const locale = pathname.split('/')[1] || 'sr';

  // Schedule viewing modal state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [scheduleToken, setScheduleToken] = useState<string | null>(null);
  const [scheduleSending, setScheduleSending] = useState(false);
  const [scheduleSent, setScheduleSent] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleToken) {
      alert('Please complete the CAPTCHA');
      return;
    }
    setScheduleSending(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/contact/schedule-viewing`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...scheduleForm,
            propertyCode: property.code,
            recaptchaToken: scheduleToken,
          }),
        },
      );
      if (res.ok) {
        setScheduleSent(true);
      } else {
        alert(tDetail('scheduleError'));
      }
    } catch {
      alert(tDetail('scheduleError'));
    } finally {
      setScheduleSending(false);
    }
  };

  const closeScheduleModal = () => {
    setShowScheduleModal(false);
    setScheduleSent(false);
    setScheduleForm({ name: '', email: '', phone: '', message: '' });
    setScheduleToken(null);
    if (recaptchaRef.current) recaptchaRef.current.reset();
  };

  // Share utilities
  const getShareUrl = () =>
    typeof window !== 'undefined' ? window.location.href : '';

  const getShareTitle = () => {
    const type = property.propertyType || '';
    const area = property.neighborhood || '';
    const code = property.code || '';
    return `${type}${area ? ` - ${area}` : ''} | ${code}`;
  };

  const getShareText = () => {
    const priceFormatted = new Intl.NumberFormat('sr-RS', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(property.price);
    return `${getShareTitle()} — ${priceFormatted}, ${property.area}m²`;
  };

  const [copied, setCopied] = useState(false);
  const [instagramToast, setInstagramToast] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement('input');
      input.value = getShareUrl();
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleInstagramShare = async () => {
    // Try native share with image first (works on mobile, shows Instagram)
    if (navigator.share) {
      const shareData: ShareData = {
        title: getShareTitle(),
        text: getShareText(),
        url: getShareUrl(),
      };
      if (sortedImages.length > 0 && navigator.canShare) {
        try {
          const firstImage = sortedImages[0];
          const imageUrl = getImageUrl(firstImage.url);
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          const ext = firstImage.url.split('.').pop()?.split('?')[0] || 'jpg';
          const file = new File([blob], `${property.code}.${ext}`, {
            type: blob.type,
          });
          if (navigator.canShare({ files: [file] })) {
            shareData.files = [file];
          }
        } catch {
          /* fall through */
        }
      }
      try {
        await navigator.share(shareData);
        return; // Shared successfully
      } catch {
        /* fall through to clipboard */
      }
    }

    // Desktop fallback: copy formatted text to clipboard
    const text = `${getShareText()}\n${getShareUrl()}`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const input = document.createElement('input');
      input.value = text;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }
    setInstagramToast(true);
    setTimeout(() => setInstagramToast(false), 3000);
  };

  const getShareImage = () => {
    if (sortedImages.length > 0) {
      return getImageUrl(sortedImages[0].url);
    }
    return '';
  };

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl())}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(getShareText())}&url=${encodeURIComponent(getShareUrl())}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getShareUrl())}`,
    viber: `viber://forward?text=${encodeURIComponent(getShareText() + ' ' + getShareUrl())}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(getShareText() + ' ' + getShareUrl())}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(getShareUrl())}&media=${encodeURIComponent(getShareImage())}&description=${encodeURIComponent(getShareText())}`,
  };

  useEffect(() => {
    fetchSimilarProperties(property.id)
      .then(setSimilarProperties)
      .catch(() => setSimilarProperties([]))
      .finally(() => setSimilarLoading(false));
  }, [property.id]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden lg:block fixed left-4 top-24 z-10">
        <PropertySidebar />
      </div>

      {/* Main Content */}
      <div className="lg:ml-24">
        <section id="galerija" className="bg-white">
          <div className="px-4 py-8">
            <div className="text-sm text-gray-600 mb-4">
              {/* Breadcrumb here if needed */}
            </div>
            <div className="lg:flex lg:gap-8 lg:justify-center lg:flex-wrap xl:flex-nowrap">
              <div className="max-w-4xl xl:max-w-6xl 2xl:max-w-7xl flex-1 min-w-0">
                {/* Property Code/ID */}
                <div className="mb-4">
                  <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                    <svg
                      className="w-5 h-5 text-brand-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                      />
                    </svg>
                    <span className="text-sm font-semibold text-gray-700">
                      ID:
                    </span>
                    <span className="text-sm font-mono text-brand-600 font-bold">
                      {property.code}
                    </span>
                  </div>
                </div>

                {/* Main Info Section */}
                <div
                  id="informacije"
                  className="bg-gradient-to-r from-brand-50 to-brand-100 p-6 rounded-lg mb-6 relative"
                >
                  {/* Favorite button */}
                  <button
                    className="absolute top-4 right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-100 transition-colors"
                    onClick={() => toggleFavourite(property.id)}
                    title={
                      isFavourite(property.id)
                        ? t('removeFromFavourites')
                        : t('addToFavourites')
                    }
                    aria-label={
                      isFavourite(property.id)
                        ? t('removeFromFavourites')
                        : t('addToFavourites')
                    }
                  >
                    <svg
                      className={`w-6 h-6 ${isFavourite(property.id) ? 'text-red-500 fill-current' : 'text-gray-600'}`}
                      fill={isFavourite(property.id) ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </button>
                  <div className="text-4xl font-bold text-brand-600 mb-2">
                    {new Intl.NumberFormat('sr-RS', {
                      style: 'currency',
                      currency: 'EUR',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(property.price)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                        />
                      </svg>
                      <span className="font-semibold">{property.area} m²</span>
                    </div>
                    {property.floor !== undefined && (
                      <>
                        <span className="text-gray-300">|</span>
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                          <span className="font-semibold">
                            {property.floor}. {tDetail('floorSuffix')}
                          </span>
                        </div>
                      </>
                    )}
                    {property.heating && (
                      <>
                        <span className="text-gray-300">|</span>
                        <span className="font-semibold">
                          {property.heating}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                {/* Image Gallery Section */}
                {sortedImages.length > 0 && (
                  <div className="bg-white rounded-lg border p-6 mb-6">
                    <div className="mb-4">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {tDetail('imageGallery')}
                      </h2>
                    </div>
                    {/* Main Image */}
                    <div className="relative mb-4">
                      <div className="aspect-video rounded-lg overflow-hidden bg-gray-200 relative">
                        <Image
                          src={getImageUrl(
                            sortedImages[selectedImageIndex]?.url,
                          )}
                          alt={`Nekretnina ${property.code} - slika ${selectedImageIndex + 1}`}
                          fill
                          className="object-cover"
                          priority
                        />
                      </div>
                      {/* Navigation arrows */}
                      {sortedImages.length > 1 && (
                        <>
                          <button
                            onClick={() =>
                              setSelectedImageIndex((prev) =>
                                prev > 0 ? prev - 1 : sortedImages.length - 1,
                              )
                            }
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                          >
                            <svg
                              className="w-6 h-6"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() =>
                              setSelectedImageIndex((prev) =>
                                prev < sortedImages.length - 1 ? prev + 1 : 0,
                              )
                            }
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                          >
                            <svg
                              className="w-6 h-6"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                    {/* Thumbnails */}
                    {sortedImages.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {sortedImages.map((image, index) => (
                          <button
                            key={image.id}
                            onClick={() => setSelectedImageIndex(index)}
                            className={`flex-shrink-0 w-20 h-20 xl:w-24 xl:h-24 rounded-lg overflow-hidden border-2 transition-colors ${
                              index === selectedImageIndex
                                ? 'border-brand-500'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <Image
                              src={getImageUrl(image.url)}
                              alt={`Nekretnina ${property.code} - thumbnail ${index + 1}`}
                              width={80}
                              height={80}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                    {/* Image counter */}
                    <div className="text-sm text-gray-500 mt-2">
                      {selectedImageIndex + 1} / {sortedImages.length}
                    </div>
                  </div>
                )}
                {/* Basic Info Grid */}
                <div className="bg-white rounded-lg border p-6 mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    {tDetail('basicInfo')}
                  </h2>
                  <div className="grid grid-cols-2 xl:grid-cols-3 gap-6">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">
                        {tDetail('pricePerM2')}
                      </div>
                      <div className="font-semibold text-gray-900">
                        {new Intl.NumberFormat('sr-RS', {
                          style: 'currency',
                          currency: 'EUR',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(Math.round(property.price / property.area))}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">
                        {tDetail('propertyType')}
                      </div>
                      <div className="font-semibold text-gray-900">
                        {property.propertyType}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">
                        {tDetail('area')}
                      </div>
                      <div className="font-semibold text-gray-900">
                        {property.area} m²
                      </div>
                    </div>
                    {property.floor !== undefined &&
                      property.floor !== null && (
                        <div>
                          <div className="text-sm text-gray-500 mb-1">
                            {tDetail('floor')}
                          </div>
                          <div className="font-semibold text-gray-900">
                            {property.floor}
                          </div>
                        </div>
                      )}
                    {property.bathrooms && (
                      <div>
                        <div className="text-sm text-gray-500 mb-1">
                          {tDetail('bathrooms')}
                        </div>
                        <div className="font-semibold text-gray-900">
                          {property.bathrooms}
                        </div>
                      </div>
                    )}
                    {property.heating && (
                      <div>
                        <div className="text-sm text-gray-500 mb-1">
                          {tDetail('heating')}
                        </div>
                        <div className="font-semibold text-gray-900">
                          {property.heating}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {/* Description Section */}
                {property.description && (
                  <div
                    id="opremljenost"
                    className="bg-white rounded-lg border p-6 mb-6"
                  >
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      {tDetail('description')}
                    </h2>
                    <p className="text-gray-700 whitespace-pre-line">
                      {property.description}
                    </p>
                  </div>
                )}
                {/* Location Section */}
                <div
                  id="lokacija"
                  className="bg-white rounded-lg border p-6 mb-6"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {tDetail('location')}
                  </h2>
                  <div className="h-[400px] rounded-lg overflow-hidden">
                    <PropertyMap
                      properties={[property]}
                      hideInfoWindow={true}
                    />
                  </div>
                  {!hasCoords && (
                    <div className="mt-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700 flex items-center gap-2">
                      <svg
                        className="w-5 h-5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>{tDetail('noLocationSet')}</span>
                    </div>
                  )}
                  <p className="text-sm text-gray-500 mt-4">
                    <svg
                      className="w-4 h-4 inline mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {tDetail('locationNote')}
                  </p>
                </div>
                {/* Costs Section */}
                <div
                  id="troskovi"
                  className="bg-white rounded-lg border p-6 mb-6"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {tDetail('costs')}
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">
                        {tDetail('utilities')}
                      </div>
                      <div className="font-semibold text-gray-900">
                        {tDetail('onRequest')}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">
                        {tDetail('bills')}
                      </div>
                      <div className="font-semibold text-gray-900">
                        {tDetail('onRequest')}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Similar Properties Section */}
                <div
                  id="slicne"
                  className="bg-white rounded-lg border p-6 mb-6"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {tDetail('similarProperties')}
                  </h2>
                  {similarLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="animate-pulse bg-gray-100 rounded-lg h-64"
                        />
                      ))}
                    </div>
                  ) : similarProperties.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {similarProperties.map((similar) => (
                        <PropertyCard
                          key={similar.id}
                          property={similar}
                          priority={false}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">
                      {tDetail('similarPropertiesSoon')}
                    </p>
                  )}
                </div>
                {/* Loan Calculator Section */}
                <div
                  id="kalkulator"
                  className="bg-white rounded-lg border p-6 mb-6"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {tDetail('loanCalculator')}
                  </h2>
                  <p className="text-gray-500">
                    {tDetail('loanCalculatorSoon')}
                  </p>
                </div>
              </div>
              {/* Sidebar Section */}
              <div className="w-full max-w-md xl:w-80 xl:flex-shrink-0 xl:max-w-none mt-8 xl:mt-0">
                <div className="bg-white rounded-lg border p-6 xl:sticky xl:top-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {tDetail('scheduleViewing')}
                  </h3>
                  <button
                    onClick={() => setShowScheduleModal(true)}
                    className="w-full bg-brand-600 hover:bg-brand-700 text-white py-3 px-6 rounded-full font-semibold mb-3 transition-colors"
                  >
                    {tDetail('scheduleViewingBtn')}
                  </button>
                  <button
                    onClick={() => router.push(`/${locale}/kontakt`)}
                    className="w-full border-2 border-brand-600 text-brand-600 hover:bg-brand-50 py-3 px-6 rounded-full font-semibold transition-colors"
                  >
                    {tDetail('contactUs')}
                  </button>
                  <div className="mt-6 pt-6 border-t">
                    <div className="text-sm text-gray-600 mb-3">
                      {tDetail('callUs')}
                    </div>
                    <div className="space-y-2">
                      <a
                        href="tel:+38118277181"
                        className="flex items-center gap-2 text-brand-600 hover:text-brand-700 transition-colors"
                      >
                        <svg
                          className="w-4 h-4 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        <span className="font-semibold">
                          +381 (0) 18 277 181
                        </span>
                      </a>
                      <a
                        href="tel:+381621128265"
                        className="flex items-center gap-2 text-gray-700 hover:text-brand-600 transition-colors"
                      >
                        <svg
                          className="w-4 h-4 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        <span>+381 (0) 62 112 8265 — Vlada</span>
                      </a>
                      <a
                        href="tel:+381692924774"
                        className="flex items-center gap-2 text-gray-700 hover:text-brand-600 transition-colors"
                      >
                        <svg
                          className="w-4 h-4 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        <span>+381 (0) 69 292 4774 — Suzana</span>
                      </a>
                      <a
                        href="tel:+381600217449"
                        className="flex items-center gap-2 text-gray-700 hover:text-brand-600 transition-colors"
                      >
                        <svg
                          className="w-4 h-4 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        <span>+381 (0) 60 021 7449 — Anica</span>
                      </a>
                    </div>
                  </div>
                  <div className="mt-6 pt-6 border-t">
                    <div className="text-sm text-gray-600 mb-3">
                      {tDetail('shareAd')}
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {/* Instagram (via native share on mobile) */}
                      <button
                        onClick={handleInstagramShare}
                        title="Instagram"
                        className="flex items-center justify-center p-2.5 rounded-lg border hover:bg-pink-50 hover:border-pink-300 transition-colors group"
                      >
                        <svg
                          className="w-5 h-5 text-gray-600 group-hover:text-[#E4405F]"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                        </svg>
                      </button>
                      {/* Facebook */}
                      <a
                        href={shareLinks.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Facebook"
                        className="flex items-center justify-center p-2.5 rounded-lg border hover:bg-blue-50 hover:border-blue-300 transition-colors group"
                      >
                        <svg
                          className="w-5 h-5 text-gray-600 group-hover:text-[#1877F2]"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                      </a>
                      {/* Viber */}
                      <a
                        href={shareLinks.viber}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Viber"
                        className="flex items-center justify-center p-2.5 rounded-lg border hover:bg-purple-50 hover:border-purple-300 transition-colors group"
                      >
                        <svg
                          className="w-5 h-5 text-gray-600 group-hover:text-[#7360F2]"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0z"
                            fill="currentColor"
                            fillOpacity="0.15"
                            className="group-hover:fill-[#7360F2] group-hover:fill-opacity-20"
                          />
                          <path
                            d="M16.5 6.5c-1.2-1.2-2.8-1.9-4.5-1.9-3.5 0-6.3 2.8-6.3 6.3 0 1.1.3 2.2.9 3.1l-1 3.6 3.7-1c.9.5 2 .8 3 .8 3.5 0 6.3-2.8 6.3-6.3 0-1.7-.7-3.3-1.9-4.5-.1-.1-.1-.1-.2-.1z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M14.5 9.5c-.7-.7-1.5-1-2.5-1-1.9 0-3.4 1.5-3.4 3.4 0 .6.1 1.2.5 1.7l-.5 2 2-.5c.5.3 1.1.5 1.7.5 1.9 0 3.4-1.5 3.4-3.4 0-.9-.3-1.8-1-2.5"
                            stroke="currentColor"
                            strokeWidth="1.3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M13.6 10.8c-.3-.2-.7-.4-1.1-.4-.9 0-1.5.7-1.5 1.5 0 .3.1.5.2.7l-.2.9.9-.2c.2.1.5.2.7.2.9 0 1.5-.7 1.5-1.5 0-.4-.2-.8-.4-1.1"
                            stroke="currentColor"
                            strokeWidth="1.1"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </a>
                      {/* Twitter/X */}
                      <a
                        href={shareLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Twitter / X"
                        className="flex items-center justify-center p-2.5 rounded-lg border hover:bg-sky-50 hover:border-sky-300 transition-colors group"
                      >
                        <svg
                          className="w-5 h-5 text-gray-600 group-hover:text-black"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                      </a>
                      {/* WhatsApp */}
                      <a
                        href={shareLinks.whatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="WhatsApp"
                        className="flex items-center justify-center p-2.5 rounded-lg border hover:bg-green-50 hover:border-green-300 transition-colors group"
                      >
                        <svg
                          className="w-5 h-5 text-gray-600 group-hover:text-[#25D366]"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                      </a>
                      {/* LinkedIn */}
                      <a
                        href={shareLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="LinkedIn"
                        className="flex items-center justify-center p-2.5 rounded-lg border hover:bg-blue-50 hover:border-blue-400 transition-colors group"
                      >
                        <svg
                          className="w-5 h-5 text-gray-600 group-hover:text-[#0A66C2]"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                      </a>
                      {/* Pinterest */}
                      <a
                        href={shareLinks.pinterest}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Pinterest"
                        className="flex items-center justify-center p-2.5 rounded-lg border hover:bg-red-50 hover:border-red-400 transition-colors group"
                      >
                        <svg
                          className="w-5 h-5 text-gray-600 group-hover:text-[#E60023]"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
                        </svg>
                      </a>
                      {/* Copy Link */}
                      <button
                        onClick={handleCopyLink}
                        title={
                          copied
                            ? tDetail('shareCopied')
                            : tDetail('shareCopyLink')
                        }
                        className="flex items-center justify-center p-2.5 rounded-lg border hover:bg-gray-100 hover:border-gray-400 transition-colors group relative"
                      >
                        {copied ? (
                          <svg
                            className="w-5 h-5 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-5 h-5 text-gray-600 group-hover:text-gray-900"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Instagram Toast */}
      {instagramToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-pink-500 to-red-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3 animate-bounce">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
          </svg>
          <span className="font-semibold text-sm">
            {tDetail('shareInstagramToast')}
          </span>
        </div>
      )}

      {/* Schedule Viewing Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {tDetail('scheduleViewing')}
                </h3>
                <button
                  onClick={closeScheduleModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {scheduleSent ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 mb-2">
                    {tDetail('scheduleSuccess')}
                  </p>
                  <p className="text-gray-500 mb-6">
                    {tDetail('scheduleSuccessDesc')}
                  </p>
                  <button
                    onClick={closeScheduleModal}
                    className="bg-brand-600 hover:bg-brand-700 text-white py-2 px-8 rounded-full font-semibold transition-colors"
                  >
                    {tDetail('close')}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleScheduleSubmit}>
                  <div className="mb-4 p-3 bg-brand-50 rounded-lg border border-brand-200">
                    <div className="text-xs text-brand-600 font-semibold uppercase mb-1">
                      {tDetail('propertyCode')}
                    </div>
                    <div className="text-lg font-mono font-bold text-brand-700">
                      {property.code}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {tDetail('scheduleName')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={scheduleForm.name}
                      onChange={(e) =>
                        setScheduleForm((p) => ({ ...p, name: e.target.value }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors"
                      placeholder={tDetail('scheduleNamePlaceholder')}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {tDetail('scheduleEmail')} *
                    </label>
                    <input
                      type="email"
                      required
                      value={scheduleForm.email}
                      onChange={(e) =>
                        setScheduleForm((p) => ({
                          ...p,
                          email: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors"
                      placeholder="email@example.com"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {tDetail('schedulePhone')}
                    </label>
                    <input
                      type="tel"
                      value={scheduleForm.phone}
                      onChange={(e) =>
                        setScheduleForm((p) => ({
                          ...p,
                          phone: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors"
                      placeholder="+381 6X XXX XXXX"
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {tDetail('scheduleMessage')}
                    </label>
                    <textarea
                      rows={3}
                      value={scheduleForm.message}
                      onChange={(e) =>
                        setScheduleForm((p) => ({
                          ...p,
                          message: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors resize-none"
                      placeholder={tDetail('scheduleMessagePlaceholder')}
                    />
                  </div>

                  <div className="mb-6">
                    <ReCAPTCHA
                      ref={recaptchaRef}
                      sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
                      onChange={(token) => setScheduleToken(token)}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={scheduleSending}
                    className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white py-3 px-6 rounded-full font-semibold transition-colors"
                  >
                    {scheduleSending
                      ? tDetail('scheduleSending')
                      : tDetail('scheduleSend')}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
