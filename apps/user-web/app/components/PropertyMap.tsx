'use client';

import { GoogleMap, InfoWindow, LoadScript } from '@react-google-maps/api';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { Property } from '@/lib/api';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface PropertyMapProps {
  properties: Property[];
  onPropertyClick?: (property: Property) => void;
  selectedPropertyId?: string; // Add selected property ID prop
  hideInfoWindow?: boolean;
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
  // Light, modern, neutral theme
  {
    elementType: 'geometry',
    stylers: [{ color: '#f5f5f5' }]
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#616161' }]
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#f5f5f5' }]
  },
  {
    featureType: 'administrative.land_parcel',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#bdbdbd' }]
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#eeeeee' }]
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#757575' }]
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#e5e5e5' }]
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9e9e9e' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#ffffff' }]
  },
  {
    featureType: 'road.arterial',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#757575' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#dadada' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#616161' }]
  },
  {
    featureType: 'road.local',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9e9e9e' }]
  },
  {
    featureType: 'transit.line',
    elementType: 'geometry',
    stylers: [{ color: '#e5e5e5' }]
  },
  {
    featureType: 'transit.station',
    elementType: 'geometry',
    stylers: [{ color: '#eeeeee' }]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#c9c9c9' }]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9e9e9e' }]
  }
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

// Custom marker icons by property type with specific icons
function getMarkerIcon(propertyType: string): string {
  const iconBase = 'data:image/svg+xml;base64,';
  
  const icons: { [key: string]: { color: string, icon: string } } = {
    'Apartment': {
      color: '#EA580C',
      icon: '<path d="M10 11h2v2h-2zm0 4h2v2h-2zm0 4h2v2h-2zm4-8h2v2h-2zm0 4h2v2h-2zm0 4h2v2h-2zm4-8h2v2h-2zm0 4h2v2h-2zm0 4h2v2h-2z" fill="white"/>'
    },
    'House': {
      color: '#16A34A',
      icon: '<path d="M10 16v6h4v-4h4v4h4v-6l-6-4.5z" fill="white"/><path d="M16 8l-8 6h2v8h5v-5h2v5h5v-8h2z" fill="white" opacity="0.5"/>'
    },
    'Office': {
      color: '#2563EB',
      icon: '<rect x="10" y="10" width="12" height="12" fill="white"/><path d="M11 12h2v2h-2zm3 0h2v2h-2zm3 0h2v2h-2zm-6 3h2v2h-2zm3 0h2v2h-2zm3 0h2v2h-2zm-6 3h2v2h-2zm3 0h2v2h-2zm3 0h2v2h-2z" fill="currentColor"/>'
    },
    'Land': {
      color: '#A855F7',
      icon: '<path d="M10 18h12v2H10zm1-2l2-3 3 2 2-3 2 3z" fill="white"/><circle cx="13" cy="14" r="1" fill="white"/><circle cx="19" cy="14" r="1" fill="white"/>'
    },
    'CommercialSpace': {
      color: '#DC2626',
      icon: '<rect x="11" y="11" width="10" height="10" rx="1" fill="white"/><path d="M13 13h2v2h-2zm0 3h2v2h-2zm3-3h2v2h-2zm0 3h2v2h-2z" fill="currentColor"/>'
    },
    'VacationHome': {
      color: '#0891B2',
      icon: '<path d="M16 9l-7 5v7h4v-4h6v4h4v-7z" fill="white"/><circle cx="19" cy="13" r="1.5" fill="yellow"/>'
    },
    'ApartmentInHouse': {
      color: '#F59E0B',
      icon: '<path d="M10 16v6h3v-4h6v4h3v-6l-6-4.5z" fill="white"/><rect x="14" y="13" width="4" height="5" fill="white" opacity="0.7"/>'
    },
    'Duplex': {
      color: '#EC4899',
      icon: '<path d="M10 15v7h4v-5h4v5h4v-7l-6-4z" fill="white"/><line x1="16" y1="11" x2="16" y2="22" stroke="white" stroke-width="1"/>'
    },
  };
  
  const config = icons[propertyType] || icons['Apartment'];
  const svg = `<svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 26 16 26s16-14 16-26c0-8.837-7.163-16-16-16z" fill="${config.color}"/>
    <circle cx="16" cy="16" r="9" fill="${config.color}" opacity="0.9"/>
    ${config.icon}
  </svg>`;
  return iconBase + btoa(svg);
}

