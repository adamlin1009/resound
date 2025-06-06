import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { ownerId: currentUser.id },
          { renterId: currentUser.id }
        ]
      },
      include: {
        listing: { select: { title: true, imageSrc: true } },
        owner: { select: { name: true, image: true } },
        renter: { select: { name: true, image: true } },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            sender: { select: { id: true, name: true, image: true } }
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("Error getting conversations:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { listingId, ownerId, renterId } = body;

    if (!listingId) {
      return NextResponse.json({ error: "Listing ID is required" }, { status: 400 });
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { user: true }
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    // Determine the owner and renter IDs
    let finalOwnerId = ownerId || listing.userId;
    let finalRenterId = renterId || currentUser.id;

    // If current user is the owner, swap the roles
    if (currentUser.id === listing.userId && renterId) {
      finalOwnerId = currentUser.id;
      finalRenterId = renterId;
    }

    if (finalOwnerId === finalRenterId) {
      return NextResponse.json({ error: "Cannot message yourself" }, { status: 400 });
    }

    // Check if there's a valid reservation for this conversation
    const validReservation = await prisma.reservation.findFirst({
      where: {
        listingId: listingId,
        userId: finalRenterId,
        status: { in: ['ACTIVE', 'COMPLETED'] }
      }
    });

    if (!validReservation) {
      return NextResponse.json({ 
        error: "A valid rental reservation is required to start a conversation" 
      }, { status: 403 });
    }

    // Check if there's a successful payment for this reservation
    const payment = await prisma.payment.findFirst({
      where: {
        userId: finalRenterId,
        listingId: listingId,
        status: 'SUCCEEDED',
        startDate: validReservation.startDate,
        endDate: validReservation.endDate
      }
    });

    if (!payment) {
      return NextResponse.json({ 
        error: "A successful payment is required to start a conversation" 
      }, { status: 403 });
    }

    // Find existing conversation or create new one
    let conversation = await prisma.conversation.findFirst({
      where: {
        listingId: listingId,
        ownerId: finalOwnerId,
        renterId: finalRenterId
      },
      include: {
        listing: { select: { title: true, imageSrc: true } },
        owner: { select: { name: true, image: true } },
        renter: { select: { name: true, image: true } },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            sender: { select: { id: true, name: true, image: true } }
          }
        }
      }
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          listingId: listingId,
          ownerId: finalOwnerId,
          renterId: finalRenterId
        },
        include: {
          listing: { select: { title: true, imageSrc: true } },
          owner: { select: { name: true, image: true } },
          renter: { select: { name: true, image: true } },
          messages: {
            orderBy: { createdAt: 'asc' },
            include: {
              sender: { select: { id: true, name: true, image: true } }
            }
          }
        }
      });
    }

    return NextResponse.json(conversation);
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}