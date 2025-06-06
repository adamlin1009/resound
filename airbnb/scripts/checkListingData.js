const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkListingData() {
  try {
    console.log('Checking listing data...\n');
    
    // Get a few listings to check their data
    const listings = await prisma.listing.findMany({
      take: 5,
      select: {
        id: true,
        title: true,
        city: true,
        state: true,
        zipCode: true,
        exactAddress: true
      }
    });
    
    console.log('Sample listings:');
    listings.forEach((listing, index) => {
      console.log(`\nListing ${index + 1}:`);
      console.log(`  Title: ${listing.title}`);
      console.log(`  City: ${listing.city}`);
      console.log(`  State: ${listing.state}`);
      console.log(`  ZIP: ${listing.zipCode}`);
      console.log(`  Exact Address: ${listing.exactAddress}`);
      
      // Check if city contains address-like content
      if (listing.city && (listing.city.includes(',') || /\d/.test(listing.city))) {
        console.log(`  ⚠️  WARNING: City field may contain address data!`);
      }
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkListingData();