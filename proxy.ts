import { isDemoMode } from "@/lib/demo";
import { type NextRequestWithAuth, withAuth } from "next-auth/middleware";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

const authMiddleware = withAuth({
  pages: {
    signIn: "/",
  },
});

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  if (isDemoMode) {
    return NextResponse.next();
  }

  return authMiddleware(request as NextRequestWithAuth, event);
}

export const config = {
  matcher: [
    "/rentals",
    "/reservations",
    "/instruments",
    "/favorites",
    "/api/admin/:path*",
    "/api/profile",
    "/api/listings",
    "/api/reservations/:path*",
    "/api/geocode/:path*"
  ],
};
