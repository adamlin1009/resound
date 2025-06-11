import { NextRequest, NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/lib/prismadb";
import crypto from "crypto";

// POST endpoint to generate upload token
export async function POST(
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
      select: { userId: true, title: true },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.userId !== currentUser.id && !currentUser.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Generate a secure token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    // Store the token in the database
    await prisma.uploadToken.create({
      data: {
        token,
        listingId,
        userId: currentUser.id,
        expiresAt,
      },
    });

    // Generate the mobile upload URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const uploadUrl = `${baseUrl}/upload/${listingId}?token=${token}`;

    return NextResponse.json({
      token,
      uploadUrl,
      expiresAt,
      listingTitle: listing.title,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate upload token" },
      { status: 500 }
    );
  }
}

// GET endpoint to validate upload token
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ listingId: string }> }
) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const { listingId } = await params;

  if (!token || !listingId) {
    return NextResponse.json(
      { error: "Token and listing ID are required" },
      { status: 400 }
    );
  }

  try {
    // Find and validate the token
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
            title: true,
            imageSrc: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!uploadToken) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      valid: true,
      listing: {
        id: listingId,
        title: uploadToken.listing.title,
        currentImages: uploadToken.listing.imageSrc,
        ownerName: uploadToken.listing.user.name,
      },
      expiresAt: uploadToken.expiresAt,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to validate token" },
      { status: 500 }
    );
  }
}