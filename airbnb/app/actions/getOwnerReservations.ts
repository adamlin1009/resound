import prisma from "@/lib/prismadb";
import getCurrentUser from "./getCurrentUser";

export default async function getOwnerReservations() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return {
        reservations: [],
        pendingSetups: 0,
      };
    }

    // Get all reservations for listings owned by the current user
    const reservations = await prisma.reservation.findMany({
      where: {
        listing: {
          userId: currentUser.id,
        },
        status: {
          not: 'CANCELED'
        }
      },
      include: {
        user: true,
        listing: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Count pending setups
    const pendingSetups = reservations.filter(
      reservation => reservation.rentalStatus === 'PENDING'
    ).length;

    const safeReservations = reservations.map((reservation) => ({
      ...reservation,
      createdAt: reservation.createdAt.toISOString(),
      startDate: reservation.startDate.toISOString(),
      endDate: reservation.endDate.toISOString(),
      canceledAt: reservation.canceledAt?.toISOString() || null,
      pickupStartTime: reservation.pickupStartTime?.toISOString() || null,
      pickupEndTime: reservation.pickupEndTime?.toISOString() || null,
      pickupConfirmedAt: reservation.pickupConfirmedAt?.toISOString() || null,
      returnDeadline: reservation.returnDeadline?.toISOString() || null,
      returnConfirmedAt: reservation.returnConfirmedAt?.toISOString() || null,
      listing: {
        ...reservation.listing,
        createdAt: reservation.listing.createdAt.toISOString(),
      },
      user: {
        ...reservation.user,
        createdAt: reservation.user.createdAt.toISOString(),
        updatedAt: reservation.user.updatedAt.toISOString(),
        emailVerified: reservation.user.emailVerified?.toISOString() || null,
      },
    }));

    return {
      reservations: safeReservations,
      pendingSetups,
    };
  } catch (error: any) {
    throw new Error(error);
  }
}