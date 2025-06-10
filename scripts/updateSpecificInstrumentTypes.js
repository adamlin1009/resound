const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Manual mappings for specific listings that couldn't be automatically matched
const MANUAL_MAPPINGS = [
  {
    id: "6847d7f77481486f41426d72",
    instrumentType: "Violin", // Bellafontana is likely a violin maker
    reason: "Bellafontana appears to be a violin maker name"
  }
  // Add more manual mappings here as needed
];

async function updateSpecificInstrumentTypes() {
  console.log('Updating specific instrument types...\n');
  
  try {
    for (const mapping of MANUAL_MAPPINGS) {
      const listing = await prisma.listing.findUnique({
        where: { id: mapping.id },
        select: { title: true, category: true, instrumentType: true }
      });
      
      if (!listing) {
        console.log(`Listing ${mapping.id} not found`);
        continue;
      }
      
      if (listing.instrumentType) {
        console.log(`Listing "${listing.title}" already has instrument type: ${listing.instrumentType}`);
        continue;
      }
      
      await prisma.listing.update({
        where: { id: mapping.id },
        data: { instrumentType: mapping.instrumentType }
      });
      
      console.log(`Updated "${listing.title}" to ${mapping.instrumentType} (${mapping.reason})`);
    }
    
    // Also check if there are any remaining listings without instrument type
    const remaining = await prisma.listing.count({
      where: { instrumentType: null }
    });
    
    if (remaining > 0) {
      console.log(`\nNote: There are still ${remaining} listings without instrument type.`);
      const samples = await prisma.listing.findMany({
        where: { instrumentType: null },
        take: 5,
        select: { id: true, title: true, category: true }
      });
      console.log('\nRemaining unmatched listings:');
      samples.forEach(s => {
        console.log(`- [${s.category}] "${s.title}" (ID: ${s.id})`);
      });
    } else {
      console.log('\nAll listings now have instrument types!');
    }
    
  } catch (error) {
    console.error('Error updating listings:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update
updateSpecificInstrumentTypes();