export function PropertyMap({ properties, onPropertyClick, selectedPropertyId, hideInfoWindow = false }: PropertyMapProps) {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());

  const handleMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
    setMapReady(true);
  };

  const [isAnimating, setIsAnimating] = useState(false);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Pan to selected property when selectedPropertyId changes
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;

    // If no property is selected, zoom out to show all markers
    if (!selectedPropertyId) {
      const markers = Array.from(markersRef.current.values());
      if (markers.length > 0 && mapRef.current) {
        if (markers.length === 1) {
          // For single property, center on it
          const marker = markers[0];
          const position = marker.getPosition();
          if (position) {
            mapRef.current.panTo(position);
            mapRef.current.setZoom(15);
          }
        } else {
          // For multiple properties, fit bounds to show all
          const bounds = new google.maps.LatLngBounds();
          markers.forEach(marker => {
            const position = marker.getPosition();
            if (position) bounds.extend(position);
          });
          mapRef.current.fitBounds(bounds);

          // Add padding for better visibility
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
      }
      return;
    }

    // Prevent multiple animations from running simultaneously
    if (isAnimating) {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      setIsAnimating(false);
    }

    const selectedMarker = markersRef.current.get(selectedPropertyId);
    if (selectedMarker) {
      const position = selectedMarker.getPosition();
      if (position) {
        const map = mapRef.current;
        setIsAnimating(true);

        // Force smooth animation with guaranteed completion
        const performAnimation = () => {
          // Use animateCamera for smooth transition (Google Maps v3.50+)
          if (typeof map.animateCamera === 'function') {
            map.animateCamera({
              center: position,
              zoom: 16,
              duration: 1200, // Increased duration for guaranteed smoothness
              easing: 'easeInOut'
            });

            // Set timeout to mark animation as complete
            animationTimeoutRef.current = setTimeout(() => {
              setIsAnimating(false);
            }, 1250); // Slightly longer than animation duration

          } else {
            // Fallback for older versions with guaranteed timing
            map.panTo(position);
            animationTimeoutRef.current = setTimeout(() => {
              if (map) {
                map.setZoom(16);
              }
              setIsAnimating(false);
            }, 800);
          }
        };

        // Small delay to ensure any previous animation is cancelled
        setTimeout(performAnimation, 50);
      }
    }
  }, [selectedPropertyId, mapReady, isAnimating]);

  useEffect(() => {
    if (!mapReady || !mapRef.current || properties.length === 0) return;

    // Clear existing markers and any previous clusterer
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
          // Always notify parent that a property was clicked (for navigation)
          if (onPropertyClick) {
            onPropertyClick(property);
          }

          // Only open the InfoWindow when not explicitly hidden
          if (!hideInfoWindow) {
            setSelectedProperty(property);
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
      if (markers.length === 1) {
        // For single property, center on it with fixed zoom
        const marker = markers[0];
        const position = marker.getPosition();
        if (position) {
          mapRef.current.panTo(position);
          mapRef.current.setZoom(15);
        }
      } else {
        // For multiple properties, use fitBounds
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
    }

    // Cleanup function
    return () => {
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current.clear();
      if (clustererRef.current) {
        clustererRef.current.clearMarkers();
        clustererRef.current = null;
      }
    };
  }, [properties, onPropertyClick, mapReady]);

  const favoriteImage = selectedProperty?.images.find(img => img.isFavorite) || selectedProperty?.images[0];

  return (
    <LoadScript
      googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}
      libraries={['places']}
      loadingElement={<div className="h-full flex items-center justify-center">Loading maps...</div>}
    >
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={defaultCenter}
        zoom={15}
        options={mapOptions}
        onLoad={handleMapLoad}
      >
      {selectedProperty && !hideInfoWindow && (
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
    </LoadScript>
  );
}
