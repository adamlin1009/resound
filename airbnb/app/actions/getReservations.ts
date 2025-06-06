import prisma from "@/lib/prismadb";
import getCurrentUser from "./getCurrentUser";
import { SafeReservation, safeListing, SafeUser } from "@/types";
// import { Listing } from "@prisma/client"; // No longer strictly needed with `as any`

interface IParams {
  listingId?: string;
  userId?: string;
  authorId?: string;
}

export default async function getReservation(params: IParams) {
  try {
    const currentUser = await getCurrentUser();
    
    // If no user is logged in, return empty array
    if (!currentUser) {
      return [];
    }

    const { listingId, userId, authorId } = params;
    const query: any = {};

    // Build query based on user permissions
    if (listingId) {
      query.listingId = listingId;
    }
    
    if (userId) {
      // Only allow users to query their own reservations unless they're admin
      if (userId !== currentUser.id && !currentUser.isAdmin) {
        return [];
      }
      query.userId = userId;
    }
    
    if (authorId) {
      // Only allow authors to query their own listings' reservations unless they're admin
      if (authorId !== currentUser.id && !currentUser.isAdmin) {
        return [];
      }
      // Don't set query.listing here - it will be handled in whereClause construction
    }

    // If no specific query params, return user's own reservations
    if (!listingId && !userId && !authorId) {
      query.OR = [
        { userId: currentUser.id },
        { listing: { is: { userId: currentUser.id } } }
      ];
    }

    // Show all reservations except canceled ones
    // Don't filter by status for now due to enum issues

    // Handle the query differently based on the type
    let whereClause: any = {};
    
    if (authorId) {
      // For incoming rentals (where current user is the listing owner)
      whereClause = {
        listing: {
          is: {
            userId: authorId
          }
        }
      };
    } else if (query.listing) {
      // If query already has listing conditions
      whereClause = {
        ...query,
        listing: {
          ...query.listing,
          isNot: null
        }
      };
    } else {
      // For other queries
      whereClause = {
        ...query,
        listing: {
          isNot: null
        }
      };
    }

    const reservations = await prisma.reservation.findMany({
      where: whereClause,
      include: {
        listing: {
          include: {
            user: true,
          },
        },
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!reservations) {
      console.warn("getReservation: No reservations found for params:", params);
      return [];
    }

    // Don't filter out canceled reservations - we'll show them greyed out
    const safeReservations: SafeReservation[] = reservations.map(
      (reservation) => {
        // Using `as any` as a workaround for persistent TypeScript errors
        // This assumes experienceLevel is present at runtime.
        const rListing: any = reservation.listing;
        
        const mappedListing: safeListing & { user: SafeUser } = {
          id: rListing.id,
          title: rListing.title,
          description: rListing.description,
          imageSrc: rListing.imageSrc,
          createdAt: rListing.createdAt.toISOString(),
          category: rListing.category,
          experienceLevel: rListing.experienceLevel,
          city: rListing.city,
          state: rListing.state,
          zipCode: rListing.zipCode,
          userId: rListing.userId,
          price: rListing.price,
          pickupStartTime: rListing.pickupStartTime,
          pickupEndTime: rListing.pickupEndTime,
          returnStartTime: rListing.returnStartTime,
          returnEndTime: rListing.returnEndTime,
          availableDays: rListing.availableDays,
          user: {
            ...rListing.user,
            createdAt: rListing.user.createdAt.toISOString(),
            updatedAt: rListing.user.updatedAt.toISOString(),
            emailVerified: rListing.user.emailVerified?.toISOString() || null,
          },
        };

        const safeUser: SafeUser = {
          ...reservation.user,
          createdAt: reservation.user.createdAt.toISOString(),
          updatedAt: reservation.user.updatedAt.toISOString(),
          emailVerified: reservation.user.emailVerified?.toISOString() || null,
        };

        return {
          ...reservation,
          createdAt: reservation.createdAt.toISOString(),
          startDate: reservation.startDate.toISOString(),
          endDate: reservation.endDate.toISOString(),
          canceledAt: reservation.canceledAt?.toISOString() || null,
          pickupStartTime: reservation.pickupStartTime?.toISOString() || null,
          pickupEndTime: reservation.pickupEndTime?.toISOString() || null,
          pickupConfirmedAt: reservation.pickupConfirmedAt?.toISOString() || null,
          returnDeadline: reservation.returnDeadline?.toISOString() || null,
          returnStartTime: reservation.returnStartTime?.toISOString() || null,
          returnEndTime: reservation.returnEndTime?.toISOString() || null,
          returnConfirmedAt: reservation.returnConfirmedAt?.toISOString() || null,
          listing: mappedListing,
          user: safeUser,
        };
      }
    );

    return safeReservations;
  } catch (error: any) {
    console.error("Error in getReservation for params:", params, error);
    return [];
  }
}
