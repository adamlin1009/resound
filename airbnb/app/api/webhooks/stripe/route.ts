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
    console.error("Webhook signature verification failed:", error);
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
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log("Processing successful payment for session:", session.id);

  // Get metadata from session
  const metadata = session.metadata;
  if (!metadata?.paymentId || !metadata?.listingId || !metadata?.userId) {
    console.error("Missing required metadata in session:", session.id);
    return;
  }

  // Start a transaction to ensure data consistency
  const result = await prisma.$transaction(async (tx) => {
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

    // Create reservation
    const reservation = await tx.reservation.create({
      data: {
        userId: metadata.userId,
        listingId: metadata.listingId,
        startDate: new Date(metadata.startDate),
        endDate: new Date(metadata.endDate),
        totalPrice: session.amount_total! / 100, // Convert from cents to dollars
      },
    });

    return { payment, reservation };
  });

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
    console.error("Error sending notification emails:", emailError);
    // Don't fail the webhook if email fails
  }

  console.log("Successfully created reservation:", result.reservation.id);
}

async function handleCheckoutSessionExpired(session: Stripe.Checkout.Session) {
  console.log("Processing expired session:", session.id);

  const metadata = session.metadata;
  if (!metadata?.paymentId) {
    return;
  }

  // Update payment status to canceled
  await prisma.payment.update({
    where: { id: metadata.paymentId },
    data: { status: "CANCELED" },
  });

  console.log("Payment marked as canceled for expired session:", session.id);
}