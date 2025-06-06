import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

interface IParams {
  reservationId: string;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<IParams> }
) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reservationId } = await params;
    const body = await request.json();
    const { reason } = body;

    // Get reservation with related data
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        listing: {
          include: {
            user: true
          }
        },
        user: true
      }
    });

    if (!reservation) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
    }

    // Check if user can cancel (either renter or listing owner)
    if (reservation.userId !== currentUser.id && reservation.listing.userId !== currentUser.id) {
      return NextResponse.json({ error: "Unauthorized to cancel this reservation" }, { status: 403 });
    }

    // Check if reservation is already canceled or completed
    if (reservation.status === "CANCELED") {
      return NextResponse.json({ error: "This reservation has already been canceled" }, { status: 400 });
    }

    if (reservation.status === "COMPLETED") {
      return NextResponse.json({ error: "Cannot cancel a completed reservation" }, { status: 400 });
    }

    // Update reservation with cancellation details (no refunds)
    const updatedReservation = await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        status: "CANCELED",
        canceledAt: new Date(),
        canceledBy: currentUser.id,
        cancelReason: reason || "User requested cancellation"
      }
    });

    return NextResponse.json({
      success: true,
      reservation: updatedReservation,
      message: "Reservation canceled successfully. No refund will be processed per our no-refunds policy."
    });

  } catch (error) {
    console.error("Error canceling reservation:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}