const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function searchListings() {
  try {
    // Search by title
    const byTitle = await prisma.listing.findMany({
      where: { 
        title: { 
          contains: 'fdsfs',
          mode: 'insensitive'
        }
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });
    
    console.log('Listings with "fdsfs" in title:', byTitle.length);
    if (byTitle.length > 0) {
      byTitle.forEach(listing => {
        console.log('\nListing Details:');
        console.log('==========================================');
        console.log('ID:', listing.id);
        console.log('Title:', listing.title);
        console.log('City:', listing.city);
        console.log('State:', listing.state);
        console.log('ZIP:', listing.zipCode);
        console.log('Exact Address:', listing.exactAddress);
        console.log('Location:', listing.location);
        console.log('Coordinates:', listing.latitude + ', ' + listing.longitude);
        console.log('==========================================');
      });
    }
    
    // Also try to find by ID
    const byId = await prisma.listing.findUnique({
      where: { id: '684289bff96248480b5c2712' }
    });
    
    if (byId) {
      console.log('\nFound by ID:');
      console.log('ID:', byId.id);
      console.log('Title:', byId.title);
    } else {
      console.log('\nNo listing found with ID: 684289bff96248480b5c2712');
    }
    
    // Get a sample of actual listings to see structure
    const sampleListings = await prisma.listing.findMany({
      take: 3
    });
    
    console.log('\nSample listings from database:');
    sampleListings.forEach((listing, index) => {
      console.log(`\n${index + 1}. ${listing.title}`);
      console.log('   ID:', listing.id);
      console.log('   City:', listing.city);
      console.log('   State:', listing.state);
      console.log('   ZIP:', listing.zipCode);
      console.log('   Exact Address:', listing.exactAddress);
      console.log('   Location:', listing.location);
      console.log('   Coordinates:', listing.latitude, listing.longitude);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

searchListings();