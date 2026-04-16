'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { Property } from '@/services/property.service';
import { formatCurrency } from '../utils/currency';
import { Card } from 'primereact/card';
import { googleMapsLoaderOptions } from '../utils/googleMapsLoader';
import { customMapStyles } from '../utils/mapStyles';
import { getImageSrc } from '../utils/image';
import { useTranslations, useLocale } from 'next-intl';

interface PropertyMapViewProps {
  properties: Property[];
  onPropertyClick?: (property: Property) => void;
  height?: string;
  hoveredPropertyId?: string | null;
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: 43.3209, // Niš coordinates
  lng: 21.8958,
};

const mapOptions = {
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
  gestureHandling: 'greedy', // Enable scroll zoom without Shift key
  styles: customMapStyles,
};

export const PropertyMapView: React.FC<PropertyMapViewProps> = ({
  properties,
  onPropertyClick,
  height = '600px',
  hoveredPropertyId = null,
}) => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null,
  );
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [zoom, setZoom] = useState(13);
  const mapRef = useRef<google.maps.Map | null>(null);
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());

  const { isLoaded, loadError } = useJsApiLoader(googleMapsLoaderOptions);
  const t = useTranslations('properties');
  const locale = useLocale();

  // Helper function to translate heating types based on locale
  const translateHeating = (heating: string): string => {
    if (locale === 'en') {
      return heating; // Keep English as is
    }
    // Serbian translations
    const heatingMap: { [key: string]: string } = {
      central: 'Centralno',
      'gas-central': 'Centralno na gas',
      'solid-fuel-central': 'Centralno na čvrsto gorivo',
      'electric-central': 'Centralno električno',
      floor: 'Podno',
      'independent-on-gas': 'Nezavisno na gas',
      'independent-on-solid-fuel': 'Nezavisno na čvrsto gorivo',
      'independent-on-electricity': 'Nezavisno na struju',
      fireplace: 'Kamin',
      'air-conditioner': 'Klima',
      other: 'Ostali tipovi',
    };
    return heatingMap[heating] || heating;
  };

  // Helper to translate property type
  const translatePropertyType = (type: string): string => {
    if (locale === 'en') {
      const typeMapEn: { [key: string]: string } = {
        apartment: 'Apartment',
        house: 'House',
        'apartment-in-house': 'Apartment in House',
        'commercial-space': 'Commercial Space',
        office: 'Office',
        land: 'Land',
        'vacation-home': 'Vacation Home',
        duplex: 'Duplex',
      };
      return typeMapEn[type] || type;
    }
    const typeMap: { [key: string]: string } = {
      apartment: 'Stan',
      house: 'Kuća',
      'apartment-in-house': 'Stan u kući',
      'commercial-space': 'Lokal',
      office: 'Poslovni prostor',
      land: 'Plac',
      'vacation-home': 'Vikendica',
      duplex: 'Dupleks',
    };
    return typeMap[type] || type;
  };

  // Helper to translate status
  const translateStatus = (status: string): string => {
    if (locale === 'en') {
      return status === 'active' ? 'Active' : 'Reserved';
    }
    return status === 'active' ? 'Aktivno' : 'Rezervisano';
  };

  // Update map bounds when properties change
  useEffect(() => {
    console.log('🗺️ PropertyMapView received properties:', properties.length);

    if (!isLoaded || !mapRef.current) return;

    const validProperties = properties.filter((p) => p.lat && p.lon);
    console.log(
      '🗺️ Valid properties with coordinates:',
      validProperties.length,
    );

    if (validProperties.length === 0) {
      // No properties, reset to default center
      mapRef.current.setCenter(defaultCenter);
      mapRef.current.setZoom(13);
      return;
    }

    const bounds = new google.maps.LatLngBounds();

    validProperties.forEach((property) => {
      bounds.extend({ lat: property.lat!, lng: property.lon! });
    });

    // Fit bounds with padding for better visibility
    if (!bounds.isEmpty()) {
      const padding = { top: 50, right: 50, bottom: 50, left: 50 };
      mapRef.current.fitBounds(bounds, padding);

      // If only one property, set a reasonable zoom level
      if (validProperties.length === 1) {
        setTimeout(() => {
          if (mapRef.current) {
            mapRef.current.setZoom(16);
          }
        }, 100);
      } else if (validProperties.length > 1 && validProperties.length <= 5) {
        // For small number of properties, adjust zoom after fit
        setTimeout(() => {
          if (mapRef.current) {
            const currentZoom = mapRef.current.getZoom() || 13;
            mapRef.current.setZoom(Math.min(currentZoom + 1, 16));
          }
        }, 100);
      }
    }
  }, [properties, isLoaded]);

  // Create markers and clusterer when map loads or properties change
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    // Clear existing markers and clusterer
    if (clustererRef.current) {
      clustererRef.current.clearMarkers();
    }
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current.clear();

    // Create new markers
    const validProperties = properties.filter((p) => p.lat && p.lon);
    const markers: google.maps.Marker[] = [];

    validProperties.forEach((property) => {
      const marker = new google.maps.Marker({
        position: { lat: property.lat!, lng: property.lon! },
        map: mapRef.current,
        icon: {
          url: getMarkerIcon(property.propertyType),
          scaledSize: new google.maps.Size(40, 48),
          anchor: new google.maps.Point(20, 48),
        },
      });

      marker.addListener('click', () => {
        setSelectedProperty(property);
      });

      markers.push(marker);
      markersRef.current.set(property.id, marker);
    });

    // Create clusterer
    if (markers.length > 0) {
      clustererRef.current = new MarkerClusterer({
        map: mapRef.current,
        markers,
      });
    }

    return () => {
      if (clustererRef.current) {
        clustererRef.current.clearMarkers();
      }
      markersRef.current.forEach((marker) => marker.setMap(null));
    };
  }, [properties, isLoaded]);

  // Handle hover effect
  useEffect(() => {
    if (!hoveredPropertyId) {
      // Reset all markers to normal size
      markersRef.current.forEach((marker, id) => {
        const property = properties.find((p) => p.id === id);
        if (property) {
          marker.setIcon({
            url: getMarkerIcon(property.propertyType),
            scaledSize: new google.maps.Size(40, 48),
            anchor: new google.maps.Point(20, 48),
          });
          marker.setZIndex(1);
        }
      });
      return;
    }

    // Highlight the hovered marker
    const hoveredMarker = markersRef.current.get(hoveredPropertyId);
    const hoveredProperty = properties.find((p) => p.id === hoveredPropertyId);

    if (hoveredMarker && hoveredProperty) {
      // Reset all other markers
      markersRef.current.forEach((marker, id) => {
        if (id !== hoveredPropertyId) {
          const property = properties.find((p) => p.id === id);
          if (property) {
            marker.setIcon({
              url: getMarkerIcon(property.propertyType),
              scaledSize: new google.maps.Size(40, 48),
              anchor: new google.maps.Point(20, 48),
            });
            marker.setZIndex(1);
          }
        }
      });

      // Highlight hovered marker with larger size and bring to front
      hoveredMarker.setIcon({
        url: getMarkerIcon(hoveredProperty.propertyType, true), // Pass highlight flag
        scaledSize: new google.maps.Size(56, 67), // 40% larger
        anchor: new google.maps.Point(28, 67),
      });
      hoveredMarker.setZIndex(1000);

      // Optional: pan to marker if it's not visible
      if (mapRef.current) {
        const markerPosition = hoveredMarker.getPosition();
        if (markerPosition) {
          const bounds = mapRef.current.getBounds();
          if (bounds && !bounds.contains(markerPosition)) {
            mapRef.current.panTo(markerPosition);
          }
        }
      }
    }
  }, [hoveredPropertyId, properties]);

  const onMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
  };

  const handleMarkerClick = (property: Property) => {
    setSelectedProperty(property);
  };

  const handleInfoWindowClose = () => {
    setSelectedProperty(null);
  };

  const handlePropertyDetailsClick = () => {
    if (selectedProperty && onPropertyClick) {
      onPropertyClick(selectedProperty);
      setSelectedProperty(null);
    }
  };

  // Get marker icon based on property type - custom SVG icons
  const getMarkerIcon = (
    propertyType: string,
    isHighlighted: boolean = false,
  ) => {
    // Create custom SVG marker with building icon
    const createSVGMarker = (color: string, icon: string) => {
      // Add pulse animation and glow effect for highlighted markers
      const glowFilter = isHighlighted
        ? `
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      `
        : '';

      const svg = `
        <svg width="40" height="48" viewBox="0 0 40 48" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
            </filter>
            ${glowFilter}
          </defs>
          <!-- Pin shape -->
          <path d="M20 0C11.716 0 5 6.716 5 15c0 8.284 15 33 15 33s15-24.716 15-33C35 6.716 28.284 0 20 0z" 
                fill="${color}" filter="url(#shadow) ${isHighlighted ? 'url(#glow)' : ''}" 
                opacity="${isHighlighted ? '1' : '0.95'}"/>
          <!-- White circle background for icon -->
          <circle cx="20" cy="15" r="10" fill="white"/>
          <!-- Icon -->
          ${icon}
        </svg>
      `;
      return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
    };

    const apartmentIcon = `
      <g transform="translate(14, 9)">
        <rect x="1" y="1" width="10" height="11" fill="none" stroke="#e91e63" stroke-width="1.2"/>
        <line x1="1" y1="4" x2="11" y2="4" stroke="#e91e63" stroke-width="1"/>
        <line x1="1" y1="7" x2="11" y2="7" stroke="#e91e63" stroke-width="1"/>
        <line x1="1" y1="10" x2="11" y2="10" stroke="#e91e63" stroke-width="1"/>
        <line x1="6" y1="1" x2="6" y2="12" stroke="#e91e63" stroke-width="1"/>
        <rect x="4" y="9" width="1.5" height="3" fill="#e91e63"/>
      </g>
    `;

    const houseIcon = `
      <g transform="translate(13, 9)">
        <path d="M7 2L1 7v6h12V7z" fill="none" stroke="#2196f3" stroke-width="1.2"/>
        <rect x="5.5" y="9" width="3" height="4" fill="#2196f3"/>
        <rect x="3" y="8" width="2" height="2" fill="#2196f3"/>
        <rect x="9" y="8" width="2" height="2" fill="#2196f3"/>
      </g>
    `;

    const officeIcon = `
      <g transform="translate(14, 9)">
        <rect x="1" y="1" width="10" height="11" fill="none" stroke="#4caf50" stroke-width="1.2"/>
        <rect x="3" y="3" width="2" height="2" fill="#4caf50"/>
        <rect x="7" y="3" width="2" height="2" fill="#4caf50"/>
        <rect x="3" y="6" width="2" height="2" fill="#4caf50"/>
        <rect x="7" y="6" width="2" height="2" fill="#4caf50"/>
        <rect x="5" y="9" width="2" height="3" fill="#4caf50"/>
      </g>
    `;

    const landIcon = `
      <g transform="translate(13, 9)">
        <rect x="1" y="1" width="12" height="11" fill="none" stroke="#795548" stroke-width="1.2"/>
        <line x1="1" y1="6" x2="13" y2="6" stroke="#795548" stroke-width="1"/>
        <circle cx="4" cy="3.5" r="1" fill="#795548"/>
        <circle cx="7" cy="9.5" r="1" fill="#795548"/>
        <circle cx="10" cy="3.5" r="1" fill="#795548"/>
      </g>
    `;

    const vacationHomeIcon = `
      <g transform="translate(13, 9)">
        <path d="M7 2L1 7v6h12V7z" fill="none" stroke="#ff9800" stroke-width="1.2"/>
        <rect x="5.5" y="9" width="3" height="4" fill="#ff9800"/>
        <circle cx="7" cy="4.5" r="1.5" fill="#ff9800"/>
      </g>
    `;

    const duplexIcon = `
      <g transform="translate(14, 9)">
        <rect x="1" y="1" width="10" height="11" fill="none" stroke="#9c27b0" stroke-width="1.2"/>
        <line x1="1" y1="6" x2="11" y2="6" stroke="#9c27b0" stroke-width="1.2"/>
        <rect x="3" y="2.5" width="2" height="2" fill="#9c27b0"/>
        <rect x="7" y="2.5" width="2" height="2" fill="#9c27b0"/>
        <rect x="3" y="7.5" width="2" height="2" fill="#9c27b0"/>
        <rect x="7" y="7.5" width="2" height="2" fill="#9c27b0"/>
        <rect x="5" y="9" width="2" height="3" fill="#9c27b0"/>
      </g>
    `;

    switch (propertyType) {
      case 'house':
        return createSVGMarker('#2196f3', houseIcon);
      case 'apartment':
        return createSVGMarker('#e91e63', apartmentIcon);
      case 'apartment-in-house':
        return createSVGMarker('#2196f3', houseIcon); // House color with house icon
      case 'office':
      case 'commercial-space':
        return createSVGMarker('#4caf50', officeIcon);
      case 'land':
        return createSVGMarker('#795548', landIcon);
      case 'vacation-home':
        return createSVGMarker('#ff9800', vacationHomeIcon);
      case 'duplex':
        return createSVGMarker('#9c27b0', duplexIcon);
      default:
        return createSVGMarker('#e91e63', apartmentIcon);
    }
  };

  if (loadError) {
    return (
      <div
        style={{
          padding: '20px',
          textAlign: 'center',
          backgroundColor: '#fee',
          border: '1px solid #fcc',
          borderRadius: '8px',
          margin: '20px',
        }}
      >
        <h3 style={{ color: '#c33' }}>Error loading Google Maps</h3>
        <p>Please check your Google Maps API key configuration in .env.local</p>
        <p style={{ fontSize: '12px', color: '#666' }}>
          Make sure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is set and the API key is
          valid.
        </p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div
        style={{
          padding: '20px',
          textAlign: 'center',
          backgroundColor: '#f0f9ff',
          border: '1px solid #bae6fd',
          borderRadius: '8px',
        }}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
        <p>Loading maps...</p>
      </div>
    );
  }

  return (
    <div style={{ height, width: '100%', position: 'relative' }}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={mapCenter}
        zoom={zoom}
        options={mapOptions}
        onLoad={onMapLoad}
      >
        {selectedProperty && selectedProperty.lat && selectedProperty.lon && (
          <InfoWindow
            position={{ lat: selectedProperty.lat, lng: selectedProperty.lon }}
            onCloseClick={handleInfoWindowClose}
            options={{
              pixelOffset: new google.maps.Size(0, -40),
            }}
          >
            <div
              style={{
                width: '240px',
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            >
              {/* Image */}
              {selectedProperty.images &&
                selectedProperty.images.length > 0 &&
                (() => {
                  // Find favorite image or use first one
                  console.log(
                    '🖼️ Property images:',
                    selectedProperty.images.map((img) => ({
                      url: img.url,
                      isFavorite: img.isFavorite,
                    })),
                  );
                  const favoriteImage =
                    selectedProperty.images.find((img) => img.isFavorite) ||
                    selectedProperty.images[0];
                  console.log('⭐ Selected favorite image:', favoriteImage);
                  return (
                    <div
                      style={{
                        marginBottom: '12px',
                        position: 'relative',
                        overflow: 'hidden',
                        borderRadius: '4px',
                      }}
                    >
                      <img
                        src={getImageSrc(favoriteImage.url)}
                        alt={selectedProperty.code}
                        style={{
                          width: '100%',
                          height: '140px',
                          objectFit: 'cover',
                          cursor: 'pointer',
                          display: 'block',
                        }}
                        onClick={handlePropertyDetailsClick}
                      />
                      {/* Status Badge - minimal */}
                      <div
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          backgroundColor:
                            selectedProperty.status === 'active'
                              ? '#10b981'
                              : '#f59e0b',
                          padding: '5px 10px',
                          borderRadius: '2px',
                          fontSize: '10px',
                          fontWeight: '500',
                          color: 'white',
                          letterSpacing: '0.5px',
                          textTransform: 'uppercase',
                        }}
                      >
                        {translateStatus(selectedProperty.status)}
                      </div>
                    </div>
                  );
                })()}

              {/* Content */}
              <div
                style={{ cursor: 'pointer' }}
                onClick={handlePropertyDetailsClick}
              >
                {/* Code & Type */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '10px',
                  }}
                >
                  <div
                    style={{
                      fontWeight: '600',
                      fontSize: '16px',
                      color: '#111827',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {selectedProperty.code}
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#6b7280',
                      fontWeight: '500',
                    }}
                  >
                    {translatePropertyType(selectedProperty.propertyType)}
                  </div>
                </div>

                {/* Address - with Material icon */}
                <div
                  style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    marginBottom: '3px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '6px',
                  }}
                >
                  <i
                    className="pi pi-map-marker"
                    style={{
                      fontSize: '12px',
                      marginTop: '2px',
                      color: '#9ca3af',
                    }}
                  ></i>
                  <span style={{ flex: 1, lineHeight: '1.5' }}>
                    {selectedProperty.address}
                  </span>
                </div>

                {/* Neighborhood */}
                {selectedProperty.neighborhood && (
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#9ca3af',
                      marginBottom: '12px',
                      paddingLeft: '18px',
                    }}
                  >
                    {selectedProperty.neighborhood}
                  </div>
                )}

                {/* Divider */}
                <div
                  style={{
                    height: '1px',
                    backgroundColor: '#e5e7eb',
                    margin: '12px 0',
                  }}
                ></div>

                {/* Price - prominent */}
                <div
                  style={{
                    marginBottom: '12px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '10px',
                      color: '#6b7280',
                      marginBottom: '3px',
                      fontWeight: '500',
                    }}
                  >
                    {locale === 'en' ? 'Price' : 'Cena'}
                  </div>
                  <div
                    style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: '#059669',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {formatCurrency(selectedProperty.price)}
                  </div>
                </div>

                {/* Details Grid - clean and minimal */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '12px',
                    marginBottom: '12px',
                    paddingBottom: '12px',
                    borderBottom: '1px solid #f3f4f6',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: '10px',
                        color: '#9ca3af',
                        marginBottom: '3px',
                        fontWeight: '500',
                      }}
                    >
                      {locale === 'en' ? 'Area' : 'Površina'}
                    </div>
                    <div
                      style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#111827',
                      }}
                    >
                      {selectedProperty.area} m²
                    </div>
                  </div>
                  {selectedProperty.floor && (
                    <div>
                      <div
                        style={{
                          fontSize: '10px',
                          color: '#9ca3af',
                          marginBottom: '3px',
                          fontWeight: '500',
                        }}
                      >
                        {locale === 'en' ? 'Floor' : 'Sprat'}
                      </div>
                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: '600',
                          color: '#111827',
                        }}
                      >
                        {selectedProperty.floor}
                      </div>
                    </div>
                  )}
                  {selectedProperty.bathrooms && (
                    <div>
                      <div
                        style={{
                          fontSize: '10px',
                          color: '#9ca3af',
                          marginBottom: '3px',
                          fontWeight: '500',
                        }}
                      >
                        {locale === 'en' ? 'Bathrooms' : 'Kupatila'}
                      </div>
                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: '600',
                          color: '#111827',
                        }}
                      >
                        {selectedProperty.bathrooms}
                      </div>
                    </div>
                  )}
                </div>

                {/* Heating info - minimal badge */}
                {selectedProperty.heating && (
                  <div
                    style={{
                      marginBottom: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <i
                      className="pi pi-sun"
                      style={{ fontSize: '11px', color: '#9ca3af' }}
                    ></i>
                    <span style={{ fontSize: '11px', color: '#6b7280' }}>
                      {translateHeating(selectedProperty.heating)}
                    </span>
                  </div>
                )}

                {/* CTA Button - Material Design */}
                <button
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    backgroundColor: '#3b82f6',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: 'white',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
                    letterSpacing: '0.3px',
                    textTransform: 'uppercase',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#2563eb';
                    e.currentTarget.style.boxShadow =
                      '0 2px 6px rgba(0, 0, 0, 0.16)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#3b82f6';
                    e.currentTarget.style.boxShadow =
                      '0 1px 3px rgba(0, 0, 0, 0.12)';
                  }}
                >
                  {locale === 'en' ? 'View Details' : 'Prikaži detalje'}
                </button>
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Property count indicator - minimal */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          backgroundColor: 'white',
          padding: '10px 16px',
          borderRadius: '4px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)',
          fontSize: '13px',
          fontWeight: '500',
          zIndex: 1,
          color: '#374151',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <i
          className="pi pi-home"
          style={{ fontSize: '14px', color: '#6b7280' }}
        ></i>
        <span style={{ fontWeight: '600', color: '#059669' }}>
          {properties.filter((p) => p.lat && p.lon).length}
        </span>
        <span style={{ color: '#9ca3af' }}>
          {locale === 'en' ? 'results' : 'rezultata'}
        </span>
      </div>
    </div>
  );
};
