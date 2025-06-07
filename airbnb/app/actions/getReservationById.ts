import prisma from "@/lib/prismadb";
import getCurrentUser from "./getCurrentUser";
import { SafeReservation } from "@/types";

interface IParams {
  reservationId?: string;
}

type ReservationWithAuthInfo = SafeReservation & {
  isRenter: boolean;
  isOwner: boolean;
};

export default async function getReservationById(params: IParams): Promise<ReservationWithAuthInfo | null> {
  try {
    const { reservationId } = params;
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return null;
    }

    if (!reservationId) {
      return null;
    }

    const reservation = await prisma.reservation.findUnique({
      where: {
        id: reservationId,
      },
      include: {
        user: true,
        listing: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!reservation) {
      return null;
    }

    // Check if current user is either the renter or the owner
    const isRenter = reservation.userId === currentUser.id;
    const isOwner = reservation.listing.userId === currentUser.id;

    if (!isRenter && !isOwner) {
      return null; // User not authorized to view this reservation
    }

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
      listing: {
        ...reservation.listing,
        createdAt: reservation.listing.createdAt.toISOString(),
        user: {
          ...reservation.listing.user,
          createdAt: reservation.listing.user.createdAt.toISOString(),
          updatedAt: reservation.listing.user.updatedAt.toISOString(),
          emailVerified: reservation.listing.user.emailVerified?.toISOString() || null,
        },
      },
      user: {
        ...reservation.user,
        createdAt: reservation.user.createdAt.toISOString(),
        updatedAt: reservation.user.updatedAt.toISOString(),
        emailVerified: reservation.user.emailVerified?.toISOString() || null,
      },
      isRenter,
      isOwner,
    };
  } catch (error: any) {
    throw new Error(error);
  }
}