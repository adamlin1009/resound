import { NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/lib/prismadb";
import { Prisma } from "@prisma/client";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ reservationId: string }> }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { reservationId } = await params;

    if (!reservationId) {
      return NextResponse.json(
        { error: "Invalid reservation ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { action } = body; // 'confirm' or 'unconfirm'

    // Get the reservation with listing details
    const reservation = await prisma.reservation.findUnique({
      where: {
        id: reservationId,
      },
      include: {
        listing: true,
      },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "Reservation not found" },
        { status: 404 }
      );
    }

    // Check if current user is either the renter or the owner
    const isRenter = reservation.userId === currentUser.id;
    const isOwner = reservation.listing.userId === currentUser.id;

    if (!isRenter && !isOwner) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Update pickup confirmation based on who is confirming
    const updateData: Prisma.ReservationUpdateInput = {};
    
    if (isRenter) {
      updateData.pickupConfirmedByRenter = action === 'confirm';
    } else if (isOwner) {
      updateData.pickupConfirmedByOwner = action === 'confirm';
    }

    // If both parties have confirmed, update rental status and timestamp
    const updatedReservation = await prisma.reservation.update({
      where: {
        id: reservationId,
      },
      data: updateData,
    });

    // Check if both parties have confirmed
    if (updatedReservation.pickupConfirmedByOwner && updatedReservation.pickupConfirmedByRenter) {
      await prisma.reservation.update({
        where: {
          id: reservationId,
        },
        data: {
          pickupConfirmedAt: new Date(),
          rentalStatus: 'IN_PROGRESS',
        },
      });
    }

    return NextResponse.json({
      message: action === 'confirm' ? 'Pickup confirmed' : 'Pickup confirmation removed',
      reservation: updatedReservation,
    });
  } catch (error) {
    // Error handled internally
    return NextResponse.json(
      { error: "Failed to update pickup confirmation" },
      { status: 500 }
    );
  }
}