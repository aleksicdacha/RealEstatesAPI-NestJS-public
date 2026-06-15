'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { fetchProperties, Property } from '@/lib/api';
import { PropertyCard } from '@/app/components/PropertyCard';
import { Loader } from '@/app/components/Loader';
import { PropertyMap } from '@/app/components/PropertyMap';
import { FavouritePropertyCard } from '@/app/components/FavouritePropertyCard';
import {
  PropertyFilters,
  PropertyFiltersData,
} from '@/app/components/PropertyFilters';
import { useFavourites } from '@/app/contexts/FavouritesContext';
import { useTranslations } from 'next-intl';

export const dynamic = 'force-dynamic';

export default function ProdajaPage() {
  const t = useTranslations('Properties');
  const tFav = useTranslations('Favourites');
  const tWhy = useTranslations('WhyChooseUs');
  const tCommon = useTranslations('Common');
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
    null,
  );
  const [showMap, setShowMap] = useState(true);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<PropertyFiltersData>({});
  const [sortOpen, setSortOpen] = useState(false);
  const [currentSort, setCurrentSort] = useState('createdAt-desc');
  const sortRef = useRef<HTMLDivElement>(null);
  const { favourites } = useFavourites();

  const searchParams = useSearchParams();
  const initialCity = searchParams.get('city') || undefined;

  const hasCoords = properties.some((p) => p.lat && p.lon);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit, setLimit] = useState(20);

  const sortOptions = [
    { value: 'createdAt-desc', label: t('sortByDateNewest') },
    { value: 'createdAt-asc', label: t('sortByDateOldest') },
    { value: 'price-asc', label: t('sortByPriceAsc') },
    { value: 'price-desc', label: t('sortByPriceDesc') },
    { value: 'area-asc', label: t('sortByAreaAsc') },
    { value: 'area-desc', label: t('sortByAreaDesc') },
  ];

  const currentSortLabel =
    sortOptions.find((opt) => opt.value === currentSort)?.label ||
    sortOptions[0].label;

  const handleSortChange = (sortValue: string) => {
    setCurrentSort(sortValue);
    const newFilters = { ...filters, sortBy: sortValue };
    setFilters(newFilters);
    loadProperties(newFilters);
  };

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setSortOpen(false);
      }
    };
    if (sortOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [sortOpen]);

  // Fetch properties with filters
  const loadProperties = async (
    filterData: PropertyFiltersData,
    page = 1,
    pageLimit = limit,
  ) => {
    setLoading(true);
    try {
      const [sortField, sortOrder] = (
        filterData.sortBy || 'createdAt-desc'
      ).split('-');

      const params: any = {
        page,
        limit: pageLimit,
        sortBy: sortField,
        order: sortOrder.toUpperCase(),
        clientTransactionType: 'seller',
      };

      if (filterData.city) params.city = filterData.city;
      if (filterData.propertyType)
        params.propertyType = filterData.propertyType;
      if (filterData.location) params.neighborhoods = filterData.location;
      if (filterData.priceFrom)
        params.minPrice = parseFloat(filterData.priceFrom);
      if (filterData.priceTo) params.maxPrice = parseFloat(filterData.priceTo);
      if (filterData.areaFrom) params.minArea = parseFloat(filterData.areaFrom);
      if (filterData.areaTo) params.maxArea = parseFloat(filterData.areaTo);
      if (filterData.numberOfRooms)
        params.roomStructure = filterData.numberOfRooms;
      if (filterData.floor) params.floors = filterData.floor;
      if (filterData.heating) params.heating = filterData.heating;
      if (filterData.elevator !== undefined)
        params.elevator = filterData.elevator;

      const data = await fetchProperties(params);
      setProperties(data.items);
      setTotalPages(data.meta.totalPages);
      setTotalItems(data.meta.totalItems);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: PropertyFiltersData) => {
    setFilters(newFilters);
    loadProperties(newFilters, 1); // Reset to page 1 on filter change
  };

  const handlePageChange = (page: number) => {
    loadProperties(filters, page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    loadProperties(filters, 1, newLimit);
  };

  return (
    <main className="min-h-screen overflow-visible">
      {/* Filters */}
      <PropertyFilters
        onFilterChange={handleFilterChange}
        transactionType="sale"
        initialCity={initialCity}
      />

      {/* Properties List Section */}
      <section className="py-6 bg-gray-50">
        <div className="max-w-[1920px] mx-auto px-4">
          {/* Controls: sort and map toggle */}
          <div className="flex items-center justify-start mb-3">
            <div className="flex items-center gap-3 relative z-10">
              {/* Sort Dropdown */}
              <div className="relative" ref={sortRef}>
                <button
                  onClick={() => setSortOpen(!sortOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-full bg-white hover:bg-gray-50 transition-colors text-gray-700 min-h-[36px]"
                >
                  <svg
                    className="w-4 h-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                    />
                  </svg>
                  <span>{currentSortLabel}</span>
                  <svg
                    className={`w-3 h-3 text-gray-500 transition-transform ${sortOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {sortOpen && (
                  <div className="absolute right-0 top-full z-[300] mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          handleSortChange(option.value);
                          setSortOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${currentSort === option.value ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-700'}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Map Toggle */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">
                  {t('showMap')}
                </span>
                <button
                  onClick={() => setShowMap(!showMap)}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 shadow-sm ${showMap ? 'bg-primary-600 hover:bg-primary-700' : 'bg-gray-400 hover:bg-gray-500'}`}
                  role="switch"
                  aria-checked={showMap}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${showMap ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Showing count */}
          <div className="mb-4">
            <h2 className="text-lg font-medium text-gray-600">
              {loading
                ? tCommon('loading')
                : `${t('showing')} ${properties.length} ${t('of')} ${totalItems} ${t('properties')}`}
            </h2>
          </div>

          {/* Split layout: Properties + Map */}
          <div
            className={`grid gap-6 transition-all duration-500 ease-in-out ${showMap ? 'lg:grid-cols-[2fr_1fr]' : 'grid-cols-1'}`}
          >
            {/* Properties List */}
            <div>
              {loading ? (
                <div className="text-center py-12">
                  <Loader size="lg" text="Učitavanje nekretnina..." />
                </div>
              ) : properties.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-xl text-gray-600 mb-2">{t('noResults')}</p>
                  <p className="text-gray-500">{t('noResultsMessage')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {properties.map((property, index) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      onHover={setSelectedPropertyId}
                      priority={index < 6}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Map */}
            {showMap && (
              <div className="sticky top-4 self-start">
                <div className="w-full h-[calc(100vh-200px)] max-h-[800px] rounded-lg overflow-hidden shadow-lg">
                  <PropertyMap
                    properties={properties}
                    selectedPropertyId={selectedPropertyId || undefined}
                    onPropertyClick={(property) => {
                      window.open(`/prodaja/${property.code}`, '_blank');
                    }}
                  />
                </div>
                {!hasCoords && properties.length > 0 && (
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
                    <span>{t('noMapLocations')}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && !loading && (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{t('perPage')}:</span>
                {[20, 50, 100].map((l) => (
                  <button
                    key={l}
                    onClick={() => handleLimitChange(l)}
                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${limit === l ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-600 border-gray-300 hover:border-brand-600'}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="px-3 py-2 text-sm rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ‹ {tCommon('previous')}
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 7) pageNum = i + 1;
                  else if (currentPage <= 4) pageNum = i + 1;
                  else if (currentPage >= totalPages - 3)
                    pageNum = totalPages - 6 + i;
                  else pageNum = currentPage - 3 + i;
                  if (pageNum < 1 || pageNum > totalPages) return null;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-9 h-9 text-sm rounded-md border transition-colors ${pageNum === currentPage ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-600 border-gray-300 hover:border-brand-600'}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="px-3 py-2 text-sm rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {tCommon('next')} ›
                </button>
              </div>
              <span className="text-sm text-gray-500">
                {t('page')} {currentPage} {t('of')} {totalPages}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Favourite Properties */}
      {favourites.length > 0 && (
        <section key={favourites.length} className="py-16 bg-white">
          <div className="px-2">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-600 mb-6 text-center">
                {tFav('favouriteProperties')}
              </h2>
              <p className="text-center text-gray-600">
                {tFav('savedPropertiesCount', { count: favourites.length })}
              </p>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
              {properties
                .filter((property) => favourites.includes(property.id))
                .map((property, index) => (
                  <FavouritePropertyCard
                    key={property.id}
                    property={property}
                    priority={index < 8}
                  />
                ))}
            </div>
          </div>
        </section>
      )}

      {/* Why Choose Us */}
      <section className="py-16">
        <div className="px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">
            {tWhy('title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                {/* <span className="text-primary-600 text-2xl">🏠</span> */}
              </div>
              <h3 className="font-bold text-xl mb-2">
                {tWhy('forSale.feature1Title')}
              </h3>
              <p className="text-gray-600">
                {tWhy('forSale.feature1Description')}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                {/* <span className="text-primary-600 text-2xl">🗺️</span> */}
              </div>
              <h3 className="font-bold text-xl mb-2">
                {tWhy('forSale.feature2Title')}
              </h3>
              <p className="text-gray-600">
                {tWhy('forSale.feature2Description')}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                {/* <span className="text-primary-600 text-2xl">✓</span> */}
              </div>
              <h3 className="font-bold text-xl mb-2">
                {tWhy('forSale.feature3Title')}
              </h3>
              <p className="text-gray-600">
                {tWhy('forSale.feature3Description')}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
