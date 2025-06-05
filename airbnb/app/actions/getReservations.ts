import prisma from "@/lib/prismadb";
import { SafeReservation, safeListing } from "@/types";
// import { Listing } from "@prisma/client"; // No longer strictly needed with `as any`

interface IParams {
  listingId?: string;
  userId?: string;
  authorId?: string;
}

export default async function getReservation(params: IParams) {
  try {
    const { listingId, userId, authorId } = params;
    const query: any = {};

    if (listingId) query.listingId = listingId;
    if (userId) query.userId = userId;
    if (authorId) query.listing = { userId: authorId };

    const reservations = await prisma.reservation.findMany({
      where: query,
      include: {
        listing: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!reservations) {
      console.warn("getReservation: No reservations found for params:", params);
      return [];
    }

    const safeReservations: SafeReservation[] = reservations.map(
      (reservation) => {
        // Using `as any` as a workaround for persistent TypeScript errors
        // This assumes conditionRating and experienceLevel are present at runtime.
        const rListing: any = reservation.listing;
        
        const mappedListing: safeListing = {
          id: rListing.id,
          title: rListing.title,
          description: rListing.description,
          imageSrc: rListing.imageSrc,
          createdAt: rListing.createdAt.toISOString(),
          category: rListing.category,
          conditionRating: rListing.conditionRating,
          experienceLevel: rListing.experienceLevel,
          city: rListing.city,
          state: rListing.state,
          zipCode: rListing.zipCode,
          userId: rListing.userId,
          price: rListing.price,
        };

        return {
          ...reservation,
          createdAt: reservation.createdAt.toISOString(),
          startDate: reservation.startDate.toISOString(),
          endDate: reservation.endDate.toISOString(),
          listing: mappedListing,
        };
      }
    );

    return safeReservations;
  } catch (error: any) {
    console.error("Error in getReservation for params:", params, error);
    return [];
  }
}
