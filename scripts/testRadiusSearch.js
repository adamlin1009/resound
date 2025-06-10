// Test script to verify radius search is working
const { default: getListings } = require('../app/actions/getListings.ts');

async function testRadiusSearch() {
  try {
    console.log('Testing radius search...');
    
    // Test 1: Search within 50 miles of Los Angeles
    console.log('\n1. Testing 50-mile radius around Los Angeles, CA:');
    const laResults = await getListings({
      city: 'Los Angeles',
      state: 'CA',
      radius: 50
    });
    console.log(`Found ${laResults.listings.length} listings within 50 miles of LA`);
    
    // Test 2: Search within 25 miles of New York
    console.log('\n2. Testing 25-mile radius around New York, NY:');
    const nyResults = await getListings({
      city: 'New York',
      state: 'NY', 
      radius: 25
    });
    console.log(`Found ${nyResults.listings.length} listings within 25 miles of NYC`);
    
    // Test 3: Nationwide search
    console.log('\n3. Testing nationwide search:');
    const nationwideResults = await getListings({
      nationwide: true
    });
    console.log(`Found ${nationwideResults.listings.length} listings nationwide`);
    
    // Test 4: Search with very small radius (should find fewer)
    console.log('\n4. Testing 5-mile radius around San Francisco, CA:');
    const sfResults = await getListings({
      city: 'San Francisco',
      state: 'CA',
      radius: 5
    });
    console.log(`Found ${sfResults.listings.length} listings within 5 miles of SF`);
    
    console.log('\n✅ Radius search test completed successfully!');
    
  } catch (error) {
    console.error('❌ Radius search test failed:', error);
  }
}

testRadiusSearch();