const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Import instrument categories from constants
const INSTRUMENT_CATEGORIES = {
  Strings: [
    "Violin", "Viola", "Cello", "Double Bass", "Harp", "Classical Guitar",
    "Acoustic Guitar", "Electric Guitar", "Bass Guitar", "Ukulele", "Mandolin",
    "Banjo", "Lute", "Sitar", "Zither", "Dulcimer", "Lyre", "Balalaika",
    "Bouzouki", "Autoharp"
  ],
  Percussion: [
    "Drum Set", "Snare Drum", "Bass Drum", "Timpani", "Xylophone", "Marimba",
    "Vibraphone", "Glockenspiel", "Chimes", "Cymbals", "Triangle", "Tambourine",
    "Castanets", "Bongos", "Congas", "Djembe", "Tabla", "Cajón", "Steel Drums",
    "Handpan", "Frame Drum", "Bodhrán"
  ],
  Woodwinds: [
    "Flute", "Piccolo", "Clarinet", "Bass Clarinet", "Oboe", "English Horn",
    "Bassoon", "Contrabassoon", "Alto Saxophone", "Tenor Saxophone",
    "Soprano Saxophone", "Baritone Saxophone", "Recorder", "Pan Flute",
    "Harmonica", "Bagpipes", "Tin Whistle", "Ocarina", "Didgeridoo"
  ],
  Brass: [
    "Trumpet", "Cornet", "Flugelhorn", "French Horn", "Trombone", "Bass Trombone",
    "Euphonium", "Baritone Horn", "Tuba", "Sousaphone", "Piccolo Trumpet",
    "Pocket Trumpet", "Wagner Tuba", "Bugle", "Natural Horn", "Serpent", "Alphorn"
  ],
  Keyboards: [
    "Grand Piano", "Upright Piano", "Digital Piano", "Keyboard", "Synthesizer",
    "Organ", "Hammond Organ", "Pipe Organ", "Harpsichord", "Clavichord",
    "Accordion", "Melodica", "Celesta", "Rhodes Piano", "Wurlitzer", "Mellotron",
    "Harmonium"
  ],
  Electronic: [
    "DJ Controller", "Turntables", "CDJ", "Mixer", "Sampler", "Drum Machine",
    "Sequencer", "Theremin", "Electronic Drums", "MIDI Controller", "Groovebox",
    "Effects Processor", "Loop Station", "Vocoder", "Talk Box"
  ],
  Recording: [
    "Condenser Microphone", "Dynamic Microphone", "Ribbon Microphone",
    "Audio Interface", "Studio Monitors", "Mixing Console", "Preamp",
    "Compressor", "Equalizer", "Reverb Unit", "Field Recorder",
    "Studio Headphones", "Pop Filter", "Shock Mount", "Boom Stand"
  ],
  Other: [
    "Kalimba", "Hang Drum", "Rain Stick", "Ocean Drum", "Singing Bowl", "Gong",
    "Wind Chimes", "Jaw Harp", "Kazoo", "Slide Whistle", "Musical Saw",
    "Glass Harmonica", "Flexatone", "Washboard", "Spoons"
  ]
};

// Create a flattened list of all instruments for easier searching
const ALL_INSTRUMENTS = Object.entries(INSTRUMENT_CATEGORIES).flatMap(
  ([category, instruments]) => instruments.map(instrument => ({
    name: instrument,
    category: category
  }))
);

