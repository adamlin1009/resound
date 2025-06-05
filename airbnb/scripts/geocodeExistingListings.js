// One-time script to geocode existing listings
// Usage: node scripts/geocodeExistingListings.js

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function geocodeLocation(address) {
  if (!process.env.GOOGLE_PLACES_API_KEY) {
    console.error('Google Places API key not configured');
    return null;
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_PLACES_API_KEY}`
    );

    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return {
        lat: location.lat,
        lng: location.lng
      };
    }

    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

function buildLocationString(city, state, zipCode) {
  const parts = [];
  if (city) parts.push(city);
  if (state) parts.push(state);
  if (zipCode) parts.push(zipCode);
  parts.push('USA');
  return parts.join(', ');
}

async function geocodeExistingListings() {
  try {
    // Get all listings without coordinates
    const listings = await prisma.listing.findMany({
      where: {
        OR: [
          { latitude: null },
          { longitude: null }
        ]
      },
      select: {
        id: true,
        city: true,
        state: true,
        zipCode: true,
        exactAddress: true
      }
    });

    console.log(`Found ${listings.length} listings to geocode`);

    let geocoded = 0;
    let failed = 0;

    for (const listing of listings) {
      try {
        // Use exact address first, fallback to city/state/zip
        const address = listing.exactAddress || buildLocationString(
          listing.city,
          listing.state,
          listing.zipCode
        );

        console.log(`Geocoding: ${address}`);
        const coordinates = await geocodeLocation(address);

        if (coordinates) {
          await prisma.listing.update({
            where: { id: listing.id },
            data: {
              latitude: coordinates.lat,
              longitude: coordinates.lng
            }
          });
          geocoded++;
          console.log(`✓ Geocoded listing ${listing.id}`);
        } else {
          failed++;
          console.log(`✗ Failed to geocode listing ${listing.id}`);
        }

        // Add delay to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        failed++;
        console.error(`Error geocoding listing ${listing.id}:`, error.message);
      }
    }

    console.log(`\nGeocoding complete:`);
    console.log(`✓ Successfully geocoded: ${geocoded}`);
    console.log(`✗ Failed: ${failed}`);
    console.log(`📍 Total processed: ${listings.length}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

geocodeExistingListings();