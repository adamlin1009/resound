const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Haversine formula to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 3959; // Radius of the Earth in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance;
}

function toRad(deg) {
  return deg * (Math.PI/180);
}

async function testRadiusSearch() {
  try {
    console.log('Testing radius search functionality...\n');
    
    // First, check that listings have coordinates
    const listingsWithCoords = await prisma.listing.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null }
      },
      select: {
        id: true,
        title: true,
        city: true,
        state: true,
        latitude: true,
        longitude: true
      }
    });
    
    console.log(`Found ${listingsWithCoords.length} listings with coordinates`);
    
    if (listingsWithCoords.length === 0) {
      console.log('❌ No listings have coordinates. Please run: node scripts/geocodeExistingListings.js');
      return;
    }
    
    // Test radius search from New York (40.7128, -74.0060)
    const nyLat = 40.7128;
    const nyLon = -74.0060;
    const radius = 50; // miles
    
    console.log(`\nSearching for listings within ${radius} miles of New York, NY...`);
    
    const nearbyListings = listingsWithCoords.filter(listing => {
      const distance = calculateDistance(
        nyLat, nyLon,
        listing.latitude, listing.longitude
      );
      return distance <= radius;
    });
    
    console.log(`\nFound ${nearbyListings.length} listings within ${radius} miles:`);
    nearbyListings.forEach(listing => {
      const distance = calculateDistance(
        nyLat, nyLon,
        listing.latitude, listing.longitude
      );
      console.log(`- ${listing.title} in ${listing.city}, ${listing.state} (${distance.toFixed(2)} miles)`);
    });
    
    // Test with different cities
    const testCities = [
      { name: 'Los Angeles, CA', lat: 34.0522, lon: -118.2437, radius: 30 },
      { name: 'Chicago, IL', lat: 41.8781, lon: -87.6298, radius: 25 },
      { name: 'San Francisco, CA', lat: 37.7749, lon: -122.4194, radius: 10 }
    ];
    
    for (const city of testCities) {
      console.log(`\n\nSearching within ${city.radius} miles of ${city.name}...`);
      const nearby = listingsWithCoords.filter(listing => {
        const distance = calculateDistance(
          city.lat, city.lon,
          listing.latitude, listing.longitude
        );
        return distance <= city.radius;
      });
      console.log(`Found ${nearby.length} listings`);
    }
    
    console.log('\n✅ Radius search test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testRadiusSearch();