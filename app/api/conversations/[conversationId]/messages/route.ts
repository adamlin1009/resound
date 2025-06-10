import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { TIME_CONSTANTS } from "@/constants";
import { withRateLimit, rateLimiters } from "@/lib/rateLimiter";

interface IParams {
  conversationId: string;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<IParams> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId } = await params;

    // Verify user is part of conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId }
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    if (conversation.ownerId !== currentUser.id && conversation.renterId !== currentUser.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Fetch messages
    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: { select: { id: true, name: true, image: true } }
      },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<IParams> }
) {
  return withRateLimit(request, rateLimiters.api, async () => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId } = await params;
    const body = await request.json();
    const { content } = body;

    if (!content?.trim()) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 });
    }

    // Verify user is part of conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId }
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    if (conversation.ownerId !== currentUser.id && conversation.renterId !== currentUser.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if renter has a paid reservation for this listing
    if (conversation.renterId === currentUser.id) {
      const paidReservation = await prisma.reservation.findFirst({
        where: {
          listingId: conversation.listingId,
          userId: currentUser.id,
          status: { in: ['ACTIVE', 'COMPLETED', 'PENDING'] }
        },
        orderBy: { createdAt: 'desc' }
      });

      if (!paidReservation) {
        return NextResponse.json({ 
          error: "You can only message the owner after making a rental payment" 
        }, { status: 403 });
      }

      // For completed reservations, allow messaging for MESSAGE_EXPIRY_DAYS after end date
      if (paidReservation.status === 'COMPLETED') {
        const thirtyDaysAfterEnd = new Date(paidReservation.endDate);
        thirtyDaysAfterEnd.setDate(thirtyDaysAfterEnd.getDate() + TIME_CONSTANTS.MESSAGE_EXPIRY_DAYS);
        
        if (new Date() > thirtyDaysAfterEnd) {
          return NextResponse.json({ 
            error: `Messaging period has expired for this rental (${TIME_CONSTANTS.MESSAGE_EXPIRY_DAYS} days after completion)` 
          }, { status: 403 });
        }
      }

      // Check if there's a successful payment for this reservation
      const payment = await prisma.payment.findFirst({
        where: {
          userId: currentUser.id,
          listingId: conversation.listingId,
          status: 'SUCCEEDED'
        }
      });

      if (!payment) {
        return NextResponse.json({ 
          error: "You can only message the owner after making a rental payment" 
        }, { status: 403 });
      }
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        conversationId: conversationId,
        senderId: currentUser.id,
        content: content.trim()
      },
      include: {
        sender: { select: { id: true, name: true, image: true } }
      }
    });

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    });

    return NextResponse.json(message);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
  });
}