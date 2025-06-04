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

    const favorites: Listing[] = await prisma.listing.findMany({
      where: {
        id: {
          in: [...(currentUser.favoriteIds || [])],
        },
      },
    });

    const safeFavorites = favorites.map((favorite: Listing) => ({
      ...favorite,
      createdAt: favorite.createdAt.toString(),
      // conditionRating and experienceLevel should be included via ...favorite
      // if 'Listing' type is correctly resolved and includes them.
    }));

    return safeFavorites;
  } catch (error: any) {
    throw new Error(error.message);
  }
}
