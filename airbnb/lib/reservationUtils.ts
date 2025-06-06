import prisma from "@/lib/prismadb";

export async function checkReservationConflict(
  listingId: string,
  startDate: Date,
  endDate: Date,
  excludeReservationId?: string
) {
  const conflictingReservations = await prisma.reservation.findMany({
    where: {
      listingId,
      status: {
        in: ["ACTIVE", "PENDING"]
      },
      ...(excludeReservationId && { id: { not: excludeReservationId } }),
      OR: [
        {
          AND: [
            { startDate: { lte: startDate } },
            { endDate: { gte: startDate } }
          ]
        },
        {
          AND: [
            { startDate: { lte: endDate } },
            { endDate: { gte: endDate } }
          ]
        },
        {
          AND: [
            { startDate: { gte: startDate } },
            { endDate: { lte: endDate } }
          ]
        }
      ]
    }
  });

  return conflictingReservations.length > 0;
}

export async function createReservationHold(
  userId: string,
  listingId: string,
  startDate: Date,
  endDate: Date,
  totalPrice: number
) {
  // Check for conflicts first
  const hasConflict = await checkReservationConflict(listingId, startDate, endDate);
  
  if (hasConflict) {
    throw new Error("These dates are no longer available");
  }

  // Create a pending reservation that expires in 15 minutes
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  const reservation = await prisma.reservation.create({
    data: {
      userId,
      listingId,
      startDate,
      endDate,
      totalPrice,
      status: "PENDING",
      expiresAt
    }
  });

  return reservation;
}

export async function expirePendingReservations() {
  const now = new Date();
  
  const expiredReservations = await prisma.reservation.updateMany({
    where: {
      status: "PENDING",
      expiresAt: {
        lte: now
      }
    },
    data: {
      status: "CANCELED",
      canceledAt: now,
      cancellationReason: "Reservation expired"
    }
  });

  return expiredReservations.count;
}