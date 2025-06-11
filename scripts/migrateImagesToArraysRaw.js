const { MongoClient } = require('mongodb');
require('dotenv').config();

async function migrateImagesToArrays() {
  const uri = process.env.DATABASE_URL;
  
  if (!uri) {
    throw new Error('DATABASE_URL not found in environment variables');
  }

  const client = new MongoClient(uri);

  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    
    // Extract database name from connection string
    const dbName = uri.split('/').pop().split('?')[0];
    const database = client.db(dbName);
    const collection = database.collection('Listing');

    console.log(`Connected to database: ${dbName}`);
    console.log('Starting image migration from String to String[]...\n');

    // Count total listings
    const totalCount = await collection.countDocuments();
    console.log(`Found ${totalCount} total listings`);

    // First, let's analyze the current data
    const listings = await collection.find({}, { projection: { _id: 1, imageSrc: 1, title: 1 } }).toArray();
    
    let emptyImages = 0;
    let stringImages = 0;
    let arrayImages = 0;
    let otherTypes = 0;

    console.log('\n=== Current Data Analysis ===');
    for (const listing of listings) {
      if (!listing.imageSrc || listing.imageSrc === '') {
        emptyImages++;
        console.log(`- "${listing.title}" (${listing._id}): No image`);
      } else if (typeof listing.imageSrc === 'string') {
        stringImages++;
        console.log(`- "${listing.title}" (${listing._id}): String image`);
      } else if (Array.isArray(listing.imageSrc)) {
        arrayImages++;
        console.log(`- "${listing.title}" (${listing._id}): Already an array`);
      } else {
        otherTypes++;
        console.log(`⚠️  "${listing.title}" (${listing._id}): Unknown type: ${typeof listing.imageSrc}`);
      }
    }

    console.log('\n=== Summary ===');
    console.log(`Total listings: ${totalCount}`);
    console.log(`String images to migrate: ${stringImages}`);
    console.log(`Empty images: ${emptyImages}`);
    console.log(`Already arrays: ${arrayImages}`);
    console.log(`Other types: ${otherTypes}`);

    // Ask for confirmation
    console.log('\n=== Migration Plan ===');
    console.log('This script will:');
    console.log(`1. Convert ${stringImages} string images to arrays`);
    console.log(`2. Convert ${emptyImages} empty/null images to empty arrays`);
    console.log(`3. Skip ${arrayImages} listings that already have arrays`);
    
    console.log('\nTo proceed with the migration:');
    console.log('1. Make sure you have a database backup');
    console.log('2. Run: node scripts/performImageMigration.js');
    
    // Create the actual migration script
    const fs = require('fs');
    const migrationScript = `const { MongoClient } = require('mongodb');
require('dotenv').config();

async function performMigration() {
  const uri = process.env.DATABASE_URL;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const dbName = uri.split('/').pop().split('?')[0];
    const database = client.db(dbName);
    const collection = database.collection('Listing');

    console.log('Starting migration...');
    
    // Update listings with string imageSrc to array
    const stringToArrayResult = await collection.updateMany(
      { imageSrc: { $type: 'string' } },
      [{ $set: { imageSrc: { $cond: [{ $eq: ['$imageSrc', ''] }, [], ['$imageSrc']] } } }]
    );
    
    console.log(\`✓ Converted \${stringToArrayResult.modifiedCount} string images to arrays\`);
    
    // Update listings with null/undefined imageSrc to empty array
    const nullToArrayResult = await collection.updateMany(
      { $or: [{ imageSrc: null }, { imageSrc: { $exists: false } }] },
      { $set: { imageSrc: [] } }
    );
    
    console.log(\`✓ Converted \${nullToArrayResult.modifiedCount} null/empty images to empty arrays\`);
    
    console.log('\\nMigration completed successfully!');
    
    // Verify the results
    const verifyCount = await collection.countDocuments({ imageSrc: { $type: 'array' } });
    console.log(\`\\nVerification: \${verifyCount} listings now have array imageSrc\`);
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await client.close();
  }
}

performMigration().catch(console.error);
`;

    fs.writeFileSync('./scripts/performImageMigration.js', migrationScript);
    console.log('\n✓ Migration script created at: ./scripts/performImageMigration.js');

  } catch (error) {
    console.error('Error:', error);
    throw error;
  } finally {
    await client.close();
  }
}

// Run the analysis
migrateImagesToArrays()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });