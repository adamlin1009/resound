const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findProblematicListing() {
  try {
    console.log('Searching for listings with address-like data in city field...\n');
    
    // Find listings where city contains "Irvine" 
    const irvineListings = await prisma.listing.findMany({
      where: {
        OR: [
          { city: { contains: 'Irvine' } },
          { exactAddress: { contains: 'Knob Creek' } }
        ]
      },
      select: {
        id: true,
        title: true,
        city: true,
        state: true,
        zipCode: true,
        exactAddress: true
      }
    });
    
    if (irvineListings.length > 0) {
      console.log('Found Irvine/Knob Creek listings:');
      irvineListings.forEach((listing) => {
        console.log(`\nListing ID: ${listing.id}`);
        console.log(`  Title: ${listing.title}`);
        console.log(`  City: ${listing.city}`);
        console.log(`  State: ${listing.state}`);
        console.log(`  ZIP: ${listing.zipCode}`);
        console.log(`  Exact Address: ${listing.exactAddress}`);
        
        if (listing.city && listing.city.includes('Knob Creek')) {
          console.log(`  ⚠️  FOUND IT! City field contains street address!`);
        }
      });
    }
    
    // Also search for any listings where city contains numbers or commas
    const problematicListings = await prisma.listing.findMany({
      where: {
        OR: [
          { city: { contains: ',' } },
          { city: { contains: '0' } },
          { city: { contains: '1' } },
          { city: { contains: '2' } },
          { city: { contains: '3' } },
          { city: { contains: '4' } },
          { city: { contains: '5' } },
          { city: { contains: '6' } },
          { city: { contains: '7' } },
          { city: { contains: '8' } },
          { city: { contains: '9' } }
        ]
      },
      select: {
        id: true,
        title: true,
        city: true,
        state: true
      }
    });
    
    if (problematicListings.length > 0) {
      console.log(`\n\nFound ${problematicListings.length} listings with potential address data in city field:`);
      problematicListings.forEach((listing) => {
        console.log(`  ID: ${listing.id} - City: "${listing.city}"`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findProblematicListing();