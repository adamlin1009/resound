import nextAuthMiddleware from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";

export default function middleware(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_RESOUND_DEMO === "true") {
    return NextResponse.next();
  }

  return nextAuthMiddleware(request as never);
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
