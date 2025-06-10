import prisma from "@/lib/prismadb";
import getCurrentUser from "./getCurrentUser";
import { safeListing } from "@/types";
import { Listing } from "@prisma/client";

export default async function getFavoriteListings(): Promise<safeListing[]> {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return [];
    }

    const favorites = await prisma.listing.findMany({
      where: {
        id: {
          in: [...(currentUser.favoriteIds || [])],
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        imageSrc: true,
        category: true,
        instrumentType: true,
        experienceLevel: true,
        city: true,
        state: true,
        zipCode: true,
        userId: true,
        price: true,
        createdAt: true,
        pickupStartTime: true,
        pickupEndTime: true,
        returnStartTime: true,
        returnEndTime: true,
        availableDays: true,
      },
    });

    const safeFavorites = favorites.map((favorite) => ({
      ...favorite,
      createdAt: favorite.createdAt.toString(),
    }));

    return safeFavorites;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Unknown error');
  }
}
