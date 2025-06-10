import { geocodeLocation, buildLocationString } from "@/lib/geocoding";
import prisma from "@/lib/prismadb";
import { NextResponse } from "next/server";
import { checkAdminUser } from "@/app/actions/checkAdminUser";

export async function POST() {
  const currentUser = await checkAdminUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
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
        } else {
          failed++;
        }

        // Add delay to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        failed++;
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
    return NextResponse.json(
      { error: 'Failed to geocode listings' },
      { status: 500 }
    );
  }
}