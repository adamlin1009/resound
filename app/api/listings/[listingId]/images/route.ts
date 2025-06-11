import { NextRequest, NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/lib/prismadb";

// PATCH endpoint to add images using upload token (for mobile uploads)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ listingId: string }> }
) {
  const { listingId } = await params;

  if (!listingId) {
    return NextResponse.json({ error: "Invalid listing ID" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { imageSrc, token } = body;

    if (!token) {
      return NextResponse.json({ error: "Upload token required" }, { status: 401 });
    }

    if (!imageSrc || !Array.isArray(imageSrc)) {
      return NextResponse.json({ error: "imageSrc must be an array" }, { status: 400 });
    }

    // Validate the upload token
    const uploadToken = await prisma.uploadToken.findFirst({
      where: {
        token,
        listingId,
        expiresAt: {
          gt: new Date(), // Not expired
        },
      },
      include: {
        listing: {
          select: {
            id: true,
            imageSrc: true,
          },
        },
      },
    });

    if (!uploadToken) {
      return NextResponse.json(
        { error: "Invalid or expired upload token" },
        { status: 401 }
      );
    }

    // Validate max 10 images total
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

    // Update the listing with new images
    const updatedListing = await prisma.listing.update({
      where: { id: listingId },
      data: {
        imageSrc: imageSrc,
      },
    });

    // Clean up the upload token after successful update
    await prisma.uploadToken.delete({
      where: { id: uploadToken.id },
    });

    return NextResponse.json({
      success: true,
      listing: {
        id: updatedListing.id,
        imageSrc: updatedListing.imageSrc,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update listing images" },
      { status: 500 }
    );
  }
}

// PUT endpoint for reordering images
export async function PUT(
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
    const { imageSrc } = body;

    // Validate reordered array
    if (!imageSrc || !Array.isArray(imageSrc)) {
      return NextResponse.json(
        { error: "imageSrc must be an array" },
        { status: 400 }
      );
    }

    // Check that it has the same images (just reordered)
    const existingSet = new Set(listing.imageSrc);
    const newSet = new Set(imageSrc);
    
    if (existingSet.size !== newSet.size || 
        !imageSrc.every((img: string) => existingSet.has(img))) {
      return NextResponse.json(
        { error: "Cannot add or remove images with this endpoint. Use PATCH for updates." },
        { status: 400 }
      );
    }

    // Update with reordered images
    const updatedListing = await prisma.listing.update({
      where: { id: listingId },
      data: {
        imageSrc,
      },
    });

    return NextResponse.json({
      message: "Images reordered successfully",
      imageSrc: updatedListing.imageSrc,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to reorder images" },
      { status: 500 }
    );
  }
}

// DELETE endpoint for removing specific images
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
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.userId !== currentUser.id && !currentUser.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { imageUrl } = body;

    if (!imageUrl || typeof imageUrl !== "string") {
      return NextResponse.json(
        { error: "imageUrl must be provided as a string" },
        { status: 400 }
      );
    }

    // Check if image exists in the listing
    if (!listing.imageSrc.includes(imageUrl)) {
      return NextResponse.json(
        { error: "Image not found in listing" },
        { status: 404 }
      );
    }

    // Prevent deleting the last image
    if (listing.imageSrc.length === 1) {
      return NextResponse.json(
        { error: "Cannot delete the last image. Listings must have at least one image." },
        { status: 400 }
      );
    }

    // Remove the image
    const updatedImages = listing.imageSrc.filter((img) => img !== imageUrl);

    const updatedListing = await prisma.listing.update({
      where: { id: listingId },
      data: {
        imageSrc: updatedImages,
      },
    });

    return NextResponse.json({
      message: "Image deleted successfully",
      imageSrc: updatedListing.imageSrc,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete image" },
      { status: 500 }
    );
  }
}