import { Listing, Reservation, User } from "@prisma/client";

// Core listing data with US location fields
export type CoreListingData = Omit<Listing, "createdAt">;

export type safeListing = CoreListingData & {
  createdAt: string;
  conditionRating: number;
  experienceLevel: number;
  city: string | null;
  state: string;
  zipCode: string | null;
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
