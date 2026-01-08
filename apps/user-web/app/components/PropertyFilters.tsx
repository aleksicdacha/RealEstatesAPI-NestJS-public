'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { fetchLocations } from '@/lib/api';

export interface PropertyFiltersData {
  city?: string;
  propertyType?: string;
  location?: string;
  priceFrom?: string;
  priceTo?: string;
  areaFrom?: string;
  areaTo?: string;
  numberOfRooms?: string;
  floor?: string;
  heating?: string;
  elevator?: boolean;
  sortBy?: string;
}

// Property types
const propertyTypes = [
  { value: 'Apartment', label: 'apartment' },
  { value: 'House', label: 'house' },
  { value: 'Land', label: 'land' },
  { value: 'Office', label: 'office' },
  { value: 'CommercialSpace', label: 'commercial' },
  { value: 'VacationHome', label: 'vacationHome' },
  { value: 'ApartmentInHouse', label: 'apartmentInHouse' },
  { value: 'Duplex', label: 'duplex' },
];

// Heating types
const heatingTypes = [
  { value: 'Central', label: 'centralHeating' },
  { value: 'Gas central', label: 'gasHeating' },
  { value: 'Electric central', label: 'electricHeating' },
  { value: 'Central heating with solid fuel', label: 'solidFuel' },
  { value: 'Floor', label: 'floorHeating' },
  { value: 'Independently on gas', label: 'independentGas' },
  { value: 'Independently on solid fuel', label: 'independentSolidFuel' },
  { value: 'Independently on electricity', label: 'independentElectricity' },
  { value: 'Fireplace', label: 'fireplace' },
  { value: 'Air conditioner', label: 'airConditioner' },
  { value: 'The rest types', label: 'otherHeating' },
];

interface PropertyFiltersProps {
  onFilterChange: (filters: PropertyFiltersData) => void;
  transactionType: 'sale' | 'rent';
}

interface DropdownState {
  city: boolean;
  location: boolean;
  propertyType: boolean;
  price: boolean;
  area: boolean;
  rooms: boolean;
  more: boolean;
}

