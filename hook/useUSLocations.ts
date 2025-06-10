// Simple mapping of state codes to full names
const STATE_NAMES: Record<string, string> = {
  'AL': 'Alabama',
  'AK': 'Alaska',
  'AZ': 'Arizona',
  'AR': 'Arkansas',
  'CA': 'California',
  'CO': 'Colorado',
  'CT': 'Connecticut',
  'DE': 'Delaware',
  'FL': 'Florida',
  'GA': 'Georgia',
  'HI': 'Hawaii',
  'ID': 'Idaho',
  'IL': 'Illinois',
  'IN': 'Indiana',
  'IA': 'Iowa',
  'KS': 'Kansas',
  'KY': 'Kentucky',
  'LA': 'Louisiana',
  'ME': 'Maine',
  'MD': 'Maryland',
  'MA': 'Massachusetts',
  'MI': 'Michigan',
  'MN': 'Minnesota',
  'MS': 'Mississippi',
  'MO': 'Missouri',
  'MT': 'Montana',
  'NE': 'Nebraska',
  'NV': 'Nevada',
  'NH': 'New Hampshire',
  'NJ': 'New Jersey',
  'NM': 'New Mexico',
  'NY': 'New York',
  'NC': 'North Carolina',
  'ND': 'North Dakota',
  'OH': 'Ohio',
  'OK': 'Oklahoma',
  'OR': 'Oregon',
  'PA': 'Pennsylvania',
  'RI': 'Rhode Island',
  'SC': 'South Carolina',
  'SD': 'South Dakota',
  'TN': 'Tennessee',
  'TX': 'Texas',
  'UT': 'Utah',
  'VT': 'Vermont',
  'VA': 'Virginia',
  'WA': 'Washington',
  'WV': 'West Virginia',
  'WI': 'Wisconsin',
  'WY': 'Wyoming',
  'DC': 'District of Columbia'
};

export type USLocationValue = {
  city?: string;
  state: string;
  zipCode?: string;
};

const useUSLocations = () => {
  const getStateName = (stateCode: string): string => {
    return STATE_NAMES[stateCode.toUpperCase()] || stateCode;
  };

  const formatLocation = (location: USLocationValue) => {
    const stateName = getStateName(location.state);
    
    if (location.city) {
      return `${location.city}, ${stateName}${location.zipCode ? `, ${location.zipCode}` : ''}`;
    }
    return `${stateName}${location.zipCode ? `, ${location.zipCode}` : ''}`;
  };

  const formatLocationShort = (location: USLocationValue) => {
    if (location.city) {
      return `${location.city}, ${location.state}`;
    }
    return location.state;
  };

  return {
    getStateName,
    formatLocation,
    formatLocationShort,
  };
};

export default useUSLocations;