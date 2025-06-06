import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_GEOCODING_API_KEY = process.env.GOOGLE_PLACES_API_KEY; // Using same key
const GOOGLE_GEOCODING_API_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get('address');

    // Validate input
    if (!address || address.length < 2) {
      return NextResponse.json({ coordinates: null });
    }

    // Check if API key exists
    if (!GOOGLE_GEOCODING_API_KEY) {
      console.warn('Google Geocoding API key not configured');
      return NextResponse.json({ coordinates: null });
    }

    // Build query parameters
    const queryParams = new URLSearchParams({
      address,
      key: GOOGLE_GEOCODING_API_KEY,
      components: 'country:US',
    });

    // Make request to Google Geocoding API
    const response = await fetch(`${GOOGLE_GEOCODING_API_URL}?${queryParams}`, {
      next: { revalidate: 86400 } // Cache for 24 hours
    });

    if (!response.ok) {
      throw new Error(`Google Geocoding API error: ${response.status}`);
    }

    const data = await response.json();

    // Handle API errors
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Google Geocoding API error:', data.status, data.error_message);
      return NextResponse.json({ coordinates: null });
    }

    // Extract coordinates from first result
    if (data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return NextResponse.json({ 
        coordinates: [location.lat, location.lng]
      });
    }

    return NextResponse.json({ coordinates: null });

  } catch (error) {
    console.error('Geocoding error:', error);
    return NextResponse.json({ coordinates: null });
  }
}