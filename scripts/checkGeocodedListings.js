const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkGeocodedListings() {
  try {
    const total = await prisma.listing.count();
    const geocoded = await prisma.listing.count({
      where: {
        latitude: { not: null },
        longitude: { not: null }
      }
    });
    
    console.log('Total listings:', total);
    console.log('Geocoded listings:', geocoded);
    console.log('Percentage geocoded:', ((geocoded/total) * 100).toFixed(1) + '%');
    
    // Check a few listings
    const sample = await prisma.listing.findMany({
      take: 10,
      select: {
        title: true,
        city: true,
        state: true,
        latitude: true,
        longitude: true
      }
    });
    
    console.log('\nSample listings:');
    sample.forEach(l => {
      console.log(`- ${l.title} in ${l.city || 'Unknown'}, ${l.state} - Geocoded: ${l.latitude && l.longitude ? 'Yes' : 'No'}`);
    });
    
    // Check listings with missing geocoding
    const notGeocoded = await prisma.listing.count({
      where: {
        OR: [
          { latitude: null },
          { longitude: null }
        ]
      }
    });
    
    if (notGeocoded > 0) {
      console.log(`\n⚠️  ${notGeocoded} listings are not geocoded yet.`);
      console.log('Run: node scripts/geocodeExistingListings.js to geocode them.');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkGeocodedListings();