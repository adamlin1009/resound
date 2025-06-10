const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Mapping from old categories to new broader categories
const categoryMapping = {
  // Strings
  'Guitar': 'Strings',
  'Violin': 'Strings',
  'Bass': 'Strings',
  'Ukulele': 'Strings',
  
  // Percussion
  'Drums': 'Percussion',
  
  // Woodwinds
  'Saxophone': 'Woodwinds',
  'Flute': 'Woodwinds',
  
  // Brass
  'Trumpet': 'Brass',
  
  // Keyboards
  'Piano': 'Keyboards',
  'Keyboard': 'Keyboards',
  
  // Electronic
  'DJ Equipment': 'Electronic',
  'Amplifier': 'Electronic',
  
  // Recording
  'Microphone': 'Recording',
  'Audio Interface': 'Recording',
  
  // Other remains the same
  'Other': 'Other'
};

async function migrateCategories() {
  try {
    console.log('Starting category migration...');
    
    // Get all listings
    const listings = await prisma.listing.findMany({
      select: {
        id: true,
        category: true,
        title: true
      }
    });
    
    console.log(`Found ${listings.length} listings to migrate`);
    
    let updatedCount = 0;
    
    for (const listing of listings) {
      const oldCategory = listing.category;
      const newCategory = categoryMapping[oldCategory];
      
      if (newCategory && newCategory !== oldCategory) {
        await prisma.listing.update({
          where: { id: listing.id },
          data: { category: newCategory }
        });
        
        console.log(`Updated listing "${listing.title}" from ${oldCategory} to ${newCategory}`);
        updatedCount++;
      } else if (!newCategory) {
        // If no mapping found, try to guess based on title or default to "Other"
        let guessedCategory = 'Other';
        const titleLower = listing.title.toLowerCase();
        
        if (titleLower.includes('guitar') || titleLower.includes('violin') || 
            titleLower.includes('cello') || titleLower.includes('bass')) {
          guessedCategory = 'Strings';
        } else if (titleLower.includes('drum') || titleLower.includes('percussion')) {
          guessedCategory = 'Percussion';
        } else if (titleLower.includes('flute') || titleLower.includes('clarinet') || 
                   titleLower.includes('oboe') || titleLower.includes('saxophone')) {
          guessedCategory = 'Woodwinds';
        } else if (titleLower.includes('trumpet') || titleLower.includes('trombone') || 
                   titleLower.includes('tuba') || titleLower.includes('horn')) {
          guessedCategory = 'Brass';
        } else if (titleLower.includes('piano') || titleLower.includes('keyboard') || 
                   titleLower.includes('synthesizer')) {
          guessedCategory = 'Keyboards';
        }
        
        if (guessedCategory !== listing.category) {
          await prisma.listing.update({
            where: { id: listing.id },
            data: { category: guessedCategory }
          });
          
          console.log(`Updated listing "${listing.title}" from ${oldCategory} to ${guessedCategory} (guessed)`);
          updatedCount++;
        }
      }
    }
    
    console.log(`\nMigration complete! Updated ${updatedCount} listings.`);
    
    // Show category distribution
    const categoryCount = await prisma.listing.groupBy({
      by: ['category'],
      _count: {
        category: true
      }
    });
    
    console.log('\nNew category distribution:');
    categoryCount.forEach(({ category, _count }) => {
      console.log(`${category}: ${_count.category} listings`);
    });
    
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateCategories();