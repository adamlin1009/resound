/**
 * Central constants file for the Resound application
 * All magic numbers and repeated values should be defined here
 */

// Time-related constants
export const TIME_CONSTANTS = {
  // Reservation expiry time in minutes
  RESERVATION_EXPIRY_MINUTES: 15,
  
  // Message expiry time in days after rental completion
  MESSAGE_EXPIRY_DAYS: 30,
  
  // Time unit conversions
  MILLISECONDS_PER_SECOND: 1000,
  SECONDS_PER_MINUTE: 60,
  MINUTES_PER_HOUR: 60,
  HOURS_PER_DAY: 24,
  MILLISECONDS_PER_MINUTE: 1000 * 60,
  MILLISECONDS_PER_HOUR: 1000 * 60 * 60,
  MILLISECONDS_PER_DAY: 1000 * 60 * 60 * 24,
} as const;

// Cache duration constants
export const CACHE_CONSTANTS = {
  // Cache duration for geocoding results (24 hours)
  GEOCODE_CACHE_SECONDS: 86400,
  
  // Cache duration for places autocomplete results (1 hour)
  PLACES_CACHE_SECONDS: 3600,
} as const;

// Geographic and mapping constants
export const GEO_CONSTANTS = {
  // Earth's radius in miles (used for Haversine distance calculations)
  EARTH_RADIUS_MILES: 3959,
  
  // Google Maps API endpoints
  GOOGLE_MAPS_GEOCODE_URL: 'https://maps.googleapis.com/maps/api/geocode/json',
  GOOGLE_PLACES_AUTOCOMPLETE_URL: 'https://maps.googleapis.com/maps/api/place/autocomplete/json',
  GOOGLE_PLACE_DETAILS_URL: 'https://maps.googleapis.com/maps/api/place/details/json',
} as const;

// Payment-related constants
export const PAYMENT_CONSTANTS = {
  // Conversion factor for dollars to cents
  CENTS_PER_DOLLAR: 100,
} as const;

// Type exports for better type safety
export type TimeConstants = typeof TIME_CONSTANTS;
export type CacheConstants = typeof CACHE_CONSTANTS;
export type GeoConstants = typeof GEO_CONSTANTS;
export type PaymentConstants = typeof PAYMENT_CONSTANTS;