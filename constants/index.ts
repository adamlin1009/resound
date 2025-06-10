/**
 * Central constants file for the Resound application
 * All magic numbers and repeated values should be defined here
 */

// Time-related constants
export const TIME_CONSTANTS = {
  // Reservation expiry time in minutes
  RESERVATION_EXPIRY_MINUTES: 15,
  
  // Message expiry time in days after rental completion
  MESSAGE_EXPIRY_DAYS: 30,
  
  // Time unit conversions
  MILLISECONDS_PER_SECOND: 1000,
  SECONDS_PER_MINUTE: 60,
  MINUTES_PER_HOUR: 60,
  HOURS_PER_DAY: 24,
  MILLISECONDS_PER_MINUTE: 1000 * 60,
  MILLISECONDS_PER_HOUR: 1000 * 60 * 60,
  MILLISECONDS_PER_DAY: 1000 * 60 * 60 * 24,
} as const;

// Cache duration constants
export const CACHE_CONSTANTS = {
  // Cache duration for geocoding results (24 hours)
  GEOCODE_CACHE_SECONDS: 86400,
  
  // Cache duration for places autocomplete results (1 hour)
  PLACES_CACHE_SECONDS: 3600,
} as const;

// Geographic and mapping constants
export const GEO_CONSTANTS = {
  // Earth's radius in miles (used for Haversine distance calculations)
  EARTH_RADIUS_MILES: 3959,
  
  // Google Maps API endpoints
  GOOGLE_MAPS_GEOCODE_URL: 'https://maps.googleapis.com/maps/api/geocode/json',
  GOOGLE_PLACES_AUTOCOMPLETE_URL: 'https://maps.googleapis.com/maps/api/place/autocomplete/json',
  GOOGLE_PLACE_DETAILS_URL: 'https://maps.googleapis.com/maps/api/place/details/json',
} as const;

// Payment-related constants
export const PAYMENT_CONSTANTS = {
  // Conversion factor for dollars to cents
  CENTS_PER_DOLLAR: 100,
} as const;

// Instrument categories and types
export const INSTRUMENT_CATEGORIES = {
  Strings: [
    "Violin",
    "Viola", 
    "Cello",
    "Double Bass",
    "Harp",
    "Classical Guitar",
    "Acoustic Guitar",
    "Electric Guitar",
    "Bass Guitar",
    "Ukulele",
    "Mandolin",
    "Banjo",
    "Lute",
    "Sitar",
    "Zither",
    "Dulcimer",
    "Lyre",
    "Balalaika",
    "Bouzouki",
    "Autoharp"
  ],
  Percussion: [
    "Drum Set",
    "Snare Drum",
    "Bass Drum",
    "Timpani",
    "Xylophone",
    "Marimba",
    "Vibraphone",
    "Glockenspiel",
    "Chimes",
    "Cymbals",
    "Triangle",
    "Tambourine",
    "Castanets",
    "Bongos",
    "Congas",
    "Djembe",
    "Tabla",
    "Cajón",
    "Steel Drums",
    "Handpan",
    "Frame Drum",
    "Bodhrán"
  ],
  Woodwinds: [
    "Flute",
    "Piccolo",
    "Clarinet",
    "Bass Clarinet",
    "Oboe",
    "English Horn",
    "Bassoon",
    "Contrabassoon",
    "Alto Saxophone",
    "Tenor Saxophone",
    "Soprano Saxophone",
    "Baritone Saxophone",
    "Recorder",
    "Pan Flute",
    "Harmonica",
    "Bagpipes",
    "Tin Whistle",
    "Ocarina",
    "Didgeridoo"
  ],
  Brass: [
    "Trumpet",
    "Cornet",
    "Flugelhorn",
    "French Horn",
    "Trombone",
    "Bass Trombone",
    "Euphonium",
    "Baritone Horn",
    "Tuba",
    "Sousaphone",
    "Piccolo Trumpet",
    "Pocket Trumpet",
    "Wagner Tuba",
    "Bugle",
    "Natural Horn",
    "Serpent",
    "Alphorn"
  ],
  Keyboards: [
    "Grand Piano",
    "Upright Piano",
    "Digital Piano",
    "Keyboard",
    "Synthesizer",
    "Organ",
    "Hammond Organ",
    "Pipe Organ",
    "Harpsichord",
    "Clavichord",
    "Accordion",
    "Melodica",
    "Celesta",
    "Rhodes Piano",
    "Wurlitzer",
    "Mellotron",
    "Harmonium"
  ],
  Electronic: [
    "DJ Controller",
    "Turntables",
    "CDJ",
    "Mixer",
    "Sampler",
    "Drum Machine",
    "Sequencer",
    "Theremin",
    "Electronic Drums",
    "MIDI Controller",
    "Groovebox",
    "Effects Processor",
    "Loop Station",
    "Vocoder",
    "Talk Box"
  ],
  Recording: [
    "Condenser Microphone",
    "Dynamic Microphone",
    "Ribbon Microphone",
    "Audio Interface",
    "Studio Monitors",
    "Mixing Console",
    "Preamp",
    "Compressor",
    "Equalizer",
    "Reverb Unit",
    "Field Recorder",
    "Studio Headphones",
    "Pop Filter",
    "Shock Mount",
    "Boom Stand"
  ],
  Other: [
    "Kalimba",
    "Hang Drum",
    "Rain Stick",
    "Ocean Drum",
    "Singing Bowl",
    "Gong",
    "Wind Chimes",
    "Jaw Harp",
    "Kazoo",
    "Slide Whistle",
    "Musical Saw",
    "Glass Harmonica",
    "Flexatone",
    "Washboard",
    "Spoons"
  ]
} as const;

// Flatten all instruments into a single array for autocomplete
export const ALL_INSTRUMENTS = Object.entries(INSTRUMENT_CATEGORIES).flatMap(
  ([category, instruments]) => 
    instruments.map(instrument => ({
      value: instrument,
      label: instrument,
      category: category
    }))
);

// Create options grouped by category for react-select
export const INSTRUMENT_OPTIONS = Object.entries(INSTRUMENT_CATEGORIES).map(
  ([category, instruments]) => ({
    label: category,
    options: instruments.map(instrument => ({
      value: instrument,
      label: instrument,
      category: category
    }))
  })
);

// Type exports for better type safety
export type TimeConstants = typeof TIME_CONSTANTS;
export type CacheConstants = typeof CACHE_CONSTANTS;
export type GeoConstants = typeof GEO_CONSTANTS;
export type PaymentConstants = typeof PAYMENT_CONSTANTS;
export type InstrumentCategories = typeof INSTRUMENT_CATEGORIES;
export type InstrumentOption = {
  value: string;
  label: string;
  category: string;
};