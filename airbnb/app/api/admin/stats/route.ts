import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import checkAdminUser from "@/app/actions/checkAdminUser";

export async function GET() {
  try {
    const currentUser = await checkAdminUser();
    
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get basic counts
    const [totalUsers, totalListings, totalReservations, payments] = await Promise.all([
      prisma.user.count(),
      prisma.listing.count(),
      prisma.reservation.count(),
      prisma.payment.findMany({
        where: {
          status: "SUCCEEDED"
        },
        select: {
          amount: true
        }
      })
    ]);

    // Calculate total revenue
    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);

    return NextResponse.json({
      totalUsers,
      totalListings,
      totalReservations,
      totalRevenue
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}