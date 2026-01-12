'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { fetchProperties, Property } from '@/lib/api';
import { PropertyCard } from '@/app/components/PropertyCard';
import { PropertyMap } from '@/app/components/PropertyMap';
import { FavouritePropertyCard } from '@/app/components/FavouritePropertyCard';
import { PropertyFilters, PropertyFiltersData } from '@/app/components/PropertyFilters';
import { useFavourites } from '@/app/contexts/FavouritesContext';
import { useTranslations } from 'next-intl';

export const dynamic = 'force-dynamic';

export default function ProdajaPage() {
  const t = useTranslations('Properties');
  const tFav = useTranslations('Favourites');
  const tWhy = useTranslations('WhyChooseUs');
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(true);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<PropertyFiltersData>({});
  const [sortOpen, setSortOpen] = useState(false);
  const [currentSort, setCurrentSort] = useState('createdAt-desc');
  const sortRef = useRef<HTMLDivElement>(null);
  const { favourites } = useFavourites();

  const sortOptions = [
    { value: 'createdAt-desc', label: t('sortByDateNewest') },
    { value: 'createdAt-asc', label: t('sortByDateOldest') },
    { value: 'price-asc', label: t('sortByPriceAsc') },
    { value: 'price-desc', label: t('sortByPriceDesc') },
    { value: 'area-asc', label: t('sortByAreaAsc') },
    { value: 'area-desc', label: t('sortByAreaDesc') },
  ];

  const currentSortLabel = sortOptions.find(opt => opt.value === currentSort)?.label || sortOptions[0].label;

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
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [sortOpen]);

  // Fetch properties with filters
  const loadProperties = async (filterData: PropertyFiltersData) => {
    setLoading(true);
    try {
      // Parse sort by
      const [sortField, sortOrder] = (filterData.sortBy || 'createdAt-desc').split('-');
      
      const params: any = {
        page: 1,
        limit: 50,
        sortBy: sortField,
        order: sortOrder.toUpperCase(),
        clientTransactionType: 'seller'
      };

      // Add filters
      if (filterData.city) params.city = filterData.city;
      if (filterData.propertyType) params.propertyType = filterData.propertyType;
      if (filterData.location) params.neighborhoods = filterData.location;
      if (filterData.priceFrom) params.minPrice = parseFloat(filterData.priceFrom);
      if (filterData.priceTo) params.maxPrice = parseFloat(filterData.priceTo);
      if (filterData.areaFrom) params.minArea = parseFloat(filterData.areaFrom);
      if (filterData.areaTo) params.maxArea = parseFloat(filterData.areaTo);
      if (filterData.numberOfRooms) params.roomStructure = filterData.numberOfRooms;
      if (filterData.floor) params.floors = filterData.floor;
      if (filterData.heating) params.heating = filterData.heating;
      if (filterData.elevator !== undefined) params.elevator = filterData.elevator;

      const data = await fetchProperties(params);
      setProperties(data.items);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties(filters);
  }, []);

  // Handle filter changes
  const handleFilterChange = (newFilters: PropertyFiltersData) => {
    setFilters(newFilters);
    loadProperties(newFilters);
  };

  return (
    <main className="min-h-screen overflow-visible">
      {/* Filters */}
      <PropertyFilters 
        onFilterChange={handleFilterChange}
        transactionType="sale"
      />

      {/* Properties List Section */}
      <section className="py-6 bg-gray-50">
        <div className="max-w-[1920px] mx-auto px-4">
          {/* Controls: count, sort, and map toggle */}
          <div className="flex items-center justify-between mb-6">
            {/* Showing count */}
            <h2 className="text-lg font-medium text-gray-600">
              {loading ? 'Loading...' : `${t('showing')} ${properties.length} ${t('properties')}`}
            </h2>

            {/* Sort and Map Toggle */}
            <div className="flex items-center gap-3 relative z-10">
              {/* Sort Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setSortOpen(!sortOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-full bg-white hover:bg-gray-50 transition-colors text-gray-700 min-h-[36px]"
                >
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                  </svg>
                  <span>{currentSortLabel}</span>
                  <svg className={`w-3 h-3 text-gray-500 transition-transform ${sortOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {sortOpen && (
                  <div className="absolute right-0 top-full z-[300] mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => { handleSortChange(option.value); setSortOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${currentSort === option.value ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-700'}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Map Toggle Switch */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">{t('showMap')}</span>
                <button
                  onClick={() => setShowMap(!showMap)}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 shadow-sm ${
                    showMap ? 'bg-primary-600 hover:bg-primary-700' : 'bg-gray-400 hover:bg-gray-500'
                  }`}
                  role="switch"
                  aria-checked={showMap}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
                      showMap ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Split layout: 65% Properties List, 35% Map */}
          <div className={`grid gap-6 transition-all duration-500 ease-in-out ${
            showMap ? 'lg:grid-cols-[2fr_1fr]' : 'grid-cols-1'
          }`}>
            {/* Properties List */}
            <div>
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
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

            {/* Map - Sticky on right side */}
            {showMap && (
              <div className="w-full h-[calc(100vh-200px)] max-h-[800px] sticky top-4 rounded-lg overflow-hidden shadow-lg">
                <PropertyMap
                  properties={properties}
                  selectedPropertyId={selectedPropertyId || undefined}
                  onPropertyClick={(property) => {
                    window.open(`/prodaja/${property.code}`, '_blank');
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Favourite Properties */}
      {favourites.length > 0 && (
        <section key={favourites.length} className="py-16 bg-white">
          <div className="px-2">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-6 text-center">
                {tFav('favouriteProperties')}
              </h2>
              <p className="text-center text-gray-600">
                {tFav('savedPropertiesCount', { count: favourites.length })}
              </p>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
              {properties
                .filter(property => favourites.includes(property.id))
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
              <h3 className="font-bold text-xl mb-2">{tWhy('forSale.feature1Title')}</h3>
              <p className="text-gray-600">{tWhy('forSale.feature1Description')}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                {/* <span className="text-primary-600 text-2xl">🗺️</span> */}
              </div>
              <h3 className="font-bold text-xl mb-2">{tWhy('forSale.feature2Title')}</h3>
              <p className="text-gray-600">{tWhy('forSale.feature2Description')}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                {/* <span className="text-primary-600 text-2xl">✓</span> */}
              </div>
              <h3 className="font-bold text-xl mb-2">{tWhy('forSale.feature3Title')}</h3>
              <p className="text-gray-600">{tWhy('forSale.feature3Description')}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}