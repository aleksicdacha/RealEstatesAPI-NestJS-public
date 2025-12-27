import React, { useState, useRef, useEffect } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Autocomplete, Marker,
} from '@react-google-maps/api';
import { useTranslations } from 'next-intl';
import { googleMapsLoaderOptions } from "../../utils/googleMapsLoader";
import { customMapStyles } from "../../utils/mapStyles";
import { getNeighborhoodFromCoordinates } from '@/services/geocoding.service';

const containerStyle = {
  width: "100%",
  height: "500px",
};

const initialCenter = {
  lat: 43.32252004643561,
  lng: 21.895601749420166,
};

const inputStyle: React.CSSProperties = {
  boxSizing: "border-box",
  border: "1px solid transparent",
  width: "100%",
  height: "40px",
  padding: "8px 12px",
  borderRadius: "4px",
  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.3)",
  fontSize: "14px",
  outline: "none",
  textOverflow: "ellipsis",
};

const MAP_ID = "5d80c86bf779e713"; // 🔥 Replace with your actual Map ID

interface MapSelectorProps {
  onLocationChange: (lat: number, lng: number, address: string, neighborhood?: string) => void;
  onLoadingChange?: (loading: boolean) => void;
  uuid?: string;
  lat?: number;
  lng?: number;
}

