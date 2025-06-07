import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import checkAdminUser from "@/app/actions/checkAdminUser";

export async function GET() {
  try {
    const currentUser = await checkAdminUser();
    
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get basic counts and revenue aggregation
    const [totalUsers, totalListings, totalReservations, revenueResult] = await Promise.all([
      prisma.user.count(),
      prisma.listing.count(),
      prisma.reservation.count(),
      prisma.payment.aggregate({
        where: {
          status: "SUCCEEDED"
        },
        _sum: {
          amount: true
        }
      })
    ]);

    // Extract total revenue from aggregation result
    const totalRevenue = revenueResult._sum.amount || 0;

    return NextResponse.json({
      totalUsers,
      totalListings,
      totalReservations,
      totalRevenue
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}