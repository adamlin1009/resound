const { MongoClient } = require('mongodb');
require('dotenv').config();

async function inspectListings() {
  const client = new MongoClient(process.env.DATABASE_URL);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('resound');
    const collection = db.collection('Listing');
    
    // Find listings with locationValue field
    const listingsWithLocationValue = await collection.find({ 
      locationValue: { $exists: true } 
    }).toArray();
    
    console.log(`Found ${listingsWithLocationValue.length} listings with locationValue field`);
    
    if (listingsWithLocationValue.length > 0) {
      console.log('Sample listing with locationValue:', listingsWithLocationValue[0]);
      
      // Remove locationValue field from all documents
      const result = await collection.updateMany(
        { locationValue: { $exists: true } },
        { $unset: { locationValue: "" } }
      );
      
      console.log(`Updated ${result.modifiedCount} documents`);
    }
    
    // Also check for any listings with null/undefined required fields
    const problematicListings = await collection.find({
      $or: [
        { locationValue: { $exists: true } },
        { location: { $exists: true } },  // Old field that might exist
        { locationValue: null }
      ]
    }).toArray();
    
    console.log(`Found ${problematicListings.length} listings with location-related issues`);
    
    if (problematicListings.length > 0) {
      // Remove any old location fields
      const cleanupResult = await collection.updateMany(
        {},
        { 
          $unset: { 
            locationValue: "",
            location: ""
          } 
        }
      );
      
      console.log(`Cleaned up ${cleanupResult.modifiedCount} documents`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

inspectListings();