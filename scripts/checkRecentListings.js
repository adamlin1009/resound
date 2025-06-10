const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRecentListings() {
  const recentListings = await prisma.listing.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      title: true,
      city: true,
      state: true,
      exactAddress: true,
      latitude: true,
      longitude: true,
      createdAt: true
    }
  });
  
  console.log('Recent listings:');
  recentListings.forEach((listing, i) => {
    console.log(`\n${i + 1}. ${listing.title}`);
    console.log(`   Created: ${listing.createdAt}`);
    console.log(`   Location: ${listing.city}, ${listing.state}`);
    console.log(`   Address: ${listing.exactAddress}`);
    console.log(`   Coordinates: ${listing.latitude ? `${listing.latitude}, ${listing.longitude}` : 'NOT GEOCODED'}`);
  });
  
  await prisma.$disconnect();
}

checkRecentListings();