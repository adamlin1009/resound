import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/lib/prismadb";
import { stripe, formatAmountForStripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { listingId, startDate, endDate, totalPrice } = body;

    // Validate required fields
    if (!listingId || !startDate || !endDate || !totalPrice) {
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
        listingId: listingId,
        userId: currentUser.id,
        startDate: startDate,
        endDate: endDate,
      },
    });

    // Update payment with session ID
    await prisma.payment.update({
      where: { id: payment.id },
      data: { stripeSessionId: session.id },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}