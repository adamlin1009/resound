import countries from "world-countries";

// North American countries (including Central America and Caribbean)
const northAmericanCountries = [
  'US', 'CA', 'MX', 'GT', 'BZ', 'SV', 'HN', 'NI', 'CR', 'PA', 'CU', 'JM', 'HT', 'DO', 'PR', 'TT', 'BB', 'GD', 'VC', 'LC', 'DM', 'AG', 'KN', 'BS', 'BM'
];

// South American countries
const southAmericanCountries = [
  'BR', 'AR', 'CL', 'PE', 'CO', 'VE', 'EC', 'BO', 'PY', 'UY', 'GY', 'SR', 'GF'
];

const getCorrectRegion = (countryCode: string, originalRegion: string) => {
  if (originalRegion === 'Americas') {
    if (northAmericanCountries.includes(countryCode)) {
      return 'North America';
    } else if (southAmericanCountries.includes(countryCode)) {
      return 'South America';
    }
  }
  return originalRegion;
};

const formattedCountries = countries.map((country) => ({
  value: country.cca2,
  label: country.name.common,
  flag: country.flag,
  latlng: country.latlng,
  region: getCorrectRegion(country.cca2, country.region),
}));

const useCountries = () => {
  const getAll = () => formattedCountries;

  const getByValue = (value: string) => {
    return formattedCountries.find((item) => item.value === value);
  };

  return {
    getAll,
    getByValue,
  };
};

export default useCountries;
