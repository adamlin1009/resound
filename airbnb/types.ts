import { Listing, Reservation, User } from "@prisma/client";

// Core listing data with US location fields
export type CoreListingData = Omit<Listing, "createdAt">;

// Public listing data (without exact address and coordinates for privacy)
export type safeListing = Omit<CoreListingData, "exactAddress" | "latitude" | "longitude"> & {
  createdAt: string;
  experienceLevel: number;
  city: string | null;
  state: string;
  zipCode: string | null;
  pickupStartTime?: string | null;
  pickupEndTime?: string | null;
  returnStartTime?: string | null;
  returnEndTime?: string | null;
  availableDays?: string[];
};

// Full listing data (with exact address for owners/renters)
export type safeListingWithAddress = CoreListingData & {
  createdAt: string;
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
  "createdAt" | "startDate" | "endDate" | "listing" | "canceledAt" | "pickupStartTime" | "pickupEndTime" | "pickupConfirmedAt" | "returnDeadline" | "returnStartTime" | "returnEndTime" | "returnConfirmedAt" | "expiresAt"
> & {
  createdAt: string;
  startDate: string;
  endDate: string;
  canceledAt?: string | null;
  pickupStartTime?: string | null;
  pickupEndTime?: string | null;
  pickupConfirmedAt?: string | null;
  returnDeadline?: string | null;
  returnStartTime?: string | null;
  returnEndTime?: string | null;
  returnConfirmedAt?: string | null;
  listing: safeListing & {
    user: SafeUser;
  };
  user: SafeUser;
};

export type SafeUser = Omit<
  User,
  "createdAt" | "updatedAt" | "emailVerified"
> & {
  createdAt: string;
  updatedAt: string;
  emailVerified: string | null;
};
