/**
 * Explicit Geographic Coordinate Conversion Utilities
 * Ensures zero inversion between [lat, lon] and [lon, lat]
 */

export interface LatLon {
  latitude: number;
  longitude: number;
}

/** Formats lat/lon into OSRM REST URL parameter "lon,lat" */
export const toOsrmCoordinate = (lat: number, lon: number): string => `${lon},${lat}`;

/** Formats lat/lon into MapLibre / GeoJSON coordinate pair [longitude, latitude] */
export const toMapLibreCoordinate = (lat: number, lon: number): [number, number] => [lon, lat];

/** Formats lat/lon into standard [latitude, longitude] pair */
export const toLatLngArray = (lat: number, lon: number): [number, number] => [lat, lon];

/** Validates if coordinates are within valid Pan-India bounds */
export const isIndiaCoordinate = (lat: number, lon: number): boolean => {
  return lat >= 6.0 && lat <= 38.0 && lon >= 68.0 && lon <= 98.0;
};

/** Computes Haversine great-circle distance in kilometers between two points */
export const haversineDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371.0; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180.0);
  const dLon = (lon2 - lon1) * (Math.PI / 180.0);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180.0)) * Math.cos(lat2 * (Math.PI / 180.0)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
