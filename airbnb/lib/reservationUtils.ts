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
  totalPrice: number,
  pickupTime?: string,
  returnTime?: string
) {
  // Check for conflicts first
  const hasConflict = await checkReservationConflict(listingId, startDate, endDate);
  
  if (hasConflict) {
    throw new Error("These dates are no longer available");
  }

  // Get listing to get the exact address
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { exactAddress: true }
  });

  // Create a pending reservation that expires in 15 minutes
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  // Combine dates with times
  const pickupDateTime = pickupTime ? new Date(`${startDate.toISOString().split('T')[0]}T${pickupTime}:00`) : null;
  const returnDateTime = returnTime ? new Date(`${endDate.toISOString().split('T')[0]}T${returnTime}:00`) : null;

  const reservation = await prisma.reservation.create({
    data: {
      userId,
      listingId,
      startDate,
      endDate,
      totalPrice,
      status: "PENDING",
      expiresAt,
      pickupAddress: listing?.exactAddress || null,
      returnAddress: listing?.exactAddress || null,
      pickupStartTime: pickupDateTime,
      pickupEndTime: pickupDateTime,
      returnStartTime: returnDateTime,
      returnEndTime: returnDateTime,
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