import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/lib/prismadb";
import { stripe, formatAmountForStripe } from "@/lib/stripe";
import { createReservationHold } from "@/lib/reservationUtils";
import { NextRequest, NextResponse } from "next/server";
import { withRateLimit, rateLimiters } from "@/lib/rateLimiter";

export async function POST(request: NextRequest) {
  return withRateLimit(request, rateLimiters.checkout, async () => {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { listingId, startDate, endDate, totalPrice, pickupTime, returnTime } = body;

    // Validate required fields
    if (!listingId || !startDate || !endDate || !totalPrice || !pickupTime || !returnTime) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get listing details
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    // Prevent owners from booking their own listings
    if (listing.userId === currentUser.id) {
      return NextResponse.json(
        { error: "You cannot rent your own instrument" },
        { status: 400 }
      );
    }

    // Validate price matches expected calculation
    const days = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
    const expectedPrice = listing.price * days;
    if (Math.abs(totalPrice - expectedPrice) > 0.01) {
      return NextResponse.json(
        { error: "Invalid price calculation" },
        { status: 400 }
      );
    }

    // Create a reservation hold to prevent double-booking
    let reservation;
    try {
      reservation = await createReservationHold(
        currentUser.id,
        listingId,
        new Date(startDate),
        new Date(endDate),
        totalPrice,
        pickupTime,
        returnTime
      );
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message || "These dates are no longer available" },
        { status: 409 }
      );
    }

    // Create payment record in database
    const payment = await prisma.payment.create({
      data: {
        stripeSessionId: "", // Will update after creating session
        amount: formatAmountForStripe(totalPrice),
        currency: "usd",
        status: "PENDING",
        userId: currentUser.id,
        listingId: listingId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: listing.title,
              description: `Rental from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`,
              images: listing.imageSrc ? [listing.imageSrc] : undefined,
            },
            unit_amount: formatAmountForStripe(totalPrice),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
      metadata: {
        paymentId: payment.id,
        reservationId: reservation.id,
        listingId: listingId,
        userId: currentUser.id,
        startDate: startDate,
        endDate: endDate,
        pickupTime: pickupTime,
        returnTime: returnTime,
      },
    });

    // Update payment and reservation with session ID
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: { stripeSessionId: session.id },
      }),
      prisma.reservation.update({
        where: { id: reservation.id },
        data: { stripeSessionId: session.id },
      }),
    ]);

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
  });
}