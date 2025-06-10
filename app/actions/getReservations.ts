import prisma from "@/lib/prismadb";
import getCurrentUser from "./getCurrentUser";
import { SafeReservation, safeListing, SafeUser } from "@/types";
import { Prisma } from "@prisma/client";

interface IParams {
  listingId?: string;
  userId?: string;
  authorId?: string;
  page?: number;
  limit?: number;
}

export interface IReservationsResponse {
  reservations: SafeReservation[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default async function getReservations(params: IParams): Promise<IReservationsResponse> {
  try {
    // Pagination defaults
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 50)); // Default 50, max 100
    const skip = (page - 1) * limit;
    
    const currentUser = await getCurrentUser();
    
    // If no user is logged in, return empty response
    if (!currentUser) {
      return {
        reservations: [],
        totalCount: 0,
        page,
        limit,
        totalPages: 0,
      };
    }

    const { listingId, userId, authorId } = params;
    const query: Prisma.ReservationWhereInput = {};

    // Build query based on user permissions
    if (listingId) {
      query.listingId = listingId;
    }
    
    if (userId) {
      // Only allow users to query their own reservations unless they're admin
      if (userId !== currentUser.id && !currentUser.isAdmin) {
        return {
          reservations: [],
          totalCount: 0,
          page,
          limit,
          totalPages: 0,
        };
      }
      query.userId = userId;
    }
    
    if (authorId) {
      // Only allow authors to query their own listings' reservations unless they're admin
      if (authorId !== currentUser.id && !currentUser.isAdmin) {
        return {
          reservations: [],
          totalCount: 0,
          page,
          limit,
          totalPages: 0,
        };
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
    let whereClause: Prisma.ReservationWhereInput = {};
    
    if (authorId) {
      // For incoming rentals (where current user is the listing owner)
      whereClause = {
        listing: {
          is: {
            userId: authorId
          }
        }
      };
    } else {
      // For other queries, use the query as is
      // The listing relation will be loaded by the include statement
      whereClause = query;
    }

    // Get total count for pagination
    const totalCount = await prisma.reservation.count({
      where: whereClause,
    });

    const reservations = await prisma.reservation.findMany({
      where: whereClause,
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            description: true,
            imageSrc: true,
            category: true,
            instrumentType: true,
            experienceLevel: true,
            city: true,
            state: true,
            zipCode: true,
            userId: true,
            price: true,
            createdAt: true,
            pickupStartTime: true,
            pickupEndTime: true,
            returnStartTime: true,
            returnEndTime: true,
            availableDays: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                emailVerified: true,
                image: true,
                isAdmin: true,
                createdAt: true,
                updatedAt: true,
                favoriteIds: true,
                experienceLevel: true,
                preferredInstruments: true,
                bio: true,
              }
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            emailVerified: true,
            image: true,
            isAdmin: true,
            createdAt: true,
            updatedAt: true,
            favoriteIds: true,
            experienceLevel: true,
            preferredInstruments: true,
            bio: true,
          }
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: skip,
      take: limit,
    });

    if (!reservations) {
      return {
        reservations: [],
        totalCount: 0,
        page,
        limit,
        totalPages: 0,
      };
    }

    // Don't filter out canceled reservations - we'll show them greyed out
    const safeReservations: SafeReservation[] = reservations.map(
      (reservation) => {
        // TypeScript properly infers the type from Prisma select
        const rListing = reservation.listing;
        
        const mappedListing: safeListing & { user: SafeUser } = {
          id: rListing.id,
          title: rListing.title,
          description: rListing.description,
          imageSrc: rListing.imageSrc,
          createdAt: rListing.createdAt.toISOString(),
          category: rListing.category,
          instrumentType: rListing.instrumentType,
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

    const totalPages = Math.ceil(totalCount / limit);

    return {
      reservations: safeReservations,
      totalCount,
      page,
      limit,
      totalPages,
    };
  } catch (error) {
    return {
      reservations: [],
      totalCount: 0,
      page: params.page || 1,
      limit: params.limit || 50,
      totalPages: 0,
    };
  }
}
