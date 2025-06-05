// Geocoding utilities for location-based searches

export interface Coordinates {
  lat: number;
  lng: number;
}

export async function geocodeLocation(address: string): Promise<Coordinates | null> {
  if (!process.env.GOOGLE_PLACES_API_KEY) {
    console.error('Google Places API key not configured');
    return null;
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_PLACES_API_KEY}`
    );

    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return {
        lat: location.lat,
        lng: location.lng
      };
    }

    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

// Calculate distance between two coordinates using Haversine formula
export function calculateDistance(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLon = toRad(coord2.lng - coord1.lng);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.lat)) * Math.cos(toRad(coord2.lat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

function toRad(value: number): number {
  return value * Math.PI / 180;
}

// Build a location string for geocoding
export function buildLocationString(city?: string, state?: string, zipCode?: string): string {
  const parts = [];
  if (city) parts.push(city);
  if (state) parts.push(state);
  if (zipCode) parts.push(zipCode);
  parts.push('USA'); // Ensure US-based results
  return parts.join(', ');
}