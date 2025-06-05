import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const GOOGLE_PLACES_API_URL = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const input = searchParams.get('input');
    const sessionToken = searchParams.get('sessionToken');

    // Validate input
    if (!input || input.length < 2) {
      return NextResponse.json({ predictions: [] });
    }

    // Check if API key exists
    if (!GOOGLE_PLACES_API_KEY) {
      console.warn('Google Places API key not configured');
      return NextResponse.json({ predictions: [] });
    }

    // Determine search type based on input
    const isZipCode = /^\d{5}$/.test(input);
    const isPartialZip = /^\d{1,4}$/.test(input);
    const hasNumbers = /\d/.test(input);
    
    let types: string;
    if (isZipCode) {
      types = 'postal_code';
    } else if (isPartialZip) {
      types = 'postal_code';
    } else if (hasNumbers) {
      types = 'address';
    } else {
      types = '(cities)';
    }
    
    // Build query parameters
    const queryParams = new URLSearchParams({
      input,
      key: GOOGLE_PLACES_API_KEY,
      components: 'country:us',
      types: types,
      language: 'en',
    });

    // Add session token if provided
    if (sessionToken) {
      queryParams.append('sessiontoken', sessionToken);
    }

    // Make request to Google Places API
    const response = await fetch(`${GOOGLE_PLACES_API_URL}?${queryParams}`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`);
    }

    const data = await response.json();

    // Handle API errors
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Google Places API error:', data.status, data.error_message);
      throw new Error(data.error_message || 'Location service error');
    }

    // Format predictions for our use case
    const formattedPredictions = (data.predictions || []).map((prediction: any) => {
      // Extract city and state from description
      const parts = prediction.description.split(', ');
      
      // Handle different prediction types
      let city = '';
      let state = '';
      let zipCode = '';
      
      if (types === 'postal_code') {
        // For postal codes, the main text is the zip code
        zipCode = prediction.structured_formatting?.main_text || parts[0];
        // City and state are in secondary text
        const secondary = prediction.structured_formatting?.secondary_text || '';
        const secondaryParts = secondary.split(', ');
        city = secondaryParts[0] || '';
        state = secondaryParts[1] || '';
      } else {
        // For cities and addresses
        city = parts[0] || '';
        state = parts.length >= 2 ? parts[1] : '';
      }
      
      return {
        placeId: prediction.place_id,
        displayText: prediction.description,
        city,
        state,
        zipCode,
        mainText: prediction.structured_formatting?.main_text || city,
        secondaryText: prediction.structured_formatting?.secondary_text || state,
      };
    });

    return NextResponse.json({ 
      predictions: formattedPredictions,
      status: data.status 
    });

  } catch (error) {
    console.error('Places autocomplete error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch location suggestions' },
      { status: 500 }
    );
  }
}