const MapSelector: React.FC<MapSelectorProps> = ({ onLocationChange, onLoadingChange, uuid, lat, lng }) => {
  const t = useTranslations('properties');
  const position = lat && lng ? {lat: lat, lng: lng} : initialCenter;

  const { isLoaded, loadError } = useJsApiLoader(googleMapsLoaderOptions);

  const [center, setCenter] = useState(position);
  const [address, setAddress] = useState("");
  const [isLoadingNeighborhood, setIsLoadingNeighborhood] = useState(false);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (isLoaded && !geocoderRef.current) {
      geocoderRef.current = new window.google.maps.Geocoder();
    }
  }, [isLoaded]);

  // Reverse geocode function (lat, lng -> address)
  const geocodeLatLng = (lat: number, lng: number, callback?: (address: string) => void) => {
    if (!geocoderRef.current) return;

    geocoderRef.current.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        const newAddress = results[0].formatted_address;
        setAddress(newAddress);
        if (callback) {
          callback(newAddress);
        }
      } else {
        console.warn("No address found for this location.");
        if (callback) {
          callback("");
        }
      }
    });
  };

  // Initialize marker on map load
  useEffect(() => {
    if (isLoaded && mapRef.current) {
      updateMarker(initialCenter.lat, initialCenter.lng);
    }
  }, [isLoaded]);

  // Handle autocomplete selection
  const onLoadAutocomplete = (autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const onPlaceChanged = async () => {
    if (!autocompleteRef.current) return;

    const place = autocompleteRef.current.getPlace();
    if (!place.geometry || !place.geometry.location) return;

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    setCenter({ lat, lng });
    setAddress(place.formatted_address || place.name || "");
    updateMarker(lat, lng);

    // Get neighborhood using combined Overpass + Nominatim approach
    setIsLoadingNeighborhood(true);
    onLoadingChange?.(true);
    
    let neighborhood: string | undefined;
    try {
      console.log('🗺️ MapSelector: Getting neighborhood for lat:', lat, 'lng:', lng);
      const result = await getNeighborhoodFromCoordinates(lat, lng);
      neighborhood = result || undefined;
      console.log('🗺️ MapSelector: Neighborhood result:', neighborhood);
    } catch (error) {
      console.error('❌ MapSelector: Failed to get neighborhood:', error);
    } finally {
      setIsLoadingNeighborhood(false);
      onLoadingChange?.(false);
    }

    console.log('🗺️ MapSelector: Calling onLocationChange with neighborhood:', neighborhood);
    if (typeof onLocationChange === "function") {
      onLocationChange(lat, lng, place.formatted_address || place.name || "", neighborhood);
    }
  };

  // Handle map click (adds only one marker at a time)
  const handleMapClick = async (event: google.maps.MapMouseEvent) => {
    const lat = event.latLng!.lat();
    const lng = event.latLng!.lng();

    setCenter({ lat, lng });
    updateMarker(lat, lng);
    
    geocodeLatLng(lat, lng, async (newAddress) => {
      // Get neighborhood using combined approach
      setIsLoadingNeighborhood(true);
      onLoadingChange?.(true);
      
      let neighborhood: string | undefined;
      try {
        console.log('🗺️ MapSelector (map click): Getting neighborhood for lat:', lat, 'lng:', lng);
        const result = await getNeighborhoodFromCoordinates(lat, lng);
        neighborhood = result || undefined;
        console.log('🗺️ MapSelector (map click): Neighborhood result:', neighborhood);
      } catch (error) {
        console.error('❌ MapSelector (map click): Failed to get neighborhood:', error);
      } finally {
        setIsLoadingNeighborhood(false);
        onLoadingChange?.(false);
      }

      console.log('🗺️ MapSelector (map click): Calling onLocationChange with neighborhood:', neighborhood);
      if (typeof onLocationChange === "function") {
        onLocationChange(lat, lng, newAddress, neighborhood);
      }
    });
  };

  // Handle marker drag event
  const handleMarkerDragEnd = async (event: google.maps.MapMouseEvent) => {
    const lat = event.latLng!.lat();
    const lng = event.latLng!.lng();

    setCenter({ lat, lng });
    updateMarker(lat, lng);
    
    geocodeLatLng(lat, lng, async (newAddress) => {
      // Get neighborhood using combined approach
      setIsLoadingNeighborhood(true);
      onLoadingChange?.(true);
      
      let neighborhood: string | undefined;
      try {
        console.log('🗺️ MapSelector (marker drag): Getting neighborhood for lat:', lat, 'lng:', lng);
        const result = await getNeighborhoodFromCoordinates(lat, lng);
        neighborhood = result || undefined;
        console.log('🗺️ MapSelector (marker drag): Neighborhood result:', neighborhood);
      } catch (error) {
        console.error('❌ MapSelector (marker drag): Failed to get neighborhood:', error);
      } finally {
        setIsLoadingNeighborhood(false);
        onLoadingChange?.(false);
      }

      console.log('🗺️ MapSelector (marker drag): Calling onLocationChange with neighborhood:', neighborhood);
      if (typeof onLocationChange === "function") {
        onLocationChange(lat, lng, newAddress, neighborhood);
      }
    });
  };

  // Create explicit marker content
  const markerContent = document.createElement("div");
  markerContent.innerHTML = `
      <div style="
        width: 24px;
        height: 24px;
        background: #FF0000;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        transform: translate(-12px, -12px);
        z-index: 1000;
      "></div>
    `;

  // Update or create a single draggable marker
  const updateMarker = (lat: number, lng: number) => {
    if (!isLoaded || !mapRef.current) return;

    if (!markerRef.current) {
      // Create marker if it doesn't exist
      markerRef.current = new window.google.maps.marker.AdvancedMarkerElement({
        position: { lat, lng },
        map: mapRef.current,
        title: "Selected Location",
        // content: markerContent,
        gmpDraggable: true, // Enable dragging
      });

      // Add drag event listener
      markerRef.current.addListener("dragend", handleMarkerDragEnd);
    } else {
      // Update marker position
      markerRef.current.position = new window.google.maps.LatLng(lat, lng);
    }
  };

  if (loadError) {
    return <div>Error loading Google Maps: {loadError.message}</div>;
  }

  return isLoaded ? (
    <>
    <div className="mt-5" style={{ position: "relative" }}>
      {/* Search Input with Autocomplete */}
      <div style={{ marginBottom: "10px", position: "relative", zIndex: 10 }}>
        <Autocomplete onLoad={onLoadAutocomplete} onPlaceChanged={onPlaceChanged}>
          <input
            type="text"
            placeholder={t('searchByAddress')}
            style={inputStyle}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onClick={() => updateMarker(center.lat, center.lng)}
          />
        </Autocomplete>
      </div>

      {/* Loading Indicator for Neighborhood */}
      {isLoadingNeighborhood && (
        <div style={{
          padding: '8px 12px',
          marginBottom: '10px',
          backgroundColor: '#EFF6FF',
          border: '1px solid #BFDBFE',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          color: '#1E40AF'
        }}>
          <div style={{
            width: '16px',
            height: '16px',
            border: '2px solid #BFDBFE',
            borderTopColor: '#1E40AF',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <span>Detekcija oblasti u toku...</span>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}

      {/* Google Map */}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={16}
        options={{
          mapId: MAP_ID,
          styles: customMapStyles,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          gestureHandling: 'greedy',
        }}
        onClick={handleMapClick}
        onLoad={(map) => { mapRef.current = map; }}>
        <Marker
          position={center}
          draggable={true}
          onDragEnd={handleMarkerDragEnd}
          icon={{
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "#FF0000",
            fillOpacity: 1,
            strokeWeight: 1
          }}
        />
      </GoogleMap>
    </div>
      </>
  ) : (
    <div>Loading...</div>
  );
};

export default React.memo(MapSelector);
