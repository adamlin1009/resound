import { NextResponse } from "next/server";
import { expirePendingReservations } from "@/lib/reservationUtils";

export async function GET(request: Request) {
  try {
    // In development, allow access without auth
    if (process.env.NODE_ENV === "development") {
      const expiredCount = await expirePendingReservations();
      
      return NextResponse.json({
        success: true,
        expiredCount,
        timestamp: new Date().toISOString(),
        environment: "development"
      });
    }

    // In production, verify this is coming from a trusted source (e.g., cron job)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // If CRON_SECRET is not set, allow the route but warn
    if (!cronSecret) {
      console.warn("CRON_SECRET not set - running without authentication");
      const expiredCount = await expirePendingReservations();
      
      return NextResponse.json({
        success: true,
        expiredCount,
        timestamp: new Date().toISOString(),
        warning: "No authentication configured"
      });
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
    console.error("Error expiring reservations:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to expire reservations",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

// Also export POST to prevent method not allowed errors
export async function POST(request: Request) {
  return GET(request);
}