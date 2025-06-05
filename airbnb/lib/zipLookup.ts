// Simple zip code to city/state mapping for common US zip codes
// In production, you'd use a proper API service like Zippopotam or Google Places
const zipToLocation: Record<string, { city: string; state: string }> = {
  // Major cities from our seed data
  "10001": { city: "New York", state: "NY" },
  "90210": { city: "Los Angeles", state: "CA" },
  "60601": { city: "Chicago", state: "IL" },
  "73301": { city: "Austin", state: "TX" },
  "02101": { city: "Boston", state: "MA" },
  "33101": { city: "Miami", state: "FL" },
  "98101": { city: "Seattle", state: "WA" },
  "94101": { city: "San Francisco", state: "CA" },
  "37201": { city: "Nashville", state: "TN" },
  "80201": { city: "Denver", state: "CO" },
  "97201": { city: "Portland", state: "OR" },
  "30301": { city: "Atlanta", state: "GA" },
  "89101": { city: "Las Vegas", state: "NV" },
  "85001": { city: "Phoenix", state: "AZ" },
  "92101": { city: "San Diego", state: "CA" },
  "77001": { city: "Houston", state: "TX" },
  "19101": { city: "Philadelphia", state: "PA" },
  "55401": { city: "Minneapolis", state: "MN" },
  "48201": { city: "Detroit", state: "MI" },
  "70112": { city: "New Orleans", state: "LA" },
  "64101": { city: "Kansas City", state: "MO" },
  "38103": { city: "Memphis", state: "TN" },
  "28201": { city: "Charlotte", state: "NC" },
  "44101": { city: "Cleveland", state: "OH" },
  "46201": { city: "Indianapolis", state: "IN" },
  "53201": { city: "Milwaukee", state: "WI" },
  "84101": { city: "Salt Lake City", state: "UT" },
  "87101": { city: "Albuquerque", state: "NM" },
  "23220": { city: "Richmond", state: "VA" },
  "32201": { city: "Jacksonville", state: "FL" },
  "43215": { city: "Columbus", state: "OH" },
  "73102": { city: "Oklahoma City", state: "OK" },
  "27601": { city: "Raleigh", state: "NC" },
  "14201": { city: "Buffalo", state: "NY" },
  "40202": { city: "Louisville", state: "KY" },
  // Common zip codes
  "90012": { city: "Los Angeles", state: "CA" },
  "10003": { city: "New York", state: "NY" },
  "60614": { city: "Chicago", state: "IL" },
};

export const lookupZipCode = async (zipCode: string): Promise<{ city: string; state: string } | null> => {
  // Remove any non-digits and take first 5 characters
  const cleanZip = zipCode.replace(/\D/g, '').slice(0, 5);
  
  if (cleanZip.length !== 5) {
    return null;
  }

  // Check our local mapping first
  const localResult = zipToLocation[cleanZip];
  if (localResult) {
    return localResult;
  }

  // For production, use a real API like zippopotam.us
  try {
    const response = await fetch(`https://api.zippopotam.us/us/${cleanZip}`);
    if (response.ok) {
      const data = await response.json();
      return {
        city: data.places[0]['place name'],
        state: data.places[0]['state abbreviation']
      };
    }
  } catch (error) {
    console.log('Zip lookup failed, using fallback');
  }

  return null;
};