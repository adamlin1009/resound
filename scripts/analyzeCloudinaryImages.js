const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function analyzeCloudinaryImages() {
  try {
    console.log('🔍 Analyzing Cloudinary image usage in the database...\n');

    // Cloudinary URL patterns
    const cloudinaryPatterns = [
      /https?:\/\/res\.cloudinary\.com\//i,
      /cloudinary\.com\//i,
      /cloudinary\//i
    ];

    // Check Listings
    console.log('📋 Checking Listings...');
    const listings = await prisma.listing.findMany({
      select: {
        id: true,
        title: true,
        imageSrc: true,
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    });

    let listingsWithCloudinary = 0;
    let totalCloudinaryImages = 0;
    const cloudinaryListings = [];

    for (const listing of listings) {
      const cloudinaryImages = listing.imageSrc.filter(url => 
        cloudinaryPatterns.some(pattern => pattern.test(url))
      );

      if (cloudinaryImages.length > 0) {
        listingsWithCloudinary++;
        totalCloudinaryImages += cloudinaryImages.length;
        cloudinaryListings.push({
          id: listing.id,
          title: listing.title,
          owner: listing.user.email || listing.user.name,
          cloudinaryImages: cloudinaryImages.length,
          totalImages: listing.imageSrc.length,
          images: cloudinaryImages
        });
      }
    }

    console.log(`- Total listings: ${listings.length}`);
    console.log(`- Listings with Cloudinary images: ${listingsWithCloudinary}`);
    console.log(`- Total Cloudinary images in listings: ${totalCloudinaryImages}`);

    // Check User Profile Images
    console.log('\n👤 Checking User Profile Images...');
    const users = await prisma.user.findMany({
      where: {
        image: {
          not: null
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true
      }
    });

    let usersWithCloudinary = 0;
    const cloudinaryUsers = [];

    for (const user of users) {
      if (user.image && cloudinaryPatterns.some(pattern => pattern.test(user.image))) {
        usersWithCloudinary++;
        cloudinaryUsers.push({
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image
        });
      }
    }

    console.log(`- Total users with profile images: ${users.length}`);
    console.log(`- Users with Cloudinary profile images: ${usersWithCloudinary}`);

    // Summary
    console.log('\n📊 Summary:');
    console.log('='.repeat(50));
    console.log(`Total Cloudinary images found: ${totalCloudinaryImages + usersWithCloudinary}`);
    console.log(`- In listings: ${totalCloudinaryImages}`);
    console.log(`- In user profiles: ${usersWithCloudinary}`);

    // Detailed report
    if (cloudinaryListings.length > 0) {
      console.log('\n📸 Listings with Cloudinary images:');
      console.log('-'.repeat(50));
      for (const listing of cloudinaryListings) {
        console.log(`\nListing: ${listing.title}`);
        console.log(`ID: ${listing.id}`);
        console.log(`Owner: ${listing.owner}`);
        console.log(`Cloudinary images: ${listing.cloudinaryImages}/${listing.totalImages}`);
        listing.images.forEach((img, index) => {
          console.log(`  ${index + 1}. ${img.substring(0, 80)}...`);
        });
      }
    }

    if (cloudinaryUsers.length > 0) {
      console.log('\n👤 Users with Cloudinary profile images:');
      console.log('-'.repeat(50));
      for (const user of cloudinaryUsers) {
        console.log(`\nUser: ${user.name || user.email}`);
        console.log(`ID: ${user.id}`);
        console.log(`Image: ${user.image.substring(0, 80)}...`);
      }
    }

    // Check for Uploadthing URLs
    console.log('\n🔍 Checking for Uploadthing URLs...');
    const uploadthingPattern = /uploadthing|utfs\.io/i;
    
    const listingsWithUploadthing = listings.filter(listing => 
      listing.imageSrc.some(url => uploadthingPattern.test(url))
    ).length;

    const usersWithUploadthing = users.filter(user => 
      user.image && uploadthingPattern.test(user.image)
    ).length;

    console.log(`- Listings with Uploadthing images: ${listingsWithUploadthing}`);
    console.log(`- Users with Uploadthing profile images: ${usersWithUploadthing}`);

    // Migration recommendation
    console.log('\n💡 Migration Recommendations:');
    console.log('='.repeat(50));
    
    if (totalCloudinaryImages + usersWithCloudinary === 0) {
      console.log('✅ No Cloudinary images found! You can safely remove Cloudinary dependencies.');
    } else {
      console.log(`⚠️  Found ${totalCloudinaryImages + usersWithCloudinary} Cloudinary images that need attention.`);
      console.log('\nOptions:');
      console.log('1. Keep existing Cloudinary images (simplest - they will continue to work)');
      console.log('2. Download and re-upload to Uploadthing (requires download/upload script)');
      console.log('3. Manually update through the UI (best for small numbers)');
      
      const estimatedCost = ((totalCloudinaryImages + usersWithCloudinary) * 0.1).toFixed(2);
      console.log(`\nEstimated monthly Cloudinary cost for these images: ~$${estimatedCost}`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the analysis
analyzeCloudinaryImages();