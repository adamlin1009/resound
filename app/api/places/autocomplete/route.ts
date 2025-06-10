import { NextRequest, NextResponse } from 'next/server';
import { GEO_CONSTANTS, CACHE_CONSTANTS } from '@/constants';

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

async function getPlaceDetails(placeId: string): Promise<{ zipCode?: string; city?: string; state?: string }> {
  try {
    const queryParams = new URLSearchParams({
      place_id: placeId,
      fields: 'address_components',
      key: GOOGLE_PLACES_API_KEY!,
    });

    const response = await fetch(`${GEO_CONSTANTS.GOOGLE_PLACE_DETAILS_URL}?${queryParams}`);
    if (!response.ok) return {};

    const data = await response.json();
    if (data.status !== 'OK' || !data.result?.address_components) return {};

    let zipCode = '';
    let city = '';
    let state = '';

    for (const component of data.result.address_components) {
      const types = component.types || [];
      
      if (types.includes('postal_code')) {
        zipCode = component.long_name;
      } else if (types.includes('locality')) {
        city = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        state = component.short_name;
      }
    }

    return { zipCode, city, state };
  } catch (error) {
    // Error fetching place details handled
    return {};
  }
}

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
      // Google Places API key not configured
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
      types = 'geocode'; // More comprehensive than just cities
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
    const response = await fetch(`${GEO_CONSTANTS.GOOGLE_PLACES_AUTOCOMPLETE_URL}?${queryParams}`, {
      next: { revalidate: CACHE_CONSTANTS.PLACES_CACHE_SECONDS } // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`);
    }

    const data = await response.json();

    // Handle API errors
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      // Google Places API error handled
      throw new Error(data.error_message || 'Location service error');
    }

    // Format predictions for our use case
    const formattedPredictions = await Promise.all((data.predictions || []).map(async (prediction: any) => {
      // Remove "USA" from the description
      let cleanDescription = prediction.description.replace(/, USA$/, '');
      
      // Extract parts from cleaned description
      const parts = cleanDescription.split(', ');
      
      // Handle different prediction types
      let city = '';
      let state = '';
      let zipCode = '';
      let formattedDisplay = '';
      let streetAddress = '';
      
      // Try to extract zip code from anywhere in the description
      const zipMatch = cleanDescription.match(/\b(\d{5})\b/);
      if (zipMatch) {
        zipCode = zipMatch[1];
      }
      
      if (types === 'postal_code') {
        // For postal codes, the main text is the zip code
        zipCode = prediction.structured_formatting?.main_text || parts[0];
        // City and state are in secondary text
        const secondary = prediction.structured_formatting?.secondary_text || '';
        const secondaryParts = secondary.split(', ');
        city = secondaryParts[0] || '';
        state = secondaryParts[1]?.replace(/, USA/, '').trim() || '';
        
        // Format: "City, State ZIP"
        formattedDisplay = `${city}, ${state} ${zipCode}`;
      } else if (types === 'address' && parts.length >= 3) {
        // For street addresses
        streetAddress = parts[0];
        city = parts[1] || '';
        
        // Handle state part which might contain zip code
        let statePart = parts[2] || '';
        
        // Check if the last part or any part contains a zip code
        if (parts.length >= 4 && /^\d{5}$/.test(parts[parts.length - 1])) {
          // Zip code is a separate part
          zipCode = parts[parts.length - 1];
          state = statePart;
        } else if (statePart.includes(' ')) {
          // State and zip might be combined like "CA 92602"
          const stateZipParts = statePart.split(' ');
          state = stateZipParts[0];
          if (stateZipParts[1] && /^\d{5}$/.test(stateZipParts[1])) {
            zipCode = stateZipParts[1];
          }
        } else {
          // Just state, no zip in this part
          state = statePart;
        }
        
        // Clean up state from any remaining zip code
        state = state.replace(/\s*\d{5}$/, '').trim();
        
        // Format: "Street Address, City, State ZIP"
        formattedDisplay = zipCode 
          ? `${streetAddress}, ${city}, ${state} ${zipCode}`
          : `${streetAddress}, ${city}, ${state}`;
      } else {
        // For cities and general geocoding
        city = parts[0] || '';
        state = parts[1] || '';
        
        // Clean up state if it has zip code
        if (state && state.includes(' ')) {
          const stateParts = state.split(' ');
          state = stateParts[0];
          if (stateParts[1] && /^\d{5}$/.test(stateParts[1])) {
            zipCode = stateParts[1];
          }
        }
        
        // Format: "City, State ZIP" or "City, State"
        formattedDisplay = zipCode 
          ? `${city}, ${state} ${zipCode}`
          : `${city}, ${state}`;
      }
      
      // Clean up secondary text for display
      let cleanSecondaryText = prediction.structured_formatting?.secondary_text || '';
      cleanSecondaryText = cleanSecondaryText.replace(/, USA$/, '');
      
      // If this is an address and we don't have a zip code, fetch place details
      if (types === 'address' && !zipCode && prediction.place_id) {
        const details = await getPlaceDetails(prediction.place_id);
        if (details.zipCode) {
          zipCode = details.zipCode;
          // Update city and state if we got better data
          if (details.city) city = details.city;
          if (details.state) state = details.state;
          
          // Rebuild the formatted display with the zip code
          if (streetAddress) {
            formattedDisplay = `${streetAddress}, ${city}, ${state} ${zipCode}`;
          } else {
            formattedDisplay = `${city}, ${state} ${zipCode}`;
          }
        }
      }
      
      // If we still don't have a good display, but we have the parts, construct it
      if (!formattedDisplay && streetAddress && city && state) {
        formattedDisplay = zipCode 
          ? `${streetAddress}, ${city}, ${state} ${zipCode}`
          : `${streetAddress}, ${city}, ${state}`;
      }
      
      return {
        placeId: prediction.place_id,
        displayText: formattedDisplay || cleanDescription,
        city,
        state,
        zipCode,
        mainText: prediction.structured_formatting?.main_text || city,
        secondaryText: cleanSecondaryText,
      };
    }));

    return NextResponse.json({ 
      predictions: formattedPredictions,
      status: data.status 
    });

  } catch (error) {
    // Places autocomplete error handled
    return NextResponse.json(
      { error: 'Failed to fetch location suggestions' },
      { status: 500 }
    );
  }
}