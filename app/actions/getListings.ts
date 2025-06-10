import prisma from "@/lib/prismadb";
import { safeListing } from "@/types";
import { geocodeLocation, buildLocationString, calculateDistance, Coordinates } from "@/lib/geocoding";
import { Prisma } from "@prisma/client";

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
    const queryParams: Prisma.ListingWhereInput = {};
    
    if (params.userId) {
      queryParams.userId = params.userId;
    }

    if (params.category) {
      queryParams.category = params.category;
    }

    // Handle instrument type search - search in instrumentType field first, then fallback to title and description
    if (params.instrumentType) {
      queryParams.OR = [
        {
          instrumentType: {
            equals: params.instrumentType,
            mode: 'insensitive'
          }
        },
        {
          instrumentType: {
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

    // For radius search, we need to get all listings with coordinates first
    // then filter by distance, then paginate
    let finalListings: {
      id: string;
      title: string;
      description: string;
      imageSrc: string;
      category: string;
      instrumentType: string | null;
      experienceLevel: number;
      city: string | null;
      state: string;
      zipCode: string | null;
      latitude?: number | null;
      longitude?: number | null;
      userId: string;
      price: number;
      createdAt: Date;
      pickupStartTime: string | null;
      pickupEndTime: string | null;
      returnStartTime: string | null;
      returnEndTime: string | null;
      availableDays: string[];
    }[];
    let totalCount: number;

    if (searchCoordinates && params.radius) {
      // Get all listings with coordinates for radius filtering
      const allListings = await prisma.listing.findMany({
        where: {
          ...queryParams,
          latitude: { not: null },
          longitude: { not: null },
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
          latitude: true,
          longitude: true,
          userId: true,
          price: true,
          createdAt: true,
          pickupStartTime: true,
          pickupEndTime: true,
          returnStartTime: true,
          returnEndTime: true,
          availableDays: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // Filter by radius
      const filteredByRadius = allListings.filter((listing) => {
        const listingCoords: Coordinates = {
          lat: listing.latitude!,
          lng: listing.longitude!
        };
        const distance = calculateDistance(searchCoordinates!, listingCoords);
        return distance <= params.radius!;
      });

      // Apply pagination to filtered results
      totalCount = filteredByRadius.length;
      finalListings = filteredByRadius.slice(skip, skip + limit);
    } else {
      // Regular query with pagination
      totalCount = await prisma.listing.count({
        where: queryParams,
      });

      finalListings = await prisma.listing.findMany({
        where: queryParams,
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
        orderBy: {
          createdAt: "desc",
        },
        skip: skip,
        take: limit,
      });
    }

    // Convert to safe listings (remove sensitive fields)
    const safeListings: safeListing[] = finalListings.map((list) => {
      // Remove sensitive fields that shouldn't be exposed
      const { latitude, longitude, ...publicListing } = list;
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

    const totalPages = Math.ceil(totalCount / limit);

    return {
      listings: safeListings,
      totalCount,
      page,
      limit,
      totalPages,
    };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Failed to fetch listings");
  }
}
