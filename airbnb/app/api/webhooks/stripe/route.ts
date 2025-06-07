import prisma from "@/lib/prismadb";
import { stripe } from "@/lib/stripe";
import { sendEmail, emailTemplates } from "@/lib/email";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "No signature provided" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      
      case "checkout.session.expired":
        await handleCheckoutSessionExpired(event.data.object as Stripe.Checkout.Session);
        break;

      default:
        // Unhandled event type - not an error, just ignore
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {

  // Get metadata from session
  const metadata = session.metadata;
  if (!metadata?.paymentId || !metadata?.reservationId || !metadata?.listingId || !metadata?.userId) {
    return;
  }

  // Check if we've already processed this session (idempotency check)
  const existingPayment = await prisma.payment.findUnique({
    where: { id: metadata.paymentId },
    select: { status: true }
  });

  if (existingPayment?.status === "SUCCEEDED") {
    return;
  }

  // Start a transaction to ensure data consistency
  const result = await prisma.$transaction(async (tx) => {
    // Check if reservation still exists and is pending
    const existingReservation = await tx.reservation.findUnique({
      where: { id: metadata.reservationId },
    });

    if (!existingReservation) {
      throw new Error("Reservation not found");
    }

    if (existingReservation.status !== "PENDING") {
      // If the reservation is already ACTIVE, this is likely a duplicate webhook
      if (existingReservation.status === "ACTIVE" && existingReservation.stripeSessionId === session.id) {
        return null;
      }
      throw new Error(`Reservation status is ${existingReservation.status}, expected PENDING`);
    }

    // Update payment status
    const payment = await tx.payment.update({
      where: { id: metadata.paymentId },
      data: { 
        status: "SUCCEEDED",
        stripeSessionId: session.id,
      },
      include: {
        user: true,
        listing: {
          include: {
            user: true
          }
        }
      }
    });

    // Update reservation to ACTIVE
    const reservation = await tx.reservation.update({
      where: { id: metadata.reservationId },
      data: {
        status: "ACTIVE",
        stripeSessionId: session.id,
      },
    });

    return { payment, reservation };
  });

  // Skip email notifications if this was a duplicate webhook
  if (!result) {
    return;
  }

  // Send email notifications
  try {
    const { payment } = result;
    const startDate = new Date(metadata.startDate).toLocaleDateString();
    const endDate = new Date(metadata.endDate).toLocaleDateString();

    // Email to renter (payment confirmation)
    if (payment.user.email) {
      await sendEmail({
        to: payment.user.email,
        subject: `Payment Confirmed - ${payment.listing.title}`,
        html: emailTemplates.paymentConfirmation({
          userName: payment.user.name || 'Customer',
          amount: payment.amount,
          listingTitle: payment.listing.title
        })
      });

      // Email to renter (booking confirmation)
      await sendEmail({
        to: payment.user.email,
        subject: `Booking Confirmed - ${payment.listing.title}`,
        html: emailTemplates.bookingConfirmation({
          userName: payment.user.name || 'Customer',
          listingTitle: payment.listing.title,
          startDate,
          endDate,
          totalPrice: payment.amount,
          ownerName: payment.listing.user.name || 'Owner'
        })
      });
    }

    // Email to owner (new booking notification)
    if (payment.listing.user.email) {
      await sendEmail({
        to: payment.listing.user.email,
        subject: `New Booking - ${payment.listing.title}`,
        html: emailTemplates.newBooking({
          ownerName: payment.listing.user.name || 'Owner',
          renterName: payment.user.name || 'Customer',
          listingTitle: payment.listing.title,
          startDate,
          endDate,
          totalPrice: payment.amount
        })
      });
    }
  } catch (emailError) {
    // Don't fail the webhook if email fails
  }

}

async function handleCheckoutSessionExpired(session: Stripe.Checkout.Session) {

  const metadata = session.metadata;
  if (!metadata?.paymentId || !metadata?.reservationId) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    // Update payment status to canceled
    await tx.payment.update({
      where: { id: metadata.paymentId },
      data: { status: "CANCELED" },
    });

    // Cancel the pending reservation
    await tx.reservation.update({
      where: { id: metadata.reservationId },
      data: { 
        status: "CANCELED",
        canceledAt: new Date(),
        cancellationReason: "Payment session expired"
      },
    });
  });

}