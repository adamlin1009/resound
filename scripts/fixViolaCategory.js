const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixViolaCategory() {
  try {
    console.log('Fixing viola categories...');
    
    // Update all violas to Strings category
    const result = await prisma.listing.updateMany({
      where: {
        OR: [
          { title: { contains: 'Viola', mode: 'insensitive' } },
          { description: { contains: 'Viola', mode: 'insensitive' } }
        ]
      },
      data: {
        category: 'Strings'
      }
    });
    
    console.log(`Updated ${result.count} viola listings to Strings category`);
    
  } catch (error) {
    console.error('Error updating viola categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixViolaCategory();