import prisma from "@/lib/prismadb";
import { safeListing } from "@/types";
import { geocodeLocation, buildLocationString, calculateDistance, Coordinates } from "@/lib/geocoding";

export interface IListingsParams {
  userId?: string;
  experienceLevel?: number; // minimum experience level
  startDate?: string;
  endDate?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  category?: string;
  instrumentType?: string; // free text instrument type search
  radius?: number; // search radius in miles
  nationwide?: boolean; // nationwide search
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

    // Handle instrument type search - search in category, title, and description
    if (params.instrumentType) {
      queryParams.OR = [
        {
          category: {
            contains: params.instrumentType,
            mode: 'insensitive'
          }
        },
        {
          title: {
            contains: params.instrumentType,
            mode: 'insensitive'
          }
        },
        {
          description: {
            contains: params.instrumentType,
            mode: 'insensitive'
          }
        }
      ];
    }


    if (params.experienceLevel) {
      // Show instruments that require this skill level or lower
      // E.g., if user is Advanced (3), show Beginner (1), Intermediate (2), and Advanced (3) instruments
      queryParams.experienceLevel = {
        lte: +params.experienceLevel,
      };
    }

    // Handle location filtering
    let searchCoordinates: Coordinates | null = null;
    
    if (params.nationwide) {
      // Nationwide search - no location filter
    } else if (params.radius && (params.city || params.zipCode)) {
      // Radius-based search - we'll filter after querying
      const locationString = buildLocationString(params.city, params.state, params.zipCode);
      searchCoordinates = await geocodeLocation(locationString);
      
      // For radius search, we don't add location filters to queryParams
      // We'll filter by distance after getting all listings with coordinates
    } else {
      // Location-specific search without radius
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

    let listings = await prisma.listing.findMany({
      where: queryParams,
      orderBy: {
        createdAt: "desc",
      },
    });

    // Apply radius filtering if needed
    if (searchCoordinates && params.radius) {
      listings = listings.filter((listing: any) => {
        if (!listing.latitude || !listing.longitude) {
          return false; // Exclude listings without coordinates
        }

        const listingCoords: Coordinates = {
          lat: listing.latitude,
          lng: listing.longitude
        };

        const distance = calculateDistance(searchCoordinates!, listingCoords);
        return distance <= params.radius!;
      });
    }

    const safeListings: safeListing[] = listings.map((list: any) => {
      const { exactAddress, latitude, longitude, ...publicListing } = list;
      return {
        ...publicListing,
        createdAt: list.createdAt.toISOString(),
        experienceLevel: list.experienceLevel,
        pickupStartTime: list.pickupStartTime,
        pickupEndTime: list.pickupEndTime,
        returnStartTime: list.returnStartTime,
        returnEndTime: list.returnEndTime,
        availableDays: list.availableDays,
      };
    });

    return safeListings;
  } catch (error: any) {
    console.error("Error fetching listings:", error);
    throw new Error(error.message);
  }
}
