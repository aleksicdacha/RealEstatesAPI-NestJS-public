'use client';

import { GoogleMap, MarkerF } from '@react-google-maps/api';
import { useState } from 'react';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const center = {
  lat: 43.3226322064035, // Vizantijski bulevar 86, Niš - tačne koordinate
  lng: 21.932040566579317,
};

const customMapStyles = [
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

export function ContactMap() {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markerIcon, setMarkerIcon] = useState<any>(null);

  const onLoad = (map: google.maps.Map) => {
    setMap(map);
    // Set marker icon after Google Maps API is loaded - consistent with property markers
    setMarkerIcon({
      url: 'data:image/svg+xml;base64,' + btoa(`<svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 26 16 26s16-14 16-26c0-8.837-7.163-16-16-16z" fill="#EA580C"/>
        <circle cx="16" cy="16" r="9" fill="#EA580C" opacity="0.9"/>
        <rect x="11" y="11" width="10" height="10" rx="1" fill="white"/>
        <path d="M13 13h2v2h-2zm0 3h2v2h-2zm3-3h2v2h-2zm0 3h2v2h-2z" fill="currentColor"/>
      </svg>`),
      scaledSize: new google.maps.Size(32, 42),
      anchor: new google.maps.Point(16, 42),
    });
  };

  const onUnmount = () => {
    setMap(null);
    setMarkerIcon(null);
  };

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={16}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        styles: customMapStyles,
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: true,
        gestureHandling: 'cooperative',
      }}
    >
      <MarkerF
        position={center}
        title="Olymp Nekretnine - Vizantijski bulevar 86 - Niš"
        icon={markerIcon}
      />
    </GoogleMap>
  );
}