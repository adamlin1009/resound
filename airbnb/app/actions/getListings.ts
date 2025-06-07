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
  page?: number; // page number (1-based)
  limit?: number; // items per page
}

export interface IListingsResponse {
  listings: safeListing[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default async function getListings(params: IListingsParams): Promise<IListingsResponse> {
  try {
    // Pagination defaults
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20)); // Default 20, max 100
    const skip = (page - 1) * limit;
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
      
      if (!searchCoordinates) {
        // Fall back to exact location match if geocoding fails
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

    // Get total count for pagination (before applying skip/take)
    const totalCount = await prisma.listing.count({
      where: queryParams,
    });

    let listings = await prisma.listing.findMany({
      where: queryParams,
      orderBy: {
        createdAt: "desc",
      },
      skip: skip,
      take: limit,
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

    // Calculate actual count after radius filtering
    const filteredCount = searchCoordinates && params.radius ? safeListings.length : totalCount;
    const totalPages = Math.ceil(filteredCount / limit);

    return {
      listings: safeListings,
      totalCount: filteredCount,
      page,
      limit,
      totalPages,
    };
  } catch (error: any) {
    throw new Error(error.message);
  }
}