// Common variations and abbreviations
const INSTRUMENT_VARIATIONS = {
  // Strings
  "violin": ["violin", "fiddle"],
  "viola": ["viola"],
  "cello": ["cello", "violoncello"],
  "double bass": ["double bass", "upright bass", "string bass", "contrabass", "bass"],
  "harp": ["harp"],
  "classical guitar": ["classical guitar", "nylon string guitar", "spanish guitar"],
  "acoustic guitar": ["acoustic guitar", "acoustic", "steel string guitar"],
  "electric guitar": ["electric guitar", "electric", "e-guitar", "solid body guitar"],
  "bass guitar": ["bass guitar", "electric bass", "bass"],
  "ukulele": ["ukulele", "uke"],
  "mandolin": ["mandolin"],
  "banjo": ["banjo"],
  
  // Percussion
  "drum set": ["drum set", "drum kit", "drums", "drumset", "kit"],
  "snare drum": ["snare drum", "snare"],
  "bass drum": ["bass drum", "kick drum"],
  "timpani": ["timpani", "kettle drums", "kettledrums"],
  "xylophone": ["xylophone"],
  "marimba": ["marimba"],
  "vibraphone": ["vibraphone", "vibes"],
  "djembe": ["djembe", "djembé"],
  "cajon": ["cajon", "cajón"],
  
  // Woodwinds
  "flute": ["flute"],
  "piccolo": ["piccolo"],
  "clarinet": ["clarinet"],
  "bass clarinet": ["bass clarinet"],
  "oboe": ["oboe"],
  "bassoon": ["bassoon"],
  "alto saxophone": ["alto saxophone", "alto sax"],
  "tenor saxophone": ["tenor saxophone", "tenor sax"],
  "soprano saxophone": ["soprano saxophone", "soprano sax"],
  "baritone saxophone": ["baritone saxophone", "bari sax", "baritone sax"],
  
  // Brass
  "trumpet": ["trumpet"],
  "cornet": ["cornet"],
  "french horn": ["french horn", "horn"],
  "trombone": ["trombone", "bone"],
  "euphonium": ["euphonium", "euph"],
  "tuba": ["tuba"],
  
  // Keyboards
  "grand piano": ["grand piano", "grand", "concert piano"],
  "upright piano": ["upright piano", "upright", "vertical piano"],
  "digital piano": ["digital piano", "electric piano", "e-piano"],
  "keyboard": ["keyboard", "keyboard piano"],
  "synthesizer": ["synthesizer", "synth"],
  "organ": ["organ"],
  
  // Common abbreviations
  "sax": ["saxophone"],
  "mic": ["microphone"],
  "amp": ["amplifier"]
};

function findInstrumentType(title, description, category) {
  const searchText = `${title} ${description}`.toLowerCase();
  
  // First, try to find exact matches from the category's instruments
  const categoryInstruments = INSTRUMENT_CATEGORIES[category] || [];
  for (const instrument of categoryInstruments) {
    if (searchText.includes(instrument.toLowerCase())) {
      return instrument;
    }
  }
  
  // Then check variations
  for (const [canonical, variations] of Object.entries(INSTRUMENT_VARIATIONS)) {
    for (const variation of variations) {
      if (searchText.includes(variation.toLowerCase())) {
        // Find the proper instrument name from our list
        const match = ALL_INSTRUMENTS.find(i => 
          i.name.toLowerCase() === canonical || 
          i.name.toLowerCase().includes(canonical)
        );
        if (match && match.category === category) {
          return match.name;
        }
      }
    }
  }
  
  // Special case handling
  if (category === "Strings") {
    if (searchText.includes("guitar") && !searchText.includes("bass")) {
      if (searchText.includes("classical") || searchText.includes("nylon")) {
        return "Classical Guitar";
      } else if (searchText.includes("electric")) {
        return "Electric Guitar";
      } else {
        return "Acoustic Guitar";
      }
    }
    if (searchText.includes("bass") && !searchText.includes("double")) {
      if (searchText.includes("electric") || searchText.includes("guitar")) {
        return "Bass Guitar";
      } else if (searchText.includes("upright") || searchText.includes("acoustic")) {
        return "Double Bass";
      }
    }
  }
  
  if (category === "Woodwinds") {
    if (searchText.includes("sax")) {
      if (searchText.includes("alto")) return "Alto Saxophone";
      if (searchText.includes("tenor")) return "Tenor Saxophone";
      if (searchText.includes("soprano")) return "Soprano Saxophone";
      if (searchText.includes("baritone") || searchText.includes("bari")) return "Baritone Saxophone";
      // Default to alto sax if type not specified
      return "Alto Saxophone";
    }
  }
  
  if (category === "Keyboards") {
    if (searchText.includes("piano")) {
      if (searchText.includes("grand")) return "Grand Piano";
      if (searchText.includes("upright") || searchText.includes("vertical")) return "Upright Piano";
      if (searchText.includes("digital") || searchText.includes("electric")) return "Digital Piano";
      // Default to upright piano if type not specified
      return "Upright Piano";
    }
  }
  
  if (category === "Recording") {
    if (searchText.includes("mic") || searchText.includes("microphone")) {
      if (searchText.includes("condenser")) return "Condenser Microphone";
      if (searchText.includes("dynamic")) return "Dynamic Microphone";
      if (searchText.includes("ribbon")) return "Ribbon Microphone";
      // Default to dynamic mic if type not specified
      return "Dynamic Microphone";
    }
  }
  
  return null;
}

