import { NextRequest, NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/lib/prismadb";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ listingId: string }> }
) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { listingId } = await params;

  if (!listingId) {
    return NextResponse.json({ error: "Invalid listing ID" }, { status: 400 });
  }

  try {
    // Check if the listing belongs to the current user
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        reservations: {
          where: {
            status: {
              in: ["ACTIVE", "PENDING"]
            },
            endDate: {
              gte: new Date() // Future or ongoing reservations
            }
          }
        }
      }
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.userId !== currentUser.id && !currentUser.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check for active or future reservations
    if (listing.reservations.length > 0) {
      return NextResponse.json(
        { 
          error: "Cannot delete listing with active or future reservations",
          activeReservations: listing.reservations.length
        }, 
        { status: 409 }
      );
    }

    // Use a transaction to ensure all related data is cleaned up properly
    const deletedListing = await prisma.$transaction(async (tx) => {
      // Delete the listing (cascading deletes will handle related records)
      return await tx.listing.delete({
        where: {
          id: listingId,
        },
      });
    });

    return NextResponse.json({ 
      message: "Listing deleted successfully",
      listing: deletedListing 
    });
  } catch (error) {
    // Error handled internally
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete listing" },
      { status: 500 }
    );
  }
}
