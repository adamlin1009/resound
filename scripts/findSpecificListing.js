const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findListing() {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: '684289bff96248480b5c2712' },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });
    
    if (listing) {
      console.log('Full Listing Details:');
      console.log('==========================================');
      console.log('ID:', listing.id);
      console.log('Title:', listing.title);
      console.log('Description:', listing.description);
      console.log('Category:', listing.category);
      console.log('Price: $' + listing.price + ' per day');
      console.log('Experience Level:', listing.experienceLevel);
      console.log('Condition Rating:', listing.conditionRating);
      console.log('City:', listing.city);
      console.log('State:', listing.state);
      console.log('ZIP:', listing.zipCode);
      console.log('Exact Address:', listing.exactAddress);
      console.log('Location:', listing.location);
      console.log('Coordinates:', listing.latitude + ', ' + listing.longitude);
      console.log('Available:', listing.available);
      console.log('Owner:', listing.user.name, '(' + listing.user.email + ')');
      console.log('Created:', listing.createdAt);
      console.log('==========================================');
    } else {
      console.log('Listing not found');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findListing();
