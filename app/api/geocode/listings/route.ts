import { geocodeLocation, buildLocationString } from "@/lib/geocoding";
import prisma from "@/lib/prismadb";
import { NextResponse } from "next/server";

export async function POST() {
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
        let coordinates = null;

        // Try exact address first
        if (listing.exactAddress) {
          coordinates = await geocodeLocation(listing.exactAddress);
        }

        // If that fails, try city/state/zip combination
        if (!coordinates) {
          const fallbackAddress = buildLocationString(
            listing.city || undefined,
            listing.state,
            listing.zipCode || undefined
          );
          coordinates = await geocodeLocation(fallbackAddress);
        }

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
        console.error(`Error geocoding listing ${listing.id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      processed: listings.length,
      geocoded,
      failed,
      message: `Geocoding complete: ${geocoded} successful, ${failed} failed`
    });

  } catch (error) {
    console.error('Bulk geocoding error:', error);
    return NextResponse.json(
      { error: 'Failed to geocode listings' },
      { status: 500 }
    );
  }
}