import prisma from "@/lib/prismadb";
import { safeListing, SafeUser } from "@/types";

interface IParams {
  listingId?: string;
}

export default async function getListingById(params: IParams): Promise<(safeListing & { user: SafeUser }) | null> {
  try {
    const { listingId } = params;

    if (!listingId) {
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
      experienceLevel: listing.experienceLevel,
      city: listing.city,
      state: listing.state,
      zipCode: listing.zipCode,
      userId: listing.userId,
      price: listing.price,
      pickupStartTime: listing.pickupStartTime,
      pickupEndTime: listing.pickupEndTime,
      returnStartTime: listing.returnStartTime,
      returnEndTime: listing.returnEndTime,
      availableDays: listing.availableDays,
      user: safeUser,
    };

    return hydratedListing;
  } catch (error) {
    return null;
  }
}
