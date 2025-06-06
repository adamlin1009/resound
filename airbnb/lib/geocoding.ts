// Geocoding utilities for location-based searches

export interface Coordinates {
  lat: number;
  lng: number;
}

export async function geocodeLocation(address: string): Promise<Coordinates | null> {
  if (!process.env.GOOGLE_PLACES_API_KEY) {
    console.warn('Google Places API key not configured, using fallback coordinates');
    // Fallback coordinates for common US cities
    const cityCoordinates: { [key: string]: Coordinates } = {
      'los angeles': { lat: 34.0522, lng: -118.2437 },
      'new york': { lat: 40.7128, lng: -74.0060 },
      'chicago': { lat: 41.8781, lng: -87.6298 },
      'san francisco': { lat: 37.7749, lng: -122.4194 },
      'seattle': { lat: 47.6062, lng: -122.3321 },
      'boston': { lat: 42.3601, lng: -71.0589 },
      'austin': { lat: 30.2672, lng: -97.7431 },
      'denver': { lat: 39.7392, lng: -104.9903 },
      'portland': { lat: 45.5152, lng: -122.6784 },
      'atlanta': { lat: 33.7490, lng: -84.3880 },
      'nashville': { lat: 36.1627, lng: -86.7816 },
      'philadelphia': { lat: 39.9526, lng: -75.1652 },
    };
    
    const normalizedAddress = address.toLowerCase();
    for (const [city, coords] of Object.entries(cityCoordinates)) {
      if (normalizedAddress.includes(city)) {
        return coords;
      }
    }
    
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

    console.warn(`Geocoding failed for address: ${address}, status: ${data.status}`);
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