export function PropertyFilters({ onFilterChange, transactionType }: PropertyFiltersProps) {
  const t = useTranslations('Properties');
  const [filters, setFilters] = useState<PropertyFiltersData>({});
  const [openDropdown, setOpenDropdown] = useState<keyof DropdownState | null>(null);
  const [cities, setCities] = useState<string[]>([]);
  const [allNeighborhoods, setAllNeighborhoods] = useState<string[]>([]);
  const [filteredNeighborhoods, setFilteredNeighborhoods] = useState<string[]>([]);
  const [dropdownPositions, setDropdownPositions] = useState<{[key: string]: {top: number, left: number}}>({});
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Calculate dropdown positions
  const calculateDropdownPosition = (dropdownType: string, buttonRef: HTMLDivElement | null) => {
    if (!buttonRef) {
      setDropdownPositions(prev => ({
        ...prev,
        [dropdownType]: { top: 200, left: 200 }
      }));
      return;
    }
    const rect = buttonRef.getBoundingClientRect();
    const position = {
      top: rect.bottom + 4,
      left: rect.left
    };
    
    // Validate position - if invalid, use fallback
    const isValid = position.top >= 0 && position.left >= 0 && position.top <= window.innerHeight + 200 && position.left <= window.innerWidth + 200;
    if (!isValid) {
      position.top = 200;
      position.left = 200;
    }
    
    setDropdownPositions(prev => ({
      ...prev,
      [dropdownType]: position
    }));
  };

  // Update positions on scroll/resize
  useEffect(() => {
    const updatePositions = () => {
      if (openDropdown) {
        const ref = dropdownRefs.current[openDropdown];
        if (ref) {
          calculateDropdownPosition(openDropdown, ref);
        }
      }
    };

    window.addEventListener('scroll', updatePositions);
    window.addEventListener('resize', updatePositions);
    return () => {
      window.removeEventListener('scroll', updatePositions);
      window.removeEventListener('resize', updatePositions);
    };
  }, [openDropdown]);

  const onFilterChangeRef = useRef(onFilterChange);

  useEffect(() => {
    onFilterChangeRef.current = onFilterChange;
  }, [onFilterChange]);

  // Load locations from API
  useEffect(() => {
    const loadLocations = async () => {
      const { cities: apiCities, neighborhoods: apiNeighborhoods } = await fetchLocations(transactionType);
      setCities(apiCities);
      setAllNeighborhoods(apiNeighborhoods);
      setFilteredNeighborhoods(apiNeighborhoods);
      
      // If there's only one city, auto-select it
      if (apiCities.length === 1) {
        setFilters(prev => {
          const newFilters = { ...prev, city: apiCities[0] };
          onFilterChangeRef.current(newFilters);
          return newFilters;
        });
      }
    };
    loadLocations();
  }, [transactionType]);

  // Filter neighborhoods by selected city
  useEffect(() => {
    if (filters.city) {
      const filtered = allNeighborhoods.filter(n => 
        n.toLowerCase().includes(filters.city!.toLowerCase())
      );
      setFilteredNeighborhoods(filtered);
    } else {
      setFilteredNeighborhoods(allNeighborhoods);
    }
  }, [filters.city, allNeighborhoods]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const clickedOutside = Object.values(dropdownRefs.current).every(
        ref => !ref?.contains(event.target as Node)
      );
      if (clickedOutside) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle filter changes
  const handleFilterChange = (key: keyof PropertyFiltersData, value: string | boolean) => {
    const newFilters = { ...filters, [key]: value };
    if (key === 'city' && !value) {
      newFilters.location = ''; // Clear location when city is cleared
    }
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  // Toggle dropdown
  const toggleDropdown = (dropdownType: keyof DropdownState) => {
    const newOpenDropdown = openDropdown === dropdownType ? null : dropdownType;
    setOpenDropdown(newOpenDropdown);
    
    // Calculate position when opening dropdown
    if (newOpenDropdown) {
      setTimeout(() => {
        const ref = dropdownRefs.current[newOpenDropdown];
        if (ref) {
          calculateDropdownPosition(newOpenDropdown, ref);
        }
      }, 0);
    }
  };

  // Get display value for filters
  const getCityDisplay = () => filters.city || t('city');
  const getLocationDisplay = () => filters.location || t('location');
  const getPropertyTypeDisplay = () => {
    if (!filters.propertyType) return t('propertyType');
    const type = propertyTypes.find(pt => pt.value === filters.propertyType);
    return type ? t(type.label) : filters.propertyType;
  };
  const getPriceDisplay = () => {
    if (!filters.priceFrom && !filters.priceTo) return transactionType === 'sale' ? t('priceRange') : t('rentRange');
    if (filters.priceFrom && filters.priceTo) return `${filters.priceFrom} - ${filters.priceTo} €`;
    if (filters.priceFrom) return `${t('from')} ${filters.priceFrom} €`;
    return `${t('to')} ${filters.priceTo} €`;
  };
  const getAreaDisplay = () => {
    if (!filters.areaFrom && !filters.areaTo) return t('areaRange');
    if (filters.areaFrom && filters.areaTo) return `${filters.areaFrom} - ${filters.areaTo} m²`;
    if (filters.areaFrom) return `${t('from')} ${filters.areaFrom} m²`;
    return `${t('to')} ${filters.areaTo} m²`;
  };
  const getRoomsDisplay = () => {
    if (!filters.numberOfRooms) return t('rooms');
    if (filters.numberOfRooms === 'garsonjera') return t('studio');
    return `${filters.numberOfRooms} ${t('rooms')}`;
  };

  const hasActiveFilters = !!(filters.city || filters.location || filters.propertyType || filters.priceFrom || filters.priceTo || filters.areaFrom || filters.areaTo || filters.numberOfRooms || filters.floor || filters.heating || filters.elevator);

  return (
    <div className="w-full bg-white border-b border-gray-200 shadow-sm sticky top-0 z-[10000]">
      <div className="px-4 py-3">
        <div className="flex items-center justify-start gap-2 min-w-max relative overflow-x-auto overflow-y-visible">
        {/* City Filter */}
        <div className="relative flex-shrink-0" ref={el => { dropdownRefs.current.city = el; }}>
          <button
            onClick={() => toggleDropdown('city')}
            className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors whitespace-nowrap text-sm text-gray-700"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span>{getCityDisplay()}</span>
            <svg className={`w-3 h-3 text-gray-500 transition-transform ${openDropdown === 'city' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openDropdown === 'city' && (
            <div 
              className="fixed z-[10000] w-64 bg-white border border-gray-200 rounded-md shadow-lg max-h-80 overflow-y-auto" 
              style={{ 
                top: dropdownPositions.city?.top || 200, 
                left: dropdownPositions.city?.left || 200,
                transform: 'translateZ(0)', 
                willChange: 'transform', 
                backfaceVisibility: 'hidden' 
              }}
            >
              <button 
                onClick={() => { handleFilterChange('city', ''); setOpenDropdown(null); }} 
                className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700 transition-colors border-b border-gray-100 font-medium"
              >
                {t('all')}
              </button>
              {cities.map((city) => (
                <button 
                  key={city}
                  onClick={() => { handleFilterChange('city', city); setOpenDropdown(null); }} 
                  className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm transition-colors border-b border-gray-100 last:border-b-0 ${filters.city === city ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-gray-700'}`}
                >
                  {city}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Location Filter */}
        <div className="relative flex-shrink-0" ref={el => { dropdownRefs.current.location = el; }}>
          <button
            onClick={() => toggleDropdown('location')}
            className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors whitespace-nowrap text-sm text-gray-700"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{getLocationDisplay()}</span>
            <svg className={`w-3 h-3 text-gray-500 transition-transform ${openDropdown === 'location' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openDropdown === 'location' && (
            <div 
              className="fixed z-[10000] w-72 bg-white border border-gray-200 rounded-md shadow-lg max-h-80 overflow-y-auto" 
              style={{ 
                top: dropdownPositions.location?.top || 200, 
                left: dropdownPositions.location?.left || 200,
                transform: 'translateZ(0)', 
                willChange: 'transform', 
                backfaceVisibility: 'hidden' 
              }}
            >
              <button 
                onClick={() => { handleFilterChange('location', ''); setOpenDropdown(null); }} 
                className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700 transition-colors border-b border-gray-100 font-medium"
              >
                {t('all')}
              </button>
              {filteredNeighborhoods.sort().map((neighborhood) => (
                <button 
                  key={neighborhood}
                  onClick={() => { handleFilterChange('location', neighborhood); setOpenDropdown(null); }} 
                  className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm transition-colors border-b border-gray-100 last:border-b-0 ${filters.location === neighborhood ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-gray-700'}`}
                >
                  {neighborhood}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Property Type Filter */}
        <div className="relative flex-shrink-0" ref={el => { dropdownRefs.current.propertyType = el; }}>
          <button
            onClick={() => toggleDropdown('propertyType')}
            className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors whitespace-nowrap text-sm text-gray-700"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>{getPropertyTypeDisplay()}</span>
            <svg className={`w-3 h-3 text-gray-500 transition-transform ${openDropdown === 'propertyType' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openDropdown === 'propertyType' && (
            <div 
              className="fixed z-[10000] w-52 bg-white border border-gray-200 rounded-md shadow-lg" 
              style={{ 
                top: dropdownPositions.propertyType?.top || 200, 
                left: dropdownPositions.propertyType?.left || 200,
                transform: 'translateZ(0)', 
                willChange: 'transform', 
                backfaceVisibility: 'hidden' 
              }}
            >
              <button 
                onClick={() => { handleFilterChange('propertyType', ''); setOpenDropdown(null); }} 
                className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700 transition-colors border-b border-gray-100 font-medium"
              >
                {t('all')}
              </button>
              {propertyTypes.map((type) => (
                <button 
                  key={type.value}
                  onClick={() => { handleFilterChange('propertyType', type.value); setOpenDropdown(null); }} 
                  className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm transition-colors border-b border-gray-100 last:border-b-0 ${filters.propertyType === type.value ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-gray-700'}`}
                >
                  {t(type.label)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Price Range Filter */}
        <div className="relative flex-shrink-0" ref={el => { dropdownRefs.current.price = el; }}>
          <button
            onClick={() => toggleDropdown('price')}
            className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors whitespace-nowrap text-sm text-gray-700"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{getPriceDisplay()}</span>
            <svg className={`w-3 h-3 text-gray-500 transition-transform ${openDropdown === 'price' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openDropdown === 'price' && (
            <div 
              className="fixed z-[10000] w-72 bg-white border border-gray-200 rounded-md shadow-lg" 
              style={{ 
                top: dropdownPositions.price?.top || 200, 
                left: dropdownPositions.price?.left || 200,
                transform: 'translateZ(0)', 
                willChange: 'transform', 
                backfaceVisibility: 'hidden' 
              }}
            >
              <div className="p-4">
                <label className="block text-xs font-medium text-gray-600 mb-2">{transactionType === 'sale' ? t('priceRange') : t('rentRange')}</label>
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="number" 
                    value={filters.priceFrom || ''} 
                    onChange={(e) => handleFilterChange('priceFrom', e.target.value)} 
                    placeholder={t('from')} 
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent" 
                  />
                  <input 
                    type="number" 
                    value={filters.priceTo || ''} 
                    onChange={(e) => handleFilterChange('priceTo', e.target.value)} 
                    placeholder={t('to')} 
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent" 
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Area Range Filter */}
        <div className="relative flex-shrink-0" ref={el => { dropdownRefs.current.area = el; }}>
          <button
            onClick={() => toggleDropdown('area')}
            className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors whitespace-nowrap text-sm text-gray-700"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
            </svg>
            <span>{getAreaDisplay()}</span>
            <svg className={`w-3 h-3 text-gray-500 transition-transform ${openDropdown === 'area' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openDropdown === 'area' && (
            <div 
              className="fixed z-[10000] w-72 bg-white border border-gray-200 rounded-md shadow-lg" 
              style={{ 
                top: dropdownPositions.area?.top || 200, 
                left: dropdownPositions.area?.left || 200,
                transform: 'translateZ(0)', 
                willChange: 'transform', 
                backfaceVisibility: 'hidden' 
              }}
            >
              <div className="p-4">
                <label className="block text-xs font-medium text-gray-600 mb-2">{t('areaRange')}</label>
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="number" 
                    value={filters.areaFrom || ''} 
                    onChange={(e) => handleFilterChange('areaFrom', e.target.value)} 
                    placeholder={t('from')} 
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent" 
                  />
                  <input 
                    type="number" 
                    value={filters.areaTo || ''} 
                    onChange={(e) => handleFilterChange('areaTo', e.target.value)} 
                    placeholder={t('to')} 
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent" 
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Rooms Filter */}
        <div className="relative flex-shrink-0" ref={el => { dropdownRefs.current.rooms = el; }}>
          <button
            onClick={() => toggleDropdown('rooms')}
            className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors whitespace-nowrap text-sm text-gray-700"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <span>{getRoomsDisplay()}</span>
            <svg className={`w-3 h-3 text-gray-500 transition-transform ${openDropdown === 'rooms' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openDropdown === 'rooms' && (
            <div 
              className="fixed z-[10000] w-48 bg-white border border-gray-200 rounded-md shadow-lg" 
              style={{ 
                top: dropdownPositions.rooms?.top || 200, 
                left: dropdownPositions.rooms?.left || 200,
                transform: 'translateZ(0)', 
                willChange: 'transform', 
                backfaceVisibility: 'hidden' 
              }}
            >
              <button onClick={() => { handleFilterChange('numberOfRooms', ''); setOpenDropdown(null); }} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700 transition-colors border-b border-gray-100 font-medium">{t('all')}</button>
              <button onClick={() => { handleFilterChange('numberOfRooms', 'garsonjera'); setOpenDropdown(null); }} className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm transition-colors border-b border-gray-100 ${filters.numberOfRooms === 'garsonjera' ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-gray-700'}`}>{t('studio')}</button>
              <button onClick={() => { handleFilterChange('numberOfRooms', '1'); setOpenDropdown(null); }} className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm transition-colors border-b border-gray-100 ${filters.numberOfRooms === '1' ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-gray-700'}`}>1 {t('room')}</button>
              <button onClick={() => { handleFilterChange('numberOfRooms', '1.5'); setOpenDropdown(null); }} className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm transition-colors border-b border-gray-100 ${filters.numberOfRooms === '1.5' ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-gray-700'}`}>1.5 {t('rooms')}</button>
              <button onClick={() => { handleFilterChange('numberOfRooms', '2'); setOpenDropdown(null); }} className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm transition-colors border-b border-gray-100 ${filters.numberOfRooms === '2' ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-gray-700'}`}>2 {t('rooms')}</button>
              <button onClick={() => { handleFilterChange('numberOfRooms', '2.5'); setOpenDropdown(null); }} className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm transition-colors border-b border-gray-100 ${filters.numberOfRooms === '2.5' ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-gray-700'}`}>2.5 {t('rooms')}</button>
              <button onClick={() => { handleFilterChange('numberOfRooms', '3'); setOpenDropdown(null); }} className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm transition-colors border-b border-gray-100 ${filters.numberOfRooms === '3' ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-gray-700'}`}>3 {t('rooms')}</button>
              <button onClick={() => { handleFilterChange('numberOfRooms', '3.5'); setOpenDropdown(null); }} className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm transition-colors border-b border-gray-100 ${filters.numberOfRooms === '3.5' ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-gray-700'}`}>3.5 {t('rooms')}</button>
              <button onClick={() => { handleFilterChange('numberOfRooms', '4'); setOpenDropdown(null); }} className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm transition-colors ${filters.numberOfRooms === '4' ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-gray-700'}`}>4+ {t('rooms')}</button>
            </div>
          )}
        </div>

        {/* More Filters */}
        <div className="relative flex-shrink-0" ref={el => { dropdownRefs.current.more = el; }}>
          <button
            onClick={() => toggleDropdown('more')}
            className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors whitespace-nowrap text-sm text-gray-700"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <span>{t('moreFilters')}</span>
            <svg className={`w-3 h-3 text-gray-500 transition-transform ${openDropdown === 'more' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openDropdown === 'more' && (
            <div 
              className="fixed z-[10000] w-64 bg-white border border-gray-200 rounded-md shadow-lg p-4" 
              style={{ 
                top: dropdownPositions.more?.top || 200, 
                left: dropdownPositions.more?.left || 200,
                transform: 'translateZ(0)', 
                willChange: 'transform', 
                backfaceVisibility: 'hidden' 
              }}
            >
              {/* Floor */}
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 mb-2">{t('floor')}</label>
                <input 
                  type="text" 
                  value={filters.floor || ''} 
                  onChange={(e) => handleFilterChange('floor', e.target.value)} 
                  placeholder="npr. Prizemlje, 2, 3..." 
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent" 
                />
              </div>
              {/* Heating */}
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 mb-2">{t('heating')}</label>
                <select 
                  value={filters.heating || ''} 
                  onChange={(e) => handleFilterChange('heating', e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">{t('all')}</option>
                  {heatingTypes.map((heating) => (
                    <option key={heating.value} value={heating.value}>{t(heating.label)}</option>
                  ))}
                </select>
              </div>
              {/* Elevator */}
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="elevator" 
                  checked={filters.elevator || false} 
                  onChange={(e) => handleFilterChange('elevator', e.target.checked)} 
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-2 focus:ring-primary-500" 
                />
                <label htmlFor="elevator" className="text-sm text-gray-700">{t('elevator')}</label>
              </div>
            </div>
          )}
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={() => {
              setFilters({});
              onFilterChange({});
            }}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            {t('clearFilters')}
          </button>
        )}
        </div>
      </div>
    </div>
  );
}
