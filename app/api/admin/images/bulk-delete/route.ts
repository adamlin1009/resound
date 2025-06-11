import { NextRequest, NextResponse } from "next/server";
import checkAdminUser from "@/app/actions/checkAdminUser";
import prisma from "@/lib/prismadb";

export async function POST(request: NextRequest) {
  try {
    const currentUser = await checkAdminUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { listingIds } = body;

    if (!Array.isArray(listingIds) || listingIds.length === 0) {
      return NextResponse.json(
        { error: "Invalid listing IDs" },
        { status: 400 }
      );
    }

    // Update all selected listings to remove their images
    const result = await prisma.listing.updateMany({
      where: {
        id: {
          in: listingIds,
        },
      },
      data: {
        imageSrc: [],
      },
    });

    // Note: In a real implementation, you would also want to:
    // 1. Delete the actual files from Uploadthing
    // 2. Track which images were deleted
    // 3. Send notifications to listing owners

    return NextResponse.json({
      message: `Successfully removed images from ${result.count} listings`,
      count: result.count,
    });
  } catch (error) {
    console.error("Error bulk deleting images:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}