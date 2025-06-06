import prisma from "@/lib/prismadb";
import { safeListingWithAddress } from "@/types";

export default async function getListingWithAddress(listingId: string): Promise<safeListingWithAddress | null> {
  try {
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
  } catch (error: any) {
    console.error("Error fetching listing with address:", error);
    throw new Error(error.message);
  }
}