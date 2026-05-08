import { useCallback, useEffect, useState, useMemo } from 'react';
import { USLocationValue } from './useUSLocations';

type Coordinates = [number, number] | null;

const demoCoordinatesByLocation: Record<string, Coordinates> = {
  "Boston, MA": [42.3429, -71.0857],
  "New York, NY": [40.7736, -73.9835],
  "San Francisco, CA": [37.7786, -122.4073],
  "New Orleans, LA": [29.9641, -90.057],
  "Chicago, IL": [41.9454, -87.6553],
  "Austin, TX": [30.2501, -97.7493],
};

export function useCoordinates(location: USLocationValue | null) {
  const [coordinates, setCoordinates] = useState<Coordinates>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Memoize the address string to prevent unnecessary re-renders
  const addressString = useMemo(() => {
    if (!location) return null;
    
    const addressParts = [];
    if (location.city) addressParts.push(location.city);
    if (location.state) addressParts.push(location.state);
    if (location.zipCode) addressParts.push(location.zipCode);
    
    return addressParts.length > 0 ? addressParts.join(', ') : null;
  }, [location?.city, location?.state, location?.zipCode]);

  const fetchCoordinates = useCallback(async (address: string) => {
    try {
      setIsLoading(true);
      
      const params = new URLSearchParams({ address });
      const response = await fetch(`/api/geocode?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch coordinates');
      }
      
      const data = await response.json();
      setCoordinates(data.coordinates);
    } catch (error) {
      // Error handled internally
      setCoordinates(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_RESOUND_DEMO === 'true' && addressString) {
      const demoCoordinates = demoCoordinatesByLocation[addressString] || null;
      setCoordinates(demoCoordinates);
      setIsLoading(false);
      return;
    }

    if (addressString && addressString.length >= 2) {
      fetchCoordinates(addressString);
    } else {
      setCoordinates(null);
      setIsLoading(false);
    }
  }, [addressString, fetchCoordinates]);

  return { coordinates, isLoading };
}
