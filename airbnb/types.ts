import { Listing, Reservation, User } from "@prisma/client";

// Core listing data with US location fields
export type CoreListingData = Omit<Listing, "createdAt">;

// Public listing data (without exact address for privacy)
export type safeListing = Omit<CoreListingData, "exactAddress"> & {
  createdAt: string;
  conditionRating: number;
  experienceLevel: number;
  city: string | null;
  state: string;
  zipCode: string | null;
};

// Full listing data (with exact address for owners/renters)
export type safeListingWithAddress = CoreListingData & {
  createdAt: string;
  conditionRating: number;
  experienceLevel: number;
  city: string | null;
  state: string;
  zipCode: string | null;
  exactAddress: string;
};

export type USLocation = {
  city?: string;
  state: string;
  zipCode?: string;
};

export type SafeReservation = Omit<
  Reservation,
  "createdAt" | "startDate" | "endDate" | "listing"
> & {
  createdAt: string;
  startDate: string;
  endDate: string;
  listing: safeListing;
};

export type SafeUser = Omit<
  User,
  "createdAt" | "updatedAt" | "emailVerified"
> & {
  createdAt: string;
  updatedAt: string;
  emailVerified: string | null;
};
