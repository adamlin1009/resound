import prisma from "@/lib/prismadb";
import { safeListing, SafeUser } from "@/types";

interface IParams {
  listingId?: string;
}

export default async function getListingById(params: IParams) {
  try {
    const { listingId } = params;

    if (!listingId) {
      console.error("getListingById: listingId is missing", params);
      return null;
    }

    const listing = await prisma.listing.findUnique({
      where: {
        id: listingId,
      },
      include: {
        user: true,
      },
    });

    if (!listing || !listing.user) {
      console.warn("getListingById: Listing or listing user not found for ID:", listingId, { listingExists: !!listing, userExists: !!listing?.user });
      return null;
    }

    const safeUser: SafeUser = {
      ...listing.user,
      createdAt: listing.user.createdAt.toString(),
      updatedAt: listing.user.updatedAt.toString(),
      emailVerified: listing.user.emailVerified?.toString() || null,
    };

    const hydratedListing: safeListing & { user: SafeUser } = {
      id: listing.id,
      title: listing.title,
      description: listing.description,
      imageSrc: listing.imageSrc,
      createdAt: listing.createdAt.toString(),
      category: listing.category,
      conditionRating: listing.conditionRating,
      experienceLevel: listing.experienceLevel,
      locationValue: listing.locationValue,
      userId: listing.userId,
      price: listing.price,
      user: safeUser,
    };

    return hydratedListing;
  } catch (error: any) {
    console.error("Error in getListingById for params:", params, error);
    return null;
  }
}
