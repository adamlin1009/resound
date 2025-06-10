import { useCallback, useEffect, useState, useMemo } from 'react';
import { USLocationValue } from './useUSLocations';

type Coordinates = [number, number] | null;

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
    if (addressString && addressString.length >= 2) {
      fetchCoordinates(addressString);
    } else {
      setCoordinates(null);
      setIsLoading(false);
    }
  }, [addressString, fetchCoordinates]);

  return { coordinates, isLoading };
}