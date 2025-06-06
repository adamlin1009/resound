import { NextResponse } from "next/server";
import { expirePendingReservations } from "@/lib/reservationUtils";

export async function GET(request: Request) {
  try {
    // Verify this is coming from a trusted source (e.g., cron job)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const expiredCount = await expirePendingReservations();

    console.log(`Expired ${expiredCount} pending reservations`);

    return NextResponse.json({
      success: true,
      expiredCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error expiring reservations:", error);
    return NextResponse.json(
      { error: error.message || "Failed to expire reservations" },
      { status: 500 }
    );
  }
}