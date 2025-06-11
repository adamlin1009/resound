import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";

export async function GET(request: Request) {
  try {
    // Delete expired upload tokens
    const result = await prisma.uploadToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(), // Less than current time (expired)
        },
      },
    });

    console.log(`Cleaned up ${result.count} expired upload tokens`);

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
      message: `Cleaned up ${result.count} expired upload tokens`,
    });
  } catch (error) {
    console.error("Failed to cleanup upload tokens:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to cleanup upload tokens",
      },
      { status: 500 }
    );
  }
}