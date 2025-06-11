import { NextRequest, NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/lib/prismadb";

export async function PATCH(
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
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.userId !== currentUser.id && !currentUser.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { 
      title,
      description,
      price,
      category,
      instrumentType,
      experienceLevel,
      imageSrc,
      exactAddress,
      city,
      state,
      zipCode,
      latitude,
      longitude,
      pickupStartTime,
      pickupEndTime,
      returnStartTime,
      returnEndTime,
      availableDays
    } = body;

    // Build update data object with only provided fields
    const updateData: any = {};

    // Basic information
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;

    // Instrument details
    if (category !== undefined) updateData.category = category;
    if (instrumentType !== undefined) updateData.instrumentType = instrumentType;
    if (experienceLevel !== undefined) updateData.experienceLevel = experienceLevel;

    // Location
    if (exactAddress !== undefined) updateData.exactAddress = exactAddress;
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;
    if (zipCode !== undefined) updateData.zipCode = zipCode;
    if (latitude !== undefined) updateData.latitude = latitude;
    if (longitude !== undefined) updateData.longitude = longitude;

    // Availability
    if (pickupStartTime !== undefined) updateData.pickupStartTime = pickupStartTime;
    if (pickupEndTime !== undefined) updateData.pickupEndTime = pickupEndTime;
    if (returnStartTime !== undefined) updateData.returnStartTime = returnStartTime;
    if (returnEndTime !== undefined) updateData.returnEndTime = returnEndTime;
    if (availableDays !== undefined) updateData.availableDays = availableDays;

    // Validate image array
    if (imageSrc !== undefined) {
      if (!Array.isArray(imageSrc)) {
        return NextResponse.json(
          { error: "imageSrc must be an array" },
          { status: 400 }
        );
      }

      // Validate max 10 images
      if (imageSrc.length > 10) {
        return NextResponse.json(
          { error: "Maximum 10 images allowed per listing" },
          { status: 400 }
        );
      }

      // Validate each image is a string
      if (!imageSrc.every((img: any) => typeof img === "string")) {
        return NextResponse.json(
          { error: "All images must be strings" },
          { status: 400 }
        );
      }

      updateData.imageSrc = imageSrc;
    }

    // Validate required fields if provided
    if (price !== undefined && price <= 0) {
      return NextResponse.json(
        { error: "Price must be greater than 0" },
        { status: 400 }
      );
    }

    if (experienceLevel !== undefined && (experienceLevel < 1 || experienceLevel > 4)) {
      return NextResponse.json(
        { error: "Experience level must be between 1 and 4" },
        { status: 400 }
      );
    }

    // Update the listing
    const updatedListing = await prisma.listing.update({
      where: { id: listingId },
      data: updateData,
    });

    return NextResponse.json(updatedListing);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update listing" },
      { status: 500 }
    );
  }
}

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
