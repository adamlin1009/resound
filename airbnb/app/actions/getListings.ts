import prisma from "@/lib/prismadb";
import { safeListing } from "@/types";

export interface IListingsParams {
  userId?: string;
  conditionRating?: number; // minimum condition rating
  experienceLevel?: number; // minimum experience level
  startDate?: string;
  endDate?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  category?: string;
}

export default async function getListings(params: IListingsParams) {
  try {
    // Create a new object with only the properties that exist in params
    const queryParams: any = {};
    
    if (params.userId) {
      queryParams.userId = params.userId;
    }

    if (params.category) {
      queryParams.category = params.category;
    }

    if (params.conditionRating) {
      queryParams.conditionRating = {
        gte: +params.conditionRating,
      };
    }

    if (params.experienceLevel) {
      queryParams.experienceLevel = {
        gte: +params.experienceLevel,
      };
    }

    if (params.city) {
      queryParams.city = {
        contains: params.city,
        mode: 'insensitive'
      };
    }

    if (params.state) {
      queryParams.state = params.state;
    }

    if (params.zipCode) {
      queryParams.zipCode = params.zipCode;
    }

    if (params.startDate && params.endDate) {
      queryParams.NOT = {
        reservations: {
          some: {
            OR: [
              {
                endDate: { gte: params.startDate },
                startDate: { lte: params.startDate },
              },
              {
                startDate: { lte: params.endDate },
                endDate: { gte: params.endDate },
              },
            ],
          },
        },
      };
    }

    const listings = await prisma.listing.findMany({
      where: queryParams,
      orderBy: {
        createdAt: "desc",
      },
    });

    const safeListings: safeListing[] = listings.map((list: any) => {
      const { exactAddress, ...publicListing } = list;
      return {
        ...publicListing,
        createdAt: list.createdAt.toISOString(),
        conditionRating: list.conditionRating,
        experienceLevel: list.experienceLevel,
      };
    });

    return safeListings;
  } catch (error: any) {
    console.error("Error fetching listings:", error);
    throw new Error(error.message);
  }
}
