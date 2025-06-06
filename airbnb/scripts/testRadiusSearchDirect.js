const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Haversine formula to calculate distance between two points
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function toRad(deg) {
  return deg * (Math.PI/180);
}

async function testRadiusSearch() {
  try {
    console.log('Testing radius search directly...\n');
    
    // Test location: Los Angeles
    const testLat = 34.0522;
    const testLng = -118.2437;
    const radius = 50; // miles
    
    console.log(`Test location: Los Angeles (${testLat}, ${testLng})`);
    console.log(`Search radius: ${radius} miles\n`);
    
    // Get all listings with coordinates
    const allListings = await prisma.listing.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null }
      }
    });
    
    console.log(`Total listings with coordinates: ${allListings.length}`);
    
    // Filter by radius
    const nearbyListings = allListings.filter(listing => {
      const distance = calculateDistance(
        testLat, testLng,
        listing.latitude, listing.longitude
      );
      return distance <= radius;
    });
    
    console.log(`\nListings within ${radius} miles: ${nearbyListings.length}`);
    
    // Show a few examples
    console.log('\nNearest listings:');
    nearbyListings
      .map(listing => ({
        ...listing,
        distance: calculateDistance(
          testLat, testLng,
          listing.latitude, listing.longitude
        )
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5)
      .forEach(listing => {
        console.log(`- ${listing.title} in ${listing.city}, ${listing.state} (${listing.distance.toFixed(1)} miles)`);
      });
    
    // Test with different radii
    console.log('\n\nTesting different search radii:');
    const radii = [10, 25, 50, 100, 500];
    for (const r of radii) {
      const count = allListings.filter(listing => {
        const distance = calculateDistance(
          testLat, testLng,
          listing.latitude, listing.longitude
        );
        return distance <= r;
      }).length;
      console.log(`- Within ${r} miles: ${count} listings`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testRadiusSearch();