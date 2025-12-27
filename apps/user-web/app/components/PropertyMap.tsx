'use client';

import { GoogleMap, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { Property } from '@/lib/api';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface PropertyMapProps {
  properties: Property[];
  onPropertyClick?: (property: Property) => void;
  selectedPropertyId?: string; // Add selected property ID prop
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: 43.3209, // Niš coordinates
  lng: 21.8958,
};

const customMapStyles = [
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'transit',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
];

const mapOptions: google.maps.MapOptions = {
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
  gestureHandling: 'greedy',
  styles: customMapStyles,
  mapTypeId: 'roadmap', // Standard roadmap view
  tilt: 45, // 45 degree tilt for 3D buildings
  heading: 0, // Rotation angle
};

// Custom marker icons by property type
function getMarkerIcon(propertyType: string): string {
  const iconBase = 'data:image/svg+xml;base64,';
  const colors: { [key: string]: string } = {
    'Apartment': '#EA580C', // Orange
    'House': '#16A34A', // Green
    'Office': '#2563EB', // Blue
    'Land': '#A855F7', // Purple
    'CommercialSpace': '#DC2626', // Red
    'VacationHome': '#0891B2', // Cyan
    'ApartmentInHouse': '#F59E0B', // Amber
    'Duplex': '#EC4899', // Pink
  };
  
  const color = colors[propertyType] || '#EA580C';
  const svg = `<svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg"><path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 26 16 26s16-14 16-26c0-8.837-7.163-16-16-16z" fill="${color}"/><circle cx="16" cy="16" r="8" fill="white"/><path d="M16 10v6m0 2v2" stroke="${color}" stroke-width="2" stroke-linecap="round"/></svg>`;
  return iconBase + btoa(svg);
}

export function PropertyMap({ properties, onPropertyClick, selectedPropertyId }: PropertyMapProps) {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places'],
  });

  const handleMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
  };

  // Pan to selected property when selectedPropertyId changes
  useEffect(() => {
    if (!selectedPropertyId || !mapRef.current) return;

    const property = properties.find(p => p.id === selectedPropertyId);
    if (property && property.lat && property.lon) {
      mapRef.current.panTo({ lat: property.lat, lng: property.lon });
      mapRef.current.setZoom(17); // Zoom in closer to the selected property
      setSelectedProperty(property);
    }
  }, [selectedPropertyId, properties]);

  useEffect(() => {
    if (!isLoaded || !mapRef.current || properties.length === 0) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current.clear();

    if (clustererRef.current) {
      clustererRef.current.clearMarkers();
      clustererRef.current = null;
    }

    // Create new markers - ensure map is set directly on marker
    const markers = properties
      .filter(property => property.lat && property.lon)
      .map(property => {
        const marker = new google.maps.Marker({
          position: { lat: property.lat, lng: property.lon },
          map: mapRef.current!, // Directly set map on marker
          title: property.code,
          icon: {
            url: getMarkerIcon(property.propertyType),
            scaledSize: new google.maps.Size(32, 42),
            anchor: new google.maps.Point(16, 42),
          },
          optimized: false,
          zIndex: 100, // Ensure markers are on top
        });

        marker.addListener('click', () => {
          setSelectedProperty(property);
          if (onPropertyClick) {
            onPropertyClick(property);
          }
        });

        markersRef.current.set(property.id, marker);
        return marker;
      });

    // Use clusterer only if there are many markers
    if (markers.length > 10 && mapRef.current) {
      clustererRef.current = new MarkerClusterer({
        map: mapRef.current,
        markers,
        algorithmOptions: {
          maxZoom: 16,
        },
      });
    }

    // Fit bounds to show all markers
    if (markers.length > 0 && mapRef.current) {
      const bounds = new google.maps.LatLngBounds();
      markers.forEach(marker => {
        const position = marker.getPosition();
        if (position) bounds.extend(position);
      });
      mapRef.current.fitBounds(bounds);
      
      // Add padding to the bounds for better visibility
      setTimeout(() => {
        if (mapRef.current && markers.length > 1) {
          mapRef.current.fitBounds(bounds, {
            top: 50,
            right: 50,
            bottom: 50,
            left: 50
          });
        }
      }, 100);
    }
  }, [isLoaded, properties, onPropertyClick]);

  if (loadError) {
    return <div className="h-full flex items-center justify-center text-red-600">Error loading maps</div>;
  }

  if (!isLoaded) {
    return <div className="h-full flex items-center justify-center">Loading maps...</div>;
  }

  const favoriteImage = selectedProperty?.images.find(img => img.isFavorite) || selectedProperty?.images[0];

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={defaultCenter}
      zoom={15}
      options={mapOptions}
      onLoad={handleMapLoad}
    >
      {selectedProperty && (
        <InfoWindow
          position={{ lat: selectedProperty.lat, lng: selectedProperty.lon }}
          onCloseClick={() => setSelectedProperty(null)}
          options={{
            pixelOffset: new google.maps.Size(0, -40),
          }}
        >
          <div style={{ width: '240px' }}>
            {favoriteImage && (
              <div style={{ marginBottom: '12px', position: 'relative', height: '160px', borderRadius: '4px', overflow: 'hidden' }}>
                <Image
                  src={`http://localhost:3000${favoriteImage.url}`}
                  alt={selectedProperty.code}
                  fill
                  className="object-cover"
                  sizes="240px"
                />
              </div>
            )}
            <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '8px' }}>
              {new Intl.NumberFormat('sr-RS', { 
                style: 'currency', 
                currency: 'EUR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(selectedProperty.price)}
            </div>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
              {selectedProperty.propertyType} • {selectedProperty.area} m²
            </div>
            <div style={{ fontSize: '13px', color: '#888' }}>
              {selectedProperty.neighborhood || 'Niš'}
            </div>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}
