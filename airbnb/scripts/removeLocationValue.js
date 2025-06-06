const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function removeLocationValue() {
  try {
    console.log('Removing locationValue field from listings...');
    
    // Get all listings
    const listings = await prisma.$runCommandRaw({
      find: 'Listing',
      filter: { locationValue: { $exists: true } }
    });

    console.log(`Found ${listings.cursor.firstBatch.length} listings with locationValue field`);

    // Remove locationValue field from all listings
    const result = await prisma.$runCommandRaw({
      update: 'Listing',
      updates: [
        {
          q: { locationValue: { $exists: true } },
          u: { $unset: { locationValue: "" } },
          multi: true
        }
      ]
    });

    console.log('Result:', result);
    console.log('Successfully removed locationValue field from all listings');

  } catch (error) {
    console.error('Error removing locationValue:', error);
  } finally {
    await prisma.$disconnect();
  }
}

removeLocationValue();