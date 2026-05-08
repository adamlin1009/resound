import { withAuth } from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";

const authMiddleware = withAuth({
  pages: {
    signIn: "/",
  },
});

export default function proxy(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_RESOUND_DEMO === "true") {
    return NextResponse.next();
  }

  return authMiddleware(request as never);
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
