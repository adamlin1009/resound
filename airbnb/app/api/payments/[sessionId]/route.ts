import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/lib/prismadb";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { sessionId } = await params;

    const payment = await prisma.payment.findUnique({
      where: { stripeSessionId: sessionId },
      include: {
        listing: true,
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    // Check if user owns this payment
    if (payment.userId !== currentUser.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Check if reservation was created
    const reservation = await prisma.reservation.findFirst({
      where: {
        userId: payment.userId,
        listingId: payment.listingId,
        startDate: payment.startDate,
        endDate: payment.endDate,
      },
    });

    return NextResponse.json({
      payment: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        createdAt: payment.createdAt,
      },
      reservation: reservation ? {
        id: reservation.id,
        createdAt: reservation.createdAt,
      } : null,
    });
  } catch (error) {
    console.error("Error fetching payment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}