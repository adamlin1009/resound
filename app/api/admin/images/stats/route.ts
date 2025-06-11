import { NextResponse } from "next/server";
import checkAdminUser from "@/app/actions/checkAdminUser";
import prisma from "@/lib/prismadb";

export async function GET() {
  try {
    const currentUser = await checkAdminUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get all listings with their images
    const listings = await prisma.listing.findMany({
      select: {
        id: true,
        title: true,
        imageSrc: true,
        category: true,
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    // Calculate image statistics
    let totalImages = 0;
    let totalStorageUsed = 0;
    const imagesByCategory: Record<string, number> = {};
    const listingsWithImages: { id: string; title: string; imageCount: number; ownerEmail: string }[] = [];
    let listingsWithoutImages = 0;
    const userStorageMap = new Map<string, { totalImages: number; estimatedStorage: number; listingCount: number }>();

    for (const listing of listings) {
      const imageCount = listing.imageSrc?.length || 0;
      const userEmail = listing.user.email || 'Unknown';
      
      if (imageCount === 0) {
        listingsWithoutImages++;
      } else {
        totalImages += imageCount;
        
        // Estimate storage (assuming average 500KB per image)
        // In production, you'd want to fetch actual sizes from Uploadthing
        const estimatedSize = imageCount * 500 * 1024; // 500KB per image in bytes
        totalStorageUsed += estimatedSize;
        
        listingsWithImages.push({
          id: listing.id,
          title: listing.title,
          imageCount,
          ownerEmail: userEmail,
        });

        // Track user storage
        if (!userStorageMap.has(userEmail)) {
          userStorageMap.set(userEmail, { totalImages: 0, estimatedStorage: 0, listingCount: 0 });
        }
        const userStats = userStorageMap.get(userEmail)!;
        userStats.totalImages += imageCount;
        userStats.estimatedStorage += estimatedSize;
        userStats.listingCount += 1;
      }

      // Count images by category
      if (listing.category) {
        if (!imagesByCategory[listing.category]) {
          imagesByCategory[listing.category] = 0;
        }
        imagesByCategory[listing.category] += imageCount;
      }
    }

    // Sort listings by image count
    const topListingsByImages = listingsWithImages
      .sort((a, b) => b.imageCount - a.imageCount)
      .slice(0, 10); // Top 10

    const averageImagesPerListing = listings.length > 0 
      ? totalImages / listings.length 
      : 0;

    // Convert user storage map to array and sort by storage usage
    const userStorageStats = Array.from(userStorageMap.entries())
      .map(([email, stats]) => ({
        email,
        ...stats,
      }))
      .sort((a, b) => b.estimatedStorage - a.estimatedStorage);

    return NextResponse.json({
      totalImages,
      totalStorageUsed,
      averageImagesPerListing,
      listingsWithoutImages,
      imagesByCategory,
      topListingsByImages,
      userStorageStats,
    });
  } catch (error) {
    console.error("Error fetching image stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}