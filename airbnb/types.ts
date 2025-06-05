import { Listing, Reservation, User } from "@prisma/client";

// Remove unused Airbnb fields from the base Listing type for safeListing
export type CoreListingData = Omit<Listing, "createdAt" | "roomCount" | "bathroomCount" | "guestCount">;

export type safeListing = CoreListingData & {
  createdAt: string;
  conditionRating: number;
  experienceLevel: number;
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
