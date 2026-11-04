import prisma from "@/lib/prismadb";
import { safeListingWithAddress } from "@/types";
import { getDemoListingWithAddress, isDemoMode } from "@/lib/demoData";

export default async function getListingWithAddress(listingId: string): Promise<safeListingWithAddress | null> {
  try {
    if (isDemoMode()) {
      return getDemoListingWithAddress(listingId);
    }

    const listing = await prisma.listing.findUnique({
      where: {
        id: listingId,
      },
    });

    if (!listing) {
      return null;
    }

    return {
      ...listing,
      createdAt: listing.createdAt.toISOString(),
      experienceLevel: listing.experienceLevel,
    };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Unknown error');
  }
}
