"use client";

import React, { useState, useEffect } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { useTranslations } from 'next-intl';
import { Card } from 'primereact/card';
import { Accordion, AccordionTab } from 'primereact/accordion';

export interface PropertyFilterValues {
  city?: string;
  neighborhoods?: string[];
  propertyTypes?: string[];
  roomStructure?: string[];
  status?: string[];
  priceFrom?: number | null;
  priceTo?: number | null;
  areaFrom?: number | null;
  areaTo?: number | null;
  bathrooms?: number[];
  floors?: string[];
  heating?: string[];
  features?: string[];
}

interface PropertyFiltersProps {
  onFilterChange: (filters: PropertyFilterValues) => void;
  onReset: () => void;
}

export const PropertyFilters: React.FC<PropertyFiltersProps> = ({ onFilterChange, onReset }) => {
  const t = useTranslations('properties');
  const tCommon = useTranslations('common');

  const [filters, setFilters] = useState<PropertyFilterValues>({
    city: 'Niš', // Default grad
  });
  const [localFilters, setLocalFilters] = useState<PropertyFilterValues>({
    city: 'Niš',
  });

  const [cityOptions, setCityOptions] = useState<{ label: string; value: string }[]>([]);
  const [neighborhoodOptions, setNeighborhoodOptions] = useState<{ label: string; value: string }[]>([]);

  // Fetch filter options from API
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        const response = await fetch(`${apiUrl}/v1/properties/filters/options`);
        const data = await response.json();
        
        setCityOptions(data.cities.map((city: string) => ({ label: city, value: city })));
        setNeighborhoodOptions(data.neighborhoods.map((n: string) => ({ label: n, value: n })));
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    };

    fetchFilterOptions();
  }, []);

  // Trigger initial filter with default city
  React.useEffect(() => {
    onFilterChange(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const propertyTypeOptions = [
    { label: t('typeApartment'), value: 'apartment' },
    { label: t('typeHouse'), value: 'house' },
    { label: t('typeApartmentInHouse'), value: 'apartment-in-house' },
    { label: t('typeCommercialSpace'), value: 'commercial-space' },
    { label: t('typeOffice'), value: 'office' },
    { label: t('typeLand'), value: 'land' },
    { label: t('typeVacationHome'), value: 'vacation-home' },
    { label: t('typeDuplex'), value: 'duplex' },
  ];

  const statusOptions = [
    { label: t('statusActive'), value: 'active' },
    { label: t('statusInactive'), value: 'inactive' },
    { label: t('statusDeleted'), value: 'deleted' },
  ];

  const structureOptions = [
    { label: 'Garsonjera', value: 'garsonjera' },
    { label: 'Jednosoban', value: 'jednosoban' },
    { label: 'Jednoiposoban', value: 'jednoiposoban' },
    { label: 'Dvosoban', value: 'dvosoban' },
    { label: 'Dvoiposoban', value: 'dvoiposoban' },
    { label: 'Trosoban', value: 'trosoban' },
    { label: 'Troiposoban', value: 'troiposoban' },
    { label: 'Četvorosoban', value: 'cetvorosoban' },
    { label: 'Četvoroiposoban', value: 'cetvoroiposoban' },
    { label: 'Petosoban i veći', value: 'petosoban' },
    { label: 'Ostalo', value: 'ostalo' },
  ];

  const bedroomOptions = [
    { label: '1 spavaća', value: 1 },
    { label: '2 spavaće', value: 2 },
    { label: '3 spavaće', value: 3 },
    { label: '4 spavaće', value: 4 },
    { label: '5 spavaćih', value: 5 },
    { label: '6 i više spavaćih', value: 6 },
  ];

  const bathroomOptions = [
    { label: t('bathroom1'), value: 1 },
    { label: t('bathroom2'), value: 2 },
    { label: t('bathroom3'), value: 3 },
    { label: t('bathroom4'), value: 4 },
  ];

  const floorOptions = [
    { label: t('floorSU'), value: 'SU' },
    { label: t('floorVPR'), value: 'VPR' },
    { label: t('floorPR'), value: 'PR' },
    { label: t('floor1'), value: '1' },
    { label: t('floor2-4'), value: '2-4' },
    { label: t('floor5-10'), value: '5-10' },
    { label: t('floor11+'), value: '11+' },
    { label: t('floorPTK'), value: 'PTK' },
    { label: t('floorNotLast'), value: 'not-last' },
    { label: t('floor1-3NoElevator'), value: '1-3-no-elevator' },
  ];

  const furnishedOptions = [
    { label: 'Namešten', value: 'namesten' },
    { label: 'Polunamešten', value: 'polunamesten' },
    { label: 'Prazan', value: 'prazan' },
  ];

  const heatingOptions = [
    { label: t('heatingCentral'), value: 'central' },
    { label: t('heatingGasCentral'), value: 'gas-central' },
    { label: t('heatingSolidFuel'), value: 'solid-fuel-central' },
    { label: t('heatingElectricCentral'), value: 'electric-central' },
    { label: t('heatingFloor'), value: 'floor' },
    { label: t('heatingGasIndependent'), value: 'independent-on-gas' },
    { label: t('heatingSolidFuelIndependent'), value: 'independent-on-solid-fuel' },
    { label: t('heatingElectricIndependent'), value: 'independent-on-electricity' },
    { label: t('heatingFireplace'), value: 'fireplace' },
    { label: t('heatingAirConditioner'), value: 'air-conditioner' },
    { label: t('heatingOther'), value: 'other' },
  ];

  // Additional equipment options with icons - comprehensive list
  // Additional equipment options with icons - organized in groups
  const equipmentOptions = [
    {
      label: t('sectionBasics'),
      code: 'basics',
      items: [
        { label: t('equipBalcony'), value: 'Balcony', icon: 'pi-building' },
        { label: t('equipGarage'), value: 'Garage', icon: 'pi-car' },
        { label: t('equipParkingSpace'), value: 'Parking Space', icon: 'pi-map-marker' },
        { label: t('equipGarden'), value: 'Garden', icon: 'pi-sun' },
        { label: t('equipFireplace'), value: 'Fireplace', icon: 'pi-verified' },
        { label: t('equipLaundryRoom'), value: 'Laundry Room', icon: 'pi-sync' },
        { label: t('equipStorageRoom'), value: 'Storage Room', icon: 'pi-inbox' },
      ]
    },
    {
      label: t('sectionSecurity'),
      code: 'security',
      items: [
        { label: t('equipSecuritySystem'), value: 'Security System', icon: 'pi-shield' },
        { label: t('equipSecurityCameras'), value: 'Home Security Cameras', icon: 'pi-eye' },
        { label: t('equipVideoDoorbell'), value: 'Video Doorbell', icon: 'pi-video' },
      ]
    },
    {
      label: t('sectionSmartHome'),
      code: 'smarthome',
      items: [
        { label: t('equipSmartHome'), value: 'Smart Home Integration', icon: 'pi-mobile' },
        { label: t('equipHighSpeedInternet'), value: 'High-Speed Internet', icon: 'pi-wifi' },
        { label: t('equipSmartLocks'), value: 'Smart Locks', icon: 'pi-lock' },
        { label: t('equipAutomatedBlinds'), value: 'Automated Blinds', icon: 'pi-window-maximize' },
        { label: t('equipVoiceControlled'), value: 'Voice-Controlled', icon: 'pi-microphone' },
        { label: t('equipWholeHomeAudio'), value: 'Whole-Home Audio System', icon: 'pi-volume-up' },
        { label: t('equipHomeTheater'), value: 'Home Theater', icon: 'pi-desktop' },
      ]
    },
    {
      label: t('sectionEnergy'),
      code: 'energy',
      items: [
        { label: t('equipEVCharging'), value: 'EV Charging Station', icon: 'pi-bolt' },
        { label: t('equipSolarPanels'), value: 'Solar Panels', icon: 'pi-sun' },
        { label: t('equipBackupGenerator'), value: 'Backup Generator', icon: 'pi-power-off' },
      ]
    },
    {
      label: t('sectionWellness'),
      code: 'wellness',
      items: [
        { label: t('equipSwimmingPool'), value: 'Swimming Pool', icon: 'pi-circle' },
        { label: t('equipGym'), value: 'Gym/Fitness Center', icon: 'pi-heart' },
        { label: t('equipSpa'), value: 'Spa', icon: 'pi-star' },
        { label: t('equipJacuzzi'), value: 'Jacuzzi', icon: 'pi-circle-fill' },
        { label: t('equipPlayground'), value: 'Playground', icon: 'pi-flag' },
        { label: t('equipWellnessRoom'), value: 'Wellness/Yoga Room', icon: 'pi-users' },
      ]
    },
    {
      label: t('sectionSpecialRooms'),
      code: 'specialrooms',
      items: [
        { label: t('equipHomeOffice'), value: 'Home Office', icon: 'pi-briefcase' },
        { label: t('equipWalkInCloset'), value: 'Walk-in Closet', icon: 'pi-th-large' },
        { label: t('equipWineCellar'), value: 'Wine Cellar', icon: 'pi-bookmark' },
        { label: t('equipOutdoorKitchen'), value: 'Outdoor Kitchen', icon: 'pi-table' },
        { label: t('equipKidsPlayroom'), value: 'Kids\' Playroom', icon: 'pi-users' },
        { label: t('equipGamingRoom'), value: 'Gaming Room', icon: 'pi-android' },
        { label: t('equipPanicRoom'), value: 'Panic Room', icon: 'pi-lock' },
      ]
    },
    {
      label: t('sectionAccessibility'),
      code: 'accessibility',
      items: [
        { label: t('equipWheelchairAccess'), value: 'Wheelchair Accessibility', icon: 'pi-heart' },
        { label: t('equipPetFriendly'), value: 'Pet-Friendly Facilities', icon: 'pi-heart' },
        { label: t('equipOutdoorFireplace'), value: 'Outdoor Fireplace', icon: 'pi-verified' },
        { label: t('equipPrivateDock'), value: 'Private Dock', icon: 'pi-compass' },
      ]
    }
  ];

  // Custom template for equipment items with icons
  const equipmentItemTemplate = (option: any) => {
    return (
      <div className="flex align-items-center gap-2">
        <i className={`pi ${option.icon}`} style={{ fontSize: '14px', color: '#6b7280' }}></i>
        <span>{option.label}</span>
      </div>
    );
  };

  // Template for group headers (section titles)
  const equipmentGroupTemplate = (option: any) => {
    return (
      <div style={{ 
        fontSize: '11px', 
        fontWeight: 'bold',
        color: '#374151',
        padding: '8px 12px 4px 12px',
        borderTop: '1px solid #e5e7eb',
        marginTop: '4px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        background: '#f9fafb'
      }}>
        {option.label}
      </div>
    );
  };

  const handleFilterUpdate = (key: keyof PropertyFilterValues, value: any, isAdvanced = false) => {
    console.log('🔧 Filter updated:', key, '=', value, 'isAdvanced:', isAdvanced);
    
    if (isAdvanced) {
      // Advanced filters - samo ažuriramo lokalno, ne šaljemo odmah
      const updatedLocalFilters = { ...localFilters };
      
      // Ako je vrednost null, undefined ili prazan array, ukloni key iz objekta
      if (value === null || value === undefined || (Array.isArray(value) && value.length === 0)) {
        delete updatedLocalFilters[key];
      } else {
        updatedLocalFilters[key] = value;
      }
      
      setLocalFilters(updatedLocalFilters);
      console.log('📋 Local filters (not applied yet):', updatedLocalFilters);
    } else {
      // Basic filters - odmah apply i sinhronizuj lokalFilters
      const updatedFilters = { ...filters, ...localFilters, [key]: value };
      console.log('📋 All filters (basic + pending advanced):', updatedFilters);
      setFilters(updatedFilters);
      setLocalFilters(updatedFilters);
      onFilterChange(updatedFilters);
    }
  };

  const handleApplyAdvancedFilters = () => {
    console.log('✅ Applying advanced filters:', localFilters);
    console.log('   - priceFrom:', localFilters.priceFrom, 'type:', typeof localFilters.priceFrom);
    console.log('   - priceTo:', localFilters.priceTo, 'type:', typeof localFilters.priceTo);
    console.log('   - areaFrom:', localFilters.areaFrom, 'type:', typeof localFilters.areaFrom);
    console.log('   - areaTo:', localFilters.areaTo, 'type:', typeof localFilters.areaTo);
    setFilters(localFilters);
    onFilterChange(localFilters);
  };

  const handleReset = () => {
    const resetFilters = { city: 'Niš' };
    setFilters(resetFilters);
    setLocalFilters(resetFilters);
    onReset();
    onFilterChange(resetFilters);
  };

  const handleClearAll = () => {
    const emptyFilters = {};
    setFilters(emptyFilters);
    setLocalFilters(emptyFilters);
    onReset();
    onFilterChange(emptyFilters);
  };

  return (
    <Card className="mb-4">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold m-0">{t('filters')}</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* City */}
          <div className="p-field">
            <label className="block mb-2 font-medium">
              <i className="pi pi-map-marker mr-2" style={{ fontSize: '14px' }}></i>
              {t('city')}
            </label>
            <Dropdown
              value={filters.city}
              options={cityOptions}
              onChange={(e) => handleFilterUpdate('city', e.value)}
              placeholder={t('selectCity')}
              className="w-full"
              showClear
            />
          </div>

          {/* Neighborhoods */}
          <div className="p-field">
            <label className="block mb-2 font-medium">
              <i className="pi pi-building mr-2" style={{ fontSize: '14px' }}></i>
              {t('neighborhood')}
            </label>
            <MultiSelect
              value={filters.neighborhoods}
              options={neighborhoodOptions}
              onChange={(e) => handleFilterUpdate('neighborhoods', e.value)}
              placeholder={t('selectNeighborhood')}
              className="w-full"
              display="chip"
              filter
            />
          </div>

          {/* Property Type */}
          <div className="p-field">
            <label className="block mb-2 font-medium">
              <i className="pi pi-home mr-2" style={{ fontSize: '14px' }}></i>
              {t('propertyType')}
            </label>
            <MultiSelect
              value={filters.propertyTypes}
              options={propertyTypeOptions}
              onChange={(e) => handleFilterUpdate('propertyTypes', e.value)}
              placeholder={t('selectPropertyType')}
              className="w-full"
              display="chip"
            />
          </div>

          {/* Room Structure */}
          <div className="p-field">
            <label className="block mb-2 font-medium">
              <i className="pi pi-th-large mr-2" style={{ fontSize: '14px' }}></i>
              {t('roomStructure')}
            </label>
            <MultiSelect
              value={filters.roomStructure}
              options={[
                { label: t('structureGarsonjera'), value: 'garsonjera' },
                { label: t('structureJednosoban'), value: 'jednosoban' },
                { label: t('structureDvosoban'), value: 'dvosoban' },
                { label: t('structureTrosoban'), value: 'trosoban' },
                { label: t('structureCetvorosoban'), value: 'četvorosoban' },
                { label: t('structureCetvoroiposoban'), value: 'četvoroiposoban' },
                { label: t('structurePetosobanIVeci'), value: 'petosoban i veći' },
                { label: t('structureOstalo'), value: 'ostalo' },
              ]}
              onChange={(e) => handleFilterUpdate('roomStructure', e.value)}
              placeholder={t('selectRoomStructure')}
              className="w-full"
              display="chip"
            />
          </div>

          {/* Status */}
          <div className="p-field">
            <label className="block mb-2 font-medium">
              <i className="pi pi-tag mr-2" style={{ fontSize: '14px' }}></i>
              {t('status')}
            </label>
            <MultiSelect
              value={filters.status}
              options={statusOptions}
              onChange={(e) => handleFilterUpdate('status', e.value)}
              placeholder={t('selectStatus')}
              className="w-full"
              display="chip"
            />
          </div>
        </div>

        {/* Accordion for advanced filters */}
        <Accordion className="mt-4">
        <AccordionTab header={
          <div className="flex align-items-center gap-2">
            <i className="pi pi-filter" style={{ fontSize: '14px' }}></i>
            <span>{t('moreFilters')}</span>
          </div>
        }>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>              {/* Price and Area Section */}
              <div className="space-y-4">
                <div className="pb-3" style={{ borderColor: '#e5e7eb' }}>
                  <h4 className="text-sm font-semibold text-gray-600 mb-3" style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <i className="pi pi-money-bill mr-2" style={{ fontSize: '12px' }}></i>
                    Cena i Površina
                  </h4>
                  
                  {/* Price Range */}
                  <div className="p-field mb-4">
                    <label className="block mb-2 font-medium" style={{ fontSize: '13px' }}>
                      <i className="pi pi-euro mr-2" style={{ fontSize: '14px', color: '#6b7280' }}></i>
                      {t('price')}
                    </label>
                    <div className="flex gap-2">
                        <InputNumber
                          value={localFilters.priceFrom ?? null}
                          onValueChange={(e) => {
                            console.log('💶 PriceFrom changed:', e.value);
                            handleFilterUpdate('priceFrom', e.value, true);
                          }}
                          placeholder={t('priceFrom')}
                          mode="currency"
                          currency="EUR"
                          locale="de-DE"
                          className="w-full"
                          minFractionDigits={0}
                          maxFractionDigits={0}
                        />
                        <InputNumber
                          value={localFilters.priceTo ?? null}
                          onValueChange={(e) => {
                            console.log('💶 PriceTo changed:', e.value);
                            handleFilterUpdate('priceTo', e.value, true);
                          }}
                          placeholder={t('priceTo')}
                          mode="currency"
                          currency="EUR"
                          locale="de-DE"
                          className="w-full"
                          minFractionDigits={0}
                          maxFractionDigits={0}
                        />
                    </div>
                  </div>

                  {/* Area Range */}
                  <div className="p-field">
                    <label className="block mb-2 font-medium" style={{ fontSize: '13px' }}>
                      <i className="pi pi-th-large mr-2" style={{ fontSize: '14px', color: '#6b7280' }}></i>
                      {t('area')}
                    </label>
                    <div className="flex gap-2">
                        <InputNumber
                          value={localFilters.areaFrom ?? null}
                          onValueChange={(e) => {
                            console.log('📐 AreaFrom changed:', e.value);
                            handleFilterUpdate('areaFrom', e.value, true);
                          }}
                          placeholder={t('areaFrom')}
                          suffix=" m²"
                          className="w-full"
                        />
                        <InputNumber
                          value={localFilters.areaTo ?? null}
                          onValueChange={(e) => {
                            console.log('📐 AreaTo changed:', e.value);
                            handleFilterUpdate('areaTo', e.value, true);
                          }}
                          placeholder={t('areaTo')}
                          suffix=" m²"
                          className="w-full"
                        />
                    </div>
                  </div>
                </div>
              </div>

              {/* Karakteristike Section */}
              <div className="space-y-4">
                <div className="pb-3" style={{ borderColor: '#e5e7eb' }}>
                  <h4 className="text-sm font-semibold text-gray-600 mb-3" style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <i className="pi pi-list mr-2" style={{ fontSize: '12px' }}></i>
                    Karakteristike
                  </h4>
                  
                  {/* Bathrooms */}
                  <div className="p-field mb-4">
                    <label className="block mb-2 font-medium" style={{ fontSize: '13px' }}>
                      <i className="pi pi-stop-circle mr-2" style={{ fontSize: '14px', color: '#6b7280' }}></i>
                      {t('numberOfBathrooms')}
                    </label>
                    <MultiSelect
                      value={localFilters.bathrooms ?? []}
                      options={bathroomOptions}
                      onChange={(e) => {
                        console.log('🛁 Bathrooms changed:', e.value);
                        handleFilterUpdate('bathrooms', e.value, true);
                      }}
                      placeholder={t('selectBathrooms')}
                      className="w-full"
                      display="chip"
                    />
                  </div>

                  {/* Floors */}
                  <div className="p-field">
                    <label className="block mb-2 font-medium" style={{ fontSize: '13px' }}>
                      <i className="pi pi-sort-amount-up mr-2" style={{ fontSize: '14px', color: '#6b7280' }}></i>
                      {t('floor')}
                    </label>
                    <MultiSelect
                      value={localFilters.floors ?? []}
                      options={floorOptions}
                      onChange={(e) => {
                        console.log('🏢 Floors changed:', e.value);
                        handleFilterUpdate('floors', e.value, true);
                      }}
                      placeholder={t('selectFloors')}
                      className="w-full"
                      display="chip"
                      filter
                    />
                  </div>
                </div>
              </div>

              {/* Dodatno Section */}
              <div className="space-y-4">
                <div className="pb-3" style={{ borderColor: '#e5e7eb' }}>
                  <h4 className="text-sm font-semibold text-gray-600 mb-3" style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <i className="pi pi-cog mr-2" style={{ fontSize: '12px' }}></i>
                    Dodatno
                  </h4>

                  {/* Heating */}
                  <div className="p-field mb-4">
                    <label className="block mb-2 font-medium" style={{ fontSize: '13px' }}>
                      <i className="pi pi-sun mr-2" style={{ fontSize: '14px', color: '#6b7280' }}></i>
                      {t('heating')}
                    </label>
                    <MultiSelect
                      value={localFilters.heating ?? []}
                      options={heatingOptions}
                      onChange={(e) => {
                        console.log('🔥 Heating changed:', e.value);
                        handleFilterUpdate('heating', e.value, true);
                      }}
                      placeholder={t('selectHeating')}
                      className="w-full"
                      display="chip"
                      filter
                    />
                  </div>

                  {/* Additional Equipment */}
                  <div className="p-field">
                    <label className="block mb-2 font-medium" style={{ fontSize: '13px' }}>
                      <i className="pi pi-star mr-2" style={{ fontSize: '14px', color: '#6b7280' }}></i>
                      {t('additionalEquipment')}
                    </label>
                    <MultiSelect
                      value={localFilters.features ?? []}
                      options={equipmentOptions}
                      optionLabel="label"
                      optionGroupLabel="label"
                      optionGroupChildren="items"
                      optionGroupTemplate={equipmentGroupTemplate}
                      onChange={(e) => {
                        console.log('⭐ Equipment changed:', e.value);
                        handleFilterUpdate('features', e.value, true);
                      }}
                      placeholder={t('selectEquipment')}
                      className="w-full equipment-multiselect"
                      display="chip"
                      filter
                      itemTemplate={equipmentItemTemplate}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end gap-2 mt-4">
              <Button 
                label={t('removeAllFilters')} 
                icon="pi pi-times" 
                className="p-button-outlined p-button-danger"
                onClick={handleClearAll}
                size="small"
              />
              <Button 
                label={t('applyFilters')} 
                icon="pi pi-check" 
                className="p-button-primary"
                onClick={handleApplyAdvancedFilters}
              />
            </div>
          </AccordionTab>
        </Accordion>
      </div>
    </Card>
  );
};
