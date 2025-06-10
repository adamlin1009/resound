export { default } from "next-auth/middleware";

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
