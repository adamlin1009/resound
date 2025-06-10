import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/lib/prismadb";
import { checkReservationConflict } from "@/lib/reservationUtils";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const { listingId, startDate, endDate, totalPrice } = body;

  if (!listingId || !startDate || !endDate || !totalPrice) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    // Check for conflicts before creating reservation
    const hasConflict = await checkReservationConflict(
      listingId,
      new Date(startDate),
      new Date(endDate)
    );

    if (hasConflict) {
      return NextResponse.json(
        { error: "These dates are no longer available" },
        { status: 409 }
      );
    }

    // Use a transaction to ensure atomicity
    const reservation = await prisma.$transaction(async (tx) => {
      // Double-check for conflicts within the transaction
      const conflictingReservations = await tx.reservation.findMany({
        where: {
          listingId,
          status: {
            in: ["ACTIVE", "PENDING"]
          },
          OR: [
            {
              AND: [
                { startDate: { lte: new Date(startDate) } },
                { endDate: { gte: new Date(startDate) } }
              ]
            },
            {
              AND: [
                { startDate: { lte: new Date(endDate) } },
                { endDate: { gte: new Date(endDate) } }
              ]
            },
            {
              AND: [
                { startDate: { gte: new Date(startDate) } },
                { endDate: { lte: new Date(endDate) } }
              ]
            }
          ]
        }
      });

      if (conflictingReservations.length > 0) {
        throw new Error("These dates are no longer available");
      }

      // Create the reservation
      return await tx.reservation.create({
        data: {
          userId: currentUser.id,
          listingId,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          totalPrice,
          status: "ACTIVE"
        },
        include: {
          listing: true
        }
      });
    });

    return NextResponse.json(reservation);
  } catch (error) {
    // Error handled internally
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create reservation" },
      { status: 500 }
    );
  }
}
