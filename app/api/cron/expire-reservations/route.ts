import { NextResponse } from "next/server";
import { expirePendingReservations } from "@/lib/reservationUtils";

export async function GET(request: Request) {
  try {
    // Verify this is coming from a trusted source (e.g., cron job)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // Require CRON_SECRET to be set
    if (!cronSecret) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 503 }
      );
    }

    // Verify the authorization header matches the secret
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const expiredCount = await expirePendingReservations();

    return NextResponse.json({
      success: true,
      expiredCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to expire reservations" },
      { status: 500 }
    );
  }
}