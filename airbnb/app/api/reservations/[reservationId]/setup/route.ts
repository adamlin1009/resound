import { NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/lib/prismadb";
import { sendEmail, emailTemplates } from "@/lib/email";
import { format } from "date-fns";

interface IParams {
  reservationId?: string;
}

export async function PUT(
  request: Request,
  { params }: { params: IParams }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { reservationId } = params;

    if (!reservationId) {
      return NextResponse.json(
        { error: "Invalid reservation ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      pickupAddress,
      pickupInstructions,
      pickupStartTime,
      pickupEndTime,
      returnAddress,
      returnInstructions,
      returnDeadline,
      ownerNotes,
    } = body;

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

    // Verify the current user is the owner of the listing
    if (reservation.listing.userId !== currentUser.id) {
      return NextResponse.json(
        { error: "Unauthorized - only the listing owner can set rental details" },
        { status: 403 }
      );
    }

    // Update the reservation with rental details
    const updatedReservation = await prisma.reservation.update({
      where: {
        id: reservationId,
      },
      data: {
        pickupAddress: pickupAddress || reservation.listing.exactAddress,
        pickupInstructions,
        pickupStartTime: pickupStartTime ? new Date(pickupStartTime) : null,
        pickupEndTime: pickupEndTime ? new Date(pickupEndTime) : null,
        returnAddress: returnAddress || pickupAddress || reservation.listing.exactAddress,
        returnInstructions,
        returnDeadline: returnDeadline ? new Date(returnDeadline) : null,
        ownerNotes,
        rentalStatus: "READY_FOR_PICKUP",
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

    // Send email notification to renter that pickup details are ready
    if (updatedReservation.user.email) {
      await sendEmail({
        to: updatedReservation.user.email,
        subject: `Pickup Details Ready - ${updatedReservation.listing.title}`,
        html: emailTemplates.rentalDetailsReady({
          renterName: updatedReservation.user.name || 'there',
          listingTitle: updatedReservation.listing.title,
          pickupAddress: updatedReservation.pickupAddress || '',
          pickupStartTime: updatedReservation.pickupStartTime 
            ? format(updatedReservation.pickupStartTime, 'MMM dd, h:mm a')
            : '',
          pickupEndTime: updatedReservation.pickupEndTime
            ? format(updatedReservation.pickupEndTime, 'h:mm a')
            : '',
          returnDeadline: updatedReservation.returnDeadline
            ? format(updatedReservation.returnDeadline, 'MMM dd, yyyy h:mm a')
            : '',
          reservationId: updatedReservation.id,
        }),
      });
    }

    return NextResponse.json({
      reservation: updatedReservation,
      message: "Rental details updated successfully",
    });
  } catch (error) {
    console.error("Error updating rental details:", error);
    return NextResponse.json(
      { error: "Failed to update rental details" },
      { status: 500 }
    );
  }
}