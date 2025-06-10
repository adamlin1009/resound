const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyMigration() {
  const stats = await prisma.listing.groupBy({
    by: ['category'],
    _count: true
  });
  
  const withType = await prisma.listing.groupBy({
    by: ['category', 'instrumentType'],
    _count: true,
    orderBy: [
      { category: 'asc' },
      { instrumentType: 'asc' }
    ]
  });
  
  console.log('=== Migration Summary ===\n');
  console.log('Total listings by category:');
  stats.forEach(s => console.log(`${s.category}: ${s._count}`));
  
  console.log('\n=== Instrument Types by Category ===');
  let currentCategory = '';
  withType.forEach(item => {
    if (item.category !== currentCategory) {
      currentCategory = item.category;
      console.log(`\n${currentCategory}:`);
    }
    console.log(`  ${item.instrumentType}: ${item._count}`);
  });
  
  // Check for any null instrument types
  const nullCount = await prisma.listing.count({
    where: { instrumentType: null }
  });
  
  console.log(`\n=== Status ===`);
  console.log(`Listings without instrument type: ${nullCount}`);
  
  if (nullCount === 0) {
    console.log('\n✅ All listings have been successfully categorized with specific instrument types!');
  }
  
  await prisma.$disconnect();
}

verifyMigration();