async function migrateInstrumentTypes() {
  console.log('Starting instrument type migration...\n');
  
  try {
    // Get all listings and filter those without instrumentType
    const allListings = await prisma.listing.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        instrumentType: true
      }
    });
    
    // Filter listings without instrumentType
    const listings = allListings.filter(l => !l.instrumentType);
    
    console.log(`Found ${listings.length} listings without instrument type\n`);
    
    const updates = [];
    const unmatched = [];
    const stats = {
      total: listings.length,
      updated: 0,
      unmatched: 0,
      byCategory: {}
    };
    
    // Initialize category stats
    Object.keys(INSTRUMENT_CATEGORIES).forEach(cat => {
      stats.byCategory[cat] = { updated: 0, unmatched: 0 };
    });
    
    for (const listing of listings) {
      const instrumentType = findInstrumentType(listing.title, listing.description, listing.category);
      
      if (instrumentType) {
        updates.push({
          id: listing.id,
          instrumentType: instrumentType,
          title: listing.title,
          category: listing.category
        });
        stats.updated++;
        if (stats.byCategory[listing.category]) {
          stats.byCategory[listing.category].updated++;
        }
      } else {
        unmatched.push({
          id: listing.id,
          title: listing.title,
          description: listing.description.substring(0, 100) + '...',
          category: listing.category
        });
        stats.unmatched++;
        if (stats.byCategory[listing.category]) {
          stats.byCategory[listing.category].unmatched++;
        }
      }
    }
    
    // Show preview
    console.log('=== Migration Preview ===\n');
    console.log(`Total listings to process: ${stats.total}`);
    console.log(`Listings with identified instruments: ${stats.updated}`);
    console.log(`Listings without matches: ${stats.unmatched}\n`);
    
    console.log('By Category:');
    Object.entries(stats.byCategory).forEach(([cat, data]) => {
      if (data.updated > 0 || data.unmatched > 0) {
        console.log(`  ${cat}: ${data.updated} matched, ${data.unmatched} unmatched`);
      }
    });
    
    if (updates.length > 0) {
      console.log('\nSample matches (first 10):');
      updates.slice(0, 10).forEach(u => {
        console.log(`  "${u.title}" -> ${u.instrumentType} (${u.category})`);
      });
    }
    
    if (unmatched.length > 0) {
      console.log('\nUnmatched listings (first 10):');
      unmatched.slice(0, 10).forEach(u => {
        console.log(`  [${u.category}] "${u.title}"`);
        console.log(`    ${u.description}`);
      });
    }
    
    // Ask for confirmation
    console.log('\nDo you want to proceed with the migration? (yes/no)');
    
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const answer = await new Promise(resolve => {
      readline.question('', resolve);
    });
    readline.close();
    
    if (answer.toLowerCase() !== 'yes' && answer.toLowerCase() !== 'y') {
      console.log('Migration cancelled.');
      return;
    }
    
    // Perform updates
    console.log('\nPerforming updates...');
    let successCount = 0;
    
    for (const update of updates) {
      try {
        await prisma.listing.update({
          where: { id: update.id },
          data: { instrumentType: update.instrumentType }
        });
        successCount++;
        if (successCount % 10 === 0) {
          process.stdout.write(`\rUpdated ${successCount}/${updates.length} listings...`);
        }
      } catch (error) {
        console.error(`\nError updating listing ${update.id}:`, error.message);
      }
    }
    
    console.log(`\n\nMigration complete! Updated ${successCount} listings.`);
    
    // Write unmatched listings to a file for manual review
    if (unmatched.length > 0) {
      const fs = require('fs');
      const unmatchedFile = 'unmatched-listings.json';
      fs.writeFileSync(unmatchedFile, JSON.stringify(unmatched, null, 2));
      console.log(`\nUnmatched listings saved to ${unmatchedFile} for manual review.`);
    }
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateInstrumentTypes();