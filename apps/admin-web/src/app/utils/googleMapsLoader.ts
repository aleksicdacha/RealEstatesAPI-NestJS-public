// googleMapsLoader.ts
import type { Libraries } from '@react-google-maps/api';

const libraries: Libraries = ["places", "marker"];

export const googleMapsLoaderOptions = {
  id: "google-map-script",
  googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  version: "beta",
  libraries,
  mapIds: ["5d80c86bf779e713"], // Include MAP_ID for all maps
};
